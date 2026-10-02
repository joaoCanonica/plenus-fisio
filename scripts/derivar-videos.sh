#!/usr/bin/env bash
# Derivados web dos vídeos (originais intactos). Sem IA generativa.
# P-001: 2x com Lanczos + denoise leve (hqdn3d) + nitidez moderada (unsharp).
# Demais: só recompressão. Saída: assets-originais/videos/derivados/<id>-secao.{mp4,webm} e -poster.webp
set -euo pipefail
V=assets-originais/videos; D=$V/derivados; mkdir -p "$D"
gerar() { # id original filtro poster_seg
  local id=$1 orig=$2 vf=$3 t=$4
  ffmpeg -v error -y -i "$orig" -vf "$vf" -c:v libx264 -preset slow -crf 28 -maxrate 900k -bufsize 1800k -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 96k -map_metadata -1 "$D/$id-secao.mp4"
  ffmpeg -v error -y -i "$orig" -vf "$vf" -c:v libvpx-vp9 -crf 40 -b:v 800k -row-mt 1 -c:a libopus -b:a 64k -map_metadata -1 "$D/$id-secao.webm"
  ffmpeg -v error -y -ss "$t" -i "$orig" -vf "$vf" -frames:v 1 -c:v libwebp -quality 80 "$D/$id-poster.webp"
}
gerar video-P-001-posparto "$V/P-001_posparto-original.mp4" "scale=720:1280:flags=lanczos,hqdn3d=1.5:1.5:6:6,unsharp=5:5:0.6" 12
gerar video-P-002-retorno-esporte "$V/P-002_retorno-esporte-original.mp4" "scale=720:-2:flags=lanczos" 6
gerar video-curso-pilates "$V/curso-pilates-original.mp4" "scale=720:-2:flags=lanczos" 15
ls -la "$D"
