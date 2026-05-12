-- ═══════════════════════════════════════════════════════════
-- KALION MAX — Admin-Pro-Grant Migration
-- Im Supabase SQL Editor ausführen.
-- ═══════════════════════════════════════════════════════════

-- Boolean-Flag: Admin kann manuell Pro für einen User aktivieren
alter table profiles
  add column if not exists is_pro_granted boolean default false;

-- RPC: Admin-Toggle für Pro-Grant
create or replace function public.admin_set_pro_grant(
  p_user_id uuid, p_granted boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized: admin only';
  end if;
  perform public.log_admin_action(
    case when p_granted then 'grant_pro' else 'revoke_pro' end,
    p_user_id,
    jsonb_build_object('granted', p_granted)
  );
  update public.profiles set is_pro_granted = p_granted where id = p_user_id;
end;
$$;

grant execute on function public.admin_set_pro_grant(uuid, boolean) to authenticated;

-- ═══════════════════════════════════════════════════════════
-- FERTIG.
-- ═══════════════════════════════════════════════════════════
