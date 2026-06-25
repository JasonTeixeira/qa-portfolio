-- Phase 18: Discord security, privacy, abuse, and permission audit evidence.

create table if not exists public.discord_security_audit_runs (
  id uuid primary key default gen_random_uuid(),
  run_key text not null unique,
  status text not null default 'passed' check (status in ('passed', 'failed', 'blocked')),
  audit_version text not null,
  permission_ok boolean not null default false,
  admin_auth_ok boolean not null default false,
  ai_security_ok boolean not null default false,
  privacy_ok boolean not null default false,
  abuse_controls_ok boolean not null default false,
  signature_freshness_ok boolean not null default false,
  rate_limit_ok boolean not null default false,
  checks jsonb not null default '{}'::jsonb,
  failures jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists discord_security_audit_runs_created_idx
  on public.discord_security_audit_runs(created_at desc);

create index if not exists discord_security_audit_runs_status_idx
  on public.discord_security_audit_runs(status, created_at desc);

alter table public.discord_security_audit_runs enable row level security;

drop policy if exists "discord_security_audit_runs_admin_all" on public.discord_security_audit_runs;
create policy "discord_security_audit_runs_admin_all" on public.discord_security_audit_runs
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
