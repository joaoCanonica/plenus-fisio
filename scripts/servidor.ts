// Sobe `astro preview` numa porta livre e devolve a URL (usado pelas auditorias).
import { spawn, type ChildProcess } from 'node:child_process';
export async function subir(porta = 4399): Promise<{ url: string; parar: () => void }> {
  // Astro mantém um único servidor de preview: para o anterior antes de subir.
  spawn('npx', ['astro', 'preview', 'stop'], { stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1500));
  const p: ChildProcess = spawn('npx', ['astro', 'preview', '--port', String(porta)], { stdio: 'ignore' });
  const url = `http://localhost:${porta}`;
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(url)).ok) break; } catch { /* aguardando */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  return { url, parar: () => { p.kill(); spawn('npx', ['astro', 'preview', 'stop'], { stdio: 'ignore' }); } };
}
