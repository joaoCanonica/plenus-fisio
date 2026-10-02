// Favicon gerado a partir do theme.config (nenhuma cor fora dele): oval da marca.
import type { APIRoute } from 'astro';
import { theme } from '../config/theme.config.ts';

export const GET: APIRoute = () => {
  const { verdeMarca, offWhiteClaro } = theme.primitivas;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><title>Plenus Fisioterapia &amp; Pilates</title><rect width="32" height="32" rx="8" fill="${verdeMarca}"/><ellipse cx="16" cy="16" rx="9" ry="12.5" fill="none" stroke="${offWhiteClaro}" stroke-width="2.2"/></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
};
