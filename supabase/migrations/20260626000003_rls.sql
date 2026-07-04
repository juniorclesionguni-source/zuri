-- Zuri — Row Level Security
-- Princípio: cada utilizador só toca nos seus dados. Catálogo é leitura pública.
-- Subscrições e pagamentos são READ-ONLY para o cliente (escrita só service_role).

alter table public.profiles         enable row level security;
alter table public.books            enable row level security;
alter table public.reading_progress enable row level security;
alter table public.subscriptions    enable row level security;
alter table public.payments         enable row level security;
alter table public.user_stats       enable row level security;
alter table public.book_requests    enable row level security;
alter table public.request_votes    enable row level security;

-- profiles: ver/editar o próprio (insert vem do trigger)
create policy profiles_select on public.profiles for select using (id = auth.uid());
create policy profiles_update on public.profiles for update using (id = auth.uid());

-- books: leitura pública dos publicados; sem escrita do cliente
create policy books_read on public.books for select to anon, authenticated using (is_published);

-- reading_progress: CRUD completo dos próprios registos
create policy progress_all on public.reading_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- subscriptions: só leitura do próprio. NENHUMA política de escrita => cliente
-- não consegue inserir/alterar (service_role ignora RLS).
create policy subscriptions_select on public.subscriptions for select using (user_id = auth.uid());

-- payments: idem, só leitura do próprio
create policy payments_select on public.payments for select using (user_id = auth.uid());

-- user_stats: ver/atualizar os próprios (XP, streak)
-- ponytail: cliente pode escrever o próprio XP. Aceitável (baixo risco). Tecto:
-- se houver fraude de XP, mover addXP para RPC SECURITY DEFINER que valida deltas.
create policy stats_select on public.user_stats for select using (user_id = auth.uid());
create policy stats_update on public.user_stats for update using (user_id = auth.uid());

-- book_requests: todos os autenticados leem; qualquer um cria (como autor).
-- vote_count e status nunca são escritos pelo cliente (trigger / admin).
create policy requests_read   on public.book_requests for select to authenticated using (true);
create policy requests_insert on public.book_requests for insert to authenticated with check (created_by = auth.uid());

-- request_votes: privacidade — cada um só vê/gere os seus votos.
create policy votes_select on public.request_votes for select using (user_id = auth.uid());
create policy votes_insert on public.request_votes for insert with check (user_id = auth.uid());
create policy votes_delete on public.request_votes for delete using (user_id = auth.uid());
