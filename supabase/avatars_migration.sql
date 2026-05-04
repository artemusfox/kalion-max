-- ═══════════════════════════════════════════════════════════
-- KALION MAX — Avatars Storage Migration
-- Im Supabase SQL Editor ausführen.
-- ═══════════════════════════════════════════════════════════

-- ── Storage-Bucket für Avatars (public, damit URL ohne signed-URL geht) ──
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Policies: User darf nur in seinen eigenen Folder schreiben (avatars/{user_id}/…)
drop policy if exists "Avatar uploads" on storage.objects;
create policy "Avatar uploads"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Avatar updates" on storage.objects;
create policy "Avatar updates"
  on storage.objects for update
  using (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Avatar deletes" on storage.objects;
create policy "Avatar deletes"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Avatar public read" on storage.objects;
create policy "Avatar public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- ═══════════════════════════════════════════════════════════
-- FERTIG.
-- ═══════════════════════════════════════════════════════════
