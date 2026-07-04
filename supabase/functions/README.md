# Edge Functions — pagamento M-Pesa

Duas funções Deno. A **orquestração** (DB, RPC `activate_subscription`, validação
de JWT) está completa. A parte que **precisa das tuas credenciais de merchant** e
não foi testada está isolada em `_shared/mpesa.ts` (marcada com TODO).

```
mpesa-initiate   invocada pelo cliente → cria payment, marca subscrição pending, dispara STK push
mpesa-callback   webhook do M-Pesa → em sucesso, activa a subscrição (única via de activação)
_shared/mpesa.ts chamada C2B + cifra RSA do Bearer  ← validar contra o onboarding M-Pesa
```

## Fluxo

```
Cliente (Checkout) → mpesa-initiate → M-Pesa → [PIN no telemóvel do user]
                                          ↓
                              M-Pesa → mpesa-callback → activate_subscription()
                                          ↓
Cliente (Processing) faz poll a subscriptions.status → 'active' → Success
```

## Deploy

```bash
supabase functions deploy mpesa-initiate
supabase functions deploy mpesa-callback --no-verify-jwt   # webhook é público

# Segredos (NUNCA no cliente):
supabase secrets set \
  MPESA_API_KEY=... \
  MPESA_PUBLIC_KEY=... \
  MPESA_SERVICE_PROVIDER_CODE=... \
  MPESA_CALLBACK_TOKEN=$(openssl rand -hex 16)
# SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY já existem no ambiente das functions.
```

Regista o URL do callback no portal M-Pesa:
`https://<REF>.functions.supabase.co/mpesa-callback?token=<MPESA_CALLBACK_TOKEN>`

## Ligar o cliente (quando as functions estiverem de pé)

`src/data/api/mpesa.ts` já chama `functions.invoke('mpesa-initiate')` e lê
`subscriptions.status`. Só falta trocar o fluxo mock pelo real em:
- `src/screens/paywall/Checkout.tsx` → `mpesa.initiate(phone, 45)` antes de navegar
- `src/screens/paywall/Processing.tsx` → `mpesa.poll()` em vez do timeout fixo

## Antes de produção — validar em `_shared/mpesa.ts`
- Padding RSA do Bearer (RSA-OAEP vs PKCS#1 v1.5).
- Nomes exatos dos campos no payload do callback.
- Endpoint/porta de sandbox vs produção.
