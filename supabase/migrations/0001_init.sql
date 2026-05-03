-- ============================================================
-- Rotina — initial schema
-- Habits, anti-habits, rewards, wallet, completions, redemptions
-- ============================================================

-- ============ profile ============
create table if not exists public.profile (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  coin_balance integer not null default 0,
  xp integer not null default 0,
  level integer not null default 1,
  daily_reminder_hour smallint,
  created_at timestamptz not null default now()
);

alter table public.profile enable row level security;
drop policy if exists "profile_self" on public.profile;
create policy "profile_self" on public.profile
  for all using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.rotina_handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profile (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists rotina_on_auth_user_created on auth.users;
create trigger rotina_on_auth_user_created
  after insert on auth.users
  for each row execute function public.rotina_handle_new_user();

-- ============ habit ============
create table if not exists public.habit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  emoji text,
  type text not null check (type in ('daily','weekly','once')),
  difficulty text not null default 'medium' check (difficulty in ('easy','medium','hard','brutal')),
  coin_reward integer not null default 10,
  xp_reward integer not null default 10,
  weekly_target smallint,
  reminder_hour smallint,
  active boolean not null default true,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.habit enable row level security;
drop policy if exists "habit_self" on public.habit;
create policy "habit_self" on public.habit
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists habit_user_active_idx on public.habit(user_id, active);

-- ============ habit_completion ============
create table if not exists public.habit_completion (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habit(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  coin_earned integer not null default 0,
  xp_earned integer not null default 0,
  streak_at_time integer not null default 0,
  note text,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);

alter table public.habit_completion enable row level security;
drop policy if exists "completion_self" on public.habit_completion;
create policy "completion_self" on public.habit_completion
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists completion_user_date_idx on public.habit_completion(user_id, date desc);
create index if not exists completion_habit_date_idx on public.habit_completion(habit_id, date desc);

-- ============ anti_habit ============
create table if not exists public.anti_habit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  emoji text,
  coin_penalty integer not null default 10,
  active boolean not null default true,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.anti_habit enable row level security;
drop policy if exists "anti_habit_self" on public.anti_habit;
create policy "anti_habit_self" on public.anti_habit
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ anti_habit_log ============
create table if not exists public.anti_habit_log (
  id uuid primary key default gen_random_uuid(),
  anti_habit_id uuid not null references public.anti_habit(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  count integer not null default 1,
  coin_lost integer not null default 0,
  note text,
  created_at timestamptz not null default now()
);

alter table public.anti_habit_log enable row level security;
drop policy if exists "anti_habit_log_self" on public.anti_habit_log;
create policy "anti_habit_log_self" on public.anti_habit_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists anti_log_user_date_idx on public.anti_habit_log(user_id, date desc);

-- ============ reward ============
create table if not exists public.reward (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  emoji text,
  type text not null default 'consumable' check (type in ('consumable','oneoff','big')),
  coin_cost integer not null,
  real_price_brl numeric(10,2),
  stock integer,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.reward enable row level security;
drop policy if exists "reward_self" on public.reward;
create policy "reward_self" on public.reward
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ redemption ============
create table if not exists public.redemption (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid not null references public.reward(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  coin_spent integer not null,
  real_price_brl numeric(10,2),
  redeemed_at timestamptz not null default now(),
  note text
);

alter table public.redemption enable row level security;
drop policy if exists "redemption_self" on public.redemption;
create policy "redemption_self" on public.redemption
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists redemption_user_idx on public.redemption(user_id, redeemed_at desc);

-- ============ wallet_entry (audit log) ============
create table if not exists public.wallet_entry (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  delta_coin integer not null default 0,
  delta_xp integer not null default 0,
  reason text not null,
  ref_table text,
  ref_id uuid,
  created_at timestamptz not null default now()
);

alter table public.wallet_entry enable row level security;
drop policy if exists "wallet_self" on public.wallet_entry;
create policy "wallet_self" on public.wallet_entry
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists wallet_user_idx on public.wallet_entry(user_id, created_at desc);

-- ============ economy RPCs ============
-- Apply a coin/xp delta atomically: updates profile + writes wallet_entry, recalcs level.
-- Level formula: level = 1 + floor(sqrt(xp / 50))
create or replace function public.apply_delta(
  p_delta_coin integer,
  p_delta_xp integer,
  p_reason text,
  p_ref_table text default null,
  p_ref_id uuid default null
) returns public.profile language plpgsql security definer as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.profile;
  v_new_xp integer;
  v_new_level integer;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.wallet_entry (user_id, delta_coin, delta_xp, reason, ref_table, ref_id)
  values (v_uid, p_delta_coin, p_delta_xp, p_reason, p_ref_table, p_ref_id);

  update public.profile
     set coin_balance = greatest(0, coin_balance + p_delta_coin),
         xp = greatest(0, xp + p_delta_xp)
   where id = v_uid
   returning * into v_profile;

  v_new_xp := v_profile.xp;
  v_new_level := 1 + floor(sqrt(v_new_xp::numeric / 50.0))::int;

  if v_new_level <> v_profile.level then
    update public.profile set level = v_new_level where id = v_uid returning * into v_profile;
  end if;

  return v_profile;
end;
$$;

-- Complete a habit for a given date. Idempotent (unique on habit_id+date).
create or replace function public.complete_habit(
  p_habit_id uuid,
  p_date date,
  p_streak integer,
  p_multiplier numeric default 1.0,
  p_note text default null
) returns public.habit_completion language plpgsql security definer as $$
declare
  v_uid uuid := auth.uid();
  v_habit public.habit;
  v_coin integer;
  v_xp integer;
  v_completion public.habit_completion;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;

  select * into v_habit from public.habit where id = p_habit_id and user_id = v_uid;
  if not found then raise exception 'habit not found'; end if;

  v_coin := round(v_habit.coin_reward * coalesce(p_multiplier, 1.0))::int;
  v_xp := round(v_habit.xp_reward * coalesce(p_multiplier, 1.0))::int;

  insert into public.habit_completion
    (habit_id, user_id, date, coin_earned, xp_earned, streak_at_time, note)
    values (p_habit_id, v_uid, p_date, v_coin, v_xp, p_streak, p_note)
  on conflict (habit_id, date) do nothing
  returning * into v_completion;

  if v_completion.id is null then
    select * into v_completion from public.habit_completion
      where habit_id = p_habit_id and date = p_date;
    return v_completion;
  end if;

  perform public.apply_delta(v_coin, v_xp, 'habit:' || v_habit.title, 'habit_completion', v_completion.id);
  return v_completion;
end;
$$;

create or replace function public.uncomplete_habit(p_habit_id uuid, p_date date)
returns void language plpgsql security definer as $$
declare
  v_uid uuid := auth.uid();
  v_completion public.habit_completion;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  select * into v_completion from public.habit_completion
    where habit_id = p_habit_id and date = p_date and user_id = v_uid;
  if not found then return; end if;
  perform public.apply_delta(-v_completion.coin_earned, -v_completion.xp_earned,
    'undo habit completion', 'habit_completion', v_completion.id);
  delete from public.habit_completion where id = v_completion.id;
end;
$$;

create or replace function public.log_anti_habit(
  p_anti_habit_id uuid,
  p_date date,
  p_count integer default 1,
  p_note text default null
) returns public.anti_habit_log language plpgsql security definer as $$
declare
  v_uid uuid := auth.uid();
  v_ah public.anti_habit;
  v_lost integer;
  v_log public.anti_habit_log;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  select * into v_ah from public.anti_habit where id = p_anti_habit_id and user_id = v_uid;
  if not found then raise exception 'anti_habit not found'; end if;

  v_lost := v_ah.coin_penalty * greatest(1, p_count);

  insert into public.anti_habit_log (anti_habit_id, user_id, date, count, coin_lost, note)
  values (p_anti_habit_id, v_uid, p_date, p_count, v_lost, p_note)
  returning * into v_log;

  perform public.apply_delta(-v_lost, 0, 'anti:' || v_ah.title, 'anti_habit_log', v_log.id);
  return v_log;
end;
$$;

create or replace function public.redeem_reward(
  p_reward_id uuid,
  p_note text default null
) returns public.redemption language plpgsql security definer as $$
declare
  v_uid uuid := auth.uid();
  v_reward public.reward;
  v_profile public.profile;
  v_redemption public.redemption;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  select * into v_reward from public.reward where id = p_reward_id and user_id = v_uid;
  if not found then raise exception 'reward not found'; end if;
  if not v_reward.active then raise exception 'reward not active'; end if;

  select * into v_profile from public.profile where id = v_uid;
  if v_profile.coin_balance < v_reward.coin_cost then
    raise exception 'insufficient coin';
  end if;

  insert into public.redemption (reward_id, user_id, coin_spent, real_price_brl, note)
  values (p_reward_id, v_uid, v_reward.coin_cost, v_reward.real_price_brl, p_note)
  returning * into v_redemption;

  perform public.apply_delta(-v_reward.coin_cost, 0, 'reward:' || v_reward.title, 'redemption', v_redemption.id);

  if v_reward.stock is not null then
    update public.reward set stock = greatest(0, stock - 1) where id = p_reward_id;
  end if;

  return v_redemption;
end;
$$;
