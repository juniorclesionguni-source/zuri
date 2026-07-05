import { create } from 'zustand'
import type { Book } from '../data/catalog'

interface CatalogState {
  books: Book[]
  loaded: boolean
  loading: boolean
  load: () => Promise<void>
}

export const useCatalog = create<CatalogState>()((set, get) => ({
  books: [],
  loaded: false,
  loading: false,
  load: async () => {
    if (get().loading || get().loaded) return
    set({ loading: true })
    // import() dinâmico: mantém o @supabase/supabase-js fora do chunk inicial.
    const { fetchBooks } = await import('../data/api/catalog')
    const dbmod = await import('../data/db')
    let books = await fetchBooks()
    if (books.length) {
      dbmod.cacheBooks(books).catch(() => {}) // guarda para uso offline
    } else {
      books = await dbmod.getCachedBooks().catch(() => []) // offline: usa a cache
    }
    set({ books, loaded: true, loading: false })
  },
}))
