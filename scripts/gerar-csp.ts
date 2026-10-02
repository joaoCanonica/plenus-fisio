/**
 * Pós-build: injeta uma CSP (meta http-equiv) em cada página, com hash sha256 de
 * cada <script> inline executável. Sem 'unsafe-inline' para scripts.
 * Cabeçalhos que não funcionam via <meta> (frame-ancestors, HSTS etc.) estão no vercel.json.
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { contato } from '../src/config/contato.config.ts';

function* paginas(dir: string): Generator<string> {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* paginas(p);
    else if (p.endsWith('.html')) yield p;
  }
}

const a = contato.analytics;
const origemAnalytics = a.tipo === 'script' ? new URL(a.src).origin : '';
let total = 0;
for (const arq of paginas('dist')) {
  let html = readFileSync(arq, 'utf8').replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, '');
  const hashes = new Set<string>();
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g)) {
    hashes.add(`'sha256-${createHash('sha256').update(m[1] ?? '').digest('base64')}'`);
  }
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${[...hashes].join(' ')} ${origemAnalytics}`.trim(),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "media-src 'self'",
    "font-src 'self'",
    `connect-src 'self' ${origemAnalytics}`.trim(),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
  html = html.replace(/<head>/, `<head><meta http-equiv="Content-Security-Policy" content="${csp}">`);
  writeFileSync(arq, html);
  total++;
}
console.log(`✔ CSP com hashes injetada em ${total} página(s).`);
