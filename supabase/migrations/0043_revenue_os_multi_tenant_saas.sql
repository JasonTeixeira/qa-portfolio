-- Phase 43 — Revenue OS multi-tenant SaaS foundation
-- Adds durable workspaces, memberships, tenant configs, usage, billing
-- boundaries, and audit logs so the acquisition system can be reused for
-- client businesses with tenant-scoped reads and admin-controlled writes.

create table if not exists public.revenue_workspaces (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  tenant_key text not null unique,
  business_name text not null,
  owner_email text not null,
  status text not null default 'trial' check (status in ('trial','active','paused','archived')),
  plan_key text not null default 'client_starter',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.revenue_workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.revenue_workspaces(id) on delete cascade,
  tenant_key text not null,
  email text not null,
  role text not null check (role in ('owner','operator','viewer')),
  status text not null default 'active' check (status in ('invited','active','suspended')),
  invited_at timestamptz,
  accepted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (tenant_key, email)
);

create table if not exists public.revenue_workspace_configs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.revenue_workspaces(id) on delete cascade,
  tenant_key text not null unique,
  icp jsonb not null default '{}'::jsonb,
  offers text[] not null default '{}',
  brand_voice jsonb not null default '{}'::jsonb,
  compliance jsonb not null default '{}'::jsonb,
  lead_sources text[] not null default '{}',
  sending_domains jsonb not null default '[]'::jsonb,
  dashboard_preferences jsonb not null default '{}'::jsonb,
  limits jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.revenue_workspace_usage (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.revenue_workspaces(id) on delete cascade,
  tenant_key text not null,
  period_start date not null,
  period_end date not null,
  leads_limit integer not null default 0,
  emails_limit integer not null default 0,
  api_limit integer not null default 0,
  leads_used integer not null default 0,
  emails_used integer not null default 0,
  api_calls_used integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_workspace_billing_boundaries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.revenue_workspaces(id) on delete cascade,
  tenant_key text not null,
  plan_key text not null default 'client_starter',
  stripe_customer_id text,
  stripe_subscription_id text,
  billing_status text not null default 'trial' check (billing_status in ('internal','trial','active','past_due','canceled')),
  included_usage jsonb not null default '{}'::jsonb,
  metered_usage jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.revenue_workspace_audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.revenue_workspaces(id) on delete cascade,
  tenant_key text not null,
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists revenue_workspace_members_tenant_email_uidx
  on public.revenue_workspace_members(tenant_key, lower(email));

create index if not exists revenue_workspaces_run_idx on public.revenue_workspaces(run_key, created_at desc);
create index if not exists revenue_workspaces_tenant_idx on public.revenue_workspaces(tenant_key);
create index if not exists revenue_workspace_members_email_idx on public.revenue_workspace_members(lower(email), tenant_key);
create index if not exists revenue_workspace_configs_tenant_idx on public.revenue_workspace_configs(tenant_key);
create index if not exists revenue_workspace_usage_tenant_period_idx on public.revenue_workspace_usage(tenant_key, period_start desc);
create index if not exists revenue_workspace_billing_tenant_idx on public.revenue_workspace_billing_boundaries(tenant_key);
create index if not exists revenue_workspace_audit_tenant_idx on public.revenue_workspace_audit_logs(tenant_key, created_at desc);

create or replace function public.revenue_os_is_workspace_member(check_tenant_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.revenue_workspace_members member
    where member.tenant_key = check_tenant_key
      and lower(member.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and member.status = 'active'
  );
$$;

alter table public.revenue_workspaces enable row level security;
alter table public.revenue_workspace_members enable row level security;
alter table public.revenue_workspace_configs enable row level security;
alter table public.revenue_workspace_usage enable row level security;
alter table public.revenue_workspace_billing_boundaries enable row level security;
alter table public.revenue_workspace_audit_logs enable row level security;

drop policy if exists "revenue_workspaces_admin_all" on public.revenue_workspaces;
create policy "revenue_workspaces_admin_all" on public.revenue_workspaces for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_workspaces_member_select" on public.revenue_workspaces;
create policy "revenue_workspaces_member_select" on public.revenue_workspaces for select to authenticated
  using (public.revenue_os_is_workspace_member(tenant_key));

drop policy if exists "revenue_workspace_members_admin_all" on public.revenue_workspace_members;
create policy "revenue_workspace_members_admin_all" on public.revenue_workspace_members for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_workspace_members_member_select" on public.revenue_workspace_members;
create policy "revenue_workspace_members_member_select" on public.revenue_workspace_members for select to authenticated
  using (public.revenue_os_is_workspace_member(tenant_key));

drop policy if exists "revenue_workspace_configs_admin_all" on public.revenue_workspace_configs;
create policy "revenue_workspace_configs_admin_all" on public.revenue_workspace_configs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_workspace_configs_member_select" on public.revenue_workspace_configs;
create policy "revenue_workspace_configs_member_select" on public.revenue_workspace_configs for select to authenticated
  using (public.revenue_os_is_workspace_member(tenant_key));

drop policy if exists "revenue_workspace_usage_admin_all" on public.revenue_workspace_usage;
create policy "revenue_workspace_usage_admin_all" on public.revenue_workspace_usage for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_workspace_usage_member_select" on public.revenue_workspace_usage;
create policy "revenue_workspace_usage_member_select" on public.revenue_workspace_usage for select to authenticated
  using (public.revenue_os_is_workspace_member(tenant_key));

drop policy if exists "revenue_workspace_billing_admin_all" on public.revenue_workspace_billing_boundaries;
create policy "revenue_workspace_billing_admin_all" on public.revenue_workspace_billing_boundaries for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_workspace_billing_member_select" on public.revenue_workspace_billing_boundaries;
create policy "revenue_workspace_billing_member_select" on public.revenue_workspace_billing_boundaries for select to authenticated
  using (public.revenue_os_is_workspace_member(tenant_key));

drop policy if exists "revenue_workspace_audit_admin_all" on public.revenue_workspace_audit_logs;
create policy "revenue_workspace_audit_admin_all" on public.revenue_workspace_audit_logs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_workspace_audit_member_select" on public.revenue_workspace_audit_logs;
create policy "revenue_workspace_audit_member_select" on public.revenue_workspace_audit_logs for select to authenticated
  using (public.revenue_os_is_workspace_member(tenant_key));
