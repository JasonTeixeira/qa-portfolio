-- Discord member intelligence rollups for moderation, engagement, and premium routing.

create table if not exists public.discord_member_intelligence_profiles (
  discord_user_id text primary key references public.discord_members(discord_user_id) on delete cascade,
  username text,
  academy_member boolean not null default false,
  premium_member boolean not null default false,
  total_points integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  question_count integer not null default 0,
  answer_count integer not null default 0,
  helpful_answer_count integer not null default 0,
  challenge_submission_count integer not null default 0,
  content_capture_count integer not null default 0,
  onboarding_steps_completed integer not null default 0,
  segment text not null default 'new' check (segment in ('new', 'needs_activation', 'consistent_builder', 'helper', 'premium_candidate', 'premium')),
  next_best_action text not null default 'complete_onboarding',
  strengths jsonb not null default '[]'::jsonb,
  risk_flags jsonb not null default '[]'::jsonb,
  last_activity_at timestamptz,
  calculated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists discord_member_intelligence_segment_idx
  on public.discord_member_intelligence_profiles(segment, total_points desc);

create index if not exists discord_member_intelligence_activity_idx
  on public.discord_member_intelligence_profiles(last_activity_at desc nulls last);

alter table public.discord_member_intelligence_profiles enable row level security;

drop policy if exists "discord_member_intelligence_profiles_admin_all" on public.discord_member_intelligence_profiles;
create policy "discord_member_intelligence_profiles_admin_all" on public.discord_member_intelligence_profiles
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
