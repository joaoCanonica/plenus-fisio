# Plenus Fisioterapia & Pilates — regras do projeto

Landing page da Plenus Fisioterapia & Pilates (Lages/SC). Profissionais: Adrian (dono) e Natalia.
Objetivo: mostrar o que a clínica faz, de forma clara e agradável, e levar a pessoa a agendar uma
**consulta fisioterapêutica pelo WhatsApp**. Não é site de agendamento online e não coleta dado de saúde.

## Regras inegociáveis
Base: COFFITO Res. 424/2013 e 532/2021 e normas dos CREFITOs (conferir o texto vigente antes do go-live).

- **Identificação PJ:** nome da clínica, nº do registro da empresa no CREFITO, nome e CREFITO do
  responsável técnico (RT). Só a PJ usa nome fantasia. Profissional citado = nome completo + CREFITO;
  sem número, o nome não aparece.
- **Proibido:** preço, valor, pacote, promoção, desconto, oferta, "grátis", promessa/garantia de
  resultado ou cura, sensacionalismo, superlativos ("a melhor", "referência"), "especialista" sem
  título registrado e RQE.
- **Vocabulário:** "consulta fisioterapêutica" (não "avaliação"), "atendimento" (não "sessão"),
  "paciente" (não "aluno"), "plano terapêutico" (não "treino"). Pilates: regra própria (Prompt 2).
- **Mídia de pacientes:** só com TCLE escrito e revogável, com data do registro e nome + CREFITO do
  profissional na publicação. Sem exposição íntima/vexatória; nunca diagnóstico, cirurgia ou dado
  clínico identificável. Conteúdo de terceiros só com autorização formal.
- **Antes e depois:** desligado por padrão; se ligado, exibir "o resultado não é garantido nem igual".
- **LGPD:** cookies não essenciais só após consentimento (Aceitar/Recusar em pé de igualdade);
  Instagram e mapas bloqueados até o aceite; fontes self-hosted; nenhum formulário com dado de saúde;
  WhatsApp com mensagem neutra.
- **Conteúdo de saúde:** fontes primárias (OMS, Ministério da Saúde, FEBRASGO, SBP, Cochrane,
  PubMed/SciELO, entidades de fisioterapia), registradas em `docs/pesquisa/<tema>.md` com fonte, data
  e nível de evidência. Sem evidência, não afirmar.
- **Publicar sem pendência:** campos `opcional()` vazios ocultam o trecho/seção. Bloqueantes para
  produção, e só estes: (1) nº do registro da empresa no CREFITO; (2) nome e CREFITO do RT;
  (3) WhatsApp real de pelo menos um canal. O resto é aviso → `docs/MELHORIAS.md`.
- **Mídia provisória:** sem TCLE/autorização só aparece em preview, com selo "PROVISÓRIO"; nunca em
  produção. Edição: só recorte e cobertura de identificadores/textos; sem retoque nem restauração
  generativa de rosto.
- **Privacidade no repo:** nenhum nome ou dado de paciente (usar `pacienteRef`).
- **Stack:** Astro + TypeScript strict, JS mínimo, Node e pnpm fixados, WCAG 2.2 AA, tema
  claro/escuro com seletor, `prefers-reduced-motion`.
- **Identidade visual:** verde da marca Plenus, off-white e areia. Não reutilizar assinaturas visuais
  de sites anteriores (vinho/coluna, arco, curva, linha).
