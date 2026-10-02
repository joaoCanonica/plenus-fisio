import { copy } from '../config/copy.config.ts';
import { renderCompilado, renderConvite } from './slots.ts';
import { cartoesInicio, equipeVisivel } from './clinica.ts';

/** Seções da landing, na ordem da página. Fonte única para o menu. */
export interface Secao {
  readonly id: string;
  readonly rotulo: string;
  readonly noMenu: boolean;
}

export function secoes(): Secao[] {
  return [
    { id: 'inicio', rotulo: 'Início', noMenu: false },
    ...(cartoesInicio().length ? [{ id: 'comecar', rotulo: 'Por onde começar', noMenu: true }] : []),
    ...(equipeVisivel().length ? [{ id: 'equipe', rotulo: 'Equipe', noMenu: true }] : []),
    ...(renderConvite() ? [{ id: 'convite', rotulo: 'Conheça', noMenu: false }] : []),
    ...(renderCompilado() ? [{ id: 'videos', rotulo: 'Atendimentos em vídeo', noMenu: false }] : []),
    { id: 'onde', rotulo: 'Onde estamos', noMenu: true },
    ...(copy.faq.itens.length ? [{ id: 'faq', rotulo: 'Perguntas', noMenu: true }] : []),
    { id: 'contato', rotulo: 'Contato', noMenu: true },
  ];
}
