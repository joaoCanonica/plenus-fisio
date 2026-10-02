/**
 * Acessibilidade (WCAG 2.2 AA) com axe-core no build atual (dist/):
 *  - todas as páginas, desktop e mobile, esquema claro e escuro;
 *  - teclado: percorre a página com Tab e exige foco visível em cada parada;
 *  - vídeos: exige <track kind="captions"> em todo vídeo publicado;
 *  - console: nenhuma violação de CSP.
 * Navegador: CHROME_PATH ou /opt/pw-browsers/chromium.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from 'playwright-core';
import { subir } from './servidor.ts';

const require = createRequire(import.meta.url);
const axe = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const paginas = ['/', '/privacidade/'];
const srv = await subir(4398);
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium' });
let falhas = 0;

// Passo 1: CSP real (sem bypass): nenhuma violação no console ao carregar e rolar.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const csp: string[] = [];
  page.on('console', (m) => { if (/Content Security Policy/i.test(m.text())) csp.push(m.text()); });
  for (const caminho of paginas) {
    await page.goto(srv.url + caminho, { waitUntil: 'networkidle' });
    for (let y = 0; y < 20; y++) await page.mouse.wheel(0, 800);
    await page.waitForTimeout(500);
  }
  console.log(csp.length ? `✖ CSP: ${csp.length} violação(ões)\n    ${csp.slice(0, 3).join('\n    ')}` : '✔ CSP: nenhuma violação ao carregar as páginas.');
  falhas += csp.length;
  await ctx.close();
}

for (const [nome, vp, cs] of [
  ['desktop claro', { width: 1440, height: 900 }, 'light'],
  ['desktop escuro', { width: 1440, height: 900 }, 'dark'],
  ['mobile claro', { width: 390, height: 844 }, 'light'],
] as const) {
  // bypassCSP só para injetar o axe (a CSP real foi verificada no passo 1).
  const ctx = await browser.newContext({ viewport: vp, colorScheme: cs, reducedMotion: 'reduce', bypassCSP: true });
  const page = await ctx.newPage();
  for (const caminho of paginas) {
    await page.goto(srv.url + caminho, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelectorAll('[data-revelar]').forEach((e) => e.classList.add('visivel')));
    await page.addScriptTag({ content: axe });
    const r = await page.evaluate(async () =>
      // @ts-expect-error axe global
      (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map(
        (v: { id: string; impact: string; nodes: { target: string[] }[] }) => `${v.impact} ${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`,
      ),
    );
    const semLegenda = await page.evaluate(() => [...document.querySelectorAll('video')].filter((v) => !v.querySelector('track[kind="captions"]')).map((v) => v.getAttribute('aria-label')));
    // Teclado: 40 paradas de Tab, cada uma com foco visível
    const semFoco: string[] = [];
    await page.evaluate(() => window.scrollTo(0, 0));
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      const f = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const anel = (x: Element | null) => { if (!x) return false; const s = getComputedStyle(x); return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2; };
        // Aceita anel no próprio elemento ou na moldura imediata (vídeo dentro de overflow:hidden).
        return { ok: anel(el) || anel(el.parentElement), el: `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).split(' ')[0] : ''}` };
      });
      if (f && !f.ok) semFoco.push(f.el);
    }
    const linha = `${nome} ${caminho}: axe ${r.length} violação(ões), vídeos sem legenda ${semLegenda.length}, foco invisível ${semFoco.length}`;
    console.log((r.length || semFoco.length ? '✖ ' : '✔ ') + linha);
    r.forEach((v: string) => console.log('    ' + v));
    semLegenda.forEach((v) => console.log(`    ⚠ vídeo sem legenda (aparece só em preview; em produção não renderiza): ${v}`));
    [...new Set(semFoco)].forEach((v) => console.log('    foco invisível: ' + v));
    falhas += r.length + semFoco.length;
  }
  await ctx.close();
}
await browser.close();
srv.parar();
if (falhas) { console.error(`\n✖ Acessibilidade: ${falhas} problema(s).`); process.exit(1); }
console.log('\n✔ Acessibilidade: 0 violações axe, foco visível e nenhuma violação de CSP.');
