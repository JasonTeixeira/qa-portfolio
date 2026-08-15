-- Academy AI tutor cross-session memory. ONE row per learner — the tutor's
-- durable continuity store (topics struggled with, a short rolling summary, and
-- the last lesson context) so it greets and helps with memory across sessions.
--
-- SECURITY (same anti-cheat discipline as the evidence spine, 0104):
--   * The learner READS their own row under RLS (powers the proactive opener).
--   * The learner CANNOT write: no insert/update/delete policy for authenticated,
--     and those grants are revoked structurally. Every write happens ONLY via the
--     service role (which bypasses RLS) inside a verified server turn
--     (lib/academy/tutor.ts → persistTutorMemory). Memory is server-verified and
--     not client-forgeable.
--
-- BOUNDED by construction: exactly one row per user (PK = user_id, upsert), the
-- app caps struggles (<=5) and clamps the summary (<=600 chars) before writing
-- (lib/academy/tutor-logic.ts normalizeTutorMemory), and CHECK constraints here
-- are a hard backstop so a buggy/compromised writer can't bloat the row.

create table if not exists academy_tutor_memory (
  user_id uuid primary key references auth.users(id) on delete cascade,
  -- Short topic phrases the learner has struggled with, newest-first. App caps
  -- length; the DB backstops the array size + total payload.
  struggles text[] not null default '{}'::text[]
    check (array_length(struggles, 1) is null or array_length(struggles, 1) <= 10),
  -- A short rolling natural-language summary of where the learner is.
  summary text not null default ''
    check (char_length(summary) <= 1000),
  last_course_slug text,
  last_lesson_slug text,
  updated_at timestamptz not null default now()
);

alter table academy_tutor_memory enable row level security;

-- The learner READS their own memory (the proactive opener / continuity surface).
drop policy if exists academy_tutor_memory_own_read on academy_tutor_memory;
create policy academy_tutor_memory_own_read on academy_tutor_memory
  for select to authenticated using (user_id = auth.uid());

-- NO insert/update/delete policy for authenticated: writes happen ONLY via the
-- service role (bypasses RLS) inside a verified server turn. Structural denial —
-- don't rely only on the absence of a permissive policy:
revoke insert, update, delete on academy_tutor_memory from authenticated, anon;
