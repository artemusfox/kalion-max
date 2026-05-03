-- ═══════════════════════════════════════════════════════════
-- KALION MAX — Presence / User-Stats Migration
-- Im Supabase SQL Editor ausführen.
-- ═══════════════════════════════════════════════════════════

-- ── last_seen Tracking ──
alter table profiles
  add column if not exists last_seen_at timestamptz default now();

create index if not exists profiles_last_seen_idx
  on profiles (last_seen_at desc);

-- ── RPC: mark_online() — wird vom Client periodisch gepingt ──
create or replace function public.mark_online()
returns void
language sql
security definer
set search_path = public
as $$
  update profiles set last_seen_at = now() where id = auth.uid();
$$;

-- ── RPC: get_user_stats() — öffentlich abrufbar (auch ohne Login) ──
create or replace function public.get_user_stats()
returns table (online_count int, total_count int)
language sql
security definer
set search_path = public
stable
as $$
  select
    (select count(*)::int from profiles where last_seen_at > now() - interval '5 minutes'),
    (select count(*)::int from profiles);
$$;

-- Erlauben dass auch anonyme Besucher (Landing-Page) den Count abrufen können
grant execute on function public.get_user_stats() to anon, authenticated;
grant execute on function public.mark_online() to authenticated;

-- ═══════════════════════════════════════════════════════════
-- FERTIG.
-- ═══════════════════════════════════════════════════════════
