-- Phase 14 durable Discord jobs: registry, run history, and recovery dead letters.

create table if not exists public.discord_job_registry (
  job_key text primary key,
  job_name text not null,
  schedule text,
  owner text not null default 'sagebot',
  idempotency_scope text not null,
  max_retries integer not null default 2 check (max_retries between 0 and 10),
  timeout_seconds integer not null default 300 check (timeout_seconds between 5 and 7200),
  retryable boolean not null default true,
  side_effects jsonb not null default '[]'::jsonb,
  enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.discord_job_runs (
  run_key text primary key,
  job_key text not null references public.discord_job_registry(job_key) on delete restrict,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'succeeded', 'failed', 'canceled', 'dead_lettered', 'requeued', 'skipped')),
  idempotency_key text not null,
  attempt integer not null default 1 check (attempt >= 1),
  max_retries integer not null default 2 check (max_retries between 0 and 10),
  next_retry_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  duration_ms integer,
  error_code text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists discord_job_runs_idempotency_idx
  on public.discord_job_runs(job_key, idempotency_key);

create index if not exists discord_job_runs_status_idx
  on public.discord_job_runs(status, next_retry_at, created_at desc);

create index if not exists discord_job_runs_job_idx
  on public.discord_job_runs(job_key, created_at desc);

create table if not exists public.discord_job_dead_letters (
  id uuid primary key default gen_random_uuid(),
  run_key text not null references public.discord_job_runs(run_key) on delete cascade,
  job_key text not null references public.discord_job_registry(job_key) on delete restrict,
  reason text not null,
  retryable boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  admin_notes text,
  resolved_at timestamptz,
  resolved_by text,
  retry_run_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discord_job_dead_letters_open_idx
  on public.discord_job_dead_letters(created_at desc)
  where resolved_at is null;

create index if not exists discord_job_dead_letters_job_idx
  on public.discord_job_dead_letters(job_key, created_at desc);

alter table public.discord_job_registry enable row level security;
alter table public.discord_job_runs enable row level security;
alter table public.discord_job_dead_letters enable row level security;

drop policy if exists "discord_job_registry_admin_all" on public.discord_job_registry;
create policy "discord_job_registry_admin_all" on public.discord_job_registry
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "discord_job_runs_admin_all" on public.discord_job_runs;
create policy "discord_job_runs_admin_all" on public.discord_job_runs
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "discord_job_dead_letters_admin_all" on public.discord_job_dead_letters;
create policy "discord_job_dead_letters_admin_all" on public.discord_job_dead_letters
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
