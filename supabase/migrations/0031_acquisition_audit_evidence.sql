-- Phase 31 — Acquisition audit evidence storage
-- Stores the real SEO/PageSpeed evidence used to create acquisition audit rows.

alter table public.acquisition_website_audits
  add column if not exists raw_report jsonb not null default '{}'::jsonb,
  add column if not exists evidence jsonb not null default '{}'::jsonb,
  add column if not exists public_report_share_id text;

create index if not exists acquisition_audits_public_report_idx
  on public.acquisition_website_audits(public_report_share_id)
  where public_report_share_id is not null;
