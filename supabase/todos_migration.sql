-- ═══════════════════════════════════════════════════════════
-- KALION MAX — Todos / Listen / Productivity Migration
-- Im Supabase SQL Editor ausführen.
-- ═══════════════════════════════════════════════════════════

-- ── Listen: User-erstellte Listen (Filme, Bücher, Heute, …) ──
create table if not exists todo_lists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  icon text default '📝',
  color text default '#22D3EE',
  position int default 0,
  is_archived boolean default false,
  created_at timestamptz default now()
);

create index if not exists todo_lists_user_idx on todo_lists (user_id, position);

alter table todo_lists enable row level security;
drop policy if exists "Users modify own todo lists" on todo_lists;
create policy "Users modify own todo lists" on todo_lists for all using (auth.uid() = user_id);

-- ── Items: einzelne ToDos / Bücher / Filme / Tasks ──
create table if not exists todo_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  list_id uuid references todo_lists on delete cascade not null,
  title text not null,
  description text,
  due_date date,
  priority int default 0 check (priority between 0 and 3),  -- 0=none, 1=low, 2=med, 3=high
  position int default 0,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists todo_items_user_due_idx on todo_items (user_id, due_date);
create index if not exists todo_items_list_idx on todo_items (list_id, position);
create index if not exists todo_items_user_open_idx on todo_items (user_id) where completed_at is null;

alter table todo_items enable row level security;
drop policy if exists "Users modify own todo items" on todo_items;
create policy "Users modify own todo items" on todo_items for all using (auth.uid() = user_id);

-- ── Trigger: Default-Listen für neue User automatisch anlegen ──
create or replace function public.create_default_todo_lists()
returns trigger as $$
begin
  insert into todo_lists (user_id, name, icon, color, position) values
    (new.id, 'Heute',     '✅', '#22D3EE', 0),
    (new.id, 'Diese Woche','📅', '#A78BFA', 1),
    (new.id, 'Filme',     '🎬', '#FF5A6B', 2),
    (new.id, 'Bücher',    '📚', '#FFB800', 3);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_created_default_todos on profiles;
create trigger on_profile_created_default_todos
  after insert on profiles
  for each row execute procedure public.create_default_todo_lists();

-- Bestehende User bekommen Default-Listen einmalig (idempotent: nur wo noch leer)
insert into todo_lists (user_id, name, icon, color, position)
select id, 'Heute',      '✅', '#22D3EE', 0 from profiles
  where not exists (select 1 from todo_lists where todo_lists.user_id = profiles.id);
insert into todo_lists (user_id, name, icon, color, position)
select id, 'Diese Woche','📅', '#A78BFA', 1 from profiles
  where not exists (select 1 from todo_lists where todo_lists.user_id = profiles.id and name = 'Diese Woche');
insert into todo_lists (user_id, name, icon, color, position)
select id, 'Filme',      '🎬', '#FF5A6B', 2 from profiles
  where not exists (select 1 from todo_lists where todo_lists.user_id = profiles.id and name = 'Filme');
insert into todo_lists (user_id, name, icon, color, position)
select id, 'Bücher',     '📚', '#FFB800', 3 from profiles
  where not exists (select 1 from todo_lists where todo_lists.user_id = profiles.id and name = 'Bücher');

-- ═══════════════════════════════════════════════════════════
-- FERTIG.
-- ═══════════════════════════════════════════════════════════
