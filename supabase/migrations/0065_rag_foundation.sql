-- RAG foundation: source registry, documents, chunks, retrieval logs, answers, feedback, and evals.

create extension if not exists vector with schema extensions;

create table if not exists public.rag_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  source_type text not null check (
    source_type in (
      'discord_message',
      'discord_question',
      'discord_answer',
      'discord_content_queue',
      'blog_post',
      'resource',
      'lesson',
      'admin_note',
      'uploaded_document'
    )
  ),
  external_id text,
  title text,
  source_url text,
  source_table text,
  source_record_id text,
  author_user_id text,
  author_name text,
  channel_id text,
  channel_base_name text,
  status text not null default 'active' check (status in ('active', 'ignored', 'deleted')),
  quality_score integer not null default 50 check (quality_score between 0 and 100),
  content_hash text not null,
  metadata jsonb not null default '{}'::jsonb,
  source_created_at timestamptz,
  first_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rag_sources_type_status_idx
  on public.rag_sources(source_type, status, updated_at desc);

create index if not exists rag_sources_hash_idx
  on public.rag_sources(content_hash);

create index if not exists rag_sources_channel_idx
  on public.rag_sources(channel_base_name, updated_at desc);

create table if not exists public.rag_documents (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.rag_sources(id) on delete cascade,
  document_key text not null unique,
  title text,
  body text not null,
  body_hash text not null,
  language text not null default 'en',
  token_estimate integer not null default 0 check (token_estimate >= 0),
  status text not null default 'pending' check (status in ('pending', 'chunked', 'embedded', 'ignored', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rag_documents_source_idx
  on public.rag_documents(source_id, status);

create index if not exists rag_documents_hash_idx
  on public.rag_documents(body_hash);

create table if not exists public.rag_ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  run_key text not null unique,
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),
  source_types text[] not null default '{}',
  sources_seen integer not null default 0 check (sources_seen >= 0),
  sources_upserted integer not null default 0 check (sources_upserted >= 0),
  documents_upserted integer not null default 0 check (documents_upserted >= 0),
  chunks_upserted integer not null default 0 check (chunks_upserted >= 0),
  chunks_embedded integer not null default 0 check (chunks_embedded >= 0),
  chunks_skipped integer not null default 0 check (chunks_skipped >= 0),
  failures integer not null default 0 check (failures >= 0),
  error text,
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists rag_ingestion_runs_started_idx
  on public.rag_ingestion_runs(started_at desc);

create table if not exists public.rag_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.rag_documents(id) on delete cascade,
  source_id uuid not null references public.rag_sources(id) on delete cascade,
  ingestion_run_id uuid references public.rag_ingestion_runs(id) on delete set null,
  chunk_key text not null unique,
  chunk_index integer not null check (chunk_index >= 0),
  content text not null,
  content_hash text not null,
  token_estimate integer not null default 0 check (token_estimate >= 0),
  embedding extensions.vector(1536),
  embedding_model text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rag_chunks_document_idx
  on public.rag_chunks(document_id, chunk_index);

create index if not exists rag_chunks_source_idx
  on public.rag_chunks(source_id, chunk_index);

create index if not exists rag_chunks_hash_idx
  on public.rag_chunks(content_hash);

create table if not exists public.rag_retrieval_logs (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  normalized_query text,
  filters jsonb not null default '{}'::jsonb,
  result_count integer not null default 0 check (result_count >= 0),
  selected_chunk_ids uuid[] not null default '{}',
  score_summary jsonb not null default '{}'::jsonb,
  confidence numeric(5,4),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists rag_retrieval_logs_created_idx
  on public.rag_retrieval_logs(created_at desc);

create table if not exists public.rag_answers (
  id uuid primary key default gen_random_uuid(),
  retrieval_log_id uuid references public.rag_retrieval_logs(id) on delete set null,
  question text not null,
  answer text not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'posted', 'rejected', 'failed')),
  confidence numeric(5,4),
  citations jsonb not null default '[]'::jsonb,
  model text,
  prompt_version text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rag_answers_created_idx
  on public.rag_answers(created_at desc);

create index if not exists rag_answers_status_idx
  on public.rag_answers(status, created_at desc);

create table if not exists public.rag_answer_feedback (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid references public.rag_answers(id) on delete cascade,
  retrieval_log_id uuid references public.rag_retrieval_logs(id) on delete set null,
  rating text not null check (rating in ('helpful', 'not_helpful', 'unsafe', 'incorrect', 'needs_source')),
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists rag_answer_feedback_answer_idx
  on public.rag_answer_feedback(answer_id, created_at desc);

create table if not exists public.rag_eval_questions (
  id uuid primary key default gen_random_uuid(),
  eval_key text not null unique,
  question text not null,
  expected_sources text[] not null default '{}',
  expected_answer_notes text,
  tags text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rag_eval_runs (
  id uuid primary key default gen_random_uuid(),
  run_key text not null unique,
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),
  retrieval_config jsonb not null default '{}'::jsonb,
  model text,
  prompt_version text,
  total_questions integer not null default 0 check (total_questions >= 0),
  passed integer not null default 0 check (passed >= 0),
  failed integer not null default 0 check (failed >= 0),
  metrics jsonb not null default '{}'::jsonb,
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.rag_eval_results (
  id uuid primary key default gen_random_uuid(),
  eval_run_id uuid not null references public.rag_eval_runs(id) on delete cascade,
  eval_question_id uuid not null references public.rag_eval_questions(id) on delete cascade,
  answer_id uuid references public.rag_answers(id) on delete set null,
  retrieval_log_id uuid references public.rag_retrieval_logs(id) on delete set null,
  passed boolean not null default false,
  score numeric(5,4),
  citation_coverage numeric(5,4),
  faithfulness numeric(5,4),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists rag_eval_results_run_idx
  on public.rag_eval_results(eval_run_id, passed);

alter table public.rag_sources enable row level security;
alter table public.rag_documents enable row level security;
alter table public.rag_ingestion_runs enable row level security;
alter table public.rag_chunks enable row level security;
alter table public.rag_retrieval_logs enable row level security;
alter table public.rag_answers enable row level security;
alter table public.rag_answer_feedback enable row level security;
alter table public.rag_eval_questions enable row level security;
alter table public.rag_eval_runs enable row level security;
alter table public.rag_eval_results enable row level security;

drop policy if exists "rag_sources_admin_all" on public.rag_sources;
create policy "rag_sources_admin_all" on public.rag_sources for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "rag_documents_admin_all" on public.rag_documents;
create policy "rag_documents_admin_all" on public.rag_documents for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "rag_ingestion_runs_admin_all" on public.rag_ingestion_runs;
create policy "rag_ingestion_runs_admin_all" on public.rag_ingestion_runs for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "rag_chunks_admin_all" on public.rag_chunks;
create policy "rag_chunks_admin_all" on public.rag_chunks for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "rag_retrieval_logs_admin_all" on public.rag_retrieval_logs;
create policy "rag_retrieval_logs_admin_all" on public.rag_retrieval_logs for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "rag_answers_admin_all" on public.rag_answers;
create policy "rag_answers_admin_all" on public.rag_answers for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "rag_answer_feedback_admin_all" on public.rag_answer_feedback;
create policy "rag_answer_feedback_admin_all" on public.rag_answer_feedback for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "rag_eval_questions_admin_all" on public.rag_eval_questions;
create policy "rag_eval_questions_admin_all" on public.rag_eval_questions for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "rag_eval_runs_admin_all" on public.rag_eval_runs;
create policy "rag_eval_runs_admin_all" on public.rag_eval_runs for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "rag_eval_results_admin_all" on public.rag_eval_results;
create policy "rag_eval_results_admin_all" on public.rag_eval_results for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
