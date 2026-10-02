# Site · Plenus Fisioterapia & Pilates (Lages/SC)

Landing page da clínica: mostra o que a Plenus faz e leva a pessoa a agendar uma
consulta fisioterapêutica pelo WhatsApp. Não agenda online e não coleta dado de saúde.
Astro + TypeScript strict, JS mínimo, sem nenhum request a terceiros sem consentimento.
Regras do projeto: `CLAUDE.md`. Estado e decisões: `docs/AUDITORIA.md`, `docs/ARQUITETURA.md`.

## Comandos
| Comando | O que faz |
|---|---|
| `pnpm dev` | desenvolvimento (selos PROVISÓRIO, slots vagos desenhados, `/pendencias`, `/_kit`) |
| `pnpm build:preview` | build "em revisão": `noindex`, robots bloqueado, faixa de aviso, mídia `previewOk` |
| `pnpm build` | build de **produção**: falha com mensagem clara se houver pendência BLOQUEANTE |
| `pnpm build:vercel` | o que a Vercel roda: produção só com `SITE_ENV=production`, senão "em revisão" |
| `pnpm pendencias` | relatório agrupado (identidade, consentimentos, autorizações, vídeos, legendas…) |
| `pnpm check` | typecheck, design system (AA + cores) e validação do manifesto de mídia |
| `pnpm audit:a11y` | axe-core (claro/escuro/mobile), foco por teclado, legendas, CSP |
| `pnpm audit:lighthouse` | Lighthouse mobile (metas 95/100/95/95) + orçamento de JS. Rodar depois de `pnpm build` |
| `pnpm audit:compliance` | termos vetados, identificação, mídia e vínculos no HTML final |

Node 22 (`.nvmrc`, `engines`), pnpm 10.28 (`packageManager`).
Navegador das auditorias: `CHROME_PATH` ou `/opt/pw-browsers/chromium`.

## Onde editar (tudo em `src/config/`)
| Arquivo | Conteúdo |
|---|---|
| `profile.config.ts` | nome, CREFITO, títulos, RQE, vínculos, unidades, WhatsApp, Instagram. Cada campo é `confirmado()`, `bloqueante()` ou `aviso()` |
| `copy.config.ts` | todos os textos (hoje só o mínimo neutro), com as fontes das afirmações clínicas |
| `compliance.config.ts` | perfil COFFITO: termos vetados, identificação, antes e depois, menores |
| `theme.config.ts` | o **único** lugar com cores; tokens semânticos, esquemas claro/escuro, pares AA |
| `slots-video.config.ts` | slots de vídeo (convite, atendimentos com capítulos, apresentação) |
| `instagram.config.ts` | até 6 publicações locais (sem embed) |
| `contato.config.ts` | analytics (desligado), canal de revogação do TCLE |

Mídia: `assets-originais/` (originais intactos) + `media.manifest.json` (só `pacienteRef`, nunca nome) + `scripts/prepare-media.mjs`.
Pesquisa de conteúdo de saúde: `docs/pesquisa/`. Conformidade: `docs/COMPLIANCE.md`.

## Vídeos: como preencher um slot
1. Coloque o original em `assets-originais/videos/` e cadastre-o em `media.manifest.json` (com `pacienteRef`, `tcleRef`, `dataRegistro`, `legenda` e derivados MP4/WebM/poster/.vtt em `assets-originais/videos/derivados/`).
2. Em `src/config/slots-video.config.ts`: mude `estado` para `'preenchido'` e preencha `midiaId`, um `titulo` neutro (`{data}` vira a data do registro) e os `capitulos`.
3. Rode `pnpm pendencias`. Se faltar algo, a produção bloqueia e o preview mostra o vídeo com selo PROVISÓRIO.

## Deploy (Vercel)
- Projeto ligado ao GitHub. `vercel.json` define install/build, cabeçalhos de segurança, redirect www → domínio principal e cache.
- Sem `SITE_ENV=production`, todo deploy sai **em revisão** (`noindex`, robots `Disallow: /`, faixa amarela).
- Go-live: no painel, definir `SITE_ENV=production` e `SITE_URL=https://dominio` (ambiente Production), apontar o domínio e fazer um novo deploy.

