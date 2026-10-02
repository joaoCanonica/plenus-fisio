import { aviso } from './campo.ts';

/**
 * Contato, privacidade e medição.
 * - Não há formulário: contato só por WhatsApp/Instagram (nenhum dado de saúde coletado no site).
 * - analytics: 'nenhum' por padrão. Com outro tipo, o banner pede consentimento
 *   (Aceitar/Recusar/Personalizar) e o script só carrega após o aceite.
 */
export type Analytics =
  | { readonly tipo: 'nenhum' }
  | { readonly tipo: 'script'; readonly nome: string; readonly src: string; readonly dominio: string };

export const contato = {
  analytics: { tipo: 'nenhum' } as Analytics,

  /** Pedido de retirada de imagem/vídeo (revogação do TCLE). Mensagem neutra, sem dado de saúde. */
  revogacao: {
    mensagemWhatsapp:
      'Olá, quero solicitar a retirada de uma imagem ou vídeo publicado no site (revogação do consentimento).',
    prazo: 'O conteúdo é retirado do site em até 5 dias úteis após o pedido.',
  },

  /** E-mail para pedidos formais de privacidade (opcional). */
  emailPrivacidade: aviso<string | null>(null, 'Informar um e-mail para pedidos de privacidade (opcional; hoje o canal é o WhatsApp).'),
} as const;
