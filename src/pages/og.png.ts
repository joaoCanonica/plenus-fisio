// Imagem de compartilhamento (Open Graph, 1200x630) gerada no build a partir do
// theme.config e do lockup vetorial: nenhuma cor fora do tema, nenhuma foto.
import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { theme } from '../config/theme.config.ts';
import lockup from '../../assets-originais/marca/derivados/lockup-horizontal.svg?raw';

export const GET: APIRoute = async () => {
  const { verdeMarca, offWhiteClaro, areiaSuave } = theme.primitivas;
  const interno = lockup
    .slice(lockup.indexOf('>', lockup.indexOf('<svg')) + 1, lockup.lastIndexOf('</svg>'))
    .replace(/<title[^>]*>[\s\S]*?<\/title>/, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${verdeMarca}"/>
  <ellipse cx="1040" cy="315" rx="230" ry="320" fill="none" stroke="${areiaSuave}" stroke-opacity="0.25" stroke-width="3"/>
  <g transform="translate(120 170) scale(1.75)" style="color:${offWhiteClaro}" fill="${offWhiteClaro}">${interno}</g>
  <text x="120" y="500" font-family="Figtree, 'DejaVu Sans', sans-serif" font-size="40" fill="${offWhiteClaro}">Fisioterapia e Pilates em Lages (SC)</text>
</svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
