/**
 * Verifica o design system:
 *  1. contraste AA de todos os pares de theme.config.ts (esquemas claro/escuro e tons);
 *  2. nenhuma cor hardcoded em src/ (hex, rgb(), hsl()) fora de src/config/theme.config.ts.
 * Sai com código 1 se algo falhar.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { verificarContraste } from '../src/lib/tema.ts';

let falhas = 0;
console.log('Contraste (WCAG AA)');
for (const r of verificarContraste()) {
  const marca = r.ok ? '✔' : '✖';
  if (!r.ok) falhas++;
  console.log(`  ${marca} ${r.contexto.padEnd(16)} ${r.frente} / ${r.fundo}: ${r.razao.toFixed(2)}:1 (mín. ${r.minimo})`);
}

const PERMITIDO = join('src', 'config', 'theme.config.ts');
const COR = /#[0-9a-fA-F]{3,8}\b(?![\w-])|\brgba?\(|\bhsla?\(/;
function* arquivos(dir: string): Generator<string> {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* arquivos(p);
    else if (/\.(astro|css|ts|tsx|js|mjs|svg)$/.test(p)) yield p;
  }
}
const achados: string[] = [];
for (const arq of arquivos('src')) {
  if (arq === PERMITIDO) continue;
  readFileSync(arq, 'utf8')
    .split('\n')
    .forEach((linha, i) => {
      // Ignora âncoras de URL (#conteudo) e ids: só valores que parecem cor.
      const m = linha.match(COR);
      if (m && !/href=|`#\$|'#'|"#"|#[a-z]+-/.test(linha.slice(Math.max(0, (m.index ?? 0) - 6), (m.index ?? 0) + 2)))
        achados.push(`  ✖ ${arq}:${i + 1}  ${linha.trim().slice(0, 90)}`);
    });
}
console.log(`\nCores hardcoded fora de ${PERMITIDO}: ${achados.length}`);
achados.forEach((a) => console.log(a));
falhas += achados.length;

if (falhas) {
  console.error(`\n✖ Design system: ${falhas} problema(s).`);
  process.exit(1);
}
console.log('\n✔ Design system: AA em todos os pares e nenhuma cor hardcoded.');
