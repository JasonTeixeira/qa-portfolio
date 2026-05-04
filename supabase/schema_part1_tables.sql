-- Sage Ideas Studio Portal — Part 1: Core tables
-- Paste this entire block into Supabase SQL Editor and click RUN.

create extension if not exists "pgcrypto";

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'client' check (role in ('admin','client')),
  created_at timestamptz default now()
);
create index if not exists app_users_clerk_id_idx on app_users(clerk_id);

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  industry text,
  logo_url text,
  primary_contact_email text,
  status text default 'active' check (status in ('prospect','active','paused','archived')),
  created_at timestamptz default now()
);

create table if not exists org_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  created_at timestamptz default now(),
  unique (user_id, organization_id)
);

create table if not exists engagements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  title text not null,
  service_type text,
  status text default 'active' check (status in ('discovery','active','review','delivered','paused','closed')),
  start_date date,
  target_date date,
  contract_value numeric(12,2),
  description text,
  health text default 'green' check (health in ('green','yellow','red')),
  created_at timestamptz default now()
);

create table if not exists phases (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid references engagements(id) on delete cascade,
  name text not null,
  position int not null,
  status text default 'pending' check (status in ('pending','in_progress','complete','blocked')),
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

create table if not exists deliverables (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid references engagements(id) on delete cascade,
  phase_id uuid references phases(id) on delete set null,
  title text not null,
  description text,
  status text default 'draft' check (status in ('draft','submitted','review','revisions','approved')),
  due_date date,
  current_iteration int default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists iterations (
  id uuid primary key default gen_random_uuid(),
  deliverable_id uuid references deliverables(id) on delete cascade,
  iteration_number int not null,
  notes text,
  submitted_by uuid references app_users(id),
  submitted_at timestamptz default now(),
  status text default 'submitted' check (status in ('submitted','approved','revision_requested')),
  feedback text,
  reviewed_by uuid references app_users(id),
  reviewed_at timestamptz
);

create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  engagement_id uuid references engagements(id) on delete set null,
  iteration_id uuid references iterations(id) on delete set null,
  name text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid references app_users(id),
  created_at timestamptz default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  engagement_id uuid references engagements(id) on delete set null,
  type text default 'contract' check (type in ('contract','sow','nda','amendment','invoice','other')),
  title text not null,
  body_md text,
  storage_path text,
  status text default 'draft' check (status in ('draft','sent','signed','countersigned','void')),
  created_by uuid references app_users(id),
  sent_at timestamptz,
  signed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists signature_audits (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  signer_id uuid references app_users(id),
  signer_name text not null,
  signer_email text not null,
  signature_data text not null,
  ip_address text,
  user_agent text,
  geolocation text,
  signed_at timestamptz default now()
);

create table if not exists threads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  engagement_id uuid references engagements(id) on delete set null,
  subject text not null,
  last_message_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references threads(id) on delete cascade,
  sender_id uuid references app_users(id),
  body text not null,
  attachments jsonb default '[]'::jsonb,
  read_by jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);
create index if not exists messages_thread_idx on messages(thread_id, created_at);

create table if not exists activity (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  engagement_id uuid references engagements(id) on delete set null,
  actor_id uuid references app_users(id),
  type text not null,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists activity_engagement_idx on activity(engagement_id, created_at desc);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  engagement_id uuid references engagements(id) on delete set null,
  stripe_invoice_id text unique,
  stripe_customer_id text,
  number text,
  status text,
  amount_due numeric(12,2),
  amount_paid numeric(12,2),
  currency text default 'usd',
  hosted_invoice_url text,
  invoice_pdf text,
  due_date timestamptz,
  paid_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists service_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  price numeric(12,2),
  recurring boolean default false,
  stripe_price_id text,
  category text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Newsletter subscribers (Phase 15)
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,                         -- where they signed up (homepage, lab, etc.)
  status text default 'active'
    check (status in ('active','unsubscribed','bounced')),
  ip text,
  user_agent text,
  created_at timestamptz default now(),
  unsubscribed_at timestamptz
);
create index if not exists newsletter_subscribers_status_idx on newsletter_subscribers(status);
create index if not exists newsletter_subscribers_created_idx on newsletter_subscribers(created_at desc);
