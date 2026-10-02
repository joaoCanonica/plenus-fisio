# Logo e fotos: ingestão (lote 01)

Originais intactos em `assets-originais/` (sha256 no `media.manifest.json`). Nada disto está ligado ao site.

## Logo (150x150)
| Parte | Resultado | Decisão |
|---|---|---|
| Oval | potrace fiel, mas com borda irregular | **reconstruída** como elipse SVG (proporção ~0,72, aberturas laterais como no original) |
| Palavra PLENUS | potrace a 20x (Lanczos + limiar) legível e com proporções fiéis; bordas levemente onduladas | **usada** (`plenus-palavra-trace.svg`); refazer com o arquivo original |
| "FISIOTERAPIA & PILATES" | ilegível para vetorizar (~5 px de altura) | recomposto em **Figtree** (fonte do site), caixa alta com espaçamento |
| Duas figuras (traço fino) | vetorização vira manchas e **inventa contornos** | **fora dos lockups**; não redesenhar sem o original |

Lockups (`assets-originais/marca/derivados/`), gerados por `node scripts/gerar-lockups.mjs`:
`lockup-oval.svg` (+ `-mono-claro`, `-mono-escuro`), `lockup-horizontal.svg` (+ mono claro/escuro), `simbolo-oval.svg`.
Todos usam `currentColor`. São **provisórios**: sem as figuras, não equivalem ao logo oficial.

## Cores amostradas (sugestão para o tema)
| Cor | Valor | Contraste |
|---|---|---|
| Verde médio (média dos pixels escuros) | `#457147` | 5,67:1 com branco; 5,34:1 com off-white `#faf8f3` → AA para texto |
| Verde dominante (moda) | `#407040` | 5,82:1 com branco |
| Claro | branco `#ffffff` | — |

Aplicado: `verdeMarca = #457147` em `theme.config.ts` (botão primário), com hover `#38603b`.

## Fotos (150x150)
`pessoa-foto-a` e `pessoa-foto-b`: derivados 2x (300x300) com Lanczos3 + nitidez leve (`scripts/derivar-avatares.mjs`), em WebP/AVIF/JPEG, sem EXIF.
Sem super-resolução generativa nem restauração de rosto. Uso: só em círculo/oval de até 96–120 px CSS.
Qual foto é de qual profissional: **CONFIRMAR** (ids neutros de propósito).
