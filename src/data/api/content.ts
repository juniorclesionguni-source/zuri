import { supabase } from '../../lib/supabase'

// Passa o JWT do utilizador EXPLICITAMENTE — não confiar no cabeçalho por omissão
// do functions.invoke (pode usar a chave anónima e o getUser no servidor falhar).
export async function authHeaders(): Promise<Record<string, string> | undefined> {
  const { data: { session } } = await supabase!.auth.getSession()
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined
}

// Pede ao porteiro (Edge Function) um URL assinado de curta duração para o EPUB.
// sample=true quando o utilizador não tem subscrição activa (o Reader limita ao 1º capítulo).
export async function getBookUrl(bookId: string): Promise<{ url: string; sample: boolean }> {
  const { data, error } = await supabase!.functions.invoke('book-access', { body: { bookId }, headers: await authHeaders() })
  if (error || !data?.url) throw error ?? new Error('acesso negado')
  return { url: data.url as string, sample: Boolean(data.sample) }
}
