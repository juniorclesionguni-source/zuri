-- TEMPORÁRIO: activação simulada pelo próprio utilizador (sem pagamento real).
-- Quando o M-Pesa estiver ligado, REVOGAR e deixar só a via service_role (callback).
create or replace function public.activate_own_subscription()
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.activate_subscription(
    auth.uid(),
    'SIM-' || substr(replace(gen_random_uuid()::text,'-',''),1,10),
    1
  );
end;
$$;
grant execute on function public.activate_own_subscription() to authenticated;
