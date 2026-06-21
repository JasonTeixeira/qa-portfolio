-- Traffic OS live activation and Revenue OS feed proof
-- Tracks live analytics connection state, campaign launch readiness, and
-- qualified traffic handoff into Revenue OS.

create table if not exists public.traffic_live_analytics_proofs (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  provider text not null check (provider in ('ga4','google_search_console','discord','posthog')),
  configured boolean not null default false,
  live_verified boolean not null default false,
  rows_ingested integer not null default 0 check (rows_ingested >= 0),
  evidence text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.traffic_campaign_launches (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  campaign_key text not null,
  channel text not null,
  launch_status text not null default 'manual_review'
    check (launch_status in ('manual_review','approved','launched','paused','blocked')),
  distribution_url text,
  launch_notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.traffic_revenue_feed_events (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  campaign_key text not null,
  source text not null,
  account_id uuid references public.acquisition_accounts(id) on delete set null,
  account_name text not null,
  website_url text,
  score integer not null default 0 check (score between 0 and 100),
  estimated_value_usd integer not null default 0 check (estimated_value_usd >= 0),
  recommended_offer text not null,
  evidence text not null,
  status text not null default 'fed_to_revenue_os'
    check (status in ('queued','fed_to_revenue_os','skipped','failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists traffic_live_analytics_proofs_run_idx on public.traffic_live_analytics_proofs(run_key, provider);
create index if not exists traffic_campaign_launches_run_idx on public.traffic_campaign_launches(run_key, launch_status);
create index if not exists traffic_revenue_feed_events_run_idx on public.traffic_revenue_feed_events(run_key, status, score desc);

drop trigger if exists traffic_campaign_launches_updated_at on public.traffic_campaign_launches;
create trigger traffic_campaign_launches_updated_at before update on public.traffic_campaign_launches
  for each row execute function public.set_updated_at();

alter table public.traffic_live_analytics_proofs enable row level security;
alter table public.traffic_campaign_launches enable row level security;
alter table public.traffic_revenue_feed_events enable row level security;

drop policy if exists "traffic_live_analytics_proofs_admin_all" on public.traffic_live_analytics_proofs;
create policy "traffic_live_analytics_proofs_admin_all" on public.traffic_live_analytics_proofs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "traffic_campaign_launches_admin_all" on public.traffic_campaign_launches;
create policy "traffic_campaign_launches_admin_all" on public.traffic_campaign_launches for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "traffic_revenue_feed_events_admin_all" on public.traffic_revenue_feed_events;
create policy "traffic_revenue_feed_events_admin_all" on public.traffic_revenue_feed_events for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));
