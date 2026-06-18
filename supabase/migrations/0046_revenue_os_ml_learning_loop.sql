-- Phase 46 — Revenue OS ML scoring and learning loop
-- Adds durable feature snapshots, outcome labels, model versions, scoring
-- decisions, and calibration reports for measured prioritization.

create table if not exists public.revenue_ml_feature_snapshots (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  account_id uuid references public.acquisition_accounts(id) on delete cascade,
  source text not null,
  industry text not null,
  offer text not null,
  rule_score integer not null check (rule_score between 0 and 100),
  features jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_ml_outcome_labels (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  account_id uuid references public.acquisition_accounts(id) on delete cascade,
  outcome text not null check (outcome in ('won','meeting','proposal','interview','offer','lost','no_reply','bounced','rejected')),
  value numeric,
  metadata jsonb not null default '{}'::jsonb,
  labeled_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_ml_model_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  model_version text not null,
  model_type text not null default 'local_logistic_baseline',
  sample_size integer not null default 0,
  weights jsonb not null default '{}'::jsonb,
  bias numeric not null default 0,
  metrics jsonb not null default '{}'::jsonb,
  feature_importance jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  trained_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (tenant_id, model_version)
);

create table if not exists public.revenue_ml_scoring_decisions (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  account_id uuid references public.acquisition_accounts(id) on delete cascade,
  model_version text not null,
  rule_score integer not null check (rule_score between 0 and 100),
  learned_score integer not null check (learned_score between 0 and 100),
  blended_score integer not null check (blended_score between 0 and 100),
  calibrated_probability numeric not null default 0,
  decision text not null check (decision in ('prioritize','review','deprioritize')),
  feature_snapshot jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  decided_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_ml_calibration_reports (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  model_version text not null,
  brier_score numeric not null default 0,
  bands jsonb not null default '[]'::jsonb,
  drift_warnings text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  reported_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists revenue_ml_feature_snapshots_tenant_idx
  on public.revenue_ml_feature_snapshots(tenant_id, captured_at desc);
create index if not exists revenue_ml_feature_snapshots_account_idx
  on public.revenue_ml_feature_snapshots(account_id, captured_at desc);
create index if not exists revenue_ml_outcome_labels_tenant_idx
  on public.revenue_ml_outcome_labels(tenant_id, labeled_at desc);
create index if not exists revenue_ml_outcome_labels_account_idx
  on public.revenue_ml_outcome_labels(account_id, labeled_at desc);
create index if not exists revenue_ml_model_versions_tenant_idx
  on public.revenue_ml_model_versions(tenant_id, trained_at desc);
create index if not exists revenue_ml_scoring_decisions_tenant_idx
  on public.revenue_ml_scoring_decisions(tenant_id, decided_at desc);
create index if not exists revenue_ml_scoring_decisions_account_idx
  on public.revenue_ml_scoring_decisions(account_id, decided_at desc);
create index if not exists revenue_ml_calibration_reports_tenant_idx
  on public.revenue_ml_calibration_reports(tenant_id, reported_at desc);

alter table public.revenue_ml_feature_snapshots enable row level security;
alter table public.revenue_ml_outcome_labels enable row level security;
alter table public.revenue_ml_model_versions enable row level security;
alter table public.revenue_ml_scoring_decisions enable row level security;
alter table public.revenue_ml_calibration_reports enable row level security;

drop policy if exists "revenue_ml_feature_snapshots_admin_all" on public.revenue_ml_feature_snapshots;
create policy "revenue_ml_feature_snapshots_admin_all" on public.revenue_ml_feature_snapshots for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_ml_feature_snapshots_member_select" on public.revenue_ml_feature_snapshots;
create policy "revenue_ml_feature_snapshots_member_select" on public.revenue_ml_feature_snapshots for select to authenticated
  using (public.revenue_os_is_workspace_member(tenant_id));

drop policy if exists "revenue_ml_outcome_labels_admin_all" on public.revenue_ml_outcome_labels;
create policy "revenue_ml_outcome_labels_admin_all" on public.revenue_ml_outcome_labels for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_ml_outcome_labels_member_select" on public.revenue_ml_outcome_labels;
create policy "revenue_ml_outcome_labels_member_select" on public.revenue_ml_outcome_labels for select to authenticated
  using (public.revenue_os_is_workspace_member(tenant_id));

drop policy if exists "revenue_ml_model_versions_admin_all" on public.revenue_ml_model_versions;
create policy "revenue_ml_model_versions_admin_all" on public.revenue_ml_model_versions for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_ml_model_versions_member_select" on public.revenue_ml_model_versions;
create policy "revenue_ml_model_versions_member_select" on public.revenue_ml_model_versions for select to authenticated
  using (public.revenue_os_is_workspace_member(tenant_id));

drop policy if exists "revenue_ml_scoring_decisions_admin_all" on public.revenue_ml_scoring_decisions;
create policy "revenue_ml_scoring_decisions_admin_all" on public.revenue_ml_scoring_decisions for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_ml_scoring_decisions_member_select" on public.revenue_ml_scoring_decisions;
create policy "revenue_ml_scoring_decisions_member_select" on public.revenue_ml_scoring_decisions for select to authenticated
  using (public.revenue_os_is_workspace_member(tenant_id));

drop policy if exists "revenue_ml_calibration_reports_admin_all" on public.revenue_ml_calibration_reports;
create policy "revenue_ml_calibration_reports_admin_all" on public.revenue_ml_calibration_reports for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_ml_calibration_reports_member_select" on public.revenue_ml_calibration_reports;
create policy "revenue_ml_calibration_reports_member_select" on public.revenue_ml_calibration_reports for select to authenticated
  using (public.revenue_os_is_workspace_member(tenant_id));
