/**
 * Lighthouse mobile (emulação padrão: Moto G Power, 4G lento, CPU 4x) no build atual.
 * Metas: Performance ≥ 95, Acessibilidade 100, Best Practices ≥ 95, SEO ≥ 95.
 * Rode sobre o build de PRODUÇÃO (o preview é noindex de propósito e perde pontos de SEO).
 * Também verifica o orçamento de JS (≤ 3 kB gzip na home).
 */
import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync } from 'node:fs';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { subir } from './servidor.ts';

const METAS = { performance: 95, accessibility: 100, 'best-practices': 95, seo: 95 } as const;
const srv = await subir(4396);
const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium',
  chromeFlags: ['--headless=new', '--no-sandbox'],
});
let falhas = 0;
for (const caminho of ['/', '/privacidade/']) {
  const r = await lighthouse(srv.url + caminho, { port: chrome.port, output: 'json', logLevel: 'error' }, {
    extends: 'lighthouse:default',
    settings: { formFactor: 'mobile', onlyCategories: Object.keys(METAS) },
  });
  const cats = r!.lhr.categories;
  const linha = Object.entries(METAS).map(([k, meta]) => {
    const v = Math.round((cats[k]?.score ?? 0) * 100);
    if (v < meta) falhas++;
    return `${k} ${v}${v < meta ? ` (< ${meta})` : ''}`;
  });
  const a = r!.lhr.audits;
  console.log(`${caminho}: ${linha.join(' · ')} | LCP ${a['largest-contentful-paint']?.displayValue} · CLS ${a['cumulative-layout-shift']?.displayValue} · TBT ${a['total-blocking-time']?.displayValue}`);
  for (const [k] of Object.entries(METAS))
    for (const ref of cats[k]?.auditRefs ?? []) {
      const au = a[ref.id];
      if (ref.weight > 0 && au && au.score !== null && au.score < 0.9) console.log(`    - ${k}: ${au.title} (${au.displayValue ?? au.score})`);
    }
}
await chrome.kill();
srv.parar();

// Orçamento de JS: scripts executáveis da home (inline + /_astro/*.js referenciados).
const html = readFileSync('dist/index.html', 'utf8');
let bytes = 0;
for (const m of html.matchAll(/<script(?![^>]*type="application\/ld\+json")([^>]*)>([\s\S]*?)<\/script>/g)) {
  const src = /src="([^"]+)"/.exec(m[1] ?? '')?.[1];
  bytes += gzipSync(src ? readFileSync(`dist${src}`) : Buffer.from(m[2] ?? '')).length;
}
const js = readdirSync('dist/_astro').filter((f) => f.endsWith('.js'));
const kb = (bytes / 1024).toFixed(2);
console.log(`Orçamento de JS (home, gzip): ${kb} kB de 3 kB (${js.length} arquivo(s) em /_astro)`);
if (bytes > 3 * 1024) falhas++;
if (falhas) { console.error(`✖ Lighthouse/orçamento: ${falhas} meta(s) não atingida(s).`); process.exit(1); }
console.log('✔ Lighthouse e orçamento de JS dentro das metas.');
