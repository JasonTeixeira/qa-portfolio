-- Job Application OS optimization engine
-- Adds dataset intake, strategy recommendations, proof-gap learning, and
-- measured load evidence for the job-search operating system.

create table if not exists public.job_os_dataset_imports (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  source_type text not null
    check (source_type in ('csv','json','manual')),
  dataset_name text not null,
  rows_imported integer not null default 0,
  rows_rejected integer not null default 0,
  normalized_jobs jsonb not null default '[]'::jsonb,
  normalized_outcomes jsonb not null default '[]'::jsonb,
  errors text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.job_os_strategy_recommendations (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  priority integer not null default 0,
  action text not null,
  rationale text not null,
  expected_impact text not null,
  status text not null default 'open'
    check (status in ('open','accepted','done','dismissed')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_os_proof_gap_recommendations (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  gap text not null,
  keyword text not null,
  frequency integer not null default 0,
  recommended_artifact text not null,
  priority text not null
    check (priority in ('low','medium','high','critical')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.job_os_measured_load_runs (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  tenants integer not null default 0,
  jobs integer not null default 0,
  applications integer not null default 0,
  packets integer not null default 0,
  duration_ms integer not null default 0,
  p95_dashboard_ms integer not null default 0,
  p95_export_ms integer not null default 0,
  status text not null
    check (status in ('passed','failed')),
  samples jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists job_os_dataset_imports_run_idx on public.job_os_dataset_imports(run_key);
create index if not exists job_os_dataset_imports_created_idx on public.job_os_dataset_imports(created_at desc);
create index if not exists job_os_strategy_run_idx on public.job_os_strategy_recommendations(run_key);
create index if not exists job_os_strategy_status_idx on public.job_os_strategy_recommendations(status);
create index if not exists job_os_proof_gap_run_idx on public.job_os_proof_gap_recommendations(run_key);
create index if not exists job_os_proof_gap_priority_idx on public.job_os_proof_gap_recommendations(priority);
create index if not exists job_os_measured_load_run_idx on public.job_os_measured_load_runs(run_key);
create index if not exists job_os_measured_load_status_idx on public.job_os_measured_load_runs(status);

drop trigger if exists job_os_strategy_recommendations_updated_at on public.job_os_strategy_recommendations;
create trigger job_os_strategy_recommendations_updated_at before update on public.job_os_strategy_recommendations
  for each row execute function public.set_updated_at();

alter table public.job_os_dataset_imports enable row level security;
alter table public.job_os_strategy_recommendations enable row level security;
alter table public.job_os_proof_gap_recommendations enable row level security;
alter table public.job_os_measured_load_runs enable row level security;

drop policy if exists "job_os_dataset_imports_admin_all" on public.job_os_dataset_imports;
create policy "job_os_dataset_imports_admin_all" on public.job_os_dataset_imports for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_strategy_recommendations_admin_all" on public.job_os_strategy_recommendations;
create policy "job_os_strategy_recommendations_admin_all" on public.job_os_strategy_recommendations for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_proof_gap_recommendations_admin_all" on public.job_os_proof_gap_recommendations;
create policy "job_os_proof_gap_recommendations_admin_all" on public.job_os_proof_gap_recommendations for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_measured_load_runs_admin_all" on public.job_os_measured_load_runs;
create policy "job_os_measured_load_runs_admin_all" on public.job_os_measured_load_runs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));
