export interface Book {
  id: string
  title: string
  author: string
  pages: number
  genre: string
  rating: number
  mins: number
  synopsis?: string
  excerpt?: string
  epub_path?: string
  cover_url?: string
}

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
