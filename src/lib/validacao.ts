/**
 * Núcleo regulatório. Princípio: PUBLICAR SEM PENDÊNCIA.
 *
 * Produção só é BLOQUEADA por:
 *   (1) registro da empresa no CREFITO; (2) RT com nome e CREFITO;
 *   (3) WhatsApp real em pelo menos um canal;
 *   + termo vetado em texto publicado; + mídia referenciada sem consentimento.
 * Todo o resto vira AVISO (some em produção) ou MELHORIA (campo opcional vazio),
 * listados em docs/MELHORIAS.md.
 *
 * Usado por scripts/validate-config.ts, pelo portão em astro.config.ts e pela
 * página /pendencias (só preview).
 */
import { temValor, type Campo } from '../config/campo.ts';
import { areas, clinica, equipe, pilates, recursos, vinculos } from '../config/profile.config.ts';
import { compliance, type TermoVetado } from '../config/compliance.config.ts';
import { slots } from '../config/slots-video.config.ts';
import { copy } from '../config/copy.config.ts';
import { contato } from '../config/contato.config.ts';
import { algumWhatsapp, elegivel, equipeVisivel, resumoPilates, pilatesPorFisioterapeuta } from './clinica.ts';
import { dataValida, manifesto, midiaPorId, type ItemManifesto } from './manifesto.ts';

export type NivelRelatorio = 'bloqueante' | 'aviso' | 'melhoria';

export type Grupo =
  | 'Identificação da clínica'
  | 'Equipe'
  | 'Endereço e contato'
  | 'Consentimentos'
  | 'Autorizações institucionais'
  | 'Vídeos'
  | 'Conteúdo e vocabulário'
  | 'Outros';

export interface Pendencia {
  readonly nivel: NivelRelatorio;
  readonly grupo: Grupo;
  readonly campo: string;
  readonly nota: string;
}

const isCampo = (v: unknown): v is Campo<unknown> =>
  typeof v === 'object' && v !== null && 'status' in v && 'valor' in v;

function grupoDoCampo(caminho: string): Grupo {
  if (/^clinica\.(nomeFantasia|razaoSocial|cnpj|registroEmpresa|crefitoRegiao|responsavelTecnico)/.test(caminho)) return 'Identificação da clínica';
  if (caminho.startsWith('equipe')) return 'Equipe';
  if (caminho.startsWith('clinica')) return 'Endereço e contato';
  if (caminho.startsWith('copy') || caminho.startsWith('pilates')) return 'Conteúdo e vocabulário';
  return 'Outros';
}

function coletarCampos(obj: unknown, caminho: string, out: Pendencia[]): void {
  if (isCampo(obj)) {
    if (obj.status === 'pendente') out.push({ nivel: obj.nivel, grupo: grupoDoCampo(caminho), campo: caminho, nota: obj.nota });
    else if (obj.status === 'opcional' && !temValor(obj) && obj.nota)
      out.push({ nivel: 'melhoria', grupo: grupoDoCampo(caminho), campo: caminho, nota: obj.nota });
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

// ---- Os três bloqueantes ----

function checarIdentificacao(out: Pendencia[]): void {
  // (1) e (2) já vêm de bloqueante() em clinica; aqui garantimos que um
  // confirmado('') também não passe.
  const g: Grupo = 'Identificação da clínica';
  const vazio = (c: Campo<string>) => c.status !== 'pendente' && !temValor(c);
  if (vazio(clinica.registroEmpresaCrefito)) out.push({ nivel: 'bloqueante', grupo: g, campo: 'clinica.registroEmpresaCrefito', nota: 'Registro da empresa no CREFITO vazio.' });
  if (vazio(clinica.responsavelTecnico.nome)) out.push({ nivel: 'bloqueante', grupo: g, campo: 'clinica.responsavelTecnico.nome', nota: 'Nome do RT vazio.' });
  if (vazio(clinica.responsavelTecnico.crefito)) out.push({ nivel: 'bloqueante', grupo: g, campo: 'clinica.responsavelTecnico.crefito', nota: 'CREFITO do RT vazio.' });
}

function checarWhatsapp(out: Pendencia[]): void {
  if (!algumWhatsapp())
    out.push({ nivel: 'bloqueante', grupo: 'Endereço e contato', campo: 'whatsapp', nota: 'WhatsApp real em pelo menos um canal (clínica ou profissional).' });
}

// ---- Equipe ----

function checarEquipe(out: Pendencia[]): void {
  for (const p of equipe) {
    const c = `equipe[${p.id}]`;
    if (!elegivel(p))
      out.push({ nivel: 'melhoria', grupo: 'Equipe', campo: c, nota: `Com nome completo + CREFITO, ${p.ref} passa a aparecer no site (cards, textos e vídeos).` });
    if (p.especialista.registrado && (!p.especialista.rqe || !p.especialista.especialidade))
      out.push({ nivel: 'aviso', grupo: 'Equipe', campo: `${c}.especialista`, nota: '"Especialista" exige título registrado e RQE: ignorado até completar.' });
  }
  for (const a of areas)
    for (const r of a.responsaveis)
      if (!equipe.some((p) => p.id === r))
        out.push({ nivel: 'aviso', grupo: 'Equipe', campo: `areas[${a.id}]`, nota: `Responsável "${r}" não existe na equipe.` });
}

function checarVinculos(out: Pendencia[]): void {
  const grupo = 'Autorizações institucionais';
  for (const v of vinculos) {
    if (!['confirmada-pelo-cliente', 'formal-arquivada'].includes(v.autorizacao))
      out.push({ nivel: 'bloqueante', grupo, campo: `vinculos[${v.id}]`, nota: `${v.nome} citado no site sem autorização.` });
    else if (!v.comprovante)
      out.push({ nivel: 'melhoria', grupo, campo: `vinculos[${v.id}]`, nota: `Arquivar comprovante da autorização de ${v.nome}.` });
  }
}

// ---- Termos vetados ----

const especialistaLiberado = (): boolean =>
  equipe.some((p) => elegivel(p) && p.especialista.registrado && !!p.especialista.rqe && !!p.especialista.especialidade);

function aplicar(regras: readonly TermoVetado[], texto: string): string[] {
  const negacao = new RegExp(compliance.negacao, 'iu');
  const achados: string[] = [];
  for (const r of regras)
    for (const m of texto.matchAll(new RegExp(r.padrao, 'giu')))
      if (!negacao.test(texto.slice(Math.max(0, (m.index ?? 0) - 30), m.index))) achados.push(`"${m[0]}" (${r.motivo})`);
  return achados;
}

/** Termos vetados aplicados a qualquer texto publicado. */
export const buscarTermosVetados = (texto: string): string[] =>
  aplicar([...compliance.termosVetados, ...(especialistaLiberado() ? [] : [compliance.termoEspecialista])], texto);

/** Ids de mídia efetivamente referenciados pelo site (slots + fotos da equipe visível). */
export function midiaReferenciada(): Set<string> {
  const ids = new Set<string>();
  const { conviteVideo, compilado, apresentacao } = slots;
  if (conviteVideo.estado === 'preenchido' && conviteVideo.item) ids.add(conviteVideo.item.midiaId);
  if (compilado.estado === 'preenchido') compilado.itens.forEach((i) => ids.add(i.midiaId));
  if (apresentacao.item) ids.add(apresentacao.item.midiaId);
  for (const p of equipeVisivel()) if (p.foto) ids.add(p.foto);
  return ids;
}

function checarTextos(out: Pendencia[]): void {
  const fontes: [string, string][] = [
    ['slots.conviteVideo.titulo', slots.conviteVideo.titulo],
    ['slots.compilado.titulo', slots.compilado.titulo],
    ['copy.hero.titulo', copy.hero.titulo.valor],
    ...areas.filter((a) => a.ativa && a.cartao).flatMap((a): [string, string][] => [[`areas[${a.id}].cartao.rotulo`, a.cartao?.rotulo ?? ''], [`areas[${a.id}].cartao.texto`, a.cartao?.texto ?? '']]),
    ...Object.entries(copy.areas.intro).map(([m, t]): [string, string] => [`copy.areas.intro.${m}`, t]),
    ...areas.filter((a) => a.ativa).flatMap((a): [string, string][] => [[`areas[${a.id}].titulo`, a.titulo], [`areas[${a.id}].resumo`, a.id === 'pilates' ? resumoPilates() : a.resumo]]),
    ...[...midiaReferenciada()].flatMap((id): [string, string][] => {
      const m = midiaPorId(id);
      return m ? [[`midia.${id}.alt`, m.alt]] : [];
    }),
  ];
  // Todo texto do copy (folhas string), exceto o Pilates clínico enquanto não confirmado.
  const folhas = (v: unknown, cam: string): [string, string][] =>
    typeof v === 'string'
      ? [[cam, v]]
      : Array.isArray(v)
        ? v.flatMap((x, i) => folhas(x, `${cam}[${i}]`))
        : v && typeof v === 'object'
          ? Object.entries(v).flatMap(([k, x]) => (k === 'url' || k === 'pesquisa' ? [] : folhas(x, `${cam}.${k}`)))
          : [];
  fontes.push(...folhas(copy, 'copy'));
  for (const [campo, txt] of fontes)
    for (const a of buscarTermosVetados(txt))
      out.push({ nivel: 'bloqueante', grupo: 'Conteúdo e vocabulário', campo, nota: `Termo vetado ${a}.` });
  if (!pilatesPorFisioterapeuta())
    for (const a of aplicar(compliance.vocabulario.pilatesSemFisioterapeuta, resumoPilates()))
      out.push({ nivel: 'bloqueante', grupo: 'Conteúdo e vocabulário', campo: 'areas[pilates]', nota: `Vocabulário ${a}.` });
}

// ---- Mídia ----

const AUTORIZADO = ['confirmada-pelo-cliente', 'formal-arquivada'];
const CONSENTIDO = ['ok', 'nao-se-aplica', 'confirmado-pelo-cliente'];

/** Falta de consentimento/autorização: bloqueia produção se a mídia estiver referenciada. */
export function semConsentimento(m: ItemManifesto): string[] {
  const out: string[] = [];
  if (m.pacienteRef && m.consentimento !== 'ok') out.push('Mídia com paciente sem TCLE.');
  else if (!CONSENTIDO.includes(m.consentimento)) out.push('Mídia sem consentimento.');
  if (m.menorDeIdade && !/^T-\d{3,}$/.test(m.tcleRef ?? '')) out.push('Menor de idade sem TCLE do responsável legal (tcleRef).');
  if (m.autoriaInstituicao && !AUTORIZADO.includes(m.autorizacaoInstituicao ?? 'pendente')) out.push(`Uso de ${m.autoriaInstituicao} sem autorização.`);
  if (m.antesDepois && !compliance.antesDepois) out.push('"Antes e depois" desligado.');
  return out;
}

/** Todos os impedimentos de uma mídia ir a produção. Vazio = liberada. */
export function impedimentosMidia(m: ItemManifesto): Pendencia[] {
  const c = `midia.${m.id}`;
  const add = (nivel: NivelRelatorio, grupo: Grupo, nota: string): Pendencia => ({ nivel, grupo, campo: c, nota });
  const out = semConsentimento(m).map((n) => add('bloqueante', 'Consentimentos', n));
  if (!m.publicavel) out.push(add('aviso', 'Consentimentos', 'Mídia marcada como não publicável (publicavel: false).'));
  if (m.autoria === 'CONFIRMAR') out.push(add('aviso', 'Consentimentos', 'Autoria a confirmar.'));
  if (m.pacienteRef) {
    if (!dataValida(m.dataRegistro)) out.push(add('aviso', 'Vídeos', 'Data do registro (dataRegistro) ausente.'));
    if (compliance.video.exigeProfissionalVisivel && !equipeVisivel().some((p) => p.id === m.profissionalResponsavelRef))
      out.push(add('aviso', 'Vídeos', 'Profissional responsável sem nome completo + CREFITO (profissionalResponsavelRef).'));
  }
  if (m.tipo === 'video' && m.legenda?.status === 'pendente') out.push(add('aviso', 'Vídeos', 'Legenda .vtt não revisada.'));
  return out;
}

function checarMidia(out: Pendencia[]): void {
  const refs = midiaReferenciada();
  for (const id of refs) {
    const m = midiaPorId(id);
    if (!m) {
      out.push({ nivel: 'bloqueante', grupo: 'Vídeos', campo: `midia.${id}`, nota: 'Referenciada no site, mas não existe no manifesto.' });
      continue;
    }
    // Sem consentimento: bloqueia. Demais impedimentos: some em produção (aviso).
    out.push(...impedimentosMidia(m).map((p) => (p.nivel === 'bloqueante' ? p : { ...p, nivel: 'aviso' as const, nota: `${p.nota} Fica fora da produção até resolver.` })));
  }
  for (const [campo, estado] of [['slots.conviteVideo', slots.conviteVideo.estado], ['slots.compilado', slots.compilado.estado]] as const)
    if (estado === 'vago') out.push({ nivel: 'melhoria', grupo: 'Vídeos', campo, nota: 'Slot de vídeo vago (a seção não aparece). Preencher com vídeo liberado.' });
  for (const m of manifesto.itens)
    if (m.pacienteRef && m.consentimento === 'ok' && !m.tcleArquivadoForaDoRepo)
      out.push({ nivel: 'melhoria', grupo: 'Consentimentos', campo: `midia.${m.id}`, nota: `Arquivar o TCLE ${m.tcleRef ?? ''} fora do repositório.` });
}

function checarPilates(out: Pendencia[]): void {
  if (!pilatesPorFisioterapeuta() && pilates.conduzidoPorFisioterapeuta.status === 'opcional')
    out.push({ nivel: 'melhoria', grupo: 'Conteúdo e vocabulário', campo: 'pilates.conduzidoPorFisioterapeuta', nota: pilates.conduzidoPorFisioterapeuta.nota });
  const pendentes = recursos.filter((r) => !r.confirmado).map((r) => r.nome);
  if (pendentes.length)
    out.push({ nivel: 'melhoria', grupo: 'Conteúdo e vocabulário', campo: 'recursos', nota: `Confirmar os recursos usados na clínica para listá-los: ${pendentes.join(', ')}.` });
  for (const a of areas.filter((x) => !x.ativa))
    out.push({ nivel: 'melhoria', grupo: 'Conteúdo e vocabulário', campo: `areas[${a.id}]`, nota: `Área "${a.titulo}" inativa: confirmar se a clínica atende para exibi-la.` });
}

export function listarPendencias(): Pendencia[] {
  const out: Pendencia[] = [];
  coletarCampos(clinica, 'clinica', out);
  // A equipe é coberta por checarEquipe (uma linha por pessoa, sem repetir cada campo vazio).
  for (const p of equipe)
    if (elegivel(p)) coletarCampos({ titulos: p.titulos, whatsapp: p.whatsapp, foto: p.foto }, `equipe[${p.id}]`, out);
  coletarCampos(copy, 'copy', out);
  coletarCampos(contato, 'contato', out);
  checarIdentificacao(out);
  checarWhatsapp(out);
  checarEquipe(out);
  checarVinculos(out);
  checarTextos(out);
  checarMidia(out);
  checarPilates(out);
  const vistos = new Set<string>();
  return out.filter((p) => {
    const k = `${p.nivel}|${p.campo}|${p.nota}`;
    return vistos.has(k) ? false : (vistos.add(k), true);
  });
}

export const GRUPOS: readonly Grupo[] = [
  'Identificação da clínica',
  'Equipe',
  'Endereço e contato',
  'Consentimentos',
  'Autorizações institucionais',
  'Vídeos',
  'Conteúdo e vocabulário',
  'Outros',
];

export const NIVEIS: readonly [NivelRelatorio, string][] = [
  ['bloqueante', 'BLOQUEANTES para produção'],
  ['aviso', 'AVISOS (somem em produção até resolver)'],
  ['melhoria', 'MELHORIAS (o site já funciona sem)'],
];

export function formatarRelatorio(ps: readonly Pendencia[]): string {
  const linhas: string[] = [];
  for (const [nivel, rotulo] of NIVEIS) {
    const doNivel = ps.filter((p) => p.nivel === nivel);
    linhas.push(`${rotulo} (${doNivel.length})`);
    for (const g of GRUPOS) {
      const doGrupo = doNivel.filter((p) => p.grupo === g);
      if (!doGrupo.length) continue;
      linhas.push(`  ${g}`);
      for (const p of doGrupo) linhas.push(`    • ${p.campo}: ${p.nota}`);
    }
    if (!doNivel.length) linhas.push('  nenhum');
    linhas.push('');
  }
  return linhas.join('\n');
}

/** Bloco gerado em docs/MELHORIAS.md: o que a clínica pode acrescentar depois. */
export function formatarMelhorias(ps: readonly Pendencia[]): string {
  const linhas = ['## O que a clínica pode acrescentar (gerado por `pnpm pendencias`)', ''];
  const bloq = ps.filter((p) => p.nivel === 'bloqueante');
  linhas.push(bloq.length ? `**Para publicar faltam ${bloq.length} item(ns):**` : '**Nada impede a publicação.**');
  for (const p of bloq) linhas.push(`- [ ] ${p.nota}`);
  linhas.push('');
  for (const g of GRUPOS) {
    const doGrupo = ps.filter((p) => p.nivel !== 'bloqueante' && p.grupo === g);
    if (!doGrupo.length) continue;
    linhas.push(`### ${g}`);
    for (const p of doGrupo) linhas.push(`- [ ] ${p.nota}${p.nivel === 'aviso' ? ' _(em revisão)_' : ''}`);
    linhas.push('');
  }
  return linhas.join('\n');
}
