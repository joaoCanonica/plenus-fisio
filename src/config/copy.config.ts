import { confirmado } from './campo.ts';
import type { ModoEquipe } from '../lib/clinica.ts';

/**
 * Textos da landing. Sem afirmação clínica: afirmação de saúde só com registro
 * em docs/pesquisa/<tema>.md. Textos que citam pessoas têm variante por modo
 * (lib/clinica.ts → variante): 'clinica' (ninguém com CREFITO: terceira pessoa,
 * sem nomes), 'solo' ({nome}) e 'equipe' ({nomes}).
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

type Variantes = Readonly<Record<ModoEquipe, string>>;

export const copy = {
  hero: {
    titulo: confirmado('Fisioterapia e Pilates em Lages (SC)'),
    subtitulo: confirmado<Variantes>({
      clinica: 'A {clinica} oferece consulta fisioterapêutica e atendimento individual, além de Pilates. O agendamento é pelo WhatsApp.',
      solo: 'Na {clinica}, {nome} oferece consulta fisioterapêutica e atendimento individual, além de Pilates. O agendamento é pelo WhatsApp.',
      equipe: 'Na {clinica}, {nomes} oferecem consulta fisioterapêutica e atendimento individual, além de Pilates. O agendamento é pelo WhatsApp.',
    }),
  },

  areas: {
    titulo: 'Áreas de atendimento',
    intro: {
      clinica: 'Cada atendimento começa com uma consulta fisioterapêutica e segue um plano terapêutico individual.',
      solo: 'Cada atendimento começa com uma consulta fisioterapêutica e segue um plano terapêutico individual.',
      equipe: 'Cada atendimento começa com uma consulta fisioterapêutica e segue um plano terapêutico individual, com o profissional da área.',
    } satisfies Variantes,
    recursosTitulo: 'Recursos utilizados',
  },

  equipe: {
    titulo: { clinica: '', solo: 'Quem atende', equipe: 'Quem atende' } satisfies Variantes,
  },

  onde: {
    titulo: 'Onde estamos',
    regiao: 'Os atendimentos acontecem na clínica, no Centro de Lages (SC).',
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
