-- Interview Mastery FOUNDATION — the schema spine for the paid interview-prep add-on.
--
-- Interview Mastery is a separate purchase riding on top of Sage Academy: a measured,
-- converging mock-interview loop (Cockpit → Session → Verdict → Debrief → Schedule) graded
-- by an AI committee against "the bar" for a target level. This migration establishes ALL
-- interview_* tables + RLS in one shot so Phase 0 can scaffold every screen; the AI graders,
-- Stripe checkout, and voice stack land in later phases.
--
-- Honesty / gating stance (mirrors the academy):
--   * NO fabricated readiness or verdicts. Per-user tables ship EMPTY — a new subscriber sees
--     the Cockpit first-run empty state ("No score. No plan. One mock fixes both."), and the
--     rich numbers only render once real interview_sessions / interview_verdicts exist.
--   * Content tables (scenarios / company presets / levels) are seeded, public-read, and
--     written only by the service role — same shape as academy_courses (0080).
--   * Per-user tables are own-row RLS ((select auth.uid()) = user_id) — same shape as
--     academy_progress (0074).
--   * interview_verdicts is READ own-row but has NO client INSERT path: grades are authored
--     server-side by the committee grader (service role), so a learner cannot self-report a
--     strong_hire — same lock as academy_assessments (0103).
--   * interview_subscriptions is written only by the Stripe webhook (service role), read
--     own-row — same shape as academy_allaccess_subscriptions (0084). The add-on GATE ships
--     OFF (INTERVIEW_GATE_ENABLED absent → getInterviewAccess() returns false for everyone).
--
-- Next migration numbers continue 0115–0125 (last shipped: 0114_academy_cert_revocation).

-- ============================================================================
-- 1. CONTENT TABLES  (seeded once · public read where published · service-role write)
-- ============================================================================

-- Company presets first — interview_scenarios references it.
create table if not exists public.interview_company_presets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  rounds jsonb not null default '[]'::jsonb,   -- [{name, track, focus}]
  sim_minutes integer not null default 120,
  style text,                                  -- interviewer temperament for this loop
  status text not null default 'published' check (status in ('draft', 'published')),
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.interview_company_presets enable row level security;
-- Public read of published presets; writes are service-role only (no insert/update policy).
drop policy if exists interview_company_presets_public_read on public.interview_company_presets;
create policy interview_company_presets_public_read on public.interview_company_presets
  for select to anon, authenticated
  using (status = 'published');

-- The question/scenario bank (1,400+ target). Marlowe seeds live in interviewer_prompt.
create table if not exists public.interview_scenarios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  track text not null check (track in ('coding', 'system_design', 'behavioral', 'negotiation')),
  title text not null,
  description text not null,
  est_minutes integer not null default 30,
  difficulty text not null default 'senior'
    check (difficulty in ('all_levels', 'mid_senior', 'senior', 'senior_plus')),
  trains text[] not null default '{}',          -- dimension slugs this scenario attacks
  recommended boolean not null default false,   -- baseline "for you"; real reco is per-user
  interviewer_prompt jsonb not null default '{}'::jsonb, -- Marlowe seed: persona, probe hints, twist config
  seed_code text,                               -- coding starter (e.g. solution.py)
  seed_tests jsonb,                             -- [{name, hidden, passes_for_wrong_reason, expr}] — the "lying" suite
  company_preset_id uuid references public.interview_company_presets(id) on delete set null,
  status text not null default 'published' check (status in ('draft', 'published')),
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.interview_scenarios enable row level security;
-- Public read of published scenarios; writes are service-role only.
drop policy if exists interview_scenarios_public_read on public.interview_scenarios;
create policy interview_scenarios_public_read on public.interview_scenarios
  for select to anon, authenticated
  using (status = 'published');

create index if not exists interview_scenarios_track_idx
  on public.interview_scenarios (track, difficulty, sort);
create index if not exists interview_scenarios_preset_idx
  on public.interview_scenarios (company_preset_id);

-- The bar ladder — a tiny reference table. The six rubric DIMENSIONS are a code constant
-- (lib/academy/interview/rubric.ts), not a table: they never change.
create table if not exists public.interview_levels (
  slug text primary key check (slug in ('intern', 'new_grad', 'mid', 'senior')),
  name text not null,
  bar integer not null,                         -- readiness bar for this level (62/70/77/84)
  blurb text not null default '',
  sort integer not null default 0
);
alter table public.interview_levels enable row level security;
-- Pure reference data — public read for everyone; writes are service-role only.
drop policy if exists interview_levels_public_read on public.interview_levels;
create policy interview_levels_public_read on public.interview_levels
  for select to anon, authenticated
  using (true);

-- ============================================================================
-- 2. PER-USER TABLES  (own-row RLS: (select auth.uid()) = user_id)
-- ============================================================================

-- One row per learner — the onboarding output that targets the whole program.
create table if not exists public.interview_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  target_role text,
  target_level text check (target_level in ('intern', 'new_grad', 'mid', 'senior')),
  target_company text,
  target_date date,                             -- drives days-out + taper
  timeline text check (timeline in ('two_weeks', 'six_weeks', 'three_months', 'no_date')),
  cadence text,
  jd_filename text,
  jd_summary text,
  use_evidence_portfolio boolean not null default false,
  program_week integer,                         -- 'Week 3 of 6' — computed, null until first plan
  program_total_weeks integer,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.interview_profiles enable row level security;
drop policy if exists interview_profiles_own_select on public.interview_profiles;
create policy interview_profiles_own_select on public.interview_profiles
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists interview_profiles_own_insert on public.interview_profiles;
create policy interview_profiles_own_insert on public.interview_profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists interview_profiles_own_update on public.interview_profiles;
create policy interview_profiles_own_update on public.interview_profiles
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists interview_profiles_own_delete on public.interview_profiles;
create policy interview_profiles_own_delete on public.interview_profiles
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Full loop simulation header (rounds are interview_sessions with loop_id set).
-- Created before interview_sessions because sessions reference it.
create table if not exists public.interview_loops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_preset_id uuid references public.interview_company_presets(id) on delete set null,
  scheduled_at timestamptz,
  status text not null default 'planned'
    check (status in ('planned', 'live', 'completed', 'abandoned')),
  overall_verdict text
    check (overall_verdict in ('strong_hire', 'hire', 'lean_hire', 'no_hire', 'strong_no_hire')),
  created_at timestamptz not null default now()
);
alter table public.interview_loops enable row level security;
drop policy if exists interview_loops_own_select on public.interview_loops;
create policy interview_loops_own_select on public.interview_loops
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists interview_loops_own_insert on public.interview_loops;
create policy interview_loops_own_insert on public.interview_loops
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists interview_loops_own_update on public.interview_loops;
create policy interview_loops_own_update on public.interview_loops
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists interview_loops_own_delete on public.interview_loops;
create policy interview_loops_own_delete on public.interview_loops
  for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists interview_loops_user_idx
  on public.interview_loops (user_id, created_at desc);

-- One mock attempt (also each loop round).
create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id uuid references public.interview_scenarios(id) on delete set null, -- null for free placement
  loop_id uuid references public.interview_loops(id) on delete set null,         -- set when part of a loop sim
  track text not null,
  level text not null,
  interviewer_style text not null default 'skeptical'
    check (interviewer_style in ('warm', 'neutral', 'skeptical', 'adversarial')),
  mode text not null default 'voice' check (mode in ('voice', 'typed')),
  is_placement boolean not null default false,
  status text not null default 'live'
    check (status in ('connecting', 'live', 'completed', 'abandoned')),
  phase text,
  question_title text,
  question_body text,
  hint_used boolean not null default false,
  duration_seconds integer not null default 0,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.interview_sessions enable row level security;
drop policy if exists interview_sessions_own_select on public.interview_sessions;
create policy interview_sessions_own_select on public.interview_sessions
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists interview_sessions_own_insert on public.interview_sessions;
create policy interview_sessions_own_insert on public.interview_sessions
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists interview_sessions_own_update on public.interview_sessions;
create policy interview_sessions_own_update on public.interview_sessions
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists interview_sessions_own_delete on public.interview_sessions;
create policy interview_sessions_own_delete on public.interview_sessions
  for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists interview_sessions_user_idx
  on public.interview_sessions (user_id, created_at desc);
create index if not exists interview_sessions_loop_idx
  on public.interview_sessions (loop_id);
create index if not exists interview_sessions_scenario_idx
  on public.interview_sessions (scenario_id);

-- The live transcript (Marlowe + candidate). user_id duplicated for RLS scoping.
create table if not exists public.interview_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  seq integer not null,
  speaker text not null check (speaker in ('interviewer', 'candidate')),
  content text not null,
  ts_seconds integer,                           -- position within the session (→ mm:ss)
  is_hint boolean not null default false,
  created_at timestamptz not null default now(),
  unique (session_id, seq)
);
alter table public.interview_turns enable row level security;
drop policy if exists interview_turns_own_select on public.interview_turns;
create policy interview_turns_own_select on public.interview_turns
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists interview_turns_own_insert on public.interview_turns;
create policy interview_turns_own_insert on public.interview_turns
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists interview_turns_own_update on public.interview_turns;
create policy interview_turns_own_update on public.interview_turns
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists interview_turns_own_delete on public.interview_turns;
create policy interview_turns_own_delete on public.interview_turns
  for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists interview_turns_session_idx
  on public.interview_turns (session_id, seq);

-- Per-session work product (code / whiteboard / negotiation).
create table if not exists public.interview_artifacts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('code', 'whiteboard', 'negotiation')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.interview_artifacts enable row level security;
drop policy if exists interview_artifacts_own_select on public.interview_artifacts;
create policy interview_artifacts_own_select on public.interview_artifacts
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists interview_artifacts_own_insert on public.interview_artifacts;
create policy interview_artifacts_own_insert on public.interview_artifacts
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists interview_artifacts_own_update on public.interview_artifacts;
create policy interview_artifacts_own_update on public.interview_artifacts
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists interview_artifacts_own_delete on public.interview_artifacts;
create policy interview_artifacts_own_delete on public.interview_artifacts
  for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists interview_artifacts_session_idx
  on public.interview_artifacts (session_id);

-- The AI committee grade (one per completed session). READ own-row; NO client INSERT —
-- grades are server-authored via the service role (mirror 0103_academy_assessments_lock_writes).
create table if not exists public.interview_verdicts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.interview_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score integer not null,                       -- 0–100
  prev_score integer,                           -- for the ▲/▼ delta
  verdict text not null
    check (verdict in ('strong_hire', 'hire', 'lean_hire', 'no_hire', 'strong_no_hire')),
  dims jsonb not null,                          -- [{slug, score, delta, bar_status}]
  evidence jsonb not null default '[]'::jsonb,  -- [{ts_seconds, mark, title, note}]
  speech_analytics jsonb,                       -- {wpm, fillers_per_min, talk_ratio, avg_pause} — NULL for typed
  summary_sentence text,
  claims_checked integer,
  words integer,
  created_at timestamptz not null default now()
);
alter table public.interview_verdicts enable row level security;
-- Own-row READ only. There is deliberately NO insert/update/delete policy: the committee
-- grader writes via the service role, so a learner can never self-score a hire.
drop policy if exists interview_verdicts_own_select on public.interview_verdicts;
create policy interview_verdicts_own_select on public.interview_verdicts
  for select to authenticated using ((select auth.uid()) = user_id);

create index if not exists interview_verdicts_user_idx
  on public.interview_verdicts (user_id, created_at desc);

-- Current six-dimension scores (6 rows/user). Overall readiness is DERIVED (min-capped),
-- never stored fabricated. Empty until the first real verdict exists.
create table if not exists public.interview_readiness (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dimension_slug text not null,
  score integer not null,
  trend integer not null default 0,
  bar_status text,                              -- above_bar / at_bar / near_bar / below_bar
  updated_at timestamptz not null default now(),
  unique (user_id, dimension_slug)
);
alter table public.interview_readiness enable row level security;
drop policy if exists interview_readiness_own_select on public.interview_readiness;
create policy interview_readiness_own_select on public.interview_readiness
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists interview_readiness_own_insert on public.interview_readiness;
create policy interview_readiness_own_insert on public.interview_readiness
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists interview_readiness_own_update on public.interview_readiness;
create policy interview_readiness_own_update on public.interview_readiness
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists interview_readiness_own_delete on public.interview_readiness;
create policy interview_readiness_own_delete on public.interview_readiness
  for delete to authenticated using ((select auth.uid()) = user_id);

-- The Progress chart series (one row per graded session/loop). Projection is client-computed
-- and clearly labeled — never persisted as if it were real history.
create table if not exists public.interview_readiness_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  captured_at timestamptz not null default now(),
  overall integer not null,
  dims jsonb not null default '{}'::jsonb,
  event text,                                   -- 'placement' | 'loop 1' | 'today'
  created_at timestamptz not null default now()
);
alter table public.interview_readiness_snapshots enable row level security;
drop policy if exists interview_readiness_snapshots_own_select on public.interview_readiness_snapshots;
create policy interview_readiness_snapshots_own_select on public.interview_readiness_snapshots
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists interview_readiness_snapshots_own_insert on public.interview_readiness_snapshots;
create policy interview_readiness_snapshots_own_insert on public.interview_readiness_snapshots
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists interview_readiness_snapshots_own_update on public.interview_readiness_snapshots;
create policy interview_readiness_snapshots_own_update on public.interview_readiness_snapshots
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists interview_readiness_snapshots_own_delete on public.interview_readiness_snapshots;
create policy interview_readiness_snapshots_own_delete on public.interview_readiness_snapshots
  for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists interview_readiness_snapshots_user_idx
  on public.interview_readiness_snapshots (user_id, captured_at);

-- Debrief → drill plan.
create table if not exists public.interview_drills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  verdict_id uuid references public.interview_verdicts(id) on delete set null,
  scenario_id uuid references public.interview_scenarios(id) on delete set null,
  tag text,
  title text not null,
  meta text,
  status text not null default 'queued' check (status in ('queued', 'done')),
  created_at timestamptz not null default now()
);
alter table public.interview_drills enable row level security;
drop policy if exists interview_drills_own_select on public.interview_drills;
create policy interview_drills_own_select on public.interview_drills
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists interview_drills_own_insert on public.interview_drills;
create policy interview_drills_own_insert on public.interview_drills
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists interview_drills_own_update on public.interview_drills;
create policy interview_drills_own_update on public.interview_drills
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists interview_drills_own_delete on public.interview_drills;
create policy interview_drills_own_delete on public.interview_drills
  for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists interview_drills_user_idx
  on public.interview_drills (user_id, status, created_at desc);

-- Weekly plan / taper slots.
create table if not exists public.interview_schedule (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slot_date date not null,
  slot_time text,
  track text,
  session_type text
    check (session_type in ('hard_rep', 'dress_rehearsal', 'light', 'taper', 'go_time')),
  what text,
  meta text,
  est_minutes integer,
  scenario_id uuid references public.interview_scenarios(id) on delete set null,
  status text not null default 'planned' check (status in ('planned', 'done')),
  created_at timestamptz not null default now()
);
alter table public.interview_schedule enable row level security;
drop policy if exists interview_schedule_own_select on public.interview_schedule;
create policy interview_schedule_own_select on public.interview_schedule
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists interview_schedule_own_insert on public.interview_schedule;
create policy interview_schedule_own_insert on public.interview_schedule
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists interview_schedule_own_update on public.interview_schedule;
create policy interview_schedule_own_update on public.interview_schedule
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists interview_schedule_own_delete on public.interview_schedule;
create policy interview_schedule_own_delete on public.interview_schedule
  for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists interview_schedule_user_idx
  on public.interview_schedule (user_id, slot_date);

-- Reminder toggles.
create table if not exists public.interview_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  kind text,
  enabled boolean not null default true,
  fire_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.interview_reminders enable row level security;
drop policy if exists interview_reminders_own_select on public.interview_reminders;
create policy interview_reminders_own_select on public.interview_reminders
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists interview_reminders_own_insert on public.interview_reminders;
create policy interview_reminders_own_insert on public.interview_reminders
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists interview_reminders_own_update on public.interview_reminders;
create policy interview_reminders_own_update on public.interview_reminders
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists interview_reminders_own_delete on public.interview_reminders;
create policy interview_reminders_own_delete on public.interview_reminders
  for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists interview_reminders_user_idx
  on public.interview_reminders (user_id, fire_at);

-- STAR story bank (8-signal coverage). A gap is a signal with no story yet.
create table if not exists public.interview_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  signal text not null,                         -- ownership | conflict | failure | influence | ...
  title text,
  star jsonb not null default '{}'::jsonb,      -- {situation, task, action, result}
  grade text check (grade in ('lands', 'rough', 'gap')),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.interview_stories enable row level security;
drop policy if exists interview_stories_own_select on public.interview_stories;
create policy interview_stories_own_select on public.interview_stories
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists interview_stories_own_insert on public.interview_stories;
create policy interview_stories_own_insert on public.interview_stories
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists interview_stories_own_update on public.interview_stories;
create policy interview_stories_own_update on public.interview_stories
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists interview_stories_own_delete on public.interview_stories;
create policy interview_stories_own_delete on public.interview_stories
  for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists interview_stories_user_idx
  on public.interview_stories (user_id, signal);

-- Offer tracker.
create table if not exists public.interview_pipeline (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text,
  stage text not null default 'applied'
    check (stage in ('applied', 'recruiter_screen', 'onsite', 'offer', 'rejected')),
  next_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.interview_pipeline enable row level security;
drop policy if exists interview_pipeline_own_select on public.interview_pipeline;
create policy interview_pipeline_own_select on public.interview_pipeline
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists interview_pipeline_own_insert on public.interview_pipeline;
create policy interview_pipeline_own_insert on public.interview_pipeline
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists interview_pipeline_own_update on public.interview_pipeline;
create policy interview_pipeline_own_update on public.interview_pipeline
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists interview_pipeline_own_delete on public.interview_pipeline;
create policy interview_pipeline_own_delete on public.interview_pipeline
  for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists interview_pipeline_user_idx
  on public.interview_pipeline (user_id, stage);

-- AI-generated per-user company brief (only appears after a JD is attached).
create table if not exists public.interview_company_briefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text,
  source_jd_filename text,
  decoded jsonb not null default '[]'::jsonb,   -- [{phrase, means}]
  rounds jsonb not null default '[]'::jsonb,    -- [{name, focus, readiness}]
  edge text,
  risk text,
  queue jsonb not null default '[]'::jsonb,
  confidence text,
  created_at timestamptz not null default now()
);
alter table public.interview_company_briefs enable row level security;
drop policy if exists interview_company_briefs_own_select on public.interview_company_briefs;
create policy interview_company_briefs_own_select on public.interview_company_briefs
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists interview_company_briefs_own_insert on public.interview_company_briefs;
create policy interview_company_briefs_own_insert on public.interview_company_briefs
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists interview_company_briefs_own_update on public.interview_company_briefs;
create policy interview_company_briefs_own_update on public.interview_company_briefs
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists interview_company_briefs_own_delete on public.interview_company_briefs;
create policy interview_company_briefs_own_delete on public.interview_company_briefs
  for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists interview_company_briefs_user_idx
  on public.interview_company_briefs (user_id, created_at desc);

-- Pairs — async peer loops ONLY (Spec §7). No live-room / presence / A-V fields: that is a
-- deliberate scope boundary. peer_user_id is nullable until a match is made.
create table if not exists public.interview_peer_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  peer_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'requested'
    check (status in ('requested', 'matched', 'scheduled', 'completed')),
  track text,
  slot_text text,
  note text,
  created_at timestamptz not null default now()
);
alter table public.interview_peer_matches enable row level security;
drop policy if exists interview_peer_matches_own_select on public.interview_peer_matches;
create policy interview_peer_matches_own_select on public.interview_peer_matches
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists interview_peer_matches_own_insert on public.interview_peer_matches;
create policy interview_peer_matches_own_insert on public.interview_peer_matches
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists interview_peer_matches_own_update on public.interview_peer_matches;
create policy interview_peer_matches_own_update on public.interview_peer_matches
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists interview_peer_matches_own_delete on public.interview_peer_matches;
create policy interview_peer_matches_own_delete on public.interview_peer_matches
  for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists interview_peer_matches_user_idx
  on public.interview_peer_matches (user_id, status);

-- ============================================================================
-- 3. COMMERCE / ENTITLEMENT  (written by the Stripe webhook · service role · read own-row)
-- ============================================================================

-- Mirrors academy_allaccess_subscriptions (0084). auto_pause_at implements the "auto-pause
-- billing 30 days after an offer is logged" promise. The add-on gate reads this via
-- getInterviewAccess(); it ships OFF until INTERVIEW_GATE_ENABLED=true + price IDs are live.
create table if not exists public.interview_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,   -- NULLABLE: Stripe metadata may lack it
  email text not null,
  stripe_subscription_id text not null unique,                -- idempotency / onConflict key
  stripe_customer_id text,
  status text not null,
  plan_interval text not null check (plan_interval in ('monthly', 'yearly')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  auto_pause_at timestamptz,                                  -- set to now()+30d when an offer is logged
  price_amount integer,
  price_currency text not null default 'usd',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.interview_subscriptions enable row level security;
-- Own-row READ only. All writes are service-role (Stripe webhook) → no insert/update policy.
-- Rows with user_id IS NULL are invisible to RLS by design (reachable only by service role).
drop policy if exists interview_subscriptions_own_select on public.interview_subscriptions;
create policy interview_subscriptions_own_select on public.interview_subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);

create index if not exists interview_subscriptions_user_period_idx
  on public.interview_subscriptions (user_id, current_period_end desc);
create index if not exists interview_subscriptions_email_idx
  on public.interview_subscriptions (lower(email));

-- ============================================================================
-- 4. SEED  (idempotent · content only · NO fabricated user data)
-- ============================================================================

-- The bar ladder (Spec §1: intern 62 · new-grad 70 · mid 77 · senior 84).
insert into public.interview_levels (slug, name, bar, blurb, sort) values
  ('intern',   'Intern',           62, 'Coachable, curious, can code a clean solution with guidance.',              1),
  ('new_grad', 'New Grad',         70, 'Solid fundamentals, communicates a plan, verifies before claiming done.', 2),
  ('mid',      'Mid-Level',        77, 'Owns ambiguity, reasons about tradeoffs, proves correctness independently.', 3),
  ('senior',   'Senior',           84, 'Sets direction, defends decisions under pressure, and raises the bar for the room.', 4)
on conflict (slug) do nothing;

-- The four company presets the designs reference.
insert into public.interview_company_presets (slug, name, description, rounds, sim_minutes, style, sort) values
  ('big-tech-loop', 'Big Tech loop',
   'The classic FAANG-style onsite: two coding rounds, a system design, and a behavioral, back to back.',
   '[{"name":"Coding 1","track":"coding","focus":"data structures + verification"},{"name":"Coding 2","track":"coding","focus":"algorithms under time pressure"},{"name":"System Design","track":"system_design","focus":"scale + tradeoffs"},{"name":"Behavioral","track":"behavioral","focus":"ownership + conflict"}]'::jsonb,
   240, 'skeptical', 1),
  ('startup-onsite', 'Startup onsite',
   'Pragmatic and fast: one hands-on build round, one architecture chat, and a values-fit conversation.',
   '[{"name":"Practical build","track":"coding","focus":"ship a working slice"},{"name":"Architecture","track":"system_design","focus":"pragmatic tradeoffs"},{"name":"Values fit","track":"behavioral","focus":"ownership + scrappiness"}]'::jsonb,
   150, 'warm', 2),
  ('fintech-quant', 'Fintech / quant',
   'Precision-first: a correctness-obsessed coding round, a data-modeling round, and a risk-reasoning behavioral.',
   '[{"name":"Correctness coding","track":"coding","focus":"edge cases + proof"},{"name":"Data modeling","track":"system_design","focus":"consistency + latency"},{"name":"Risk reasoning","track":"behavioral","focus":"judgment under uncertainty"}]'::jsonb,
   180, 'adversarial', 3),
  ('ai-lab', 'AI lab',
   'Research-adjacent: a systems-for-ML design, a from-scratch coding round, and a depth-probing technical chat.',
   '[{"name":"ML systems design","track":"system_design","focus":"training + serving at scale"},{"name":"From-scratch coding","track":"coding","focus":"implement, then verify"},{"name":"Technical depth","track":"behavioral","focus":"defend your reasoning"}]'::jsonb,
   180, 'neutral', 4)
on conflict (slug) do nothing;

-- A handful of scenarios INCLUDING the signature the-lying-test-suite.
-- the-lying-test-suite: the seed suite contains one test that passes for the WRONG reason —
-- the candidate is graded on whether they CATCH it, not on a green bar. This is deterministic
-- (evaluated client-side by the Pyodide runner); Marlowe only probes and the grader credits it.
insert into public.interview_scenarios
  (slug, track, title, description, est_minutes, difficulty, trains, recommended, interviewer_prompt, seed_code, seed_tests, sort)
values
  ('the-lying-test-suite', 'coding',
   'The lying test suite',
   'Implement the function so it is actually correct — then convince Marlowe. One test in the provided suite passes for the wrong reason; a green bar is not proof. Find it, or Marlowe will.',
   35, 'senior',
   array['verification_habit', 'technical_depth'], true,
   '{"persona":"Marlowe, a skeptical senior engineer who trusts proof, not prose.","probe_hints":["Ask them to state the invariant before they code.","When the suite goes green, ask which test would fail if the implementation were subtly wrong.","Do not reveal the hidden test."],"twist":{"kind":"lying_test_suite","note":"One seed test asserts a value that is right for the sample input but wrong for the general case."}}'::jsonb,
   'def merge_intervals(intervals):\n    """Merge all overlapping intervals. Return a sorted list of disjoint intervals."""\n    # TODO: implement — then prove it, do not just trust the suite.\n    pass\n',
   '[{"name":"merges_two_overlapping","hidden":false,"passes_for_wrong_reason":false,"expr":"merge_intervals([[1,3],[2,6]]) == [[1,6]]"},{"name":"keeps_disjoint","hidden":false,"passes_for_wrong_reason":false,"expr":"merge_intervals([[1,2],[4,5]]) == [[1,2],[4,5]]"},{"name":"already_sorted_output","hidden":false,"passes_for_wrong_reason":true,"expr":"merge_intervals([[1,4],[2,3]]) == [[1,4]]"},{"name":"unsorted_input","hidden":true,"passes_for_wrong_reason":false,"expr":"merge_intervals([[4,5],[1,3],[2,4]]) == [[1,5]]"}]'::jsonb,
   1),
  ('two-sum-prove-it', 'coding',
   'Two-sum, but prove it',
   'A warm-up with a twist: solve it, then defend your complexity claim and show the one input that breaks a naive solution.',
   25, 'mid_senior',
   array['technical_depth', 'communication', 'verification_habit'], true,
   '{"persona":"Marlowe, neutral but precise.","probe_hints":["Ask for the time complexity and why.","Ask what breaks with duplicate values."]}'::jsonb,
   'def two_sum(nums, target):\n    """Return indices of the two numbers that add up to target."""\n    pass\n',
   '[{"name":"basic","hidden":false,"passes_for_wrong_reason":false,"expr":"sorted(two_sum([2,7,11,15],9)) == [0,1]"},{"name":"duplicates","hidden":true,"passes_for_wrong_reason":false,"expr":"sorted(two_sum([3,3],6)) == [0,1]"}]'::jsonb,
   2),
  ('design-a-rate-limiter', 'system_design',
   'Design a rate limiter',
   'Design a distributed rate limiter for a public API. Marlowe will push on consistency, clock skew, and what happens when the store is unavailable.',
   40, 'senior',
   array['tradeoff_judgment', 'technical_depth', 'problem_framing'], true,
   '{"persona":"Marlowe, a staff engineer who asks about failure modes.","probe_hints":["Force a choice between token bucket and sliding window and make them defend it.","Ask what happens when Redis is down — fail open or closed?"]}'::jsonb,
   null, null, 3),
  ('the-conflict-you-lost', 'behavioral',
   'The conflict you lost',
   'Tell Marlowe about a technical disagreement you did not win. The signal is ownership and influence under a bruised ego — not being right.',
   20, 'all_levels',
   array['communication', 'composure', 'tradeoff_judgment'], true,
   '{"persona":"Marlowe, warm but probing on specifics.","probe_hints":["Push past the summary for the concrete decision and your exact words.","Ask what you would do differently and why."]}'::jsonb,
   null, null, 4),
  ('the-lowball-anchor', 'negotiation',
   'The lowball anchor',
   'The recruiter opens 20% below your number. Hold your anchor, tolerate silence, and expand the offer beyond base — without burning the relationship.',
   20, 'mid_senior',
   array['composure', 'communication', 'tradeoff_judgment'], true,
   '{"persona":"Marlowe as a friendly-but-firm recruiter.","probe_hints":["Open low and see if they flinch.","Reward silence tolerance; penalize accepting the first number."]}'::jsonb,
   null, null, 5)
on conflict (slug) do nothing;

-- End 0115_interview_foundation. Apply is deferred to the orchestrator after a security review.
