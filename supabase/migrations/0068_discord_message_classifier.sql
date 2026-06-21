-- Discord message classifier: durable labels and quality signals for content/community jobs.

create table if not exists public.discord_message_classifications (
  discord_message_id text primary key references public.discord_messages(discord_message_id) on delete cascade,
  category text not null check (
    category in (
      'question',
      'answer',
      'project',
      'review_request',
      'win',
      'resource',
      'content_seed',
      'support',
      'spam',
      'general'
    )
  ),
  recommended_action text not null check (
    recommended_action in (
      'ignore',
      'track_question',
      'track_answer',
      'candidate_content',
      'candidate_resource',
      'candidate_review',
      'candidate_win',
      'needs_human_review'
    )
  ),
  confidence numeric(5,4) not null default 0 check (confidence >= 0 and confidence <= 1),
  quality_score integer not null default 0 check (quality_score between 0 and 100),
  content_value_score integer not null default 0 check (content_value_score between 0 and 100),
  spam_score integer not null default 0 check (spam_score between 0 and 100),
  signals jsonb not null default '{}'::jsonb,
  rationale text not null default '',
  classifier_version text not null,
  classified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discord_message_classifications_category_idx
  on public.discord_message_classifications(category, classified_at desc);

create index if not exists discord_message_classifications_action_idx
  on public.discord_message_classifications(recommended_action, quality_score desc, classified_at desc);

alter table public.discord_message_classifications enable row level security;

drop policy if exists "discord_message_classifications_admin_all" on public.discord_message_classifications;
create policy "discord_message_classifications_admin_all" on public.discord_message_classifications
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
