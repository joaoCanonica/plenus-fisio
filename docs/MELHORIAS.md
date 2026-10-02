# Melhorias e avisos (não bloqueantes)

Itens que não impedem a publicação. Bloqueantes ficam só os três listados em `CLAUDE.md`.

## Avisos herdados da preparação do repositório
- [ ] Amostrar o verde do logo da Plenus e trocar as primitivas provisórias em `theme.config.ts` (`pnpm check`).
- [ ] Logo vetorizado (SVG, `currentColor`) para `Marca.astro` e `public/favicon.svg` (hoje placeholders).
- [ ] Definir a tipografia da marca (hoje Lato em tudo), self-hosted via `@fontsource`.
- [ ] Endereço por extenso, link do Google Maps e domínio de produção.
- [ ] Instagram da clínica (opcional).
- [ ] Copy do hero e das seções: pesquisar (`docs/pesquisa/`), escrever o copy deck e aprovar com a clínica.
- [ ] Implementar `opcional()` e a config de clínica (`docs/ARQUITETURA.md`).

## Lote 01: logo e fotos (ver docs/marca/LOGO.md)
- [ ] Pedir o **arquivo original do logo** (AI/SVG/PDF ou PNG ≥ 2000 px): permite vetorizar as figuras e refazer PLENUS sem ondulação.
- [ ] Confirmar o nome da fonte do logo (para o subtítulo e talvez para os títulos do site).
- [ ] Aprovar os lockups provisórios (sem as figuras) ou esperar o original.
- [ ] Aplicar o verde amostrado `#457147` ao tema (`pnpm check`).
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
