// Façade único da camada de dados. Auto-selecciona real vs mock conforme o
// Supabase está configurado (env). A UI e os stores chamam só isto — quando o
// backend está ligado, nada na UI muda.
//
// As implementações reais são carregadas por import() dinâmico: o
// @supabase/supabase-js (~120 KB) nunca entra no chunk inicial — só é descarregado
// na primeira chamada real (login/sync). Em modo mock, nunca.
import { isSupabaseConfigured } from '../lib/supabaseConfig'
import type { AuthUser } from './api/auth'
import { mockLogin, mockGetProfile } from './mock/auth'
import { mockInitiatePayment, mockPollPayment } from './mock/mpesa'
// mock/progress importa o Dexie — carregado dinamicamente para não entrar no chunk inicial.

export type { AuthUser }

export const auth = isSupabaseConfigured
  ? {
      signIn: async (email: string, password: string) => (await import('./api/auth')).signIn(email, password),
      getProfile: async () => (await import('./api/auth')).getProfile(),
      setGenres: async (genres: string[]) => (await import('./api/auth')).setGenres(genres),
      signOut: async () => (await import('./api/auth')).signOut(),
      signInWithGoogle: async () => (await import('./api/auth')).signInWithGoogle(),
      subscribe: async (cb: (u: AuthUser | null) => void) => (await import('./api/auth')).subscribe(cb),
    }
  : {
      signIn: async (email: string, password: string) => {
        const r = await mockLogin(email, password)
        return { user: { ...r.user, genres: [] as string[] }, jwt: r.jwt }
      },
      getProfile: async (): Promise<AuthUser | null> => mockGetProfile(),
      setGenres: async (_genres: string[]) => {},
      signOut: async () => {},
      signInWithGoogle: async () => {},
      subscribe: async (_cb: (u: AuthUser | null) => void) => () => {}, // mock: no-op, sem subscrição
    }

export const progress = isSupabaseConfigured
  ? {
      sync: async (u: string, b: string, p: number) => (await import('./api/progress')).syncProgress(u, b, p),
      get: async (u: string, b: string) => (await import('./api/progress')).getProgress(u, b),
    }
  : {
      sync: async (u: string, b: string, p: number) => (await import('./mock/progress')).mockSyncProgress(u, b, p),
      get: async (u: string, b: string) => (await import('./mock/progress')).mockGetProgress(u, b),
    }

// ponytail: pronto mas o consumidor (Checkout/Processing) só liga quando o worker existir.
export const mpesa = isSupabaseConfigured
  ? {
      initiate: async (phone: string, amount: number) => (await import('./api/mpesa')).initiatePayment(phone, amount),
      poll: async (tx: string) => (await import('./api/mpesa')).pollPayment(tx),
    }
  : { initiate: mockInitiatePayment, poll: mockPollPayment }
