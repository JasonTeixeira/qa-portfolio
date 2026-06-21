-- Discord premium workflows: priority reviews, deeper answers, and office-hours queue.

create table if not exists public.discord_premium_review_requests (
  id uuid primary key default gen_random_uuid(),
  discord_user_id text not null references public.discord_members(discord_user_id) on delete cascade,
  discord_username text,
  review_type text not null default 'general'
    check (review_type in ('code', 'design', 'ai', 'architecture', 'seo', 'cloud', 'growth', 'general')),
  summary text not null,
  link text,
  priority integer not null default 80 check (priority between 0 and 100),
  status text not null default 'queued'
    check (status in ('queued', 'in_review', 'answered', 'closed', 'archived')),
  assigned_to text,
  response text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discord_premium_review_requests_status_idx
  on public.discord_premium_review_requests(status, priority desc, created_at asc);

create table if not exists public.discord_premium_answer_requests (
  id uuid primary key default gen_random_uuid(),
  discord_user_id text not null references public.discord_members(discord_user_id) on delete cascade,
  discord_username text,
  question text not null,
  context text,
  rag_answer_id uuid references public.rag_answers(id) on delete set null,
  retrieval_log_id uuid references public.rag_retrieval_logs(id) on delete set null,
  model text,
  status text not null default 'answered'
    check (status in ('queued', 'answered', 'needs_human_review', 'closed', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discord_premium_answer_requests_user_idx
  on public.discord_premium_answer_requests(discord_user_id, created_at desc);

create table if not exists public.discord_office_hours_queue (
  id uuid primary key default gen_random_uuid(),
  discord_user_id text not null references public.discord_members(discord_user_id) on delete cascade,
  discord_username text,
  question text not null,
  context text,
  premium_member boolean not null default false,
  priority integer not null default 50 check (priority between 0 and 100),
  status text not null default 'queued'
    check (status in ('queued', 'selected', 'answered', 'closed', 'archived')),
  session_key text,
  answer_summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discord_office_hours_queue_status_idx
  on public.discord_office_hours_queue(status, premium_member desc, priority desc, created_at asc);

alter table public.discord_premium_review_requests enable row level security;
alter table public.discord_premium_answer_requests enable row level security;
alter table public.discord_office_hours_queue enable row level security;

drop policy if exists "discord_premium_review_requests_admin_all" on public.discord_premium_review_requests;
create policy "discord_premium_review_requests_admin_all" on public.discord_premium_review_requests
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "discord_premium_answer_requests_admin_all" on public.discord_premium_answer_requests;
create policy "discord_premium_answer_requests_admin_all" on public.discord_premium_answer_requests
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "discord_office_hours_queue_admin_all" on public.discord_office_hours_queue;
create policy "discord_office_hours_queue_admin_all" on public.discord_office_hours_queue
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
