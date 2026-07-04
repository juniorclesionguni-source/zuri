// Webhook público chamado pelo M-Pesa com o resultado do pagamento.
// Em sucesso, activa a subscrição via RPC (service_role) — a única via de activação.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
// Segredo partilhado na URL do webhook (?token=) — barreira mínima contra chamadas forjadas.
const CALLBACK_TOKEN = Deno.env.get('MPESA_CALLBACK_TOKEN') ?? ''

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  // TODO: substituir/reforçar com a verificação de assinatura do M-Pesa quando
  // disponível. Por agora, segredo na query string.
  if (CALLBACK_TOKEN) {
    const token = new URL(req.url).searchParams.get('token')
    if (token !== CALLBACK_TOKEN) return json({ error: 'forbidden' }, 403)
  }

  const body = await req.json().catch(() => ({}))
  // Campos conforme o payload C2B do M-Pesa. TODO: confirmar nomes exatos.
  const transactionId = body.input_ThirdPartyReference ?? body.transactionReference
  const success = body.output_ResponseCode === 'INS-0' || body.status === 'success'
  if (!transactionId) return json({ error: 'referência em falta' }, 400)

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE)
  const { data: payment } = await admin.from('payments')
    .select('user_id').eq('transaction_id', transactionId).single()
  if (!payment) return json({ error: 'transação desconhecida' }, 404)

  if (success) {
    await admin.from('payments').update({ status: 'success', raw: body }).eq('transaction_id', transactionId)
    await admin.rpc('activate_subscription', {
      p_user_id: payment.user_id, p_transaction_id: transactionId, p_months: 1,
    })
  } else {
    await admin.from('payments').update({ status: 'failed', raw: body }).eq('transaction_id', transactionId)
  }
  return json({ received: true })
})
