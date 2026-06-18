-- Phase 47 — Revenue OS governance, privacy, and production operations proof
-- Adds durable compliance records, privacy workflows, governance reports,
-- ops health snapshots, CI proof, and load smoke evidence.

create table if not exists public.revenue_compliance_records (
  id uuid primary key default gen_random_uuid(),
  tenant_key text not null,
  account_id uuid references public.acquisition_accounts(id) on delete set null,
  contact_email text,
  source text not null,
  source_url text,
  consent_basis text not null check (consent_basis in ('legitimate_interest','consent','contract','manual_review','do_not_contact')),
  business_context text not null,
  unsubscribe_url text,
  retention_delete_at timestamptz,
  status text not null default 'allowed' check (status in ('allowed','blocked','review')),
  score integer not null default 0 check (score between 0 and 100),
  blockers text[] not null default '{}',
  warnings text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.revenue_privacy_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_key text not null,
  request_type text not null check (request_type in ('export','delete','suppress','anonymize')),
  subject_email text not null,
  status text not null default 'received' check (status in ('received','verified','completed','rejected')),
  due_at timestamptz not null,
  completed_at timestamptz,
  required_steps text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.revenue_governance_reports (
  id uuid primary key default gen_random_uuid(),
  tenant_key text not null,
  period_start date,
  period_end date,
  status text not null check (status in ('ready','blocked')),
  score integer not null default 0 check (score between 0 and 100),
  source_coverage integer not null default 0 check (source_coverage between 0 and 100),
  allowed_contacts integer not null default 0,
  blocked_contacts integer not null default 0,
  privacy_requests_open integer not null default 0,
  audit_events integer not null default 0,
  blockers text[] not null default '{}',
  warnings text[] not null default '{}',
  controls text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_ops_health_snapshots (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  status text not null check (status in ('ok','degraded','fail')),
  score integer not null default 0 check (score between 0 and 100),
  checks jsonb not null default '[]'::jsonb,
  alerts text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_ops_ci_proofs (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  ready boolean not null default false,
  score integer not null default 0 check (score between 0 and 100),
  gates jsonb not null default '[]'::jsonb,
  failed_required jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_ops_load_smokes (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  passed boolean not null default false,
  score integer not null default 0 check (score between 0 and 100),
  checks jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

drop trigger if exists revenue_compliance_records_updated_at on public.revenue_compliance_records;
create trigger revenue_compliance_records_updated_at before update on public.revenue_compliance_records
  for each row execute function public.set_updated_at();

drop trigger if exists revenue_privacy_requests_updated_at on public.revenue_privacy_requests;
create trigger revenue_privacy_requests_updated_at before update on public.revenue_privacy_requests
  for each row execute function public.set_updated_at();

create index if not exists revenue_compliance_records_tenant_idx
  on public.revenue_compliance_records(tenant_key, created_at desc);
create index if not exists revenue_compliance_records_email_idx
  on public.revenue_compliance_records(lower(contact_email), tenant_key);
create index if not exists revenue_privacy_requests_tenant_idx
  on public.revenue_privacy_requests(tenant_key, due_at asc);
create index if not exists revenue_governance_reports_tenant_idx
  on public.revenue_governance_reports(tenant_key, created_at desc);
create index if not exists revenue_ops_health_run_idx
  on public.revenue_ops_health_snapshots(run_key, created_at desc);
create index if not exists revenue_ops_ci_run_idx
  on public.revenue_ops_ci_proofs(run_key, created_at desc);
create index if not exists revenue_ops_load_run_idx
  on public.revenue_ops_load_smokes(run_key, created_at desc);

alter table public.revenue_compliance_records enable row level security;
alter table public.revenue_privacy_requests enable row level security;
alter table public.revenue_governance_reports enable row level security;
alter table public.revenue_ops_health_snapshots enable row level security;
alter table public.revenue_ops_ci_proofs enable row level security;
alter table public.revenue_ops_load_smokes enable row level security;

drop policy if exists "revenue_compliance_records_admin_all" on public.revenue_compliance_records;
create policy "revenue_compliance_records_admin_all" on public.revenue_compliance_records for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_compliance_records_member_select" on public.revenue_compliance_records;
create policy "revenue_compliance_records_member_select" on public.revenue_compliance_records for select to authenticated
  using (public.revenue_os_is_workspace_member(tenant_key));

drop policy if exists "revenue_privacy_requests_admin_all" on public.revenue_privacy_requests;
create policy "revenue_privacy_requests_admin_all" on public.revenue_privacy_requests for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_privacy_requests_member_select" on public.revenue_privacy_requests;
create policy "revenue_privacy_requests_member_select" on public.revenue_privacy_requests for select to authenticated
  using (public.revenue_os_is_workspace_member(tenant_key));

drop policy if exists "revenue_governance_reports_admin_all" on public.revenue_governance_reports;
create policy "revenue_governance_reports_admin_all" on public.revenue_governance_reports for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_governance_reports_member_select" on public.revenue_governance_reports;
create policy "revenue_governance_reports_member_select" on public.revenue_governance_reports for select to authenticated
  using (public.revenue_os_is_workspace_member(tenant_key));

drop policy if exists "revenue_ops_health_admin_all" on public.revenue_ops_health_snapshots;
create policy "revenue_ops_health_admin_all" on public.revenue_ops_health_snapshots for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_ops_ci_admin_all" on public.revenue_ops_ci_proofs;
create policy "revenue_ops_ci_admin_all" on public.revenue_ops_ci_proofs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_ops_load_admin_all" on public.revenue_ops_load_smokes;
create policy "revenue_ops_load_admin_all" on public.revenue_ops_load_smokes for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));
