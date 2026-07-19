-- P1: M-Pesa real. Remove a activação simulada self-serve (era TEMPORÁRIA).
-- A única via de activação passa a ser o callback M-Pesa → activate_subscription (service_role).
drop function if exists public.activate_own_subscription();
