-- Harden quiz scoring so daily quiz participation cannot farm points.

alter table public.discord_points_ledger
  add column if not exists action_key text;

create unique index if not exists discord_points_ledger_action_key_idx
  on public.discord_points_ledger(action_key)
  where action_key is not null;

create unique index if not exists discord_quiz_attempts_once_idx
  on public.discord_quiz_attempts(quiz_key, discord_user_id);
