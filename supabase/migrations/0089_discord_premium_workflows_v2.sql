-- Phase 15 premium workflow v2: SLA, assignment, completion, and audit events.

alter table public.discord_premium_review_requests
  add column if not exists sla_due_at timestamptz,
  add column if not exists assigned_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists follow_up_due_at timestamptz,
  add column if not exists response_quality_score integer check (response_quality_score between 0 and 100),
  add column if not exists response_citations jsonb not null default '[]'::jsonb,
  add column if not exists judgment_basis text;

update public.discord_premium_review_requests
set sla_due_at = coalesce(sla_due_at, created_at + interval '48 hours')
where sla_due_at is null;

create index if not exists discord_premium_review_requests_sla_idx
  on public.discord_premium_review_requests(status, sla_due_at asc);

create table if not exists public.discord_premium_workflow_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.discord_premium_review_requests(id) on delete cascade,
  event_type text not null check (event_type in (
    'requested',
    'assigned',
    'answered',
    'completed',
    'follow_up_due',
    'closed',
    'archived'
  )),
  actor text,
  status text,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists discord_premium_workflow_events_request_idx
  on public.discord_premium_workflow_events(request_id, created_at desc);

alter table public.discord_premium_workflow_events enable row level security;

drop policy if exists "discord_premium_workflow_events_admin_all" on public.discord_premium_workflow_events;
create policy "discord_premium_workflow_events_admin_all" on public.discord_premium_workflow_events
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
