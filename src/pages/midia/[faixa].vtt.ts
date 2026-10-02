// Trilhas WebVTT geradas do config (nada escrito à mão):
//  - /midia/<id>.capitulos.vtt → capítulos do slots-video.config.ts (kind="chapters");
//  - /midia/<id>.sem-audio.vtt → legenda "[Vídeo sem áudio]" para vídeos publicados mudos.
// Legendas de fala (.vtt revisado) vêm do manifesto e são copiadas por prepare-media.
import type { APIRoute, GetStaticPaths } from 'astro';
import { itensConfigurados, resolverItem } from '../../lib/slots.ts';

const tempo = (s: number): string => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = (s % 60).toFixed(3).padStart(6, '0');
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${seg}`;
};

export const getStaticPaths = (() => {
  const out: { params: { faixa: string }; props: { corpo: string } }[] = [];
  for (const cfg of itensConfigurados()) {
    const v = resolverItem(cfg);
    if (!v) continue;
    const dur = v.item.duracaoSeg ?? 0;
    if (cfg.capitulos.length) {
      const cues = cfg.capitulos.map((c, i) => {
        const fim = cfg.capitulos[i + 1]?.inicio ?? dur;
        return `${i + 1}\n${tempo(c.inicio)} --> ${tempo(fim)}\n${c.titulo}`;
      });
      out.push({ params: { faixa: `${cfg.midiaId}.capitulos` }, props: { corpo: `WEBVTT\n\n${cues.join('\n\n')}\n` } });
    }
    if (v.item.legenda?.status === 'nao-se-aplica') {
      out.push({
        params: { faixa: `${cfg.midiaId}.sem-audio` },
        props: { corpo: `WEBVTT\n\n1\n${tempo(0)} --> ${tempo(dur)}\n[Vídeo sem áudio]\n` },
      });
    }
  }
  return out;
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response((props as { corpo: string }).corpo, { headers: { 'Content-Type': 'text/vtt; charset=utf-8' } });
