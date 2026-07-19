import type { Book } from './catalog'

interface RecommendInput {
  books: Book[]
  genres: string[] // escolhidos no onboarding (Genres.tsx)
  favorites: Set<string> // ids favoritados
  progress: Record<string, { finished: boolean }>
  limit?: number
}

// "Sugestões para ti": género declarado no onboarding + autor inferido do comportamento
// (favoritar/terminar um livro é sinal mais forte que uma escolha feita antes de ler
// nada — RCD: "qualify by behavior, not by a long signup form"). Nunca sugere o que já
// está a ler/leu/favoritou. Catálogo pequeno: se a exclusão esvaziar demais, recua para
// o catálogo completo por rating em vez de mostrar uma secção vazia.
export function recommend({ books, genres, favorites, progress, limit = 8 }: RecommendInput): Book[] {
  const favoriteAuthors = new Set(
    books.filter((b) => favorites.has(b.id) || progress[b.id]?.finished).map((b) => b.author)
  )
  const genreSet = new Set(genres)
  const score = (b: Book) =>
    b.rating + (genreSet.has(b.genre) ? 3 : 0) + (favoriteAuthors.has(b.author) ? 5 : 0)

  const unseen = books.filter((b) => !favorites.has(b.id) && !progress[b.id])
  const pool = unseen.length >= limit ? unseen : books
  return [...pool].sort((a, b) => score(b) - score(a)).slice(0, limit)
}
