# Regulação da publicidade (COFFITO) e LGPD

**Status:** resumo de trabalho. **Conferir o texto vigente** das resoluções no site do COFFITO e as normas do CREFITO-10 (SC) antes do go-live e registrar aqui a data da conferência.

| Norma | Ponto aplicado no site | Onde está implementado |
|---|---|---|
| Res. COFFITO 424/2013 (Código de Ética) | identificação (PJ: nome, registro da empresa no CREFITO, RT; profissionais: nome completo + CREFITO); proibição de promessa de resultado, preço, sensacionalismo | `src/components/Identificacao.astro`, `scripts/audit-compliance.ts` |
| Res. COFFITO 532/2021 | imagem de paciente só com TCLE; data do registro e identificação junto à publicação | `media.manifest.json`, `src/lib/validacao.ts`, `src/lib/slots.ts` |
| Especialidade / RQE | "especialista" só com título registrado e RQE | `profile.especialista` + `compliance.termoEspecialista` |
| LGPD, art. 11 e 14 | dado de saúde é sensível; menor: consentimento do responsável legal | sem formulário; TCLE fora do repo; `pacienteRef` |
| LGPD / cookies | não essenciais só após aceite; Aceitar e Recusar com o mesmo peso | `src/components/Consentimento.astro` |

Conferência do texto vigente: **pendente** (responsável: RT da clínica / assessoria).
"Antes e depois": **desligado** (`compliance.antesDepois = false`).
