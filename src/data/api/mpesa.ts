import { supabase } from '../../lib/supabase'
import { authHeaders } from './content'

// Pagamento M-Pesa real. O preço é do servidor (mpesa-initiate); o cliente só envia o número.
// A activação acontece no mpesa-callback via activate_subscription — nunca aqui.

import type { PlanId } from '../plans'

export async function initiatePayment(phone: string, plan: PlanId): Promise<{ transactionId: string; status: string }> {
  const { data, error } = await supabase!.functions.invoke('mpesa-initiate', {
    body: { phone, plan },
    headers: await authHeaders(),
  })
  if (error) throw error
  return data as { transactionId: string; status: string }
}

export async function pollPayment(txId: string): Promise<'pending' | 'active' | 'failed'> {
  // RLS: só as linhas do próprio. 'failed' permite retry imediato em vez de esperar o timeout.
  const [{ data: sub }, { data: pay }] = await Promise.all([
    supabase!.from('subscriptions').select('status').eq('status', 'active').maybeSingle(),
    supabase!.from('payments').select('status').eq('transaction_id', txId).maybeSingle(),
  ])
  if (sub?.status === 'active') return 'active'
  if (pay?.status === 'failed') return 'failed'
  return 'pending'
}
