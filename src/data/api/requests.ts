import { supabase } from '../../lib/supabase'

export interface BookRequest {
  id: string
  title: string
  author: string | null
  status: 'pending' | 'review' | 'licensing' | 'available'
  vote_count: number
  created_by: string | null
  created_at: string
}

export async function listRequests(): Promise<BookRequest[]> {
  const { data } = await supabase!.from('book_requests')
    .select('id, title, author, status, vote_count, created_by, created_at')
    .order('vote_count', { ascending: false })
  return (data ?? []) as BookRequest[]
}

export async function myVotes(userId: string): Promise<string[]> {
  const { data } = await supabase!.from('request_votes')
    .select('request_id').eq('user_id', userId)
  return (data ?? []).map((r) => r.request_id as string)
}

export async function vote(requestId: string, userId: string): Promise<void> {
  await supabase!.from('request_votes').insert({ request_id: requestId, user_id: userId })
}

export async function unvote(requestId: string, userId: string): Promise<void> {
  await supabase!.from('request_votes').delete()
    .eq('request_id', requestId).eq('user_id', userId)
}

export async function createRequest(params: { title: string; author: string; userId: string }): Promise<void> {
  await supabase!.from('book_requests').insert({
    title: params.title,
    author: params.author || null,
    created_by: params.userId,
  })
}
