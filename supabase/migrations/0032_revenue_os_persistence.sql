-- Phase 32 — Revenue OS persistence
-- Durable tables for job search, lead connectors, email prep, daily runs,
-- experiments, and learning reports. Admin-only via RLS.

create table if not exists public.revenue_lead_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type text not null
    check (source_type in ('csv','google_places','directory','job_board','linkedin','github','referral','inbound','other')),
  query text,
  status text not null default 'active'
    check (status in ('active','paused','archived')),
  daily_limit integer not null default 25 check (daily_limit >= 0 and daily_limit <= 1000),
  qualification_signals text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.revenue_lead_source_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.revenue_lead_sources(id) on delete set null,
  run_type text not null default 'manual'
    check (run_type in ('manual','csv_import','google_places_preview','api','cron')),
  status text not null default 'completed'
    check (status in ('queued','running','completed','failed')),
  leads_found integer not null default 0,
  leads_imported integer not null default 0,
  deduped integer not null default 0,
  error text,
  sample jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_job_opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  location text,
  job_url text,
  source text not null default 'manual',
  score integer not null default 0 check (score between 0 and 100),
  resume_variant text,
  ats_keywords text[] not null default '{}',
  application_advice text,
  status text not null default 'queued'
    check (status in ('queued','reviewing','applied','rejected','archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.revenue_job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.revenue_job_opportunities(id) on delete cascade,
  stage text not null default 'queued'
    check (stage in ('queued','applied','recruiter_contacted','interview','offer','rejected','archived')),
  resume_variant text,
  recruiter_name text,
  recruiter_email text,
  salary_range text,
  remote_status text,
  next_action text,
  next_action_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.revenue_email_queue (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.acquisition_accounts(id) on delete set null,
  contact_id uuid references public.acquisition_contacts(id) on delete set null,
  outreach_message_id uuid references public.acquisition_outreach_messages(id) on delete set null,
  recipient_email text,
  subject text,
  body text not null,
  status text not null default 'manual_review'
    check (status in ('manual_review','approved','scheduled','sent','blocked','archived')),
  sequence_key text,
  step_number integer not null default 1,
  scheduled_at timestamptz,
  approved_at timestamptz,
  sent_at timestamptz,
  provider_message_id text,
  suppression_checked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.revenue_email_events (
  id uuid primary key default gen_random_uuid(),
  email_queue_id uuid references public.revenue_email_queue(id) on delete cascade,
  event_type text not null
    check (event_type in ('sent','delivered','opened','clicked','replied','bounced','complained','unsubscribed')),
  occurred_at timestamptz not null default now(),
  requires_suppression boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_daily_runs (
  id uuid primary key default gen_random_uuid(),
  run_date date not null default current_date,
  mode text not null default 'preview'
    check (mode in ('preview','manual','cron')),
  scorecard jsonb not null default '{}'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  safety_notes text[] not null default '{}',
  status text not null default 'completed'
    check (status in ('completed','failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_experiments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  experiment_type text not null
    check (experiment_type in ('subject','offer','source','resume','cta','landing_page','other')),
  status text not null default 'running'
    check (status in ('draft','running','won','lost','archived')),
  hypothesis text,
  variants jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  winner text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.revenue_learning_reports (
  id uuid primary key default gen_random_uuid(),
  period_start date,
  period_end date,
  period_label text not null,
  learning_score integer not null default 0 check (learning_score between 0 and 100),
  best_channel text,
  what_worked jsonb not null default '[]'::jsonb,
  what_to_improve jsonb not null default '[]'::jsonb,
  next_experiments jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

drop trigger if exists revenue_lead_sources_updated_at on public.revenue_lead_sources;
create trigger revenue_lead_sources_updated_at before update on public.revenue_lead_sources
  for each row execute function public.set_updated_at();

drop trigger if exists revenue_job_opportunities_updated_at on public.revenue_job_opportunities;
create trigger revenue_job_opportunities_updated_at before update on public.revenue_job_opportunities
  for each row execute function public.set_updated_at();

drop trigger if exists revenue_job_applications_updated_at on public.revenue_job_applications;
create trigger revenue_job_applications_updated_at before update on public.revenue_job_applications
  for each row execute function public.set_updated_at();

drop trigger if exists revenue_email_queue_updated_at on public.revenue_email_queue;
create trigger revenue_email_queue_updated_at before update on public.revenue_email_queue
  for each row execute function public.set_updated_at();

drop trigger if exists revenue_experiments_updated_at on public.revenue_experiments;
create trigger revenue_experiments_updated_at before update on public.revenue_experiments
  for each row execute function public.set_updated_at();

create index if not exists revenue_lead_sources_type_idx on public.revenue_lead_sources(source_type);
create index if not exists revenue_lead_runs_created_idx on public.revenue_lead_source_runs(created_at desc);
create index if not exists revenue_jobs_score_idx on public.revenue_job_opportunities(score desc);
create index if not exists revenue_jobs_status_idx on public.revenue_job_opportunities(status);
create index if not exists revenue_applications_stage_idx on public.revenue_job_applications(stage);
create index if not exists revenue_applications_next_action_idx on public.revenue_job_applications(next_action_at);
create index if not exists revenue_email_queue_status_idx on public.revenue_email_queue(status);
create index if not exists revenue_email_queue_scheduled_idx on public.revenue_email_queue(scheduled_at);
create index if not exists revenue_email_events_type_idx on public.revenue_email_events(event_type);
create index if not exists revenue_daily_runs_date_idx on public.revenue_daily_runs(run_date desc);
create index if not exists revenue_experiments_status_idx on public.revenue_experiments(status);
create index if not exists revenue_learning_reports_created_idx on public.revenue_learning_reports(created_at desc);

alter table public.revenue_lead_sources enable row level security;
alter table public.revenue_lead_source_runs enable row level security;
alter table public.revenue_job_opportunities enable row level security;
alter table public.revenue_job_applications enable row level security;
alter table public.revenue_email_queue enable row level security;
alter table public.revenue_email_events enable row level security;
alter table public.revenue_daily_runs enable row level security;
alter table public.revenue_experiments enable row level security;
alter table public.revenue_learning_reports enable row level security;

drop policy if exists "revenue_lead_sources_admin_all" on public.revenue_lead_sources;
create policy "revenue_lead_sources_admin_all" on public.revenue_lead_sources for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_lead_runs_admin_all" on public.revenue_lead_source_runs;
create policy "revenue_lead_runs_admin_all" on public.revenue_lead_source_runs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_jobs_admin_all" on public.revenue_job_opportunities;
create policy "revenue_jobs_admin_all" on public.revenue_job_opportunities for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_applications_admin_all" on public.revenue_job_applications;
create policy "revenue_applications_admin_all" on public.revenue_job_applications for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_email_queue_admin_all" on public.revenue_email_queue;
create policy "revenue_email_queue_admin_all" on public.revenue_email_queue for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_email_events_admin_all" on public.revenue_email_events;
create policy "revenue_email_events_admin_all" on public.revenue_email_events for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_daily_runs_admin_all" on public.revenue_daily_runs;
create policy "revenue_daily_runs_admin_all" on public.revenue_daily_runs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_experiments_admin_all" on public.revenue_experiments;
create policy "revenue_experiments_admin_all" on public.revenue_experiments for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_learning_reports_admin_all" on public.revenue_learning_reports;
create policy "revenue_learning_reports_admin_all" on public.revenue_learning_reports for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));
