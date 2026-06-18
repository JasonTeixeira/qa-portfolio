-- Phase 38 — Revenue OS real website audit automation
-- Stores structured website audit evidence and offer mappings for acquisition
-- accounts so outreach, scoring, and future agents can cite real facts.

create table if not exists public.revenue_website_audit_evidence (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.acquisition_accounts(id) on delete cascade,
  audit_id uuid references public.acquisition_website_audits(id) on delete cascade,
  run_key text not null,
  source_url text not null,
  evidence_key text not null,
  evidence_type text not null
    check (evidence_type in ('http','performance','seo_check','accessibility_check','conversion_check','brand_check')),
  status text not null check (status in ('passed','failed')),
  severity text not null check (severity in ('low','medium','high')),
  label text not null,
  detail text not null,
  observed_at timestamptz not null,
  raw jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_website_audit_offer_mappings (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.acquisition_accounts(id) on delete cascade,
  audit_id uuid references public.acquisition_website_audits(id) on delete cascade,
  run_key text not null,
  source_url text not null,
  audit_score integer not null check (audit_score between 0 and 100),
  recommended_offer text not null,
  close_probability_lift integer not null default 0 check (close_probability_lift between 0 and 100),
  reasons text[] not null default '{}',
  next_action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists revenue_audit_evidence_account_idx
  on public.revenue_website_audit_evidence(account_id, created_at desc);

create index if not exists revenue_audit_evidence_run_idx
  on public.revenue_website_audit_evidence(run_key, created_at desc);

create index if not exists revenue_audit_evidence_severity_idx
  on public.revenue_website_audit_evidence(severity, status);

create index if not exists revenue_audit_offer_account_idx
  on public.revenue_website_audit_offer_mappings(account_id, created_at desc);

create index if not exists revenue_audit_offer_run_idx
  on public.revenue_website_audit_offer_mappings(run_key, created_at desc);

alter table public.revenue_website_audit_evidence enable row level security;
alter table public.revenue_website_audit_offer_mappings enable row level security;

drop policy if exists "revenue_audit_evidence_admin_all" on public.revenue_website_audit_evidence;
create policy "revenue_audit_evidence_admin_all" on public.revenue_website_audit_evidence for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_audit_offer_mappings_admin_all" on public.revenue_website_audit_offer_mappings;
create policy "revenue_audit_offer_mappings_admin_all" on public.revenue_website_audit_offer_mappings for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));
