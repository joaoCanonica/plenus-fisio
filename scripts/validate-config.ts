/**
 * Validação do núcleo regulatório.
 *   node scripts/validate-config.ts              relatório; nunca falha (dev/preview)
 *   node scripts/validate-config.ts --relatorio  idem, agrupado (npm run pendencias)
 *   node scripts/validate-config.ts --production falha (código 1) se houver BLOQUEANTE
 */
import { formatarRelatorio, listarPendencias } from '../src/lib/validacao.ts';

const producao = process.argv.includes('--production');
const ps = listarPendencias();
const bloq = ps.filter((p) => p.nivel === 'bloqueante').length;

console.log(formatarRelatorio(ps));
if (producao && bloq) {
  console.error(
    `✖ Produção bloqueada: ${bloq} pendência(s) bloqueante(s) acima.\n` +
      '  Resolva em src/config/*.ts e media.manifest.json, ou use `npm run build:preview`.',
  );
  process.exit(1);
}
console.log(producao ? '✔ Produção liberada.' : `Modo preview: ${bloq} bloqueante(s) não impedem dev/preview.`);
