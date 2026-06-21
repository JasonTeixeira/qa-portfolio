-- Discord Gateway reliability: heartbeat, resume state, and dead-letter capture.

create table if not exists public.discord_gateway_heartbeats (
  worker_id text primary key,
  status text not null check (status in ('starting', 'connected', 'ready', 'resumed', 'heartbeat_ack', 'reconnecting', 'closed', 'failed')),
  session_id text,
  sequence integer,
  resume_gateway_url text,
  last_close_code integer,
  last_close_reason text,
  metadata jsonb not null default '{}'::jsonb,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discord_gateway_heartbeats_seen_idx
  on public.discord_gateway_heartbeats(last_seen_at desc);

create table if not exists public.discord_gateway_sessions (
  worker_id text primary key,
  session_id text not null,
  sequence integer,
  resume_gateway_url text,
  status text not null check (status in ('ready', 'resumed', 'closed', 'invalidated')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discord_gateway_dead_letters (
  id uuid primary key default gen_random_uuid(),
  worker_id text not null,
  event_type text not null,
  error text not null,
  payload jsonb not null default '{}'::jsonb,
  retryable boolean not null default true,
  sequence integer,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists discord_gateway_dead_letters_open_idx
  on public.discord_gateway_dead_letters(created_at desc)
  where resolved_at is null;

create index if not exists discord_gateway_dead_letters_type_idx
  on public.discord_gateway_dead_letters(event_type, created_at desc);

alter table public.discord_gateway_heartbeats enable row level security;
alter table public.discord_gateway_sessions enable row level security;
alter table public.discord_gateway_dead_letters enable row level security;

drop policy if exists "discord_gateway_heartbeats_admin_all" on public.discord_gateway_heartbeats;
create policy "discord_gateway_heartbeats_admin_all" on public.discord_gateway_heartbeats
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "discord_gateway_sessions_admin_all" on public.discord_gateway_sessions;
create policy "discord_gateway_sessions_admin_all" on public.discord_gateway_sessions
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "discord_gateway_dead_letters_admin_all" on public.discord_gateway_dead_letters;
create policy "discord_gateway_dead_letters_admin_all" on public.discord_gateway_dead_letters
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
