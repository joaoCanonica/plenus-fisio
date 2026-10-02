import { copy } from '../config/copy.config.ts';
import { renderCompilado, renderConvite } from './slots.ts';

/** Seções da landing, na ordem da página. Fonte única para o menu. */
export interface Secao {
  readonly id: string;
  readonly rotulo: string;
  readonly noMenu: boolean;
}

export function secoes(): Secao[] {
  return [
    { id: 'inicio', rotulo: 'Início', noMenu: false },
    ...(renderConvite() ? [{ id: 'convite', rotulo: 'Conheça', noMenu: false }] : []),
    ...(renderCompilado() ? [{ id: 'videos', rotulo: 'Atendimentos em vídeo', noMenu: false }] : []),
    { id: 'onde', rotulo: 'Onde estamos', noMenu: true },
    ...(copy.faq.itens.length ? [{ id: 'faq', rotulo: 'Perguntas', noMenu: true }] : []),
    { id: 'contato', rotulo: 'Contato', noMenu: true },
  ];
}
