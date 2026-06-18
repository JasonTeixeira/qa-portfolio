-- Phase 40 — Revenue OS AI personalization evidence locks
-- Persists structured draft versions, evidence citations, and quality gates so
-- AI-assisted outreach remains reviewable, grounded, and blocked from sending
-- when evidence or safety checks fail.

create table if not exists public.revenue_ai_draft_versions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.acquisition_accounts(id) on delete cascade,
  draft_id uuid references public.acquisition_outreach_messages(id) on delete set null,
  run_key text not null,
  provider text not null default 'local_structured',
  model text not null,
  prompt_version text not null,
  subject text not null,
  body text not null,
  send_mode text not null default 'manual_review' check (send_mode in ('manual_review')),
  brand_voice text not null,
  cited_evidence_ids text[] not null default '{}',
  spam_risk integer not null default 0 check (spam_risk between 0 and 100),
  hallucination_risk integer not null default 0 check (hallucination_risk between 0 and 100),
  structured_output jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_ai_evidence_citations (
  id uuid primary key default gen_random_uuid(),
  draft_version_id uuid references public.revenue_ai_draft_versions(id) on delete cascade,
  account_id uuid references public.acquisition_accounts(id) on delete cascade,
  run_key text not null,
  evidence_row_id uuid references public.revenue_website_audit_evidence(id) on delete set null,
  evidence_id text not null,
  claim text not null,
  source_url text,
  evidence_type text,
  observed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_ai_quality_gates (
  id uuid primary key default gen_random_uuid(),
  draft_version_id uuid references public.revenue_ai_draft_versions(id) on delete cascade,
  account_id uuid references public.acquisition_accounts(id) on delete cascade,
  run_key text not null,
  gate_key text not null,
  status text not null check (status in ('pass','fail')),
  severity text not null check (severity in ('low','medium','high')),
  detail text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists revenue_ai_draft_versions_account_idx
  on public.revenue_ai_draft_versions(account_id, created_at desc);

create index if not exists revenue_ai_draft_versions_run_idx
  on public.revenue_ai_draft_versions(run_key, created_at desc);

create index if not exists revenue_ai_citations_draft_idx
  on public.revenue_ai_evidence_citations(draft_version_id, created_at desc);

create index if not exists revenue_ai_citations_run_idx
  on public.revenue_ai_evidence_citations(run_key, evidence_id);

create index if not exists revenue_ai_quality_gates_draft_idx
  on public.revenue_ai_quality_gates(draft_version_id, created_at desc);

create index if not exists revenue_ai_quality_gates_run_idx
  on public.revenue_ai_quality_gates(run_key, status);

alter table public.revenue_ai_draft_versions enable row level security;
alter table public.revenue_ai_evidence_citations enable row level security;
alter table public.revenue_ai_quality_gates enable row level security;

drop policy if exists "revenue_ai_draft_versions_admin_all" on public.revenue_ai_draft_versions;
create policy "revenue_ai_draft_versions_admin_all" on public.revenue_ai_draft_versions for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_ai_citations_admin_all" on public.revenue_ai_evidence_citations;
create policy "revenue_ai_citations_admin_all" on public.revenue_ai_evidence_citations for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_ai_quality_gates_admin_all" on public.revenue_ai_quality_gates;
create policy "revenue_ai_quality_gates_admin_all" on public.revenue_ai_quality_gates for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));
