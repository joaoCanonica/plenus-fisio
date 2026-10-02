/**
 * Validação do núcleo regulatório (publicar sem pendência).
 *   node scripts/validate-config.ts              relatório; nunca falha (dev/preview)
 *   node scripts/validate-config.ts --relatorio  idem e regenera o bloco automático de docs/MELHORIAS.md
 *   node scripts/validate-config.ts --production falha (código 1) só se houver BLOQUEANTE:
 *     registro da empresa, RT (nome + CREFITO), WhatsApp real, termo vetado,
 *     mídia referenciada sem consentimento.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { formatarMelhorias, formatarRelatorio, listarPendencias } from '../src/lib/validacao.ts';

const producao = process.argv.includes('--production');
const ps = listarPendencias();
const bloq = ps.filter((p) => p.nivel === 'bloqueante').length;

console.log(formatarRelatorio(ps));

if (process.argv.includes('--relatorio')) {
  const arq = 'docs/MELHORIAS.md';
  const [ini, fim] = ['<!-- auto:inicio -->', '<!-- auto:fim -->'];
  const atual = readFileSync(arq, 'utf8');
  const bloco = `${ini}\n${formatarMelhorias(ps)}\n${fim}`;
  const novo = atual.includes(ini)
    ? atual.slice(0, atual.indexOf(ini)) + bloco + atual.slice(atual.indexOf(fim) + fim.length)
    : atual.replace(/\n## /, `\n${bloco}\n\n## `);
  writeFileSync(arq, novo);
  console.log(`docs/MELHORIAS.md atualizado (${ps.filter((p) => p.nivel !== 'bloqueante').length} sugestão(ões)).`);
}

if (producao && bloq) {
  console.error(
    `✖ Produção bloqueada: ${bloq} item(ns) bloqueante(s) acima.\n` +
      '  Resolva em src/config/profile.config.ts (ou media.manifest.json), ou use `pnpm build:preview`.',
  );
  process.exit(1);
}
console.log(producao ? '✔ Produção liberada.' : `Modo preview: ${bloq} bloqueante(s) não impedem dev/preview.`);
