// Activação de subscrição (pagamento SIMULADO) — server-side.
// Identidade via getUser (Authorization) e escrita via service_role: fiável e
// independente de auth.uid() na base de dados. Quando o M-Pesa for real, esta
// função é substituída pelo callback de pagamento.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'unauthorized' }, 401)

  const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return json({ error: 'unauthorized' }, 401)

  const admin = createClient(SUPABASE_URL, SERVICE)
  const expires = new Date()
  expires.setMonth(expires.getMonth() + 1)
  const patch = {
    status: 'active',
    started_at: new Date().toISOString(),
    expires_at: expires.toISOString(),
    mpesa_transaction_id: 'SIM-' + crypto.randomUUID().slice(0, 10),
  }

  // Garante que existe uma linha e activa-a (o trigger de signup normalmente já a cria).
  const { data: rows } = await admin.from('subscriptions').select('id').eq('user_id', user.id).limit(1)
  const { error } = rows && rows.length
    ? await admin.from('subscriptions').update(patch).eq('user_id', user.id)
    : await admin.from('subscriptions').insert({ user_id: user.id, ...patch })

  if (error) return json({ error: error.message }, 500)
  return json({ status: 'active', expiresAt: expires.toISOString() })
})
