# Conformidade: estado técnico e checklist humano

Atualizado em 2026-10-03.

## Verificações automáticas

| Verificação | Script | Quando roda | Resultado |
|---|---|---|---|
| Só os bloqueantes impedem a produção: registro da empresa, RT (nome + CREFITO), WhatsApp real; e também termo vetado ou mídia referenciada sem consentimento | `scripts/validate-config.ts --production` + portão em `astro.config.ts` | `pnpm build` | ✔ hoje bloqueia **só** pelos 3 itens (o RT conta como nome e CREFITO) |
| Termos vetados no HTML final e em todo o copy | `audit-compliance.ts`, `validacao.ts` | todo build | ✔ 0 |
| Identificação da pessoa jurídica em toda página (nome fantasia, registro da empresa, RT com CREFITO) | `audit-compliance.ts --production` | `pnpm build` | ✔ |
| Nenhum nome de profissional sem CREFITO | `audit-compliance.ts` + `equipeVisivel()` | todo build | ✔ |
| Mídia publicada com consentimento; vídeo com data do registro e profissional identificado | `audit-compliance.ts --production` (`impedimentosMidia`) | `pnpm build` | ✔ (nenhuma mídia publicada ainda) |
| Contraste AA e nenhuma cor fora do `theme.config.ts` | `validate-theme.ts` | todo build | ✔ |
| CSP com hash dos scripts inline | `gerar-csp.ts` | todo build | ✔ |
| Schema (JSON-LD) válido e NAP consistente (página, schema, `llms.txt`) | `audit-seo.ts` | `pnpm build` | ✔ |
| Acessibilidade: axe-core (claro/escuro/mobile), foco visível, legendas, CSP | `pnpm audit:a11y` | manual | ✔ 0 violações |
| Lighthouse mobile (metas 95/100/95/95) e orçamento de JS (≤ 3 kB) | `pnpm audit:lighthouse` | manual, sobre `pnpm build` | ✔ home 100/100/100/100 (LCP 1,5 s, CLS 0,001, TBT 0 ms); privacidade 100/100/100/100; JS 1,86 kB gzip |
| Nenhum request a terceiros antes (ou depois) do consentimento | navegador (registro de rede) | manual | ✔ 0 |

Lighthouse e a produção foram medidos com dados fictícios nos 3 bloqueantes (restaurados depois).

## Checklist humano antes do go-live

### Bloqueantes (o site não vai para produção sem eles)
- [ ] Número do **registro da empresa** no CREFITO-10.
- [ ] **Responsável técnico**: nome completo e CREFITO.
- [ ] **WhatsApp** real de pelo menos um canal.

### Registro e títulos
- [ ] Nome completo e CREFITO de cada profissional que vai aparecer.
- [ ] Título de especialista só com registro e RQE.
- [ ] Conferir a região do CREFITO (CREFITO-10, SC).

### Consentimentos e autorizações (guardar fora do repositório, que é público)
- [x] Autorização de uso de imagem dos profissionais (confirmada pelo cliente em 2026-10-04).
- [ ] TCLE de cada mídia com paciente (com `tcleRef` e `dataRegistro` no manifesto).
- [ ] Vídeos de pacientes guardados em armazenamento privado (não vão para o git).
- [ ] Autorização formal para conteúdo de terceiros (ex.: instrutora do curso).

### Privacidade
- [ ] Revisão da política (`/privacidade`) por quem responde juridicamente.
- [ ] Hospedagem citada na política (Vercel) e e-mail de privacidade, se houver.

### Normas do conselho
- [ ] Conferência das resoluções vigentes do COFFITO e das normas do CREFITO-10 (registrar a data em `docs/pesquisa/regulacao-coffito.md`).

## Go-live (Vercel)
1. Preencher os bloqueantes em `src/config/profile.config.ts` e rodar `pnpm build` (precisa sair verde).
2. No projeto `plenus-fisio` na Vercel, ambiente **Production**: `SITE_ENV=production` e `SITE_URL=https://<domínio>`.
3. Adicionar o domínio (e o `www`, que redireciona para o domínio principal via `vercel.json`).
4. Novo deploy: o build de produção roda todas as auditorias e falha se algo bloquear.
