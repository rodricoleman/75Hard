-- Personalized challenge goals: each user picks workout minutes, water volume,
-- reading pages, and whether diet is part of their rules during onboarding.

alter table public.h75_challenges
  add column if not exists workout_indoor_min int,
  add column if not exists workout_outdoor_min int,
  add column if not exists water_ml_goal int,
  add column if not exists reading_pages_goal int,
  add column if not exists diet_enabled boolean,
  add column if not exists onboarded_at timestamptz;

-- Backfill defaults for existing challenges so the app keeps working.
update public.h75_challenges
   set workout_indoor_min  = coalesce(workout_indoor_min, 45),
       workout_outdoor_min = coalesce(workout_outdoor_min, 45),
       water_ml_goal       = coalesce(water_ml_goal, 3700),
       reading_pages_goal  = coalesce(reading_pages_goal, 10),
       diet_enabled        = coalesce(diet_enabled, true),
       onboarded_at        = coalesce(onboarded_at, created_at);

-- Enforce minimums going forward.
alter table public.h75_challenges
  add constraint h75_challenges_workout_indoor_min_chk
    check (workout_indoor_min is null or workout_indoor_min >= 45),
  add constraint h75_challenges_workout_outdoor_min_chk
    check (workout_outdoor_min is null or workout_outdoor_min >= 45),
  add constraint h75_challenges_water_ml_goal_chk
    check (water_ml_goal is null or water_ml_goal between 500 and 10000),
  add constraint h75_challenges_reading_pages_goal_chk
    check (reading_pages_goal is null or reading_pages_goal >= 10);

-- Stop auto-creating a challenge on invite redeem. Onboarding now owns that step.
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
end;
$$;

-- New RPC: onboarding finalization. Creates the challenge with chosen goals.
-- Fails if the user already has an active challenge.
create or replace function public.h75_start_challenge(
  p_workout_indoor_min int,
  p_workout_outdoor_min int,
  p_water_ml_goal int,
  p_reading_pages_goal int,
  p_diet_enabled boolean
) returns public.h75_challenges
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.h75_challenges%rowtype;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_workout_indoor_min < 45 or p_workout_outdoor_min < 45 then
    raise exception 'Workout minutes must be at least 45';
  end if;
  if p_water_ml_goal < 500 or p_water_ml_goal > 10000 then
    raise exception 'Water goal out of range (500–10000 ml)';
  end if;
  if p_reading_pages_goal < 10 then
    raise exception 'Reading pages must be at least 10';
  end if;

  if exists (
    select 1 from public.h75_challenges
    where user_id = v_uid and failed_at is null and completed_at is null
  ) then
    raise exception 'Active challenge already exists';
  end if;

  insert into public.h75_challenges (
    user_id,
    workout_indoor_min,
    workout_outdoor_min,
    water_ml_goal,
    reading_pages_goal,
    diet_enabled,
    onboarded_at
  ) values (
    v_uid,
    p_workout_indoor_min,
    p_workout_outdoor_min,
    p_water_ml_goal,
    p_reading_pages_goal,
    p_diet_enabled,
    now()
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.h75_start_challenge(int, int, int, int, boolean) to authenticated;
