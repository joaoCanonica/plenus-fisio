/**
 * Modelo de dado com rastreio de pendência. Princípio: PUBLICAR SEM PENDÊNCIA.
 *
 * Todo dado factual do site passa por aqui. Um campo pode estar:
 *  - "confirmado": conferido com a clínica/documento;
 *  - "opcional":   pode ficar vazio para sempre. Vazio = o trecho ou a seção
 *                  some sozinho. Nunca gera pendência; vira sugestão em
 *                  docs/MELHORIAS.md;
 *  - "pendente":   valor provisório, com nível:
 *      · "bloqueante" → o build de produção falha enquanto existir
 *                       (só os 3 itens do CLAUDE.md usam isto);
 *      · "aviso"      → produção passa e o campo some; preview mostra com
 *                       o selo "PROVISÓRIO".
 */
export type Nivel = 'bloqueante' | 'aviso';

export interface CampoConfirmado<T> { readonly status: 'confirmado'; readonly valor: T }
export interface CampoOpcional<T> { readonly status: 'opcional'; readonly valor: T | null; readonly nota: string }
export interface CampoPendente<T> {
  readonly status: 'pendente';
  readonly valor: T;
  readonly nivel: Nivel;
  /** O que falta para confirmar. Vai para o relatório. */
  readonly nota: string;
}
export type Campo<T> = CampoConfirmado<T> | CampoOpcional<T> | CampoPendente<T>;

export const confirmado = <T>(valor: T): CampoConfirmado<T> => ({ status: 'confirmado', valor });

/** Campo que pode não existir. `nota` descreve a melhoria para docs/MELHORIAS.md. */
export const opcional = <T>(valor: T | null = null, nota = ''): CampoOpcional<T> => ({ status: 'opcional', valor, nota });

export const bloqueante = <T>(valor: T, nota: string): CampoPendente<T> => ({ status: 'pendente', valor, nivel: 'bloqueante', nota });

export const aviso = <T>(valor: T, nota: string): CampoPendente<T> => ({ status: 'pendente', valor, nivel: 'aviso', nota });

export const isPendente = <T>(c: Campo<T>): boolean => c.status === 'pendente';

/** Valor preenchido e confirmado (opcional com valor conta como confirmado). */
export const temValor = <T>(c: Campo<T>): boolean =>
  (c.status === 'confirmado' || c.status === 'opcional') && c.valor !== null && c.valor !== '' && c.valor !== undefined;
