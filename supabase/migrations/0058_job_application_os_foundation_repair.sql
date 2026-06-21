-- Job Application OS phases 1-6
-- First-class job search, candidate intelligence, packet, workflow, and proof tables.

create table if not exists public.job_os_candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  name text not null,
  headline text,
  location text,
  remote_preference text not null default 'remote'
    check (remote_preference in ('remote','hybrid','onsite','any')),
  target_roles text[] not null default '{}',
  target_industries text[] not null default '{}',
  salary_min_usd integer,
  salary_target_usd integer,
  work_authorization text,
  links jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_os_resume_versions (
  id uuid primary key default gen_random_uuid(),
  candidate_profile_id uuid references public.job_os_candidate_profiles(id) on delete cascade,
  external_key text,
  label text not null,
  role_family text not null,
  version integer not null default 1,
  status text not null default 'draft'
    check (status in ('draft','active','archived')),
  summary text,
  ats_keywords text[] not null default '{}',
  proof_points text[] not null default '{}',
  document_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_os_skill_inventory (
  id uuid primary key default gen_random_uuid(),
  candidate_profile_id uuid references public.job_os_candidate_profiles(id) on delete cascade,
  skill text not null,
  category text not null
    check (category in ('frontend','backend','ai','testing','ops','product')),
  strength integer not null check (strength between 1 and 5),
  evidence text,
  keywords text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_os_story_bank (
  id uuid primary key default gen_random_uuid(),
  candidate_profile_id uuid references public.job_os_candidate_profiles(id) on delete cascade,
  external_key text,
  title text not null,
  competency text not null,
  situation text,
  task text,
  action text,
  result text,
  proof_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_os_role_preferences (
  id uuid primary key default gen_random_uuid(),
  candidate_profile_id uuid references public.job_os_candidate_profiles(id) on delete cascade,
  seniority text[] not null default '{}',
  salary_min_usd integer,
  salary_target_usd integer,
  remote_modes text[] not null default '{}',
  locations text[] not null default '{}',
  industries text[] not null default '{}',
  excluded_terms text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_os_sources (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  provider text not null
    check (provider in ('greenhouse','lever','ashby','workable','remotive','linkedin','manual')),
  status text not null default 'active'
    check (status in ('active','paused','archived')),
  query text,
  quota_limit integer not null default 100 check (quota_limit >= 0),
  quota_used integer not null default 0 check (quota_used >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_os_jobs (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  source_id uuid references public.job_os_sources(id) on delete set null,
  source text not null,
  external_id text,
  title text not null,
  company text not null,
  location text,
  job_url text,
  description text,
  captured_at timestamptz not null default now(),
  dedupe_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_os_company_enrichments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.job_os_jobs(id) on delete cascade,
  company text not null,
  domain text,
  industry_signals text[] not null default '{}',
  hiring_signals text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.job_os_parsed_jobs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.job_os_jobs(id) on delete cascade,
  seniority text not null
    check (seniority in ('entry','junior','mid','senior','unknown')),
  remote_status text not null
    check (remote_status in ('remote','hybrid','onsite','unknown')),
  required_skills text[] not null default '{}',
  preferred_skills text[] not null default '{}',
  responsibilities text[] not null default '{}',
  years_required integer,
  salary_range text,
  knockout_signals text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.job_os_fit_scores (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.job_os_jobs(id) on delete cascade,
  candidate_profile_id uuid references public.job_os_candidate_profiles(id) on delete cascade,
  overall integer not null check (overall between 0 and 100),
  skill_match integer not null check (skill_match between 0 and 100),
  role_match integer not null check (role_match between 0 and 100),
  evidence_match integer not null check (evidence_match between 0 and 100),
  risk_penalty integer not null default 0,
  missing_skills text[] not null default '{}',
  matched_skills text[] not null default '{}',
  recommendation text not null
    check (recommendation in ('apply_now','review','skip')),
  reasons text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.job_os_applications (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  job_id uuid references public.job_os_jobs(id) on delete cascade,
  candidate_profile_id uuid references public.job_os_candidate_profiles(id) on delete cascade,
  resume_version_id uuid references public.job_os_resume_versions(id) on delete set null,
  stage text not null default 'saved'
    check (stage in ('saved','ready','applied','recruiter_contacted','interviewing','offer','rejected','archived')),
  priority_rank integer,
  next_action text,
  next_action_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_os_daily_targets (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  application_id uuid references public.job_os_applications(id) on delete cascade,
  target_date date not null default current_date,
  rank integer not null,
  fit_score integer not null check (fit_score between 0 and 100),
  recommendation text not null
    check (recommendation in ('apply_now','review','skip')),
  next_action text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.job_os_application_packets (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.job_os_applications(id) on delete cascade,
  resume_variant text not null,
  resume_summary text,
  targeted_bullets text[] not null default '{}',
  cover_letter text,
  recruiter_message text,
  ats_keyword_coverage integer not null default 0 check (ats_keyword_coverage between 0 and 100),
  ats_keywords text[] not null default '{}',
  packet jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_os_submission_checklists (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.job_os_applications(id) on delete cascade,
  status text not null default 'ready_for_manual_submission',
  items jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_os_submission_evidence (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.job_os_applications(id) on delete cascade,
  status text not null
    check (status in ('pending_manual_submission','submitted','blocked')),
  confirmation_email text,
  screenshot_path text,
  submitted_at timestamptz,
  notes text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_os_recruiter_contacts (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  application_id uuid references public.job_os_applications(id) on delete cascade,
  name text not null,
  company text not null,
  title text,
  email text not null,
  source text not null
    check (source in ('company_site','linkedin','manual','reply')),
  confidence integer not null default 0 check (confidence between 0 and 100),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_os_recruiter_outreach (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  application_id uuid references public.job_os_applications(id) on delete cascade,
  recipient_email text not null,
  subject text not null,
  body text not null,
  send_after_days integer not null default 0,
  status text not null default 'manual_review'
    check (status in ('manual_review','scheduled','sent','paused')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_os_inbox_events (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  application_id uuid references public.job_os_applications(id) on delete cascade,
  from_email text not null,
  classification text not null
    check (classification in ('positive_reply','rejection','interview_request','auto_reply','unknown')),
  next_action text,
  confidence integer not null default 0 check (confidence between 0 and 100),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.job_os_interview_kits (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  application_id uuid references public.job_os_applications(id) on delete cascade,
  company text not null,
  role text not null,
  research_brief text[] not null default '{}',
  likely_questions text[] not null default '{}',
  star_story_ids text[] not null default '{}',
  follow_up_template text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_os_experiments (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  name text not null,
  hypothesis text,
  variants text[] not null default '{}',
  metric text not null
    check (metric in ('reply_rate','interview_rate','offer_rate')),
  status text not null default 'draft'
    check (status in ('draft','running','won','lost')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_os_analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  applications integer not null default 0,
  ready integer not null default 0,
  applied integer not null default 0,
  replies integer not null default 0,
  interviews integer not null default 0,
  offers integer not null default 0,
  reply_rate integer not null default 0 check (reply_rate between 0 and 100),
  interview_rate integer not null default 0 check (interview_rate between 0 and 100),
  top_resume_variant text,
  bottlenecks text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.job_os_live_source_proofs (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  provider text not null,
  status text not null
    check (status in ('configured','missing_credentials','sample_only')),
  imported integer not null default 0,
  quota_remaining integer,
  evidence text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.job_os_observability_snapshots (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  status text not null
    check (status in ('healthy','degraded','blocked')),
  alerts text[] not null default '{}',
  queue_depth integer not null default 0,
  stale_applications integer not null default 0,
  p95_dashboard_ms integer not null default 0,
  p95_packet_ms integer not null default 0,
  estimated_daily_cost_usd numeric(10,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.job_os_load_proofs (
  id uuid primary key default gen_random_uuid(),
  run_key text,
  tenants integer not null default 0,
  jobs integer not null default 0,
  applications integer not null default 0,
  packets integer not null default 0,
  p95_dashboard_ms integer not null default 0,
  p95_export_ms integer not null default 0,
  status text not null
    check (status in ('passed','failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create unique index if not exists job_os_jobs_dedupe_idx on public.job_os_jobs(dedupe_key) where dedupe_key is not null;
create index if not exists job_os_candidate_run_idx on public.job_os_candidate_profiles(run_key);
create index if not exists job_os_resume_candidate_idx on public.job_os_resume_versions(candidate_profile_id);
create index if not exists job_os_jobs_run_idx on public.job_os_jobs(run_key);
create index if not exists job_os_jobs_company_idx on public.job_os_jobs(company);
create index if not exists job_os_fit_scores_overall_idx on public.job_os_fit_scores(overall desc);
create index if not exists job_os_applications_stage_idx on public.job_os_applications(stage);
create index if not exists job_os_applications_next_action_idx on public.job_os_applications(next_action_at);
create index if not exists job_os_daily_targets_rank_idx on public.job_os_daily_targets(target_date desc, rank asc);
create index if not exists job_os_packets_application_idx on public.job_os_application_packets(application_id);
create index if not exists job_os_recruiter_contacts_email_idx on public.job_os_recruiter_contacts(email);
create index if not exists job_os_recruiter_outreach_status_idx on public.job_os_recruiter_outreach(status);
create index if not exists job_os_inbox_events_classification_idx on public.job_os_inbox_events(classification);
create index if not exists job_os_interview_kits_run_idx on public.job_os_interview_kits(run_key);
create index if not exists job_os_experiments_status_idx on public.job_os_experiments(status);
create index if not exists job_os_analytics_run_idx on public.job_os_analytics_snapshots(run_key);
create index if not exists job_os_live_source_proofs_run_idx on public.job_os_live_source_proofs(run_key);
create index if not exists job_os_observability_run_idx on public.job_os_observability_snapshots(run_key);
create index if not exists job_os_load_proofs_run_idx on public.job_os_load_proofs(run_key);

drop trigger if exists job_os_candidate_profiles_updated_at on public.job_os_candidate_profiles;
create trigger job_os_candidate_profiles_updated_at before update on public.job_os_candidate_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists job_os_resume_versions_updated_at on public.job_os_resume_versions;
create trigger job_os_resume_versions_updated_at before update on public.job_os_resume_versions
  for each row execute function public.set_updated_at();

drop trigger if exists job_os_skill_inventory_updated_at on public.job_os_skill_inventory;
create trigger job_os_skill_inventory_updated_at before update on public.job_os_skill_inventory
  for each row execute function public.set_updated_at();

drop trigger if exists job_os_story_bank_updated_at on public.job_os_story_bank;
create trigger job_os_story_bank_updated_at before update on public.job_os_story_bank
  for each row execute function public.set_updated_at();

drop trigger if exists job_os_role_preferences_updated_at on public.job_os_role_preferences;
create trigger job_os_role_preferences_updated_at before update on public.job_os_role_preferences
  for each row execute function public.set_updated_at();

drop trigger if exists job_os_sources_updated_at on public.job_os_sources;
create trigger job_os_sources_updated_at before update on public.job_os_sources
  for each row execute function public.set_updated_at();

drop trigger if exists job_os_jobs_updated_at on public.job_os_jobs;
create trigger job_os_jobs_updated_at before update on public.job_os_jobs
  for each row execute function public.set_updated_at();

drop trigger if exists job_os_applications_updated_at on public.job_os_applications;
create trigger job_os_applications_updated_at before update on public.job_os_applications
  for each row execute function public.set_updated_at();

drop trigger if exists job_os_packets_updated_at on public.job_os_application_packets;
create trigger job_os_packets_updated_at before update on public.job_os_application_packets
  for each row execute function public.set_updated_at();

drop trigger if exists job_os_submission_checklists_updated_at on public.job_os_submission_checklists;
create trigger job_os_submission_checklists_updated_at before update on public.job_os_submission_checklists
  for each row execute function public.set_updated_at();

drop trigger if exists job_os_submission_evidence_updated_at on public.job_os_submission_evidence;
create trigger job_os_submission_evidence_updated_at before update on public.job_os_submission_evidence
  for each row execute function public.set_updated_at();

drop trigger if exists job_os_recruiter_contacts_updated_at on public.job_os_recruiter_contacts;
create trigger job_os_recruiter_contacts_updated_at before update on public.job_os_recruiter_contacts
  for each row execute function public.set_updated_at();

drop trigger if exists job_os_recruiter_outreach_updated_at on public.job_os_recruiter_outreach;
create trigger job_os_recruiter_outreach_updated_at before update on public.job_os_recruiter_outreach
  for each row execute function public.set_updated_at();

drop trigger if exists job_os_interview_kits_updated_at on public.job_os_interview_kits;
create trigger job_os_interview_kits_updated_at before update on public.job_os_interview_kits
  for each row execute function public.set_updated_at();

drop trigger if exists job_os_experiments_updated_at on public.job_os_experiments;
create trigger job_os_experiments_updated_at before update on public.job_os_experiments
  for each row execute function public.set_updated_at();

alter table public.job_os_candidate_profiles enable row level security;
alter table public.job_os_resume_versions enable row level security;
alter table public.job_os_skill_inventory enable row level security;
alter table public.job_os_story_bank enable row level security;
alter table public.job_os_role_preferences enable row level security;
alter table public.job_os_sources enable row level security;
alter table public.job_os_jobs enable row level security;
alter table public.job_os_company_enrichments enable row level security;
alter table public.job_os_parsed_jobs enable row level security;
alter table public.job_os_fit_scores enable row level security;
alter table public.job_os_applications enable row level security;
alter table public.job_os_daily_targets enable row level security;
alter table public.job_os_application_packets enable row level security;
alter table public.job_os_submission_checklists enable row level security;
alter table public.job_os_submission_evidence enable row level security;
alter table public.job_os_recruiter_contacts enable row level security;
alter table public.job_os_recruiter_outreach enable row level security;
alter table public.job_os_inbox_events enable row level security;
alter table public.job_os_interview_kits enable row level security;
alter table public.job_os_experiments enable row level security;
alter table public.job_os_analytics_snapshots enable row level security;
alter table public.job_os_live_source_proofs enable row level security;
alter table public.job_os_observability_snapshots enable row level security;
alter table public.job_os_load_proofs enable row level security;

drop policy if exists "job_os_candidate_profiles_admin_all" on public.job_os_candidate_profiles;
create policy "job_os_candidate_profiles_admin_all" on public.job_os_candidate_profiles for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_resume_versions_admin_all" on public.job_os_resume_versions;
create policy "job_os_resume_versions_admin_all" on public.job_os_resume_versions for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_skill_inventory_admin_all" on public.job_os_skill_inventory;
create policy "job_os_skill_inventory_admin_all" on public.job_os_skill_inventory for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_story_bank_admin_all" on public.job_os_story_bank;
create policy "job_os_story_bank_admin_all" on public.job_os_story_bank for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_role_preferences_admin_all" on public.job_os_role_preferences;
create policy "job_os_role_preferences_admin_all" on public.job_os_role_preferences for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_sources_admin_all" on public.job_os_sources;
create policy "job_os_sources_admin_all" on public.job_os_sources for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_jobs_admin_all" on public.job_os_jobs;
create policy "job_os_jobs_admin_all" on public.job_os_jobs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_company_enrichments_admin_all" on public.job_os_company_enrichments;
create policy "job_os_company_enrichments_admin_all" on public.job_os_company_enrichments for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_parsed_jobs_admin_all" on public.job_os_parsed_jobs;
create policy "job_os_parsed_jobs_admin_all" on public.job_os_parsed_jobs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_fit_scores_admin_all" on public.job_os_fit_scores;
create policy "job_os_fit_scores_admin_all" on public.job_os_fit_scores for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_applications_admin_all" on public.job_os_applications;
create policy "job_os_applications_admin_all" on public.job_os_applications for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_daily_targets_admin_all" on public.job_os_daily_targets;
create policy "job_os_daily_targets_admin_all" on public.job_os_daily_targets for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_application_packets_admin_all" on public.job_os_application_packets;
create policy "job_os_application_packets_admin_all" on public.job_os_application_packets for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_submission_checklists_admin_all" on public.job_os_submission_checklists;
create policy "job_os_submission_checklists_admin_all" on public.job_os_submission_checklists for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_submission_evidence_admin_all" on public.job_os_submission_evidence;
create policy "job_os_submission_evidence_admin_all" on public.job_os_submission_evidence for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_recruiter_contacts_admin_all" on public.job_os_recruiter_contacts;
create policy "job_os_recruiter_contacts_admin_all" on public.job_os_recruiter_contacts for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_recruiter_outreach_admin_all" on public.job_os_recruiter_outreach;
create policy "job_os_recruiter_outreach_admin_all" on public.job_os_recruiter_outreach for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_inbox_events_admin_all" on public.job_os_inbox_events;
create policy "job_os_inbox_events_admin_all" on public.job_os_inbox_events for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_interview_kits_admin_all" on public.job_os_interview_kits;
create policy "job_os_interview_kits_admin_all" on public.job_os_interview_kits for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_experiments_admin_all" on public.job_os_experiments;
create policy "job_os_experiments_admin_all" on public.job_os_experiments for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_analytics_snapshots_admin_all" on public.job_os_analytics_snapshots;
create policy "job_os_analytics_snapshots_admin_all" on public.job_os_analytics_snapshots for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_live_source_proofs_admin_all" on public.job_os_live_source_proofs;
create policy "job_os_live_source_proofs_admin_all" on public.job_os_live_source_proofs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_observability_snapshots_admin_all" on public.job_os_observability_snapshots;
create policy "job_os_observability_snapshots_admin_all" on public.job_os_observability_snapshots for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "job_os_load_proofs_admin_all" on public.job_os_load_proofs;
create policy "job_os_load_proofs_admin_all" on public.job_os_load_proofs for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));
