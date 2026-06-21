-- Discord content quality evaluations before approval/publishing.

create table if not exists public.discord_content_draft_evaluations (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null references public.discord_content_drafts(id) on delete cascade,
  evaluator_version text not null,
  score integer not null default 0 check (score between 0 and 100),
  passed boolean not null default false,
  gates jsonb not null default '[]'::jsonb,
  reasons jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists discord_content_draft_evaluations_draft_idx
  on public.discord_content_draft_evaluations(draft_id, created_at desc);

create index if not exists discord_content_draft_evaluations_passed_idx
  on public.discord_content_draft_evaluations(passed, score desc, created_at desc);

alter table public.discord_content_draft_evaluations enable row level security;

drop policy if exists "discord_content_draft_evaluations_admin_all" on public.discord_content_draft_evaluations;
create policy "discord_content_draft_evaluations_admin_all" on public.discord_content_draft_evaluations
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
