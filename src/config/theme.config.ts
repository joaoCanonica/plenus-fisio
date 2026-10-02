/**
 * Design system: ÚNICO lugar do projeto com valores de cor.
 * Componentes e CSS usam apenas os tokens semânticos (var(--texto), var(--acao)…),
 * gerados por src/lib/tema.ts. `scripts/validate-theme.ts` verifica:
 *  - contraste AA de todos os pares declarados em `pares`, nos dois esquemas e nos tons;
 *  - que nenhum arquivo em src/ (fora deste) tenha cor hardcoded.
 *
 * Origem: PROVISÓRIA. Verde, off-white e areia escolhidos à mão até amostrar a
 * cor principal do logo da Plenus (trocar só as primitivas e rodar `pnpm check`).
 */

/** Primitivas: nomes por papel, não por uso. Não usar direto em componentes. */
export const primitivas = {
  verdeProfundo: '#2f5d50', // cor de ação (provisória, amostrar do logo)
  verdeMedio: '#3b7262', // hover
  verdeNoite: '#16302a',
  verdeClaro: '#9fd0bf', // ação/links sobre fundos escuros
  areia: '#e8dcc6', // acento quente
  areiaSuave: '#f4ede0',
  offWhite: '#faf8f3', // fundo
  offWhiteClaro: '#fdfcf9',
  branco: '#ffffff',
  grafite: '#1f2421', // texto
  grafiteMedio: '#4f5853',
  grafiteNoite: '#121614',
  grafiteNoite2: '#1a201d',
  grafiteNoite3: '#232a26',
  cinza: '#d9d6cf',
  cinzaEscuro: '#3c4540',
  cinzaTexto: '#c2cac5',
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
  /** Preenchimento de botão primário (a cor de ação é o verde). */
  acao: P;
  acaoHover: P;
  acaoTexto: P;
  /** Links, ênfases (em), eyebrow. */
  destaque: P;
  acento: P;
  acentoTexto: P;
  foco: P;
  sombra: P;
}

const claro: Tokens = {
  fundo: 'offWhite',
  superficie: 'branco',
  superficieAlt: 'areiaSuave',
  texto: 'grafite',
  textoSuave: 'grafiteMedio',
  borda: 'cinza',
  acao: 'verdeProfundo',
  acaoHover: 'verdeMedio',
  acaoTexto: 'offWhiteClaro',
  destaque: 'verdeProfundo',
  acento: 'areia',
  acentoTexto: 'verdeNoite',
  foco: 'verdeMedio',
  sombra: 'verdeNoite',
};

const escuro: Tokens = {
  fundo: 'grafiteNoite',
  superficie: 'grafiteNoite2',
  superficieAlt: 'grafiteNoite3',
  texto: 'offWhite',
  textoSuave: 'cinzaTexto',
  borda: 'cinzaEscuro',
  acao: 'verdeClaro',
  acaoHover: 'areia',
  acaoTexto: 'verdeNoite',
  destaque: 'verdeClaro',
  acento: 'verdeNoite',
  acentoTexto: 'areia',
  foco: 'verdeClaro',
  sombra: 'grafiteNoite',
};

/** Seção de destaque em verde (fixa nos dois esquemas). */
const marca: Tokens = {
  fundo: 'verdeProfundo',
  superficie: 'verdeNoite',
  superficieAlt: 'verdeMedio',
  texto: 'offWhiteClaro',
  textoSuave: 'areiaSuave',
  borda: 'verdeMedio',
  acao: 'offWhiteClaro', // botão invertido sobre o verde
  acaoHover: 'areiaSuave',
  acaoTexto: 'verdeProfundo',
  destaque: 'areia',
  acento: 'verdeNoite',
  acentoTexto: 'areia',
  foco: 'areia',
  sombra: 'verdeNoite',
};

export const theme = {
  primitivas,
  /** Esquemas da página (prefers-color-scheme / data-tema). */
  esquemas: { claro, escuro },
  /** Tons de seção. "claro" segue o esquema; "escuro" e "marca" são fixos. */
  tons: { escuro, marca },
  aviso: { fundo: 'avisoFundo', texto: 'avisoTexto', borda: 'avisoBorda' } satisfies Record<string, P>,
  /** Cor da barra do navegador (meta theme-color). */
  themeColor: 'verdeProfundo' satisfies P,

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
    ['foco', 'fundo', 3],
    ['foco', 'superficie', 3],
  ] as const satisfies readonly (readonly [keyof Tokens, keyof Tokens, number])[],

  /** Provisório: display e texto em Lato até definir a tipografia da Plenus. */
  fontes: {
    display: "'Lato', 'Lato Fallback', system-ui, -apple-system, 'Segoe UI', sans-serif",
    texto: "'Lato', 'Lato Fallback', system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
} as const;

export type Tom = 'claro' | 'escuro' | 'marca';
