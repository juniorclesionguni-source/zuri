// Painel admin: assina PUTs para o R2 (epub + capa) e grava metadados em books.
// Mesmo padrão do book-access — o segredo do R2 nunca sai do servidor.
// Acções: { action: 'sign', bookId, epub?, cover?, coverExt? } -> { epubUrl?, coverUrl? }
//         { action: 'save', book: {...} }                      -> { ok: true }
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.20'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const R2_ACCOUNT = Deno.env.get('R2_ACCOUNT_ID')!
const R2_KEY = Deno.env.get('R2_ACCESS_KEY_ID')!
const R2_SECRET = Deno.env.get('R2_SECRET_ACCESS_KEY')!
const R2_BUCKET = Deno.env.get('R2_BUCKET') ?? 'zuri-books'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })

const SLUG = /^[a-z0-9-]{2,64}$/

async function presignPut(key: string): Promise<string> {
  const r2 = new AwsClient({ accessKeyId: R2_KEY, secretAccessKey: R2_SECRET, region: 'auto', service: 's3' })
  const target = new URL(`https://${R2_ACCOUNT}.r2.cloudflarestorage.com/${R2_BUCKET}/${key}`)
  target.searchParams.set('X-Amz-Expires', '600')
  const signed = await r2.sign(target.toString(), { method: 'PUT', aws: { signQuery: true } })
  return signed.url
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'unauthorized' }, 401)

  const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return json({ error: 'unauthorized' }, 401)

  const admin = createClient(SUPABASE_URL, SERVICE)
  const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return json({ error: 'forbidden' }, 403)

  const body = await req.json().catch(() => ({}))

  if (body.action === 'sign') {
    const { bookId, epub, cover, coverExt } = body
    if (!SLUG.test(String(bookId ?? ''))) return json({ error: 'bookId inválido' }, 400)
    const ext = ['jpg', 'jpeg', 'png', 'webp'].includes(coverExt) ? coverExt : 'jpg'
    return json({
      epubUrl: epub ? await presignPut(`epubs/${bookId}.epub`) : undefined,
      coverUrl: cover ? await presignPut(`covers/${bookId}.${ext}`) : undefined,
      epubPath: epub ? `epubs/${bookId}.epub` : undefined,
      coverPath: cover ? `covers/${bookId}.${ext}` : undefined,
    })
  }

  if (body.action === 'save') {
    const b = body.book ?? {}
    if (!SLUG.test(String(b.id ?? '')) || !b.title || !b.author) {
      return json({ error: 'id (slug), title e author são obrigatórios' }, 400)
    }
    const { error } = await admin.from('books').upsert({
      id: b.id,
      title: String(b.title),
      author: String(b.author),
      genre: b.genre ? String(b.genre) : null,
      synopsis: b.synopsis ? String(b.synopsis) : null,
      pages: Number(b.pages) || 0,
      mins: Number(b.mins) || 0,
      rating: Number(b.rating) || 0,
      epub_path: b.epub_path ? String(b.epub_path) : null,
      cover_path: b.cover_path ? String(b.cover_path) : null,
      is_published: Boolean(b.is_published),
    })
    if (error) return json({ error: error.message }, 500)
    return json({ ok: true })
  }

  return json({ error: 'action inválida' }, 400)
})
