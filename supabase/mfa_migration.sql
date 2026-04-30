-- ═══════════════════════════════════════════════════════════
-- KALION MAX — MFA / 2FA Migration
-- Im Supabase SQL Editor ausführen, NACH der admin_migration.sql.
-- ═══════════════════════════════════════════════════════════

-- ── Admin: User-MFA zurücksetzen (Faktor löschen) ──
-- Use Case: User hat sein Handy verloren, Admin entfernt seinen Authenticator-Eintrag
create or replace function public.admin_remove_user_mfa(p_user_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if not public.is_admin() then
    raise exception 'Not authorized: admin only';
  end if;
  delete from auth.mfa_factors where user_id = p_user_id;
  get diagnostics v_count = row_count;
  perform public.log_admin_action(
    'remove_user_mfa',
    p_user_id,
    jsonb_build_object('factors_removed', v_count)
  );
  return v_count;
end;
$$;

-- ── View: zeigt für jeden User, ob MFA aktiv ist (für Admin-Liste) ──
create or replace function public.admin_users_with_mfa()
returns table (user_id uuid, has_mfa boolean, factor_count int)
language sql
security definer
set search_path = public
as $$
  select
    u.id,
    exists(select 1 from auth.mfa_factors f where f.user_id = u.id and f.status = 'verified') as has_mfa,
    (select count(*)::int from auth.mfa_factors f where f.user_id = u.id and f.status = 'verified') as factor_count
  from auth.users u
  where public.is_admin();
$$;

-- ═══════════════════════════════════════════════════════════
-- FERTIG.
-- ═══════════════════════════════════════════════════════════
