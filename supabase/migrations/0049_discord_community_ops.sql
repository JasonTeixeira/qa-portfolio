-- Discord community operations: member state, command analytics, cron run logs.

create table if not exists public.discord_members (
  discord_user_id text primary key,
  username text,
  path_key text,
  level_key text,
  academy_member boolean not null default false,
  premium_member boolean not null default false,
  premium_status text,
  stripe_customer_id text,
  stripe_subscription_id text,
  premium_role_synced_at timestamptz,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discord_members_premium_idx
  on public.discord_members(premium_member, premium_status);

create table if not exists public.discord_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  command_name text,
  discord_user_id text,
  discord_username text,
  channel_base_name text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists discord_events_created_at_idx
  on public.discord_events(created_at desc);

create index if not exists discord_events_command_idx
  on public.discord_events(command_name, created_at desc);

create index if not exists discord_events_user_idx
  on public.discord_events(discord_user_id, created_at desc);

create table if not exists public.discord_scheduled_runs (
  run_key text primary key,
  kind text not null check (kind in ('daily_signal', 'weekly_recap')),
  status text not null default 'posted' check (status in ('posted', 'skipped', 'failed')),
  message_id text,
  metadata jsonb not null default '{}'::jsonb,
  posted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists discord_scheduled_runs_kind_idx
  on public.discord_scheduled_runs(kind, posted_at desc);

alter table public.discord_members enable row level security;
alter table public.discord_events enable row level security;
alter table public.discord_scheduled_runs enable row level security;

drop policy if exists "discord_members_admin_all" on public.discord_members;
create policy "discord_members_admin_all" on public.discord_members
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "discord_events_admin_all" on public.discord_events;
create policy "discord_events_admin_all" on public.discord_events
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "discord_scheduled_runs_admin_all" on public.discord_scheduled_runs;
create policy "discord_scheduled_runs_admin_all" on public.discord_scheduled_runs
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
