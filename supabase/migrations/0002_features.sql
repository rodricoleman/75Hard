-- ============================================================
-- Rotina — features round 2
-- Onboarding flag, categories/color, brutal mode, missions, undo RPCs
-- ============================================================

-- profile: track first run + sound preference
alter table public.profile add column if not exists first_run_at timestamptz;
alter table public.profile add column if not exists sound_enabled boolean not null default true;

-- habit: category, color, brutal mode
alter table public.habit add column if not exists category text;
alter table public.habit add column if not exists color text;
alter table public.habit add column if not exists brutal boolean not null default false;

-- ============ mission ============
create table if not exists public.mission (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  emoji text,
  week_start date not null,
  target_count integer not null,
  bonus_coin integer not null default 100,
  bonus_xp integer not null default 100,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.mission enable row level security;
drop policy if exists "mission_self" on public.mission;
create policy "mission_self" on public.mission
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists mission_user_week_idx on public.mission(user_id, week_start desc);

-- ============ undo / claim RPCs ============
create or replace function public.unlog_anti_habit(p_log_id uuid)
returns void language plpgsql security definer as $$
declare
  v_uid uuid := auth.uid();
  v_log public.anti_habit_log;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  select * into v_log from public.anti_habit_log where id = p_log_id and user_id = v_uid;
  if not found then return; end if;
  perform public.apply_delta(v_log.coin_lost, 0, 'undo anti', 'anti_habit_log', v_log.id);
  delete from public.anti_habit_log where id = v_log.id;
end;
$$;

create or replace function public.claim_mission(p_mission_id uuid, p_progress integer)
returns public.mission language plpgsql security definer as $$
declare
  v_uid uuid := auth.uid();
  v_m public.mission;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  select * into v_m from public.mission where id = p_mission_id and user_id = v_uid;
  if not found then raise exception 'mission not found'; end if;
  if v_m.claimed_at is not null then raise exception 'already claimed'; end if;
  if p_progress < v_m.target_count then raise exception 'mission not complete'; end if;

  update public.mission set claimed_at = now() where id = p_mission_id returning * into v_m;
  perform public.apply_delta(v_m.bonus_coin, v_m.bonus_xp, 'mission:' || v_m.title, 'mission', v_m.id);
  return v_m;
end;
$$;
