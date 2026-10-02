# Conformidade: checklist para validação humana

Os itens abaixo dependem de pessoas e documentos; o código não consegue verificá-los.
Estado técnico: rode `pnpm pendencias`.

## Verificações automáticas (rodam em todo build)
| Verificação | Script |
|---|---|
| Pendências bloqueantes impedem produção | `scripts/validate-config.ts --production` |
| Termos vetados no HTML final, identificação em toda página | `scripts/audit-compliance.ts` |
| Mídia publicada só com liberação; vídeo de menor só com TCLE; vínculos só com autorização | `scripts/audit-compliance.ts --production` |
| Contraste AA e nenhuma cor hardcoded | `scripts/validate-theme.ts` |
| CSP com hash nos scripts inline | `scripts/gerar-csp.ts` |
| Acessibilidade: axe-core, foco por teclado, legendas | `pnpm audit:a11y` |
| Lighthouse mobile e orçamento de JS | `pnpm audit:lighthouse` |

## Pendências para validação humana

### Bloqueantes (produção não sai sem elas)
- [ ] Número do **registro da empresa** (Plenus) no CREFITO-10.
- [ ] Nome completo e CREFITO do **responsável técnico**.
- [ ] **WhatsApp** real de pelo menos um canal.

### Registro dos profissionais
- [ ] Nome completo e CREFITO de cada profissional citado (sem número, o nome não aparece).
- [ ] Título de especialista / RQE, se houver.

### Consentimentos e autorizações (guardar fora do repositório)
- [ ] TCLE de cada mídia com paciente (`tcleRef` no manifesto).
- [ ] Autorização formal para conteúdo de terceiros.

### Privacidade
- [ ] Revisão da política (`/privacidade`) por quem responde juridicamente.
- [ ] E-mail para pedidos de privacidade (opcional).
- [ ] Hospedagem definitiva citada na política.

### Normas do conselho
- [ ] Conferência final das resoluções vigentes do COFFITO com o CREFITO-10 antes do go-live (registrar em `docs/pesquisa/regulacao-coffito.md`).

## Go-live
1. Resolver os bloqueantes.
2. Na Vercel: definir `SITE_ENV=production` (e `SITE_URL=https://dominio`) no ambiente Production.
3. Apontar o domínio e fazer novo deploy: o build de produção roda todas as auditorias e falha se algo bloquear.
