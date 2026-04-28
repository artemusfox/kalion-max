-- ═══════════════════════════════════════════════════════════
-- KALION MAX — Admin-Backend Migration
-- Im Supabase SQL Editor ausführen, NACH dem Original-Schema.
-- Idempotent: kann mehrfach laufen.
-- ═══════════════════════════════════════════════════════════

-- ── 1. Admin-Flag auf Profiles ──
alter table profiles
  add column if not exists is_admin boolean default false;

-- ── 2. Helper: is_admin() ──
-- security definer = läuft mit Owner-Rechten, umgeht RLS bei Lookup
-- WICHTIG: search_path leer, sonst SQL-Injection-Risiko
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ── 3. Admin-Read-Policies (additiv zu bestehenden User-Policies) ──
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'profiles', 'custom_exercises', 'user_plans', 'workouts',
    'personal_records', 'body_measurements', 'progress_photos',
    'goals', 'user_badges', 'nutrition_logs', 'foods',
    'meal_entries', 'supplements', 'supplement_logs'
  ]) loop
    -- Lösche alte Variante falls vorhanden, dann neu anlegen
    execute format('drop policy if exists "Admins read all %I" on %I', t, t);
    execute format(
      'create policy "Admins read all %I" on %I for select using (public.is_admin())',
      t, t
    );
  end loop;
end $$;

-- Admin darf zusätzlich Profile updaten/löschen (für Account-Management)
drop policy if exists "Admins update all profiles" on profiles;
create policy "Admins update all profiles" on profiles
  for update using (public.is_admin());

drop policy if exists "Admins delete profiles" on profiles;
create policy "Admins delete profiles" on profiles
  for delete using (public.is_admin());

-- ── 4. Audit-Log ──
create table if not exists admin_audit_log (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references auth.users on delete set null,
  admin_email text,
  action text not null,
  target_user_id uuid references auth.users on delete set null,
  target_user_email text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists admin_audit_log_created_at_idx
  on admin_audit_log (created_at desc);
create index if not exists admin_audit_log_target_idx
  on admin_audit_log (target_user_id);

alter table admin_audit_log enable row level security;

drop policy if exists "Admins read audit log" on admin_audit_log;
create policy "Admins read audit log" on admin_audit_log
  for select using (public.is_admin());

drop policy if exists "Admins write audit log" on admin_audit_log;
create policy "Admins write audit log" on admin_audit_log
  for insert with check (public.is_admin());

-- ── 5. Helper: Audit-Eintrag schreiben ──
create or replace function public.log_admin_action(
  p_action text,
  p_target_user_id uuid default null,
  p_details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_email text;
  v_target_email text;
begin
  if not public.is_admin() then
    raise exception 'Not authorized: admin only';
  end if;
  select email into v_admin_email from auth.users where id = auth.uid();
  if p_target_user_id is not null then
    select email into v_target_email from auth.users where id = p_target_user_id;
  end if;
  insert into admin_audit_log(
    admin_id, admin_email, action, target_user_id, target_user_email, details
  ) values (
    auth.uid(), v_admin_email, p_action, p_target_user_id, v_target_email, p_details
  );
end;
$$;

-- ── 6. Helper: User löschen (CASCADE räumt alle Daten ab) ──
create or replace function public.admin_delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized: admin only';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'Cannot delete yourself via admin function';
  end if;
  perform public.log_admin_action('delete_user', p_user_id, '{}'::jsonb);
  delete from auth.users where id = p_user_id;
end;
$$;

-- ── 7. Helper: is_admin toggeln ──
create or replace function public.admin_set_is_admin(
  p_user_id uuid, p_is_admin boolean
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
    case when p_is_admin then 'grant_admin' else 'revoke_admin' end,
    p_user_id,
    jsonb_build_object('new_value', p_is_admin)
  );
  update public.profiles set is_admin = p_is_admin where id = p_user_id;
end;
$$;

-- ── 8. Helper: User-Email auslesen (für Admin-Tabelle, Email lebt in auth.users) ──
create or replace function public.admin_user_emails()
returns table (id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select u.id, u.email::text, u.created_at, u.last_sign_in_at
  from auth.users u
  where public.is_admin();
$$;

-- ── 9. DICH als Admin markieren ──
-- Falls die Email-Adresse bei dir abweicht: anpassen!
update public.profiles
set is_admin = true
where id = (
  select id from auth.users where email = 'thekarx@googlemail.com'
);

-- ═══════════════════════════════════════════════════════════
-- FERTIG. Logge dich aus & wieder ein, damit die Session
-- den neuen is_admin-Status mitbekommt.
-- ═══════════════════════════════════════════════════════════
