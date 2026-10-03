// llms.txt: resumo citável da clínica para assistentes de IA (só produção).
// Mesmos dados do site (nome, endereço, telefone, horários), sem afirmação nova.
import type { APIRoute } from 'astro';
import { clinica } from '../config/profile.config.ts';
import { copy } from '../config/copy.config.ts';
import { areasAtivas, enderecoTexto, equipeVisivel, horariosTexto, pilatesPorFisioterapeuta, registroEmpresa, responsavelTecnico, telefoneExibicao } from '../lib/clinica.ts';
import { instagramUrl } from '../lib/contato.ts';
import { EM_PRODUCAO } from '../lib/modo.ts';

export const GET: APIRoute = ({ site }) => {
  if (!EM_PRODUCAO) return new Response('# Em revisão\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  const rt = responsavelTecnico();
  const areas = areasAtivas().map((a) => `- ${a.id === 'pilates' && !pilatesPorFisioterapeuta() ? 'Pilates em solo e em aparelhos' : (a.cartao?.rotulo ?? a.titulo)}`);
  const pessoas = equipeVisivel().map((p) => `- ${p.nomeCompleto}, fisioterapeuta, ${p.registro}`);
  const h = horariosTexto();
  const faq = copy.faq.itens.filter((f) => !f.soPilatesClinico || pilatesPorFisioterapeuta()).map((f) => `### ${f.pergunta}\n${f.resposta}`);
  const txt = [
    `# ${clinica.nomeFantasia.valor}`,
    '',
    `> Clínica de fisioterapia e Pilates em ${clinica.endereco.cidade.valor} (${clinica.endereco.uf.valor}). Agendamento de consulta fisioterapêutica pelo WhatsApp.`,
    '',
    '## Identificação',
    `- Registro da empresa: ${registroEmpresa()}`,
    `- Responsável técnico: ${rt.nome}, ${rt.registro}`,
    ...pessoas,
    '',
    '## Contato',
    `- Endereço: ${enderecoTexto()}`,
    `- WhatsApp: ${telefoneExibicao()}`,
    ...(h ? [`- Horários: ${h}`] : []),
    ...(instagramUrl() ? [`- Instagram: ${instagramUrl()}`] : []),
    `- Site: ${site}`,
    '',
    '## Áreas de atendimento',
    ...areas,
    '',
    '## Perguntas frequentes',
    ...faq,
    '',
  ].join('\n');
  return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
