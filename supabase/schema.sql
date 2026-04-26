-- ═══════════════════════════════════════════════════════════
-- KALION MAX — Datenbank-Schema
-- Flexibles Schema für alle Sportarten, Custom-Pläne, flexible Sätze
-- Kopiere ALLES in den SQL Editor von Supabase und führe es aus
-- ═══════════════════════════════════════════════════════════

-- ── 1. Profile ──
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  display_name text,
  avatar_url text,
  active_sport text default 'strength',
  active_plan_id uuid,
  level int default 1,
  xp int default 0,
  total_workouts int default 0,
  current_streak int default 0,
  best_streak int default 0,
  last_workout_date date,
  units text default 'metric',
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── 2. Eigene Übungen (zusätzlich zur Built-in-Library) ──
create table if not exists custom_exercises (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  name text not null,
  sport text not null,
  muscle text not null,
  equipment text default 'none',
  tracking text default 'reps_weight',
  tip text,
  default_rest int default 60,
  created_at timestamptz default now()
);

-- ── 3. Eigene Trainingspläne ──
create table if not exists user_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  name text not null,
  description text,
  sport text not null,
  level text default 'beginner',
  duration_weeks int default 12,
  plan_data jsonb not null default '{"weeks":[]}'::jsonb,
  source_template_id text,
  is_archived boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── 4. Abgeschlossene Workouts ──
create table if not exists workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  plan_id uuid references user_plans on delete set null,
  sport text,
  week int,
  day_idx int,
  day_name text,
  started_at timestamptz default now(),
  completed_at timestamptz,
  duration_sec int,
  completed_sets int default 0,
  total_sets int default 0,
  total_volume numeric default 0,
  total_reps int default 0,
  total_distance numeric default 0,
  mood int,
  notes text,
  exercises_data jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- ── 5. Personal Records (flexibel pro Übung) ──
create table if not exists personal_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  exercise_id text not null,
  exercise_name text,
  record_type text default 'max_weight',
  value numeric not null,
  reps int,
  unit text,
  recorded_at timestamptz default now(),
  notes text
);

-- ── 6. Körpermaße ──
create table if not exists body_measurements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  measurement_type text not null,
  value numeric not null,
  unit text,
  recorded_at timestamptz default now(),
  notes text
);

-- ── 7. Progress-Fotos ──
create table if not exists progress_photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  photo_url text not null,
  storage_path text,
  pose_type text,
  notes text,
  taken_at timestamptz default now()
);

-- ── 8. Ziele ──
create table if not exists goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  title text not null,
  description text,
  target_value numeric,
  current_value numeric default 0,
  unit text,
  deadline date,
  status text default 'active',
  sport text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- ── 9. Badges ──
create table if not exists user_badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  badge_key text not null,
  earned_at timestamptz default now(),
  unique (user_id, badge_key)
);

-- ── 10. Ernährung & Wasser ──
create table if not exists nutrition_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  log_date date default current_date,
  calories int,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  water_ml int default 0,
  notes text,
  unique (user_id, log_date)
);

-- ── 11. Lebensmittel-Datenbank (eigene + geteilte) ──
create table if not exists foods (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  name text not null,
  brand text,
  serving_size numeric default 100,
  serving_unit text default 'g',
  calories_per_serving numeric default 0,
  protein_g numeric default 0,
  carbs_g numeric default 0,
  fat_g numeric default 0,
  fiber_g numeric,
  sugar_g numeric,
  barcode text,
  is_custom boolean default true,
  is_favorite boolean default false,
  created_at timestamptz default now()
);

-- ── 12. Mahlzeiten-Einträge (was wurde wann gegessen) ──
create table if not exists meal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  food_id uuid references foods on delete set null,
  food_name text not null,
  log_date date default current_date,
  meal_type text default 'snack',
  servings numeric default 1,
  calories numeric default 0,
  protein_g numeric default 0,
  carbs_g numeric default 0,
  fat_g numeric default 0,
  notes text,
  logged_at timestamptz default now()
);

-- ── 13. Supplements (Katalog) ──
create table if not exists supplements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  name text not null,
  brand text,
  dosage text,
  unit text default 'mg',
  purpose text,
  timing text[],
  color text default '#22D3EE',
  icon text default '💊',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ── 14. Supplement-Einträge (wann genommen) ──
create table if not exists supplement_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  supplement_id uuid references supplements on delete cascade,
  log_date date default current_date,
  timing text,
  taken_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════════════════

alter table profiles enable row level security;
alter table custom_exercises enable row level security;
alter table user_plans enable row level security;
alter table workouts enable row level security;
alter table personal_records enable row level security;
alter table body_measurements enable row level security;
alter table progress_photos enable row level security;
alter table goals enable row level security;
alter table user_badges enable row level security;
alter table nutrition_logs enable row level security;
alter table foods enable row level security;
alter table meal_entries enable row level security;
alter table supplements enable row level security;
alter table supplement_logs enable row level security;

create policy "Users see own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users modify own exercises" on custom_exercises for all using (auth.uid() = user_id);
create policy "Users modify own plans" on user_plans for all using (auth.uid() = user_id);
create policy "Users modify own workouts" on workouts for all using (auth.uid() = user_id);
create policy "Users modify own PRs" on personal_records for all using (auth.uid() = user_id);
create policy "Users modify own measurements" on body_measurements for all using (auth.uid() = user_id);
create policy "Users modify own photos" on progress_photos for all using (auth.uid() = user_id);
create policy "Users modify own goals" on goals for all using (auth.uid() = user_id);
create policy "Users modify own badges" on user_badges for all using (auth.uid() = user_id);
create policy "Users modify own nutrition" on nutrition_logs for all using (auth.uid() = user_id);
create policy "Users modify own foods" on foods for all using (auth.uid() = user_id);
create policy "Users modify own meals" on meal_entries for all using (auth.uid() = user_id);
create policy "Users modify own supplements" on supplements for all using (auth.uid() = user_id);
create policy "Users modify own supplement logs" on supplement_logs for all using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- Trigger: Profil bei neuem User anlegen
-- ═══════════════════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ═══════════════════════════════════════════════════════════
-- Storage-Bucket für Fotos
-- ═══════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

create policy "Users upload own photos"
on storage.objects for insert
with check (
  bucket_id = 'progress-photos' and
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users view own photos"
on storage.objects for select
using (
  bucket_id = 'progress-photos' and
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users delete own photos"
on storage.objects for delete
using (
  bucket_id = 'progress-photos' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ═══════════════════════════════════════════════════════════
-- Helper: Account löschen
-- ═══════════════════════════════════════════════════════════

create or replace function public.delete_own_account()
returns void as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$ language plpgsql security definer;

-- ═══════════════════════════════════════════════════════════
-- FERTIG!
-- ═══════════════════════════════════════════════════════════
