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
