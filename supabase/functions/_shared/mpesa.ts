// Integração M-Pesa Moçambique (Vodacom OpenAPI / C2B single-stage).
//
// ⚠️ A ORQUESTRAÇÃO (DB, RPC, validação) está completa e correta nas funções
// mpesa-initiate / mpesa-callback. ESTE ficheiro é a parte que depende das tuas
// credenciais de merchant e que NÃO consigo testar sem elas — confirma contra o
// onboarding M-Pesa antes de produção. Pontos a validar marcados com TODO.
//
// Docs: https://developer.mpesa.vm.co.mz  (C2B Single Stage Payment)

import { KEYUTIL, KJUR, hextob64 } from 'https://esm.sh/jsrsasign@11.1.0'

const BASE = Deno.env.get('MPESA_BASE') ?? 'https://api.sandbox.vm.co.mz:18352'
const API_KEY = Deno.env.get('MPESA_API_KEY') ?? ''
const PUBLIC_KEY = Deno.env.get('MPESA_PUBLIC_KEY') ?? '' // chave pública do ambiente (base64, sem cabeçalhos PEM)
const SERVICE_PROVIDER = Deno.env.get('MPESA_SERVICE_PROVIDER_CODE') ?? '' // shortcode do merchant
const ORIGIN = Deno.env.get('MPESA_ORIGIN') ?? 'developer.mpesa.vm.co.mz'

// O Bearer do M-Pesa é a API key cifrada com a chave pública do ambiente em
// RSAES-PKCS1-v1_5, base64. O WebCrypto do Deno só encripta com RSA-OAEP, por
// isso jsrsasign ('RSA' = PKCS#1 v1.5).
function bearerToken(): string {
  const pem = `-----BEGIN PUBLIC KEY-----\n${PUBLIC_KEY}\n-----END PUBLIC KEY-----`
  const pub = KEYUTIL.getKey(pem)
  // deno-lint-ignore no-explicit-any
  const encHex = KJUR.crypto.Cipher.encrypt(API_KEY, pub as any, 'RSA')
  return hextob64(encHex)
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
  const msisdn = normalizeMsisdn(args.phone)
  if (!msisdn) return { ok: false, raw: { error: 'invalid_phone' } }
  const token = bearerToken()
  const res = await fetch(`${BASE}/ipg/v1x/c2bPayment/singleStage/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: ORIGIN,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      input_TransactionReference: args.reference,
      input_CustomerMSISDN: msisdn,
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

// 84/85xxxxxxx -> 25884xxxxxxx. M-Pesa é só Vodacom (84/85); devolve null se inválido.
export function normalizeMsisdn(phone: string): string | null {
  let d = phone.replace(/\D/g, '').replace(/^0+/, '')
  if (!d.startsWith('258')) d = '258' + d
  return /^258(84|85)\d{7}$/.test(d) ? d : null
}
