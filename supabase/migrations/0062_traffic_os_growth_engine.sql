-- Traffic OS growth engine
-- Additive institutional traffic layer for websites, apps, tools, and Discord communities.

create table if not exists public.traffic_sources (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  source_key text not null,
  label text not null,
  status text not null check (status in ('active','testing','paused')),
  audience text not null,
  monthly_visit_goal integer not null default 0 check (monthly_visit_goal >= 0),
  cost_budget_usd integer not null default 0 check (cost_budget_usd >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.traffic_campaigns (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  campaign_key text not null,
  name text not null,
  primary_channel text not null,
  intent text not null,
  landing_page text not null,
  utm_campaign text not null,
  target_visits integer not null default 0 check (target_visits >= 0),
  target_conversions integer not null default 0 check (target_conversions >= 0),
  status text not null default 'active' check (status in ('planned','active','paused','completed')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.traffic_landing_pages (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  path text not null,
  page_type text not null check (page_type in ('home','tool','service','blog','case_study','academy','discord','app')),
  primary_cta text not null,
  target_conversion text not null,
  status text not null default 'active' check (status in ('active','needs_test','paused')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.traffic_content_assets (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  asset_key text not null,
  title text not null,
  asset_type text not null,
  target_url text not null,
  topic text not null,
  keywords text[] not null default '{}',
  status text not null check (status in ('planned','drafting','ready','distributed','refresh')),
  score integer not null default 0 check (score between 0 and 100),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.traffic_distribution_posts (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  asset_key text not null,
  channel text not null,
  post_angle text not null,
  cta_url text not null,
  scheduled_for timestamptz,
  expected_clicks integer not null default 0 check (expected_clicks >= 0),
  status text not null default 'planned' check (status in ('planned','approved','published','skipped')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.traffic_seo_keywords (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  keyword text not null,
  intent text not null,
  difficulty integer not null default 0 check (difficulty between 0 and 100),
  monthly_searches integer not null default 0 check (monthly_searches >= 0),
  business_value integer not null default 0 check (business_value between 0 and 100),
  target_url text not null,
  status text not null default 'queued' check (status in ('queued','assigned','published','monitoring','won','lost')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.traffic_events (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  source text not null,
  url text not null,
  event_type text not null check (event_type in ('impression','click','visit','signup','discord_join','lead','booked_call')),
  event_count integer not null default 0 check (event_count >= 0),
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.traffic_conversions (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  source text not null,
  landing_page text not null,
  conversion_type text not null check (conversion_type in ('newsletter','discord_join','seo_audit','contact','booking','client_lead')),
  conversion_count integer not null default 0 check (conversion_count >= 0),
  value_usd integer not null default 0 check (value_usd >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.traffic_discord_invites (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  server_key text not null,
  invite_code text not null,
  source text not null,
  target_audience text not null,
  joins integer not null default 0 check (joins >= 0),
  activated integer not null default 0 check (activated >= 0),
  retained_7d integer not null default 0 check (retained_7d >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.traffic_growth_experiments (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  name text not null,
  channel text not null,
  hypothesis text not null,
  variants jsonb not null default '[]'::jsonb,
  metric text not null,
  status text not null default 'running' check (status in ('draft','running','won','lost','archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.traffic_next_best_actions (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  rank integer not null default 0,
  channel text not null,
  action text not null,
  rationale text not null,
  expected_impact text not null,
  urgency text not null check (urgency in ('low','medium','high','critical')),
  status text not null default 'open' check (status in ('open','accepted','done','dismissed')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.traffic_weekly_reports (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  report_week date not null default current_date,
  visits integer not null default 0,
  conversions integer not null default 0,
  conversion_rate numeric not null default 0,
  weighted_pipeline_usd integer not null default 0,
  discord_joins integer not null default 0,
  best_channel text,
  weakest_channel text,
  summary jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.traffic_load_proofs (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  campaigns integer not null default 0,
  assets integer not null default 0,
  events integer not null default 0,
  p95_dashboard_ms integer not null default 0,
  p95_ingestion_ms integer not null default 0,
  status text not null check (status in ('passed','failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.traffic_readiness_audits (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  score integer not null check (score between 0 and 100),
  grade text not null check (grade in ('world_class_ready','institutional_beta','blocked')),
  passed text[] not null default '{}',
  gaps text[] not null default '{}',
  program_count integer not null default 32,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists traffic_sources_run_idx on public.traffic_sources(run_key);
create index if not exists traffic_campaigns_run_idx on public.traffic_campaigns(run_key, primary_channel);
create index if not exists traffic_content_assets_run_idx on public.traffic_content_assets(run_key, status, score desc);
create index if not exists traffic_distribution_posts_run_idx on public.traffic_distribution_posts(run_key, channel, scheduled_for);
create index if not exists traffic_seo_keywords_run_idx on public.traffic_seo_keywords(run_key, business_value desc);
create index if not exists traffic_events_run_idx on public.traffic_events(run_key, source, event_type);
create index if not exists traffic_conversions_run_idx on public.traffic_conversions(run_key, source, conversion_type);
create index if not exists traffic_next_best_actions_run_idx on public.traffic_next_best_actions(run_key, status, rank);
create index if not exists traffic_readiness_audits_score_idx on public.traffic_readiness_audits(score desc);

alter table public.traffic_sources enable row level security;
alter table public.traffic_campaigns enable row level security;
alter table public.traffic_landing_pages enable row level security;
alter table public.traffic_content_assets enable row level security;
alter table public.traffic_distribution_posts enable row level security;
alter table public.traffic_seo_keywords enable row level security;
alter table public.traffic_events enable row level security;
alter table public.traffic_conversions enable row level security;
alter table public.traffic_discord_invites enable row level security;
alter table public.traffic_growth_experiments enable row level security;
alter table public.traffic_next_best_actions enable row level security;
alter table public.traffic_weekly_reports enable row level security;
alter table public.traffic_load_proofs enable row level security;
alter table public.traffic_readiness_audits enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'traffic_sources','traffic_campaigns','traffic_landing_pages','traffic_content_assets',
    'traffic_distribution_posts','traffic_seo_keywords','traffic_events','traffic_conversions',
    'traffic_discord_invites','traffic_growth_experiments','traffic_next_best_actions',
    'traffic_weekly_reports','traffic_load_proofs','traffic_readiness_audits'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', table_name || '_admin_all', table_name);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_admin((select auth.uid()))) with check (public.is_admin((select auth.uid())))',
      table_name || '_admin_all',
      table_name
    );
  end loop;
end $$;
