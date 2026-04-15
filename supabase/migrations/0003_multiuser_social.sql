-- Multi-user + social feed + ranking
-- 1. Reverter single-user: limpar dados órfãos, depois restaurar FKs e RLS por auth.uid()
-- 2. Novas tabelas: h75_profiles (extend), h75_invites, h75_posts, h75_post_likes, h75_post_comments
-- 3. View h75_leaderboard + RPC redeem_invite + bucket h75-social-posts

drop policy if exists "h75_profiles anon all" on public.h75_profiles;
drop policy if exists "h75_challenges anon all" on public.h75_challenges;
drop policy if exists "h75_daily_entries anon all" on public.h75_daily_entries;

-- Limpar dados órfãos ANTES de restaurar FK (IDs fake do modo single-user)
delete from public.h75_daily_entries
  where challenge_id in (
    select id from public.h75_challenges
    where user_id not in (select id from auth.users)
  );
delete from public.h75_challenges
  where user_id not in (select id from auth.users);
delete from public.h75_profiles
  where id not in (select id from auth.users);

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'h75_profiles_id_fkey' and table_name = 'h75_profiles'
  ) then
    alter table public.h75_profiles
      add constraint h75_profiles_id_fkey foreign key (id)
      references auth.users(id) on delete cascade;
  end if;
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'h75_challenges_user_id_fkey' and table_name = 'h75_challenges'
  ) then
    alter table public.h75_challenges
      add constraint h75_challenges_user_id_fkey foreign key (user_id)
      references auth.users(id) on delete cascade;
  end if;
end $$;

alter table public.h75_profiles
  add column if not exists username text unique,
  add column if not exists display_name text,
  add column if not exists avatar_url text;

create table if not exists public.h75_invites (
  code text primary key,
  created_by uuid references auth.users(id) on delete cascade not null,
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz default now()
);
alter table public.h75_invites enable row level security;

create table if not exists public.h75_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  photo_url text not null,
  caption text,
  created_at timestamptz default now()
);
create index if not exists h75_posts_created_idx on public.h75_posts(created_at desc);
alter table public.h75_posts enable row level security;

create table if not exists public.h75_post_likes (
  post_id uuid references public.h75_posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);
alter table public.h75_post_likes enable row level security;

create table if not exists public.h75_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.h75_posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz default now()
);
create index if not exists h75_post_comments_post_idx on public.h75_post_comments(post_id, created_at);
alter table public.h75_post_comments enable row level security;

-- RLS policies

create policy "h75_profiles select authed" on public.h75_profiles
  for select to authenticated using (true);
create policy "h75_profiles update own" on public.h75_profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "h75_profiles insert self" on public.h75_profiles
  for insert to authenticated with check (auth.uid() = id);

create policy "h75_challenges select own" on public.h75_challenges
  for select to authenticated using (auth.uid() = user_id);
create policy "h75_challenges write own" on public.h75_challenges
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "h75_daily_entries via challenge" on public.h75_daily_entries
  for all to authenticated using (
    exists (select 1 from public.h75_challenges c where c.id = challenge_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.h75_challenges c where c.id = challenge_id and c.user_id = auth.uid())
  );

create policy "h75_invites select own" on public.h75_invites
  for select to authenticated using (created_by = auth.uid());
create policy "h75_invites insert own" on public.h75_invites
  for insert to authenticated with check (created_by = auth.uid());

create policy "h75_posts select authed" on public.h75_posts
  for select to authenticated using (true);
create policy "h75_posts insert own" on public.h75_posts
  for insert to authenticated with check (user_id = auth.uid());
create policy "h75_posts delete own" on public.h75_posts
  for delete to authenticated using (user_id = auth.uid());

create policy "h75_post_likes select authed" on public.h75_post_likes
  for select to authenticated using (true);
create policy "h75_post_likes insert own" on public.h75_post_likes
  for insert to authenticated with check (user_id = auth.uid());
create policy "h75_post_likes delete own" on public.h75_post_likes
  for delete to authenticated using (user_id = auth.uid());

create policy "h75_post_comments select authed" on public.h75_post_comments
  for select to authenticated using (true);
create policy "h75_post_comments insert own" on public.h75_post_comments
  for insert to authenticated with check (user_id = auth.uid());
create policy "h75_post_comments delete own" on public.h75_post_comments
  for delete to authenticated using (user_id = auth.uid());

-- Trigger: cria linha em h75_profiles ao criar auth.user

create or replace function public.h75_on_user_created()
returns trigger language plpgsql security definer as $$
begin
  insert into public.h75_profiles (id) values (new.id)
    on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists h75_on_auth_user_created on auth.users;
create trigger h75_on_auth_user_created
  after insert on auth.users
  for each row execute function public.h75_on_user_created();

-- RPC: consome convite + seta username/display_name + cria challenge inicial

create or replace function public.h75_redeem_invite(
  p_code text,
  p_username text,
  p_display_name text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_invite public.h75_invites%rowtype;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_invite from public.h75_invites where code = p_code for update;
  if not found then
    raise exception 'Invalid invite code';
  end if;
  if v_invite.used_by is not null then
    raise exception 'Invite already used';
  end if;

  if exists (select 1 from public.h75_profiles where username = p_username and id <> v_uid) then
    raise exception 'Username taken';
  end if;

  update public.h75_invites
    set used_by = v_uid, used_at = now()
    where code = p_code;

  insert into public.h75_profiles (id, username, display_name)
    values (v_uid, p_username, coalesce(p_display_name, p_username))
    on conflict (id) do update
      set username = excluded.username,
          display_name = excluded.display_name;

  if not exists (select 1 from public.h75_challenges where user_id = v_uid) then
    insert into public.h75_challenges (user_id) values (v_uid);
  end if;
end;
$$;

grant execute on function public.h75_redeem_invite(text, text, text) to authenticated;

-- View leaderboard: streak atual + total de dias completos

create or replace view public.h75_leaderboard
with (security_invoker = on) as
with active as (
  select distinct on (user_id)
    id, user_id, started_at
  from public.h75_challenges
  where failed_at is null and completed_at is null
  order by user_id, started_at desc
),
entries as (
  select a.user_id, de.day_number, de.completed
  from active a
  join public.h75_daily_entries de on de.challenge_id = a.id
),
completed_days as (
  select user_id, count(*)::int as completed_days
  from entries where completed
  group by user_id
),
grouped as (
  select user_id, day_number,
    day_number - row_number() over (partition by user_id order by day_number) as grp
  from entries where completed
),
blocks as (
  select user_id, grp, count(*)::int as block_size, max(day_number) as block_max
  from grouped
  group by user_id, grp
),
last_completed as (
  select user_id, max(day_number) as max_day
  from entries where completed
  group by user_id
),
streaks as (
  select b.user_id, b.block_size as current_streak
  from blocks b
  join last_completed lc on lc.user_id = b.user_id and lc.max_day = b.block_max
)
select
  p.id as user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  coalesce(cd.completed_days, 0) as completed_days,
  coalesce(s.current_streak, 0) as current_streak
from public.h75_profiles p
left join completed_days cd on cd.user_id = p.id
left join streaks s on s.user_id = p.id
where p.username is not null;

grant select on public.h75_leaderboard to authenticated;

-- Storage bucket para posts sociais

insert into storage.buckets (id, name, public)
  values ('h75-social-posts', 'h75-social-posts', true)
  on conflict (id) do nothing;

drop policy if exists "h75 social read" on storage.objects;
drop policy if exists "h75 social write own" on storage.objects;
drop policy if exists "h75 social delete own" on storage.objects;

create policy "h75 social read" on storage.objects
  for select using (bucket_id = 'h75-social-posts');

create policy "h75 social write own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'h75-social-posts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "h75 social delete own" on storage.objects
  for delete to authenticated using (
    bucket_id = 'h75-social-posts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
