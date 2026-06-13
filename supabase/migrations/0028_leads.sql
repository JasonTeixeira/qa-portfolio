-- Migration: add leads table for unified pre-sale marketing lead capture.
-- Source values map to the lead capture helper (lib/leads/capture.ts).
-- Service-role inserts from the server bypass RLS; authenticated admins/owners
-- can SELECT via the policy below (matching repo convention from 0022 / 0024).

create table if not exists public.leads (
  id           uuid        primary key default gen_random_uuid(),
  created_at   timestamptz not null    default now(),
  source       text        not null    check (source in ('contact','newsletter','seo_audit','checkout')),
  email        text,
  name         text,
  detail       text        not null    default '',
  inquiry_type text,
  budget       text,
  amount_cents integer,
  metadata     jsonb       not null    default '{}'::jsonb
);

alter table public.leads enable row level security;

-- Authenticated admins and owners can read all leads.
-- Matches the pattern used throughout 0022_phase2f_consolidate_permissive_policies.sql
-- and 0024_phase2f_split_admin_for_all_policies.sql.
create policy leads_admin_read on public.leads
  for select
  using (
    exists (
      select 1 from app_users au
      where au.id = (select auth.uid())
        and au.role = any (array['admin'::text, 'owner'::text])
    )
  );

-- No public INSERT/UPDATE/DELETE policy: all writes go through supabaseAdmin()
-- (service-role key) which bypasses RLS entirely. This is intentional —
-- unauthenticated visitors never write directly to this table.

-- Indexes for the /admin leads list (ordered by recency) and source filtering.
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_source_idx     on public.leads (source);
