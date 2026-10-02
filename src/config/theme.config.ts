/**
 * Design system: ÚNICO lugar do projeto com valores de cor.
 * Componentes e CSS usam apenas os tokens semânticos (var(--texto), var(--acao)…),
 * gerados por src/lib/tema.ts. `scripts/validate-theme.ts` verifica:
 *  - contraste AA de todos os pares declarados em `pares`, nos dois esquemas e nos tons;
 *  - que nenhum arquivo em src/ (fora deste) tenha cor hardcoded.
 *
 * Origem: verde amostrado do logo da Plenus (média dos pixels do fundo de
 * assets-originais/marca/logo-original.jpg ≈ #457147; ver docs/marca/LOGO.md).
 * Família: verde da marca, sálvia clara, areia, off-white quente, grafite
 * esverdeado e um acento terracota suave para destaques pontuais.
 */

/** Primitivas: nomes por papel, não por uso. Não usar direto em componentes. */
export const primitivas = {
  verdeMarca: '#457147', // amostrado do logo · cor de ação
  verdeMarcaEscuro: '#38603b', // hover
  verdeNoite: '#1e3522',
  verdeClaro: '#9fcaa3', // ação sobre fundo escuro
  salvia: '#dbe7d8', // superfície suave
  salviaEscura: '#a9c8a8',
  areia: '#ecdfca',
  areiaSuave: '#f5eee3',
  offWhite: '#faf7f1', // fundo quente
  offWhiteClaro: '#fdfbf7',
  branco: '#ffffff',
  grafite: '#1f2a24', // texto (grafite esverdeado)
  grafiteMedio: '#4d5b53',
  borda: '#d7d9cf',
  terracota: '#a4512f', // acento quente, pontual
  terracotaSuave: '#f3dccf',
  terracotaTexto: '#7c3a1f',
  terracotaClara: '#e5a586',
  noite1: '#121915',
  noite2: '#19221d',
  noite3: '#212c26',
  textoNoite: '#eef2ec',
  textoNoiteSuave: '#b9c7bf',
  bordaNoite: '#3a4740',
  avisoFundo: '#fff1d6',
  avisoTexto: '#5a3b00',
  avisoBorda: '#8a5a00',
} as const;

type P = keyof typeof primitivas;

/** Tokens semânticos que todo tom precisa definir. */
export interface Tokens {
  fundo: P;
  superficie: P;
  superficieAlt: P;
  texto: P;
  textoSuave: P;
  borda: P;
  /** Botão primário: o verde da marca. */
  acao: P;
  acaoHover: P;
  acaoTexto: P;
  /** Links, ênfases, eyebrow. */
  destaque: P;
  /** Fundo/texto de tag suave (sálvia). */
  acento: P;
  acentoTexto: P;
  /** Acento quente (terracota): destaques pontuais, nunca em bloco grande. */
  quente: P;
  quenteFundo: P;
  quenteTexto: P;
  foco: P;
  sombra: P;
}

const claro: Tokens = {
  fundo: 'offWhite',
  superficie: 'branco',
  superficieAlt: 'areiaSuave',
  texto: 'grafite',
  textoSuave: 'grafiteMedio',
  borda: 'borda',
  acao: 'verdeMarca',
  acaoHover: 'verdeMarcaEscuro',
  acaoTexto: 'offWhiteClaro',
  destaque: 'verdeMarca',
  acento: 'salvia',
  acentoTexto: 'verdeNoite',
  quente: 'terracota',
  quenteFundo: 'terracotaSuave',
  quenteTexto: 'terracotaTexto',
  foco: 'verdeMarcaEscuro',
  sombra: 'verdeNoite',
};

const escuro: Tokens = {
  fundo: 'noite1',
  superficie: 'noite2',
  superficieAlt: 'noite3',
  texto: 'textoNoite',
  textoSuave: 'textoNoiteSuave',
  borda: 'bordaNoite',
  acao: 'verdeClaro',
  acaoHover: 'salviaEscura',
  acaoTexto: 'verdeNoite',
  destaque: 'verdeClaro',
  acento: 'verdeNoite',
  acentoTexto: 'salvia',
  quente: 'terracotaClara',
  quenteFundo: 'terracotaTexto',
  quenteTexto: 'textoNoite',
  foco: 'verdeClaro',
  sombra: 'noite1',
};

/** Seção verde da marca (fixa nos dois esquemas). */
const verde: Tokens = {
  fundo: 'verdeMarca',
  superficie: 'verdeNoite',
  superficieAlt: 'verdeMarcaEscuro',
  texto: 'offWhiteClaro',
  textoSuave: 'areiaSuave',
  borda: 'verdeMarcaEscuro',
  acao: 'offWhiteClaro', // botão invertido sobre o verde
  acaoHover: 'areiaSuave',
  acaoTexto: 'verdeNoite',
  destaque: 'areiaSuave',
  acento: 'verdeNoite',
  acentoTexto: 'salvia',
  quente: 'offWhiteClaro',
  quenteFundo: 'terracotaTexto',
  quenteTexto: 'offWhiteClaro',
  foco: 'offWhiteClaro',
  sombra: 'verdeNoite',
};

export const theme = {
  primitivas,
  /** Esquemas da página (prefers-color-scheme / data-tema). */
  esquemas: { claro, escuro },
  /** Tons de seção. "claro" segue o esquema; "escuro" e "verde" são fixos. */
  tons: { escuro, verde },
  aviso: { fundo: 'avisoFundo', texto: 'avisoTexto', borda: 'avisoBorda' } satisfies Record<string, P>,
  /** Cor da barra do navegador (meta theme-color). */
  themeColor: 'verdeMarca' satisfies P,

  /** Pares verificados (frente, fundo, mínimo). 4.5 = texto; 3 = texto grande/UI/foco. */
  pares: [
    ['texto', 'fundo', 4.5],
    ['texto', 'superficie', 4.5],
    ['texto', 'superficieAlt', 4.5],
    ['textoSuave', 'fundo', 4.5],
    ['textoSuave', 'superficie', 4.5],
    ['destaque', 'fundo', 4.5],
    ['destaque', 'superficie', 4.5],
    ['acaoTexto', 'acao', 4.5],
    ['acaoTexto', 'acaoHover', 4.5],
    ['acentoTexto', 'acento', 4.5],
    ['quenteTexto', 'quenteFundo', 4.5],
    ['quente', 'fundo', 3],
    ['textoSuave', 'superficieAlt', 4.5],
    ['foco', 'fundo', 3],
    ['foco', 'superficie', 3],
  ] as const satisfies readonly (readonly [keyof Tokens, keyof Tokens, number])[],

  /** Self-hosted (@fontsource). Display serifada acolhedora + sans de texto. */
  fontes: {
    display: "'Instrument Serif', 'Instrument Serif Fallback', Georgia, 'Times New Roman', serif",
    texto: "'Figtree', 'Figtree Fallback', system-ui, -apple-system, 'Segoe UI', sans-serif",
  },

} as const;

export type Tom = 'claro' | 'escuro' | 'verde';
