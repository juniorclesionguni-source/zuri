// Porteiro do conteúdo: só um utilizador autenticado COM subscrição activa recebe
// um URL assinado de curta duração (~120 s) para o EPUB no bucket privado.
// O bucket dos EPUBs não é público — este é o único caminho de acesso.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.20'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const R2_ACCOUNT = Deno.env.get('R2_ACCOUNT_ID')!
const R2_KEY = Deno.env.get('R2_ACCESS_KEY_ID')!
const R2_SECRET = Deno.env.get('R2_SECRET_ACCESS_KEY')!
// Bucket privado dos EPUBs (zuri-books, Public Access desligado). As capas vivem
// noutro bucket, público. Aqui só se lêem EPUBs.
const R2_BUCKET = Deno.env.get('R2_EPUB_BUCKET') ?? Deno.env.get('R2_BUCKET') ?? 'zuri-books'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'unauthorized' }, 401)
  const { bookId } = await req.json().catch(() => ({}))
  if (!bookId) return json({ error: 'bookId obrigatório' }, 400)

  // 1) Identifica o utilizador a partir do JWT.
  const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return json({ error: 'unauthorized' }, 401)

  const admin = createClient(SUPABASE_URL, SERVICE)

  // 2) Subscrição activa = livro completo; sem subscrição = amostra (o cliente
  // limita ao 1º capítulo). ponytail: o cap da amostra é client-side — o ficheiro
  // completo desce na mesma; DRM server-side não se justifica para este preço.
  const { data: sub } = await admin.from('subscriptions')
    .select('status, expires_at').eq('user_id', user.id).maybeSingle()
  const active = sub?.status === 'active' && sub.expires_at && new Date(sub.expires_at) > new Date()

  // 3) Resolve o nome do ficheiro a partir do id do livro.
  const { data: book } = await admin.from('books').select('epub_path').eq('id', bookId).maybeSingle()
  if (!book?.epub_path) return json({ error: 'livro não encontrado' }, 404)

  // 4) URL assinado (GET, expira em 120 s) para o objecto no bucket privado.
  const r2 = new AwsClient({ accessKeyId: R2_KEY, secretAccessKey: R2_SECRET, region: 'auto', service: 's3' })
  const target = new URL(`https://${R2_ACCOUNT}.r2.cloudflarestorage.com/${R2_BUCKET}/${book.epub_path}`)
  target.searchParams.set('X-Amz-Expires', '120')
  const signed = await r2.sign(target.toString(), { method: 'GET', aws: { signQuery: true } })

  return json({ url: signed.url, sample: !active })
})
