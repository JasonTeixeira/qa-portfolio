-- Engagement: collectible achievement badges. Content-agnostic milestones
-- (first lesson, streak thresholds, first/3 certs, course complete, night owl,
-- comeback, etc.). SERVER-AWARDED ONLY — derived from the learner's real stats,
-- never client-claimed (anti-cheat parity with the evidence spine): the learner
-- reads their own badges; inserts happen via the service role after verification.

create table if not exists academy_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_key text not null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_key)
);

create index if not exists academy_badges_user_idx on academy_badges(user_id, earned_at desc);

alter table academy_badges enable row level security;

drop policy if exists academy_badges_own_read on academy_badges;
create policy academy_badges_own_read on academy_badges
  for select to authenticated using (user_id = auth.uid());

-- No insert/update/delete policy for learners: awards happen only via the service
-- role after server-side verification. Structural denial, not just absent policy.
revoke insert, update, delete on academy_badges from authenticated, anon;
