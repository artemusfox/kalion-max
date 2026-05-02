-- ═══════════════════════════════════════════════════════════
-- KALION MAX — v2-Features Migration (Goals + Auto-Progress)
-- Im Supabase SQL Editor ausführen.
-- ═══════════════════════════════════════════════════════════

-- ── Goals: linked_exercise_id für Auto-Progress aus PRs ──
alter table goals
  add column if not exists linked_exercise_id text;

-- Wenn ein Goal `linked_exercise_id = 'bench_press'` und `target_value = 100` hat,
-- wird current_value automatisch aus dem höchsten PR für bench_press abgeleitet.

-- ── Function: Goal-Progress aus PRs aktualisieren ──
create or replace function public.refresh_goal_progress()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then return; end if;

  update goals g
  set current_value = (
    select max(value)
    from personal_records pr
    where pr.user_id = v_uid
      and pr.exercise_id = g.linked_exercise_id
  )
  where g.user_id = v_uid
    and g.linked_exercise_id is not null
    and g.status = 'active';

  -- Erreichte Goals automatisch auf completed
  update goals g
  set status = 'completed', completed_at = now()
  where g.user_id = v_uid
    and g.status = 'active'
    and g.target_value is not null
    and g.current_value is not null
    and g.current_value >= g.target_value;
end;
$$;

-- ═══════════════════════════════════════════════════════════
-- FERTIG.
-- ═══════════════════════════════════════════════════════════
