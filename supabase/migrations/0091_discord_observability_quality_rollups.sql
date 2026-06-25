-- Phase 17: Discord/SageBot observability, cost, and quality intelligence rollups.

create table if not exists public.discord_observability_rollups (
  id uuid primary key default gen_random_uuid(),
  rollup_key text not null unique,
  window_start timestamptz not null,
  window_end timestamptz not null,
  trace_coverage numeric(5,4) not null default 0 check (trace_coverage between 0 and 1),
  estimated_deepseek_cost_usd numeric(12,6) not null default 0 check (estimated_deepseek_cost_usd >= 0),
  total_prompt_tokens integer not null default 0 check (total_prompt_tokens >= 0),
  total_completion_tokens integer not null default 0 check (total_completion_tokens >= 0),
  total_tokens integer not null default 0 check (total_tokens >= 0),
  rag_answer_count integer not null default 0 check (rag_answer_count >= 0),
  rag_eval_pass_rate numeric(5,4) not null default 0 check (rag_eval_pass_rate between 0 and 1),
  avg_rag_eval_score numeric(5,4) not null default 0 check (avg_rag_eval_score between 0 and 1),
  avg_content_quality numeric(5,2) not null default 0 check (avg_content_quality between 0 and 100),
  avg_premium_quality numeric(5,2) not null default 0 check (avg_premium_quality between 0 and 100),
  job_success_rate numeric(5,4) not null default 0 check (job_success_rate between 0 and 1),
  open_dead_letters integer not null default 0 check (open_dead_letters >= 0),
  health_score integer not null default 0 check (health_score between 0 and 100),
  status text not null default 'watch' check (status in ('healthy', 'watch', 'critical')),
  alerts jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists discord_observability_rollups_created_idx
  on public.discord_observability_rollups(created_at desc);

create index if not exists discord_observability_rollups_status_idx
  on public.discord_observability_rollups(status, created_at desc);

alter table public.discord_observability_rollups enable row level security;

drop policy if exists "discord_observability_rollups_admin_all" on public.discord_observability_rollups;
create policy "discord_observability_rollups_admin_all" on public.discord_observability_rollups
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
