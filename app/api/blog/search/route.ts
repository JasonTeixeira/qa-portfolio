import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export interface BlogSearchResult {
  slug: string
  title: string
  excerpt: string
  cluster: string
  url: string
}

/**
 * Public server-side blog search (BLOG_SEO_ENGINE §5). Ranked Postgres FTS via the
 * `search_blog_documents` RPC. Always returns 200 with a `fallback` flag — if the
 * index is empty/unreachable, the client keeps its instant local filter, so search
 * never errors out for the reader.
 */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) {
    return NextResponse.json({ results: [], fallback: false, q })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    return NextResponse.json({ results: [], fallback: true, q })
  }

  try {
    const supabase = createClient(url, anon, { auth: { persistSession: false } })
    const { data, error } = await supabase.rpc('search_blog_documents', { q, max_results: 12 })
    if (error) {
      return NextResponse.json({ results: [], fallback: true, q })
    }
    const results: BlogSearchResult[] = (data ?? []).map((row: BlogSearchResult) => ({
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      cluster: row.cluster,
      url: row.url,
    }))
    return NextResponse.json(
      { results, fallback: false, q },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } },
    )
  } catch {
    return NextResponse.json({ results: [], fallback: true, q })
  }
}
