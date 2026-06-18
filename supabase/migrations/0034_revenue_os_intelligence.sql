-- Phase 34 — Revenue OS intelligence foundation
-- Durable tables for agent runtime, worker jobs, AI reviews, inbox intelligence,
-- ML scoring, adaptive sequences, tenant workspaces, and evaluation gates.

create table if not exists public.revenue_agent_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id text,
  run_key text not null,
  objective text not null,
  status text not null default 'queued'
    check (status in ('queued','running','needs_attention','completed')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.revenue_agent_tasks (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.revenue_agent_runs(id) on delete cascade,
  task_key text not null,
  task_type text not null,
  title text not null,
  priority integer not null default 50 check (priority between 0 and 100),
  requires_approval boolean not null default false,
  status text not null default 'queued'
    check (status in ('queued','running','completed','failed')),
  result jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.revenue_agent_traces (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.revenue_agent_runs(id) on delete cascade,
  task_id uuid references public.revenue_agent_tasks(id) on delete set null,
  tool_name text not null,
  input_summary text,
  output_summary text,
  status text not null default 'success' check (status in ('success','warning','error')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_worker_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id text,
  run_key text not null,
  job_kind text not null
    check (job_kind in ('lead_source','website_audit','enrichment','job_source','inbox_sync')),
  target text not null,
  priority integer not null default 50 check (priority between 0 and 100),
  status text not null default 'queued'
    check (status in ('queued','running','completed','failed')),
  attempts_remaining integer not null default 3 check (attempts_remaining >= 0),
  rate_limit_per_minute integer not null default 30 check (rate_limit_per_minute > 0),
  next_run_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.revenue_ai_draft_reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id text,
  account_id uuid references public.acquisition_accounts(id) on delete set null,
  draft_id uuid references public.acquisition_outreach_messages(id) on delete set null,
  approved boolean not null default false,
  hallucination_risk integer not null default 0 check (hallucination_risk between 0 and 100),
  spam_risk integer not null default 0 check (spam_risk between 0 and 100),
  cited_evidence_ids text[] not null default '{}',
  checks text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_inbox_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id text,
  provider text not null default 'gmail',
  external_message_id text,
  sender_email text,
  subject text,
  intent text,
  sentiment text,
  extracted_signals text[] not null default '{}',
  crm_patch jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  received_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_ml_scores (
  id uuid primary key default gen_random_uuid(),
  tenant_id text,
  account_id uuid references public.acquisition_accounts(id) on delete cascade,
  model_version text not null,
  rule_score integer not null check (rule_score between 0 and 100),
  learned_score integer not null check (learned_score between 0 and 100),
  blended_score integer not null check (blended_score between 0 and 100),
  calibrated_probability numeric not null default 0,
  features jsonb not null default '{}'::jsonb,
  decision text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_adaptive_sequences (
  id uuid primary key default gen_random_uuid(),
  tenant_id text,
  account_id uuid references public.acquisition_accounts(id) on delete cascade,
  status text not null default 'active' check (status in ('active','stopped')),
  stop_reason text,
  persona text,
  industry text,
  offer text,
  steps jsonb not null default '[]'::jsonb,
  events jsonb not null default '[]'::jsonb,
  next_step jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.revenue_tenants (
  id uuid primary key default gen_random_uuid(),
  tenant_key text not null unique,
  business_name text not null,
  owner_email text not null,
  lead_sources text[] not null default '{}',
  sending_domains jsonb not null default '[]'::jsonb,
  limits jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.revenue_eval_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id text,
  eval_key text not null,
  overall_status text not null check (overall_status in ('pass','fail')),
  pass_rate integer not null default 0 check (pass_rate between 0 and 100),
  passed integer not null default 0,
  failed integer not null default 0,
  failures jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists revenue_agent_runs_key_idx on public.revenue_agent_runs(run_key);
create index if not exists revenue_agent_tasks_run_idx on public.revenue_agent_tasks(run_id);
create index if not exists revenue_agent_traces_run_idx on public.revenue_agent_traces(run_id);
create index if not exists revenue_worker_jobs_next_idx on public.revenue_worker_jobs(status, next_run_at, priority desc);
create index if not exists revenue_inbox_events_intent_idx on public.revenue_inbox_events(intent);
create index if not exists revenue_ml_scores_account_idx on public.revenue_ml_scores(account_id, created_at desc);
create index if not exists revenue_sequences_account_idx on public.revenue_adaptive_sequences(account_id);
create index if not exists revenue_eval_runs_created_idx on public.revenue_eval_runs(created_at desc);

alter table public.revenue_agent_runs enable row level security;
alter table public.revenue_agent_tasks enable row level security;
alter table public.revenue_agent_traces enable row level security;
alter table public.revenue_worker_jobs enable row level security;
alter table public.revenue_ai_draft_reviews enable row level security;
alter table public.revenue_inbox_events enable row level security;
alter table public.revenue_ml_scores enable row level security;
alter table public.revenue_adaptive_sequences enable row level security;
alter table public.revenue_tenants enable row level security;
alter table public.revenue_eval_runs enable row level security;

drop policy if exists "revenue_agent_runs_admin_all" on public.revenue_agent_runs;
create policy "revenue_agent_runs_admin_all" on public.revenue_agent_runs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_agent_tasks_admin_all" on public.revenue_agent_tasks;
create policy "revenue_agent_tasks_admin_all" on public.revenue_agent_tasks for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_agent_traces_admin_all" on public.revenue_agent_traces;
create policy "revenue_agent_traces_admin_all" on public.revenue_agent_traces for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_worker_jobs_admin_all" on public.revenue_worker_jobs;
create policy "revenue_worker_jobs_admin_all" on public.revenue_worker_jobs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_ai_reviews_admin_all" on public.revenue_ai_draft_reviews;
create policy "revenue_ai_reviews_admin_all" on public.revenue_ai_draft_reviews for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_inbox_events_admin_all" on public.revenue_inbox_events;
create policy "revenue_inbox_events_admin_all" on public.revenue_inbox_events for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_ml_scores_admin_all" on public.revenue_ml_scores;
create policy "revenue_ml_scores_admin_all" on public.revenue_ml_scores for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_adaptive_sequences_admin_all" on public.revenue_adaptive_sequences;
create policy "revenue_adaptive_sequences_admin_all" on public.revenue_adaptive_sequences for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_tenants_admin_all" on public.revenue_tenants;
create policy "revenue_tenants_admin_all" on public.revenue_tenants for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_eval_runs_admin_all" on public.revenue_eval_runs;
create policy "revenue_eval_runs_admin_all" on public.revenue_eval_runs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));
