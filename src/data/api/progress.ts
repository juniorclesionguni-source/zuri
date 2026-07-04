import { supabase } from '../../lib/supabase'

// upsert dispara o trigger BEFORE UPDATE que garante monotonia no servidor —
// se o existente for maior, fica o maior. O cliente nunca regride o progresso.
export async function syncProgress(userId: string, bookId: string, pct: number): Promise<void> {
  await supabase!.from('reading_progress')
    .upsert({ user_id: userId, book_id: bookId, progress_pct: pct }, { onConflict: 'user_id,book_id' })
}

export async function getProgress(userId: string, bookId: string): Promise<number> {
  const { data } = await supabase!.from('reading_progress')
    .select('progress_pct').eq('user_id', userId).eq('book_id', bookId).maybeSingle()
  return data?.progress_pct ?? 0
}
