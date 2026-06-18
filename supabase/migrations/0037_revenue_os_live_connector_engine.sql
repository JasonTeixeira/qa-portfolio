-- Phase 37 — Revenue OS live connector engine
-- Stores connector import batches and per-record provenance so lead/job imports
-- can be audited, deduped, quota-limited, and reused across tenants later.

create table if not exists public.revenue_connector_import_batches (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  batch_key text not null,
  connector_key text not null,
  connector_label text not null,
  connector_type text not null check (connector_type in ('lead','job')),
  source_type text not null,
  status text not null check (status in ('completed','empty','failed')),
  found integer not null default 0 check (found >= 0),
  imported integer not null default 0 check (imported >= 0),
  deduped integer not null default 0 check (deduped >= 0),
  quota_skipped integer not null default 0 check (quota_skipped >= 0),
  daily_limit integer not null default 0 check (daily_limit >= 0),
  quota_remaining integer not null default 0 check (quota_remaining >= 0),
  sample jsonb not null default '[]'::jsonb,
  skipped jsonb not null default '[]'::jsonb,
  worker_jobs jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_connector_provenance (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.revenue_connector_import_batches(id) on delete cascade,
  run_key text not null,
  connector_key text not null,
  record_type text not null check (record_type in ('lead','job')),
  dedupe_key text not null,
  source_url text not null,
  discovered_at timestamptz not null,
  fields_collected text[] not null default '{}',
  legal_basis text not null default 'business_context_outreach',
  enrichment_chain jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create unique index if not exists revenue_connector_import_batches_batch_key_unique
  on public.revenue_connector_import_batches(batch_key);

create index if not exists revenue_connector_import_batches_run_idx
  on public.revenue_connector_import_batches(run_key, created_at desc);

create index if not exists revenue_connector_import_batches_source_idx
  on public.revenue_connector_import_batches(source_type, connector_type, created_at desc);

create index if not exists revenue_connector_provenance_run_idx
  on public.revenue_connector_provenance(run_key, created_at desc);

create index if not exists revenue_connector_provenance_dedupe_idx
  on public.revenue_connector_provenance(dedupe_key);

alter table public.revenue_connector_import_batches enable row level security;
alter table public.revenue_connector_provenance enable row level security;

drop policy if exists "revenue_connector_batches_admin_all" on public.revenue_connector_import_batches;
create policy "revenue_connector_batches_admin_all" on public.revenue_connector_import_batches for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_connector_provenance_admin_all" on public.revenue_connector_provenance;
create policy "revenue_connector_provenance_admin_all" on public.revenue_connector_provenance for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));
