import { contato } from '../config/contato.config.ts';
import { clinica } from '../config/profile.config.ts';
import { identificacaoPJ, numeroWhatsapp } from './clinica.ts';

export { telefoneExibicao, whatsappUrl } from './clinica.ts';

export const instagramUser = (): string | null => clinica.instagram.valor || null;
export const instagramUrl = (u: string | null = instagramUser()): string | null =>
  u ? `https://www.instagram.com/${u}/` : null;

/** Linha de identificação exigida pelo COFFITO (pessoa jurídica). */
export const identificacao = (): string => identificacaoPJ();

/** WhatsApp para pedido de retirada de imagem/vídeo (revogação do TCLE). */
export const revogacaoUrl = (): string =>
  `https://wa.me/${numeroWhatsapp()}?text=${encodeURIComponent(contato.revogacao.mensagemWhatsapp)}`;
