import { supabase } from '../../lib/supabase'

// PRONTO MAS NÃO LIGADO. A activação da subscrição é server-side (worker M-Pesa
// via service_role chamando activate_subscription). Até o worker existir, o
// Checkout/Processing continuam no fluxo mock do store. Ver supabase/README.md.

export async function initiatePayment(phone: string, amount: number): Promise<{ transactionId: string; status: string }> {
  const { data, error } = await supabase!.functions.invoke('mpesa-initiate', { body: { phone, amount } })
  if (error) throw error
  return data as { transactionId: string; status: string }
}

export async function pollPayment(_txId: string): Promise<'pending' | 'active'> {
  // O worker activa a subscrição; aqui só lemos o estado (RLS: só o próprio).
  const { data } = await supabase!.from('subscriptions')
    .select('status').eq('status', 'active').maybeSingle()
  return data?.status === 'active' ? 'active' : 'pending'
}
