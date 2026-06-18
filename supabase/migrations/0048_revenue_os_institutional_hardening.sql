-- Phase 48 — Revenue OS institutional hardening proof layer
-- Adds durable evidence tables for Programs 13-21: clean PR/CI proof,
-- live integration activation, real worker runtime, observability/SLOs,
-- compliance workflow jobs, client SaaS surface, deliverability ops,
-- load/scale proof, and AI/ML evaluation gates.

create table if not exists public.revenue_institutional_program_runs (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  program_key text not null,
  program_name text not null,
  status text not null check (status in ('passed','degraded','blocked','requires_live_activation')),
  score integer not null default 0 check (score between 0 and 100),
  verified_controls text[] not null default '{}',
  gaps text[] not null default '{}',
  evidence jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_live_integration_checks (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  provider text not null,
  configured boolean not null default false,
  live_verified boolean not null default false,
  mode text not null check (mode in ('missing','configured','sandbox','live_verified')),
  last_error text,
  evidence jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_worker_runtime_executions (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  worker_id text not null,
  claimed_jobs integer not null default 0,
  completed_jobs integer not null default 0,
  failed_jobs integer not null default 0,
  dead_lettered_jobs integer not null default 0,
  max_concurrency integer not null default 1,
  lease_seconds integer not null default 300,
  status text not null check (status in ('passed','degraded','blocked')),
  evidence jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_observability_slo_snapshots (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  status text not null check (status in ('passed','degraded','blocked')),
  score integer not null default 0 check (score between 0 and 100),
  p95_latency_ms integer not null default 0,
  queue_age_seconds integer not null default 0,
  webhook_freshness_seconds integer not null default 0,
  estimated_daily_cost_usd numeric not null default 0,
  alerts text[] not null default '{}',
  evidence jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_privacy_workflow_jobs (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  tenant_key text not null,
  request_type text not null check (request_type in ('export','delete','suppress','anonymize')),
  subject_email text not null,
  status text not null check (status in ('queued','verified','completed','blocked')),
  required_steps text[] not null default '{}',
  completed_steps text[] not null default '{}',
  evidence jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_client_surface_proofs (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  tenant_key text not null,
  surface text not null,
  role text not null,
  allowed_actions text[] not null default '{}',
  blocked_actions text[] not null default '{}',
  quota_state jsonb not null default '{}'::jsonb,
  status text not null check (status in ('passed','degraded','blocked')),
  evidence jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_deliverability_audits (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  sending_domain text not null,
  status text not null check (status in ('healthy','limited','paused','not_configured')),
  spf_status text not null default 'unknown',
  dkim_status text not null default 'unknown',
  dmarc_status text not null default 'unknown',
  warmup_stage text not null default 'manual_review',
  daily_cap integer not null default 0,
  bounce_rate numeric not null default 0,
  complaint_rate numeric not null default 0,
  reply_rate numeric not null default 0,
  automatic_stops text[] not null default '{}',
  evidence jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_load_scale_proofs (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  tenants integer not null default 0,
  leads integer not null default 0,
  jobs integer not null default 0,
  worker_jobs integer not null default 0,
  dashboard_p95_ms integer not null default 0,
  api_p95_ms integer not null default 0,
  export_p95_ms integer not null default 0,
  status text not null check (status in ('passed','degraded','blocked')),
  evidence jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_ai_ml_eval_harness_runs (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  eval_suite text not null,
  model_version text not null,
  prompt_version text not null,
  status text not null check (status in ('passed','degraded','blocked')),
  score integer not null default 0 check (score between 0 and 100),
  hallucination_failures integer not null default 0,
  spam_failures integer not null default 0,
  evidence_failures integer not null default 0,
  cost_usd numeric not null default 0,
  results jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists revenue_institutional_program_runs_run_idx
  on public.revenue_institutional_program_runs(run_key, program_key, created_at desc);
create index if not exists revenue_live_integration_checks_run_idx
  on public.revenue_live_integration_checks(run_key, provider, created_at desc);
create index if not exists revenue_worker_runtime_executions_run_idx
  on public.revenue_worker_runtime_executions(run_key, created_at desc);
create index if not exists revenue_observability_slo_snapshots_run_idx
  on public.revenue_observability_slo_snapshots(run_key, created_at desc);
create index if not exists revenue_privacy_workflow_jobs_tenant_idx
  on public.revenue_privacy_workflow_jobs(tenant_key, run_key, created_at desc);
create index if not exists revenue_client_surface_proofs_tenant_idx
  on public.revenue_client_surface_proofs(tenant_key, run_key, created_at desc);
create index if not exists revenue_deliverability_audits_run_idx
  on public.revenue_deliverability_audits(run_key, sending_domain, created_at desc);
create index if not exists revenue_load_scale_proofs_run_idx
  on public.revenue_load_scale_proofs(run_key, created_at desc);
create index if not exists revenue_ai_ml_eval_harness_runs_run_idx
  on public.revenue_ai_ml_eval_harness_runs(run_key, created_at desc);

alter table public.revenue_institutional_program_runs enable row level security;
alter table public.revenue_live_integration_checks enable row level security;
alter table public.revenue_worker_runtime_executions enable row level security;
alter table public.revenue_observability_slo_snapshots enable row level security;
alter table public.revenue_privacy_workflow_jobs enable row level security;
alter table public.revenue_client_surface_proofs enable row level security;
alter table public.revenue_deliverability_audits enable row level security;
alter table public.revenue_load_scale_proofs enable row level security;
alter table public.revenue_ai_ml_eval_harness_runs enable row level security;

drop policy if exists "revenue_institutional_program_runs_admin_all" on public.revenue_institutional_program_runs;
create policy "revenue_institutional_program_runs_admin_all" on public.revenue_institutional_program_runs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_live_integration_checks_admin_all" on public.revenue_live_integration_checks;
create policy "revenue_live_integration_checks_admin_all" on public.revenue_live_integration_checks for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_worker_runtime_executions_admin_all" on public.revenue_worker_runtime_executions;
create policy "revenue_worker_runtime_executions_admin_all" on public.revenue_worker_runtime_executions for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_observability_slo_snapshots_admin_all" on public.revenue_observability_slo_snapshots;
create policy "revenue_observability_slo_snapshots_admin_all" on public.revenue_observability_slo_snapshots for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_privacy_workflow_jobs_admin_all" on public.revenue_privacy_workflow_jobs;
create policy "revenue_privacy_workflow_jobs_admin_all" on public.revenue_privacy_workflow_jobs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_privacy_workflow_jobs_member_select" on public.revenue_privacy_workflow_jobs;
create policy "revenue_privacy_workflow_jobs_member_select" on public.revenue_privacy_workflow_jobs for select to authenticated
  using (public.revenue_os_is_workspace_member(tenant_key));

drop policy if exists "revenue_client_surface_proofs_admin_all" on public.revenue_client_surface_proofs;
create policy "revenue_client_surface_proofs_admin_all" on public.revenue_client_surface_proofs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_client_surface_proofs_member_select" on public.revenue_client_surface_proofs;
create policy "revenue_client_surface_proofs_member_select" on public.revenue_client_surface_proofs for select to authenticated
  using (public.revenue_os_is_workspace_member(tenant_key));

drop policy if exists "revenue_deliverability_audits_admin_all" on public.revenue_deliverability_audits;
create policy "revenue_deliverability_audits_admin_all" on public.revenue_deliverability_audits for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_load_scale_proofs_admin_all" on public.revenue_load_scale_proofs;
create policy "revenue_load_scale_proofs_admin_all" on public.revenue_load_scale_proofs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_ai_ml_eval_harness_runs_admin_all" on public.revenue_ai_ml_eval_harness_runs;
create policy "revenue_ai_ml_eval_harness_runs_admin_all" on public.revenue_ai_ml_eval_harness_runs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));
