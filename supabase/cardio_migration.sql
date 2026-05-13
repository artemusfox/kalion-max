-- ═══════════════════════════════════════════════════════════
-- Cardio-Sessions + GPS-Tracks
-- Eine cardio_session ist eine einzelne Aktivität (Lauf, Ride, …)
-- Punkte werden in cardio_tracks als JSON-Array gespeichert
-- ═══════════════════════════════════════════════════════════

create table if not exists cardio_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  activity_id text not null,                    -- aus lib/activities.ts (z.B. "run_road")
  started_at timestamptz default now(),
  ended_at timestamptz,
  duration_s int default 0,                     -- gemessen, exkl. Pausen
  distance_m numeric default 0,
  elevation_gain_m numeric default 0,
  elevation_loss_m numeric default 0,
  avg_pace_s_per_km numeric,                    -- nur Lauf/Walk: Sek/km
  avg_speed_kmh numeric,                        -- alle: km/h
  max_speed_kmh numeric,
  avg_hr int,                                   -- bpm (optional)
  max_hr int,
  calories int,                                 -- geschätzt
  notes text,
  source text default 'gps',                    -- 'gps', 'gpx_import', 'manual'
  created_at timestamptz default now()
);

create index if not exists cardio_sessions_user_idx
  on cardio_sessions (user_id, started_at desc);

create table if not exists cardio_tracks (
  session_id uuid primary key references cardio_sessions on delete cascade,
  user_id uuid references auth.users on delete cascade not null,
  -- Points als JSON-Array: [{ t: epoch_s, lat, lon, alt?, hr?, v?, d? }]
  -- t = Sekunden seit Start, lat/lon WGS84, alt = Meter, hr = bpm, v = m/s, d = kumul. Meter
  points jsonb not null default '[]'::jsonb,
  point_count int default 0,
  bounds jsonb,                                 -- { min_lat, max_lat, min_lon, max_lon }
  created_at timestamptz default now()
);

create index if not exists cardio_tracks_user_idx
  on cardio_tracks (user_id);

-- RLS
alter table cardio_sessions enable row level security;
alter table cardio_tracks enable row level security;

drop policy if exists "Users modify own cardio sessions" on cardio_sessions;
create policy "Users modify own cardio sessions" on cardio_sessions
  for all using (auth.uid() = user_id);

drop policy if exists "Users modify own cardio tracks" on cardio_tracks;
create policy "Users modify own cardio tracks" on cardio_tracks
  for all using (auth.uid() = user_id);
