-- Discord engagement engine: quizzes, challenges, points, streaks, and content queue.

create table if not exists public.discord_quizzes (
  id uuid primary key default gen_random_uuid(),
  quiz_key text not null unique,
  prompt text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer text not null,
  explanation text,
  path_key text,
  difficulty text not null default 'foundation' check (difficulty in ('foundation', 'builder', 'advanced')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.discord_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_key text not null,
  discord_user_id text not null,
  discord_username text,
  answer text not null,
  correct boolean not null default false,
  points_awarded integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists discord_quiz_attempts_user_idx
  on public.discord_quiz_attempts(discord_user_id, created_at desc);

create table if not exists public.discord_challenges (
  id uuid primary key default gen_random_uuid(),
  challenge_key text not null unique,
  title text not null,
  prompt text not null,
  deliverable text not null,
  points integer not null default 25,
  path_key text,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.discord_challenge_submissions (
  id uuid primary key default gen_random_uuid(),
  challenge_key text not null,
  discord_user_id text not null,
  discord_username text,
  summary text not null,
  link text,
  status text not null default 'submitted' check (status in ('submitted', 'reviewed', 'featured', 'rejected')),
  points_awarded integer not null default 0,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists discord_challenge_submissions_user_idx
  on public.discord_challenge_submissions(discord_user_id, created_at desc);

create table if not exists public.discord_points_ledger (
  id uuid primary key default gen_random_uuid(),
  discord_user_id text not null,
  discord_username text,
  points integer not null,
  reason text not null,
  source text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists discord_points_ledger_user_idx
  on public.discord_points_ledger(discord_user_id, created_at desc);

create index if not exists discord_points_ledger_created_idx
  on public.discord_points_ledger(created_at desc);

create table if not exists public.discord_leaderboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  period_key text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  rankings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists discord_leaderboard_snapshots_period_idx
  on public.discord_leaderboard_snapshots(period_key);

create table if not exists public.discord_content_queue (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_event_id uuid,
  discord_user_id text,
  discord_username text,
  channel_base_name text,
  idea text not null,
  angle text,
  status text not null default 'captured' check (status in ('captured', 'triaged', 'drafted', 'published', 'archived')),
  priority integer not null default 50,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discord_content_queue_status_idx
  on public.discord_content_queue(status, priority desc, created_at desc);

create table if not exists public.discord_member_streaks (
  discord_user_id text primary key,
  discord_username text,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  updated_at timestamptz not null default now()
);

alter table public.discord_quizzes enable row level security;
alter table public.discord_quiz_attempts enable row level security;
alter table public.discord_challenges enable row level security;
alter table public.discord_challenge_submissions enable row level security;
alter table public.discord_points_ledger enable row level security;
alter table public.discord_leaderboard_snapshots enable row level security;
alter table public.discord_content_queue enable row level security;
alter table public.discord_member_streaks enable row level security;

drop policy if exists "discord_quizzes_admin_all" on public.discord_quizzes;
create policy "discord_quizzes_admin_all" on public.discord_quizzes
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "discord_quiz_attempts_admin_all" on public.discord_quiz_attempts;
create policy "discord_quiz_attempts_admin_all" on public.discord_quiz_attempts
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "discord_challenges_admin_all" on public.discord_challenges;
create policy "discord_challenges_admin_all" on public.discord_challenges
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "discord_challenge_submissions_admin_all" on public.discord_challenge_submissions;
create policy "discord_challenge_submissions_admin_all" on public.discord_challenge_submissions
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "discord_points_ledger_admin_all" on public.discord_points_ledger;
create policy "discord_points_ledger_admin_all" on public.discord_points_ledger
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "discord_leaderboard_snapshots_admin_all" on public.discord_leaderboard_snapshots;
create policy "discord_leaderboard_snapshots_admin_all" on public.discord_leaderboard_snapshots
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "discord_content_queue_admin_all" on public.discord_content_queue;
create policy "discord_content_queue_admin_all" on public.discord_content_queue
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "discord_member_streaks_admin_all" on public.discord_member_streaks;
create policy "discord_member_streaks_admin_all" on public.discord_member_streaks
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
