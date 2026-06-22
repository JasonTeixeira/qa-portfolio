import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getAllBlogPosts } from '@/lib/blog-server'

/**
 * Mirror the filesystem MDX posts into `public.blog_documents` for server-side
 * full-text search (BLOG_SEO_ENGINE §5). Idempotent: upserts every current post
 * and prunes rows for posts that no longer exist. Service-role only.
 *
 * Search degrades gracefully to the instant client-side filter when this table is
 * empty or stale, so a missed sync never breaks search — it only delays new posts
 * from appearing in server results.
 */
export async function syncBlogDocuments(): Promise<{ synced: number; pruned: number }> {
  const posts = getAllBlogPosts()
  const supabase = supabaseAdmin()

  const rows = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    body: post.fullContent || post.content,
    cluster: post.cluster,
    tags: post.tags ?? [],
    url: `/blog/${post.slug}`,
    date: post.date || null,
    read_time: post.readTime,
    updated_at: new Date().toISOString(),
  }))

  const { error: upsertError } = await supabase
    .from('blog_documents')
    .upsert(rows, { onConflict: 'slug' })
  if (upsertError) throw new Error(`blog_documents upsert failed: ${upsertError.message}`)

  // Prune rows for posts that were deleted/renamed.
  const currentSlugs = new Set(posts.map((p) => p.slug))
  const { data: existing, error: selectError } = await supabase.from('blog_documents').select('slug')
  if (selectError) throw new Error(`blog_documents select failed: ${selectError.message}`)
  const stale = (existing ?? []).map((r) => r.slug as string).filter((s) => !currentSlugs.has(s))
  if (stale.length > 0) {
    const { error: deleteError } = await supabase.from('blog_documents').delete().in('slug', stale)
    if (deleteError) throw new Error(`blog_documents prune failed: ${deleteError.message}`)
  }

  return { synced: rows.length, pruned: stale.length }
}
