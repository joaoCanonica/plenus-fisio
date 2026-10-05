/**
 * Auditoria pós-build do HTML final (dist/):
 *  1. termos vetados (compliance.config) no texto renderizado;
 *  2. identificação da pessoa jurídica (nome fantasia + registro da empresa + RT
 *     com nome e CREFITO) em toda página; e nenhum nome de profissional sem CREFITO;
 *  3. mídia: todo arquivo /midia/... referenciado precisa estar liberado no manifesto
 *     (em produção: publicável, com consentimento; vídeo de menor com TCLE do responsável);
 *  4. vínculos institucionais citados no HTML precisam de autorização.
 * Uso: node scripts/audit-compliance.ts [--production] [dist]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { buscarTermosVetados, impedimentosMidia } from '../src/lib/validacao.ts';
import { clinica, equipe, vinculos } from '../src/config/profile.config.ts';
import { elegivel } from '../src/lib/clinica.ts';
import { manifesto } from '../src/lib/manifesto.ts';

const producao = process.argv.includes('--production');
const dist = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? 'dist';

function* paginas(dir: string): Generator<string> {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* paginas(p);
    else if (p.endsWith('.html') && !p.includes('/pendencias/') && !p.includes('/_kit/')) yield p;
  }
}
const textoVisivel = (html: string): string =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(?:img|meta|a|button|svg|input|video)[^>]*?(?:alt|title|aria-label|content)="([^"]*)"[^>]*>/gi, ' $1 ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ');

// arquivo derivado/público → item do manifesto
const donoDe = (arquivo: string) =>
  manifesto.itens.find(
    (i) => i.derivados?.some((d) => basename(d) === arquivo) || arquivo.startsWith(`${i.id}-`) || arquivo.startsWith(`${i.id}.`),
  );

const erros: string[] = [];
// Preview (decisão do cliente, 2026-10-05): o cartão provisório da equipe pode mostrar
// o nome sem CREFITO, com selo PROVISÓRIO. Em produção isso continua sendo erro.
const avisos: string[] = [];
let n = 0;
for (const arq of paginas(dist)) {
  n++;
  const html = readFileSync(arq, 'utf8');
  const texto = textoVisivel(html);
  for (const a of buscarTermosVetados(texto)) erros.push(`${arq}: termo vetado ${a}`);
  const pj = [clinica.nomeFantasia.valor, clinica.registroEmpresaCrefito.valor, clinica.responsavelTecnico.nome.valor, clinica.responsavelTecnico.crefito.valor];
  if (producao && pj.some((v) => !v || !texto.includes(v)))
    erros.push(`${arq}: sem identificação da pessoa jurídica (nome fantasia, registro da empresa, RT com CREFITO).`);
  if (!texto.includes(clinica.nomeFantasia.valor)) erros.push(`${arq}: sem o nome da clínica.`);
  // Ninguém aparece sem nome completo + CREFITO (o RT aparece pela identificação PJ).
  for (const p of equipe)
    if (!elegivel(p) && p.nomeCompleto.valor && p.nomeCompleto.valor !== clinica.responsavelTecnico.nome.valor && html.includes(p.nomeCompleto.valor))
      (producao ? erros : avisos).push(`${arq}: "${p.nomeCompleto.valor}" aparece sem CREFITO.`);

  for (const m of new Set([...html.matchAll(/\/midia\/([\w.-]+)/g)].map((x) => x[1]!))) {
    const item = donoDe(m);
    if (!item) { erros.push(`${arq}: /midia/${m} sem item no manifesto.`); continue; }
    if (!producao) continue;
    const imp = item.tipo === 'video'
      ? impedimentosMidia(item).map((p) => p.nota)
      : !item.publicavel || !['ok', 'nao-se-aplica', 'confirmado-pelo-cliente'].includes(item.consentimento) ? ['imagem sem liberação/consentimento'] : [];
    if (item.menorDeIdade && !/^T-\d{3,}$/.test(item.tcleRef ?? '')) imp.push('menor de idade sem TCLE do responsável');
    for (const i of imp) erros.push(`${arq}: /midia/${m} (${item.id}): ${i}`);
  }

  for (const v of vinculos)
    if (texto.includes(v.nome) && !['confirmada-pelo-cliente', 'formal-arquivada'].includes(v.autorizacao))
      erros.push(`${arq}: vínculo "${v.nome}" citado sem autorização.`);
}

avisos.forEach((a) => console.warn(`⚠ (preview) ${a}`));
if (erros.length) {
  erros.forEach((e) => console.error(`✖ ${e}`));
  console.error(`\n✖ Auditoria de conformidade: ${erros.length} problema(s).`);
  process.exit(1);
}
console.log(`✔ Auditoria de conformidade (${producao ? 'produção' : 'preview'}): ${n} página(s) sem termos vetados, com identificação, mídia liberada e vínculos autorizados.`);
