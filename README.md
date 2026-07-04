# Zuri

Leitura digital por subscrição para o mercado moçambicano. PWA instalável
(sem app store), ~45 MT/mês via M-Pesa. Comunicação em português.

## Stack

- **Vite + React 18 + TypeScript**, Tailwind 4 (`@tailwindcss/vite`)
- **React Router 7**, **Zustand** (estado, `persist`), **Dexie** (progresso local, offline-first)
- **vite-plugin-pwa** (service worker, manifesto), **html2canvas** (cartões de partilha), **epubjs** (leitor)
- **Supabase** (Postgres + Auth + RLS, Cape Town) · **Cloudflare Pages** (PWA) + **R2** (EPUBs)

## Correr localmente

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build
```

Sem `.env`, a app corre **100% em modo mock** (sem backend). Para ligar o
Supabase, copia `.env.example` → `.env.local` e preenche.

## Arquitectura mock-first

Toda a "camada de servidor" passa pelo façade `src/data/services.ts`, que
auto-selecciona **real vs mock** conforme o Supabase está configurado. As
implementações reais (`src/data/api/*`) carregam por `import()` dinâmico — o
`@supabase/supabase-js` nunca entra no chunk inicial.

| Caminho | Estado |
|---|---|
| Auth (Supabase Auth) | ligado |
| Progresso de leitura (offline-first: Dexie + sync) | ligado |
| M-Pesa (Edge Functions) | escrito, liga quando as functions estiverem de pé |

## Backend

- `supabase/` — migrações, RLS, seed, `verify.sql` (ver `supabase/README.md`)
- `supabase/functions/` — Edge Functions M-Pesa (ver `supabase/functions/README.md`)

**Fronteira de segurança:** o cliente nunca se torna `active`. A activação de
subscrição é server-side (Edge Function via `service_role` → `activate_subscription`).

## A fazer (precisa de contas/credenciais)

1. Criar projecto Supabase, `supabase db push` + `verify.sql`, preencher `.env.local`.
2. Validar `_shared/mpesa.ts` contra o onboarding M-Pesa, fazer deploy das functions.
3. Upload dos EPUBs para R2 e preencher `books.epub_path`.
4. Deploy: Cloudflare Pages (`wrangler pages deploy dist`) + domínio.
