-- Phase 36 — Revenue OS durable worker runtime
-- Adds leases, attempts, dead-letter records, and operational indexes for
-- queued worker execution across lead sources, audits, enrichment, jobs, and
-- inbox sync. Forward-only; nullable columns keep existing rows compatible.

alter table public.revenue_worker_jobs
  add column if not exists locked_by text,
  add column if not exists lease_expires_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists failed_at timestamptz,
  add column if not exists dead_lettered_at timestamptz,
  add column if not exists last_error jsonb not null default '{}'::jsonb,
  add column if not exists result jsonb not null default '{}'::jsonb;

create table if not exists public.revenue_worker_attempts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.revenue_worker_jobs(id) on delete cascade,
  tenant_id text,
  run_key text not null,
  worker_id text,
  attempt_number integer not null default 1 check (attempt_number > 0),
  status text not null check (status in ('completed','failed')),
  started_at timestamptz,
  finished_at timestamptz not null default now(),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  error_code text,
  error_message text,
  result jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_worker_dead_letters (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.revenue_worker_jobs(id) on delete set null,
  tenant_id text,
  run_key text not null,
  job_kind text not null,
  target text not null,
  error_code text not null,
  error_message text not null,
  attempts_used integer not null default 1 check (attempts_used > 0),
  retryable boolean not null default false,
  failed_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists revenue_worker_jobs_lease_idx
  on public.revenue_worker_jobs(status, lease_expires_at)
  where status = 'running';

create index if not exists revenue_worker_jobs_dead_letter_idx
  on public.revenue_worker_jobs(dead_lettered_at desc)
  where dead_lettered_at is not null;

create index if not exists revenue_worker_attempts_job_idx
  on public.revenue_worker_attempts(job_id, created_at desc);

create index if not exists revenue_worker_attempts_run_idx
  on public.revenue_worker_attempts(run_key, created_at desc);

create index if not exists revenue_worker_dead_letters_run_idx
  on public.revenue_worker_dead_letters(run_key, created_at desc);

alter table public.revenue_worker_attempts enable row level security;
alter table public.revenue_worker_dead_letters enable row level security;

drop policy if exists "revenue_worker_attempts_admin_all" on public.revenue_worker_attempts;
create policy "revenue_worker_attempts_admin_all" on public.revenue_worker_attempts for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_worker_dead_letters_admin_all" on public.revenue_worker_dead_letters;
create policy "revenue_worker_dead_letters_admin_all" on public.revenue_worker_dead_letters for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));
