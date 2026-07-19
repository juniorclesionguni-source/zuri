-- Planos com durações variáveis (semana/14d/mês/ano). A duração vive na linha de
-- payments; o callback lê-a e passa à RPC. activate_subscription passa a somar DIAS.

alter table public.payments
  add column if not exists plan_days int not null default 30;

-- Renomear parâmetro (p_months→p_days) exige DROP; create-or-replace não o permite.
drop function if exists public.activate_subscription(uuid, text, int);

-- Recria com p_days. Empilha renovações: estende a partir do maior entre agora e a expiração actual.
create function public.activate_subscription(
  p_user_id uuid,
  p_transaction_id text,
  p_days int default 30
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.subscriptions
     set status = 'active',
         started_at = now(),
         expires_at = greatest(coalesce(expires_at, now()), now()) + (p_days || ' days')::interval,
         mpesa_transaction_id = p_transaction_id
   where user_id = p_user_id;
end;
$$;

revoke execute on function public.activate_subscription(uuid, text, int) from anon, authenticated;
