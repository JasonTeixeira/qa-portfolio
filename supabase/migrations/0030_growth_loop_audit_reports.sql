-- Program H — shareable audit reports + backlink badge loop.
-- Public rows intentionally exclude visitor email. Email remains only on leads.

create table if not exists public.audit_reports (
  id uuid primary key default gen_random_uuid(),
  share_id text not null unique,
  created_at timestamptz not null default now(),
  url text not null,
  host text not null,
  score integer not null check (score between 0 and 100),
  report jsonb not null,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.audit_reports enable row level security;

drop policy if exists audit_reports_public_read on public.audit_reports;
create policy audit_reports_public_read on public.audit_reports
  for select
  using (true);

drop policy if exists audit_reports_admin_all on public.audit_reports;
create policy audit_reports_admin_all on public.audit_reports
  for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

create index if not exists audit_reports_share_id_idx on public.audit_reports (share_id);
create index if not exists audit_reports_created_at_idx on public.audit_reports (created_at desc);
create index if not exists audit_reports_host_idx on public.audit_reports (host);
