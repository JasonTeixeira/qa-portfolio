-- Discord AI content draft approval workflow.

create table if not exists public.discord_content_drafts (
  id uuid primary key default gen_random_uuid(),
  content_queue_id uuid references public.discord_content_queue(id) on delete set null,
  source_message_id text references public.discord_messages(discord_message_id) on delete set null,
  draft_type text not null default 'daily_signal'
    check (draft_type in ('daily_signal', 'quiz', 'challenge', 'resource_drop', 'weekly_recap', 'social_post', 'lesson', 'announcement')),
  target_channel_base_name text not null default 'daily-signal',
  title text,
  body text not null,
  citations jsonb not null default '[]'::jsonb,
  model text,
  prompt_version text,
  quality_score integer not null default 0 check (quality_score between 0 and 100),
  status text not null default 'pending_approval'
    check (status in ('draft', 'pending_approval', 'approved', 'rejected', 'published', 'archived')),
  reviewer_user_id uuid references auth.users(id),
  reviewer_email text,
  review_note text,
  reviewed_at timestamptz,
  published_message_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discord_content_drafts_status_idx
  on public.discord_content_drafts(status, quality_score desc, created_at desc);

create index if not exists discord_content_drafts_queue_idx
  on public.discord_content_drafts(content_queue_id, created_at desc);

alter table public.discord_content_drafts enable row level security;

drop policy if exists "discord_content_drafts_admin_all" on public.discord_content_drafts;
create policy "discord_content_drafts_admin_all" on public.discord_content_drafts
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
