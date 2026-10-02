import { slots, type ItemSlot } from '../config/slots-video.config.ts';
import { EM_PRODUCAO } from './modo.ts';
import { impedimentosMidia } from './validacao.ts';
import { dataValida, midiaPorId, type ItemManifesto } from './manifesto.ts';

export interface VideoResolvido {
  readonly cfg: ItemSlot;
  readonly item: ItemManifesto;
  readonly titulo: string;
  readonly provisorio: boolean;
}

export type Render =
  | { readonly tipo: 'video'; readonly itens: readonly VideoResolvido[] }
  | { readonly tipo: 'placeholder' }
  | null;

export const dataBR = (iso: string | null): string =>
  dataValida(iso) ? new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR') : 'data a registrar';

/** Resolve um item: em produção só se liberado; em preview, também se previewOk (com selo). */
export function resolverItem(cfg: ItemSlot): VideoResolvido | null {
  const item = midiaPorId(cfg.midiaId);
  if (!item || item.tipo !== 'video') return null;
  const provisorio = impedimentosMidia(item).length > 0;
  if (EM_PRODUCAO ? provisorio : provisorio && !item.previewOk) return null;
  return { cfg, item, provisorio, titulo: cfg.titulo.replace('{data}', dataBR(item.dataRegistro)) };
}

function resolver(estado: 'vago' | 'preenchido', cfgs: readonly ItemSlot[]): Render {
  if (estado === 'vago') return EM_PRODUCAO ? null : { tipo: 'placeholder' };
  const itens = cfgs.map(resolverItem).filter((v): v is VideoResolvido => v !== null);
  if (itens.length) return { tipo: 'video', itens };
  return EM_PRODUCAO ? null : { tipo: 'placeholder' };
}

export const renderConvite = (): Render =>
  resolver(slots.conviteVideo.estado, slots.conviteVideo.item ? [slots.conviteVideo.item] : []);

export const renderCompilado = (): Render => resolver(slots.compilado.estado, slots.compilado.itens);

export const videoApresentacao = (): VideoResolvido | null =>
  slots.apresentacao.item ? resolverItem(slots.apresentacao.item) : null;

/** Todos os itens configurados (para gerar as trilhas .vtt). */
export const itensConfigurados = (): ItemSlot[] => [
  ...(slots.conviteVideo.item ? [slots.conviteVideo.item] : []),
  ...slots.compilado.itens,
  ...(slots.apresentacao.item ? [slots.apresentacao.item] : []),
];
