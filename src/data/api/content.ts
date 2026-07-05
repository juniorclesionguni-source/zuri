import { supabase } from '../../lib/supabase'

// Passa o JWT do utilizador EXPLICITAMENTE — não confiar no cabeçalho por omissão
// do functions.invoke (pode usar a chave anónima e o getUser no servidor falhar).
export async function authHeaders(): Promise<Record<string, string> | undefined> {
  const { data: { session } } = await supabase!.auth.getSession()
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined
}

// Pede ao porteiro (Edge Function) um URL assinado de curta duração para o EPUB.
// Só devolve URL se o utilizador tiver subscrição activa — senão lança erro.
export async function getBookUrl(bookId: string): Promise<string> {
  const { data, error } = await supabase!.functions.invoke('book-access', { body: { bookId }, headers: await authHeaders() })
  if (error || !data?.url) throw error ?? new Error('acesso negado')
  return data.url as string
}
