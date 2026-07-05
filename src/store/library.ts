import { create } from 'zustand'

interface ProgressEntry { pct: number; finished: boolean; updatedAt: number }

interface LibraryState {
  progress: Record<string, ProgressEntry>
  favorites: Set<string>
  downloads: Record<string, { sizeMb: number }>
  loaded: boolean
  loadProgress: (userId: string) => Promise<void>
  loadFavorites: (userId: string) => Promise<void>
  toggleFavorite: (userId: string, bookId: string) => Promise<void>
  loadDownloads: () => Promise<void>
  download: (bookId: string, url: string, onProgress?: (pct: number) => void) => Promise<void>
  removeDownload: (bookId: string) => Promise<void>
}

export const useLibrary = create<LibraryState>()((set, get) => ({
  progress: {},
  favorites: new Set(),
  downloads: {},
  loaded: false,

  loadProgress: async (userId) => {
    // 1. Dexie first (fast/offline) — dynamic import keeps Dexie out of initial chunk
    try {
      const { getAllProgress: dbGetAll } = await import('../data/db')
      const local = await dbGetAll(userId)
      const progress: Record<string, ProgressEntry> = {}
      local.forEach((r) => {
        progress[r.bookId] = { pct: r.progressPct, finished: r.isFinished, updatedAt: r.updatedAt }
      })
      set({ progress })
    } catch { /* offline — skip */ }

    // 2. Supabase merge (dynamic import keeps supabase out of initial chunk)
    try {
      const { getAllProgress: apiGetAll } = await import('../data/api/progress')
      const remote = await apiGetAll(userId)
      const merged = { ...get().progress }
      remote.forEach((r: { book_id: string; progress_pct: number; is_finished: boolean; updated_at: string }) => {
        const existing = merged[r.book_id]
        const remoteTs = new Date(r.updated_at).getTime()
        if (!existing || r.progress_pct > existing.pct) {
          merged[r.book_id] = { pct: r.progress_pct, finished: r.is_finished, updatedAt: remoteTs }
        }
      })
      set({ progress: merged, loaded: true })
    } catch {
      set({ loaded: true })
    }
  },

  loadFavorites: async (userId) => {
    try {
      const { getFavorites } = await import('../data/api/favorites')
      const ids = await getFavorites(userId)
      set({ favorites: new Set(ids) })
    } catch { /* offline — keep empty */ }
  },

  toggleFavorite: async (userId, bookId) => {
    const { favorites } = get()
    const isFav = favorites.has(bookId)
    // Optimistic update
    const next = new Set(favorites)
    if (isFav) next.delete(bookId); else next.add(bookId)
    set({ favorites: next })
    try {
      const api = await import('../data/api/favorites')
      if (isFav) await api.removeFavorite(userId, bookId)
      else await api.addFavorite(userId, bookId)
    } catch {
      // Rollback on error
      set({ favorites })
    }
  },

  loadDownloads: async () => {
    try {
      const { listOfflineBooks } = await import('../data/db')
      const list = await listOfflineBooks()
      const d: Record<string, { sizeMb: number }> = {}
      list.forEach((o) => { d[o.bookId] = { sizeMb: o.sizeMb } })
      set({ downloads: d })
    } catch { /* sem downloads */ }
  },

  download: async (bookId, url, onProgress) => {
    const { saveOfflineBook } = await import('../data/db')
    const bytes = await saveOfflineBook(bookId, url, onProgress)
    set((s) => ({ downloads: { ...s.downloads, [bookId]: { sizeMb: bytes / 1048576 } } }))
  },

  removeDownload: async (bookId) => {
    const { removeOfflineBook } = await import('../data/db')
    await removeOfflineBook(bookId)
    set((s) => { const d = { ...s.downloads }; delete d[bookId]; return { downloads: d } })
  },
}))
