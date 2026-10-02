// Derivados 2x (300x300) dos avatares: reamostragem Lanczos + nitidez leve.
// Sem super-resolução generativa nem "restauração de rosto". Originais intactos.
// Uso: node scripts/derivar-avatares.mjs
import sharp from 'sharp';

const ITENS = [
  ['assets-originais/pessoa/foto-a-original.jpg', 'assets-originais/pessoa/derivados/foto-a-300'],
  ['assets-originais/pessoa/foto-b-original.jpg', 'assets-originais/pessoa/derivados/foto-b-300'],
];

for (const [orig, saida] of ITENS) {
  const base = sharp(orig)
    .resize(300, 300, { kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.6, m1: 0.5, m2: 1 }); // nitidez leve; sem withMetadata(): EXIF descartado
  await base.clone().webp({ quality: 82 }).toFile(`${saida}.webp`);
  await base.clone().avif({ quality: 55 }).toFile(`${saida}.avif`);
  await base.clone().jpeg({ quality: 85, mozjpeg: true }).toFile(`${saida}.jpg`);
  console.log(`✔ ${saida}.{webp,avif,jpg}`);
}
