-- Tier 0 — the enforcement spine. The append-only evidence ledger the academy's
-- whole "proof, not completion" premise rests on. Unit state and score caps are
-- derived purely from these events (lib/academy/evidence-events-logic.ts +
-- caps-logic.ts). SECURITY: events are written ONLY by the service role after a
-- server-side check (the AI guide grades explain-backs; the lab verifies output).
-- A learner cannot self-emit an event, so they cannot fake state or a score.
-- Contract: docs/academy/DATA_SPINE.md.

create table if not exists academy_evidence_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  lesson_slug text not null,
  unit_id text not null,
  event_type text not null check (event_type in (
    'diagnostic_completed',
    'retrieval_attempted',
    'lesson_completed',
    'sprint_artifact_created',
    'lab_verified',
    'repair_created',
    'repair_completed',
    'transfer_attempted',
    'capstone_submitted',
    'portfolio_item_created',
    'interview_answer_scored'
  )),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- read path: a learner's own timeline, newest first; per-unit derivation lookups.
create index if not exists academy_evidence_events_user_idx
  on academy_evidence_events(user_id, created_at desc);
create index if not exists academy_evidence_events_unit_idx
  on academy_evidence_events(user_id, course_slug, lesson_slug, unit_id, created_at);

alter table academy_evidence_events enable row level security;

-- The learner READS their own evidence (the ledger, the mastery map, the score-cap UI).
drop policy if exists academy_evidence_events_own_read on academy_evidence_events;
create policy academy_evidence_events_own_read on academy_evidence_events
  for select to authenticated using (user_id = auth.uid());

-- NO insert/update/delete policy for authenticated: writes happen ONLY via the
-- service role (which bypasses RLS) inside a verified server action.
-- Structural denial — don't rely only on the absence of a permissive policy:
revoke insert, update, delete on academy_evidence_events from authenticated, anon;

-- Append-only as a DB GUARANTEE, not a convention. The service role bypasses RLS,
-- so without this a future admin endpoint could silently mutate the ledger the
-- learner's proof rests on. No update/delete path exists — at all.
create or replace function prevent_academy_evidence_mutation() returns trigger as $$
begin
  raise exception 'academy_evidence_events is append-only';
end;
$$ language plpgsql;

drop trigger if exists academy_evidence_events_append_only on academy_evidence_events;
create trigger academy_evidence_events_append_only
  before update or delete on academy_evidence_events
  for each row execute function prevent_academy_evidence_mutation();
