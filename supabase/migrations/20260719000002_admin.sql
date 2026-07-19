-- P3: painel admin. Flag simples — 1-2 admins de confiança, sem RBAC.
alter table public.profiles add column is_admin boolean not null default false;

-- O cliente nunca escreve is_admin (marca-se por SQL: update profiles set is_admin = true where id = '<uuid>').
revoke update (is_admin) on public.profiles from authenticated;

-- Admins vêem também livros não publicados (rascunhos) no catálogo.
create policy books_admin_select on public.books for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
