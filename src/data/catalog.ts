export interface Book {
  id: string
  title: string
  author: string
  pages: number
  genre: string
  rating: number
  mins: number
  synopsis?: string
  epub_path?: string
  cover_url?: string
}

const R2 = import.meta.env.VITE_R2_PUBLIC_URL ?? ''

export const BOOKS: Book[] = [
  { id: 'a-ex', title: 'A Ex', author: 'Freida McFadden', pages: 320, genre: 'Thriller', rating: 4.6, mins: 400, synopsis: 'Cassie pensa que encontrou o homem perfeito. Mas a sombra da ex dele paira sobre a relação. À medida que os segredos se revelam, o perigo torna-se real.', epub_path: `${R2}/a-ex.epub` },
  { id: 'a-pessoa-certa-e-voce', title: 'A Pessoa Certa És Tu', author: 'Sheleana Aiyana', pages: 280, genre: 'Auto-ajuda', rating: 4.4, mins: 350, synopsis: 'Um guia transformador para acabar com o ciclo de auto-abandono. Ferramentas práticas para curar traumas e transformar padrões de relacionamento.', epub_path: `${R2}/a-pessoa-certa-e-voce.epub` },
  { id: 'alem-da-tempestade', title: 'Além da Tempestade', author: 'Cecelia Ahern', pages: 340, genre: 'Drama', rating: 4.5, mins: 430, synopsis: 'Da autora de P.S. Eu Te Amo, uma história envolvente sobre autodescoberta. Personagens à beira do precipício descobrem que as maiores tempestades são as que carregamos por dentro.', epub_path: `${R2}/alem-da-tempestade.epub` },
  { id: 'como-arruinar-um-casamento', title: 'Como Arruinar um Casamento', author: 'Alison Espach', pages: 310, genre: 'Ficção', rating: 4.3, mins: 390, synopsis: 'Phoebe chega a um luxuoso resort e é confundida com convidada de um casamento. Uma história comovente sobre amizades improváveis entre duas mulheres em fases muito diferentes da vida.', epub_path: `${R2}/como-arruinar-um-casamento.epub` },
  { id: 'ninguem-nasce-sabendo', title: 'Ninguém Nasce Sabendo', author: 'Thomas Schultz', pages: 220, genre: 'Auto-ajuda', rating: 4.2, mins: 275, synopsis: 'Um guia prático para quem quer relacionamentos extraordinários. Ferramentas baseadas na prática clínica para construir ligações mais saudáveis e duradouras.', epub_path: `${R2}/ninguem-nasce-sabendo.epub` },
  { id: 'no-rastro-da-mentira', title: 'No Rastro da Mentira', author: 'Amy Tintera', pages: 380, genre: 'Thriller', rating: 4.5, mins: 475, synopsis: 'Lucy é encontrada coberta de sangue da sua melhor amiga. Um podcaster investiga o caso e a verdade revela-se mais perturbadora do que o esperado.', epub_path: `${R2}/no-rastro-da-mentira.epub` },
  { id: 'nao-comecou-com-voce', title: 'Não Começou com Você', author: 'Mark Wolynn', pages: 260, genre: 'Auto-ajuda', rating: 4.6, mins: 325, synopsis: 'Como o trauma familiar herdado nos define — e como quebrar esse ciclo. Técnicas práticas para compreender e superar padrões transmitidos de geração em geração.', epub_path: `${R2}/nao-comecou-com-voce.epub` },
  { id: 'nos-ja-moramos-aqui', title: 'Nós Já Moramos Aqui', author: 'Marcus Kliewer', pages: 290, genre: 'Thriller', rating: 4.3, mins: 365, synopsis: 'Charlie e Eve compram uma casa antiga e recebem visitas de estranhos que alegam ter vivido lá. Eventos inexplicáveis criam uma tensão crescente que desafia a realidade.', epub_path: `${R2}/nos-ja-moramos-aqui.epub` },
  { id: 'o-diabo-veste-cor-de-rosa', title: 'O Diabo Veste Cor-de-Rosa', author: 'Alexandria Bellefleur', pages: 300, genre: 'Romance', rating: 4.4, mins: 375, synopsis: 'Sam fica presa num elevador com Daphne, uma bela demónia vestida de rosa. Uma comédia romântica sáfica irresistível sobre desejos e segundas oportunidades.', epub_path: `${R2}/o-diabo-veste-cor-de-rosa.epub` },
  { id: 'por-que-as-mulheres-amam-homens-fortes', title: 'Por que as Mulheres Amam os Homens Fortes', author: 'Elliott Katz', pages: 180, genre: 'Auto-ajuda', rating: 4.0, mins: 225, synopsis: 'O que as mulheres realmente procuram: um homem confiável, protetor e decisivo. Um guia com conselhos práticos para melhorar relacionamentos e restaurar o respeito mútuo.', epub_path: `${R2}/por-que-as-mulheres-amam-os-homens-fortes.epub` },
  { id: 'por-que-ninguem-me-disse-isso-antes', title: 'Por que Ninguém Me Disse Isso Antes', author: 'Julie Smith', pages: 300, genre: 'Auto-ajuda', rating: 4.7, mins: 375, synopsis: 'A psicóloga clínica Julie Smith oferece ferramentas práticas para compreender sentimentos e padrões comportamentais. Um guia acessível para lidar com os altos e baixos da vida.', epub_path: `${R2}/por-que-ninguem-me-disse-isso-a.epub` },
  { id: 'sem-chance-de-adeus', title: 'Sem Chance de Adeus', author: 'Harlan Coben', pages: 360, genre: 'Thriller', rating: 4.5, mins: 450, synopsis: 'Maggie McCabe, cirurgiã militar, recebe uma proposta que muda tudo. Uma parceria improvável leva-a a desvendar segredos enterrados há décadas — e a enfrentar o perigo de frente.', epub_path: `${R2}/sem-chance-de-adeus.epub` },
  { id: 'um-crush-dos-infernos', title: 'Um Crush dos Infernos', author: 'Charlotte Ingham', pages: 340, genre: 'Romance', rating: 4.3, mins: 425, synopsis: 'Willow morre aos 21 anos e desperta numa dimensão infernal. Para regressar à vida, deve completar sete missões — enquanto lida com sentimentos inesperados.', epub_path: `${R2}/um-crush-dos-infernos.epub` },
  { id: 'um-namorado-bom-pra-cachorro', title: 'Um Namorado Bom pra Cachorro', author: 'Brittainy Cherry', pages: 310, genre: 'Romance', rating: 4.4, mins: 390, synopsis: 'Yara, recém-divorciada, surpreende-se quando Alex concorda em fingir ser o seu namorado. Uma história sobre como o fingimento pode tornar-se genuinamente real.', epub_path: `${R2}/um-namorado-bom-pra-cachorro.epub` },
]

export const LEVELS = [
  { n: 'I', name: 'Leitor Iniciante', xp: 0 },
  { n: 'II', name: 'Explorador', xp: 2500 },
  { n: 'III', name: 'Contador de Histórias', xp: 8000 },
  { n: 'IV', name: 'Guardião das Palavras', xp: 20000 },
]

export const QUOTE = {
  text: 'A esperança é como o sal na comida: não se vê, mas sabe-se quando falta.',
  author: 'Mia Couto',
  book: 'Terra Sonâmbula',
}

export const CATEGORIES = [
  { name: 'Romance', icon: 'heart', count: 42 },
  { name: 'Ficção', icon: 'book-open', count: 78 },
  { name: 'História', icon: 'landmark', count: 31 },
  { name: 'Poesia', icon: 'feather', count: 24 },
  { name: 'Ensaio', icon: 'file-text', count: 19 },
  { name: 'Suspense', icon: 'zap', count: 37 },
  { name: 'Biografia', icon: 'user', count: 28 },
  { name: 'Des. Pessoal', icon: 'target', count: 15 },
]
