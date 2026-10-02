import { bloqueante, confirmado, opcional, type Campo } from './campo.ts';

/**
 * Núcleo de CLÍNICA: fonte única de verdade para a identificação COFFITO da
 * pessoa jurídica, a equipe, as áreas e o roteamento do WhatsApp.
 *
 * PUBLICAR SEM PENDÊNCIA: só três coisas bloqueiam produção (CLAUDE.md):
 *   (1) clinica.registroEmpresaCrefito,
 *   (2) clinica.responsavelTecnico (nome + CREFITO),
 *   (3) um WhatsApp real em pelo menos um canal (clínica ou equipe).
 * Todo o resto é `opcional()`: vazio, o trecho some sozinho e vira sugestão
 * em docs/MELHORIAS.md. Regras de exibição ficam em src/lib/clinica.ts.
 */

/** Somente dígitos: 55 + DDD + número. */
type Telefone = string;

export type IdEquipe = 'adrian' | 'natalia';
export type IdArea = 'traumatoOrtopedica' | 'esportiva' | 'obstetricaPelvica' | 'pilates' | 'geriatrica';
/** Canal de WhatsApp: o da clínica ou o de um profissional. */
export type Canal = 'clinica' | IdEquipe;

export interface Profissional {
  readonly id: IdEquipe;
  /** Rótulo interno (nunca exibido). */
  readonly ref: string;
  readonly nomeCompleto: Campo<string>;
  /** Sem CREFITO, o profissional NÃO aparece em lugar nenhum. */
  readonly crefito: Campo<string>;
  /** Títulos registrados (ex.: pós-graduação). "Especialista" só com RQE. */
  readonly titulos: Campo<readonly string[]>;
  readonly especialista: { readonly registrado: boolean; readonly rqe: string | null; readonly especialidade: string | null };
  readonly areas: readonly IdArea[];
  readonly whatsapp: Campo<Telefone>;
  /** Id da imagem no media.manifest.json. */
  readonly foto: Campo<string>;
  readonly responsavelTecnico: boolean;
}

export interface Area {
  readonly id: IdArea;
  readonly ativa: boolean;
  readonly responsaveis: readonly IdEquipe[];
  readonly titulo: string;
  /** Descrição do serviço, sem afirmação clínica (afirmações exigem docs/pesquisa). */
  readonly resumo: string;
}

export interface Recurso {
  readonly id: string;
  readonly nome: string;
  /** Só recursos confirmados pela clínica aparecem. */
  readonly confirmado: boolean;
}

export interface Vinculo {
  readonly id: string;
  readonly nome: string;
  readonly autorizacao: 'pendente' | 'confirmada-pelo-cliente' | 'formal-arquivada';
  readonly comprovante: string | null;
}

export const clinica = {
  /** Só a pessoa jurídica usa nome fantasia. */
  nomeFantasia: confirmado('Plenus Fisioterapia & Pilates'),
  razaoSocial: opcional<string>(null, 'Razão social (aparece na identificação do rodapé).'),
  cnpj: opcional<string>(null, 'CNPJ (aparece na identificação do rodapé).'),
  /** BLOQUEANTE (1). */
  registroEmpresaCrefito: bloqueante('', 'Número do registro da empresa (Plenus) no CREFITO.'),
  /** CONFIRMAR: SC é CREFITO-10. */
  crefitoRegiao: confirmado('CREFITO-10'),
  /** BLOQUEANTE (2). */
  responsavelTecnico: {
    nome: bloqueante('', 'Nome completo do responsável técnico (RT).'),
    crefito: bloqueante('', 'CREFITO do responsável técnico (RT).'),
  },
  endereco: {
    rua: confirmado('Rua Marechal Deodoro'),
    numero: opcional<string>(null, 'Número do endereço.'),
    complemento: opcional<string>(null, 'Complemento do endereço (sala, andar).'),
    bairro: confirmado('Centro'),
    cidade: confirmado('Lages'),
    uf: confirmado('SC'),
    cep: confirmado('88501-003'),
  },
  /** WhatsApp geral da clínica (um dos canais possíveis para o bloqueante 3). */
  whatsapp: opcional<Telefone>(null, 'WhatsApp da clínica (recepção).'),
  telefone: opcional<Telefone>(null, 'Telefone fixo.'),
  horarios: opcional<string>(null, 'Horários de atendimento (ex.: "Segunda a sexta, 7h às 20h").'),
  instagram: confirmado('plenusfisioterapia.lages'),
  /** Domínio de produção, sem barra final. */
  dominio: opcional<string>(null, 'Domínio de produção (melhora SEO, canonical e sitemap).'),
  googleMeuNegocio: opcional<string>(null, 'Link do perfil no Google (abre o mapa e as avaliações fora do site).'),
} as const;

export const equipe: readonly Profissional[] = [
  {
    id: 'adrian',
    ref: 'Adrian (sócio)',
    nomeCompleto: opcional<string>(null, 'Nome completo do Adrian.'),
    crefito: opcional<string>(null, 'CREFITO do Adrian (sem ele, o nome não aparece no site).'),
    titulos: opcional<readonly string[]>(null, 'Formação e títulos do Adrian.'),
    especialista: { registrado: false, rqe: null, especialidade: null },
    areas: ['traumatoOrtopedica', 'esportiva', 'pilates'],
    whatsapp: opcional<Telefone>(null, 'WhatsApp do Adrian.'),
    foto: opcional<string>(null, 'Foto do Adrian (id do manifesto; hoje só avatares 150x150).'),
    responsavelTecnico: false,
  },
  {
    id: 'natalia',
    ref: 'Natalia',
    nomeCompleto: opcional<string>(null, 'Nome completo da Natalia.'),
    crefito: opcional<string>(null, 'CREFITO da Natalia (sem ele, o nome não aparece no site).'),
    titulos: opcional<readonly string[]>(null, 'Formação e títulos da Natalia.'),
    especialista: { registrado: false, rqe: null, especialidade: null },
    areas: ['obstetricaPelvica', 'pilates'],
    whatsapp: opcional<Telefone>(null, 'WhatsApp da Natalia.'),
    foto: opcional<string>(null, 'Foto da Natalia (id do manifesto; hoje só avatares 150x150).'),
    responsavelTecnico: false,
  },
];

export const areas: readonly Area[] = [
  {
    id: 'traumatoOrtopedica',
    ativa: true,
    responsaveis: ['adrian'],
    titulo: 'Fisioterapia traumato-ortopédica',
    resumo: 'Consulta fisioterapêutica e atendimento para dores e lesões de músculos, ossos e articulações, e no pós-operatório ortopédico.',
  },
  {
    id: 'esportiva',
    ativa: true,
    responsaveis: ['adrian'],
    titulo: 'Fisioterapia esportiva',
    resumo: 'Atendimento para quem pratica esporte, da lesão ao retorno à atividade, com plano terapêutico individual.',
  },
  {
    id: 'obstetricaPelvica',
    ativa: true,
    responsaveis: ['natalia'],
    titulo: 'Fisioterapia obstétrica e pélvica',
    resumo: 'Atendimento na gestação e no pós-parto, e para as funções do assoalho pélvico.',
  },
  {
    id: 'pilates',
    ativa: true,
    responsaveis: ['adrian', 'natalia'],
    titulo: 'Pilates',
    // Texto decidido em lib/clinica.ts conforme `pilates` (abaixo).
    resumo: '',
  },
  {
    id: 'geriatrica',
    ativa: false, // inativa até a clínica confirmar
    responsaveis: [],
    titulo: 'Fisioterapia geriátrica',
    resumo: 'Atendimento à pessoa idosa, com foco em mobilidade, equilíbrio e autonomia no dia a dia.',
  },
];

/**
 * Pilates. Enquanto `conduzidoPorFisioterapeuta` não for confirmado, o texto
 * diz apenas "Pilates em solo e em aparelhos", sem título nem vocabulário clínico.
 */
export const pilates: { conduzidoPorFisioterapeuta: Campo<boolean>; modalidade: 'clinico' | 'aulas' } = {
  conduzidoPorFisioterapeuta: opcional<boolean>(false, 'Confirmar se o Pilates é conduzido por fisioterapeuta (permite descrevê-lo como recurso do plano terapêutico).'),
  modalidade: 'clinico',
};

/** Recursos terapêuticos: só os confirmados aparecem. */
export const recursos: readonly Recurso[] = [
  { id: 'taping', nome: 'Bandagem elástica (taping)', confirmado: false },
  { id: 'botaPneumatica', nome: 'Compressão pneumática (bota)', confirmado: false },
  { id: 'drenagem', nome: 'Drenagem linfática', confirmado: false },
  { id: 'laser', nome: 'Laserterapia', confirmado: false },
];

/** Mensagens neutras: sem sintoma, sem dado de saúde. */
export const MENSAGEM_CONSULTA = 'Olá, gostaria de agendar uma consulta fisioterapêutica.';
export const MENSAGEM_PILATES = 'Olá, gostaria de saber como funciona o Pilates.';

/**
 * Roteamento do WhatsApp por área. Se o canal preferido não existir (sem número,
 * ou profissional sem CREFITO), cai no da clínica e depois em qualquer canal real.
 */
export const atendimentoRapido: Readonly<Record<IdArea | 'geral', { readonly canal: Canal; readonly mensagem: string }>> = {
  geral: { canal: 'clinica', mensagem: MENSAGEM_CONSULTA },
  traumatoOrtopedica: { canal: 'adrian', mensagem: MENSAGEM_CONSULTA },
  esportiva: { canal: 'adrian', mensagem: MENSAGEM_CONSULTA },
  obstetricaPelvica: { canal: 'natalia', mensagem: MENSAGEM_CONSULTA },
  pilates: { canal: 'clinica', mensagem: MENSAGEM_PILATES },
  geriatrica: { canal: 'clinica', mensagem: MENSAGEM_CONSULTA },
};

/** Instituições de terceiros citadas no site (exigem autorização formal). */
export const vinculos: readonly Vinculo[] = [];
