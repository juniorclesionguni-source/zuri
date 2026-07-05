import { supabase } from '../../lib/supabase'

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

export async function activateSimulated(): Promise<void> {
  await supabase!.rpc('activate_own_subscription')
}
