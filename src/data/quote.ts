import type { Book } from './catalog'

export interface BookQuote { text: string; author: string; book: string }

function dayIndex(len: number): number {
  const days = Math.floor(Date.now() / 86_400_000) // "citação do dia" — estável durante o dia, sem piscar a cada render
  return days % len
}

// Citação real de um livro do catálogo (nunca inventada). Prioridade: o livro pedido
// (ex. o que a pessoa está a ler) → um livro do género favorito → citação do dia.
// excerpt (trecho curado no admin) é preferido; synopsis é o fallback honesto que já
// existe em todos os livros seed, sem precisar de curadoria manual imediata.
export function pickQuote(books: Book[], preferredBookId?: string, genres: string[] = []): BookQuote | null {
  const quotable = books.filter((b) => b.excerpt || b.synopsis)
  if (!quotable.length) return null

  const preferred = preferredBookId ? quotable.find((b) => b.id === preferredBookId) : undefined
  const byGenre = !preferred ? quotable.find((b) => genres.includes(b.genre)) : undefined
  const b = preferred ?? byGenre ?? quotable[dayIndex(quotable.length)]

  return { text: (b.excerpt || b.synopsis)!, author: b.author, book: b.title }
}
