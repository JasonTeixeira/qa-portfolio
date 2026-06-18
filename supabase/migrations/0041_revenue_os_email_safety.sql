-- Phase 41 — Revenue OS email safety, deliverability, and sequences
-- Stores safety reports, domain health, suppression proof, and sequence stop
-- events so sending remains controlled, auditable, and non-spammy.

create table if not exists public.revenue_email_safety_reports (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  domain text not null,
  status text not null check (status in ('healthy','limited','paused')),
  scorecard jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_email_domain_health (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  domain text not null,
  status text not null check (status in ('healthy','limited','paused')),
  daily_cap integer not null default 0 check (daily_cap >= 0),
  sent_today integer not null default 0 check (sent_today >= 0),
  remaining_today integer not null default 0 check (remaining_today >= 0),
  bounce_rate numeric not null default 0,
  complaint_rate numeric not null default 0,
  reasons text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_suppression_events (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  email text not null,
  reason text not null
    check (reason in ('manual_suppression','domain_suppression','bounce_received','complaint_received','unsubscribe_received')),
  source text not null check (source in ('operator','provider_event')),
  occurred_at timestamptz not null,
  message_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_sequence_stop_events (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  sequence_key text not null,
  reason text not null
    check (reason in ('reply_received','bounce_received','complaint_received','unsubscribe_received','domain_paused')),
  message_id text,
  occurred_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists revenue_email_safety_reports_run_idx
  on public.revenue_email_safety_reports(run_key, created_at desc);

create index if not exists revenue_email_domain_health_run_idx
  on public.revenue_email_domain_health(run_key, created_at desc);

create index if not exists revenue_suppression_events_run_idx
  on public.revenue_suppression_events(run_key, created_at desc);

create index if not exists revenue_suppression_events_email_idx
  on public.revenue_suppression_events(lower(email), created_at desc);

create index if not exists revenue_sequence_stop_events_run_idx
  on public.revenue_sequence_stop_events(run_key, created_at desc);

alter table public.revenue_email_safety_reports enable row level security;
alter table public.revenue_email_domain_health enable row level security;
alter table public.revenue_suppression_events enable row level security;
alter table public.revenue_sequence_stop_events enable row level security;

drop policy if exists "revenue_email_safety_reports_admin_all" on public.revenue_email_safety_reports;
create policy "revenue_email_safety_reports_admin_all" on public.revenue_email_safety_reports for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_email_domain_health_admin_all" on public.revenue_email_domain_health;
create policy "revenue_email_domain_health_admin_all" on public.revenue_email_domain_health for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_suppression_events_admin_all" on public.revenue_suppression_events;
create policy "revenue_suppression_events_admin_all" on public.revenue_suppression_events for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_sequence_stop_events_admin_all" on public.revenue_sequence_stop_events;
create policy "revenue_sequence_stop_events_admin_all" on public.revenue_sequence_stop_events for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));
