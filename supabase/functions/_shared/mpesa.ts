// Integração M-Pesa Moçambique (Vodacom OpenAPI / C2B single-stage).
//
// ⚠️ A ORQUESTRAÇÃO (DB, RPC, validação) está completa e correta nas funções
// mpesa-initiate / mpesa-callback. ESTE ficheiro é a parte que depende das tuas
// credenciais de merchant e que NÃO consigo testar sem elas — confirma contra o
// onboarding M-Pesa antes de produção. Pontos a validar marcados com TODO.
//
// Docs: https://developer.mpesa.vm.co.mz  (C2B Single Stage Payment)

const BASE = Deno.env.get('MPESA_BASE') ?? 'https://api.sandbox.vm.co.mz:18352'
const API_KEY = Deno.env.get('MPESA_API_KEY') ?? ''
const PUBLIC_KEY = Deno.env.get('MPESA_PUBLIC_KEY') ?? '' // chave pública do ambiente (base64, sem cabeçalhos PEM)
const SERVICE_PROVIDER = Deno.env.get('MPESA_SERVICE_PROVIDER_CODE') ?? '' // shortcode do merchant
const ORIGIN = Deno.env.get('MPESA_ORIGIN') ?? 'developer.mpesa.vm.co.mz'

// O Bearer do M-Pesa é a API key cifrada com RSA (chave pública do ambiente),
// em base64. TODO: confirmar o padding esperado (a doc usa RSA PKCS#1 v1.5).
async function bearerToken(): Promise<string> {
  const keyDer = Uint8Array.from(atob(PUBLIC_KEY), (c) => c.charCodeAt(0))
  const pub = await crypto.subtle.importKey(
    'spki', keyDer,
    { name: 'RSA-OAEP', hash: 'SHA-256' }, // TODO: validar — M-Pesa pode exigir RSAES-PKCS1-v1_5
    false, ['encrypt'],
  )
  const enc = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, pub, new TextEncoder().encode(API_KEY))
  return btoa(String.fromCharCode(...new Uint8Array(enc)))
}

export interface C2BResult {
  ok: boolean
  raw: unknown
}

// Dispara o pedido de pagamento (o utilizador recebe o prompt de PIN no telemóvel).
export async function c2bPayment(args: { phone: string; amount: number; reference: string }): Promise<C2BResult> {
  if (!API_KEY || !PUBLIC_KEY || !SERVICE_PROVIDER) {
    return { ok: false, raw: { error: 'M-Pesa não configurado (env em falta)' } }
  }
  const token = await bearerToken()
  const res = await fetch(`${BASE}/ipg/v1x/c2bPayment/singleStage/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: ORIGIN,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      input_TransactionReference: args.reference,
      input_CustomerMSISDN: normalizeMsisdn(args.phone),
      input_Amount: String(args.amount),
      input_ThirdPartyReference: args.reference,
      input_ServiceProviderCode: SERVICE_PROVIDER,
    }),
  })
  const raw = await res.json().catch(() => ({}))
  // M-Pesa devolve output_ResponseCode 'INS-0' em sucesso.
  const ok = res.ok && (raw?.output_ResponseCode === 'INS-0')
  return { ok, raw }
}

// 84/85xxxxxxx -> 25884xxxxxxx
export function normalizeMsisdn(phone: string): string {
  const d = phone.replace(/\D/g, '')
  if (d.startsWith('258')) return d
  return '258' + d.replace(/^0+/, '')
}
