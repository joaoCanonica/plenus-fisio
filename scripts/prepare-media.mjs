// Pipeline de mídia: valida media.manifest.json e gera derivados AVIF/WebP + srcset.
//
//   node scripts/prepare-media.mjs --validar          só valida (não gera nada)
//   node scripts/prepare-media.mjs --modo=preview     publicáveis + previewOk
//   node scripts/prepare-media.mjs --modo=production  só publicavel:true com consentimento válido
//
// Saída: public/midia/<id>-<largura>.{avif,webp} e src/data/midia.gerada.json (srcset).
// Os originais em assets-originais/ nunca são alterados: o recorte vem de `crop`
// e as únicas edições aceitas são recorte e cobertura de identificadores.
// Vídeos: os derivados (MP4 H.264 + WebM, poster, .vtt) ficam em assets-originais/videos/derivados/
// (gerados com ffmpeg; comandos em docs/midia/LOTE-02.md) e só são copiados para public/ quando liberados.
// Este script NÃO roda no build ainda: nada é exposto ao site nesta etapa.
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const CATEGORIAS = ['marca', 'pessoa', 'espaco', 'videos'];
const AUTORIA = ['propria', 'terceiro', 'desconhecida', 'CONFIRMAR'];
const CONSENT = ['ok', 'pendente', 'nao-se-aplica'];
const EDICOES = ['recorte', 'tarja'];
const LARGURAS = [480, 768, 1080, 1600];

const args = process.argv.slice(2);
const so = args.includes('--validar');
const modo = (args.find((a) => a.startsWith('--modo=')) ?? '--modo=preview').split('=')[1];

export function validar(man) {
  const erros = [];
  const ids = new Set();
  for (const it of man.itens ?? []) {
    const e = (m) => erros.push(`${it.id ?? '?'}: ${m}`);
    if (!it.id || ids.has(it.id)) e('id ausente ou duplicado');
    ids.add(it.id);
    for (const k of ['arquivo', 'descricao', 'alt', 'usoSugerido']) if (typeof it[k] !== 'string' || !it[k].trim()) e(`${k} obrigatório`);
    if (!CATEGORIAS.includes(it.categoria)) e('categoria inválida');
    if (!['imagem', 'video', 'audio'].includes(it.tipo)) e('tipo inválido');
    for (const k of ['largura', 'altura', 'bytes']) if (!Number.isInteger(it[k])) e(`${k} deve ser inteiro`);
    if (!/^[0-9a-f]{64}$/.test(it.sha256 ?? '')) e('sha256 inválido');
    if (!AUTORIA.includes(it.autoria)) e('autoria inválida');
    if (!CONSENT.includes(it.consentimento)) e('consentimento inválido');
    for (const k of ['publicavel', 'previewOk', 'menorDeIdade']) if (typeof it[k] !== 'boolean') e(`${k} deve ser boolean`);
    if (!Array.isArray(it.edicoes) || it.edicoes.some((x) => !EDICOES.includes(x))) e('edicoes só aceita recorte/tarja');
    if (!Array.isArray(it.problemas)) e('problemas deve ser lista');
    if (it.crop && !['x', 'y', 'largura', 'altura'].every((k) => Number.isInteger(it.crop[k]))) e('crop incompleto');
    if (it.dataRegistro !== null && it.dataRegistro !== 'CONFIRMAR' && !/^\d{4}-\d{2}-\d{2}$/.test(it.dataRegistro)) e('dataRegistro AAAA-MM-DD, CONFIRMAR ou null');
    const dataOk = /^\d{4}-\d{2}-\d{2}$/.test(it.dataRegistro ?? '');
    if (it.publicavel && it.tipo === 'video' && !dataOk) e('vídeo publicável exige dataRegistro (bloqueante)');
    if (it.publicavel && it.autoriaInstituicao && !['confirmada-pelo-cliente', 'formal-arquivada'].includes(it.autorizacaoInstituicao)) e('uso de instituição sem autorização');
    if (it.consentimento === 'ok' && it.pacienteRef && !/^T-\d{3,}$/.test(it.tcleRef ?? '')) e('consentimento ok exige tcleRef (T-001)');
    if (it.tipo === 'video' && !['pendente', 'revisada', 'nao-se-aplica'].includes(it.legenda?.status)) e('legenda.status inválido');
    // Privacidade e regras de paciente
    if (it.pacienteRef !== null && !/^P-\d{3,}$/.test(it.pacienteRef)) e('pacienteRef deve ser código opaco (P-001)');
    if (it.menorDeIdade && !it.pacienteRef) e('menor de idade exige pacienteRef');
    if (it.pacienteRef && it.consentimento === 'nao-se-aplica') e('paciente exige consentimento (TCLE)');
    if (it.publicavel && it.pacienteRef && (it.consentimento !== 'ok' || !/^\d{4}-\d{2}-\d{2}$/.test(it.dataRegistro ?? ''))) e('publicável com paciente exige TCLE ok e dataRegistro');
    if (it.publicavel && it.autoria === 'CONFIRMAR') e('publicável exige autoria confirmada');
    if (it.antesDepois && !man.antesDepoisHabilitado) e('"antes e depois" desligado');
    // Integridade do original
    try {
      const b = readFileSync(it.arquivo);
      if (b.length !== it.bytes) e('bytes não conferem com o arquivo');
      if (createHash('sha256').update(b).digest('hex') !== it.sha256) e('sha256 não confere: original alterado?');
    } catch {
      e('arquivo original não encontrado');
    }
  }
  return erros;
}

export const liberado = (it, m) =>
  ((it.publicavel && (it.consentimento === 'ok' || it.consentimento === 'nao-se-aplica')) ||
    (m !== 'production' && it.previewOk));

const man = JSON.parse(readFileSync('media.manifest.json', 'utf8'));
const erros = validar(man);
if (erros.length) {
  console.error(`media.manifest.json inválido:\n  ${erros.join('\n  ')}`);
  process.exit(1);
}
console.log(`media.manifest.json válido (${man.itens.length} itens).`);
if (so) process.exit(0);

const { default: sharp } = await import('sharp');
rmSync('public/midia', { recursive: true, force: true }); // nada sobra de um modo anterior
mkdirSync('public/midia', { recursive: true });
const saida = {};
for (const it of man.itens.filter((i) => liberado(i, modo))) {
  if (it.tipo === 'video') {
    // Vídeos: copia os derivados já codificados (ffmpeg). Nunca o original.
    const arquivos = {};
    for (const d of it.derivados ?? []) {
      const nome = d.split('/').pop();
      copyFileSync(d, `public/midia/${nome}`);
      arquivos[nome.replace(/^.*?-(secao|loop|poster)/, '$1')] = `/midia/${nome}`;
    }
    saida[it.id] = { alt: it.alt, provisorio: !it.publicavel, arquivos };
    continue;
  }
  let base = sharp(it.arquivo).rotate();
  if (it.crop) base = base.extract({ left: it.crop.x, top: it.crop.y, width: it.crop.largura, height: it.crop.altura });
  const larguraMax = it.crop?.largura ?? it.largura;
  const ls = LARGURAS.filter((l) => l < larguraMax).concat(larguraMax);
  const fontes = { avif: [], webp: [] };
  for (const l of ls) {
    for (const fmt of ['avif', 'webp']) {
      const arq = `midia/${it.id}-${l}.${fmt}`;
      // Sem withMetadata(): EXIF/GPS são descartados.
      await base.clone().resize({ width: l }).toFormat(fmt, { quality: fmt === 'avif' ? 55 : 78 }).toFile(`public/${arq}`);
      fontes[fmt].push(`/${arq} ${l}w`);
    }
  }
  saida[it.id] = {
    alt: it.alt,
    largura: larguraMax,
    altura: it.crop?.altura ?? it.altura,
    provisorio: !it.publicavel,
    avif: fontes.avif.join(', '),
    webp: fontes.webp.join(', '),
  };
}
writeFileSync('src/data/midia.gerada.json', JSON.stringify({ modo, itens: saida }, null, 2) + '\n');
console.log(`Derivados gerados (${modo}): ${Object.keys(saida).join(', ') || 'nenhum'}`);
