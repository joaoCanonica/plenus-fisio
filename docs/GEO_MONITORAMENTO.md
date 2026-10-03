# Monitoramento em assistentes de IA (GEO)

Objetivo: verificar, uma vez por mês, se ChatGPT, Perplexity e Gemini encontram a Plenus e descrevem a
clínica com os dados certos (nome, endereço, telefone, áreas) e sem atribuir promessas ou títulos que o site
não usa. O site ajuda com: respostas curtas e autossuficientes no FAQ, fontes com data, identificação perto do
topo, JSON-LD consistente, `robots.txt` liberando crawlers de IA e `/llms.txt`.

## Como fazer (cerca de 20 minutos por mês)

1. Use uma janela anônima e, quando possível, sem login (ou com uma conta sem histórico).
2. Faça as consultas abaixo nos três assistentes, com busca na web ativada.
3. Registre na tabela do mês: aparece? os dados estão certos? qual fonte foi citada?

## Consultas

| # | Consulta | O que conferir |
|---|---|---|
| 1 | fisioterapia em Lages SC | A Plenus aparece? Com o endereço certo? |
| 2 | Pilates em Lages SC | Aparece? Descreve o Pilates sem atribuir título não confirmado? |
| 3 | fisioterapia no pós-parto em Lages | Aparece? Sem promessa ("recupera a barriga", "cura")? |
| 4 | fisioterapia esportiva em Lages, retorno ao esporte | Aparece? |
| 5 | Plenus Fisioterapia e Pilates Lages telefone | Telefone e endereço iguais aos do site? |
| 6 | Plenus Fisioterapia horário de atendimento | Horários iguais aos do site e do Google? |
| 7 | como é a primeira consulta de fisioterapia na Plenus | Usa o texto do site? |
| 8 | quem é o responsável técnico da Plenus Fisioterapia | Nome e CREFITO corretos? |

## Registro mensal

| Mês | Assistente | Consultas em que aparece (1–8) | Dados errados (qual) | Fonte citada | Ação |
|---|---|---|---|---|---|
| 2026-11 | ChatGPT | | | | |
| 2026-11 | Perplexity | | | | |
| 2026-11 | Gemini | | | | |

## O que fazer quando algo estiver errado

- **Dado errado (telefone, endereço, horário):** corrigir primeiro na fonte (`profile.config.ts`, perfil do
  Google, bio do Instagram). Os três precisam ficar iguais. Os assistentes levam semanas para atualizar.
- **Promessa ou título atribuído à clínica:** procurar de onde veio (diretórios, avaliações, postagens antigas)
  e corrigir na origem. Nunca responder com conteúdo promocional.
- **A Plenus não aparece:** conferir se o site está em produção (`SITE_ENV=production`), se o `robots.txt`
  permite os crawlers e se o perfil do Google está verificado e com o link do site.

Não usar ferramentas pagas de "otimização para IA" nem criar páginas por bairro sem conteúdo real.
