-- Tolerance level: how many missed days the user allows before the challenge resets.
-- 0 = classic 75 Hard (any miss = reset). >0 = forgiveness buffer.

alter table public.h75_challenges
  add column if not exists max_misses int not null default 0;

alter table public.h75_challenges
  add constraint h75_challenges_max_misses_chk
    check (max_misses between 0 and 30);

-- Update start_challenge RPC to accept tolerance on challenge creation.
create or replace function public.h75_start_challenge(
  p_workout_indoor_min int,
  p_workout_outdoor_min int,
  p_water_ml_goal int,
  p_reading_pages_goal int,
  p_diet_enabled boolean,
  p_max_misses int default 0
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
  if p_max_misses < 0 or p_max_misses > 30 then
    raise exception 'Tolerance out of range (0–30 missed days)';
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
    max_misses,
    onboarded_at
  ) values (
    v_uid,
    p_workout_indoor_min,
    p_workout_outdoor_min,
    p_water_ml_goal,
    p_reading_pages_goal,
    p_diet_enabled,
    p_max_misses,
    now()
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.h75_start_challenge(int, int, int, int, boolean, int) to authenticated;
-- Drop the old 5-arg signature if Postgres didn't replace it (it creates a new overload).
drop function if exists public.h75_start_challenge(int, int, int, int, boolean);
