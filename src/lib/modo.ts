import type { Campo } from '../config/campo.ts';

/**
 * "production" só quando o build é chamado com SITE_MODE=production
 * (script `build`). Dev e `build:preview` são sempre preview.
 */
export const MODO: 'production' | 'preview' =
  import.meta.env.SITE_MODE === 'production' ? 'production' : 'preview';

export const EM_PRODUCAO = MODO === 'production';

/** Valor a exibir; em produção, campos pendentes de nível "aviso" somem. */
export function exibir<T>(c: Campo<T>): T | null {
  if (c.status === 'confirmado') return c.valor;
  return EM_PRODUCAO && c.nivel === 'aviso' ? null : c.valor;
}

export const provisorio = <T>(c: Campo<T>): boolean => c.status === 'pendente' && !EM_PRODUCAO;
