-- Zuri — schema base
-- Postgres 15 / Supabase. auth.users é gerido pelo Supabase Auth.

create extension if not exists pgcrypto; -- gen_random_uuid()

-- Perfil: estende auth.users (1:1)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  phone       text,                         -- ligado ao número M-Pesa
  genres      text[] not null default '{}', -- géneros escolhidos no onboarding
  created_at  timestamptz not null default now()
);

-- Catálogo. id é um slug ('terra', 'niketche'…). Escrita só por admin (service_role).
create table public.books (
  id           text primary key,
  title        text not null,
  author       text not null,
  pages        int  not null default 0,
  genre        text not null,
  rating       numeric(2,1) not null default 0,
  mins         int  not null default 0,
  synopsis     text,
  epub_path    text,                          -- chave do objecto em R2
  cover_path   text,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Progresso de leitura. PK composta (user, book) = a lookup de getProgress, já indexada.
create table public.reading_progress (
  user_id      uuid not null references auth.users(id) on delete cascade,
  book_id      text not null references public.books(id) on delete cascade,
  progress_pct int  not null default 0 check (progress_pct between 0 and 100),
  last_cfi     text not null default '',
  is_finished  boolean not null default false,
  updated_at   timestamptz not null default now(),
  primary key (user_id, book_id)
);

-- Subscrição. Histórico mantido; status/expiry só mudam via service_role (worker M-Pesa).
create table public.subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  status                text not null default 'inactive'
                          check (status in ('inactive','pending','active','expired')),
  started_at            timestamptz,
  expires_at            timestamptz,
  mpesa_transaction_id  text,
  created_at            timestamptz not null default now()
);
create index subscriptions_user_status_idx on public.subscriptions(user_id, status);

-- Registo de pagamentos M-Pesa (auditoria). Escrita só por service_role.
create table public.payments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  transaction_id  text unique not null,
  phone           text not null,
  amount          numeric(10,2) not null,
  status          text not null default 'pending'
                    check (status in ('pending','success','failed')),
  raw             jsonb,                       -- payload bruto do callback
  created_at      timestamptz not null default now()
);

-- Gamificação. last_read_date serve para o cálculo de streak.
create table public.user_stats (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  xp             int not null default 0,
  level          int not null default 1,
  streak_days    int not null default 0,
  books_read     int not null default 0,
  hours_read     int not null default 0,
  last_read_date date,
  updated_at     timestamptz not null default now()
);

-- Pedidos de livros (quadro de votação "Mais pedidos").
create table public.book_requests (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  author      text,
  status      text not null default 'pending'
                check (status in ('pending','review','licensing','available')),
  vote_count  int not null default 0,         -- denormalizado, mantido por trigger
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index book_requests_votes_idx on public.book_requests(vote_count desc);

-- Votos. PK composta = um voto por utilizador por pedido. Visível só ao próprio.
create table public.request_votes (
  request_id  uuid not null references public.book_requests(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (request_id, user_id)
);
