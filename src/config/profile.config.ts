import { aviso, bloqueante, confirmado, type Campo } from './campo.ts';

/**
 * Perfil profissional: fonte única de verdade para a identificação exigida pelo
 * COFFITO (nome completo, profissão e CREFITO) em toda página e todo vídeo.
 *
 * Campos incertos usam `bloqueante(...)` (o build de produção falha) ou
 * `aviso(...)` (produção passa e o dado fica oculto). Para confirmar, troque
 * por `confirmado(...)`.
 */

/**
 * 'confirmada-pelo-cliente': aceita pela trava de produção; a falta do
 * comprovante vira AVISO de baixa prioridade.
 */
export type Autorizacao = 'pendente' | 'confirmada-pelo-cliente' | 'formal-arquivada';

export interface Vinculo {
  readonly id: string;
  readonly nome: string;
  readonly instagram: string;
  readonly autorizacao: Autorizacao;
  /** Onde está arquivado o comprovante (fora do repositório). Null = a arquivar. */
  readonly comprovante: string | null;
}

export interface Unidade {
  readonly id: string;
  readonly nome: string;
  /** Id do vínculo institucional que autoriza o uso do nome/espaço. Null = espaço próprio. */
  readonly vinculoId: string | null;
  readonly mapsUrl: Campo<string | null>;
  /** Identificador do lugar no Google Maps (parâmetro "ftid"). */
  readonly ftid: Campo<string | null>;
  /** Endereço por extenso: rua, número, bairro, cidade/UF, CEP. */
  readonly endereco: Campo<string>;
}

export const profile = {
  /**
   * Shape herdado do template (um profissional). Para a clínica, ver a proposta
   * em docs/ARQUITETURA.md (pessoa jurídica + RT + equipe).
   */
  nomeCompleto: bloqueante('Responsável técnico a informar', 'Nome completo do responsável técnico (RT).'),
  nomeMarca: confirmado('Plenus Fisioterapia & Pilates'),
  profissao: confirmado('Fisioterapeuta' as const),

  crefito: {
    numero: bloqueante('000000-F', 'Número do CREFITO do responsável técnico.'),
    regiao: confirmado('CREFITO-10'), // Santa Catarina
    atuacaoUfs: ['SC'] as const,
    comprovanteAtuacaoUfs: confirmado<string | null>(null),
  },

  /** Opcional. Se informado, aparece ao lado do registro. */
  linkVerificacaoCrefito: confirmado<string | null>(null),

  titulos: {
    graduacao: aviso({ curso: 'Fisioterapia', instituicao: null as string | null }, 'Formação do RT (opcional).'),
    posGraduacao: aviso({ area: null as string | null, instituicao: null as string | null }, 'Pós-graduação do RT (opcional).'),
    mestrado: confirmado(null as { programa: string; instituicao: string | null; concluido: boolean } | null),
  },

  /** Sem registro de especialista + RQE, o site nunca usa a palavra "especialista". */
  especialista: { registrado: false, rqe: null as string | null, especialidade: null as string | null },

  /** Instituições de terceiros citadas no site (exigem autorização). */
  vinculos: [] as readonly Vinculo[],

  areasAtuacao: [] as readonly string[],

  regioesAtendimento: ['Lages (SC)'],

  unidades: [
    {
      id: 'plenus-lages',
      nome: 'Plenus Fisioterapia & Pilates',
      vinculoId: null,
      mapsUrl: aviso<string | null>(null, 'Link do Google Maps da clínica.'),
      ftid: aviso<string | null>(null, 'Identificador do lugar no Google Maps (ftid).'),
      endereco: aviso('Lages (SC)', 'Endereço por extenso da clínica (rua, número, bairro, CEP).'),
    },
  ] satisfies readonly Unidade[],

  sedePrincipal: 'plenus-lages',

  instagram: aviso<string | null>(null, 'Usuário do Instagram da clínica (opcional).'),
  /** Somente dígitos: 55 + DDD + número. */
  whatsapp: bloqueante('5549000000000', 'WhatsApp real de pelo menos um canal.'),
  lattes: confirmado<string | null>(null),

  /** Domínio de produção, sem barra final. */
  dominio: aviso('https://example.com', 'Definir o domínio de produção.'),
} as const;

export type Profile = typeof profile;

/** Título profissional conforme a regra do RQE. */
export function tituloProfissional(): string {
  const e = profile.especialista;
  return e.registrado && e.rqe && e.especialidade
    ? `Especialista em ${e.especialidade} (RQE ${e.rqe})`
    : profile.titulos.posGraduacao.valor.area
      ? `Pós-graduação em ${profile.titulos.posGraduacao.valor.area}`
      : profile.profissao.valor;
}

export const registroCrefito = (): string =>
  `${profile.crefito.regiao.valor} ${profile.crefito.numero.valor}`;

export const sede = (): Unidade => {
  const u = profile.unidades.find((x) => x.id === profile.sedePrincipal);
  if (!u) throw new Error(`sedePrincipal "${profile.sedePrincipal}" não existe em unidades.`);
  return u;
};
