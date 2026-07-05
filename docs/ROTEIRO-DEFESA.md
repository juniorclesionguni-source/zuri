# Zuri — Roteiro de Defesa (SEM slides)
### Apresentação com a app ao vivo · 6 apresentadores · ~25 min + perguntas

> **Sem slides.** O apoio visual é a **própria aplicação**, projectada num ecrã/TV (ou num
> portátil que o júri veja). Cada pessoa **mostra a sua parte na app** enquanto fala. Os conceitos
> que não se veem (arquitectura, segurança) explicam-se com **analogias**.
> App: https://zuribook.page — abrir **antes** de começar, com sessão iniciada.

---

## Preparação (5 min antes de entrar)
- **App aberta e projectada** no computador (com a **barra lateral** visível) **e** num **telemóvel**
  (para a parte mobile). Sessão Google já iniciada; um livro **já descarregado** (para a demo offline).
- **Subscrição activa** na app (fazer o pagamento simulado antes, para não gastar tempo).
- **Plano B** (se a internet falhar): o livro descarregado abre offline; ter também 3–4 **capturas no
  telemóvel** (leitor, perfil, partilha).
- Combinar **quem conduz a app** em cada momento (idealmente cada apresentador conduz a sua parte).
- Opcional: um **quadro/flipchart** para quem quiser desenhar as 4 camadas (P2).

## Distribuição e tempos
| # | Pessoa | Parte | Tempo |
|---|---|---|---|
| 1 | _[Nome 1]_ | Abertura · Problema · *Design* | 4 min |
| 2 | _[Nome 2]_ | Arquitectura · *Zero-Trust* | 4 min |
| 3 | _[Nome 3]_ | Dados · isolamento por utilizador | 4 min |
| 4 | _[Nome 4]_ | Pagamento · subscrição · segurança do conteúdo (desenho) | 4 min |
| 5 | _[Nome 5]_ | *Offline* · gamificação · partilha | 4,5 min |
| 6 | _[Nome 6]_ | Infraestrutura · responsividade ao vivo · conclusão | 4,5 min |
| — | Todos | Perguntas & respostas | ~5 min |

## Regras de ouro (sem slides, ainda mais importantes)
- **A app é o vosso slide** — *mostrem*, não só falem. "Reparem aqui…", "vou abrir…".
- **Falem enquanto navegam** — nunca mexer na app em silêncio de costas para o júri.
- **Conceitos invisíveis → analogias** (banco, porteiro, cofre). Uma boa imagem mental vale um diagrama.
- **Sinalizem por voz:** "três coisas: primeira…, segunda…, terceira." Ajuda o júri a seguir sem slides.
- **Passem a palavra pelo nome:** "para isto, o/a ___".
- **Sejam honestos** com o estado: o que está feito, feito; o que é desenho, dizem "desenhámos / o próximo passo".

---

## 1 · Abertura · Problema · Design — _[Nome 1]_ · 4 min
**Na app:** deixar a **Home** no ecrã (mas só a mostrar no fim desta parte).

**Fala:**
- "Bom dia. Somos o grupo ___ e construímos o **Zuri** — uma app de **leitura digital por
  subscrição** para o mercado moçambicano."
- **Problema (contar como história, sem pressa):** "os livros são caros; a internet móvel é cara; e
  as pessoas pagam por **M-Pesa**, não por cartão. Uma app de leitura para cá tem de nascer barata,
  funcionar mal-servida de rede, e cobrar por M-Pesa."
- **Solução:** "uma app que se **instala sem loja**, funciona **offline**, e custa ~45 MT/mês."
- **Design:** "começámos no **Figma** — estudámos os utilizadores, fizemos os esboços, um sistema de
  cores e tipografia, e um protótipo clicável. Depois passámos esse desenho directamente para código."
  → **mostrar a Home na app**: "este é o resultado — reparem na identidade, no tema claro/escuro aqui
  em cima." (tocar no ☀️/🌙 ao vivo.)
- "Para explicar como isto funciona por dentro, passo ao/à **___**."

**Dica:** és o aquecimento. Vende o **problema** primeiro — o júri tem de sentir que é real. Ao mostrar
a Home, muda o tema ao vivo: é um "uau" pequeno e imediato.

---

## 2 · Arquitectura · Zero-Trust — _[Nome 2]_ · 4 min
**Sem visual** (ou desenhar 4 caixas no quadro enquanto falas).

**Fala:**
- "O Zuri tem **quatro camadas**." (enumera com os dedos / desenha) "**Um:** o telemóvel, a app.
  **Dois:** o controlo de acesso. **Três:** os dados e os livros. **Quatro:** o pagamento M-Pesa."
- **Porquê PWA (uma frase forte):** "escolhemos uma *web app* instalável — **um só código** serve
  telemóvel, tablet e computador, sem loja e com actualização imediata."
- **Zero-Trust com analogia (o coração desta parte):** "a nossa regra é **nunca confiar no telemóvel**.
  Pensem num **banco**: o cliente ao balcão pode dizer o que quiser, mas quem decide é o banco, lá
  dentro. No Zuri é igual — mesmo que alguém mexa na app, **não consegue** ver dados de outros nem
  activar uma subscrição, porque essas decisões são tomadas no **servidor**."
- "E os dados? Como garantimos que são mesmo só teus? O/a **___** explica."

**Dica:** esta é a parte 'cérebro' e é a que mais se perde sem visual — por isso a analogia do banco é
o teu diagrama. Di-la devagar e repete "nunca confiar no telemóvel".

---

## 3 · Dados · isolamento por utilizador — _[Nome 3]_ · 4 min
**Na app:** a **Biblioteca** e o **Perfil** do próprio (mostrar "isto é meu").

**Fala:**
- "Por trás há uma base de dados com o catálogo, os utilizadores, o **progresso de leitura**,
  subscrições, favoritos, estatísticas e notificações."
- **Isolamento (a ideia-chave):** "a regra de ouro é: **cada um só vê o que é seu**. Isto não está
  garantido no telemóvel — está imposto na **base de dados**, registo a registo. Mesmo que eu tente
  pedir os dados de outra pessoa, a base de dados devolve **vazio**." (mostrar a biblioteca/perfil:
  "estes livros, este progresso, são da minha conta.")
- **Integridade (exemplo concreto):** "e há regras que a base de dados nunca deixa quebrar — por
  exemplo, o **progresso de leitura nunca anda para trás**. Se por algum motivo chegasse um valor
  menor, o servidor **mantém o mais avançado**. Nunca perdes a página onde ias."
- "Agora, o modelo de negócio — como se paga e como se protege o que é pago. Passo ao/à **___**."

**Dica:** não enumeres tabelas. Conta a **história dos dados de UM utilizador** e martela o
"cada um só vê o que é seu". Mostrar a app torna-o concreto.

---

## 4 · Pagamento · subscrição · segurança do conteúdo — _[Nome 4]_ · 4 min
**Na app (demo):** o fluxo do **paywall → pagamento → sucesso** (ou explicar se já subscrito).

**Fala:**
- **Pagamento M-Pesa:** "a subscrição é mensal e paga-se por **M-Pesa**, seguindo o fluxo da Vodacom:
  pedes, recebes o **PIN no telemóvel**, confirmas, e a subscrição activa-se **do lado do servidor**."
  → mostrar na app o ecrã de subscrição/checkout.
- **Ser honesto:** "no nosso protótipo o pagamento está em **modo simulado** — a integração final com o
  M-Pesa depende das credenciais de comerciante da Vodacom. Mas o **fluxo e a validade da subscrição**
  já estão implementados."
- **Segurança do conteúdo (apresentar como DESENHO, não como demo):** "uma pergunta que nos fizemos:
  *de que serve cobrar se qualquer um copia o livro?* A nossa resposta de arquitectura é um **porteiro**
  no servidor — quando abres um livro, o servidor **verifica a subscrição** e só então entrega um
  **acesso temporário** ao ficheiro. **Desenhámos e prototipámos** este mecanismo; no MVP actual o
  foco esteve na experiência de leitura, e este reforço de segurança é o **próximo passo**."
- "Mas uma app de leitura para cá tem de brilhar **sem internet** — e sobre isso, o/a **___**."

**Dica:** a frase "*de que serve cobrar se qualquer um copia o livro?*" é o teu gancho — pausa depois.
Diz "**desenhámos / próximo passo**" com naturalidade; mostra maturidade, não fraqueza.

---

## 5 · Offline · gamificação · partilha — _[Nome 5]_ · 4,5 min
**Na app (demo, a parte mais visual):** descarregar → ler offline → perfil/stats → gerar um cartão.

**Fala:**
- **Offline (mostrar):** "isto é o que mais nos orgulha para o nosso contexto." → num livro, tocar
  **Baixar** (mostrar a barra), ir a **Baixados**. "Agora — atenção — vou **desligar a internet**…"
  (activar modo avião no telemóvel) "…e o livro **abre na mesma**." (abrir e virar uma página offline.)
- **Sem perder leitura:** "o progresso guarda-se no aparelho e sincroniza depois; e fica sempre o
  ponto **mais avançado**."
- **Gamificação (mostrar Perfil):** "para criar **hábito** — experiência, **quatro níveis**, dias
  seguidos de leitura, livros terminados, horas. Subir de nível dá uma notificação." (mostrar o Perfil
  / Stats detalhados.)
- **Partilha (mostrar):** "e o crescimento é orgânico — o leitor gera um **cartão** com os seus números
  reais e partilha pelo menu do telemóvel." → abrir a partilha, mostrar um cartão, tocar **Partilhar**.
- "Para fechar — onde isto vive e quanto custa — o/a **___**."

**Dica:** é a parte que arranca sorrisos. O momento **modo avião → o livro abre** é o ponto alto de
toda a defesa — ensaia-o até sair perfeito. Fala com energia.

---

## 6 · Infraestrutura · Responsividade ao vivo · Conclusão — _[Nome 6]_ · 4,5 min
**Na app (ao vivo):** redimensionar a janela do browser; alternar telemóvel/computador.

**Fala:**
- **Infra e custo (verbal, curto):** "está tudo em **escalões gratuitos** — **zero de custo** até à
  ordem dos 10 000 utilizadores. E cada alteração ao código é **publicada automaticamente**."
- **Responsividade (mostrar, o truque final):** "e é **um só código**." → **arrastar a janela do
  browser de larga para estreita**: "reparem — no computador tem **barra lateral**; ao estreitar,
  vira **app de telemóvel** com a barra em baixo. O mesmo código, em qualquer ecrã." (mostrar também
  no telemóvel a instalar/aberta.)
- **Conclusão:** "o Zuri mostra que dá para fazer um produto **real, barato e adequado ao nosso
  mercado** — instalável, offline, pago por M-Pesa. Os próximos passos são o **M-Pesa de produção**,
  o **reforço da segurança do conteúdo** e **mais catálogo**. Obrigado."

**Dica:** o redimensionar ao vivo é um remate visual forte sem slides — pratica para ser fluido.
Termina de frente para o júri, não para o ecrã.

---

## Perguntas prováveis & respostas
> Responde quem tem a parte. Se travarem: "essa parte trabalhou-a o/a ___".

| Pergunta | Quem | Resposta curta (honesta) |
|---|---|---|
| Porquê PWA e não app nativa? | 2 / 6 | Um código para tudo, sem loja, actualização imediata, instalável — ideal para o público e o orçamento. |
| O pagamento M-Pesa funciona mesmo? | 4 | O fluxo e a validade da subscrição estão feitos; a ligação final ao M-Pesa depende de credenciais de comerciante — está em modo simulado. |
| Como impedem a cópia dos livros? | 4 | **Desenhámos** um porteiro no servidor (acesso ao ficheiro só a subscritores, por link temporário); é o próximo reforço — no MVP o foco foi a leitura. |
| Um utilizador vê dados de outro? | 3 | Não — o isolamento é imposto na base de dados, registo a registo; o telemóvel não tem esse poder. |
| E se editarem o progresso no telemóvel? | 3 / 5 | O servidor garante que **nunca regride** — fica sempre o mais avançado. |
| Como funciona offline? | 5 | O livro é guardado no aparelho; lê-se sem rede; sincroniza quando a internet volta. (E mostrámos ao vivo.) |
| Quanto custa? Escala? | 6 | Zero até ~10 000 utilizadores (escalões gratuitos); acima disso, passa a escalões pagos sem mudar a arquitectura. |
| Testaram com utilizadores? | 1 | Protótipo clicável no Figma para validar; a app está pública, o que permite testes reais. |
| Idioma / acessibilidade? | 1 | 100% em português; contraste, alvos de toque e tema claro/escuro. |
| O que fariam a seguir? | 6 | M-Pesa de produção, segurança do conteúdo, notificações *push*, mais catálogo. |

---

## Encerramento (grupo)
> _[Nome 6]_ termina; todos de frente para o júri:
> **"O Zuri está online, instalável e a funcionar — acabaram de o ver ao vivo. Ficamos para as vossas perguntas. Obrigado."**

**Checklist final antes de entrar:** app aberta nos dois ecrãs · subscrição activa · um livro
descarregado · modo avião testado · cada um sabe a 1ª e a última frase · plano B (capturas) no bolso.
