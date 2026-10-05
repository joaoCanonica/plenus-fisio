import { confirmado } from './campo.ts';
import type { IdArea } from './profile.config.ts';
import type { ModoEquipe } from '../lib/clinica.ts';

/**
 * Textos da landing: docs/COPY_DECK.md v1 (decisões no padrão: título A,
 * Pilates 2A, sem recursos citados, geriatria fora, sem domiciliar, sem
 * pergunta de convênio, voz "nós"). Toda afirmação clínica aponta para
 * docs/pesquisa/<tema>.md#n em `pesquisa` (não exibido) e mostra a fonte.
 * Textos com pessoas têm variante por modo (lib/clinica.ts → variante).
 */
export interface Fonte {
  readonly texto: string;
  readonly url?: string;
}

export interface Faq {
  readonly pergunta: string;
  readonly resposta: string;
  /** Registro em docs/pesquisa (não exibido; rastreabilidade). */
  readonly pesquisa?: string;
  /** Só aparece se o Pilates for conduzido por fisioterapeuta. */
  readonly soPilatesClinico?: boolean;
}

export interface Afirmacao {
  readonly texto: string;
  readonly pesquisa?: string;
}

export interface ConteudoArea {
  readonly oQueE: string;
  readonly quando: readonly string[];
  readonly esperar: readonly Afirmacao[];
  readonly fontes: readonly Fonte[];
  /** Sub-bloco (ex.: fisioterapia pélvica dentro de gestação e pós-parto). */
  readonly sub?: { readonly titulo: string; readonly oQueE: string; readonly quando: string; readonly esperar: readonly Afirmacao[]; readonly fontes: readonly Fonte[] };
}

type Variantes = Readonly<Record<ModoEquipe, string>>;

const F = {
  oms: { texto: 'OMS, diretrizes de atividade física, 2020', url: 'https://www.who.int/publications/i/item/9789240015128' },
  ms: { texto: 'Ministério da Saúde, Guia de Atividade Física para a População Brasileira, 2021', url: 'https://www.rbafs.org.br/RBAFS/article/view/14561' },
  woodley: { texto: 'Cochrane, Woodley et al., 2020', url: 'https://doi.org/10.1002/14651858.CD007471.pub4' },
  gluppe: { texto: 'Gluppe, Engh e Bø, 2021', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8721086' },
  dumoulin: { texto: 'Cochrane, Dumoulin et al., 2018', url: 'https://doi.org/10.1002/14651858.CD005654.pub4' },
  ardern: { texto: 'Consenso de Berna, Ardern et al., 2016', url: 'https://pubmed.ncbi.nlm.nih.gov/27226389/' },
  grindem: { texto: 'Grindem et al., 2016', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4912389' },
  hayden: { texto: 'Cochrane, Hayden et al., 2021', url: 'https://doi.org/10.1002/14651858.CD009790.pub2' },
  fransen: { texto: 'Cochrane, Fransen et al., 2015', url: 'https://doi.org/10.1002/14651858.CD004376.pub3' },
  yamato: { texto: 'Cochrane, Yamato et al., 2015', url: 'https://doi.org/10.1002/14651858.CD010265' },
} satisfies Record<string, Fonte>;

export const copy = {
  hero: {
    titulo: confirmado('Fisioterapia e Pilates em Lages'),
    // Subtítulo gerado em Hero.astro a partir das áreas ativas.
  },

  areas: {
    titulo: 'Áreas de atendimento',
    intro: 'Cada atendimento começa com uma consulta fisioterapêutica e segue um plano terapêutico individual.',
    /** Data de acesso registrada em docs/pesquisa (GEO: fontes com data). */
    fontesConsultadasEm: 'outubro de 2026',
    rotulos: { oQueE: 'O que é', quando: 'Quando procurar uma consulta fisioterapêutica', esperar: 'O que esperar' },
    conteudo: {
      obstetricaPelvica: {
        oQueE: 'Fisioterapia que acompanha a mulher na gestação e depois do parto, com exercícios orientados, cuidado com a postura e com o assoalho pélvico, e preparo para a rotina com o bebê.',
        quando: [
          'Para se manter ativa com orientação durante a gestação, com a liberação de quem faz o seu pré-natal.',
          'Dor nas costas ou na pelve na gestação ou no pós-parto.',
          'Perda de urina ao tossir, rir ou fazer esforço.',
          'Para retomar exercícios depois do parto com segurança.',
        ],
        esperar: [
          { texto: 'A Organização Mundial da Saúde e o Ministério da Saúde recomendam, para gestantes e mulheres no pós-parto sem contraindicação, pelo menos 150 minutos de atividade física moderada por semana.', pesquisa: 'gestacao-pos-parto.md#1,#2' },
          { texto: 'Exercícios para o assoalho pélvico durante a gestação reduzem o risco de perda de urina no fim da gravidez e nos meses depois do parto.', pesquisa: 'gestacao-pos-parto.md#4' },
          { texto: 'No pós-parto, os exercícios abdominais são orientados um a um. Os estudos ainda não apontam um programa único que funcione para todas.', pesquisa: 'gestacao-pos-parto.md#5' },
        ],
        fontes: [F.oms, F.ms, F.woodley, F.gluppe],
        sub: {
          titulo: 'Fisioterapia pélvica',
          oQueE: 'Cuida dos músculos do assoalho pélvico, responsáveis por funções como segurar a urina e os gases e sustentar os órgãos da pelve.',
          quando: 'Perda de urina ou de gases, sensação de peso na região íntima, dor pélvica, ou orientação na gestação e no pós-parto. A consulta fisioterapêutica complementa o acompanhamento médico.',
          esperar: [
            { texto: 'Em mulheres com perda de urina, os exercícios para o assoalho pélvico podem diminuir ou resolver os sintomas e melhorar a qualidade de vida.', pesquisa: 'fisioterapia-pelvica.md#1' },
            { texto: 'Perda de urina depois do parto é comum: atinge cerca de uma em cada três mulheres.', pesquisa: 'fisioterapia-pelvica.md#2' },
          ],
          fontes: [F.dumoulin, F.woodley],
        },
      },
      esportiva: {
        oQueE: 'Fisioterapia para quem pratica esporte, da lesão ao retorno à atividade, com um plano terapêutico individual.',
        quando: [
          'Depois de uma lesão ou de uma cirurgia, para planejar a volta.',
          'Dor que atrapalha o esporte ou a corrida.',
          'Dúvida sobre o momento de voltar aos jogos e às competições.',
        ],
        esperar: [
          { texto: 'O retorno ao esporte é construído ao longo da reabilitação, e não decidido só no fim. A decisão é conversada e leva em conta o corpo, a confiança e a rotina de cada pessoa.', pesquisa: 'esportiva-retorno-ao-esporte.md#1' },
          { texto: 'Estar sem dor, sozinho, não basta. Usamos testes funcionais, como força e saltos comparando os dois lados, para orientar cada etapa.', pesquisa: 'esportiva-retorno-ao-esporte.md#2,#3' },
          { texto: 'Os testes orientam a decisão; nenhum teste elimina o risco de uma nova lesão.' },
        ],
        fontes: [F.ardern, F.grindem],
      },
      traumatoOrtopedica: {
        oQueE: 'Fisioterapia para dores e lesões de músculos, ossos e articulações, e para a recuperação depois de cirurgias ortopédicas, sempre em sintonia com a equipe médica.',
        quando: [
          'Dor nas costas, no pescoço, no ombro, no joelho ou em outras articulações que atrapalha o dia a dia.',
          'Depois de uma fratura, entorse ou cirurgia ortopédica.',
          'Dificuldade para caminhar, subir escadas ou fazer atividades do trabalho e de casa.',
        ],
        esperar: [
          { texto: 'O exercício é a base do plano terapêutico. Na dor lombar crônica, ele reduz a dor e melhora a função em comparação a não tratar.', pesquisa: 'traumato-ortopedica.md#1' },
          { texto: 'Não existe um único tipo de exercício que sirva para todos; o plano é escolhido para você.', pesquisa: 'traumato-ortopedica.md#2' },
          { texto: 'Na artrose do joelho, exercícios orientados diminuem a dor e melhoram a função física.', pesquisa: 'traumato-ortopedica.md#3' },
        ],
        fontes: [F.hayden, F.fransen],
      },
      geriatrica: {
        oQueE: 'Atendimento à pessoa idosa, com foco em mobilidade, equilíbrio e autonomia no dia a dia.',
        quando: ['Dificuldade para caminhar, levantar ou subir escadas, ou insegurança ao se movimentar.'],
        esperar: [{ texto: 'Uma consulta fisioterapêutica e um plano terapêutico ajustado à rotina e aos objetivos da pessoa.' }],
        fontes: [],
      },
    } satisfies Partial<Record<IdArea, ConteudoArea>>,
    /** Pilates: 2A sem condução por fisioterapeuta confirmada; 2B quando confirmada. */
    pilates: {
      semFisioterapeuta: 'Pilates em solo e em aparelhos. Fale pelo WhatsApp para saber como funciona.',
      comFisioterapeuta: {
        texto: 'Na Plenus, o Pilates é conduzido por fisioterapeuta e faz parte do plano terapêutico, em solo e em aparelhos. Na dor lombar, os estudos mostram redução da dor e da incapacidade em comparação a não fazer nada, sem vantagem clara sobre outros exercícios. Por isso, a indicação é feita na consulta fisioterapêutica.',
        pesquisa: 'pilates.md#1,#2',
        fontes: [F.yamato],
      },
    },
    recursos: {
      titulo: 'Recursos que podem fazer parte do plano',
      texto: 'Alguns recursos complementam o exercício e as técnicas manuais. Eles não substituem o plano terapêutico e o efeito varia de pessoa para pessoa.',
      pesquisa: 'recursos-terapeuticos.md#1-4',
    },
  },

  /** Frase-chave da marca (bloco verde-noite entre as seções). */
  frase: { antes: 'Movimento com saúde e', destaque: 'segurança.' },

  primeiraConsulta: {
    titulo: 'Sua primeira consulta, passo a passo',
    intro: 'Do primeiro contato pelo WhatsApp ao acompanhamento do plano terapêutico, em cinco etapas.',
    passos: [
      { titulo: 'Você chama no WhatsApp', texto: 'Combinamos dia e horário. Não pedimos informações de saúde por mensagem.' },
      { titulo: 'Conversa', texto: 'Na consulta fisioterapêutica, ouvimos sua história, sua rotina e o que você quer voltar a fazer.' },
      { titulo: 'Exame físico', texto: 'Observamos movimento, força e postura, com respeito ao seu conforto. Se tiver exames ou relatórios, traga no dia.' },
      { titulo: 'Plano terapêutico', texto: 'Definimos juntos os objetivos, a frequência dos atendimentos e o que fazer em casa.' },
      { titulo: 'Acompanhamento', texto: 'O plano é revisto ao longo do caminho e ajustado conforme a sua resposta.' },
    ],
  },

  equipe: {
    titulo: 'Conheça a equipe',
    /** Abertura factual por modo ({clinica}, {nome}, {nomes}). */
    texto: {
      clinica: 'Na {clinica}, o atendimento é feito por fisioterapeutas, com registro no CREFITO, sob a responsabilidade técnica indicada abaixo.',
      solo: '{nome} conduz a consulta fisioterapêutica e acompanha o plano terapêutico do início ao fim.',
      equipe: '{nomes} formam a equipe de fisioterapia da {clinica}. Cada área tem um profissional de referência, e o plano terapêutico é acompanhado pela mesma pessoa.',
    } satisfies Variantes,
    registroRotulo: 'Registro da clínica no CREFITO',
    consultar: 'Consultar o registro',
  },

  espaco: {
    titulo: 'Conheça o espaço',
    texto: 'Um ambiente claro e tranquilo, com sala de atendimento, aparelhos de Pilates e área para exercícios.',
  },

  onde: {
    titulo: 'Onde fica',
    regiao: 'A {clinica} fica na {rua}, no {bairro} de {cidade} ({uf}).',
    notaMapa: 'O mapa abre no Google Maps, fora deste site.',
    domiciliar: null as string | null,
  },

  faq: {
    titulo: 'Perguntas frequentes',
    itens: [
      {
        pergunta: 'Preciso de pedido médico para marcar uma consulta fisioterapêutica?',
        resposta: 'Não é obrigatório para a primeira consulta fisioterapêutica na Plenus. Se você já tem um pedido, exames ou relatórios, vale trazer no dia, porque ajudam a entender a sua história. Quando a fisioterapia não for o caminho mais indicado para o seu caso, orientamos você a procurar o profissional adequado.',
      },
      {
        pergunta: 'Como é a primeira consulta fisioterapêutica?',
        resposta: 'Na Plenus, a primeira consulta fisioterapêutica começa com uma conversa sobre a sua história, a sua rotina e os seus objetivos. Depois vem um exame físico de movimento, força e postura. No fim, definimos juntos um plano terapêutico, com a frequência dos atendimentos e orientações para fazer em casa.',
      },
      {
        pergunta: 'O que devo levar e vestir?',
        resposta: 'Para o atendimento de fisioterapia na Plenus, use roupas confortáveis que permitam se movimentar, como as de fazer exercício. Se tiver exames, laudos ou relatórios recentes, traga no dia da consulta fisioterapêutica. Por privacidade, pedimos que não envie informações de saúde pelo WhatsApp; elas são tratadas pessoalmente.',
      },
      {
        pergunta: 'Quanto tempo dura o tratamento?',
        resposta: 'Depende de cada pessoa, do motivo da procura e dos objetivos combinados. Por isso a Plenus não promete prazos. O que fazemos é definir objetivos claros no plano terapêutico, rever o plano periodicamente e ajustar a frequência dos atendimentos conforme a sua resposta. Você acompanha cada etapa junto com o fisioterapeuta.',
      },
      {
        pergunta: 'Grávidas podem fazer fisioterapia e exercícios?',
        resposta: 'Sim, quando não há contraindicação e com a liberação de quem acompanha o pré-natal. A OMS e o Ministério da Saúde recomendam atividade física moderada na gestação e no pós-parto. Na Plenus, os exercícios são orientados na consulta fisioterapêutica, respeitando a fase da gestação.',
        pesquisa: 'gestacao-pos-parto.md#1,#2',
      },
      {
        pergunta: 'Perder urina depois do parto é normal?',
        resposta: 'É comum: cerca de uma em cada três mulheres tem perda de urina depois do parto. Comum, porém, não quer dizer que você precise conviver com isso. Exercícios orientados para o assoalho pélvico podem diminuir os sintomas. Converse com seu médico e agende uma consulta fisioterapêutica na Plenus.',
        pesquisa: 'fisioterapia-pelvica.md#1,#2',
      },
      {
        pergunta: 'Como saber se já posso voltar ao esporte?',
        resposta: 'Estar sem dor é importante, mas não é suficiente. Na Plenus, a volta ao esporte é planejada durante a reabilitação, com testes funcionais de força e de saltos que comparam os dois lados do corpo. Os testes orientam a decisão, combinada com você e com a equipe médica; nenhum teste elimina o risco de nova lesão.',
        pesquisa: 'esportiva-retorno-ao-esporte.md#1,#2',
      },
      {
        pergunta: 'O Pilates ajuda na dor nas costas?',
        resposta: 'Os estudos mostram que o Pilates pode reduzir a dor e a incapacidade na dor lombar, em comparação a não fazer nada, mas sem vantagem clara sobre outros exercícios. Por isso, a escolha do exercício é feita caso a caso. Fale com a Plenus pelo WhatsApp para saber como funciona o Pilates.',
        pesquisa: 'pilates.md#1,#2',
        soPilatesClinico: true,
      },
      {
        pergunta: 'Como agendar?',
        resposta: 'O agendamento na Plenus é feito pelo WhatsApp, pelo botão desta página. Escolha o assunto em "Por onde começar" ou envie a mensagem padrão. Não pedimos sintomas nem dados de saúde por mensagem: eles são conversados na consulta fisioterapêutica. O site não agenda atendimentos nem coleta dados.',
      },
    ] as readonly Faq[],
  },

  contato: {
    titulo: 'Vamos conversar?',
    texto:
      'Chame a Plenus no WhatsApp e agende a sua consulta fisioterapêutica. Para proteger a sua privacidade, deixe exames e relatórios para o dia do atendimento.',
    instagram: null as string | null,
  },
} as const;
