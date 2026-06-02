-- ═══════════════════════════════════════════════════════════
-- KALION MAX — Alle ausstehenden Migrationen in einer Datei
-- Einmal im Supabase SQL-Editor ausführen
-- ═══════════════════════════════════════════════════════════
--
-- Diese Datei führt nacheinander aus:
--   0. fehlende profile-Spalten (idempotent)
--   1. activity_migration.sql    — Community-Activity-Feed
--   2. cardio_migration.sql      — Cardio-Sessions + GPS-Tracks
--   3. pro_grant_migration.sql   — Pro kostenfrei freischalten
--   4. beta_users_migration.sql  — is_beta-Flag für Demo-User
--
-- ═══════════════════════════════════════════════════════════

-- ── 0/4 Voraussetzungen: alle Spalten anlegen die der Activity-Feed braucht ──

-- presence_migration: last_seen_at
alter table profiles
  add column if not exists last_seen_at timestamptz default now();
create index if not exists profiles_last_seen_idx on profiles (last_seen_at desc);

create or replace function public.mark_online()
returns void language sql security definer set search_path = public
as $$ update profiles set last_seen_at = now() where id = auth.uid(); $$;

create or replace function public.get_user_stats()
returns table (online_count int, total_count int)
language sql security definer set search_path = public stable
as $$
  select
    (select count(*)::int from profiles where last_seen_at > now() - interval '5 minutes'),
    (select count(*)::int from profiles);
$$;
grant execute on function public.get_user_stats() to anon, authenticated;
grant execute on function public.mark_online() to authenticated;

-- geo_migration: country / country_name / city / region
alter table profiles
  add column if not exists country text,
  add column if not exists country_name text,
  add column if not exists city text,
  add column if not exists region text;
create index if not exists profiles_country_idx on profiles (country);

create or replace function public.set_user_geo(
  p_country text, p_country_name text, p_city text, p_region text
)
returns void language sql security definer set search_path = public
as $$
  update profiles set country = p_country, country_name = p_country_name,
       city = p_city, region = p_region
  where id = auth.uid() and (country is null or country = '');
$$;
grant execute on function public.set_user_geo(text, text, text, text) to authenticated;

create or replace function public.get_country_stats()
returns table (country text, country_name text, user_count int)
language sql security definer set search_path = public stable
as $$
  select country, country_name, count(*)::int
  from profiles where country is not null and country <> ''
  group by country, country_name order by count(*) desc;
$$;
grant execute on function public.get_country_stats() to anon, authenticated;

-- workouts.completed_at  /  personal_records.recorded_at  /  workouts.day_name+sport+total_volume
-- (alle aus dem Schema bereits da — kein Add nötig)

-- ── 1/4 Activity-Feed ──

create or replace function public.get_global_activity_stats()
returns table (
  workouts_today int,
  prs_today int,
  new_users_week int,
  active_streaks int,
  total_volume_today numeric,
  online_now int
)
language sql
security definer
set search_path = public
stable
as $$
  select
    (select count(*)::int from workouts where completed_at > current_date),
    (select count(*)::int from personal_records where recorded_at > current_date),
    (select count(*)::int from profiles where created_at > now() - interval '7 days'),
    (select count(*)::int from profiles where current_streak >= 7),
    (select coalesce(sum(total_volume), 0)::numeric from workouts where completed_at > current_date),
    (select count(*)::int from profiles where last_seen_at > now() - interval '5 minutes');
$$;

grant execute on function public.get_global_activity_stats() to anon, authenticated;

create or replace function public.get_global_activity_feed(p_limit int default 10)
returns table (
  event_type text,
  country text,
  sport text,
  exercise_name text,
  value numeric,
  unit text,
  occurred_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  with combined as (
    select 'workout' as event_type, p.country, w.sport, w.day_name as exercise_name,
           null::numeric as value, null::text as unit, w.completed_at as occurred_at
    from workouts w join profiles p on p.id = w.user_id
    where w.completed_at is not null and w.completed_at > now() - interval '24 hours'
    union all
    select 'pr' as event_type, p.country, null::text as sport, pr.exercise_name,
           pr.value, pr.unit, pr.recorded_at as occurred_at
    from personal_records pr join profiles p on p.id = pr.user_id
    where pr.recorded_at > now() - interval '24 hours'
    union all
    select 'signup' as event_type, p.country, null::text as sport, null::text as exercise_name,
           null::numeric as value, null::text as unit, p.created_at as occurred_at
    from profiles p
    where p.created_at > now() - interval '24 hours'
  )
  select * from combined order by occurred_at desc limit p_limit;
$$;

grant execute on function public.get_global_activity_feed(int) to anon, authenticated;

-- ── 2/4 Cardio-Tabellen ──

create table if not exists cardio_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  activity_id text not null,
  started_at timestamptz default now(),
  ended_at timestamptz,
  duration_s int default 0,
  distance_m numeric default 0,
  elevation_gain_m numeric default 0,
  elevation_loss_m numeric default 0,
  avg_pace_s_per_km numeric,
  avg_speed_kmh numeric,
  max_speed_kmh numeric,
  avg_hr int,
  max_hr int,
  calories int,
  notes text,
  source text default 'gps',
  created_at timestamptz default now()
);

create index if not exists cardio_sessions_user_idx on cardio_sessions (user_id, started_at desc);

create table if not exists cardio_tracks (
  session_id uuid primary key references cardio_sessions on delete cascade,
  user_id uuid references auth.users on delete cascade not null,
  points jsonb not null default '[]'::jsonb,
  point_count int default 0,
  bounds jsonb,
  created_at timestamptz default now()
);

create index if not exists cardio_tracks_user_idx on cardio_tracks (user_id);

alter table cardio_sessions enable row level security;
alter table cardio_tracks enable row level security;

drop policy if exists "Users modify own cardio sessions" on cardio_sessions;
create policy "Users modify own cardio sessions" on cardio_sessions
  for all using (auth.uid() = user_id);

drop policy if exists "Users modify own cardio tracks" on cardio_tracks;
create policy "Users modify own cardio tracks" on cardio_tracks
  for all using (auth.uid() = user_id);

-- ── 3/4 Pro-Grant ──

alter table profiles add column if not exists is_pro_granted boolean default false;

create or replace function public.admin_set_pro_grant(p_user_id uuid, p_granted boolean)
returns void language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Not authorized: admin only'; end if;
  perform public.log_admin_action(
    case when p_granted then 'grant_pro' else 'revoke_pro' end,
    p_user_id,
    jsonb_build_object('granted', p_granted)
  );
  update public.profiles set is_pro_granted = p_granted where id = p_user_id;
end;
$$;

grant execute on function public.admin_set_pro_grant(uuid, boolean) to authenticated;

-- ── 4/4 Beta-User-Flag ──

alter table profiles add column if not exists is_beta boolean default false;

create index if not exists profiles_is_beta_idx on profiles (is_beta) where is_beta = true;

create or replace function public.count_beta_users()
returns int language sql security definer set search_path = public stable
as $$ select count(*)::int from profiles where is_beta = true; $$;

grant execute on function public.count_beta_users() to authenticated;

create or replace function public.admin_delete_all_beta_users()
returns int language plpgsql security definer set search_path = public
as $$
declare cnt int;
begin
  if not public.is_admin() then raise exception 'Not authorized: admin only'; end if;
  with deleted as (
    delete from auth.users
    where id in (select id from public.profiles where is_beta = true)
    returning id
  )
  select count(*)::int into cnt from deleted;
  perform public.log_admin_action('delete_all_beta', null, jsonb_build_object('count', cnt));
  return cnt;
end;
$$;

grant execute on function public.admin_delete_all_beta_users() to authenticated;

-- ✓ Alle 4 Migrationen erfolgreich angewendet.
