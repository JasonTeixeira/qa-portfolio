-- STAGE 2 — the metric tree. Read-only analytic views over academy_events
-- (0111) + auth.users.created_at (signup). These turn the raw event stream into
-- the numbers that PROVE engagement: activation, retention, DAU, funnels, and
-- per-user journeys.
--
-- SECURITY: these views read auth.users (PII-adjacent: signup timestamps keyed
-- to user ids). They are NOT granted to anon/authenticated. They are consumed
-- ONLY from server code under the service role (lib/academy/metrics.ts), behind
-- the admin gate. No view exposes an email or any free-text — counts, ids,
-- timestamps, and derived minutes/days only.
--
-- Each view is defined with security_invoker = false (the default for views):
-- it executes with the privileges of the view OWNER, so the service role can
-- read auth.users through it without granting table access to app roles.

-- ---------------------------------------------------------------------------
-- academy_metric_user_journey
-- Per user_id: first_seen / last_seen event time, the count of DISTINCT UTC
-- days the user was active (engagement breadth, not just volume), and total
-- events. The spine for a single learner's "how engaged are they" readout.
-- ---------------------------------------------------------------------------
create or replace view academy_metric_user_journey as
select
  e.user_id,
  min(e.occurred_at)                                   as first_seen,
  max(e.occurred_at)                                   as last_seen,
  count(distinct (e.occurred_at at time zone 'UTC')::date) as active_days,
  count(*)                                             as total_events
from academy_events e
group by e.user_id;

-- ---------------------------------------------------------------------------
-- academy_metric_activation
-- Per user: signup time (auth.users.created_at), the time of their FIRST
-- 'first_win' event (the guaranteed early aha), and minutes-to-first-win.
-- minutes_to_first_win is NULL when the user has not had a first_win yet
-- (honest absence — we never impute a win). Includes users with no events.
-- ---------------------------------------------------------------------------
create or replace view academy_metric_activation as
select
  u.id                                                          as user_id,
  u.created_at                                                  as signed_up_at,
  fw.first_win_at                                               as first_win_at,
  case
    when fw.first_win_at is null then null
    else extract(epoch from (fw.first_win_at - u.created_at)) / 60.0
  end                                                           as minutes_to_first_win
from auth.users u
left join (
  select user_id, min(occurred_at) as first_win_at
  from academy_events
  where name = 'first_win'
  group by user_id
) fw on fw.user_id = u.id;

-- ---------------------------------------------------------------------------
-- academy_metric_daily_active
-- UTC date -> distinct active users (DAU). The base time series for engagement
-- trend. A user counts once per UTC day no matter how many events they fire.
-- ---------------------------------------------------------------------------
create or replace view academy_metric_daily_active as
select
  (e.occurred_at at time zone 'UTC')::date  as day,
  count(distinct e.user_id)                 as dau
from academy_events e
group by (e.occurred_at at time zone 'UTC')::date
order by day;

-- ---------------------------------------------------------------------------
-- academy_metric_event_funnel
-- Event name -> total count + distinct users. Lets the admin see which
-- instrumented actions actually fire and how broadly (drop-off across the loop).
-- ---------------------------------------------------------------------------
create or replace view academy_metric_event_funnel as
select
  e.name                      as name,
  count(*)                    as count,
  count(distinct e.user_id)   as distinct_users
from academy_events e
group by e.name
order by count desc;

-- ---------------------------------------------------------------------------
-- academy_metric_retention
-- Per signup-cohort UTC date: cohort size + how many returned on D1 / D7 / D30.
-- A user "returned on Dn" iff they have >=1 event on the UTC day EXACTLY n days
-- after their signup UTC day. Signup = auth.users.created_at. Straightforward,
-- correct classic Dn retention.
-- ---------------------------------------------------------------------------
create or replace view academy_metric_retention as
with cohort as (
  select
    u.id                                          as user_id,
    (u.created_at at time zone 'UTC')::date       as signup_day
  from auth.users u
),
-- distinct UTC days each user was active
active_days as (
  select distinct
    e.user_id,
    (e.occurred_at at time zone 'UTC')::date       as active_day
  from academy_events e
),
-- did each user return exactly n days after signup?
returns as (
  select
    c.user_id,
    c.signup_day,
    max(case when a.active_day = c.signup_day + 1  then 1 else 0 end) as ret_d1,
    max(case when a.active_day = c.signup_day + 7  then 1 else 0 end) as ret_d7,
    max(case when a.active_day = c.signup_day + 30 then 1 else 0 end) as ret_d30
  from cohort c
  left join active_days a on a.user_id = c.user_id
  group by c.user_id, c.signup_day
)
select
  signup_day                       as cohort_date,
  count(*)                         as cohort_size,
  sum(ret_d1)                      as returned_d1,
  sum(ret_d7)                      as returned_d7,
  sum(ret_d30)                     as returned_d30
from returns
group by signup_day
order by signup_day;

-- These views read auth.users (signup timestamps keyed to user ids). Service-role
-- consumption only — never expose to app roles. Structural revoke as a backstop in
-- case the project's default privileges auto-grant new views to authenticated.
revoke select on
  academy_metric_user_journey,
  academy_metric_activation,
  academy_metric_daily_active,
  academy_metric_event_funnel,
  academy_metric_retention
from anon, authenticated;
