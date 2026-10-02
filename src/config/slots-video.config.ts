/**
 * Slots de vídeo da landing. Preencher ou trocar um slot = editar ESTE arquivo
 * e cadastrar a mídia no media.manifest.json. Nenhum componente muda.
 *
 * Comportamento (src/lib/slots.ts):
 *  - vago, em dev/preview  → bloco desenhado "Vídeo em breve" (para aprovar o layout);
 *  - vago, em produção     → não renderiza: a seção some do DOM e do menu;
 *  - preenchido            → cada mídia precisa estar liberada (publicavel, consentimento,
 *                            dataRegistro, legenda revisada ou vídeo sem fala, instituição
 *                            autorizada). Se faltar algo: preview mostra com selo
 *                            PROVISÓRIO; produção bloqueia o build.
 *
 * Nunca usar em títulos/capítulos: nome, escola, cidade, diagnóstico ou rotina do paciente, nem
 * linguagem de "conquista". Títulos neutros e descritivos.
 */
export type EstadoSlot = 'vago' | 'preenchido';

export interface Capitulo {
  /** Início em segundos. */
  readonly inicio: number;
  /** Conduta/tema, neutro. Ex.: "Marcha com apoio". */
  readonly titulo: string;
}

export interface ItemSlot {
  readonly midiaId: string;
  /** Título neutro. "{data}" é trocado pela data do registro. */
  readonly titulo: string;
  readonly capitulos: readonly Capitulo[];
}

export interface SlotConvite {
  readonly estado: EstadoSlot;
  readonly item: ItemSlot | null;
  readonly titulo: string;
  readonly texto: string;
  readonly cta: string;
  readonly posicao: 'apos-hero';
}

export interface SlotAtendimentos {
  readonly estado: EstadoSlot;
  /** Um vídeo longo com capítulos, ou uma lista de vídeos. */
  readonly itens: readonly ItemSlot[];
  readonly titulo: string;
  readonly texto: string;
  readonly posicao: 'atendimentos';
}

/** Vídeo de apresentação (fora dos slots). */
export interface VideoApresentacao {
  readonly item: ItemSlot | null;
}

export const slots = {
  /** SLOT A: começa VAGO. */
  conviteVideo: {
    estado: 'vago',
    item: null,
    titulo: 'Conheça a clínica',
    texto: 'Um convite para conhecer o espaço e a equipe.',
    cta: 'Agendar uma consulta fisioterapêutica',
    posicao: 'apos-hero',
  } satisfies SlotConvite as SlotConvite,

  /** SLOT B: começa VAGO. */
  compilado: {
    estado: 'vago',
    itens: [],
    titulo: 'Atendimentos',
    texto: 'Registros publicados com autorização por escrito do paciente (ou do responsável legal), que pode ser retirada a qualquer momento. Sem nome ou outros dados que identifiquem o paciente.',
    posicao: 'atendimentos',
  } satisfies SlotAtendimentos as SlotAtendimentos,

  /** Vídeo de apresentação (opcional): aparece só quando a mídia estiver liberada. */
  apresentacao: {
    item: null,
  } satisfies VideoApresentacao as VideoApresentacao,
} as const;
