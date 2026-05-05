-- =============================================================================
-- Phase 29 — Studio settings singleton
-- =============================================================================
-- Persists global studio configuration (org name, branding, etc.).
-- Single-row table with id pinned to 1 via CHECK constraint.
-- RLS admin-only. Idempotent — safe to re-run.
-- =============================================================================

create table if not exists public.studio_settings (
  id integer primary key default 1 check (id = 1),
  -- Org tab
  org_name text not null default 'Sage Ideas',
  default_tax_rate numeric not null default 0,
  business_hours jsonb not null default '{"mon":"9-17","tue":"9-17","wed":"9-17","thu":"9-17","fri":"9-17","sat":null,"sun":null}'::jsonb,
  -- Branding tab
  logo_url text,
  primary_color text not null default '#06B6D4',
  secondary_color text not null default '#0E7490',
  -- Misc
  notes text,
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists studio_settings_updated_at on public.studio_settings;
create trigger studio_settings_updated_at before update on public.studio_settings
  for each row execute function public.set_updated_at();

-- Seed singleton row
insert into public.studio_settings (id) values (1) on conflict (id) do nothing;

alter table public.studio_settings enable row level security;

drop policy if exists studio_settings_admin_select on public.studio_settings;
create policy studio_settings_admin_select on public.studio_settings
  for select using (public.is_admin(auth.uid()));

drop policy if exists studio_settings_admin_update on public.studio_settings;
create policy studio_settings_admin_update on public.studio_settings
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- No insert/delete policies — singleton is seeded above and enforced by CHECK.
