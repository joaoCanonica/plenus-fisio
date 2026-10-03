# Perfil da Plenus no Google (Perfil da Empresa / "Google Meu Negócio")

Objetivo: o perfil no Google, o site e o Instagram mostram **exatamente** os mesmos nome, endereço,
telefone e horários (NAP). O site lê esses dados de `src/config/profile.config.ts`; o schema (JSON-LD) e o
`llms.txt` são gerados da mesma fonte, e `pnpm build` confere que estão iguais na página.

## 1. Reivindicar o perfil existente

1. Em https://business.google.com, busque "Plenus Fisioterapia & Pilates Lages".
2. Se o perfil já existe e outra pessoa administra: "Solicitar acesso". Se ninguém administra: "Reivindicar".
3. Verificação: o Google escolhe o método (vídeo do local, ligação, SMS ou carta). O vídeo costuma pedir a
   fachada, a placa com o nome e o interior com os aparelhos. Grave sem pacientes no quadro.
4. Depois de verificado, adicione o Adrian e a Natalia como administradores (não use uma conta só).

## 2. Dados (copiar do site, sem variações)

| Campo | Valor | Fonte no site |
|---|---|---|
| Nome | `Plenus Fisioterapia & Pilates` (sem palavras extras como "Lages" ou "melhor") | `clinica.nomeFantasia` |
| Categoria principal | **Fisioterapeuta** | — |
| Categorias secundárias | Estúdio de Pilates (se o Pilates for oferecido no local) | — |
| Endereço | Rua Marechal Deodoro, {número}, {complemento}, Centro, Lages (SC), 88501-003 | `clinica.endereco` |
| Telefone principal | o mesmo WhatsApp da clínica, no formato (49) XXXXX-XXXX | `clinica.whatsapp` |
| Site | o domínio de produção | `clinica.dominio` |
| Horários | os mesmos de `clinica.horarios` | `clinica.horarios` |
| Descrição (até 750 caracteres) | texto abaixo | copy deck |

Quando o perfil estiver ativo, copie para `profile.config.ts`:
- `googleMeuNegocio`: link do perfil (botão "Compartilhar" no Maps). Vira o link "Abrir no Google Maps" do site e entra no `sameAs` do schema.
- `geo`: latitude e longitude do pino (clique com o botão direito no pino, no Maps).

**Descrição sugerida** (vocabulário do conselho, sem promessa):

> A Plenus Fisioterapia & Pilates fica no Centro de Lages (SC). Oferece consulta fisioterapêutica e
> atendimento em fisioterapia ortopédica, esportiva, na gestação e no pós-parto, e Pilates em solo e em
> aparelhos. Cada atendimento começa com uma consulta fisioterapêutica e segue um plano terapêutico
> individual. Agendamento pelo WhatsApp. Registro da empresa no CREFITO-10 nº {registro}. Responsável técnico:
> {nome completo}, CREFITO-10 {número}.

## 3. Serviços (aba "Serviços", sem preço)

Use os mesmos nomes do site: Consulta fisioterapêutica · Fisioterapia traumato-ortopédica · Fisioterapia
esportiva · Fisioterapia obstétrica e pélvica · Pilates. Descrição curta de cada um: copiar o "O que é" do
copy deck. **Não preencher o campo de preço.**

## 4. Fotos

- Fachada (de dia, com a placa legível), recepção, sala de atendimento, aparelhos de Pilates, área de exercícios.
- Sem pacientes. Se aparecer alguém, só com TCLE ou autorização por escrito (as mesmas regras do site).
- Sem retoque e sem filtros que alterem o ambiente. Recorte é permitido.
- As mesmas fotos, cadastradas no `media.manifest.json` com `categoria: "espaco"`, ativam "Conheça o espaço" no site.

## 5. Postagens (uma a cada 2 a 4 semanas)

Formatos que funcionam sem dado de paciente:
- "Como é a primeira consulta fisioterapêutica" (os 5 passos do site).
- Uma pergunta do FAQ do site por postagem, com o link para o site.
- Novidades do espaço (aparelho novo, horário de feriado).

Proibido nas postagens: preço, promoção, "grátis", "antes e depois", promessa ("acabe com a dor"), depoimentos
de pacientes que prometam resultado, fotos de pacientes sem TCLE.

## 6. Avaliações

- Responder todas com cordialidade e **sem confirmar que a pessoa é paciente** nem citar qualquer dado de saúde
  (ex.: "Obrigado pela mensagem. Ficamos à disposição pelo WhatsApp.").
- Não oferecer nada em troca de avaliação.

## 7. Conferência trimestral

- [ ] Nome, endereço, telefone e horários iguais no site, no Google e no Instagram.
- [ ] Link do site e do Instagram corretos no perfil.
- [ ] Horários especiais de feriado cadastrados.
