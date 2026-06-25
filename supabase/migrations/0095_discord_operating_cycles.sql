-- Phase 21: weekly operating proof cycles for real corpus, growth, metrics, and scorecard cadence.

create table if not exists public.discord_operating_cycles (
  id uuid primary key default gen_random_uuid(),
  cycle_key text not null,
  status text not null check (status in ('passed', 'blocked', 'failed')),
  metrics_before jsonb not null default '{}'::jsonb,
  metrics_after jsonb not null default '{}'::jsonb,
  rag_sync jsonb not null default '{}'::jsonb,
  public_proof jsonb not null default '{}'::jsonb,
  final_scorecard jsonb not null default '{}'::jsonb,
  gates jsonb not null default '[]'::jsonb,
  next_actions jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists discord_operating_cycles_cycle_idx
  on public.discord_operating_cycles(cycle_key, created_at desc);

create index if not exists discord_operating_cycles_status_idx
  on public.discord_operating_cycles(status, created_at desc);

alter table public.discord_operating_cycles enable row level security;

drop policy if exists "discord_operating_cycles_admin_all" on public.discord_operating_cycles;
create policy "discord_operating_cycles_admin_all" on public.discord_operating_cycles
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
