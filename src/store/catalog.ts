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
    const books = await fetchBooks()
    set({ books, loaded: true, loading: false })
  },
}))
