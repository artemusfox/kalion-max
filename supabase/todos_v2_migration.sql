-- ═══════════════════════════════════════════════════════════
-- KALION MAX — Todos v2 Migration: Sub-Tasks, Recurrence, Attachments
-- Im Supabase SQL Editor ausführen.
-- ═══════════════════════════════════════════════════════════

-- ── Erweiterungen an todo_items ──
alter table todo_items
  add column if not exists parent_id uuid references todo_items on delete cascade,
  add column if not exists recurrence text,            -- 'daily', 'weekly:0'..'weekly:6', 'monthly:DD', 'yearly'
  add column if not exists recurrence_until date,
  add column if not exists last_recurrence_origin uuid;  -- bei Auto-Spawn: Verweis auf Vorgänger

create index if not exists todo_items_parent_idx on todo_items (parent_id);
create index if not exists todo_items_recurrence_idx on todo_items (recurrence) where recurrence is not null;

-- ── Attachments-Tabelle ──
create table if not exists todo_attachments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  item_id uuid references todo_items on delete cascade not null,
  file_url text not null,
  storage_path text,
  filename text,
  mime_type text,
  size_bytes int,
  created_at timestamptz default now()
);

create index if not exists todo_attachments_item_idx on todo_attachments (item_id);

alter table todo_attachments enable row level security;
drop policy if exists "Users modify own attachments" on todo_attachments;
create policy "Users modify own attachments" on todo_attachments for all using (auth.uid() = user_id);

-- ── Storage-Bucket für Attachments (privat, signed URLs nötig) ──
insert into storage.buckets (id, name, public)
values ('todo-attachments', 'todo-attachments', false)
on conflict (id) do nothing;

drop policy if exists "Todo attachments upload" on storage.objects;
create policy "Todo attachments upload"
  on storage.objects for insert
  with check (bucket_id = 'todo-attachments' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Todo attachments read" on storage.objects;
create policy "Todo attachments read"
  on storage.objects for select
  using (bucket_id = 'todo-attachments' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Todo attachments delete" on storage.objects;
create policy "Todo attachments delete"
  on storage.objects for delete
  using (bucket_id = 'todo-attachments' and (storage.foldername(name))[1] = auth.uid()::text);

-- ═══════════════════════════════════════════════════════════
-- FERTIG.
-- ═══════════════════════════════════════════════════════════
