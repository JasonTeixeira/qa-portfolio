-- Discord Gateway worker: durable capture of normal messages, reactions, threads, and raw gateway events.

create table if not exists public.discord_gateway_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  discord_message_id text,
  channel_id text,
  author_user_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists discord_gateway_events_created_idx
  on public.discord_gateway_events(created_at desc);

create index if not exists discord_gateway_events_type_idx
  on public.discord_gateway_events(event_type, created_at desc);

create table if not exists public.discord_messages (
  discord_message_id text primary key,
  guild_id text,
  channel_id text not null,
  channel_base_name text,
  author_user_id text,
  author_username text,
  author_bot boolean not null default false,
  content text not null default '',
  detected_kind text not null default 'general'
    check (detected_kind in ('question', 'answer', 'project', 'review', 'win', 'resource', 'general')),
  has_attachments boolean not null default false,
  attachment_count integer not null default 0,
  link_count integer not null default 0,
  message_type integer,
  thread_id text,
  referenced_message_id text,
  captured_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists discord_messages_channel_created_idx
  on public.discord_messages(channel_base_name, captured_at desc);

create index if not exists discord_messages_author_created_idx
  on public.discord_messages(author_user_id, captured_at desc);

create index if not exists discord_messages_kind_created_idx
  on public.discord_messages(detected_kind, captured_at desc);

create table if not exists public.discord_reactions (
  id uuid primary key default gen_random_uuid(),
  action text not null check (action in ('add', 'remove')),
  discord_message_id text not null,
  guild_id text,
  channel_id text not null,
  user_id text not null,
  emoji text not null,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists discord_reactions_message_idx
  on public.discord_reactions(discord_message_id, created_at desc);

create index if not exists discord_reactions_user_idx
  on public.discord_reactions(user_id, created_at desc);

create table if not exists public.discord_threads (
  thread_id text primary key,
  guild_id text,
  parent_channel_id text,
  owner_user_id text,
  name text,
  archived boolean not null default false,
  locked boolean not null default false,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discord_threads_parent_idx
  on public.discord_threads(parent_channel_id, updated_at desc);

alter table public.discord_gateway_events enable row level security;
alter table public.discord_messages enable row level security;
alter table public.discord_reactions enable row level security;
alter table public.discord_threads enable row level security;

drop policy if exists "discord_gateway_events_admin_all" on public.discord_gateway_events;
create policy "discord_gateway_events_admin_all" on public.discord_gateway_events
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "discord_messages_admin_all" on public.discord_messages;
create policy "discord_messages_admin_all" on public.discord_messages
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "discord_reactions_admin_all" on public.discord_reactions;
create policy "discord_reactions_admin_all" on public.discord_reactions
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "discord_threads_admin_all" on public.discord_threads;
create policy "discord_threads_admin_all" on public.discord_threads
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
