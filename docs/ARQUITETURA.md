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

## Proposta: config de CLÍNICA

Hoje `profile` descreve **um** profissional. A Plenus é pessoa jurídica com RT e equipe.
Proposta: substituir `profile.config.ts` por `clinica.config.ts` com três blocos e um novo construtor `opcional()`.

### 1. `campo.ts`: `opcional()`
```ts
// Campo que pode ficar vazio para sempre: vazio = o trecho/seção some, sem gerar pendência.
export type Campo<T> =
  | { status: 'confirmado'; valor: T }
  | { status: 'pendente'; valor: T; nivel: Nivel; nota: string }
  | { status: 'opcional'; valor: T | null };          // novo

export const opcional = <T>(valor: T | null = null): Campo<T | null> => ({ status: 'opcional', valor });
```
- `exibir()` devolve `valor` (ou `null`) em qualquer modo; nenhum selo, nenhuma pendência.
- Uso: Instagram, link do Maps, formação, pós, Lattes, e-mail de privacidade, subtítulos.
- Regra: só os 3 bloqueantes do projeto usam `bloqueante()`. Conteúdo a aprovar usa `aviso()`; tudo o que pode não existir usa `opcional()`.

### 2. `clinica.config.ts`
```ts
export const clinica = {
  pj: {
    nomeFantasia: confirmado('Plenus Fisioterapia & Pilates'),   // só a PJ usa nome fantasia
    razaoSocial: opcional<string>(),
    registroCrefito: bloqueante('', 'Nº do registro da empresa no CREFITO-10.'),   // BLOQUEANTE (1)
    crefitoRegiao: confirmado('CREFITO-10'),
  },
  rt: {                                                            // BLOQUEANTE (2)
    nomeCompleto: bloqueante('', 'Nome completo do responsável técnico.'),
    crefito: bloqueante('', 'CREFITO do responsável técnico.'),
  },
  equipe: [
    // Sem CREFITO o profissional NÃO aparece (filtro em lib, não pendência bloqueante).
    { id: 'adrian', nomeCompleto: aviso('', '...'), crefito: aviso('', '...'), papel: 'socio',
      formacao: opcional(), posGraduacao: opcional(), especialista: { registrado: false, rqe: null, especialidade: null } },
    { id: 'natalia', /* idem */ },
  ],
  canais: {
    whatsapp: [                                                    // BLOQUEANTE (3): ≥ 1 com número real
      { id: 'recepcao', rotulo: 'Agendamento', numero: bloqueante('', 'WhatsApp real.') },
    ],
    instagram: opcional<string>(),
  },
  unidades: [{ id: 'lages', nome: 'Plenus', endereco: aviso('Lages (SC)', '...'), mapsUrl: opcional(), vinculoId: null }],
  vinculos: [],                                                    // terceiros: só com autorização formal
  dominio: aviso('https://example.com', '...'),
} as const;
```

Regras derivadas (em `lib/validacao.ts` e `lib/identificacao.ts`):
| Regra | Implementação proposta |
|---|---|
| Identificação PJ em toda página | rodapé + `audit-compliance` passam a exigir nome fantasia + registro da empresa + RT (nome e CREFITO) |
| Profissional só aparece com nome completo + CREFITO | `equipeVisivel()` filtra; profissional sem número some (aviso, não bloqueio) |
| ≥ 1 WhatsApp real | validador: `canais.whatsapp.some(confirmado)`, senão bloqueante |
| "especialista" | vetado por profissional, liberado só com `registrado + rqe` daquele profissional |
| Pilates | **aguardando a regra do Prompt 2** (vocabulário e enquadramento como recurso fisioterapêutico). Entrará como termos/regras em `compliance.config.ts` |

Migração: `profile` → `clinica` em `Identificacao`, `BadgeId`, `Rodape`, `Cabecalho`, `index`, `contato.ts`, `validacao.ts`, `audit-compliance.ts`. O shape antigo sai na mesma mudança.

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
