-- RAG local embeddings: add a real 384-dimension vector lane for local Transformers.js embeddings.

alter table public.rag_chunks
  add column if not exists embedding_local extensions.vector(384),
  add column if not exists embedding_local_model text,
  add column if not exists embedding_local_updated_at timestamptz,
  add column if not exists content_tsv tsvector generated always as (to_tsvector('english', content)) stored;

create index if not exists rag_chunks_embedding_local_hnsw_idx
  on public.rag_chunks
  using hnsw (embedding_local extensions.vector_cosine_ops)
  where embedding_local is not null;

create index if not exists rag_chunks_embedding_local_model_idx
  on public.rag_chunks(embedding_local_model, embedding_local_updated_at desc)
  where embedding_local is not null;

create index if not exists rag_chunks_content_tsv_idx
  on public.rag_chunks
  using gin (content_tsv);

create or replace function public.match_rag_chunks_hybrid(
  query_text text,
  query_embedding extensions.vector(384),
  match_count integer default 8,
  vector_weight double precision default 0.65
)
returns table (
  chunk_id uuid,
  document_id uuid,
  source_id uuid,
  chunk_key text,
  content text,
  title text,
  source_type text,
  source_url text,
  metadata jsonb,
  vector_score double precision,
  keyword_score double precision,
  hybrid_score double precision
)
language sql
stable
as $$
  with vector_search as (
    select
      c.id,
      row_number() over (order by c.embedding_local OPERATOR(extensions.<=>) query_embedding) as vector_rank,
      greatest(0, 1 - (c.embedding_local OPERATOR(extensions.<=>) query_embedding))::double precision as vector_score
    from public.rag_chunks c
    where c.embedding_local is not null
    order by c.embedding_local OPERATOR(extensions.<=>) query_embedding
    limit greatest(match_count * 4, 20)
  ),
  keyword_search as (
    select
      c.id,
      row_number() over (order by ts_rank_cd(c.content_tsv, websearch_to_tsquery('english', query_text)) desc) as keyword_rank,
      ts_rank_cd(c.content_tsv, websearch_to_tsquery('english', query_text))::double precision as keyword_score
    from public.rag_chunks c
    where c.content_tsv @@ websearch_to_tsquery('english', query_text)
    order by ts_rank_cd(c.content_tsv, websearch_to_tsquery('english', query_text)) desc
    limit greatest(match_count * 4, 20)
  ),
  fused as (
    select
      coalesce(v.id, k.id) as id,
      coalesce(v.vector_score, 0)::double precision as vector_score,
      coalesce(k.keyword_score, 0)::double precision as keyword_score,
      (
        coalesce((1.0 / (60 + v.vector_rank)), 0) * vector_weight
        + coalesce((1.0 / (60 + k.keyword_rank)), 0) * (1 - vector_weight)
      )::double precision as hybrid_score
    from vector_search v
    full outer join keyword_search k on k.id = v.id
  )
  select
    c.id as chunk_id,
    c.document_id,
    c.source_id,
    c.chunk_key,
    c.content,
    d.title,
    s.source_type,
    s.source_url,
    c.metadata,
    fused.vector_score,
    fused.keyword_score,
    fused.hybrid_score
  from fused
  join public.rag_chunks c on c.id = fused.id
  join public.rag_documents d on d.id = c.document_id
  join public.rag_sources s on s.id = c.source_id
  order by fused.hybrid_score desc
  limit match_count;
$$;
