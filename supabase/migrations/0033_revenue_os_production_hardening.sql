-- Phase 33 — Revenue OS production hardening
-- Adds idempotency keys and uniqueness constraints needed for retries,
-- duplicate webhooks, repeated connector runs, and daily automation.

alter table public.revenue_lead_sources
  add column if not exists source_key text;

update public.revenue_lead_sources
set source_key = lower(source_type || ':' || coalesce(nullif(trim(query), ''), name))
where source_key is null;

alter table public.revenue_lead_source_runs
  add column if not exists idempotency_key text;

alter table public.revenue_job_opportunities
  add column if not exists external_id text,
  add column if not exists idempotency_key text;

update public.revenue_job_opportunities
set idempotency_key = lower(source || ':' || coalesce(nullif(trim(job_url), ''), company || ':' || title))
where idempotency_key is null;

alter table public.revenue_job_applications
  add column if not exists idempotency_key text;

update public.revenue_job_applications
set idempotency_key = coalesce(job_id::text, id::text) || ':' || coalesce(resume_variant, 'default')
where idempotency_key is null;

alter table public.revenue_email_queue
  add column if not exists idempotency_key text;

update public.revenue_email_queue
set idempotency_key = coalesce(outreach_message_id::text, id::text) || ':' || coalesce(sequence_key, 'manual') || ':' || step_number::text
where idempotency_key is null;

alter table public.revenue_email_events
  add column if not exists provider_event_id text;

alter table public.revenue_daily_runs
  add column if not exists idempotency_key text;

update public.revenue_daily_runs
set idempotency_key = mode || ':' || run_date::text || ':' || coalesce(metadata->>'runKey', id::text)
where idempotency_key is null;

with ranked as (
  select id, row_number() over (partition by source_key order by created_at, id) as rn
  from public.revenue_lead_sources
  where source_key is not null
)
update public.revenue_lead_sources target
set source_key = target.source_key || ':' || target.id::text
from ranked
where target.id = ranked.id and ranked.rn > 1;

with ranked as (
  select id, row_number() over (partition by idempotency_key order by created_at, id) as rn
  from public.revenue_lead_source_runs
  where idempotency_key is not null
)
update public.revenue_lead_source_runs target
set idempotency_key = target.idempotency_key || ':' || target.id::text
from ranked
where target.id = ranked.id and ranked.rn > 1;

with ranked as (
  select id, row_number() over (partition by idempotency_key order by created_at, id) as rn
  from public.revenue_job_opportunities
  where idempotency_key is not null
)
update public.revenue_job_opportunities target
set idempotency_key = target.idempotency_key || ':' || target.id::text
from ranked
where target.id = ranked.id and ranked.rn > 1;

with ranked as (
  select id, row_number() over (partition by source, external_id order by created_at, id) as rn
  from public.revenue_job_opportunities
  where external_id is not null
)
update public.revenue_job_opportunities target
set external_id = target.external_id || ':' || target.id::text
from ranked
where target.id = ranked.id and ranked.rn > 1;

with ranked as (
  select id, row_number() over (partition by idempotency_key order by created_at, id) as rn
  from public.revenue_job_applications
  where idempotency_key is not null
)
update public.revenue_job_applications target
set idempotency_key = target.idempotency_key || ':' || target.id::text
from ranked
where target.id = ranked.id and ranked.rn > 1;

with ranked as (
  select id, row_number() over (partition by idempotency_key order by created_at, id) as rn
  from public.revenue_email_queue
  where idempotency_key is not null
)
update public.revenue_email_queue target
set idempotency_key = target.idempotency_key || ':' || target.id::text
from ranked
where target.id = ranked.id and ranked.rn > 1;

with ranked as (
  select id, row_number() over (partition by provider_event_id order by created_at, id) as rn
  from public.revenue_email_events
  where provider_event_id is not null
)
update public.revenue_email_events target
set provider_event_id = target.provider_event_id || ':' || target.id::text
from ranked
where target.id = ranked.id and ranked.rn > 1;

with ranked as (
  select id, row_number() over (partition by idempotency_key order by created_at, id) as rn
  from public.revenue_daily_runs
  where idempotency_key is not null
)
update public.revenue_daily_runs target
set idempotency_key = target.idempotency_key || ':' || target.id::text
from ranked
where target.id = ranked.id and ranked.rn > 1;

create unique index if not exists revenue_lead_sources_source_key_unique
  on public.revenue_lead_sources(source_key)
  where source_key is not null;

create unique index if not exists revenue_lead_source_runs_idempotency_unique
  on public.revenue_lead_source_runs(idempotency_key)
  where idempotency_key is not null;

create unique index if not exists revenue_jobs_idempotency_unique
  on public.revenue_job_opportunities(idempotency_key)
  where idempotency_key is not null;

create unique index if not exists revenue_jobs_source_external_unique
  on public.revenue_job_opportunities(source, external_id)
  where external_id is not null;

create unique index if not exists revenue_applications_idempotency_unique
  on public.revenue_job_applications(idempotency_key)
  where idempotency_key is not null;

create unique index if not exists revenue_email_queue_idempotency_unique
  on public.revenue_email_queue(idempotency_key)
  where idempotency_key is not null;

create unique index if not exists revenue_email_events_provider_event_unique
  on public.revenue_email_events(provider_event_id)
  where provider_event_id is not null;

create unique index if not exists revenue_daily_runs_idempotency_unique
  on public.revenue_daily_runs(idempotency_key)
  where idempotency_key is not null;

-- Suppression list duplicate prevention is enforced in application code because
-- older data may already contain duplicate email/domain rows that should not be
-- destructively collapsed in a production hardening migration.
