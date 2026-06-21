-- Discord onboarding profile: richer application intake and member routing state.

alter table public.discord_member_applications
  add column if not exists path_key text,
  add column if not exists level_key text,
  add column if not exists timezone text,
  add column if not exists weekly_time_budget text,
  add column if not exists primary_goal text,
  add column if not exists preferred_support text,
  add column if not exists portfolio_url text,
  add column if not exists referral_source text;

create index if not exists discord_member_applications_path_idx
  on public.discord_member_applications(path_key, status, submitted_at desc);

alter table public.discord_members
  add column if not exists timezone text,
  add column if not exists weekly_time_budget text,
  add column if not exists primary_goal text,
  add column if not exists preferred_support text,
  add column if not exists portfolio_url text,
  add column if not exists referral_source text,
  add column if not exists onboarding_completed_at timestamptz;

create index if not exists discord_members_path_level_idx
  on public.discord_members(path_key, level_key);
