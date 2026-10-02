// Produção: indexável. Preview/"em revisão": bloqueia buscadores.
import type { APIRoute } from 'astro';
import { EM_PRODUCAO } from '../lib/modo.ts';
export const GET: APIRoute = ({ site }) =>
  new Response(
    EM_PRODUCAO
      ? `User-agent: *\nAllow: /\nDisallow: /_kit/\n\nSitemap: ${new URL('/sitemap.xml', site)}\n`
      : 'User-agent: *\nDisallow: /\n',
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
