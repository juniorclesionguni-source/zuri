import { supabase } from '../../lib/supabase'
import { authHeaders } from './content'

export async function getSubscription(userId: string): Promise<{ status: string; expiresAt: string | null } | null> {
  try {
    const { data } = await supabase!
      .from('subscriptions')
      .select('status, expires_at')
      .eq('user_id', userId)
      .maybeSingle()
    if (!data) return null
    return { status: data.status as string, expiresAt: (data.expires_at as string | null) ?? null }
  } catch {
    return null // offline / erro de rede — mantém o estado persistido
  }
}

// Activação SIMULADA via Edge Function (getUser + service_role). Token explícito
// para garantir que o servidor identifica o utilizador. Devolve o novo estado.
export async function activateSimulated(): Promise<{ status: string; expiresAt: string | null }> {
  const { data, error } = await supabase!.functions.invoke('subscribe', { body: {}, headers: await authHeaders() })
  if (error) throw error
  return { status: (data?.status as string) ?? 'active', expiresAt: (data?.expiresAt as string | null) ?? null }
}
