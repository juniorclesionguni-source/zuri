import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth } from '../data/services'

interface User {
  id: string
  name: string
  email: string
  genres: string[]
  created_at?: string
  is_admin?: boolean
}

interface AuthState {
  user: User | null
  jwt: string | null
  onboarded: boolean
  login: (email: string, password?: string) => Promise<void>
  setGenres: (genres: string[]) => void
  logout: () => void
  hydrate: (user: User | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      jwt: null,
      onboarded: false,
      login: async (email, password = '') => {
        const { user, jwt } = await auth.signIn(email, password)
        set({ user, jwt })
      },
      setGenres: (genres) => {
        set((s) => ({
          user: s.user ? { ...s.user, genres } : null,
          onboarded: true,
        }))
        auth.setGenres(genres).catch(() => {}) // sincroniza para o perfil (fire-and-forget)
      },
      logout: () => {
        auth.signOut().catch(() => {})
        set({ user: null, jwt: null, onboarded: false })
      },
      // Servidor é a fonte de verdade: aplica a sessão real (ou limpa-a) sem efeitos.
      hydrate: (user) =>
        set({ user, onboarded: user ? user.genres.length > 0 : false }),
    }),
    { name: 'zuri-auth' }
  )
)
