# Zuri — Roteiro de Defesa
### Guião de apresentação · 6 apresentadores · 25 min + perguntas

> Objectivo: uma defesa fluida em que **todos falam bem** e por igual. Cada pessoa tem uma
> parte fechada, com o que dizer, o que mostrar, a frase de transição e uma dica de entrega.
> A app está em https://zuribook.page — ter aberta em telemóvel **e** computador para a demo.

---

## Distribuição e tempos

| Ordem | Pessoa | Parte | Tempo |
|---|---|---|---|
| 1 | _[Nome 1]_ | Abertura · Problema · *Design* (Figma) | 4 min |
| 2 | _[Nome 2]_ | Arquitectura · *Zero-Trust* | 4 min |
| 3 | _[Nome 3]_ | Modelo de dados · segurança de acesso | 4 min |
| 4 | _[Nome 4]_ | Pagamento · subscrição · protecção do conteúdo | 4,5 min |
| 5 | _[Nome 5]_ | *Offline* · gamificação · partilha | 4 min |
| 6 | _[Nome 6]_ | Infraestrutura · **demo ao vivo** · conclusão | 5 min |
| — | Todos | Perguntas & respostas | ~5 min |

**Total:** ~25,5 min de fala + 5 min de perguntas. Para encurtar para 20, cada um corta o exemplo
mais longo da sua parte e a demo fica em 2 min.

---

## Regras de ouro (para todos)
- **Não leiam os diapositivos.** O slide é apoio; vocês contam a história.
- **Uma ideia por frase.** Falem devagar; pausa vale mais que pressa.
- **Olhem para o júri**, não para o ecrã. Sorriam na primeira e na última frase.
- **Passem a palavra pelo nome:** "para explicar X, passo a palavra ao/à ___".
- Ninguém diz "não sei" sozinho — "boa pergunta, o/a ___ trabalhou essa parte".
- Termos técnicos: digam **o quê** antes do **como** (ex.: "para proteger os livros — ou seja,
  impedir que sejam copiados de graça — fizemos…").

---

## 1 · Abertura · Problema · Design — _[Nome 1]_ · 4 min
**Diapositivos:** capa (nome do grupo) · fluxo de ecrãs (Figura 1) · Figma vs app real.

**Fala (guião):**
- "Bom dia. Somos o grupo ___ e vamos apresentar o **Zuri** — uma aplicação de **leitura digital
  por subscrição** pensada para o contexto moçambicano."
- **O problema:** livros são caros e pouco acessíveis; a internet móvel é dispendiosa; e o meio de
  pagamento que as pessoas usam é o **M-Pesa**, não o cartão de crédito.
- **A nossa resposta:** uma app instalável **sem loja de aplicações**, que funciona **offline** e
  se paga por M-Pesa — por cerca de **45 MT/mês**.
- **Como chegámos ao produto:** começámos no **Figma** — investigação, *wireframes*, sistema de
  *design* (cores, tipografia, componentes) e um protótipo navegável. As fichas de estilo do
  Figma passaram directamente para o código, o que deu **fidelidade** entre o desenho e o resultado
  (mostrar a comparação lado a lado).
- "Vou passar a palavra ao/à **___**, que vos vai explicar como a app está construída por dentro."

**Dica:** és a cara inicial — postura aberta, ritmo calmo. Vende o **problema** antes da solução;
o júri tem de sentir que isto resolve algo real.

---

## 2 · Arquitectura · Zero-Trust — _[Nome 2]_ · 4 min
**Diapositivos:** arquitectura em 4 camadas (Figura 2).

**Fala (guião):**
- "O Zuri organiza-se em **quatro camadas**: o **cliente** (a app no telemóvel), o **controlo de
  acesso**, os **dados e conteúdo**, e o **pagamento**."
- **Porquê PWA:** um só código serve telemóvel, *tablet* e computador; instala-se sem loja;
  actualiza-se instantaneamente. É a decisão que melhor se adapta ao nosso público.
- **O princípio central — *Zero-Trust*:** "nunca confiamos no cliente". Explicar com uma frase forte:
  "mesmo que alguém manipule a aplicação no telemóvel, **não consegue** aceder a dados de outros
  nem activar uma subscrição — porque essas decisões são tomadas no **servidor**, não no telemóvel."
- Dois exemplos concretos: a autorização é feita **por registo** na base de dados; e o progresso de
  leitura **nunca pode regredir**, porque o servidor impõe isso.
- "Sobre como os dados estão organizados e protegidos, passo a palavra ao/à **___**."

**Dica:** esta é a parte "cérebro". Diz o *Zero-Trust* devagar e repete-o — é o conceito que o júri
vai lembrar. Usa as mãos para desenhar as camadas no ar.

---

## 3 · Modelo de dados · segurança de acesso — _[Nome 3]_ · 4 min
**Diapositivos:** diagrama entidade-relação (Figura 3) · tabela de políticas de acesso.

**Fala (guião):**
- "O modelo tem **dez entidades** — perfis, catálogo, progresso, subscrições, pagamentos,
  estatísticas, pedidos de livros e votação, favoritos e notificações."
- **Isolamento entre utilizadores:** "cada pedido à base de dados só devolve os dados a que o
  utilizador tem direito. Não há lógica de permissões no telemóvel — está tudo imposto no servidor,
  ao nível de cada linha." (apontar a tabela: catálogo público; dados pessoais só do próprio;
  subscrições e pagamentos **não podem ser escritos pelo cliente**.)
- **Integridade garantida pela base de dados**, independentemente do cliente: o progresso nunca
  regride (fica sempre o valor máximo); a contagem de votos mantém-se consistente; e criar uma conta
  inicializa perfil, estatísticas e subscrição de forma atómica.
- "Um dos pontos mais interessantes é como tratamos o **pagamento e a protecção dos livros** —
  passo a palavra ao/à **___**."

**Dica:** não leias os nomes das tabelas todos — escolhe 3 e explica a **regra** (isolamento).
Mostra o diagrama e aponta enquanto falas.

---

## 4 · Pagamento · subscrição · protecção do conteúdo — _[Nome 4]_ · 4,5 min
**Diapositivos:** sequência do pagamento (Figura 4) · estados da subscrição (Figura 5) · estados do
conteúdo (Figura 6).

**Fala (guião):**
- **Pagamento M-Pesa:** "seguimos o modelo *Customer-to-Business* da Vodacom. O ponto-chave de
  segurança: a subscrição **só é activada no servidor**, nunca pelo telemóvel." (percorrer a
  sequência: pedido → PIN no telemóvel → confirmação → activação → validade de 1 mês.)
- Ser honesto e seguro: "a **orquestração** está feita; a ligação final ao M-Pesa depende das
  credenciais de *merchant*, por isso está em **modo controlado** — mas a subscrição já **persiste
  com validade real** e a activação já é server-side."
- **Protecção do conteúdo (o nosso destaque técnico):** "de que serve um *paywall* se qualquer um
  descarrega o livro? No Zuri os ficheiros estão num **armazém privado**; quando abres um livro, um
  **porteiro no servidor verifica a tua subscrição** e só então entrega um **link temporário** que
  expira em 2 minutos. Sem subscrição activa, o livro **não abre**."
- "Mas uma app de leitura tem de funcionar **sem internet** — e sobre isso fala o/a **___**."

**Dica:** é a parte mais forte tecnicamente. A frase "de que serve um paywall se qualquer um
descarrega o livro?" é o teu gancho — faz uma pausa depois. Não prometas o que não está feito
(M-Pesa): diz "modo controlado", com confiança.

---

## 5 · Offline · gamificação · partilha — _[Nome 5]_ · 4 min
**Diapositivos:** sincronização (Figura 7) · gamificação (Figura 8) · ciclo de partilha (Figura 9).

**Fala (guião):**
- **Offline-first:** "o utilizador **descarrega** o livro e lê **sem rede** — no avião, no
  *chapa*, onde não há dados. O progresso guarda-se localmente e sincroniza depois."
- **Resolução de conflitos:** "se leste offline e havia outra posição no servidor, **fica sempre a
  mais avançada** — nunca perdes leitura." (regra de monotonia, no cliente e no servidor.)
- **Gamificação:** experiência, **quatro níveis**, sequência de dias de leitura (*streak*), livros
  concluídos e horas — para criar **hábito**. Subir de nível gera uma notificação.
- **Partilha:** cartões visuais com os dados reais do leitor, partilhados pelo menu do telemóvel —
  um **motor de crescimento** orgânico (partilha → amigos instalam → partilham).
- "Para fechar, o/a **___** mostra a infraestrutura e a app a funcionar ao vivo."

**Dica:** esta parte é a mais "simpática" — fala com energia. Liga tudo ao público: dados caros →
offline; hábito → gamificação; boca-a-boca → partilha.

---

## 6 · Infraestrutura · Demo ao vivo · Conclusão — _[Nome 6]_ · 5 min
**Diapositivos:** implantação/CI-CD (Figura 10) · tabela de capacidade. Depois: **app ao vivo**.

**Fala (guião):**
- **Infra e custo:** "está tudo em **escalões gratuitos** — zero de custo até à ordem dos 10 000
  utilizadores. Cada envio de código é publicado automaticamente." (mostrar a Figura 10 rápido.)
- **Demo (o momento alto — ~2 min):** seguir o guião de demo abaixo.
- **Conclusão:** "o Zuri mostra que dá para construir um produto **real, seguro e barato** para o
  nosso mercado: instalável, que funciona offline, com o conteúdo protegido e pago por M-Pesa. Os
  próximos passos são ligar o M-Pesa de produção e alargar o catálogo. Obrigado."

**Dica:** ensaia a demo **3 vezes**. Tem um **plano B** (capturas de ecrã / vídeo curto) caso a
internet falhe. Fala enquanto navegas — silêncio a mexer no telemóvel mata a energia.

### Guião da demo (curto e ensaiado)
1. **No computador:** abrir `zuribook.page` → mostrar a **barra lateral** e a grelha de livros
   (responsivo). Alternar **claro/escuro** no topo.
2. **Entrar com Google** (ou já entrado) → abrir um livro → **ler** (virar página com *swipe*).
3. **No telemóvel** (espelhar se possível): o **mesmo código**, layout de telemóvel, tab bar em baixo.
4. **Descarregar** um livro → mostrar que fica em "Baixados" (offline).
5. **Partilhar** um cartão (Wrapped/Streak) → mostrar o menu de partilha.
6. Frase de fecho enquanto mostras o ecrã principal: "um só código, tudo isto, de graça de manter."

---

## Perguntas prováveis & respostas (preparação)
> Regra: responde quem tem a parte. Se travarem, "passo essa ao/à ___".

| Pergunta do júri | Quem responde | Resposta curta |
|---|---|---|
| Porquê PWA e não app nativa? | 2 / 6 | Um código para tudo, sem loja, actualização instantânea, instalável — ideal para o nosso público e orçamento. |
| Como impedem a pirataria dos livros? | 4 | Ficheiros em armazém **privado** + porteiro no servidor que verifica subscrição + **link assinado que expira**. |
| O pagamento M-Pesa funciona mesmo? | 4 | A orquestração e a activação server-side estão feitas; a ligação final depende de credenciais de *merchant* — está em modo controlado, mas a subscrição já é real e com validade. |
| Um utilizador vê dados de outro? | 3 | Não — autorização **por linha** na base de dados; o cliente não tem poder para isso. |
| E se editarem o progresso no telemóvel? | 3 / 5 | O servidor impõe **monotonia** — o progresso nunca regride. |
| Quanto custa? Escala? | 6 | Zero até ~10 000 utilizadores (escalões gratuitos); acima disso, passagem a escalões pagos sem mudar a arquitectura. |
| Como funciona offline? | 5 | O EPUB é guardado no dispositivo; lê-se sem rede; sincroniza quando volta a internet. |
| Porquê Supabase/Cloudflare? | 2 / 6 | Base de dados com segurança por linha + armazenamento com saída de dados gratuita, tudo em escalão gratuito durável. |
| Testaram com utilizadores? | 1 | Protótipo navegável no Figma para validação; a app pública permite testes reais contínuos. |
| Acessibilidade / idioma? | 1 | Interface **100% em português**; contraste e alvos de toque adequados; tema claro/escuro. |
| O que fariam a seguir? | 6 | M-Pesa de produção, mais catálogo, notificações *push* e observabilidade. |

---

## Frase de encerramento (grupo)
> _[Nome 6]_ termina; todos ficam de frente para o júri:
> **"O Zuri já está online, instalável e a funcionar. Estamos disponíveis para as vossas perguntas. Obrigado."**

**Antes de entrar:** app aberta nos dois ecrãs · plano B pronto · cada um sabe a sua primeira e
última frase de cor · combinar quem controla os diapositivos.
