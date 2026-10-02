# Melhorias (o site já funciona sem)

O site publica sem pendência: campo vazio some sozinho. Bloqueiam a produção só os três itens do
`CLAUDE.md` (registro da empresa, RT, WhatsApp), além de termo vetado ou mídia referenciada sem
consentimento. O bloco abaixo é gerado por `pnpm pendencias`; as seções seguintes são manuais.

<!-- auto:inicio -->
## O que a clínica pode acrescentar (gerado por `pnpm pendencias`)

**Para publicar faltam 4 item(ns):**
- [ ] Número do registro da empresa (Plenus) no CREFITO.
- [ ] Nome completo do responsável técnico (RT).
- [ ] CREFITO do responsável técnico (RT).
- [ ] WhatsApp real em pelo menos um canal (clínica ou profissional).

### Identificação da clínica
- [ ] Razão social (aparece na identificação do rodapé).
- [ ] CNPJ (aparece na identificação do rodapé).

### Equipe
- [ ] Com nome completo + CREFITO, Adrian (sócio) passa a aparecer no site (cards, textos e vídeos).
- [ ] Com nome completo + CREFITO, Natalia passa a aparecer no site (cards, textos e vídeos).

### Endereço e contato
- [ ] Número do endereço.
- [ ] Complemento do endereço (sala, andar).
- [ ] WhatsApp da clínica (recepção).
- [ ] Telefone fixo.
- [ ] Horários de atendimento (ex.: "Segunda a sexta, 7h às 20h").
- [ ] Domínio de produção (melhora SEO, canonical e sitemap).
- [ ] Link do perfil no Google (abre o mapa e as avaliações fora do site).

### Vídeos
- [ ] Slot de vídeo vago (a seção não aparece). Preencher com vídeo liberado.
- [ ] Slot de vídeo vago (a seção não aparece). Preencher com vídeo liberado.

### Conteúdo e vocabulário
- [ ] Confirmar se o Pilates é conduzido por fisioterapeuta (permite descrevê-lo como recurso do plano terapêutico).
- [ ] Confirmar os recursos usados na clínica para listá-los: Bandagem elástica (taping), Compressão pneumática (bota), Drenagem linfática, Laserterapia.
- [ ] Área "Fisioterapia geriátrica" inativa: confirmar se a clínica atende para exibi-la.

### Outros
- [ ] E-mail para pedidos de privacidade (hoje o canal é o WhatsApp).

<!-- auto:fim -->

## Avisos herdados da preparação do repositório
- [ ] Copy do hero e das seções: pesquisar (`docs/pesquisa/`), escrever o copy deck e aprovar com a clínica.

## Lote 01: logo e fotos (ver docs/marca/LOGO.md)
- [ ] Pedir o **arquivo original do logo** (AI/SVG/PDF ou PNG ≥ 2000 px): permite vetorizar as figuras e refazer PLENUS sem ondulação.
- [ ] Confirmar o nome da fonte do logo (o subtítulo dos lockups usa Figtree, a fonte do site).
- [ ] Aprovar os lockups provisórios (sem as figuras) ou esperar o original.
- [ ] Fotos dos profissionais em **alta resolução** (as atuais são avatares 150x150).
- [ ] Dizer qual foto é de qual profissional (`pessoa-foto-a` / `pessoa-foto-b`).
- [ ] Autorização de uso de imagem **por escrito** de cada profissional (hoje: confirmada pelo cliente).

## Vídeos lote 01 (ver docs/midia/VIDEOS-LOTE-01.md)
- [ ] Transcrever o áudio dos 3 vídeos e revisar os `.vtt` (confirmar se é fala ou música; música exige checar direito autoral).
- [ ] P-001: TCLE da paciente, data de gravação, quem atende (nome completo + CREFITO), quem aplica o laser; decidir se vale o corte ~34–52 s com marca coberta.
- [ ] P-002: TCLE, data; regravar sem texto sobreposto; escrever o conteúdo educativo sobre retorno ao esporte com pesquisa em `docs/pesquisa/`.
- [ ] Confirmar que o espaço dos vídeos 2 e 3 é a Plenus.
- [ ] Curso: autorização da instrutora, título/registro, termo de imagem dos participantes e dados do curso (módulo futuro "Cursos").
- [ ] Guardar os vídeos (originais e derivados) em armazenamento privado fora do git; o repositório é público. Conferir com o sha256 do manifesto.
- [ ] Confirmar o título do hero: "Fisioterapia e Pilates em Lages".
