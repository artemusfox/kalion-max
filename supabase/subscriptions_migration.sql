-- ═══════════════════════════════════════════════════════════
-- KALION MAX — Subscriptions / Premium Migration
-- Im Supabase SQL Editor ausführen.
-- ═══════════════════════════════════════════════════════════

-- ── Subscription-Felder am Profil ──
alter table profiles
  add column if not exists subscription_tier text default 'free'
    check (subscription_tier in ('free', 'pro')),
  add column if not exists subscription_status text default 'inactive'
    check (subscription_status in ('inactive', 'active', 'trialing', 'cancelled', 'expired', 'past_due')),
  add column if not exists subscription_id text,
  add column if not exists subscription_period_end timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists ls_customer_id text;

create index if not exists profiles_subscription_id_idx on profiles (subscription_id);

-- ── Subscription-Events-Log: Audit aller Webhook-Events ──
create table if not exists subscription_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  provider text default 'lemonsqueezy',
  event_type text not null,
  subscription_id text,
  payload jsonb default '{}'::jsonb,
  received_at timestamptz default now()
);

create index if not exists subscription_events_user_idx on subscription_events (user_id, received_at desc);
create index if not exists subscription_events_sub_idx on subscription_events (subscription_id);

alter table subscription_events enable row level security;

-- Nur Admins sehen den Event-Log
drop policy if exists "Admins read subscription events" on subscription_events;
create policy "Admins read subscription events"
  on subscription_events for select
  using (public.is_admin());

-- Webhook-Endpoint nutzt Service-Role-Key → braucht keine Policy für Insert

-- ═══════════════════════════════════════════════════════════
-- FERTIG.
-- ═══════════════════════════════════════════════════════════
