import { create } from 'zustand'
import type { Book } from '../data/catalog'

interface CatalogState {
  books: Book[]
  loaded: boolean
  loading: boolean
  error: boolean
  load: () => Promise<void>
  retry: () => Promise<void>
}

export const useCatalog = create<CatalogState>()((set, get) => ({
  books: [],
  loaded: false,
  loading: false,
  error: false,
  load: async () => {
    if (get().loading || get().loaded) return
    set({ loading: true, error: false })
    // import() dinâmico: mantém o @supabase/supabase-js fora do chunk inicial.
    const dbmod = await import('../data/db')
    // Cache-first: mostra já o que está no Dexie e actualiza da rede em background.
    const cached = await dbmod.getCachedBooks().catch(() => [] as Book[])
    if (cached.length) set({ books: cached, loaded: true, loading: false })
    const { fetchBooks } = await import('../data/api/catalog')
    const fresh = await fetchBooks().catch(() => [] as Book[])
    if (fresh.length) {
      dbmod.cacheBooks(fresh).catch(() => {})
      set({ books: fresh, loaded: true, loading: false })
    } else if (!cached.length) {
      // Nem rede nem cache — estado de erro visível (Home/Explore mostram retry).
      set({ books: [], loaded: true, loading: false, error: true })
    }
  },
  retry: async () => {
    set({ loaded: false })
    await get().load()
  },
}))
