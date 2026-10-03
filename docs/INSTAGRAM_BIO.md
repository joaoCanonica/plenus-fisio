# Instagram @plenusfisioterapia.lages: bio sugerida

Objetivo: o perfil identifica a clínica como o site (COFFITO: pessoa jurídica com registro da empresa e
responsável técnico), sem frase promissora, e leva para o site, onde estão as áreas, as fontes e o WhatsApp.

## Nome do perfil (até 30 caracteres)

`Plenus Fisioterapia & Pilates` (29)

## Categoria

Fisioterapeuta (ou "Clínica de saúde", se disponível na conta comercial).

## Bio (até 150 caracteres)

Preencha as chaves com os dados reais. Só publique quando houver o número do registro da empresa e o RT;
os mesmos dados bloqueiam o site em produção, então os dois ficam prontos juntos.

**Versão principal** (cerca de 146 caracteres com um nome de RT de três palavras):

```
Fisioterapia e Pilates em Lages (SC)
CREFITO-10 nº {registro da empresa} · RT: {nome completo do RT}, CREFITO-10 {número}
Agende sua consulta fisioterapêutica ↓
```

**Versão curta** (se o nome do RT não couber; o nome completo continua no site, no rodapé):

```
Fisioterapia e Pilates em Lages (SC)
CREFITO-10 nº {registro da empresa} · RT CREFITO-10 {número}
Consulta fisioterapêutica pelo WhatsApp ↓
```

Conferir antes de publicar:
- Sem preço, pacote, promoção, "grátis", "o melhor", "referência", "especialista" (sem RQE), "cura", "garantia", "resultado".
- Vocabulário: "consulta fisioterapêutica" (não "avaliação"), "atendimento" (não "sessão"), "paciente" (não "aluno").
- Pilates: enquanto não estiver confirmado que é conduzido por fisioterapeuta, só "Pilates", sem "Pilates clínico".
- Nenhum emoji ou frase que sugira resultado ("transforme", "sem dor", "volte mais forte").

## Link da bio

**O site** (domínio de produção). Ele já reúne: áreas, primeira consulta, onde fica, FAQ e os WhatsApp por área,
com mensagem neutra. Assim a informação fica num lugar só e com as fontes.

### Linktree (alternativa, se a clínica preferir manter)

Usar só como **lista de atalhos**, sem repetir textos do site:
1. Site da Plenus (primeiro link)
2. WhatsApp (mesma mensagem neutra do site: "Olá, gostaria de agendar uma consulta fisioterapêutica.")
3. Como chegar (Google Maps)

Não colocar no Linktree: descrições de tratamento, preços, depoimentos, "antes e depois", formulário ou link
que peça dados de saúde. Se uma informação mudar, ela muda no site; o Linktree só aponta para lá.

## Destaques (stories fixados), sugestão

`Espaço` · `Pilates` · `Como chegar`. Fotos e vídeos de pacientes só com TCLE por escrito, com data do registro
e nome e CREFITO do profissional na publicação (as mesmas regras do site, `CLAUDE.md`).

## Publicações no site

O site mostra até 6 publicações escolhidas, como **imagens guardadas no próprio site** (sem embed e sem
nenhum script do Instagram). Para escolher: cadastre a imagem no `media.manifest.json` e o link da
publicação em `src/config/instagram.config.ts`. Publicação com paciente só entra com TCLE (`consentimento: "ok"`).
