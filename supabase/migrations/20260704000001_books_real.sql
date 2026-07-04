-- Substitui os livros de seed pelos EPUBs reais disponíveis.
-- epub_path: nome do ficheiro no bucket R2 "zuri-epubs".
-- pages/mins: estimativas provisórias (0 = desconhecido).

TRUNCATE books CASCADE;

INSERT INTO books (id, title, author, genre, synopsis, epub_path, pages, mins, is_published) VALUES
(
  'a-ex',
  'A Ex',
  'Freida McFadden',
  'Thriller',
  'Cassie pensa que encontrou o homem perfeito. Mas a sombra da ex dele, Francesca — bela, brilhante e adorada por todos — paira sobre a relação. À medida que os segredos se revelam, o perigo torna-se real.',
  'a-ex.epub',
  0, 0, false
),
(
  'a-pessoa-certa-e-voce',
  'A Pessoa Certa És Tu',
  'Sheleana Aiyana',
  'Auto-ajuda',
  'Um guia transformador para acabar com o ciclo de auto-abandono. A fundadora da comunidade Rising Woman oferece ferramentas práticas para curar traumas e transformar padrões de relacionamento.',
  'a-pessoa-certa-e-voce.epub',
  0, 0, false
),
(
  'alem-da-tempestade',
  'Além da Tempestade',
  'Cecelia Ahern',
  'Drama',
  'Da autora best-seller de P.S. Eu Te Amo, uma história envolvente sobre autodescoberta. Personagens à beira do precipício descobrem que as maiores tempestades são as que carregamos por dentro.',
  'alem-da-tempestade.epub',
  0, 0, false
),
(
  'como-arruinar-um-casamento',
  'Como Arruinar um Casamento',
  'Alison Espach',
  'Ficção',
  'Phoebe Stone chega a um luxuoso resort e é confundida com convidada de um casamento. Uma história comovente sobre amizades improváveis entre duas mulheres em fases muito diferentes da vida.',
  'como-arruinar-um-casamento.epub',
  0, 0, false
),
(
  'ninguem-nasce-sabendo',
  'Ninguém Nasce Sabendo',
  'Thomas Schultz',
  'Auto-ajuda',
  'Um guia prático para quem quer relacionamentos extraordinários. O psicólogo Thomas Schultz partilha ferramentas baseadas na prática clínica para construir ligações mais saudáveis e duradouras.',
  'ninguem-nasce-sabendo.epub',
  0, 0, false
),
(
  'no-rastro-da-mentira',
  'No Rastro da Mentira',
  'Amy Tintera',
  'Thriller',
  'Lucy é encontrada coberta de sangue da sua melhor amiga Savvy. Um podcaster de crime verdadeiro investiga o caso e, à medida que os factos se acumulam, a verdade revela-se mais perturbadora do que o esperado.',
  'no-rastro-da-mentira.epub',
  0, 0, false
),
(
  'nao-comecou-com-voce',
  'Não Começou com Você',
  'Mark Wolynn',
  'Auto-ajuda',
  'Como o trauma familiar herdado nos define — e como quebrar esse ciclo. Wolynn apresenta técnicas práticas para compreender e superar padrões transmitidos de geração em geração.',
  'nao-comecou-com-voce.epub',
  0, 0, false
),
(
  'nos-ja-moramos-aqui',
  'Nós Já Moramos Aqui',
  'Marcus Kliewer',
  'Thriller',
  'Charlie e Eve compram uma casa antiga no Oregon e começam a receber a visita de estranhos que alegam ter vivido lá. Eventos inexplicáveis criam uma tensão crescente que desafia a realidade.',
  'nos-ja-moramos-aqui.epub',
  0, 0, false
),
(
  'o-diabo-veste-cor-de-rosa',
  'O Diabo Veste Cor-de-Rosa',
  'Alexandria Bellefleur',
  'Romance',
  'Sam fica presa num elevador com Daphne, uma bela demónia vestida de rosa. Quando Daphne oferece seis desejos, uma comédia romântica sáfica irresistível começa a desenrolar-se.',
  'o-diabo-veste-cor-de-rosa.epub',
  0, 0, false
),
(
  'por-que-as-mulheres-amam-homens-fortes',
  'Por que as Mulheres Amam os Homens Fortes',
  'Elliott Katz',
  'Auto-ajuda',
  'O que as mulheres realmente procuram: um homem confiável, protetor e decisivo. Um guia com conselhos práticos para melhorar relacionamentos e restaurar o respeito mútuo.',
  'por-que-as-mulheres-amam-os-homens-fortes.epub',
  0, 0, false
),
(
  'por-que-ninguem-me-disse-isso-antes',
  'Por que Ninguém Me Disse Isso Antes',
  'Julie Smith',
  'Auto-ajuda',
  'A psicóloga clínica Julie Smith oferece ferramentas práticas para compreender sentimentos e padrões comportamentais. Um guia acessível para lidar com os altos e baixos inevitáveis da vida.',
  'por-que-ninguem-me-disse-isso-a.epub',
  0, 0, false
),
(
  'sem-chance-de-adeus',
  'Sem Chance de Adeus',
  'Harlan Coben',
  'Thriller',
  'Maggie McCabe, cirurgiã militar, recebe uma proposta que muda tudo. Uma parceria improvável com um cirurgião plástico leva-a a desvendar segredos enterrados há décadas — e a enfrentar o perigo de frente.',
  'sem-chance-de-adeus.epub',
  0, 0, false
),
(
  'um-crush-dos-infernos',
  'Um Crush dos Infernos',
  'Charlotte Ingham',
  'Romance',
  'Willow White morre aos 21 anos e desperta em Asfódelos, uma dimensão infernal. Para regressar à vida, deve completar sete missões — enquanto lida com sentimentos inesperados por quem nunca esperava.',
  'um-crush-dos-infernos.epub',
  0, 0, false
),
(
  'um-namorado-bom-pra-cachorro',
  'Um Namorado Bom pra Cachorro',
  'Brittainy Cherry',
  'Romance',
  'Yara, recém-divorciada, surpreende-se quando Alex concorda em fingir ser o seu namorado. Uma história sobre como o fingimento pode tornar-se genuinamente real — e como isso muda tudo.',
  'um-namorado-bom-pra-cachorro.epub',
  0, 0, false
);
