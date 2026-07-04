import { supabase } from '../../lib/supabase'

export interface UserStatsRow {
  xp: number
  level: number
  streak_days: number
  books_read: number
  hours_read: number
  last_read_date?: string // 'YYYY-MM-DD'
}

export async function fetchStats(userId: string): Promise<UserStatsRow | null> {
  const { data } = await supabase!
    .from('user_stats')
    .select('xp, level, streak_days, books_read, hours_read, last_read_date')
    .eq('user_id', userId)
    .single()
  return (data as UserStatsRow | null) ?? null
}

export async function saveStats(userId: string, partial: Record<string, number | string>): Promise<void> {
  await supabase!.from('user_stats').update(partial).eq('user_id', userId)
}
