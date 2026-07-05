import { supabase } from '../../lib/supabase'

export interface Notif {
  id: string
  type: string
  title: string
  body: string | null
  read: boolean
  created_at: string
}

export async function listNotifications(userId: string): Promise<Notif[]> {
  const { data } = await supabase!.from('notifications')
    .select('id, type, title, body, read, created_at')
    .eq('user_id', userId).order('created_at', { ascending: false }).limit(50)
  return (data ?? []) as Notif[]
}

export async function markAllRead(userId: string): Promise<void> {
  await supabase!.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
}

export async function createNotification(userId: string, type: string, title: string, body?: string): Promise<void> {
  await supabase!.from('notifications').insert({ user_id: userId, type, title, body: body ?? null })
}

/** Cria a notificação de boas-vindas se o utilizador ainda não tiver nenhuma. */
export async function ensureWelcome(userId: string, name?: string): Promise<void> {
  const { count } = await supabase!.from('notifications')
    .select('id', { count: 'exact', head: true }).eq('user_id', userId)
  if ((count ?? 0) > 0) return
  await createNotification(userId, 'info', 'Bem-vindo ao Zuri 📚',
    `Olá${name ? ' ' + name.split(' ')[0] : ''}! Explora o catálogo, começa a ler e ganha XP a cada página. Bons livros!`)
}
