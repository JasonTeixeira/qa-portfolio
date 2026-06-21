-- Phase 44 — Revenue OS public API and productization layer
-- Adds tenant-bound hashed API keys, request logs, ingestion events, and
-- signed webhook event storage for external integrations.

create table if not exists public.revenue_api_keys (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.revenue_workspaces(id) on delete cascade,
  tenant_key text not null,
  name text not null,
  key_hash text not null unique,
  key_prefix text not null,
  last_four text not null,
  scopes text[] not null default '{}',
  status text not null default 'active' check (status in ('active','revoked','expired')),
  expires_at timestamptz,
  last_used_at timestamptz,
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.revenue_api_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_key text not null,
  api_key_id uuid references public.revenue_api_keys(id) on delete set null,
  endpoint text not null,
  method text not null,
  status_code integer not null,
  idempotency_key text,
  request_hash text,
  response_summary jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_api_ingestion_events (
  id uuid primary key default gen_random_uuid(),
  tenant_key text not null,
  api_key_id uuid references public.revenue_api_keys(id) on delete set null,
  resource_type text not null check (resource_type in ('lead','job','event','audit','outcome','webhook')),
  external_id text,
  idempotency_key text,
  source text not null default 'public_api',
  status text not null default 'accepted' check (status in ('accepted','duplicate','failed')),
  payload jsonb not null default '{}'::jsonb,
  persisted_refs jsonb not null default '{}'::jsonb,
  error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_api_webhook_events (
  id uuid primary key default gen_random_uuid(),
  tenant_key text not null,
  api_key_id uuid references public.revenue_api_keys(id) on delete set null,
  provider text not null,
  event_type text not null,
  provider_event_id text,
  signature_status text not null check (signature_status in ('valid','invalid','missing')),
  status text not null default 'accepted' check (status in ('accepted','duplicate','ignored','failed')),
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

drop trigger if exists revenue_api_keys_updated_at on public.revenue_api_keys;
create trigger revenue_api_keys_updated_at before update on public.revenue_api_keys
  for each row execute function public.set_updated_at();

create index if not exists revenue_api_keys_tenant_idx on public.revenue_api_keys(tenant_key, status);
create index if not exists revenue_api_keys_prefix_idx on public.revenue_api_keys(key_prefix);
create index if not exists revenue_api_requests_tenant_idx on public.revenue_api_requests(tenant_key, created_at desc);
create index if not exists revenue_api_requests_key_idx on public.revenue_api_requests(api_key_id, created_at desc);
create unique index if not exists revenue_api_requests_idempotency_uidx
  on public.revenue_api_requests(api_key_id, idempotency_key)
  where idempotency_key is not null;
create index if not exists revenue_api_ingestion_tenant_idx
  on public.revenue_api_ingestion_events(tenant_key, resource_type, created_at desc);
create unique index if not exists revenue_api_ingestion_idempotency_uidx
  on public.revenue_api_ingestion_events(tenant_key, resource_type, idempotency_key)
  where idempotency_key is not null;
create unique index if not exists revenue_api_webhook_event_uidx
  on public.revenue_api_webhook_events(tenant_key, provider, provider_event_id)
  where provider_event_id is not null;

alter table public.revenue_api_keys enable row level security;
alter table public.revenue_api_requests enable row level security;
alter table public.revenue_api_ingestion_events enable row level security;
alter table public.revenue_api_webhook_events enable row level security;

drop policy if exists "revenue_api_keys_admin_all" on public.revenue_api_keys;
create policy "revenue_api_keys_admin_all" on public.revenue_api_keys for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_api_keys_member_select" on public.revenue_api_keys;

create or replace view public.revenue_api_keys_redacted
with (security_invoker = true) as
select
  id,
  workspace_id,
  tenant_key,
  name,
  key_prefix,
  last_four,
  scopes,
  status,
  expires_at,
  last_used_at,
  revoked_at,
  metadata,
  created_by,
  created_at,
  updated_at
from public.revenue_api_keys
where public.is_admin((select auth.uid()))
   or public.revenue_os_is_workspace_member(tenant_key);

grant select on public.revenue_api_keys_redacted to authenticated;

drop policy if exists "revenue_api_requests_admin_all" on public.revenue_api_requests;
create policy "revenue_api_requests_admin_all" on public.revenue_api_requests for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_api_requests_member_select" on public.revenue_api_requests;
create policy "revenue_api_requests_member_select" on public.revenue_api_requests for select to authenticated
  using (public.revenue_os_is_workspace_member(tenant_key));

drop policy if exists "revenue_api_ingestion_admin_all" on public.revenue_api_ingestion_events;
create policy "revenue_api_ingestion_admin_all" on public.revenue_api_ingestion_events for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_api_ingestion_member_select" on public.revenue_api_ingestion_events;
create policy "revenue_api_ingestion_member_select" on public.revenue_api_ingestion_events for select to authenticated
  using (public.revenue_os_is_workspace_member(tenant_key));

drop policy if exists "revenue_api_webhook_admin_all" on public.revenue_api_webhook_events;
create policy "revenue_api_webhook_admin_all" on public.revenue_api_webhook_events for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_api_webhook_member_select" on public.revenue_api_webhook_events;
create policy "revenue_api_webhook_member_select" on public.revenue_api_webhook_events for select to authenticated
  using (public.revenue_os_is_workspace_member(tenant_key));
