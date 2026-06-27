-- Tier-engagement: the learner's chosen GOAL (commitment device). One active goal
-- per learner; the "Your Journey" hero measures progress toward it. Learner-owned
-- (RLS own-rows). The goal catalog + milestone math lives in lib/academy/goal-logic.ts.

create table if not exists academy_goals (
  user_id uuid primary key references auth.users(id) on delete cascade,
  goal_key text not null,
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table academy_goals enable row level security;

drop policy if exists academy_goals_own_select on academy_goals;
create policy academy_goals_own_select on academy_goals
  for select to authenticated using (user_id = auth.uid());
drop policy if exists academy_goals_own_insert on academy_goals;
create policy academy_goals_own_insert on academy_goals
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists academy_goals_own_update on academy_goals;
create policy academy_goals_own_update on academy_goals
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
