import { supabase } from '../../lib/supabase'

export interface AuthUser {
  id: string
  name: string
  email: string
  genres: string[]
  created_at?: string
  is_admin?: boolean
}

async function fetchProfile(id: string) {
  const { data } = await supabase!.from('profiles').select('name, genres, created_at, is_admin').eq('id', id).single()
  return data
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser; jwt: string }> {
  const { data, error } = await supabase!.auth.signInWithPassword({ email, password })
  if (error || !data.user) throw error ?? new Error('Login falhou')
  const p = await fetchProfile(data.user.id)
  return {
    user: { id: data.user.id, email: data.user.email ?? email, name: p?.name ?? '', genres: p?.genres ?? [], created_at: p?.created_at, is_admin: p?.is_admin ?? false },
    jwt: data.session?.access_token ?? '',
  }
}

export async function getProfile(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase!.auth.getUser()
  if (!user) return null
  const p = await fetchProfile(user.id)
  return { id: user.id, email: user.email ?? '', name: p?.name ?? '', genres: p?.genres ?? [], created_at: p?.created_at, is_admin: p?.is_admin ?? false }
}

export async function setGenres(genres: string[]): Promise<void> {
  const { data: { user } } = await supabase!.auth.getUser()
  if (!user) return
  await supabase!.from('profiles').update({ genres }).eq('id', user.id)
}

export async function signOut(): Promise<void> {
  await supabase!.auth.signOut()
}

export async function signInWithGoogle(): Promise<void> {
  await supabase!.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
}

// Hidratação: emite o utilizador actual à entrada e em cada mudança de sessão
// (refresh de token, login/logout noutro separador). Devolve uma função de unsubscribe.
export function subscribe(onUser: (u: AuthUser | null) => void): () => void {
  // Online comporta-se como antes. Offline (navigator.onLine === false): um erro de
  // rede NÃO limpa a sessão persistida — a app abre e lê offline.
  getProfile().then(onUser).catch(() => { if (navigator.onLine) onUser(null) })
  const { data } = supabase!.auth.onAuthStateChange(async (_event, session) => {
    if (!session) { onUser(null); return }
    try { onUser(await getProfile()) } catch { if (navigator.onLine) onUser(null) }
  })
  return () => data.subscription.unsubscribe()
}
