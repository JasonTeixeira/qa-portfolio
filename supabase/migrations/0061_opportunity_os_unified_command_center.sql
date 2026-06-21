-- Opportunity OS unified command center
-- Additive schema that unifies Job Application OS and Revenue OS without merging
-- their source tables. Forward-only migration.

create table if not exists public.opportunity_unified_items (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  source text not null check (source in ('job_os','revenue_os')),
  source_id text not null,
  title text not null,
  organization text not null,
  stage text not null
    check (stage in ('new','qualified','ready','contacted','active','won','lost','archived')),
  priority_score integer not null default 0 check (priority_score between 0 and 100),
  expected_value_usd integer not null default 0 check (expected_value_usd >= 0),
  next_action text,
  next_action_at timestamptz,
  stale boolean not null default false,
  proof_gaps text[] not null default '{}',
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_key, source, source_id)
);

create table if not exists public.opportunity_proof_assets (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  asset_type text not null
    check (asset_type in ('resume','case_study','portfolio','metric','testimonial','artifact')),
  title text not null,
  applies_to text not null check (applies_to in ('job_os','revenue_os','both')),
  keywords text[] not null default '{}',
  gap_covered text not null,
  priority text not null check (priority in ('low','medium','high','critical')),
  status text not null default 'recommended'
    check (status in ('recommended','in_progress','ready','archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunity_communication_events (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  source text not null check (source in ('job_os','revenue_os')),
  source_id text not null,
  channel text not null check (channel in ('gmail','linkedin','email','manual')),
  direction text not null check (direction in ('inbound','outbound')),
  intent text not null
    check (intent in ('recruiter_positive','client_interest','objection','rejection','unsubscribe','unknown')),
  next_action text,
  confidence integer not null default 0 check (confidence between 0 and 100),
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.opportunity_follow_up_queue (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  opportunity_item_id uuid references public.opportunity_unified_items(id) on delete cascade,
  rank integer not null default 0,
  source text not null check (source in ('job_os','revenue_os')),
  action text not null,
  rationale text not null,
  urgency text not null check (urgency in ('low','medium','high','critical')),
  due_at timestamptz,
  status text not null default 'open'
    check (status in ('open','approved','done','snoozed','dismissed')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunity_outcome_events (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  source text not null check (source in ('job_os','revenue_os')),
  source_id text not null,
  outcome text not null
    check (outcome in ('applied','reply','interview','meeting','proposal','offer','won','lost','rejected','withdrawn')),
  value_usd integer not null default 0 check (value_usd >= 0),
  evidence text,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.opportunity_strategy_recommendations (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  priority integer not null default 0,
  recommendation text not null,
  rationale text not null,
  status text not null default 'open'
    check (status in ('open','accepted','done','dismissed')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunity_load_proofs (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  tenants integer not null default 0,
  opportunities integer not null default 0,
  actions integer not null default 0,
  p95_dashboard_ms integer not null default 0,
  p95_adapter_ms integer not null default 0,
  status text not null check (status in ('passed','failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.opportunity_readiness_audits (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  score integer not null check (score between 0 and 100),
  grade text not null check (grade in ('world_class_ready','institutional_beta','blocked')),
  passed text[] not null default '{}',
  gaps text[] not null default '{}',
  program_count integer not null default 24,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists opportunity_unified_items_run_idx on public.opportunity_unified_items(run_key);
create index if not exists opportunity_unified_items_source_idx on public.opportunity_unified_items(source, stage, priority_score desc);
create index if not exists opportunity_follow_up_queue_run_idx on public.opportunity_follow_up_queue(run_key, status, rank);
create index if not exists opportunity_proof_assets_run_idx on public.opportunity_proof_assets(run_key, priority);
create index if not exists opportunity_communication_events_run_idx on public.opportunity_communication_events(run_key, intent);
create index if not exists opportunity_outcome_events_run_idx on public.opportunity_outcome_events(run_key, outcome);
create index if not exists opportunity_readiness_audits_score_idx on public.opportunity_readiness_audits(score desc);

drop trigger if exists opportunity_unified_items_updated_at on public.opportunity_unified_items;
create trigger opportunity_unified_items_updated_at before update on public.opportunity_unified_items
  for each row execute function public.set_updated_at();

drop trigger if exists opportunity_proof_assets_updated_at on public.opportunity_proof_assets;
create trigger opportunity_proof_assets_updated_at before update on public.opportunity_proof_assets
  for each row execute function public.set_updated_at();

drop trigger if exists opportunity_follow_up_queue_updated_at on public.opportunity_follow_up_queue;
create trigger opportunity_follow_up_queue_updated_at before update on public.opportunity_follow_up_queue
  for each row execute function public.set_updated_at();

drop trigger if exists opportunity_strategy_recommendations_updated_at on public.opportunity_strategy_recommendations;
create trigger opportunity_strategy_recommendations_updated_at before update on public.opportunity_strategy_recommendations
  for each row execute function public.set_updated_at();

alter table public.opportunity_unified_items enable row level security;
alter table public.opportunity_proof_assets enable row level security;
alter table public.opportunity_communication_events enable row level security;
alter table public.opportunity_follow_up_queue enable row level security;
alter table public.opportunity_outcome_events enable row level security;
alter table public.opportunity_strategy_recommendations enable row level security;
alter table public.opportunity_load_proofs enable row level security;
alter table public.opportunity_readiness_audits enable row level security;

drop policy if exists "opportunity_unified_items_admin_all" on public.opportunity_unified_items;
create policy "opportunity_unified_items_admin_all" on public.opportunity_unified_items for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "opportunity_proof_assets_admin_all" on public.opportunity_proof_assets;
create policy "opportunity_proof_assets_admin_all" on public.opportunity_proof_assets for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "opportunity_communication_events_admin_all" on public.opportunity_communication_events;
create policy "opportunity_communication_events_admin_all" on public.opportunity_communication_events for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "opportunity_follow_up_queue_admin_all" on public.opportunity_follow_up_queue;
create policy "opportunity_follow_up_queue_admin_all" on public.opportunity_follow_up_queue for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "opportunity_outcome_events_admin_all" on public.opportunity_outcome_events;
create policy "opportunity_outcome_events_admin_all" on public.opportunity_outcome_events for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "opportunity_strategy_recommendations_admin_all" on public.opportunity_strategy_recommendations;
create policy "opportunity_strategy_recommendations_admin_all" on public.opportunity_strategy_recommendations for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "opportunity_load_proofs_admin_all" on public.opportunity_load_proofs;
create policy "opportunity_load_proofs_admin_all" on public.opportunity_load_proofs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "opportunity_readiness_audits_admin_all" on public.opportunity_readiness_audits;
create policy "opportunity_readiness_audits_admin_all" on public.opportunity_readiness_audits for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));
