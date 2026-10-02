import { defineConfig } from 'astro/config';
import type { AstroIntegration } from 'astro';
import { formatarRelatorio, listarPendencias } from './src/lib/validacao.ts';

const SITE_MODE = process.env.SITE_MODE === 'production' ? 'production' : 'preview';

/**
 * Portão de produção: o build com SITE_MODE=production falha enquanto houver
 * pendência BLOQUEANTE. Avisos são apenas listados.
 */
function portaoDePendencias(): AstroIntegration {
  return {
    name: 'portao-de-pendencias',
    hooks: {
      'astro:build:start': ({ logger }) => {
        const ps = listarPendencias();
        const relatorio = formatarRelatorio(ps);
        if (SITE_MODE !== 'production') {
          logger.info(`Build de PREVIEW (selos "PROVISÓRIO" ativos).\n${relatorio}`);
          return;
        }
        if (ps.some((p) => p.nivel === 'bloqueante')) {
          throw new Error(
            `Build de produção bloqueado por pendências.\n${relatorio}\n\n` +
              'Use `pnpm build:preview` para gerar uma versão de revisão.',
          );
        }
        logger.info(`Build de PRODUÇÃO liberado.\n${relatorio}`);
      },
    },
  };
}

export default defineConfig({
  // Domínio: SITE_URL (definitivo) > URL de produção da Vercel > provisório.
  site:
    process.env.SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://example.com'),
  integrations: [portaoDePendencias()],
  build: { inlineStylesheets: 'auto' },
  vite: {
    define: { 'import.meta.env.SITE_MODE': JSON.stringify(SITE_MODE) },
  },
});
