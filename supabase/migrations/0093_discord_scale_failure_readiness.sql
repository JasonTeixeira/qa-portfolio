-- Phase 19: Discord/SageBot scale, load, and failure readiness evidence.

create table if not exists public.discord_scale_readiness_runs (
  id uuid primary key default gen_random_uuid(),
  run_key text not null unique,
  status text not null default 'passed' check (status in ('passed', 'failed', 'blocked')),
  readiness_version text not null,
  readiness_score integer not null default 0 check (readiness_score between 0 and 100),
  scenario_count integer not null default 0,
  scenario_failures integer not null default 0,
  dashboard_elapsed_ms integer not null default 0,
  dashboard_estimated_p95_ms integer not null default 0,
  duplicate_safe boolean not null default false,
  dead_letter_replay_ok boolean not null default false,
  runbooks_ok boolean not null default false,
  checks jsonb not null default '{}'::jsonb,
  scenarios jsonb not null default '[]'::jsonb,
  failure_modes jsonb not null default '[]'::jsonb,
  failures jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists discord_scale_readiness_runs_created_idx
  on public.discord_scale_readiness_runs(created_at desc);

create index if not exists discord_scale_readiness_runs_status_idx
  on public.discord_scale_readiness_runs(status, created_at desc);

alter table public.discord_scale_readiness_runs enable row level security;

drop policy if exists "discord_scale_readiness_runs_admin_all" on public.discord_scale_readiness_runs;
create policy "discord_scale_readiness_runs_admin_all" on public.discord_scale_readiness_runs
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
