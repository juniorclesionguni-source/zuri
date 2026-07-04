// Invocada pelo cliente (supabase.functions.invoke('mpesa-initiate')).
// Cria o registo de pagamento, marca a subscrição 'pending' e dispara o STK push.
// A ACTIVAÇÃO acontece depois, no callback — nunca aqui, nunca no cliente.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { c2bPayment } from '../_shared/mpesa.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const PRICE_MT = 45

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'unauthorized' }, 401)

  const { phone } = await req.json().catch(() => ({}))
  if (!phone) return json({ error: 'phone obrigatório' }, 400)

  // Identifica o utilizador a partir do JWT (não confiamos num user_id do corpo).
  const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return json({ error: 'unauthorized' }, 401)

  const transactionId = 'ZURI-' + crypto.randomUUID().slice(0, 8).toUpperCase()
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE)

  await admin.from('payments').insert({
    user_id: user.id, transaction_id: transactionId, phone, amount: PRICE_MT, status: 'pending',
  })
  await admin.from('subscriptions').update({ status: 'pending' }).eq('user_id', user.id)

  const res = await c2bPayment({ phone, amount: PRICE_MT, reference: transactionId })
  if (!res.ok) {
    await admin.from('payments').update({ status: 'failed', raw: res.raw }).eq('transaction_id', transactionId)
    return json({ error: 'pagamento recusado pelo M-Pesa' }, 502)
  }
  return json({ transactionId, status: 'pending' })
})
