-- Discord questions, answers, helpful marks, and manual reputation awards.

create table if not exists public.discord_questions (
  id uuid primary key default gen_random_uuid(),
  discord_user_id text not null,
  discord_username text,
  question text not null,
  context text,
  status text not null default 'open' check (status in ('open', 'answered', 'closed')),
  channel_base_name text not null default 'questions',
  message_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discord_questions_status_idx
  on public.discord_questions(status, created_at desc);

create table if not exists public.discord_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.discord_questions(id) on delete cascade,
  discord_user_id text not null,
  discord_username text,
  answer text not null,
  helpful boolean not null default false,
  helpful_by_discord_user_id text,
  helpful_by_discord_username text,
  points_awarded integer not null default 0,
  message_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discord_answers_question_idx
  on public.discord_answers(question_id, created_at desc);

create table if not exists public.discord_reputation_adjustments (
  id uuid primary key default gen_random_uuid(),
  discord_user_id text not null,
  discord_username text,
  points integer not null,
  reason text not null,
  awarded_by_discord_user_id text,
  awarded_by_discord_username text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists discord_reputation_adjustments_user_idx
  on public.discord_reputation_adjustments(discord_user_id, created_at desc);

alter table public.discord_questions enable row level security;
alter table public.discord_answers enable row level security;
alter table public.discord_reputation_adjustments enable row level security;

drop policy if exists "discord_questions_admin_all" on public.discord_questions;
create policy "discord_questions_admin_all" on public.discord_questions
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "discord_answers_admin_all" on public.discord_answers;
create policy "discord_answers_admin_all" on public.discord_answers
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "discord_reputation_adjustments_admin_all" on public.discord_reputation_adjustments;
create policy "discord_reputation_adjustments_admin_all" on public.discord_reputation_adjustments
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
