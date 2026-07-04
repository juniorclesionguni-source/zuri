-- Zuri — verificação da lógica de integridade (triggers + RPC).
-- Corre como service_role/superuser (ignora RLS, testa os triggers).
-- Não-destrutivo: tudo dentro de uma transação com ROLLBACK no fim.
--   psql "$DATABASE_URL" -f supabase/verify.sql
-- ou cola no SQL Editor do Supabase (o \echo final não corre aí, ignora-o).

begin;

-- Utilizador de teste — dispara handle_new_user (perfil + stats + subscrição).
-- (id + email bastam num auth.users padrão do Supabase.)
insert into auth.users (id, email)
  values ('00000000-0000-0000-0000-000000000001', 'verify@zuri.app');

do $$
begin
  assert (select count(*) from public.profiles   where id = '00000000-0000-0000-0000-000000000001') = 1,
    'signup: profile não criado';
  assert (select count(*) from public.user_stats where user_id = '00000000-0000-0000-0000-000000000001') = 1,
    'signup: user_stats não criado';
  assert (select status from public.subscriptions where user_id = '00000000-0000-0000-0000-000000000001') = 'inactive',
    'signup: subscrição inicial deveria ser inactive';
end $$;

-- Progresso monótono: 50 -> tentativa de 30 -> deve manter-se 50.
insert into public.books (id, title, author, genre) values ('verify-book', 'T', 'A', 'Ficção');
insert into public.reading_progress (user_id, book_id, progress_pct)
  values ('00000000-0000-0000-0000-000000000001', 'verify-book', 50);
update public.reading_progress set progress_pct = 30
  where user_id = '00000000-0000-0000-0000-000000000001' and book_id = 'verify-book';

do $$
begin
  assert (select progress_pct from public.reading_progress
          where user_id = '00000000-0000-0000-0000-000000000001' and book_id = 'verify-book') = 50,
    'monotonic: progresso decresceu (deveria manter 50)';
end $$;

-- is_finished vira true a >= 95.
update public.reading_progress set progress_pct = 96
  where user_id = '00000000-0000-0000-0000-000000000001' and book_id = 'verify-book';
do $$
begin
  assert (select is_finished from public.reading_progress
          where user_id = '00000000-0000-0000-0000-000000000001' and book_id = 'verify-book'),
    'is_finished: deveria ser true a 96%';
end $$;

-- Contagem de votos: +1 ao votar, -1 ao remover.
insert into public.book_requests (id, title, created_by)
  values ('11111111-0000-0000-0000-000000000001', 'Pedido teste', '00000000-0000-0000-0000-000000000001');
insert into public.request_votes (request_id, user_id)
  values ('11111111-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');
do $$
begin
  assert (select vote_count from public.book_requests where id = '11111111-0000-0000-0000-000000000001') = 1,
    'vote_count: deveria ser 1 após voto';
end $$;
delete from public.request_votes
  where request_id = '11111111-0000-0000-0000-000000000001' and user_id = '00000000-0000-0000-0000-000000000001';
do $$
begin
  assert (select vote_count from public.book_requests where id = '11111111-0000-0000-0000-000000000001') = 0,
    'vote_count: deveria voltar a 0 após remover voto';
end $$;

-- Activação de subscrição via RPC (papel do worker M-Pesa).
select public.activate_subscription('00000000-0000-0000-0000-000000000001', 'TXN-VERIFY', 1);
do $$
begin
  assert (select status from public.subscriptions where user_id = '00000000-0000-0000-0000-000000000001') = 'active',
    'activate_subscription: status deveria ser active';
  assert (select expires_at > now() + interval '25 days' from public.subscriptions
          where user_id = '00000000-0000-0000-0000-000000000001'),
    'activate_subscription: expiry deveria ser ~1 mês à frente';
end $$;

rollback;
\echo 'VERIFY OK — todos os asserts passaram'
