-- Discord member approval gate: applications, rules acceptance, and manual approval.

create table if not exists public.discord_member_applications (
  id uuid primary key default gen_random_uuid(),
  discord_user_id text not null,
  discord_username text,
  goal text not null,
  experience text not null,
  intended_build text not null,
  rules_accepted boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_discord_user_id text,
  reviewer_discord_username text,
  review_note text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists discord_member_applications_status_idx
  on public.discord_member_applications(status, submitted_at desc);

create index if not exists discord_member_applications_user_idx
  on public.discord_member_applications(discord_user_id, submitted_at desc);

create unique index if not exists discord_member_applications_pending_user_idx
  on public.discord_member_applications(discord_user_id)
  where status = 'pending';

alter table public.discord_member_applications enable row level security;

drop policy if exists "discord_member_applications_admin_all" on public.discord_member_applications;
create policy "discord_member_applications_admin_all" on public.discord_member_applications
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
