create table public.favorites (
  user_id    uuid not null references auth.users(id) on delete cascade,
  book_id    text not null references public.books(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, book_id)
);
alter table public.favorites enable row level security;
create policy "favorites_own_select" on public.favorites for select using (user_id = auth.uid());
create policy "favorites_own_insert" on public.favorites for insert with check (user_id = auth.uid());
create policy "favorites_own_delete" on public.favorites for delete using (user_id = auth.uid());
