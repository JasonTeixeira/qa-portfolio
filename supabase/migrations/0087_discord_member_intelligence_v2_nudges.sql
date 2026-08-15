-- Phase 12 member intelligence v2: explainable segments and rate-limited nudge queue.

alter table public.discord_member_intelligence_profiles
  drop constraint if exists discord_member_intelligence_profiles_segment_check;

alter table public.discord_member_intelligence_profiles
  add constraint discord_member_intelligence_profiles_segment_check
  check (segment in (
    'new',
    'needs_activation',
    'consistent_builder',
    'helper',
    'premium_candidate',
    'premium',
    'stuck_onboarding',
    'active_builder',
    'quiet_learner',
    'at_risk_inactive',
    'premium_lead',
    'premium_member',
    'mentor_candidate'
  ));

alter table public.discord_member_intelligence_profiles
  add column if not exists segment_confidence integer not null default 50 check (segment_confidence between 0 and 100),
  add column if not exists segment_reasons jsonb not null default '[]'::jsonb,
  add column if not exists next_nudge_key text,
  add column if not exists next_nudge_reason text,
  add column if not exists nudge_eligible_at timestamptz,
  add column if not exists timeline jsonb not null default '[]'::jsonb;

create table if not exists public.discord_member_nudge_queue (
  id uuid primary key default gen_random_uuid(),
  discord_user_id text not null references public.discord_members(discord_user_id) on delete cascade,
  discord_username text,
  nudge_key text not null,
  reason text not null,
  status text not null default 'queued'
    check (status in ('queued', 'approved', 'sent', 'skipped', 'suppressed')),
  priority integer not null default 50,
  rate_limit_until timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists discord_member_nudge_queue_open_once_idx
  on public.discord_member_nudge_queue(discord_user_id, nudge_key)
  where status in ('queued', 'approved');

create index if not exists discord_member_nudge_queue_status_idx
  on public.discord_member_nudge_queue(status, priority desc, created_at asc);

create index if not exists discord_member_nudge_queue_user_idx
  on public.discord_member_nudge_queue(discord_user_id, created_at desc);

alter table public.discord_member_nudge_queue enable row level security;

drop policy if exists "discord_member_nudge_queue_admin_all" on public.discord_member_nudge_queue;
create policy "discord_member_nudge_queue_admin_all" on public.discord_member_nudge_queue
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
