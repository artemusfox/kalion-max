-- ═══════════════════════════════════════════════════════════
-- KALION MAX — Support-Chat + Moderator-Rolle
-- ═══════════════════════════════════════════════════════════

-- ── 1. Moderator-Spalte + Helper ──
alter table profiles
  add column if not exists is_moderator boolean default false;

create or replace function public.is_admin_or_mod()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((
    select is_admin or is_moderator from public.profiles where id = auth.uid()
  ), false);
$$;

grant execute on function public.is_admin_or_mod() to authenticated;

-- ── 2. Chat-Threads (eine Konversation pro User) ──
create table if not exists chat_threads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  subject text,
  status text default 'open',          -- 'open' | 'pending' | 'closed'
  priority text default 'normal',      -- 'low' | 'normal' | 'high'
  last_message_at timestamptz default now(),
  last_message_preview text,
  user_unread int default 0,
  admin_unread int default 0,
  assigned_to uuid references auth.users on delete set null,
  created_at timestamptz default now()
);

create index if not exists chat_threads_user_idx on chat_threads (user_id);
create index if not exists chat_threads_status_idx on chat_threads (status, last_message_at desc);
create index if not exists chat_threads_assigned_idx on chat_threads (assigned_to) where assigned_to is not null;

-- ── 3. Chat-Messages ──
create table if not exists chat_messages (
  id uuid default gen_random_uuid() primary key,
  thread_id uuid references chat_threads on delete cascade not null,
  sender_id uuid references auth.users on delete cascade not null,
  sender_role text not null default 'user',  -- 'user' | 'admin' | 'mod' | 'system'
  body text not null,
  is_system boolean default false,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists chat_messages_thread_idx on chat_messages (thread_id, created_at desc);
create index if not exists chat_messages_unread_idx on chat_messages (read_at) where read_at is null;

-- ── 4. RLS ──
alter table chat_threads enable row level security;
alter table chat_messages enable row level security;

-- User: sieht nur eigenen Thread + eigene Messages
drop policy if exists "Users see own thread" on chat_threads;
create policy "Users see own thread" on chat_threads
  for select using (auth.uid() = user_id or public.is_admin_or_mod());

drop policy if exists "Users insert own thread" on chat_threads;
create policy "Users insert own thread" on chat_threads
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own thread" on chat_threads;
create policy "Users update own thread" on chat_threads
  for update using (auth.uid() = user_id or public.is_admin_or_mod());

drop policy if exists "Admins delete threads" on chat_threads;
create policy "Admins delete threads" on chat_threads
  for delete using (public.is_admin_or_mod());

drop policy if exists "Users see thread messages" on chat_messages;
create policy "Users see thread messages" on chat_messages
  for select using (
    public.is_admin_or_mod()
    or thread_id in (select id from chat_threads where user_id = auth.uid())
  );

drop policy if exists "Users send messages" on chat_messages;
create policy "Users send messages" on chat_messages
  for insert with check (
    auth.uid() = sender_id
    and (
      public.is_admin_or_mod()
      or thread_id in (select id from chat_threads where user_id = auth.uid())
    )
  );

drop policy if exists "Admins update messages" on chat_messages;
create policy "Admins update messages" on chat_messages
  for update using (public.is_admin_or_mod() or sender_id = auth.uid());

-- ── 5. RPC: Message senden (atomar: insert + Thread-Update) ──
create or replace function public.send_chat_message(
  p_thread_id uuid,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_message_id uuid;
  v_role text;
  v_is_admin_mod boolean;
  v_thread_user uuid;
begin
  v_is_admin_mod := public.is_admin_or_mod();
  v_role := case when v_is_admin_mod then
                   case when (select is_admin from profiles where id = auth.uid()) then 'admin' else 'mod' end
                 else 'user' end;

  select user_id into v_thread_user from chat_threads where id = p_thread_id;
  if v_thread_user is null then
    raise exception 'Thread not found';
  end if;

  -- Permission: User darf nur in eigenem Thread schreiben
  if not v_is_admin_mod and v_thread_user <> auth.uid() then
    raise exception 'Not authorized';
  end if;

  insert into chat_messages (thread_id, sender_id, sender_role, body)
  values (p_thread_id, auth.uid(), v_role, p_body)
  returning id into v_message_id;

  -- Thread aktualisieren
  if v_is_admin_mod then
    update chat_threads
    set last_message_at = now(),
        last_message_preview = left(p_body, 120),
        user_unread = user_unread + 1,
        admin_unread = 0,             -- Admin liest gerade, also lese-bestätigt
        status = case when status = 'closed' then 'open' else status end
    where id = p_thread_id;
  else
    update chat_threads
    set last_message_at = now(),
        last_message_preview = left(p_body, 120),
        admin_unread = admin_unread + 1,
        user_unread = 0,
        status = 'open'
    where id = p_thread_id;
  end if;

  return v_message_id;
end;
$$;

grant execute on function public.send_chat_message(uuid, text) to authenticated;

-- ── 6. RPC: get_or_create_thread für aktuellen User ──
create or replace function public.get_or_create_my_thread()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_thread_id uuid;
begin
  select id into v_thread_id from chat_threads
    where user_id = auth.uid()
    order by created_at desc limit 1;

  if v_thread_id is null then
    insert into chat_threads (user_id, subject)
    values (auth.uid(), 'Support')
    returning id into v_thread_id;
  end if;

  return v_thread_id;
end;
$$;

grant execute on function public.get_or_create_my_thread() to authenticated;

-- ── 7. RPC: User markiert seine Messages als gelesen ──
create or replace function public.mark_my_thread_read()
returns void
language sql
security definer
set search_path = public
as $$
  update chat_threads set user_unread = 0 where user_id = auth.uid();
  update chat_messages
    set read_at = now()
    where thread_id in (select id from chat_threads where user_id = auth.uid())
      and read_at is null
      and sender_role <> 'user';
$$;

grant execute on function public.mark_my_thread_read() to authenticated;

-- ── 8. RPC: Admin markiert Thread als gelesen ──
create or replace function public.mark_thread_read_admin(p_thread_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_or_mod() then
    raise exception 'Not authorized';
  end if;
  update chat_threads set admin_unread = 0 where id = p_thread_id;
  update chat_messages
    set read_at = now()
    where thread_id = p_thread_id
      and sender_role = 'user'
      and read_at is null;
end;
$$;

grant execute on function public.mark_thread_read_admin(uuid) to authenticated;

-- ── 9. RPC: Admin Status setzen ──
create or replace function public.admin_set_thread_status(p_thread_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_or_mod() then raise exception 'Not authorized'; end if;
  if p_status not in ('open', 'pending', 'closed') then
    raise exception 'Invalid status';
  end if;
  update chat_threads set status = p_status where id = p_thread_id;
end;
$$;

grant execute on function public.admin_set_thread_status(uuid, text) to authenticated;

-- ── 10. Admin RPC: Counts für Inbox-Übersicht ──
create or replace function public.admin_chat_counts()
returns table (open_count int, pending_count int, closed_count int, unread_threads int, total_unread int)
language sql
security definer
set search_path = public
stable
as $$
  select
    (select count(*)::int from chat_threads where status = 'open'),
    (select count(*)::int from chat_threads where status = 'pending'),
    (select count(*)::int from chat_threads where status = 'closed'),
    (select count(*)::int from chat_threads where admin_unread > 0),
    (select coalesce(sum(admin_unread), 0)::int from chat_threads);
$$;

grant execute on function public.admin_chat_counts() to authenticated;

-- ── 11. Moderator-Toggle für Admin ──
create or replace function public.admin_set_is_moderator(p_user_id uuid, p_is_mod boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Not authorized: admin only'; end if;
  perform public.log_admin_action(
    case when p_is_mod then 'grant_mod' else 'revoke_mod' end,
    p_user_id, jsonb_build_object('is_moderator', p_is_mod)
  );
  update profiles set is_moderator = p_is_mod where id = p_user_id;
end;
$$;

grant execute on function public.admin_set_is_moderator(uuid, boolean) to authenticated;

-- ── 12. Realtime aktivieren (idempotent) ──
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table chat_messages;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'chat_threads'
  ) then
    alter publication supabase_realtime add table chat_threads;
  end if;
exception when undefined_object then
  -- supabase_realtime publication existiert evtl noch nicht
  null;
end $$;
