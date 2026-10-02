// Build na Vercel: o site só vira produção com SITE_ENV=production (variável
// definida no painel quando tudo estiver confirmado). Sem ela, publica a versão
// "em revisão": noindex, robots bloqueado e faixa visível.
import { execSync } from 'node:child_process';
const alvo = process.env.SITE_ENV === 'production' ? 'build' : 'build:preview';
console.log(`SITE_ENV=${process.env.SITE_ENV ?? '(vazio)'} → pnpm ${alvo}`);
execSync(`pnpm run ${alvo}`, { stdio: 'inherit' });
