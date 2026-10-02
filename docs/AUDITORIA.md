# Auditoria do template: o que fica, o que sai, o que muda

Origem: template de site de fisioterapeuta (branch padrão em 2026-10-02), copiado **sem histórico**.
Ponto de partida conferido antes da limpeza: `pnpm install --frozen-lockfile`, `pnpm check` e
`pnpm build:preview` verdes.

Critério de aceite desta etapa: build verde, nenhuma referência à identidade anterior, nenhuma feature nova.
Estado ao final: `pnpm check` ✔ · `pnpm build:preview` ✔ (CSP + auditoria de conformidade) ·
`pnpm audit:a11y` ✔ (0 violações) · `pnpm build` **falha de propósito** só pelas pendências bloqueantes (RT e WhatsApp).

## Fica (motor reaproveitado sem mudança de comportamento)
| Peça | Arquivos |
|---|---|
| Motor de config com rastreio de pendência | `src/config/campo.ts` (`confirmado` / `bloqueante` / `aviso`) |
| Núcleo regulatório e trava de produção | `src/lib/validacao.ts`, `scripts/validate-config.ts`, portão em `astro.config.ts`, página `/pendencias` (só preview) |
| Perfil COFFITO (termos vetados, vocabulário, "especialista", antes e depois) | `src/config/compliance.config.ts` |
| Consentimento LGPD (Aceitar/Recusar com o mesmo peso, terceiros bloqueados) | `src/components/Consentimento.astro`, `src/scripts/consentimento.ts`, `src/config/contato.config.ts` |
| Auditorias | `scripts/audit-compliance.ts`, `scripts/audit-a11y.ts`, `scripts/audit-lighthouse.ts` (orçamento de JS) |
| CSP com hash dos scripts inline + cabeçalhos | `scripts/gerar-csp.ts`, `vercel.json` |
| Tema claro/escuro com seletor e validação AA | `src/lib/tema.ts`, `scripts/validate-theme.ts`, seletor em `Cabecalho.astro` |
| Slots de vídeo (vago some em produção; preview desenha) | `src/config/slots-video.config.ts`, `src/lib/slots.ts`, `SlotConvite`, `SlotAtendimentos`, `VideoPlayer`, `VideoVago`, `ui/VideoFrame`, `pages/midia/[faixa].vtt.ts` |
| Mídia: manifesto + derivados (recorte/tarja, sem EXIF) | `media.manifest.json`, `src/lib/manifesto.ts`, `scripts/prepare-media.mjs` |
| Selo PROVISÓRIO e modo preview/produção | `Provisorio.astro`, `src/lib/modo.ts` |
| Estrutura genérica | `Base.astro`, `Cabecalho`, `Rodape`, `Identificacao`, `Onde`, `Faq`, `Contato`, `InstagramBloco` (sem embed), `BarraMobile`, `ui/*` genéricos, `/privacidade`, `/_kit`, robots, sitemap |
| Infra | `.nvmrc` (Node 22), `packageManager: pnpm@10.28.0`, CI, `build-vercel.mjs` |

## Sai (identidade anterior)
| Item | Motivo |
|---|---|
| Monograma (`Marca.astro` desenhado, `favicon.svg`, logotipos em `assets-originais/marca`) | assinatura visual |
| Coluna de pontos: `Coluna.astro`, `ui/Pontos.astro`, `theme.pontos`, marcador do `.eyebrow` | assinatura visual |
| Vinho: primitivas, tom `vinho`, `--secao-vinho` | assinatura visual |
| Arco (`arco` em `MediaFrame`, `VideoPlayer`, `VideoVago`; topo do mapa em `Onde`) | assinatura visual |
| Curva/onda (`ui/Onda.astro`) | assinatura visual |
| Linha/traço de entrada (`Entrada.astro`) e retrato que percorre o site (`PortraitTravel`, `Pose`, `retrato.config.ts`, `lib/retrato.ts`, `scripts/secoes.ts`) | assinatura visual / mídia pessoal |
| Universo infantil: `ui/Crianca`, `ui/Formas`, `ui/Ilustracao`, `data/marcos.ts`, tokens `--ilustra-*`, `.adesivo`, `.com-formas` | público e identidade de outro site |
| Seções com copy própria: `Hero`, `Sobre`, `Atua`, `Atendimento`, `Desenvolvimento` | copy de outro profissional |
| Copy, FAQ, fontes clínicas (`copy.config.ts`), `docs/COPY_DECK.md` | conteúdo de outro site |
| Mídia: todos os originais, o manifesto preenchido, `docs/midia/`, `docs/capturas/`, `docs/design/` | mídia de outro site e de pacientes de outro site |
| Pesquisas específicas (marcos motores, TEA, neuropediatria, estimulação precoce, família) | outro tema; a Plenus pesquisa os próprios temas |
| Fonte display Marcellus (`@fontsource/marcellus`) | tipografia da identidade anterior |
| Seção "Como criar o próximo site" do README | é guia do template, não deste site |

## Muda
| Arquivo | Mudança |
|---|---|
| `profile.config.ts` | dados neutros da Plenus: `nomeMarca` confirmado; RT, CREFITO e WhatsApp como `bloqueante()`; endereço, mapa, Instagram, títulos como `aviso()`; `vinculos` vazio; unidade própria com `vinculoId: null` (espaço próprio, sem autorização de terceiro) |
| `validacao.ts` | aceita unidade sem vínculo (`vinculoId: null`); textos de aviso sem área específica |
| `copy.config.ts` | só o mínimo neutro (título provisório, onde, contato); FAQ vazio |
| `slots-video.config.ts` | os dois slots **vagos**, sem itens; apresentação opcional (`item: null`) |
| `theme.config.ts` / `tema.ts` / `global.css` | paleta **provisória** verde + off-white + areia (todos os pares AA); tom `vinho` → `marca`; display em Lato até definir a tipografia |
| `index.astro` | esqueleto: início (h1 + WhatsApp + identificação), slots, onde, FAQ (some se vazio), contato |
| `Marca.astro` / `favicon.svg` | placeholders neutros até o logo da Plenus chegar |
| `contato.ts` | Instagram opcional (`null` oculta links e o bloco) |
| `Contato`, `Rodape`, `BarraMobile`, `InstagramBloco` | escondem Instagram quando vazio |
| `Faq.astro` | não renderiza (nem entra no menu) sem itens |
| `/privacidade` | texto genérico para pacientes (não só crianças) |
| `compliance.config.ts` | `criancas` → `menores` (mesma regra) |
| Chaves de armazenamento local | prefixo `plenus-` |
| `docs/COMPLIANCE.md`, `docs/pesquisa/regulacao-coffito.md`, `README.md` | reescritos para a Plenus |

## Lacunas conhecidas (para a próxima etapa, não implementadas aqui)
- **Registro da empresa no CREFITO** não existe no modelo atual (feito para pessoa física). A proposta está em `docs/ARQUITETURA.md`. Até lá, a trava de produção cobre só RT e WhatsApp.
- `opcional()` citado nas regras ainda não existe em `campo.ts`. Hoje o papel é feito por `aviso()` + `exibir()` (some em produção). Proposta em `docs/ARQUITETURA.md`.
- Regra de Pilates (Prompt 2) ainda não recebida.
