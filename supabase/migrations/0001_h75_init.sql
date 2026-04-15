-- 75Hard tables (h75_ prefix, shared project)

create table if not exists public.h75_profiles (
  id uuid primary key references auth.users on delete cascade,
  created_at timestamptz default now(),
  notification_time time default '07:00'
);

create table if not exists public.h75_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  started_at date not null default current_date,
  failed_at date,
  completed_at date,
  created_at timestamptz default now()
);
create index if not exists h75_challenges_user_active
  on public.h75_challenges (user_id)
  where failed_at is null and completed_at is null;

create table if not exists public.h75_daily_entries (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references public.h75_challenges on delete cascade not null,
  day_number int not null check (day_number between 1 and 75),
  entry_date date not null,
  workout_indoor bool default false,
  workout_outdoor bool default false,
  diet bool default false,
  water_ml int default 0,
  reading_pages int default 0,
  progress_photo_url text,
  completed bool generated always as (
    workout_indoor and workout_outdoor and diet
    and water_ml >= 3700 and reading_pages >= 10
    and progress_photo_url is not null
  ) stored,
  created_at timestamptz default now(),
  unique(challenge_id, day_number)
);

alter table public.h75_profiles enable row level security;
alter table public.h75_challenges enable row level security;
alter table public.h75_daily_entries enable row level security;

create policy "h75_profiles owner" on public.h75_profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "h75_challenges owner" on public.h75_challenges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "h75_daily_entries owner" on public.h75_daily_entries
  for all using (
    exists (
      select 1 from public.h75_challenges c
      where c.id = challenge_id and c.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.h75_challenges c
      where c.id = challenge_id and c.user_id = auth.uid()
    )
  );

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
