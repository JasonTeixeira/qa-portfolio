-- Discord first-week onboarding checklist tracking.

create table if not exists public.discord_member_onboarding_steps (
  id uuid primary key default gen_random_uuid(),
  discord_user_id text not null,
  discord_username text,
  step_key text not null check (step_key in (
    'intro',
    'path',
    'daily',
    'challenge',
    'project',
    'review',
    'capture',
    'win'
  )),
  completed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists discord_member_onboarding_steps_user_step_idx
  on public.discord_member_onboarding_steps(discord_user_id, step_key);

create index if not exists discord_member_onboarding_steps_completed_idx
  on public.discord_member_onboarding_steps(completed_at desc);

alter table public.discord_member_onboarding_steps enable row level security;

drop policy if exists "discord_member_onboarding_steps_admin_all" on public.discord_member_onboarding_steps;
create policy "discord_member_onboarding_steps_admin_all" on public.discord_member_onboarding_steps
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
