import { aviso } from './campo.ts';

/**
 * Textos da landing. VAZIO de propósito: o conteúdo da Plenus entra depois de
 * pesquisado (docs/pesquisa/<tema>.md), escrito no copy deck e aprovado pela
 * clínica. Campos `aviso(...)` aparecem em preview com selo e somem em produção
 * até serem confirmados.
 */
export interface Fonte {
  readonly texto: string;
  readonly url?: string;
}

export interface Faq {
  readonly pergunta: string;
  readonly resposta: string;
  /** Registro em docs/pesquisa (não exibido; rastreabilidade). */
  readonly pesquisa?: string;
}

export const copy = {
  hero: {
    titulo: aviso('Fisioterapia e Pilates em Lages (SC)', 'Título do hero: escrever e aprovar com a clínica.'),
    subtitulo: aviso<string | null>(null, 'Subtítulo do hero: escrever e aprovar com a clínica.'),
  },

  onde: {
    titulo: 'Onde estamos',
    regiao: 'Os atendimentos acontecem na clínica, em Lages (SC).',
    notaMapa: 'O mapa abre no Google Maps, fora deste site.',
  },

  faq: {
    titulo: 'Perguntas frequentes',
    itens: [] as readonly Faq[],
  },

  contato: {
    titulo: 'Agende uma consulta fisioterapêutica',
    texto:
      'É só chamar no WhatsApp. Para proteger a sua privacidade, deixe exames e relatórios para o dia da consulta fisioterapêutica.',
    instagram: null as string | null,
  },
} as const;
