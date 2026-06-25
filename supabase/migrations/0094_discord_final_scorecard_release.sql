-- Phase 20: Discord AI OS final scorecard, operating rhythm, and release gate evidence.

create table if not exists public.discord_final_scorecard_runs (
  id uuid primary key default gen_random_uuid(),
  run_key text not null unique,
  status text not null default 'passed' check (status in ('passed', 'failed', 'blocked')),
  scorecard_version text not null,
  average_score integer not null default 0 check (average_score between 0 and 100),
  category_count integer not null default 0,
  blocked_below_95 jsonb not null default '[]'::jsonb,
  release_gates jsonb not null default '[]'::jsonb,
  scorecard jsonb not null default '[]'::jsonb,
  operating_rhythm jsonb not null default '{}'::jsonb,
  failures jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists discord_final_scorecard_runs_created_idx
  on public.discord_final_scorecard_runs(created_at desc);

create index if not exists discord_final_scorecard_runs_status_idx
  on public.discord_final_scorecard_runs(status, created_at desc);

alter table public.discord_final_scorecard_runs enable row level security;

drop policy if exists "discord_final_scorecard_runs_admin_all" on public.discord_final_scorecard_runs;
create policy "discord_final_scorecard_runs_admin_all" on public.discord_final_scorecard_runs
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
