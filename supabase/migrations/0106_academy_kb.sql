-- Academy-native RAG knowledge base. Isolated from the Discord/market rag_chunks
-- corpus so the tutor retrieves ONLY academy course content (accurate, no cross-
-- corpus pollution). 384-dim local embeddings (Supabase/gte-small, $0), pgvector
-- cosine HNSW. Ingested by scripts/academy/ingest-kb.ts from published lessons.

create extension if not exists vector with schema extensions;

create table if not exists academy_kb_chunks (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null,
  lesson_slug text not null,
  heading text,
  content text not null,
  content_tsv tsvector generated always as (to_tsvector('english', content)) stored,
  embedding extensions.vector(384),
  token_count int,
  created_at timestamptz not null default now()
);

create index if not exists academy_kb_chunks_unit_idx on academy_kb_chunks(course_slug, lesson_slug);
create index if not exists academy_kb_chunks_embedding_hnsw
  on academy_kb_chunks using hnsw (embedding extensions.vector_cosine_ops)
  where embedding is not null;
create index if not exists academy_kb_chunks_tsv_idx on academy_kb_chunks using gin(content_tsv);

-- KB is course content read by the tutor backend via the service role (bypasses RLS).
-- No learner read/write path is needed; enable RLS with no policies (deny by default).
alter table academy_kb_chunks enable row level security;

-- Cosine-similarity match (score 0..1), academy corpus only.
create or replace function public.match_academy_kb(
  query_embedding extensions.vector(384),
  match_count int default 6
)
returns table (
  id uuid,
  course_slug text,
  lesson_slug text,
  heading text,
  content text,
  score double precision
)
language sql
stable
as $$
  select
    c.id, c.course_slug, c.lesson_slug, c.heading, c.content,
    greatest(0, 1 - (c.embedding OPERATOR(extensions.<=>) query_embedding))::double precision as score
  from public.academy_kb_chunks c
  where c.embedding is not null
  order by c.embedding OPERATOR(extensions.<=>) query_embedding
  limit greatest(1, match_count)
$$;
