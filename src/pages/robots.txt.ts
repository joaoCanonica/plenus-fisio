// Produção: indexável, inclusive por crawlers de IA que respeitam robots.txt
// (GEO). Preview/"em revisão": bloqueia tudo.
import type { APIRoute } from 'astro';
import { EM_PRODUCAO } from '../lib/modo.ts';

/** Crawlers de busca e de IA liberados explicitamente (documentam respeitar robots.txt). */
const CRAWLERS_IA = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'];

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap.xml', site);
  const corpo = EM_PRODUCAO
    ? [
        'User-agent: *',
        'Allow: /',
        'Disallow: /_kit/',
        '',
        ...CRAWLERS_IA.flatMap((b) => [`User-agent: ${b}`, 'Allow: /', 'Disallow: /_kit/', '']),
        `Sitemap: ${sitemap}`,
        '',
      ].join('\n')
    : 'User-agent: *\nDisallow: /\n';
  return new Response(corpo, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
