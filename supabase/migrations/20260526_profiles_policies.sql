alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
drop policy if exists "Profiles are insertable by owner" on public.profiles;
drop policy if exists "Profiles are updatable by owner" on public.profiles;

create policy "Profiles are viewable by owner"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Profiles are insertable by owner"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Profiles are updatable by owner"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);