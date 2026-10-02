/**
 * Núcleo regulatório: reúne todas as pendências do projeto, classificadas em
 * BLOQUEANTES (o build de produção falha) e AVISOS, e agrupadas por tema.
 * Usado por scripts/validate-config.ts, pelo portão em astro.config.ts e pela
 * página /pendencias (só preview).
 */
import type { Campo, Nivel } from '../config/campo.ts';
import { profile } from '../config/profile.config.ts';
import { compliance } from '../config/compliance.config.ts';
import { slots } from '../config/slots-video.config.ts';
import { copy } from '../config/copy.config.ts';
import { dataValida, manifesto, midiaPorId, type ItemManifesto } from './manifesto.ts';

export type Grupo =
  | 'Identidade e registro'
  | 'Consentimentos'
  | 'Autorizações institucionais'
  | 'Vídeos'
  | 'Legendas'
  | 'Conteúdo e vocabulário'
  | 'Endereço e contato'
  | 'Outros';

export interface Pendencia {
  readonly nivel: Nivel;
  readonly grupo: Grupo;
  readonly campo: string;
  readonly nota: string;
}

const isCampo = (v: unknown): v is Campo<unknown> =>
  typeof v === 'object' && v !== null && 'status' in v && 'valor' in v;

function grupoDoCampo(caminho: string): Grupo {
  if (/nomeCompleto|crefito|profissao|especialista|linkVerificacao|titulos/.test(caminho)) return 'Identidade e registro';
  if (/unidades|whatsapp|instagram|regioes/.test(caminho)) return 'Endereço e contato';
  if (caminho.startsWith('copy')) return 'Conteúdo e vocabulário';
  return 'Outros';
}

function coletarCampos(obj: unknown, caminho: string, out: Pendencia[]): void {
  if (isCampo(obj)) {
    if (obj.status === 'pendente') out.push({ nivel: obj.nivel, grupo: grupoDoCampo(caminho), campo: caminho, nota: obj.nota });
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => {
      const id = typeof v === 'object' && v && 'id' in v ? String((v as { id: unknown }).id) : String(i);
      coletarCampos(v, `${caminho}[${id}]`, out);
    });
    return;
  }
  if (typeof obj === 'object' && obj !== null) {
    for (const [k, v] of Object.entries(obj)) coletarCampos(v, caminho ? `${caminho}.${k}` : k, out);
  }
}

const AUTORIZADO = ['confirmada-pelo-cliente', 'formal-arquivada'];

function checarVinculos(out: Pendencia[]): void {
  const grupo = 'Autorizações institucionais';
  for (const v of profile.vinculos) {
    if (!AUTORIZADO.includes(v.autorizacao))
      out.push({ nivel: 'bloqueante', grupo, campo: `vinculos[${v.id}]`, nota: `${v.nome} usado no site sem autorização.` });
    else if (!v.comprovante)
      out.push({ nivel: 'aviso', grupo, campo: `vinculos[${v.id}]`, nota: `Arquivar comprovante da autorização de ${v.nome} (baixa prioridade).` });
  }
  for (const u of profile.unidades)
    if (u.vinculoId !== null && !profile.vinculos.some((v) => v.id === u.vinculoId))
      out.push({ nivel: 'bloqueante', grupo, campo: `unidades[${u.id}]`, nota: `Unidade sem vínculo institucional (${u.vinculoId}).` });
}

function checarEspecialista(out: Pendencia[]): void {
  const e = profile.especialista;
  if (e.registrado && (!e.rqe || !e.especialidade))
    out.push({ nivel: 'bloqueante', grupo: 'Identidade e registro', campo: 'especialista', nota: '"Especialista" exige título registrado no COFFITO e RQE.' });
  if (!e.registrado)
    out.push({ nivel: 'aviso', grupo: 'Identidade e registro', campo: 'especialista', nota: 'Sem RQE: o site não usa a palavra "especialista".' });
}

/** Termos vetados aplicados a textos de configuração e do manifesto. */
export function buscarTermosVetados(texto: string): string[] {
  const regras = [...compliance.termosVetados, ...(profile.especialista.registrado ? [] : [compliance.termoEspecialista])];
  const negacao = new RegExp(compliance.negacao, 'iu');
  const achados: string[] = [];
  for (const r of regras)
    for (const m of texto.matchAll(new RegExp(r.padrao, 'giu')))
      if (!negacao.test(texto.slice(Math.max(0, (m.index ?? 0) - 30), m.index))) achados.push(`"${m[0]}" (${r.motivo})`);
  return achados;
}

function checarTextos(out: Pendencia[]): void {
  const fontes: [string, string][] = [
    ['slots.conviteVideo.titulo', slots.conviteVideo.titulo],
    ['slots.compilado.titulo', slots.compilado.titulo],
    ...[...(slots.conviteVideo.item ? [slots.conviteVideo.item] : []), ...slots.compilado.itens, ...(slots.apresentacao.item ? [slots.apresentacao.item] : [])].flatMap(
      (it): [string, string][] => [[`slots.${it.midiaId}.titulo`, it.titulo], ...it.capitulos.map((c, i): [string, string] => [`slots.${it.midiaId}.capitulos[${i}]`, c.titulo])],
    ),
    ['copy.hero.titulo', copy.hero.titulo.valor],
    ['copy.hero.subtitulo', copy.hero.subtitulo.valor ?? ''],
    ...profile.areasAtuacao.map((a, i): [string, string] => [`areasAtuacao[${i}]`, a]),
    ...manifesto.itens.flatMap((i): [string, string][] => [[`midia.${i.id}.descricao`, i.descricao], [`midia.${i.id}.alt`, i.alt]]),
  ];
  for (const [campo, txt] of fontes)
    for (const a of buscarTermosVetados(txt))
      out.push({ nivel: 'bloqueante', grupo: 'Conteúdo e vocabulário', campo, nota: `Termo vetado ${a}.` });
}

/** Problemas que impedem uma mídia de ir a produção. Vazio = liberada. */
export function impedimentosMidia(m: ItemManifesto): Pendencia[] {
  const out: Pendencia[] = [];
  const c = `midia.${m.id}`;
  const add = (nivel: Nivel, grupo: Grupo, nota: string) => out.push({ nivel, grupo, campo: c, nota });
  if (!m.publicavel) add('bloqueante', 'Consentimentos', 'Mídia marcada como não publicável (publicavel: false).');
  if (m.pacienteRef && m.consentimento !== 'ok') add('bloqueante', 'Consentimentos', 'Mídia com paciente sem consentimento (TCLE).');
  if (m.menorDeIdade && !/^T-\d{3,}$/.test(m.tcleRef ?? '')) add('bloqueante', 'Consentimentos', 'Vídeo de menor sem TCLE do responsável legal (tcleRef).');
  if (m.autoria === 'CONFIRMAR') add('bloqueante', 'Consentimentos', 'Autoria a confirmar.');
  if (m.antesDepois && !compliance.antesDepois) add('bloqueante', 'Consentimentos', '"Antes e depois" desligado.');
  if (m.vinculoId) {
    const v = profile.vinculos.find((x) => x.id === m.vinculoId);
    if (!v || !AUTORIZADO.includes(m.autorizacaoInstituicao ?? 'pendente'))
      add('bloqueante', 'Autorizações institucionais', `Uso de ${m.autoriaInstituicao ?? 'instituição'} sem autorização.`);
  }
  if (m.tipo === 'video') {
    if (!dataValida(m.dataRegistro)) add('bloqueante', 'Vídeos', 'Data de gravação (dataRegistro) ausente.');
    if (m.legenda?.status === 'pendente') add('bloqueante', 'Legendas', 'Legenda .vtt não revisada.');
  }
  return out;
}

function avisosMidia(m: ItemManifesto, out: Pendencia[]): void {
  const c = `midia.${m.id}`;
  if (m.pacienteRef && m.consentimento === 'ok' && !m.tcleArquivadoForaDoRepo)
    out.push({ nivel: 'aviso', grupo: 'Consentimentos', campo: c, nota: `Arquivar o TCLE ${m.tcleRef ?? ''} fora do repositório (baixa prioridade).` });
  if (m.vinculoId && !m.comprovanteAutorizacao)
    out.push({ nivel: 'aviso', grupo: 'Autorizações institucionais', campo: c, nota: `Arquivar comprovante de uso do espaço/marca ${m.autoriaInstituicao ?? ''} (baixa prioridade).` });
  if (m.dataRegistroObs) out.push({ nivel: 'aviso', grupo: 'Vídeos', campo: c, nota: m.dataRegistroObs });
  if (m.tipo === 'video' && m.legenda?.status === 'pendente')
    out.push({ nivel: 'aviso', grupo: 'Legendas', campo: c, nota: 'Legenda pendente (vídeo fora dos slots por enquanto).' });
}

function checarSlots(out: Pendencia[]): void {
  const { conviteVideo, compilado } = slots;
  const lista: [string, string, readonly string[]][] = [
    ['slots.conviteVideo', conviteVideo.estado, conviteVideo.item ? [conviteVideo.item.midiaId] : []],
    ['slots.compilado', compilado.estado, compilado.itens.map((i) => i.midiaId)],
  ];
  for (const [campo, estado, ids] of lista) {
    if (estado === 'vago') {
      out.push({ nivel: 'aviso', grupo: 'Vídeos', campo, nota: 'Slot vago: não aparece em produção (seção e item de menu somem).' });
      continue;
    }
    if (!ids.length) out.push({ nivel: 'bloqueante', grupo: 'Vídeos', campo, nota: 'Slot preenchido sem mídia.' });
    for (const id of ids) {
      const m = midiaPorId(id);
      if (!m) {
        out.push({ nivel: 'bloqueante', grupo: 'Vídeos', campo, nota: `Mídia "${id}" não existe no manifesto.` });
        continue;
      }
      if (m.tipo !== 'video') out.push({ nivel: 'bloqueante', grupo: 'Vídeos', campo, nota: `"${id}" não é vídeo.` });
      out.push(...impedimentosMidia(m).map((p) => ({ ...p, campo: `${campo} → ${p.campo}` })));
    }
  }
  // O vídeo de apresentação não bloqueia: só aparece quando liberado.
  const ap = slots.apresentacao.item ? midiaPorId(slots.apresentacao.item.midiaId) : undefined;
  if (ap && impedimentosMidia(ap).length)
    out.push({ nivel: 'aviso', grupo: 'Vídeos', campo: 'slots.apresentacao', nota: `Vídeo de apresentação fora da produção até ser liberado: ${impedimentosMidia(ap).map((p) => p.nota).join(' ')}` });
}

export function listarPendencias(): Pendencia[] {
  const out: Pendencia[] = [];
  coletarCampos(profile, '', out);
  coletarCampos(copy, 'copy', out);
  checarEspecialista(out);
  checarVinculos(out);
  checarTextos(out);
  checarSlots(out);
  for (const m of manifesto.itens) avisosMidia(m, out);
  // Dedup (o mesmo aviso pode vir de mais de um caminho).
  const vistos = new Set<string>();
  return out.filter((p) => {
    const k = `${p.nivel}|${p.campo}|${p.nota}`;
    return vistos.has(k) ? false : (vistos.add(k), true);
  });
}

export const GRUPOS: readonly Grupo[] = [
  'Identidade e registro',
  'Consentimentos',
  'Autorizações institucionais',
  'Vídeos',
  'Legendas',
  'Conteúdo e vocabulário',
  'Endereço e contato',
  'Outros',
];

export function formatarRelatorio(ps: readonly Pendencia[]): string {
  const linhas: string[] = [];
  for (const nivel of ['bloqueante', 'aviso'] as const) {
    const doNivel = ps.filter((p) => p.nivel === nivel);
    linhas.push(`${nivel === 'bloqueante' ? 'BLOQUEANTES para produção' : 'AVISOS'} (${doNivel.length})`);
    for (const g of GRUPOS) {
      const doGrupo = doNivel.filter((p) => p.grupo === g);
      if (!doGrupo.length) continue;
      linhas.push(`  ${g}`);
      for (const p of doGrupo) linhas.push(`    • ${p.campo.replace(/^\./, '')}: ${p.nota}`);
    }
    if (!doNivel.length) linhas.push('  nenhum');
    linhas.push('');
  }
  return linhas.join('\n');
}
