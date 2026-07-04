-- Zuri — funções e triggers

-- 1) Ao registar um utilizador, criar perfil + stats + subscrição inativa.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
    values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  insert into public.user_stats (user_id) values (new.id);
  insert into public.subscriptions (user_id, status) values (new.id, 'inactive');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) Progresso monótono REFORÇADO no servidor: nunca decresce, mesmo que o
--    cliente envie um valor menor (defesa contra perda de progresso / replays).
create or replace function public.enforce_progress_monotonic()
returns trigger
language plpgsql
as $$
begin
  new.progress_pct := greatest(new.progress_pct, old.progress_pct);
  new.is_finished  := new.progress_pct >= 95;
  new.updated_at   := now();
  return new;
end;
$$;

create trigger reading_progress_monotonic
  before update on public.reading_progress
  for each row execute function public.enforce_progress_monotonic();

-- Também marcar is_finished no insert.
create or replace function public.set_progress_finished()
returns trigger
language plpgsql
as $$
begin
  new.is_finished := new.progress_pct >= 95;
  return new;
end;
$$;

create trigger reading_progress_finished_insert
  before insert on public.reading_progress
  for each row execute function public.set_progress_finished();

-- 3) Contagem de votos denormalizada: mantida por trigger, SECURITY DEFINER
--    para poder escrever em book_requests sem dar UPDATE ao utilizador.
create or replace function public.sync_vote_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.book_requests set vote_count = vote_count + 1 where id = new.request_id;
  elsif tg_op = 'DELETE' then
    update public.book_requests set vote_count = greatest(vote_count - 1, 0) where id = old.request_id;
  end if;
  return null;
end;
$$;

create trigger request_votes_count
  after insert or delete on public.request_votes
  for each row execute function public.sync_vote_count();

-- 4) Activação de subscrição — chamada pelo worker M-Pesa (service_role).
--    Encerra a lógica de negócio do "+1 mês" no servidor, longe do cliente.
create or replace function public.activate_subscription(
  p_user_id uuid,
  p_transaction_id text,
  p_months int default 1
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.subscriptions
     set status = 'active',
         started_at = now(),
         expires_at = now() + (p_months || ' months')::interval,
         mpesa_transaction_id = p_transaction_id
   where user_id = p_user_id;
end;
$$;

-- Bloquear chamada da RPC a partir de clientes; só service_role.
revoke execute on function public.activate_subscription(uuid, text, int) from anon, authenticated;
