-- Single-user mode: drop auth.users FK and relax RLS so anon key can read/write.

alter table public.h75_profiles
  drop constraint if exists h75_profiles_id_fkey;

alter table public.h75_challenges
  drop constraint if exists h75_challenges_user_id_fkey;

drop trigger if exists h75_on_auth_user_created on auth.users;
drop function if exists public.h75_on_user_created();

drop policy if exists "h75_profiles owner" on public.h75_profiles;
drop policy if exists "h75_challenges owner" on public.h75_challenges;
drop policy if exists "h75_daily_entries owner" on public.h75_daily_entries;

create policy "h75_profiles anon all" on public.h75_profiles
  for all using (true) with check (true);

create policy "h75_challenges anon all" on public.h75_challenges
  for all using (true) with check (true);

create policy "h75_daily_entries anon all" on public.h75_daily_entries
  for all using (true) with check (true);
