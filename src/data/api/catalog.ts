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
    excerpt: row.excerpt as string | undefined,
    // Chave crua no bucket privado — o URL de leitura vem do book-access (assinado).
    epub_path: (row.epub_path as string | undefined) ?? undefined,
    cover_url: row.cover_path ? `${R2}/${row.cover_path}` : undefined,
  } satisfies Book))
}
