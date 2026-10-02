import type { Campo } from '../config/campo.ts';

/**
 * "production" só quando o build é chamado com SITE_MODE=production
 * (script `build`). Dev e `build:preview` são sempre preview.
 */
// No Astro vem de import.meta.env; nos scripts Node (validação), de process.env.
const siteMode: unknown = import.meta.env?.SITE_MODE ?? globalThis.process?.env?.['SITE_MODE'];
export const MODO: 'production' | 'preview' = siteMode === 'production' ? 'production' : 'preview';

export const EM_PRODUCAO = MODO === 'production';

/**
 * Valor a exibir, ou null quando o trecho deve sumir:
 *  - opcional vazio → null em qualquer modo;
 *  - aviso → null em produção (preview mostra com selo).
 */
export function exibir<T>(c: Campo<T>): T | null {
  if (c.status === 'confirmado') return c.valor;
  if (c.status === 'opcional') return c.valor === '' ? null : c.valor;
  return EM_PRODUCAO && c.nivel === 'aviso' ? null : c.valor;
}

export const provisorio = <T>(c: Campo<T>): boolean => c.status === 'pendente' && !EM_PRODUCAO;
