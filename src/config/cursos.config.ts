/**
 * Módulo futuro "Cursos" (ex.: formação em Pilates). DESLIGADO na versão 1.
 * Para ligar: `ativo: true` e cada curso precisa de autorização formal da
 * instrução (terceiros), termo de imagem dos participantes e dados do curso.
 * O validador bloqueia produção se um curso ativo usar mídia sem autorização.
 */
export interface Curso {
  readonly id: string;
  readonly titulo: string;
  readonly resumo: string;
  /** Id de vídeo/imagem no media.manifest.json (opcional). */
  readonly midiaId: string | null;
}

export const cursos = {
  ativo: false,
  titulo: 'Cursos',
  itens: [] as readonly Curso[],
} as const;
