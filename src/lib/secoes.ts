import { copy } from '../config/copy.config.ts';
import { renderCompilado, renderConvite } from './slots.ts';
import { areasAtivas, cartoesInicio } from './clinica.ts';
import { imagemLiberada, manifesto } from './manifesto.ts';
import { EM_PRODUCAO } from './modo.ts';

const espacoTemFotos = (): boolean =>
  manifesto.itens.some((i) => i.categoria === 'espaco' && imagemLiberada(i.id, EM_PRODUCAO) !== null);

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
    ...(cartoesInicio().length ? [{ id: 'comecar', rotulo: 'Por onde começar', noMenu: false }] : []),
    ...(areasAtivas().length ? [{ id: 'areas', rotulo: 'Áreas', noMenu: true }] : []),
    { id: 'primeira-consulta', rotulo: 'Primeira consulta', noMenu: true },
    { id: 'equipe', rotulo: 'Quem cuida', noMenu: true },
    ...(espacoTemFotos() ? [{ id: 'espaco', rotulo: 'O espaço', noMenu: false }] : []),
    ...(renderCompilado() ? [{ id: 'videos', rotulo: 'Atendimentos em vídeo', noMenu: false }] : []),
    { id: 'onde', rotulo: 'Onde fica', noMenu: true },
    ...(copy.faq.itens.length ? [{ id: 'faq', rotulo: 'Perguntas', noMenu: true }] : []),
    { id: 'contato', rotulo: 'Contato', noMenu: false },
  ];
}
