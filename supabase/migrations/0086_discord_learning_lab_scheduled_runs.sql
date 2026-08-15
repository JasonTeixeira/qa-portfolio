-- Phase 12 scheduled learning lab jobs: allow draft/publish statuses for quiz/challenge activation.

alter table public.discord_scheduled_runs
  drop constraint if exists discord_scheduled_runs_kind_check;

alter table public.discord_scheduled_runs
  add constraint discord_scheduled_runs_kind_check
  check (kind in ('daily_signal', 'weekly_recap', 'learning_lab'));

alter table public.discord_scheduled_runs
  drop constraint if exists discord_scheduled_runs_status_check;

alter table public.discord_scheduled_runs
  add constraint discord_scheduled_runs_status_check
  check (status in ('drafted', 'published', 'posted', 'skipped', 'failed'));
