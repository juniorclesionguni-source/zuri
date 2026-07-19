# Edge Functions

Quatro funções Deno:

```
mpesa-initiate   invocada pelo cliente → cria payment, marca subscrição pending, dispara STK push
mpesa-callback   webhook do M-Pesa → em sucesso, activa a subscrição (única via de activação)
book-access      URL assinado (R2) para ler um EPUB; sample=true limita não-subscritores ao 1º capítulo
admin-upload     painel /admin: presigned PUT para R2 (epub+capa) + upsert em books
_shared/mpesa.ts chamada C2B + cifra RSA (PKCS#1 v1.5, via jsrsasign) do Bearer token
_shared/plans.ts fonte de verdade de preço/dias por plano (semana/14d/mês/ano)
```

## Fluxo de pagamento

```
Cliente (Checkout) → mpesa-initiate → M-Pesa → [PIN no telemóvel do user]
                                          ↓
                              M-Pesa → mpesa-callback → activate_subscription()
                                          ↓
Cliente (Processing) faz poll a subscriptions/payments.status → 'active' → Success
```

O cliente já está ligado ao fluxo real (`src/data/api/mpesa.ts`,
`Checkout.tsx`/`Processing.tsx`). O único mock que resta é o pagamento em si:
`src/lib/paymentConfig.ts` (`PAYMENT_SIMULATED = true`) enquanto as
credenciais sandbox não estão configuradas.

## Deploy

```bash
supabase functions deploy mpesa-initiate
supabase functions deploy mpesa-callback --no-verify-jwt   # webhook é público
supabase functions deploy book-access
supabase functions deploy admin-upload

# Segredos M-Pesa (NUNCA no cliente):
supabase secrets set \
  MPESA_API_KEY=... \
  MPESA_PUBLIC_KEY=... \
  MPESA_SERVICE_PROVIDER_CODE=... \
  MPESA_CALLBACK_TOKEN=$(openssl rand -hex 16)

# Segredos R2 (ver supabase/README.md para os nomes dos buckets):
supabase secrets set \
  R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... \
  R2_EPUB_BUCKET=zuri-books R2_COVER_BUCKET=zuri-epubs
# SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY já existem no ambiente das functions.
```

Regista o URL do callback no portal M-Pesa:
`https://<REF>.functions.supabase.co/mpesa-callback?token=<MPESA_CALLBACK_TOKEN>`

## Depois de ligar as credenciais reais

1. `supabase secrets set MPESA_API_KEY=... MPESA_PUBLIC_KEY=... MPESA_SERVICE_PROVIDER_CODE=...`
2. `supabase functions deploy mpesa-initiate mpesa-callback`
3. Muda `PAYMENT_SIMULATED` para `false` em `src/lib/paymentConfig.ts` e apaga
   os ramos "simulado" em `Checkout.tsx`/`Processing.tsx`.
4. Testa com um número sandbox real antes de tirar o flag de produção.
