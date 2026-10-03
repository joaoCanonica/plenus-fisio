import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ site }) => {
  // Só páginas com conteúdo real (sem páginas por bairro). lastmod = data do build.
  const hoje = new Date().toISOString().slice(0, 10);
  const urls = ['/', '/privacidade/'].map((p) => `<url><loc>${new URL(p, site)}</loc><lastmod>${hoje}</lastmod></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
