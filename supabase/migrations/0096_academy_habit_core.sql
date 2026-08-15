-- Phase 1 (Habit core) data model: streaks, XP/levels, daily goals, FSRS review
-- cards, onboarding. See docs/academy/BUILD_AND_TEST_PLAN.md.
--
-- INTEGRITY: streaks / xp / reviews / daily_goals are READ own-row but WRITTEN
-- only by the service role (the server-side award logic) — a learner must NOT be
-- able to write their own XP/streak directly (anti-cheat). Onboarding is the
-- learner's own preference, so it's own-row read+write.

-- ── streaks ────────────────────────────────────────────────────────────────
create table if not exists public.academy_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  current_length integer not null default 0,
  longest_length integer not null default 0,
  last_active_date date,
  timezone text not null default 'UTC',
  freezes_available integer not null default 2,
  freeze_used_dates date[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.academy_streaks enable row level security;
drop policy if exists academy_streaks_own_select on public.academy_streaks;
create policy academy_streaks_own_select on public.academy_streaks
  for select to authenticated using ((select auth.uid()) = user_id);

-- ── xp / levels ────────────────────────────────────────────────────────────
create table if not exists public.academy_xp (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  total_xp integer not null default 0,
  weekly_xp integer not null default 0,
  week_start date,
  level integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists academy_xp_weekly_idx on public.academy_xp (week_start, weekly_xp desc);
alter table public.academy_xp enable row level security;
drop policy if exists academy_xp_own_select on public.academy_xp;
create policy academy_xp_own_select on public.academy_xp
  for select to authenticated using ((select auth.uid()) = user_id);

-- ── daily goal ─────────────────────────────────────────────────────────────
create table if not exists public.academy_daily_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  goal_xp integer not null default 30,
  today_date date,
  today_xp integer not null default 0,
  last_met_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.academy_daily_goals enable row level security;
drop policy if exists academy_daily_goals_own_select on public.academy_daily_goals;
create policy academy_daily_goals_own_select on public.academy_daily_goals
  for select to authenticated using ((select auth.uid()) = user_id);

-- ── FSRS review cards ──────────────────────────────────────────────────────
create table if not exists public.academy_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  concept_key text not null,
  course_slug text,
  lesson_slug text,
  prompt text,
  fsrs_difficulty numeric,
  fsrs_stability numeric,
  fsrs_state integer not null default 0,
  fsrs_due_at timestamptz not null default now(),
  reps integer not null default 0,
  lapses integer not null default 0,
  last_grade integer,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, concept_key)
);
create index if not exists academy_reviews_due_idx on public.academy_reviews (user_id, fsrs_due_at);
alter table public.academy_reviews enable row level security;
drop policy if exists academy_reviews_own_select on public.academy_reviews;
create policy academy_reviews_own_select on public.academy_reviews
  for select to authenticated using ((select auth.uid()) = user_id);

-- ── onboarding (learner's own prefs — own-row read+write) ──────────────────
create table if not exists public.academy_onboarding (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  goal text,
  motivation text,
  calibration_level text,
  daily_goal_xp integer,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.academy_onboarding enable row level security;
drop policy if exists academy_onboarding_own_select on public.academy_onboarding;
create policy academy_onboarding_own_select on public.academy_onboarding
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists academy_onboarding_own_insert on public.academy_onboarding;
create policy academy_onboarding_own_insert on public.academy_onboarding
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists academy_onboarding_own_update on public.academy_onboarding;
create policy academy_onboarding_own_update on public.academy_onboarding
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
