/**
 * Modelo de dado com rastreio de pendência.
 *
 * Todo dado factual do site passa por aqui. Um campo pode estar:
 *  - "confirmado": conferido com o profissional/documento;
 *  - "pendente": ainda provisório. Nesse caso informa o nível:
 *      · "bloqueante" → o build de produção falha enquanto existir;
 *      · "aviso"      → o build de produção passa, mas o campo é tratado
 *                       de forma conservadora (oculto ou com redação neutra).
 *
 * Dev e preview sempre funcionam e marcam os campos pendentes com o selo
 * "PROVISÓRIO".
 */
export type Nivel = 'bloqueante' | 'aviso';

export type Campo<T> =
  | { readonly status: 'confirmado'; readonly valor: T }
  | {
      readonly status: 'pendente';
      readonly valor: T;
      readonly nivel: Nivel;
      /** O que falta para confirmar. Vai para o relatório de pendências. */
      readonly nota: string;
    };

export const confirmado = <T>(valor: T): Campo<T> => ({ status: 'confirmado', valor });

export const bloqueante = <T>(valor: T, nota: string): Campo<T> => ({
  status: 'pendente',
  valor,
  nivel: 'bloqueante',
  nota,
});

export const aviso = <T>(valor: T, nota: string): Campo<T> => ({
  status: 'pendente',
  valor,
  nivel: 'aviso',
  nota,
});

export const isPendente = <T>(c: Campo<T>): boolean => c.status === 'pendente';
