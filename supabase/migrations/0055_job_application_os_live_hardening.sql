-- Job Application OS live hardening
-- Adds artifact versioning, browser capture workflow, submitted evidence,
-- outcome learning, and readiness audits.

create table if not exists public.job_os_resume_artifacts (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  resume_version_id uuid references public.job_os_resume_versions(id) on delete set null,
  external_resume_key text,
  artifact_type text not null
    check (artifact_type in ('markdown','pdf_ready_html','docx_manifest')),
  filename text not null,
  content text not null,
  checksum text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.job_os_browser_capture_sessions (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  application_id uuid references public.job_os_applications(id) on delete cascade,
  source text not null
    check (source in ('linkedin','workday','greenhouse','lever','manual')),
  status text not null
    check (status in ('ready','needs_operator_session','captured')),
  capture_url text not null,
  checklist text[] not null default '{}',
  evidence_required text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_os_outcomes (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  application_id uuid references public.job_os_applications(id) on delete cascade,
  outcome text not null
    check (outcome in ('applied','reply','interview','offer','rejected','withdrawn')),
  outcome_source text not null
    check (outcome_source in ('manual','gmail','provider','import')),
  score_delta integer not null default 0,
  evidence text,
  outcome_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.job_os_learning_reports (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  sample_size integer not null default 0,
  reply_rate integer not null default 0 check (reply_rate between 0 and 100),
  interview_rate integer not null default 0 check (interview_rate between 0 and 100),
  offer_rate integer not null default 0 check (offer_rate between 0 and 100),
  recommended_changes text[] not null default '{}',
  model_weights jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.job_os_readiness_audits (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  score integer not null check (score between 0 and 100),
  grade text not null
    check (grade in ('institutional','world_class_ready','blocked')),
  passed text[] not null default '{}',
  gaps text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.job_os_submission_evidence
  add column if not exists submitted_url text,
  add column if not exists confirmation_text text,
  add column if not exists artifact_checksums text[] not null default '{}',
  add column if not exists operator_notes text;

create index if not exists job_os_resume_artifacts_run_idx on public.job_os_resume_artifacts(run_key);
create index if not exists job_os_resume_artifacts_checksum_idx on public.job_os_resume_artifacts(checksum);
create index if not exists job_os_browser_capture_run_idx on public.job_os_browser_capture_sessions(run_key);
create index if not exists job_os_browser_capture_status_idx on public.job_os_browser_capture_sessions(status);
create index if not exists job_os_outcomes_run_idx on public.job_os_outcomes(run_key);
create index if not exists job_os_outcomes_outcome_idx on public.job_os_outcomes(outcome);
create index if not exists job_os_learning_reports_run_idx on public.job_os_learning_reports(run_key);
create index if not exists job_os_readiness_audits_score_idx on public.job_os_readiness_audits(score desc);

drop trigger if exists job_os_browser_capture_sessions_updated_at on public.job_os_browser_capture_sessions;
create trigger job_os_browser_capture_sessions_updated_at before update on public.job_os_browser_capture_sessions
  for each row execute function public.set_updated_at();

alter table public.job_os_resume_artifacts enable row level security;
alter table public.job_os_browser_capture_sessions enable row level security;
alter table public.job_os_outcomes enable row level security;
alter table public.job_os_learning_reports enable row level security;
alter table public.job_os_readiness_audits enable row level security;

drop policy if exists "job_os_resume_artifacts_admin_all" on public.job_os_resume_artifacts;
create policy "job_os_resume_artifacts_admin_all" on public.job_os_resume_artifacts for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_browser_capture_sessions_admin_all" on public.job_os_browser_capture_sessions;
create policy "job_os_browser_capture_sessions_admin_all" on public.job_os_browser_capture_sessions for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_outcomes_admin_all" on public.job_os_outcomes;
create policy "job_os_outcomes_admin_all" on public.job_os_outcomes for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_learning_reports_admin_all" on public.job_os_learning_reports;
create policy "job_os_learning_reports_admin_all" on public.job_os_learning_reports for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_readiness_audits_admin_all" on public.job_os_readiness_audits;
create policy "job_os_readiness_audits_admin_all" on public.job_os_readiness_audits for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));
