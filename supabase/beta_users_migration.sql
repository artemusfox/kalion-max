-- ═══════════════════════════════════════════════════════════
-- KALION MAX — Beta-User Migration
-- Fügt is_beta-Flag hinzu damit Demo-Accounts klar markiert sind.
-- ═══════════════════════════════════════════════════════════

alter table profiles
  add column if not exists is_beta boolean default false;

create index if not exists profiles_is_beta_idx
  on profiles (is_beta) where is_beta = true;

-- ── Helper-RPC: Anzahl Beta-User (für Admin) ──
create or replace function public.count_beta_users()
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int from profiles where is_beta = true;
$$;

grant execute on function public.count_beta_users() to authenticated;

-- ── Admin-RPC: alle Beta-User löschen (Cleanup vor Production) ──
create or replace function public.admin_delete_all_beta_users()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  cnt int;
begin
  if not public.is_admin() then
    raise exception 'Not authorized: admin only';
  end if;

  -- Lösche aus auth.users — profiles cascaden automatisch
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
