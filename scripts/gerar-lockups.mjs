// Lockups vetoriais PROVISÓRIOS do logo da Plenus, a partir do original de 150x150.
// - Palavra PLENUS: vetorizada com potrace (assets-originais/marca/derivados/plenus-palavra-trace.svg).
// - Oval: reconstruída geometricamente (proporção medida no original, ~0,72).
// - "Fisioterapia & Pilates": texto em Lato (fonte do site); no original é ilegível para vetorizar.
// - Figuras: NÃO incluídas (a vetorização não ficou fiel; ver docs/marca/LOGO.md).
// Uso: node scripts/gerar-lockups.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const DIR = 'assets-originais/marca/derivados';
const trace = readFileSync(`${DIR}/plenus-palavra-trace.svg`, 'utf8');
const g = trace.slice(trace.indexOf('<g '), trace.lastIndexOf('</g>') + 4).replace(/fill="#000000"/, 'fill="currentColor"');
// Palavra no sistema do trace: 2160 x 560 → escala para largura w.
const palavra = (x, y, w) => `<g transform="translate(${x} ${y}) scale(${w / 2160})">${g}</g>`;
const sub = (x, y, size, anchor = 'middle') =>
  `<text x="${x}" y="${y}" font-family="Lato, 'Segoe UI', sans-serif" font-size="${size}" letter-spacing="${size * 0.08}" text-anchor="${anchor}" fill="currentColor">FISIOTERAPIA &amp; PILATES</text>`;

/** Oval com aberturas laterais (como no original), de y1 a y2. */
function oval(cx, cy, rx, ry, y1, y2, sw) {
  const xAt = (y) => rx * Math.sqrt(1 - ((y - cy) / ry) ** 2);
  const a = xAt(y1), b = xAt(y2);
  return `<path d="M${cx - a} ${y1} A${rx} ${ry} 0 0 1 ${cx + a} ${y1} M${cx + b} ${y2} A${rx} ${ry} 0 0 1 ${cx - b} ${y2}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round"/>`;
}

const svg = (w, h, cor, corpo, titulo) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t" style="color:${cor}">\n<title id="t">${titulo}</title>\n${corpo}\n</svg>\n`;

const T = 'Plenus Fisioterapia &amp; Pilates';
const VERDE = '#457147'; // amostrado do logo (ver docs/marca/LOGO.md)
const CLARO = '#fdfcf9';

// Oval (lockup vertical): oval + PLENUS + subtítulo.
const corpoOval = [oval(200, 280, 172, 250, 225, 390, 4), palavra(40, 228, 320), sub(200, 345, 17)].join('\n');
writeFileSync(`${DIR}/lockup-oval.svg`, svg(400, 560, VERDE, corpoOval, T));
writeFileSync(`${DIR}/lockup-oval-mono-escuro.svg`, svg(400, 560, '#1f2421', corpoOval, T));
writeFileSync(`${DIR}/lockup-oval-mono-claro.svg`, svg(400, 560, CLARO, corpoOval, T));
// Só oval (símbolo, sem texto) para favicon/avatar: oval fechada.
writeFileSync(`${DIR}/simbolo-oval.svg`, svg(120, 160, VERDE, `<ellipse cx="60" cy="80" rx="54" ry="75" fill="none" stroke="currentColor" stroke-width="5"/>`, T));
// Horizontal: oval fechada + PLENUS + subtítulo à direita.
const corpoH = [`<ellipse cx="48" cy="60" rx="40" ry="55" fill="none" stroke="currentColor" stroke-width="3.5"/>`, palavra(112, 4, 280), sub(116, 110, 14, 'start')].join('\n');
writeFileSync(`${DIR}/lockup-horizontal.svg`, svg(430, 120, VERDE, corpoH, T));
writeFileSync(`${DIR}/lockup-horizontal-mono-escuro.svg`, svg(430, 120, '#1f2421', corpoH, T));
writeFileSync(`${DIR}/lockup-horizontal-mono-claro.svg`, svg(430, 120, CLARO, corpoH, T));
console.log('✔ lockups gerados em', DIR);
