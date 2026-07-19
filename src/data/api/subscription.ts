import { supabase } from '../../lib/supabase'

// undefined = erro de rede (mantém estado persistido); objecto inactive = sem linha.
export async function getSubscription(userId: string): Promise<{ status: string; expiresAt: string | null } | undefined> {
  try {
    const { data, error } = await supabase!
      .from('subscriptions')
      .select('status, expires_at')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) return undefined
    if (!data) return { status: 'inactive', expiresAt: null }
    return { status: data.status as string, expiresAt: (data.expires_at as string | null) ?? null }
  } catch {
    return undefined
  }
}
