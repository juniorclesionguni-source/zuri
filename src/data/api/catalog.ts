import { supabase } from '../../lib/supabase'
import type { Book } from '../catalog'

const R2 = import.meta.env.VITE_R2_PUBLIC_URL ?? ''

export async function fetchBooks(): Promise<Book[]> {
  const { data, error } = await supabase!
    .from('books')
    .select('*')
    .eq('is_published', true)
    .order('title')
  if (error || !data) return []
  return (data as any[]).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    author: row.author as string,
    pages: row.pages as number,
    genre: row.genre as string,
    rating: Number(row.rating),
    mins: row.mins as number,
    synopsis: row.synopsis as string | undefined,
    epub_path: row.epub_path ? `${R2}/${row.epub_path}` : undefined,
    cover_url: row.cover_path ? `${R2}/${row.cover_path}` : undefined,
  } satisfies Book))
}
