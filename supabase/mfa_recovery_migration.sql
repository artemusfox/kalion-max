-- ═══════════════════════════════════════════════════════════
-- KALION MAX — MFA Recovery-Codes Migration
-- Im Supabase SQL Editor ausführen, NACH der mfa_migration.sql.
-- ═══════════════════════════════════════════════════════════

-- pgcrypto für digest()/sha256
create extension if not exists pgcrypto;

-- ── Recovery-Codes-Tabelle ──
create table if not exists mfa_recovery_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  code_hash text not null,
  used_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists mfa_recovery_codes_user_idx
  on mfa_recovery_codes (user_id, used_at);

alter table mfa_recovery_codes enable row level security;

-- User darf nur seine eigenen Codes lesen (für Count-Anzeige)
drop policy if exists "Users read own recovery codes" on mfa_recovery_codes;
create policy "Users read own recovery codes"
  on mfa_recovery_codes for select
  using (auth.uid() = user_id);

-- Schreibender Zugriff NUR über RPCs unten (security definer)
-- Kein direktes insert/update/delete für User

-- ── Hilfs-Hash-Funktion ──
create or replace function public.sha256_hex(p_input text)
returns text
language sql
immutable
as $$
  select encode(digest(p_input, 'sha256'), 'hex');
$$;

-- ── RPC: Recovery-Codes neu generieren ──
-- Löscht alle alten Codes des Users und legt neue an (gehashte Plaintexte vom Client).
create or replace function public.mfa_generate_recovery_codes(p_codes text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  c text;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;
  if array_length(p_codes, 1) < 4 or array_length(p_codes, 1) > 20 then
    raise exception 'Invalid code count';
  end if;
  delete from mfa_recovery_codes where user_id = v_uid;
  foreach c in array p_codes loop
    insert into mfa_recovery_codes(user_id, code_hash)
    values (v_uid, public.sha256_hex(c));
  end loop;
end;
$$;

-- ── RPC: Recovery-Code einlösen ──
-- Vergleicht Plaintext-Code mit Hashes, markiert Treffer als used.
-- ZUSÄTZLICH: löscht die MFA-Faktoren des Users, damit er neu setupen kann.
-- Returns: true wenn erfolgreich, false sonst.
create or replace function public.mfa_consume_recovery_code(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_hash text;
  v_id uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return false;
  end if;
  v_hash := public.sha256_hex(p_code);
  select id into v_id
  from mfa_recovery_codes
  where user_id = v_uid
    and code_hash = v_hash
    and used_at is null
  limit 1;

  if v_id is null then
    return false;
  end if;

  update mfa_recovery_codes set used_at = now() where id = v_id;
  -- MFA-Faktor entfernen, damit User wieder Zugriff hat (re-enroll erforderlich)
  delete from auth.mfa_factors where user_id = v_uid;

  return true;
end;
$$;

-- ── RPC: Anzahl noch nutzbarer Recovery-Codes ──
create or replace function public.mfa_recovery_codes_remaining()
returns int
language sql
security definer
set search_path = public
as $$
  select count(*)::int
  from mfa_recovery_codes
  where user_id = auth.uid()
    and used_at is null;
$$;

-- ═══════════════════════════════════════════════════════════
-- FERTIG.
-- ═══════════════════════════════════════════════════════════
