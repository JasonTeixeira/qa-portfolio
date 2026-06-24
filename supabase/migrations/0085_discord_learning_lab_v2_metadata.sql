-- Phase 11 learning lab v2: persist source grounding and quality gates on live quiz/challenge rows.

alter table public.discord_quizzes
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.discord_challenges
  add column if not exists difficulty text not null default 'foundation'
    check (difficulty in ('foundation', 'builder', 'advanced')),
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists discord_quizzes_metadata_source_idx
  on public.discord_quizzes using gin (metadata);

create index if not exists discord_challenges_metadata_source_idx
  on public.discord_challenges using gin (metadata);
