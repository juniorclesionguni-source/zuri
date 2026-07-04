import { supabase } from '../../lib/supabase'

export async function getFavorites(userId: string): Promise<string[]> {
  const { data } = await supabase!.from('favorites').select('book_id').eq('user_id', userId)
  return (data ?? []).map((r) => r.book_id as string)
}

export async function addFavorite(userId: string, bookId: string): Promise<void> {
  await supabase!.from('favorites').insert({ user_id: userId, book_id: bookId })
}

export async function removeFavorite(userId: string, bookId: string): Promise<void> {
  await supabase!.from('favorites').delete().eq('user_id', userId).eq('book_id', bookId)
}
