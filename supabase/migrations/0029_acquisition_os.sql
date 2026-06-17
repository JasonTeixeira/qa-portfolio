-- Phase 29 — Acquisition OS foundation
-- Admin-only revenue pipeline for outbound/inbound business development.
-- This intentionally stores outreach drafts and statuses, not live-send jobs.

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null check (source in ('contact','newsletter','seo_audit','checkout')),
  email text,
  name text,
  detail text not null default '',
  inquiry_type text,
  budget text,
  amount_cents integer,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.leads enable row level security;

drop policy if exists leads_admin_read on public.leads;
create policy leads_admin_read on public.leads
  for select to authenticated
  using (public.is_admin((select auth.uid())));

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_source_idx on public.leads (source);

create table if not exists public.acquisition_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null default 'email'
    check (channel in ('email','linkedin','phone','referral','seo_audit','job_board','partner','other')),
  objective text not null default 'book_call',
  audience text,
  status text not null default 'draft'
    check (status in ('draft','active','paused','complete','archived')),
  daily_target integer not null default 25 check (daily_target >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.acquisition_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  campaign_id uuid references public.acquisition_campaigns(id) on delete set null,
  name text not null,
  website_url text,
  industry text,
  location text,
  company_size text,
  source text not null default 'manual'
    check (source in ('manual','seo_audit','directory','referral','github','linkedin','job_board','inbound','import','other')),
  stage text not null default 'prospect'
    check (stage in ('prospect','qualified','drafted','contacted','follow_up','meeting','proposal','won','lost','do_not_contact')),
  priority text not null default 'medium'
    check (priority in ('low','medium','high','urgent')),
  fit_score integer not null default 0 check (fit_score between 0 and 100),
  urgency_score integer not null default 0 check (urgency_score between 0 and 100),
  revenue_score integer not null default 0 check (revenue_score between 0 and 100),
  total_score integer not null default 0 check (total_score between 0 and 100),
  recommended_offer text,
  pain_summary text,
  next_action text,
  next_action_at timestamptz,
  owner_id uuid references auth.users(id),
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.acquisition_contacts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.acquisition_accounts(id) on delete cascade,
  full_name text,
  title text,
  email text,
  phone text,
  linkedin_url text,
  x_url text,
  role_fit text not null default 'unknown'
    check (role_fit in ('owner','founder','executive','marketing','technical','operations','recruiter','unknown')),
  confidence integer not null default 0 check (confidence between 0 and 100),
  is_primary boolean not null default false,
  source text not null default 'manual',
  last_verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.acquisition_website_audits (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.acquisition_accounts(id) on delete cascade,
  url text not null,
  overall_score integer not null default 0 check (overall_score between 0 and 100),
  performance_score integer check (performance_score between 0 and 100),
  seo_score integer check (seo_score between 0 and 100),
  accessibility_score integer check (accessibility_score between 0 and 100),
  conversion_score integer check (conversion_score between 0 and 100),
  brand_score integer check (brand_score between 0 and 100),
  issues jsonb not null default '[]'::jsonb,
  opportunities jsonb not null default '[]'::jsonb,
  recommended_offer text,
  audit_source text not null default 'manual'
    check (audit_source in ('manual','seo_audit_tool','pagespeed','lighthouse','agent','import')),
  created_at timestamptz not null default now()
);

create table if not exists public.acquisition_outreach_messages (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.acquisition_accounts(id) on delete cascade,
  contact_id uuid references public.acquisition_contacts(id) on delete set null,
  campaign_id uuid references public.acquisition_campaigns(id) on delete set null,
  channel text not null default 'email'
    check (channel in ('email','linkedin','phone','referral','x','other')),
  status text not null default 'draft'
    check (status in ('draft','ready','queued','sent','replied','bounced','declined','booked','archived')),
  subject text,
  body text not null,
  personalization_notes text,
  call_to_action text not null default 'book a 15-minute fit call',
  scheduled_at timestamptz,
  sent_at timestamptz,
  replied_at timestamptz,
  provider_message_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.acquisition_suppression_list (
  id uuid primary key default gen_random_uuid(),
  email text,
  domain text,
  account_id uuid references public.acquisition_accounts(id) on delete cascade,
  reason text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  constraint acquisition_suppression_target_check check (
    email is not null or domain is not null or account_id is not null
  )
);

create table if not exists public.acquisition_daily_metrics (
  metric_date date primary key default current_date,
  accounts_added integer not null default 0,
  accounts_qualified integer not null default 0,
  messages_drafted integer not null default 0,
  messages_sent integer not null default 0,
  replies integer not null default 0,
  meetings_booked integer not null default 0,
  proposals_created integer not null default 0,
  deals_won integer not null default 0,
  estimated_pipeline_value numeric not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists acquisition_campaigns_updated_at on public.acquisition_campaigns;
create trigger acquisition_campaigns_updated_at before update on public.acquisition_campaigns
  for each row execute function public.set_updated_at();

drop trigger if exists acquisition_accounts_updated_at on public.acquisition_accounts;
create trigger acquisition_accounts_updated_at before update on public.acquisition_accounts
  for each row execute function public.set_updated_at();

drop trigger if exists acquisition_contacts_updated_at on public.acquisition_contacts;
create trigger acquisition_contacts_updated_at before update on public.acquisition_contacts
  for each row execute function public.set_updated_at();

drop trigger if exists acquisition_outreach_messages_updated_at on public.acquisition_outreach_messages;
create trigger acquisition_outreach_messages_updated_at before update on public.acquisition_outreach_messages
  for each row execute function public.set_updated_at();

create index if not exists acquisition_accounts_stage_idx on public.acquisition_accounts(stage);
create index if not exists acquisition_accounts_priority_idx on public.acquisition_accounts(priority);
create index if not exists acquisition_accounts_score_idx on public.acquisition_accounts(total_score desc);
create index if not exists acquisition_accounts_next_action_idx on public.acquisition_accounts(next_action_at);
create index if not exists acquisition_accounts_website_idx on public.acquisition_accounts(website_url);
create index if not exists acquisition_contacts_account_idx on public.acquisition_contacts(account_id);
create index if not exists acquisition_contacts_email_idx on public.acquisition_contacts(lower(email));
create index if not exists acquisition_audits_account_idx on public.acquisition_website_audits(account_id);
create index if not exists acquisition_outreach_account_idx on public.acquisition_outreach_messages(account_id);
create index if not exists acquisition_outreach_status_idx on public.acquisition_outreach_messages(status);
create index if not exists acquisition_suppression_email_idx on public.acquisition_suppression_list(lower(email));
create index if not exists acquisition_suppression_domain_idx on public.acquisition_suppression_list(lower(domain));

alter table public.acquisition_campaigns enable row level security;
alter table public.acquisition_accounts enable row level security;
alter table public.acquisition_contacts enable row level security;
alter table public.acquisition_website_audits enable row level security;
alter table public.acquisition_outreach_messages enable row level security;
alter table public.acquisition_suppression_list enable row level security;
alter table public.acquisition_daily_metrics enable row level security;

drop policy if exists "acq_campaigns_admin_all" on public.acquisition_campaigns;
create policy "acq_campaigns_admin_all" on public.acquisition_campaigns for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "acq_accounts_admin_all" on public.acquisition_accounts;
create policy "acq_accounts_admin_all" on public.acquisition_accounts for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "acq_contacts_admin_all" on public.acquisition_contacts;
create policy "acq_contacts_admin_all" on public.acquisition_contacts for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "acq_audits_admin_all" on public.acquisition_website_audits;
create policy "acq_audits_admin_all" on public.acquisition_website_audits for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "acq_outreach_admin_all" on public.acquisition_outreach_messages;
create policy "acq_outreach_admin_all" on public.acquisition_outreach_messages for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "acq_suppression_admin_all" on public.acquisition_suppression_list;
create policy "acq_suppression_admin_all" on public.acquisition_suppression_list for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "acq_metrics_admin_all" on public.acquisition_daily_metrics;
create policy "acq_metrics_admin_all" on public.acquisition_daily_metrics for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));
