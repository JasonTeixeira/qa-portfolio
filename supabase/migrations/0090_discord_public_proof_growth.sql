-- Phase 16 public proof growth engine: approved, privacy-gated community source repurposing.

create table if not exists public.discord_public_proof_sources (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('question', 'answer', 'content_queue', 'win', 'recap', 'admin_note')),
  source_table text,
  source_record_id text,
  title text not null,
  summary text not null,
  body text not null,
  permission_status text not null default 'anonymized'
    check (permission_status in ('explicit', 'anonymized', 'blocked')),
  privacy_score integer not null default 100 check (privacy_score between 0 and 100),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discord_public_proof_sources_status_idx
  on public.discord_public_proof_sources(permission_status, privacy_score desc, created_at desc);

create table if not exists public.discord_public_growth_drafts (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.discord_public_proof_sources(id) on delete cascade,
  draft_type text not null check (draft_type in ('article', 'linkedin', 'x_thread', 'newsletter', 'resource_page')),
  title text not null,
  body text not null,
  status text not null default 'pending_approval'
    check (status in ('draft', 'pending_approval', 'approved', 'published', 'rejected', 'archived')),
  privacy_score integer not null default 100 check (privacy_score between 0 and 100),
  quality_score integer not null default 0 check (quality_score between 0 and 100),
  utm_campaign text not null default 'discord_public_proof',
  metadata jsonb not null default '{}'::jsonb,
  reviewer_email text,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discord_public_growth_drafts_status_idx
  on public.discord_public_growth_drafts(status, quality_score desc, created_at desc);

create table if not exists public.discord_growth_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('landing_view', 'apply_click', 'source_created', 'draft_created', 'draft_approved', 'draft_published')),
  source text,
  utm_campaign text,
  path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists discord_growth_events_type_idx
  on public.discord_growth_events(event_type, created_at desc);

alter table public.discord_public_proof_sources enable row level security;
alter table public.discord_public_growth_drafts enable row level security;
alter table public.discord_growth_events enable row level security;

drop policy if exists "discord_public_proof_sources_admin_all" on public.discord_public_proof_sources;
create policy "discord_public_proof_sources_admin_all" on public.discord_public_proof_sources
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "discord_public_growth_drafts_admin_all" on public.discord_public_growth_drafts;
create policy "discord_public_growth_drafts_admin_all" on public.discord_public_growth_drafts
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "discord_growth_events_admin_all" on public.discord_growth_events;
create policy "discord_growth_events_admin_all" on public.discord_growth_events
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
