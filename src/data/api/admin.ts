import { supabase } from '../../lib/supabase'
import { authHeaders } from './content'

export interface AdminBook {
  id: string
  title: string
  author: string
  genre?: string
  synopsis?: string
  pages: number
  mins: number
  rating: number
  epub_path?: string | null
  cover_path?: string | null
  is_published: boolean
}

async function call(body: Record<string, unknown>) {
  const { data, error } = await supabase!.functions.invoke('admin-upload', { body, headers: await authHeaders() })
  if (error) throw error
  return data
}

export async function signUploads(bookId: string, opts: { epub?: boolean; cover?: boolean; coverExt?: string }) {
  return (await call({ action: 'sign', bookId, ...opts })) as {
    epubUrl?: string; coverUrl?: string; epubPath?: string; coverPath?: string
  }
}

export async function saveBook(book: AdminBook) {
  await call({ action: 'save', book })
}

// Lista de admin inclui rascunhos (policy books_admin_select).
export async function fetchAllBooks(): Promise<AdminBook[]> {
  const { data, error } = await supabase!.from('books').select('*').order('title')
  if (error || !data) return []
  return (data as any[]).map((r) => ({
    id: r.id, title: r.title, author: r.author, genre: r.genre ?? undefined,
    synopsis: r.synopsis ?? undefined, pages: r.pages ?? 0, mins: r.mins ?? 0,
    rating: Number(r.rating) || 0, epub_path: r.epub_path, cover_path: r.cover_path,
    is_published: Boolean(r.is_published),
  }))
}
