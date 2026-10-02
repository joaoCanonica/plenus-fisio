/**
 * Perfil regulatório COFFITO (Res. 424/2013 e 532/2021; conferir o texto vigente
 * antes do go-live, ver docs/pesquisa/regulacao-coffito.md).
 *
 * `termosVetados` é aplicado em dois momentos:
 *  - na validação (scripts/validate-config.ts), sobre configs, manifesto e slots;
 *  - depois do build (scripts/audit-compliance.ts), sobre o texto renderizado.
 * Negações explícitas ("não cura", "sem garantia", "nunca promete") são aceitas.
 */
export interface TermoVetado {
  readonly padrao: string; // fonte de RegExp, sem flags (aplicada com 'giu')
  readonly motivo: string;
}

export const compliance = {
  perfil: 'coffito-clinica',

  termosVetados: [
    { padrao: '\\bpre[çc]os?\\b', motivo: 'preço' },
    { padrao: '\\bvalor(es)?\\b', motivo: 'valor (comercial)' },
    { padrao: '\\bR\\$\\s?\\d', motivo: 'valor em reais' },
    { padrao: '\\bpacotes?\\b', motivo: 'pacote' },
    { padrao: '\\bpromo[çc](ão|ões|ional)', motivo: 'promoção' },
    { padrao: '\\bdescontos?\\b', motivo: 'desconto' },
    { padrao: '\\bofertas?\\b', motivo: 'oferta' },
    { padrao: '\\bgr[áa]tis\\b|\\bgratuit[ao]s?\\b', motivo: 'gratuidade' },
    { padrao: '\\bgarant(e|ia|ias|ido|imos)\\b', motivo: 'garantia de resultado' },
    { padrao: '\\bcur(a|ar|ou|ado|ada)\\b', motivo: 'cura' },
    { padrao: '\\bmilagr', motivo: 'milagre' },
    { padrao: '\\bvoltou a andar\\b', motivo: 'sensacionalismo' },
    { padrao: '\\bsuper(ou|ação)\\b', motivo: 'sensacionalismo' },
    { padrao: '\\b(o|a) melhor\\b|\\bexcelen(te|tes|cia)\\b|\\bincompar[áa]vel\\b', motivo: 'superlativo' },
    { padrao: '\\brefer[êe]ncia em\\b|\\bde confian[çc]a\\b|\\bn[ºo°]\\s?1\\b', motivo: 'autoelogio' },
    { padrao: '\\bsess(ão|ões)\\b', motivo: 'use "atendimento"' },
    { padrao: '\\bavalia[çc](ão|ões)\\b', motivo: 'use "consulta fisioterapêutica"' },
    { padrao: '\\balun[oa]s?\\b', motivo: 'use "paciente"' },
    { padrao: '\\btreinos?\\b', motivo: 'use "plano terapêutico"' },
  ] satisfies readonly TermoVetado[],

  /** Vetado salvo se algum profissional visível tiver título registrado + RQE. */
  termoEspecialista: { padrao: '\\bespecialista\\b', motivo: '"especialista" sem título registrado e RQE' },

  /** Negações que tornam um termo aceitável ("não cura"). */
  negacao: '\\b(n[ãa]o|nem|sem|nunca)\\s+(\\S+\\s+){0,2}$',

  /**
   * Identificação da pessoa jurídica em toda página: nome fantasia, registro da
   * empresa no CREFITO e responsável técnico (nome + CREFITO). Profissional citado:
   * nome completo + CREFITO, senão não aparece (lib/clinica.ts → equipeVisivel).
   */
  identificacao: {
    emTodaPagina: true,
    pj: ['nomeFantasia', 'registroEmpresaCrefito', 'responsavelTecnico.nome', 'responsavelTecnico.crefito'],
    profissional: ['nomeCompleto', 'crefito'],
  },

  /** Vídeo/imagem de paciente: TCLE + data do registro + nome e CREFITO do profissional responsável. */
  video: { exigeDataRegistro: true, exigeProfissionalVisivel: true, exigeTcle: true },

  /**
   * Vocabulário por modalidade (aplicado aos textos de cada área):
   *  - fisioterapia e Pilates clínico: os termos vetados gerais já impõem
   *    "consulta fisioterapêutica", "atendimento", "paciente", "plano terapêutico";
   *  - Pilates sem fisioterapeuta confirmado: nada de vocabulário clínico nem título.
   */
  vocabulario: {
    pilatesSemFisioterapeuta: [
      { padrao: '\\bfisioterap', motivo: 'Pilates sem fisioterapeuta confirmado' },
      { padrao: '\\bpaciente', motivo: 'Pilates sem fisioterapeuta confirmado' },
      { padrao: '\\bplano terap', motivo: 'Pilates sem fisioterapeuta confirmado' },
      { padrao: '\\bcl[íi]nico\\b', motivo: 'Pilates sem fisioterapeuta confirmado' },
    ] satisfies readonly TermoVetado[],
  },

  antesDepois: false,
  /** Frase obrigatória se antesDepois for ligado. */
  fraseAntesDepois: 'O resultado não é garantido nem igual.',

  /** Menor de idade: TCLE do responsável legal; evitar rosto frontal. */
  menores: { tcleResponsavel: true, rostoFrontal: 'evitar' },
} as const;
