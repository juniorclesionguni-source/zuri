import { supabase } from '../../lib/supabase'

// Pede ao porteiro (Edge Function) um URL assinado de curta duração para o EPUB.
// Só devolve URL se o utilizador tiver subscrição activa — senão lança erro.
export async function getBookUrl(bookId: string): Promise<string> {
  const { data, error } = await supabase!.functions.invoke('book-access', { body: { bookId } })
  if (error || !data?.url) throw error ?? new Error('acesso negado')
  return data.url as string
}
