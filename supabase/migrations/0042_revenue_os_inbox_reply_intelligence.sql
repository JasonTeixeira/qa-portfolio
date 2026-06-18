-- Phase 42 — Revenue OS inbox and reply intelligence
-- Stores Gmail-style reply sync proof, thread matching, classification,
-- CRM update suggestions, and operator next actions.

create table if not exists public.revenue_inbox_runs (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  tenant_id text,
  provider text not null default 'gmail',
  status text not null default 'completed' check (status in ('queued','running','completed','failed')),
  scorecard jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_inbox_threads (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  tenant_id text,
  thread_key text not null,
  provider text not null default 'gmail',
  account_id uuid references public.acquisition_accounts(id) on delete set null,
  contact_id uuid references public.acquisition_contacts(id) on delete set null,
  sender_email text,
  subject text,
  status text not null default 'open' check (status in ('open','closed','suppressed')),
  last_message_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_inbox_messages (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  tenant_id text,
  thread_key text not null,
  provider text not null default 'gmail',
  external_message_id text not null,
  direction text not null check (direction in ('inbound','outbound')),
  sender_email text,
  subject text,
  body_preview text,
  received_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_inbox_classifications (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  tenant_id text,
  thread_key text not null,
  external_message_id text not null,
  account_id uuid references public.acquisition_accounts(id) on delete set null,
  contact_id uuid references public.acquisition_contacts(id) on delete set null,
  email_queue_id uuid references public.revenue_email_queue(id) on delete set null,
  intent text not null
    check (intent in ('meeting_intent','objection','not_interested','wrong_person','neutral','unsubscribe')),
  sentiment text not null check (sentiment in ('positive','neutral','negative')),
  confidence integer not null default 0 check (confidence between 0 and 100),
  extracted_signals text[] not null default '{}',
  crm_patch jsonb not null default '{}'::jsonb,
  follow_up_suggestion text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_inbox_action_suggestions (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  tenant_id text,
  account_id uuid references public.acquisition_accounts(id) on delete set null,
  contact_id uuid references public.acquisition_contacts(id) on delete set null,
  classification_external_message_id text,
  action_type text not null
    check (action_type in ('book_meeting','reply_follow_up','find_decision_maker','mark_lost','suppress_contact')),
  priority integer not null default 50 check (priority between 0 and 100),
  suggestion text not null,
  status text not null default 'open' check (status in ('open','done','dismissed')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists revenue_inbox_runs_key_idx
  on public.revenue_inbox_runs(run_key, created_at desc);

create index if not exists revenue_inbox_threads_run_idx
  on public.revenue_inbox_threads(run_key, last_message_at desc);

create index if not exists revenue_inbox_messages_run_idx
  on public.revenue_inbox_messages(run_key, received_at desc);

create index if not exists revenue_inbox_classifications_run_idx
  on public.revenue_inbox_classifications(run_key, intent);

create index if not exists revenue_inbox_actions_run_idx
  on public.revenue_inbox_action_suggestions(run_key, priority desc);

alter table public.revenue_inbox_runs enable row level security;
alter table public.revenue_inbox_threads enable row level security;
alter table public.revenue_inbox_messages enable row level security;
alter table public.revenue_inbox_classifications enable row level security;
alter table public.revenue_inbox_action_suggestions enable row level security;

drop policy if exists "revenue_inbox_runs_admin_all" on public.revenue_inbox_runs;
create policy "revenue_inbox_runs_admin_all" on public.revenue_inbox_runs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_inbox_threads_admin_all" on public.revenue_inbox_threads;
create policy "revenue_inbox_threads_admin_all" on public.revenue_inbox_threads for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_inbox_messages_admin_all" on public.revenue_inbox_messages;
create policy "revenue_inbox_messages_admin_all" on public.revenue_inbox_messages for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_inbox_classifications_admin_all" on public.revenue_inbox_classifications;
create policy "revenue_inbox_classifications_admin_all" on public.revenue_inbox_classifications for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "revenue_inbox_action_suggestions_admin_all" on public.revenue_inbox_action_suggestions;
create policy "revenue_inbox_action_suggestions_admin_all" on public.revenue_inbox_action_suggestions for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));
