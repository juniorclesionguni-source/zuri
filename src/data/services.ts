// Façade único da camada de dados. A UI e os stores chamam só isto.
// As implementações são carregadas por import() dinâmico: o
// @supabase/supabase-js (~120 KB) nunca entra no chunk inicial — só é descarregado
// na primeira chamada real (login/sync).
import type { AuthUser } from './api/auth'

export type { AuthUser }

export const auth = {
  signIn: async (email: string, password: string) => (await import('./api/auth')).signIn(email, password),
  getProfile: async () => (await import('./api/auth')).getProfile(),
  setGenres: async (genres: string[]) => (await import('./api/auth')).setGenres(genres),
  signOut: async () => (await import('./api/auth')).signOut(),
  signInWithGoogle: async () => (await import('./api/auth')).signInWithGoogle(),
  subscribe: async (cb: (u: AuthUser | null) => void) => (await import('./api/auth')).subscribe(cb),
}

export const progress = {
  sync: async (u: string, b: string, p: number) => (await import('./api/progress')).syncProgress(u, b, p),
  get: async (u: string, b: string) => (await import('./api/progress')).getProgress(u, b),
}

// ponytail: pronto mas o consumidor (Checkout/Processing) só liga quando o worker existir.
export const mpesa = {
  initiate: async (phone: string, amount: number) => (await import('./api/mpesa')).initiatePayment(phone, amount),
  poll: async (tx: string) => (await import('./api/mpesa')).pollPayment(tx),
}
