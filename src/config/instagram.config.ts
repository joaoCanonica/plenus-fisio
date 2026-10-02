/**
 * Bloco do Instagram SEM embed: até 6 publicações selecionadas, servidas como
 * arquivos locais (cadastre a imagem no media.manifest.json, categoria "pessoa"
 * ou "espaco"). Publicações com paciente exigem TCLE (as regras do manifesto valem).
 * Nenhum script ou imagem do Instagram é carregado pelo site.
 */
export interface PostInstagram {
  readonly midiaId: string;
  /** Link da publicação original (abre no Instagram, fora do site). */
  readonly url: string;
  /** Legenda curta e neutra. */
  readonly legenda: string;
}

export const instagram = {
  /** Máximo 6. Vazio = só o botão "Seguir". */
  posts: [] as readonly PostInstagram[],
} as const;
