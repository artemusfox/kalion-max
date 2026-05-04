-- ═══════════════════════════════════════════════════════════
-- KALION MAX — Global Activity / Community-Feed Migration
-- Anonymisierte Aggregations-RPCs für Dashboard + Landing.
-- ═══════════════════════════════════════════════════════════

-- ── Aggregated Stats: Was passiert heute community-weit? ──
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

-- ── Activity-Feed: Letzte Events anonymisiert ──
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
    select
      'workout' as event_type,
      p.country,
      w.sport,
      w.day_name as exercise_name,
      null::numeric as value,
      null::text as unit,
      w.completed_at as occurred_at
    from workouts w
    join profiles p on p.id = w.user_id
    where w.completed_at is not null
      and w.completed_at > now() - interval '24 hours'

    union all

    select
      'pr' as event_type,
      p.country,
      null::text as sport,
      pr.exercise_name,
      pr.value,
      pr.unit,
      pr.recorded_at as occurred_at
    from personal_records pr
    join profiles p on p.id = pr.user_id
    where pr.recorded_at > now() - interval '24 hours'

    union all

    select
      'signup' as event_type,
      p.country,
      null::text as sport,
      null::text as exercise_name,
      null::numeric as value,
      null::text as unit,
      p.created_at as occurred_at
    from profiles p
    where p.created_at > now() - interval '24 hours'
  )
  select * from combined
  order by occurred_at desc
  limit p_limit;
$$;

grant execute on function public.get_global_activity_feed(int) to anon, authenticated;

-- ═══════════════════════════════════════════════════════════
-- FERTIG.
-- ═══════════════════════════════════════════════════════════
