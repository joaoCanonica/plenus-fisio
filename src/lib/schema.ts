/**
 * Dados estruturados (schema.org, JSON-LD) a partir da MESMA fonte do texto
 * visível (profile.config.ts via lib/clinica.ts): nome, endereço, telefone e
 * horários iguais no site, no schema e (por orientação) no Google e no Instagram.
 * Pessoas: só o RT e os profissionais visíveis (nome completo + CREFITO).
 */
import { temValor } from '../config/campo.ts';
import { clinica } from '../config/profile.config.ts';
import { copy } from '../config/copy.config.ts';
import { areasAtivas, equipeVisivel, numeroWhatsapp, pilatesPorFisioterapeuta, responsavelTecnico } from './clinica.ts';
import { instagramUrl } from './contato.ts';

const ID = (site: URL, frag: string) => new URL(`/#${frag}`, site).toString();

/** Telefone em formato internacional (+55 49 ...). */
export const telefoneInternacional = (): string => {
  const n = numeroWhatsapp();
  return `+${n.slice(0, 2)} ${n.slice(2, 4)} ${n.slice(4)}`;
};

function endereco() {
  const e = clinica.endereco;
  const rua = [e.rua.valor, temValor(e.numero) ? e.numero.valor : null, temValor(e.complemento) ? e.complemento.valor : null].filter(Boolean).join(', ');
  return {
    '@type': 'PostalAddress',
    streetAddress: rua,
    addressLocality: e.cidade.valor,
    addressRegion: e.uf.valor,
    postalCode: e.cep.valor,
    addressCountry: 'BR',
  };
}

const credencial = (registro: string) => ({ '@type': 'PropertyValue', propertyID: 'CREFITO', value: registro });

/** Grafo da clínica (Physiotherapy + LocalBusiness) e das pessoas elegíveis. */
export function grafoClinica(site: URL): Record<string, unknown>[] {
  const rt = responsavelTecnico();
  const sameAs = [instagramUrl(), temValor(clinica.googleMeuNegocio) ? (clinica.googleMeuNegocio.valor as string) : null].filter(Boolean);
  const geo = clinica.geo.valor;
  const horarios = clinica.horarios.valor ?? [];
  const pessoas = [
    { id: 'rt', nome: rt.nome, registro: rt.registro, cargo: 'Fisioterapeuta, responsável técnico' },
    ...equipeVisivel()
      .filter((p) => p.nomeCompleto !== rt.nome)
      .map((p) => ({ id: p.id, nome: p.nomeCompleto, registro: p.registro, cargo: 'Fisioterapeuta' })),
  ];
  const servicos = areasAtivas().map((a) => (a.id === 'pilates' && !pilatesPorFisioterapeuta() ? 'Pilates' : (a.cartao?.rotulo ?? a.titulo)));

  return [
    {
      '@type': ['Physiotherapy', 'LocalBusiness'],
      '@id': ID(site, 'clinica'),
      name: clinica.nomeFantasia.valor,
      ...(temValor(clinica.razaoSocial) ? { legalName: clinica.razaoSocial.valor } : {}),
      url: site.toString(),
      image: new URL('/og.png', site).toString(),
      logo: new URL('/favicon.svg', site).toString(),
      telephone: telefoneInternacional(),
      address: endereco(),
      ...(geo ? { geo: { '@type': 'GeoCoordinates', latitude: geo.lat, longitude: geo.lng } } : {}),
      ...(horarios.length
        ? { openingHoursSpecification: horarios.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.dias.map((d) => `https://schema.org/${{ Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday' }[d]}`), opens: h.abre, closes: h.fecha })) }
        : {}),
      areaServed: { '@type': 'City', name: `${clinica.endereco.cidade.valor}, ${clinica.endereco.uf.valor}` },
      identifier: { '@type': 'PropertyValue', propertyID: 'Registro da empresa no CREFITO', value: `${clinica.crefitoRegiao.valor} ${clinica.registroEmpresaCrefito.valor}` },
      ...(sameAs.length ? { sameAs } : {}),
      medicalSpecialty: 'https://schema.org/Physiotherapy',
      // Catálogo de serviços (sem preço): availableService não pertence a Physiotherapy.
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Áreas de atendimento',
        itemListElement: servicos.map((nome) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: nome } })),
      },
      employee: pessoas.map((p) => ({ '@id': ID(site, `pessoa-${p.id}`) })),
    },
    ...pessoas.map((p) => ({
      '@type': 'Person',
      '@id': ID(site, `pessoa-${p.id}`),
      name: p.nome,
      jobTitle: p.cargo,
      identifier: credencial(p.registro),
      worksFor: { '@id': ID(site, 'clinica') },
    })),
  ];
}

export function faqPage(site: URL): Record<string, unknown> | null {
  const itens = copy.faq.itens.filter((f) => !f.soPilatesClinico || pilatesPorFisioterapeuta());
  if (!itens.length) return null;
  return {
    '@type': 'FAQPage',
    '@id': ID(site, 'faq'),
    mainEntity: itens.map((f) => ({ '@type': 'Question', name: f.pergunta, acceptedAnswer: { '@type': 'Answer', text: f.resposta } })),
  };
}

export function breadcrumb(site: URL, trilha: readonly { nome: string; caminho: string }[]): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trilha.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.nome, item: new URL(t.caminho, site).toString() })),
  };
}

/** Documento JSON-LD completo de uma página. */
export function jsonLd(site: URL, opcoes: { faq?: boolean; trilha: readonly { nome: string; caminho: string }[] }): string {
  const grafo = [...grafoClinica(site), breadcrumb(site, opcoes.trilha), ...(opcoes.faq ? [faqPage(site)] : [])].filter(Boolean);
  // "<" escapado: o JSON vai dentro de <script>.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': grafo }).replace(/</g, '\\u003c');
}
