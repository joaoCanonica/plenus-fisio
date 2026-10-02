import { theme, type Tokens } from '../config/theme.config.ts';

const hex = (p: keyof typeof theme.primitivas): string => theme.primitivas[p];

const kebab = (s: string): string => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

function bloco(t: Tokens): string {
  return Object.entries(t)
    .map(([k, v]) => `--${kebab(k)}:${hex(v as keyof typeof theme.primitivas)};`)
    .join('');
}

/**
 * CSS dos tokens. Ordem importa: as regras explícitas [data-tema] vêm depois
 * da media query para vencer a preferência do sistema.
 */
export function cssDoTema(): string {
  const { claro, escuro } = theme.esquemas;
  const aviso = Object.entries(theme.aviso)
    .map(([k, v]) => `--aviso-${k}:${hex(v)};`)
    .join('');
  // Token de composição: fundo da seção verde.
  const comp = `--secao-verde:${hex('verdeMarca')};`;
  return [
    `:root{color-scheme:light dark;${comp}${aviso}--marca:${hex('verdeMarca')};}`,
    `:root,.tom-claro{color-scheme:light;${bloco(claro)}}`,
    `@media (prefers-color-scheme: dark){:root,.tom-claro{color-scheme:dark;${bloco(escuro)}--marca:${hex('verdeClaro')};}}`,
    `[data-tema="claro"],[data-tema="claro"] .tom-claro{color-scheme:light;${bloco(claro)}--marca:${hex('verdeMarca')};}`,
    `[data-tema="escuro"],[data-tema="escuro"] .tom-claro{color-scheme:dark;${bloco(escuro)}--marca:${hex('verdeClaro')};}`,
    `.tom-escuro{color-scheme:dark;${bloco(theme.tons.escuro)}--marca:${hex('verdeClaro')};}`,
    `.tom-verde{color-scheme:dark;${bloco(theme.tons.verde)}--marca:${hex('offWhiteClaro')};}`,
    `:root{--fonte-display:${theme.fontes.display};--fonte-texto:${theme.fontes.texto};}`,
  ].join('\n');
}

export const themeColor = (): string => hex(theme.themeColor);

// ---- Contraste (WCAG 2.x) ----
function lum(h: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  ) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a: string, b: string): number {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m) as [number, number];
  return (x + 0.05) / (y + 0.05);
}

export interface ResultadoPar {
  readonly contexto: string;
  readonly frente: string;
  readonly fundo: string;
  readonly razao: number;
  readonly minimo: number;
  readonly ok: boolean;
}

export function verificarContraste(): ResultadoPar[] {
  const contextos: [string, Tokens][] = [
    ['esquema claro', theme.esquemas.claro],
    ['esquema escuro', theme.esquemas.escuro],
    ['tom escuro', theme.tons.escuro],
    ['tom verde', theme.tons.verde],
  ];
  const out: ResultadoPar[] = [];
  for (const [contexto, t] of contextos)
    for (const [f, b, minimo] of theme.pares) {
      const razao = contraste(hex(t[f]), hex(t[b]));
      out.push({ contexto, frente: f, fundo: b, razao, minimo, ok: razao >= minimo });
    }
  const av = contraste(hex(theme.aviso.texto), hex(theme.aviso.fundo));
  out.push({ contexto: 'selo provisório', frente: 'aviso-texto', fundo: 'aviso-fundo', razao: av, minimo: 4.5, ok: av >= 4.5 });
  return out;
}
