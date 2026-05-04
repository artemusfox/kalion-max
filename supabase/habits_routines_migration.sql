-- ═══════════════════════════════════════════════════════════
-- KALION MAX — Habits + Morning/Evening Routines Migration
-- Im Supabase SQL Editor ausführen.
-- ═══════════════════════════════════════════════════════════

-- ── Habits: Tägliche Gewohnheiten ──
create table if not exists habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  icon text default '✅',
  color text default '#22D3EE',
  position int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists habits_user_idx on habits (user_id, position);

alter table habits enable row level security;
drop policy if exists "Users modify own habits" on habits;
create policy "Users modify own habits" on habits for all using (auth.uid() = user_id);

-- ── Habit-Logs: Pro Habit + Tag ein Eintrag wenn abgehakt ──
create table if not exists habit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  habit_id uuid references habits on delete cascade not null,
  log_date date default current_date not null,
  created_at timestamptz default now(),
  unique (habit_id, log_date)
);

create index if not exists habit_logs_user_date_idx on habit_logs (user_id, log_date desc);
create index if not exists habit_logs_habit_date_idx on habit_logs (habit_id, log_date desc);

alter table habit_logs enable row level security;
drop policy if exists "Users modify own habit logs" on habit_logs;
create policy "Users modify own habit logs" on habit_logs for all using (auth.uid() = user_id);

-- ── Routine-Items: Morgen/Abend-Checkliste ──
create table if not exists routine_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  routine_type text check (routine_type in ('morning', 'evening')) not null,
  name text not null,
  icon text default '✓',
  position int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists routine_items_user_type_idx on routine_items (user_id, routine_type, position);

alter table routine_items enable row level security;
drop policy if exists "Users modify own routine items" on routine_items;
create policy "Users modify own routine items" on routine_items for all using (auth.uid() = user_id);

-- ── Routine-Logs: Pro Item + Tag ein Eintrag wenn abgehakt ──
create table if not exists routine_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  routine_item_id uuid references routine_items on delete cascade not null,
  log_date date default current_date not null,
  created_at timestamptz default now(),
  unique (routine_item_id, log_date)
);

create index if not exists routine_logs_user_date_idx on routine_logs (user_id, log_date desc);

alter table routine_logs enable row level security;
drop policy if exists "Users modify own routine logs" on routine_logs;
create policy "Users modify own routine logs" on routine_logs for all using (auth.uid() = user_id);

-- ── Dashboard-Widget-Settings (im profiles.settings JSONB) ──
-- Brauchen kein neues Schema — Felder werden in profiles.settings.dashboard_widgets abgelegt.

-- ═══════════════════════════════════════════════════════════
-- FERTIG.
-- ═══════════════════════════════════════════════════════════
