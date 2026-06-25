-- Phase 4: notification log + web-push subscriptions + academy hot-path FK indexes.

create table if not exists academy_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,                 -- streak_save | review_due | league_rollover | ...
  channel text not null,              -- email | push
  sent_at timestamptz not null default now(),
  opened_at timestamptz,
  meta jsonb not null default '{}'::jsonb
);
create index if not exists academy_notifications_user_idx on academy_notifications(user_id, sent_at desc);
create index if not exists academy_notifications_type_idx on academy_notifications(user_id, type, sent_at desc);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
create index if not exists push_subscriptions_user_idx on push_subscriptions(user_id);

alter table academy_notifications enable row level security;
alter table push_subscriptions enable row level security;

-- Own-row read for both; all writes are service-role only (cron + send pipeline).
drop policy if exists academy_notifications_own_read on academy_notifications;
create policy academy_notifications_own_read on academy_notifications
  for select to authenticated using (user_id = auth.uid());

drop policy if exists push_subscriptions_own_read on push_subscriptions;
create policy push_subscriptions_own_read on push_subscriptions
  for select to authenticated using (user_id = auth.uid());

-- Academy hot-path FK indexes (subset of the global index pass — the rows cron/standings scan).
create index if not exists academy_progress_user_idx on academy_progress(user_id);
create index if not exists academy_reviews_due_idx on academy_reviews(user_id, fsrs_due_at);
create index if not exists academy_streaks_active_idx on academy_streaks(last_active_date);
