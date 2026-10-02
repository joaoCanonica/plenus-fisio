# Vídeos: ingestão (lote 01)

Originais intactos em `assets-originais/videos/` (sha256 no manifesto). Derivados por `scripts/derivar-videos.sh`
(MP4 H.264 + WebM VP9, ≤ ~900 kbps, sem metadados; poster WebP; `.vtt` rascunho). **Nenhum vídeo está em slot.**
Transcrição automática indisponível neste ambiente: todo `.vtt` aguarda transcrição e revisão humana.

| id | Duração / resolução | Situação | Por quê |
|---|---|---|---|
| `video-P-001-posparto` | 52 s · 360x640 | **Depende de TCLE + reedição; como está, não publicável** | exposição íntima (roupa íntima e abdome, 0–30 s, inclusive nos quadros de mãos+fita); "PÓS-PARTO" sobreposto; nome sem CREFITO; 2ª pessoa no laser; marca na bota. Único trecho candidato: ~34–52 s (botas). `previewOk: false` para não ir a uma URL de preview pública |
| `video-P-002-retorno-esporte` | 22 s · 720x1280 | **Depende de TCLE + regravar sem texto** | texto queimado com cirurgia ("P.O. tenorrafia calcânea"), "Fail ❌😂" (vexatório), "garantir performance"/"reduzir risco de relesão" (promessa), "avaliar"; rosto visível. Tarjas cobririam metade do quadro |
| `video-curso-pilates` | 60 s · 720x1280 | **Depende de terceiros; fora da v1** (módulo "Cursos", `cursos.ativo: false`) | instrutora externa ("Dra. Ana Inês Gonzáles": autorização e título), participantes com rosto, dados do curso |

Tratamento do P-001 (só técnico, sem IA generativa): `scale=720:1280:flags=lanczos,hqdn3d=1.5:1.5:6:6,unsharp=5:5:0.6`. Exibir em moldura ≤ 360 px.
