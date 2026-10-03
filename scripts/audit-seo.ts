/**
 * Auditoria de SEO/GEO sobre o build de PRODUÇÃO (dist/):
 *  1. title e description (tamanho), canonical absoluto, Open Graph com imagem 1200x630;
 *  2. JSON-LD válido: @graph com Physiotherapy+LocalBusiness (campos obrigatórios),
 *     Person só para o RT e profissionais visíveis (com CREFITO), FAQPage igual ao
 *     FAQ visível, BreadcrumbList sequencial;
 *  3. consistência NAP: nome, endereço, CEP, telefone e horários do schema aparecem
 *     iguais no texto visível e no llms.txt;
 *  4. robots.txt com sitemap e crawlers de IA; sitemap só com páginas existentes.
 * Uso: node --experimental-strip-types scripts/audit-seo.ts [dist]
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { clinica } from '../src/config/profile.config.ts';
import { equipeVisivel, enderecoTexto, horariosTexto, responsavelTecnico, telefoneExibicao } from '../src/lib/clinica.ts';

const dist = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? 'dist';
const erros: string[] = [];
const erro = (m: string) => erros.push(m);

function* paginas(dir: string): Generator<string> {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* paginas(p);
    else if (p.endsWith('index.html') && !p.includes('/_kit/') && !p.includes('/pendencias/')) yield p;
  }
}
const decodificar = (s: string) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const visivel = (html: string) =>
  decodificar(html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
const meta = (html: string, chave: string) =>
  decodificar(html.match(new RegExp(`<meta (?:name|property)="${chave}" content="([^"]*)"`))?.[1] ?? '');

type No = Record<string, unknown>;
const tipos = (n: No): string[] => ([] as unknown[]).concat(n['@type'] ?? []).map(String);

const rt = responsavelTecnico();
const pessoasEsperadas = new Set([rt.nome, ...equipeVisivel().map((p) => p.nomeCompleto)]);
let telefoneSchema = '';

for (const arq of paginas(dist)) {
  const html = readFileSync(arq, 'utf8');
  const texto = visivel(html);
  const titulo = decodificar(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
  const desc = meta(html, 'description');
  if (titulo.length < 15 || titulo.length > 65) erro(`${arq}: title com ${titulo.length} caracteres ("${titulo}").`);
  if (desc.length < 70 || desc.length > 170) erro(`${arq}: description com ${desc.length} caracteres.`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical || !/^https:\/\//.test(canonical)) erro(`${arq}: canonical ausente ou não absoluto.`);
  if (!meta(html, 'og:image').endsWith('/og.png')) erro(`${arq}: og:image ausente.`);
  for (const k of ['og:title', 'og:description', 'og:url', 'og:site_name']) if (!meta(html, k)) erro(`${arq}: ${k} ausente.`);

  const blocos = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]!);
  if (blocos.length !== 1) { erro(`${arq}: esperado 1 bloco JSON-LD, achados ${blocos.length}.`); continue; }
  let doc: No;
  try { doc = JSON.parse(blocos[0]!); } catch (e) { erro(`${arq}: JSON-LD inválido (${(e as Error).message}).`); continue; }
  if (doc['@context'] !== 'https://schema.org') erro(`${arq}: @context inválido.`);
  const grafo = (doc['@graph'] ?? []) as No[];
  const ids = new Set(grafo.map((n) => n['@id']).filter(Boolean));

  // Clínica
  const cl = grafo.find((n) => tipos(n).includes('Physiotherapy'));
  if (!cl) { erro(`${arq}: sem nó Physiotherapy.`); continue; }
  if (!tipos(cl).includes('LocalBusiness')) erro(`${arq}: clínica sem tipo LocalBusiness.`);
  for (const k of ['name', 'url', 'telephone', 'address', 'identifier', 'image']) if (!cl[k]) erro(`${arq}: clínica sem "${k}".`);
  const end = cl['address'] as No;
  for (const k of ['streetAddress', 'addressLocality', 'addressRegion', 'postalCode', 'addressCountry']) if (!end?.[k]) erro(`${arq}: address sem "${k}".`);
  telefoneSchema = String(cl['telephone'] ?? '');
  if (!/^\+55 \d{2} \d{8,9}$/.test(telefoneSchema)) erro(`${arq}: telephone fora do padrão (+55 DD número): "${telefoneSchema}".`);
  for (const ref of (cl['employee'] ?? []) as No[]) if (!ids.has(ref['@id'])) erro(`${arq}: employee aponta para @id inexistente.`);

  // Pessoas: só elegíveis, todas com CREFITO
  const pessoas = grafo.filter((n) => tipos(n).includes('Person'));
  for (const p of pessoas) {
    const nome = String(p['name']);
    if (!pessoasEsperadas.has(nome)) erro(`${arq}: Person "${nome}" não é RT nem profissional visível.`);
    const id = p['identifier'] as No | undefined;
    if (id?.['propertyID'] !== 'CREFITO' || !/^CREFITO-\d+ \S+$/.test(String(id?.['value']))) erro(`${arq}: Person "${nome}" sem CREFITO no identifier.`);
  }
  if (pessoas.length !== pessoasEsperadas.size) erro(`${arq}: ${pessoas.length} Person no schema, esperado ${pessoasEsperadas.size}.`);

  // NAP: o que está no schema aparece igual na página
  const nap: [string, string][] = [
    ['nome', String(cl['name'])],
    ['rua', String(end['streetAddress']).split(',')[0]!],
    ['CEP', String(end['postalCode'])],
    ['cidade', String(end['addressLocality'])],
    ['telefone', telefoneExibicao()],
  ];
  const h = horariosTexto();
  if (h) nap.push(['horários', h]);
  for (const [rotulo, v] of nap) if (!texto.includes(v)) erro(`${arq}: ${rotulo} do schema ("${v}") não aparece no texto visível.`);
  if (!texto.includes(enderecoTexto())) erro(`${arq}: endereço completo do site difere do texto visível.`);

  // FAQ
  const faq = grafo.find((n) => tipos(n).includes('FAQPage'));
  const perguntasVisiveis = [...html.matchAll(/<summary[^>]*>\s*<h3[^>]*>([^<]+)<\/h3>/g)].map((m) => decodificar(m[1]!.trim()));
  if (faq) {
    const ps = ((faq['mainEntity'] ?? []) as No[]).map((q) => String(q['name']));
    if (ps.join('|') !== perguntasVisiveis.join('|')) erro(`${arq}: FAQPage difere do FAQ visível.`);
    for (const q of (faq['mainEntity'] ?? []) as No[]) if (!(q['acceptedAnswer'] as No)?.['text']) erro(`${arq}: pergunta sem resposta no FAQPage.`);
  } else if (perguntasVisiveis.length) erro(`${arq}: FAQ visível sem FAQPage.`);

  // Breadcrumb
  const bc = grafo.find((n) => tipos(n).includes('BreadcrumbList'));
  const itens = ((bc?.['itemListElement'] ?? []) as No[]);
  if (!itens.length || itens.some((it, i) => it['position'] !== i + 1 || !String(it['item']).startsWith('https://'))) erro(`${arq}: BreadcrumbList inválido.`);
}

// OG image
const og = join(dist, 'og.png');
if (!existsSync(og)) erro('og.png não gerada.');
else {
  const m = await sharp(og).metadata();
  if (m.width !== 1200 || m.height !== 630) erro(`og.png com ${m.width}x${m.height} (esperado 1200x630).`);
}

// robots, sitemap, llms.txt
const robots = existsSync(join(dist, 'robots.txt')) ? readFileSync(join(dist, 'robots.txt'), 'utf8') : '';
if (!/^Sitemap: https:\/\//m.test(robots)) erro('robots.txt sem Sitemap absoluto.');
for (const b of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) if (!robots.includes(`User-agent: ${b}`)) erro(`robots.txt sem ${b}.`);
const sitemap = existsSync(join(dist, 'sitemap.xml')) ? readFileSync(join(dist, 'sitemap.xml'), 'utf8') : '';
for (const loc of sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)) {
  if (!existsSync(join(dist, loc[1]!, 'index.html'))) erro(`sitemap aponta para página inexistente: ${loc[1]}`);
}
const llms = existsSync(join(dist, 'llms.txt')) ? readFileSync(join(dist, 'llms.txt'), 'utf8') : '';
for (const v of [clinica.nomeFantasia.valor, enderecoTexto(), telefoneExibicao(), rt.nome]) if (!llms.includes(v)) erro(`llms.txt sem "${v}".`);

if (erros.length) {
  erros.forEach((e) => console.error(`✖ ${e}`));
  console.error(`\n✖ Auditoria de SEO: ${erros.length} problema(s).`);
  process.exit(1);
}
console.log(`✔ Auditoria de SEO: schema válido, NAP consistente entre página, schema e llms.txt (telefone ${telefoneSchema}), robots e sitemap ok.`);
