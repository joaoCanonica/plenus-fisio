# Arquitetura: landing da Plenus Fisioterapia & Pilates

Astro 7 + TypeScript strict, saída estática. Node 22 (`.nvmrc`), pnpm 10.28 (`packageManager`).
Sem framework de UI no cliente. Nenhum request a terceiros sem consentimento.

## Estrutura atual
```
assets-originais/{marca,pessoa,espaco,videos}/   # mídia bruta. NUNCA publicada. Nomes = pacienteRef
media.manifest.json                              # fonte da verdade da mídia (vazio)
public/midia/                                    # gerado por prepare-media (gitignored)
src/
  config/
    campo.ts               # Campo<T>: confirmado | pendente(bloqueante|aviso)
    profile.config.ts      # identificação (hoje: shape de pessoa física; ver proposta abaixo)
    compliance.config.ts   # COFFITO: termos vetados, vocabulário, especialista, antes e depois
    copy.config.ts         # textos (mínimo neutro)
    contato.config.ts      # analytics (nenhum), revogação do TCLE
    slots-video.config.ts  # slots de vídeo (vagos)
    instagram.config.ts    # até 6 posts locais, sem embed
    theme.config.ts        # único lugar com cores (paleta provisória)
  lib/      validacao.ts · manifesto.ts · slots.ts · modo.ts · tema.ts · contato.ts · secoes.ts
  components/ + components/ui/
  layouts/Base.astro
  pages/    index · privacidade · [interna] (/pendencias, só preview) · [kit] (/_kit) · midia/[faixa].vtt · robots · sitemap
scripts/    validate-config · validate-theme · prepare-media · gerar-csp · audit-compliance · audit-a11y · audit-lighthouse · build-vercel
docs/       AUDITORIA · ARQUITETURA · COMPLIANCE · MELHORIAS · pesquisa/<tema>.md
```

### Fluxo de build
`validate-config (--production)` → `validate-theme` → `prepare-media` → `astro build` (portão de pendências em `astro.config.ts`) → `gerar-csp` → `audit-compliance`.
Preview nunca falha por pendência; produção falha só com BLOQUEANTE.

## Núcleo de CLÍNICA (implementado)

| Peça | Onde |
|---|---|
| `confirmado()` / `opcional()` / `bloqueante()` / `aviso()` | `src/config/campo.ts`. `opcional` vazio some e nunca gera pendência (vira melhoria) |
| Dados: `clinica`, `equipe[]`, `areas[]`, `pilates`, `recursos[]`, `atendimentoRapido`, `vinculos` | `src/config/profile.config.ts` |
| Regras de exibição: `equipeVisivel()`, `modoEquipe()`, `variante()`, `areasAtivas()`, `resumoPilates()`, roteamento do WhatsApp, identificação PJ | `src/lib/clinica.ts` |
| Perfil `coffito-clinica`: identificação PJ, termos vetados, vocabulário por modalidade, regra de vídeo | `src/config/compliance.config.ts` |
| Bloqueio de produção e relatório/`MELHORIAS.md` | `src/lib/validacao.ts`, `scripts/validate-config.ts` (`pnpm pendencias`) |

Regras:
- **Pessoa só aparece com nome completo + CREFITO** (`equipeVisivel()` é a única porta de nomes). Vale para cards, textos, schema e selo de vídeo. O RT aparece pela identificação PJ.
- **modoEquipe**: `clinica` (ninguém elegível: terceira pessoa, sem nomes), `solo`, `equipe`. Textos com pessoas usam `variante({clinica, solo, equipe})` com `{clinica}`, `{nome}`, `{nomes}`.
- **WhatsApp**: canal preferido da área → clínica → qualquer número real (sem nome). Canal de profissional só conta se ele for visível.
- **Pilates**: sem `conduzidoPorFisioterapeuta` confirmado, só "Pilates em solo e em aparelhos" (vocabulário clínico vetado nesse texto).
- **Bloqueia produção**: registro da empresa, RT (nome + CREFITO), WhatsApp real, termo vetado em texto publicado, mídia referenciada sem consentimento. Qualquer outro problema de mídia referenciada só a tira da produção (aviso).

## Orçamento de JS (cliente, home)
Medido no build atual: **1,49 kB gzip** em 4 scripts inline, sem bundle em `/_astro`.

| Ilha | Hoje (gzip) | Teto |
|---|---|---|
| Tema inicial no `<head>` (aplica a escolha salva, evita flash) | 0,27 kB | 0,3 kB |
| Seletor de tema (cabeçalho) | 0,33 kB | 0,4 kB |
| Consentimento (banner + liberar terceiros) | 0,67 kB | 1,0 kB |
| Revelação ao rolar (IntersectionObserver; desligada com `prefers-reduced-motion`) | 0,23 kB | 0,3 kB |
| Player de vídeo (nativo `<video>`; script só se houver slot preenchido) | 0 | 0,8 kB |
| **Total** | **1,49 kB** | **≤ 3 kB** (já verificado por `audit-lighthouse.ts`) |

Sem frameworks de UI, sem bibliotecas de animação. FAQ com `<details>` nativo; mapa e Instagram como links (sem embed).
