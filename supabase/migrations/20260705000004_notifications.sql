-- Notificações in-app (central de notificações). Cada utilizador vê só as suas.
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null default 'info',       -- info | levelup | book | request
  title       text not null,
  body        text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;
create policy notif_select on public.notifications for select using (user_id = auth.uid());
create policy notif_insert on public.notifications for insert with check (user_id = auth.uid());
create policy notif_update on public.notifications for update using (user_id = auth.uid());
