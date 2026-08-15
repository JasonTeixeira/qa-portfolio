-- STAGE 2 — the instrumentation spine. The append-friendly product-analytics
-- event stream the academy's *measurement* (activation, retention, funnels,
-- per-user journeys) is derived from. This is the measurement foundation that
-- lets engagement categories ever be PROVEN, not just design-scored.
--
-- Distinct from academy_evidence_events (0104), which is the ENFORCEMENT spine
-- (unit state + score caps derive from it, append-only by DB trigger). This
-- table is the OBSERVATION spine: it never gates a learner, only measures them.
--
-- SECURITY MODEL (anti-cheat parity with the evidence spine):
--   * Writes happen ONLY via the service role, AFTER the real action succeeded
--     server-side (lib/academy/events.ts → emitAcademyEvent). user_id is the
--     authenticated session id, NEVER client/route/form input — so a learner
--     cannot self-emit an event that would inflate their own retention/activation.
--   * A learner READS only their own rows (own-read RLS), for their own journey.
--   * The analytic VIEWS (0112) read auth.users and are service-role only.
--   * No PII in props: counts / ids / enums only — never emails or message text.

create table if not exists academy_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  props jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

-- Read paths: a learner's own timeline newest-first (journey); funnel/DAU scans by name+time.
create index if not exists academy_events_user_time_idx
  on academy_events(user_id, occurred_at desc);
create index if not exists academy_events_name_time_idx
  on academy_events(name, occurred_at desc);

alter table academy_events enable row level security;

-- The learner READS their own event stream (their journey, their activity feed).
drop policy if exists academy_events_own_read on academy_events;
create policy academy_events_own_read on academy_events
  for select to authenticated using (user_id = auth.uid());

-- NO insert/update/delete policy for authenticated/anon: writes happen ONLY via
-- the service role (which bypasses RLS) inside a verified server emit. Structural
-- denial — don't rely only on the absence of a permissive policy:
revoke insert, update, delete on academy_events from authenticated, anon;
