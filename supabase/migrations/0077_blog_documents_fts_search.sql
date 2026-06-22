-- Isolated, additive full-text search for the blog (BLOG_SEO_ENGINE §5).
-- Public read (anon SELECT); writes only via service role (sync job). Touches nothing else.
-- Applied 2026-06-22 via Supabase MCP; recorded here for version control.

create table if not exists public.blog_documents (
  slug text primary key,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  cluster text not null,
  tags text[] not null default '{}',
  url text not null,
  date date,
  read_time text,
  updated_at timestamptz not null default now(),
  fts tsvector
);

-- Maintain the weighted tsvector via trigger (catalog-stable config lookup can't live
-- in a generated column, but is fine in a trigger body).
create or replace function public.blog_documents_fts_trigger()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.fts :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', array_to_string(new.tags, ' ')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.body, '')), 'C');
  return new;
end;
$$;

drop trigger if exists blog_documents_fts_update on public.blog_documents;
create trigger blog_documents_fts_update
  before insert or update on public.blog_documents
  for each row execute function public.blog_documents_fts_trigger();

create index if not exists blog_documents_fts_idx on public.blog_documents using gin (fts);
create index if not exists blog_documents_cluster_idx on public.blog_documents (cluster);

alter table public.blog_documents enable row level security;

drop policy if exists "blog_documents public read" on public.blog_documents;
create policy "blog_documents public read"
  on public.blog_documents for select
  to anon, authenticated
  using (true);

-- Ranked search callable by the public search API.
create or replace function public.search_blog_documents(q text, max_results int default 12)
returns table (slug text, title text, excerpt text, cluster text, url text, rank real)
language sql
stable
security invoker
set search_path = ''
as $$
  select d.slug, d.title, d.excerpt, d.cluster, d.url,
         ts_rank(d.fts, websearch_to_tsquery('english', q)) as rank
  from public.blog_documents d
  where d.fts @@ websearch_to_tsquery('english', q)
  order by rank desc
  limit greatest(1, least(max_results, 50));
$$;

grant execute on function public.search_blog_documents(text, int) to anon, authenticated;
