# Backend Zuri — Supabase

Postgres + Auth + Storage geridos. Região recomendada: **Cape Town (af-south-1)**
— a mais próxima de Moçambique.

## Estrutura

```
supabase/
  migrations/
    20260626000001_schema.sql      tabelas + índices
    20260626000002_functions.sql   triggers (signup, progresso, votos) + RPC de activação
    20260626000003_rls.sql         Row Level Security
  seed.sql                         catálogo (10 livros)
  verify.sql                       teste de integridade (não-destrutivo)
```

## Modelo de segurança (o essencial)

| Tabela | Cliente pode | Notas |
|---|---|---|
| `profiles` | ler/editar o próprio | criado por trigger no signup |
| `books` | **só ler** (publicados) | escrita só admin/service_role |
| `reading_progress` | CRUD do próprio | **monotonia reforçada no servidor** (trigger) |
| `subscriptions` | **só ler** o próprio | activação só via `service_role` |
| `payments` | **só ler** o próprio | escrita só `service_role` (worker M-Pesa) |
| `user_stats` | ler/atualizar o próprio | XP escrito pelo cliente (tecto conhecido) |
| `book_requests` | ler todos, criar | `vote_count`/`status` nunca escritos pelo cliente |
| `request_votes` | CRUD dos próprios | privado — ninguém vê os votos dos outros |

**Fronteira crítica:** o cliente **nunca** consegue tornar-se `active`. Não há
política de escrita em `subscriptions`/`payments`; o flip vem do worker M-Pesa
com a `service_role key` (que ignora RLS) chamando `activate_subscription()`.

## Aplicar

### Opção A — Supabase CLI (recomendado)
```bash
npm i -g supabase
supabase link --project-ref <REF>     # do dashboard
supabase db push                       # aplica as migrations por ordem
psql "$DATABASE_URL" -f supabase/seed.sql
psql "$DATABASE_URL" -f supabase/verify.sql   # deve imprimir "VERIFY OK"
```

### Opção B — SQL Editor do dashboard
Cola e corre, **por esta ordem**: `schema` → `functions` → `rls` → `seed`.
Depois cola `verify.sql` (ignora a última linha `\echo`).

## Variáveis de ambiente (cliente)

Só a `anon key` vai para a PWA — é pública por design, a RLS é que protege.

```
VITE_SUPABASE_URL=https://<REF>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

A `service_role key` **nunca** entra no cliente — só no worker M-Pesa (servidor).

## A seguir

1. Cliente Supabase em `src/lib/supabase.ts` + swap dos mocks em `src/data/mock/*`
   (mesmas assinaturas → zero alterações de UI).
2. Worker Cloudflare para o callback M-Pesa → `activate_subscription()`.
3. Upload dos EPUBs para R2 e preencher `books.epub_path`.
