-- =============================================================================
-- Phase 26 — Studio schema deploy + RLS lockdown
-- =============================================================================
-- Adds the remaining tables for the authenticated Studio (tasks, payments,
-- calendar, time tracking, notifications, audit log, etc.) and turns on Row
-- Level Security with proper admin / client / collaborator policies on every
-- public table that's currently exposed.
--
-- Idempotent: every CREATE uses IF NOT EXISTS, every policy uses DROP ... IF
-- EXISTS first.  Safe to re-run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Helpers (depend on Phase 25 profiles + is_admin function)
-- -----------------------------------------------------------------------------

-- Returns true if the caller is an approved member of the given org
create or replace function public.is_org_member(org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.org_memberships m
    where m.organization_id = org and m.user_id = auth.uid()
  );
$$;

revoke all on function public.is_org_member(uuid) from public;
grant execute on function public.is_org_member(uuid) to anon, authenticated, service_role;

-- Returns true if the caller is admin OR a member of the engagement's org
create or replace function public.can_access_engagement(eng uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin(auth.uid())
    or exists (
      select 1
      from public.engagements e
      join public.org_memberships m on m.organization_id = e.organization_id
      where e.id = eng and m.user_id = auth.uid()
    );
$$;

revoke all on function public.can_access_engagement(uuid) from public;
grant execute on function public.can_access_engagement(uuid) to anon, authenticated, service_role;

-- Generic updated_at trigger (already exists from Phase 25 as set_updated_at)
-- Re-declare in case it's missing
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2. Schema extensions to existing tables
-- -----------------------------------------------------------------------------

-- engagements: add owner, priority, tags, profitability fields
alter table public.engagements
  add column if not exists owner_id uuid references auth.users(id),
  add column if not exists priority text default 'normal' check (priority in ('low','normal','high','urgent')),
  add column if not exists tags text[] default '{}',
  add column if not exists budget_hours numeric,
  add column if not exists actual_hours numeric default 0,
  add column if not exists pipeline_stage text default 'discovery'
    check (pipeline_stage in ('discovery','proposal','contract','active','review','complete','archived')),
  add column if not exists kanban_position integer default 0,
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists engagements_updated_at on public.engagements;
create trigger engagements_updated_at before update on public.engagements
  for each row execute function public.set_updated_at();

-- deliverables: add owner_id, version cursor, approval timestamps
alter table public.deliverables
  add column if not exists assignee_id uuid references auth.users(id),
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references auth.users(id),
  add column if not exists rejection_reason text;

-- invoices: add line item totals, sent_at, dunning fields
alter table public.invoices
  add column if not exists subtotal numeric,
  add column if not exists tax numeric default 0,
  add column if not exists total numeric,
  add column if not exists sent_at timestamptz,
  add column if not exists last_reminder_at timestamptz,
  add column if not exists reminder_count integer default 0,
  add column if not exists notes text;

-- documents: classify legal vs proposal vs SOW etc.
alter table public.documents
  add column if not exists template_id uuid,
  add column if not exists version integer default 1,
  add column if not exists hash_sha256 text;

-- organizations: lifecycle + CRM fields
alter table public.organizations
  add column if not exists pipeline_stage text default 'lead'
    check (pipeline_stage in ('lead','qualified','proposal','active','past','cold')),
  add column if not exists annual_value numeric,
  add column if not exists notes text,
  add column if not exists owner_id uuid references auth.users(id);

-- -----------------------------------------------------------------------------
-- 3. New tables
-- -----------------------------------------------------------------------------

-- 3a. Tasks (under engagements/phases)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid references public.engagements(id) on delete cascade,
  phase_id uuid references public.phases(id) on delete set null,
  parent_task_id uuid references public.tasks(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo'
    check (status in ('todo','in_progress','blocked','review','done','cancelled')),
  priority text default 'normal' check (priority in ('low','normal','high','urgent')),
  assignee_id uuid references auth.users(id),
  reporter_id uuid references auth.users(id),
  due_date date,
  estimate_hours numeric,
  actual_hours numeric default 0,
  position integer default 0,
  tags text[] default '{}',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tasks_engagement on public.tasks(engagement_id);
create index if not exists idx_tasks_assignee on public.tasks(assignee_id);
create index if not exists idx_tasks_status on public.tasks(status);

drop trigger if exists tasks_updated_at on public.tasks;
create trigger tasks_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

-- 3b. Task comments
create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid references auth.users(id),
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_task_comments_task on public.task_comments(task_id);

-- 3c. Task attachments
create table if not exists public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  file_id uuid references public.files(id) on delete cascade,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_task_attachments_task on public.task_attachments(task_id);

-- 3d. Project milestones (high-level deadlines under engagements)
create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  status text not null default 'pending'
    check (status in ('pending','in_progress','complete','missed')),
  position integer default 0,
  reached_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_milestones_engagement on public.project_milestones(engagement_id);

-- 3e. Project status updates (weekly/auto status reports)
create table if not exists public.project_status_updates (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  author_id uuid references auth.users(id),
  summary text not null,
  health text default 'green' check (health in ('green','yellow','red')),
  blockers text,
  next_steps text,
  hours_logged numeric,
  visible_to_client boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_status_updates_engagement on public.project_status_updates(engagement_id);

-- 3f. Deliverable approvals (audit trail of approve/reject decisions per iteration)
create table if not exists public.deliverable_approvals (
  id uuid primary key default gen_random_uuid(),
  deliverable_id uuid not null references public.deliverables(id) on delete cascade,
  iteration_id uuid references public.iterations(id) on delete set null,
  approver_id uuid references auth.users(id),
  decision text not null check (decision in ('approved','changes_requested','rejected')),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists idx_deliv_approvals_deliv on public.deliverable_approvals(deliverable_id);

-- 3g. Contract templates (Phase 31 will populate; create now)
create table if not exists public.contract_templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text check (category in ('legal','proposal','sow','change_order','msa','nda','ip','contractor','other')),
  body_md text,
  variables jsonb default '[]',
  active boolean default true,
  version integer default 1,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists contract_templates_updated_at on public.contract_templates;
create trigger contract_templates_updated_at before update on public.contract_templates
  for each row execute function public.set_updated_at();

-- 3h. Invoice line items
create table if not exists public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric not null default 1,
  unit_price numeric not null,
  amount numeric not null,
  position integer default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_invoice_items_invoice on public.invoice_line_items(invoice_id);

-- 3i. Payments (Stripe payment receipts on invoices)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete set null,
  organization_id uuid references public.organizations(id),
  stripe_payment_intent_id text unique,
  stripe_charge_id text,
  amount numeric not null,
  currency text default 'usd',
  status text not null default 'pending'
    check (status in ('pending','processing','succeeded','failed','refunded')),
  paid_at timestamptz,
  failure_reason text,
  raw_event jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_invoice on public.payments(invoice_id);

-- 3j. Message read receipts (replaces ad-hoc read_by jsonb on messages)
create table if not exists public.message_read_receipts (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  read_at timestamptz not null default now(),
  unique (message_id, user_id)
);

create index if not exists idx_read_receipts_user on public.message_read_receipts(user_id);

-- 3k. Calendar events (FullCalendar.io payload + Google Calendar sync)
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id),
  engagement_id uuid references public.engagements(id) on delete cascade,
  owner_id uuid references auth.users(id),
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean default false,
  event_type text default 'meeting'
    check (event_type in ('meeting','milestone','deadline','internal','client_call','review','other')),
  attendees jsonb default '[]',
  google_event_id text,
  google_calendar_id text,
  google_synced_at timestamptz,
  recurrence_rule text,
  visible_to_client boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_calendar_engagement on public.calendar_events(engagement_id);
create index if not exists idx_calendar_starts_at on public.calendar_events(starts_at);

drop trigger if exists calendar_events_updated_at on public.calendar_events;
create trigger calendar_events_updated_at before update on public.calendar_events
  for each row execute function public.set_updated_at();

-- 3l. Meeting notes
create table if not exists public.meeting_notes (
  id uuid primary key default gen_random_uuid(),
  calendar_event_id uuid references public.calendar_events(id) on delete cascade,
  engagement_id uuid references public.engagements(id) on delete cascade,
  author_id uuid references auth.users(id),
  title text not null,
  body_md text,
  action_items jsonb default '[]',
  recording_url text,
  visible_to_client boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_meeting_notes_event on public.meeting_notes(calendar_event_id);

-- 3m. File versions (preserves history; current file row stays in `files`)
create table if not exists public.file_versions (
  id uuid primary key default gen_random_uuid(),
  file_id uuid not null references public.files(id) on delete cascade,
  version_number integer not null,
  storage_path text not null,
  size_bytes bigint,
  uploaded_by uuid references auth.users(id),
  notes text,
  created_at timestamptz not null default now(),
  unique (file_id, version_number)
);

-- 3n. Time entries
create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  engagement_id uuid references public.engagements(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  description text,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes integer,
  billable boolean default true,
  rate numeric,
  created_at timestamptz not null default now()
);

create index if not exists idx_time_user on public.time_entries(user_id);
create index if not exists idx_time_engagement on public.time_entries(engagement_id);

-- 3o. Notifications (in-app inbox)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  link text,
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_unread on public.notifications(user_id) where read_at is null;

-- 3p. Notification preferences (one row per user)
create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_message boolean default true,
  email_deliverable boolean default true,
  email_invoice boolean default true,
  email_status_report boolean default true,
  email_marketing boolean default false,
  digest_frequency text default 'daily' check (digest_frequency in ('off','daily','weekly')),
  updated_at timestamptz not null default now()
);

drop trigger if exists notif_prefs_updated_at on public.notification_preferences;
create trigger notif_prefs_updated_at before update on public.notification_preferences
  for each row execute function public.set_updated_at();

-- 3q. Audit log (system-wide, write-once)
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  organization_id uuid,
  engagement_id uuid,
  ip_address text,
  user_agent text,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_entity on public.audit_log(entity_type, entity_id);
create index if not exists idx_audit_actor on public.audit_log(actor_id);
create index if not exists idx_audit_created on public.audit_log(created_at desc);

-- -----------------------------------------------------------------------------
-- 4. Enable RLS on every public table that's currently exposed
-- -----------------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.org_memberships enable row level security;
alter table public.engagements enable row level security;
alter table public.phases enable row level security;
alter table public.deliverables enable row level security;
alter table public.iterations enable row level security;
alter table public.invoices enable row level security;
alter table public.threads enable row level security;
alter table public.messages enable row level security;
alter table public.activity enable row level security;
alter table public.files enable row level security;
alter table public.documents enable row level security;
alter table public.signature_audits enable row level security;
alter table public.service_catalog enable row level security;
alter table public.app_users enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- New tables
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_attachments enable row level security;
alter table public.project_milestones enable row level security;
alter table public.project_status_updates enable row level security;
alter table public.deliverable_approvals enable row level security;
alter table public.contract_templates enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.payments enable row level security;
alter table public.message_read_receipts enable row level security;
alter table public.calendar_events enable row level security;
alter table public.meeting_notes enable row level security;
alter table public.file_versions enable row level security;
alter table public.time_entries enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.audit_log enable row level security;

-- -----------------------------------------------------------------------------
-- 5. RLS policies — admin-or-member pattern
-- -----------------------------------------------------------------------------
-- Standard pattern:
--   * SELECT: admin OR member of org (or owner of own row for personal tables)
--   * INSERT/UPDATE/DELETE: admin OR member of org with appropriate role
--   * service_role bypasses RLS by default (server-side actions)

-- ORGANIZATIONS
drop policy if exists "orgs_admin_all" on public.organizations;
create policy "orgs_admin_all" on public.organizations for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "orgs_members_read" on public.organizations;
create policy "orgs_members_read" on public.organizations for select to authenticated
  using (public.is_org_member(id));

-- ORG_MEMBERSHIPS
drop policy if exists "om_admin_all" on public.org_memberships;
create policy "om_admin_all" on public.org_memberships for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "om_self_read" on public.org_memberships;
create policy "om_self_read" on public.org_memberships for select to authenticated
  using (user_id = auth.uid() or public.is_org_member(organization_id));

-- ENGAGEMENTS
drop policy if exists "eng_admin_all" on public.engagements;
create policy "eng_admin_all" on public.engagements for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "eng_members_read" on public.engagements;
create policy "eng_members_read" on public.engagements for select to authenticated
  using (public.is_org_member(organization_id));

-- PHASES (inherit access from engagement)
drop policy if exists "phases_admin_all" on public.phases;
create policy "phases_admin_all" on public.phases for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "phases_members_read" on public.phases;
create policy "phases_members_read" on public.phases for select to authenticated
  using (public.can_access_engagement(engagement_id));

-- DELIVERABLES
drop policy if exists "deliv_admin_all" on public.deliverables;
create policy "deliv_admin_all" on public.deliverables for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "deliv_members_rw" on public.deliverables;
create policy "deliv_members_rw" on public.deliverables for select to authenticated
  using (public.can_access_engagement(engagement_id));

-- ITERATIONS
drop policy if exists "iter_admin_all" on public.iterations;
create policy "iter_admin_all" on public.iterations for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "iter_members_read" on public.iterations;
create policy "iter_members_read" on public.iterations for select to authenticated
  using (
    exists (
      select 1 from public.deliverables d
      where d.id = iterations.deliverable_id
        and public.can_access_engagement(d.engagement_id)
    )
  );

-- INVOICES — clients can read their own org's invoices
drop policy if exists "inv_admin_all" on public.invoices;
create policy "inv_admin_all" on public.invoices for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "inv_members_read" on public.invoices;
create policy "inv_members_read" on public.invoices for select to authenticated
  using (public.is_org_member(organization_id));

-- INVOICE LINE ITEMS
drop policy if exists "ili_admin_all" on public.invoice_line_items;
create policy "ili_admin_all" on public.invoice_line_items for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "ili_members_read" on public.invoice_line_items;
create policy "ili_members_read" on public.invoice_line_items for select to authenticated
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_line_items.invoice_id
        and public.is_org_member(i.organization_id)
    )
  );

-- PAYMENTS
drop policy if exists "pay_admin_all" on public.payments;
create policy "pay_admin_all" on public.payments for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "pay_members_read" on public.payments;
create policy "pay_members_read" on public.payments for select to authenticated
  using (public.is_org_member(organization_id));

-- THREADS
drop policy if exists "thr_admin_all" on public.threads;
create policy "thr_admin_all" on public.threads for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "thr_members_rw" on public.threads;
create policy "thr_members_rw" on public.threads for select to authenticated
  using (public.is_org_member(organization_id));

drop policy if exists "thr_members_insert" on public.threads;
create policy "thr_members_insert" on public.threads for insert to authenticated
  with check (public.is_org_member(organization_id));

-- MESSAGES
drop policy if exists "msg_admin_all" on public.messages;
create policy "msg_admin_all" on public.messages for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "msg_thread_members_read" on public.messages;
create policy "msg_thread_members_read" on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.threads t
      where t.id = messages.thread_id and public.is_org_member(t.organization_id)
    )
  );

drop policy if exists "msg_thread_members_insert" on public.messages;
create policy "msg_thread_members_insert" on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.threads t
      where t.id = messages.thread_id and public.is_org_member(t.organization_id)
    )
  );

-- MESSAGE READ RECEIPTS
drop policy if exists "mrr_self_all" on public.message_read_receipts;
create policy "mrr_self_all" on public.message_read_receipts for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "mrr_admin_read" on public.message_read_receipts;
create policy "mrr_admin_read" on public.message_read_receipts for select to authenticated
  using (public.is_admin(auth.uid()));

-- ACTIVITY (legacy audit-ish)
drop policy if exists "act_admin_all" on public.activity;
create policy "act_admin_all" on public.activity for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "act_members_read" on public.activity;
create policy "act_members_read" on public.activity for select to authenticated
  using (public.is_org_member(organization_id));

-- FILES
drop policy if exists "files_admin_all" on public.files;
create policy "files_admin_all" on public.files for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "files_members_rw" on public.files;
create policy "files_members_rw" on public.files for select to authenticated
  using (public.is_org_member(organization_id));

drop policy if exists "files_members_insert" on public.files;
create policy "files_members_insert" on public.files for insert to authenticated
  with check (uploaded_by = auth.uid() and public.is_org_member(organization_id));

-- FILE VERSIONS
drop policy if exists "fv_admin_all" on public.file_versions;
create policy "fv_admin_all" on public.file_versions for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "fv_members_read" on public.file_versions;
create policy "fv_members_read" on public.file_versions for select to authenticated
  using (
    exists (
      select 1 from public.files f
      where f.id = file_versions.file_id and public.is_org_member(f.organization_id)
    )
  );

-- DOCUMENTS (contracts, NDAs, etc.)
drop policy if exists "docs_admin_all" on public.documents;
create policy "docs_admin_all" on public.documents for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "docs_members_read" on public.documents;
create policy "docs_members_read" on public.documents for select to authenticated
  using (public.is_org_member(organization_id));

-- SIGNATURE AUDITS — only admin and the signer can read
drop policy if exists "sig_admin_all" on public.signature_audits;
create policy "sig_admin_all" on public.signature_audits for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "sig_self_read" on public.signature_audits;
create policy "sig_self_read" on public.signature_audits for select to authenticated
  using (signer_id = auth.uid());

-- SERVICE CATALOG — public read (active rows), admin write
drop policy if exists "svc_public_read" on public.service_catalog;
create policy "svc_public_read" on public.service_catalog for select to anon, authenticated
  using (active = true);

drop policy if exists "svc_admin_all" on public.service_catalog;
create policy "svc_admin_all" on public.service_catalog for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- APP_USERS (legacy Clerk shadow table — admin only)
drop policy if exists "appu_admin_all" on public.app_users;
create policy "appu_admin_all" on public.app_users for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- NEWSLETTER SUBSCRIBERS — admin only
drop policy if exists "ns_admin_all" on public.newsletter_subscribers;
create policy "ns_admin_all" on public.newsletter_subscribers for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- TASKS
drop policy if exists "tasks_admin_all" on public.tasks;
create policy "tasks_admin_all" on public.tasks for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "tasks_members_rw" on public.tasks;
create policy "tasks_members_rw" on public.tasks for select to authenticated
  using (public.can_access_engagement(engagement_id));

drop policy if exists "tasks_members_insert" on public.tasks;
create policy "tasks_members_insert" on public.tasks for insert to authenticated
  with check (public.can_access_engagement(engagement_id));

drop policy if exists "tasks_assignee_update" on public.tasks;
create policy "tasks_assignee_update" on public.tasks for update to authenticated
  using (assignee_id = auth.uid() or reporter_id = auth.uid())
  with check (assignee_id = auth.uid() or reporter_id = auth.uid());

-- TASK COMMENTS
drop policy if exists "tc_admin_all" on public.task_comments;
create policy "tc_admin_all" on public.task_comments for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "tc_members_rw" on public.task_comments;
create policy "tc_members_rw" on public.task_comments for select to authenticated
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_comments.task_id and public.can_access_engagement(t.engagement_id)
    )
  );

drop policy if exists "tc_members_insert" on public.task_comments;
create policy "tc_members_insert" on public.task_comments for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.tasks t
      where t.id = task_comments.task_id and public.can_access_engagement(t.engagement_id)
    )
  );

-- TASK ATTACHMENTS
drop policy if exists "ta_admin_all" on public.task_attachments;
create policy "ta_admin_all" on public.task_attachments for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "ta_members_read" on public.task_attachments;
create policy "ta_members_read" on public.task_attachments for select to authenticated
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_attachments.task_id and public.can_access_engagement(t.engagement_id)
    )
  );

-- PROJECT MILESTONES
drop policy if exists "pm_admin_all" on public.project_milestones;
create policy "pm_admin_all" on public.project_milestones for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "pm_members_read" on public.project_milestones;
create policy "pm_members_read" on public.project_milestones for select to authenticated
  using (public.can_access_engagement(engagement_id));

-- PROJECT STATUS UPDATES — visible_to_client gate
drop policy if exists "psu_admin_all" on public.project_status_updates;
create policy "psu_admin_all" on public.project_status_updates for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "psu_members_read" on public.project_status_updates;
create policy "psu_members_read" on public.project_status_updates for select to authenticated
  using (visible_to_client = true and public.can_access_engagement(engagement_id));

-- DELIVERABLE APPROVALS
drop policy if exists "da_admin_all" on public.deliverable_approvals;
create policy "da_admin_all" on public.deliverable_approvals for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "da_members_read" on public.deliverable_approvals;
create policy "da_members_read" on public.deliverable_approvals for select to authenticated
  using (
    exists (
      select 1 from public.deliverables d
      where d.id = deliverable_approvals.deliverable_id
        and public.can_access_engagement(d.engagement_id)
    )
  );

-- CONTRACT TEMPLATES — admin only (clients never see drafts)
drop policy if exists "ct_admin_all" on public.contract_templates;
create policy "ct_admin_all" on public.contract_templates for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- CALENDAR EVENTS — visible_to_client gate
drop policy if exists "cal_admin_all" on public.calendar_events;
create policy "cal_admin_all" on public.calendar_events for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "cal_members_read" on public.calendar_events;
create policy "cal_members_read" on public.calendar_events for select to authenticated
  using (
    visible_to_client = true
    and (
      public.is_org_member(organization_id)
      or public.can_access_engagement(engagement_id)
    )
  );

-- MEETING NOTES — visible_to_client gate
drop policy if exists "mn_admin_all" on public.meeting_notes;
create policy "mn_admin_all" on public.meeting_notes for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "mn_members_read" on public.meeting_notes;
create policy "mn_members_read" on public.meeting_notes for select to authenticated
  using (visible_to_client = true and public.can_access_engagement(engagement_id));

-- TIME ENTRIES — user owns their own
drop policy if exists "te_admin_all" on public.time_entries;
create policy "te_admin_all" on public.time_entries for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "te_self_all" on public.time_entries;
create policy "te_self_all" on public.time_entries for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- NOTIFICATIONS — user owns their own
drop policy if exists "notif_self_all" on public.notifications;
create policy "notif_self_all" on public.notifications for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "notif_admin_read" on public.notifications;
create policy "notif_admin_read" on public.notifications for select to authenticated
  using (public.is_admin(auth.uid()));

-- NOTIFICATION PREFERENCES — user owns their own
drop policy if exists "np_self_all" on public.notification_preferences;
create policy "np_self_all" on public.notification_preferences for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- AUDIT LOG — admin read only, write via service role
drop policy if exists "al_admin_read" on public.audit_log;
create policy "al_admin_read" on public.audit_log for select to authenticated
  using (public.is_admin(auth.uid()));

-- -----------------------------------------------------------------------------
-- 6. Auto-provision a notification_preferences row whenever a profile is created
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_profile_prefs()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notification_preferences (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists profiles_create_prefs on public.profiles;
create trigger profiles_create_prefs
  after insert on public.profiles
  for each row execute function public.handle_new_profile_prefs();
