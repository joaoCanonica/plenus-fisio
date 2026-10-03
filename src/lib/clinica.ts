/**
 * Regras de exibição do núcleo de clínica (fonte: src/config/profile.config.ts).
 * Componentes NUNCA leem a equipe direto: usam `equipeVisivel()`, que aplica a
 * regra COFFITO "sem nome completo + CREFITO, a pessoa não aparece".
 */
import { temValor } from '../config/campo.ts';
import {
  areas,
  atendimentoRapido,
  clinica,
  equipe,
  pilates,
  recursos,
  type Area,
  type Canal,
  type IdArea,
  type IdEquipe,
  type Profissional,
} from '../config/profile.config.ts';
import { EM_PRODUCAO } from './modo.ts';

// ---- Equipe ----

export interface ProfissionalVisivel {
  readonly id: IdEquipe;
  readonly nomeCompleto: string;
  /** "CREFITO-10 123456-F". */
  readonly registro: string;
  readonly titulos: readonly string[];
  readonly areas: readonly IdArea[];
  readonly foto: string | null;
  readonly responsavelTecnico: boolean;
}

export const elegivel = (p: Profissional): boolean => temValor(p.nomeCompleto) && temValor(p.crefito);

/** Única porta de entrada de nomes de pessoas no site. */
export function equipeVisivel(): ProfissionalVisivel[] {
  return equipe.filter(elegivel).map((p) => ({
    id: p.id,
    nomeCompleto: p.nomeCompleto.valor as string,
    registro: `${clinica.crefitoRegiao.valor} ${p.crefito.valor as string}`,
    titulos: (p.titulos.valor ?? []).filter(Boolean),
    areas: p.areas,
    foto: temValor(p.foto) ? (p.foto.valor as string) : null,
    responsavelTecnico: p.responsavelTecnico,
  }));
}

export const profissionalVisivel = (id: string | null | undefined): ProfissionalVisivel | undefined =>
  equipeVisivel().find((p) => p.id === id);

/** 'clinica' = ninguém elegível: o site fala da clínica em terceira pessoa. */
export type ModoEquipe = 'clinica' | 'solo' | 'equipe';

export function modoEquipe(): ModoEquipe {
  const n = equipeVisivel().length;
  return n === 0 ? 'clinica' : n === 1 ? 'solo' : 'equipe';
}

const listaNomes = (nomes: readonly string[]): string =>
  nomes.length <= 1 ? (nomes[0] ?? '') : `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}`;

/**
 * Texto com variante por modo. Marcadores: {clinica}, {nome} (solo) e {nomes} (equipe).
 * Ex.: variante({ clinica: 'A {clinica} atende…', solo: '{nome} atende…', equipe: '{nomes} atendem…' }).
 */
export function variante(t: Readonly<Record<ModoEquipe, string>>): string {
  const modo = modoEquipe();
  const nomes = equipeVisivel().map((p) => p.nomeCompleto);
  return t[modo]
    .replaceAll('{clinica}', clinica.nomeFantasia.valor)
    .replaceAll('{nome}', nomes[0] ?? '')
    .replaceAll('{nomes}', listaNomes(nomes));
}

// ---- Identificação PJ ----

export const registroEmpresa = (): string => `${clinica.crefitoRegiao.valor} nº ${clinica.registroEmpresaCrefito.valor || '[a informar]'}`;

export const responsavelTecnico = (): { nome: string; registro: string } => ({
  nome: clinica.responsavelTecnico.nome.valor || '[nome do RT a informar]',
  registro: `${clinica.crefitoRegiao.valor} ${clinica.responsavelTecnico.crefito.valor || '[a informar]'}`,
});

/** Linha de identificação exigida pelo COFFITO para a pessoa jurídica. */
export const identificacaoPJ = (): string => {
  const rt = responsavelTecnico();
  return `${clinica.nomeFantasia.valor} · Registro ${registroEmpresa()} · Responsável técnico: ${rt.nome}, ${rt.registro}`;
};

export function enderecoTexto(): string {
  const e = clinica.endereco;
  const num = temValor(e.numero) ? `, ${e.numero.valor}` : '';
  const comp = temValor(e.complemento) ? `, ${e.complemento.valor}` : '';
  return `${e.rua.valor}${num}${comp}, ${e.bairro.valor}, ${e.cidade.valor} (${e.uf.valor}), CEP ${e.cep.valor}`;
}

const NOME_DIA: Record<string, string> = { Mo: 'segunda', Tu: 'terça', We: 'quarta', Th: 'quinta', Fr: 'sexta', Sa: 'sábado', Su: 'domingo' };
const ORDEM = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const hora = (h: string) => { const [hh, mm] = h.split(':'); return mm === '00' ? `${Number(hh)}h` : `${Number(hh)}h${mm}`; };

/** Horários em texto ("Segunda a sexta, 7h às 20h; sábado, 8h às 12h"), ou null. */
export function horariosTexto(): string | null {
  const hs = clinica.horarios.valor;
  if (!hs || hs.length === 0) return null;
  const faixa = (d: readonly string[]) => {
    const ids = [...d].sort((a, b) => ORDEM.indexOf(a) - ORDEM.indexOf(b));
    const seguidos = ids.every((x, i) => i === 0 || ORDEM.indexOf(x) === ORDEM.indexOf(ids[i - 1]!) + 1);
    if (ids.length > 2 && seguidos) return `${NOME_DIA[ids[0]!]} a ${NOME_DIA[ids.at(-1)!]}`;
    return ids.map((x) => NOME_DIA[x]).join(ids.length === 2 ? ' e ' : ', ');
  };
  const t = hs.map((h) => `${faixa(h.dias)}, ${hora(h.abre)} às ${hora(h.fecha)}`).join('; ');
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// ---- Áreas, Pilates, recursos ----

export const pilatesPorFisioterapeuta = (): boolean =>
  pilates.conduzidoPorFisioterapeuta.status === 'confirmado' && pilates.conduzidoPorFisioterapeuta.valor === true;

/**
 * Texto do Pilates. Sem confirmação de que é conduzido por fisioterapeuta,
 * descreve só a prática, sem título e sem vocabulário clínico.
 */
export function resumoPilates(): string {
  if (!pilatesPorFisioterapeuta()) return 'Pilates em solo e em aparelhos.';
  return pilates.modalidade === 'clinico'
    ? 'Pilates conduzido por fisioterapeuta, em solo e em aparelhos, como recurso do plano terapêutico.'
    : 'Aulas de Pilates em solo e em aparelhos, conduzidas por fisioterapeuta.';
}

export interface AreaVisivel extends Area {
  /** Profissionais visíveis da área (pode ser vazio: aí a área fala da clínica). */
  readonly equipe: readonly ProfissionalVisivel[];
  readonly whatsapp: string;
}

export function areasAtivas(): AreaVisivel[] {
  return areas
    .filter((a) => a.ativa)
    .map((a) => ({
      ...a,
      resumo: a.id === 'pilates' ? resumoPilates() : a.resumo,
      equipe: equipeVisivel().filter((p) => a.responsaveis.includes(p.id)),
      whatsapp: whatsappUrl(a.id),
    }));
}

export const recursosConfirmados = () => recursos.filter((r) => r.confirmado);

// ---- WhatsApp ----

/** Número real de um canal, ou null. Canal de profissional só vale se ele for elegível. */
function numeroDoCanal(c: Canal): string | null {
  if (c === 'clinica') return temValor(clinica.whatsapp) ? (clinica.whatsapp.valor as string) : null;
  const p = equipe.find((x) => x.id === c);
  return p && elegivel(p) && temValor(p.whatsapp) ? (p.whatsapp.valor as string) : null;
}

/** Algum número real, em qualquer canal (bloqueante 3). Número de profissional não elegível vale, sem nome. */
export function algumWhatsapp(): string | null {
  if (temValor(clinica.whatsapp)) return clinica.whatsapp.valor as string;
  for (const p of equipe) if (temValor(p.whatsapp)) return p.whatsapp.valor as string;
  return null;
}

/** Só em dev/preview, enquanto não houver número real. Produção não chega aqui (bloqueante). */
const NUMERO_PROVISORIO = '5549000000000';

export function numeroWhatsapp(area: IdArea | 'geral' = 'geral'): string {
  const pref = atendimentoRapido[area].canal;
  const n = numeroDoCanal(pref) ?? numeroDoCanal('clinica') ?? algumWhatsapp();
  if (n) return n;
  if (EM_PRODUCAO) throw new Error('Sem WhatsApp real: o validador deveria ter bloqueado a produção.');
  return NUMERO_PROVISORIO;
}

export const whatsappProvisorio = (): boolean => algumWhatsapp() === null;

/**
 * Número CONFIRMADO para a área (sem número provisório): canal da área →
 * clínica. Null = a área não tem canal válido e o cartão não aparece.
 */
export const canalValido = (area: IdArea): string | null =>
  numeroDoCanal(atendimentoRapido[area].canal) ?? numeroDoCanal('clinica');

export interface Cartao {
  readonly area: IdArea;
  readonly rotulo: string;
  readonly texto: string;
  readonly equipe: readonly ProfissionalVisivel[];
  readonly url: string;
}

/**
 * Canais de WhatsApp CONFIRMADOS para o CTA final: o da clínica e o de cada
 * profissional visível (nome + CREFITO) com número. Vazio = só o botão geral.
 */
export function canaisDisponiveis(): { rotulo: string; url: string }[] {
  const msg = encodeURIComponent(atendimentoRapido.geral.mensagem);
  const out: { rotulo: string; url: string }[] = [];
  const nc = numeroDoCanal('clinica');
  if (nc) out.push({ rotulo: `WhatsApp da ${clinica.nomeFantasia.valor}`, url: `https://wa.me/${nc}?text=${msg}` });
  for (const p of equipeVisivel()) {
    const n = numeroDoCanal(p.id);
    if (n && n !== nc) out.push({ rotulo: `WhatsApp de ${p.nomeCompleto}`, url: `https://wa.me/${n}?text=${msg}` });
  }
  return out;
}

/** "Por onde começar": só áreas ativas com canal válido, na ordem definida. */
export function cartoesInicio(): Cartao[] {
  return areasAtivas()
    .filter((a) => a.cartao && canalValido(a.id))
    .sort((x, y) => (x.cartao?.ordem ?? 0) - (y.cartao?.ordem ?? 0))
    .map((a) => ({
      area: a.id,
      rotulo: a.cartao?.rotulo ?? a.titulo,
      texto: a.id === 'pilates' ? resumoPilates() : (a.cartao?.texto ?? a.resumo),
      equipe: a.equipe,
      url: `https://wa.me/${canalValido(a.id)}?text=${encodeURIComponent(atendimentoRapido[a.id].mensagem)}`,
    }));
}

export const whatsappUrl = (area: IdArea | 'geral' = 'geral', mensagem = atendimentoRapido[area].mensagem): string =>
  `https://wa.me/${numeroWhatsapp(area)}?text=${encodeURIComponent(mensagem)}`;

/** Telefone no formato brasileiro, ex.: (49) 99999-9999. */
export const telefoneExibicao = (n: string = numeroWhatsapp()): string => {
  const d = n.replace(/^55/, '');
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
};
