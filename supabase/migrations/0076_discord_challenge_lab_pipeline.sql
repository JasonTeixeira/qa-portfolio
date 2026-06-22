-- Harden challenge submissions and project lab pipeline.

alter table public.discord_challenge_submissions
  add column if not exists reviewed_by_discord_user_id text,
  add column if not exists reviewed_by_discord_username text,
  add column if not exists review_note text,
  add column if not exists featured_message_id text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.discord_challenge_submissions
  drop constraint if exists discord_challenge_submissions_status_check;

update public.discord_challenge_submissions
set status = 'pending'
where status = 'submitted';

update public.discord_challenge_submissions
set status = 'approved'
where status = 'reviewed';

alter table public.discord_challenge_submissions
  add constraint discord_challenge_submissions_status_check
  check (status in ('pending', 'approved', 'featured', 'rejected'));

create unique index if not exists discord_challenge_submissions_once_idx
  on public.discord_challenge_submissions(challenge_key, discord_user_id);

create index if not exists discord_challenge_submissions_status_idx
  on public.discord_challenge_submissions(status, created_at desc);

create table if not exists public.discord_project_submissions (
  id uuid primary key default gen_random_uuid(),
  discord_user_id text not null,
  discord_username text,
  title text not null,
  path_key text,
  goal text not null,
  link text,
  status text not null default 'submitted'
    check (status in ('submitted', 'queued', 'showcased', 'archived')),
  content_queue_id uuid references public.discord_content_queue(id) on delete set null,
  message_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discord_project_submissions_user_idx
  on public.discord_project_submissions(discord_user_id, created_at desc);

create index if not exists discord_project_submissions_status_idx
  on public.discord_project_submissions(status, created_at desc);

alter table public.discord_project_submissions enable row level security;

drop policy if exists "discord_project_submissions_admin_all" on public.discord_project_submissions;
create policy "discord_project_submissions_admin_all" on public.discord_project_submissions
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
