import { getAllBlogPosts } from '@/lib/blog-server'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const baseUrl = 'https://www.sageideas.dev'
  const posts = getAllBlogPosts().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  const updated = posts[0]?.date ? new Date(posts[0].date).toISOString() : new Date().toISOString()

  const entries = posts
    .map((post) => {
      const url = `${baseUrl}/blog/${post.slug}`
      return `
  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${url}" />
    <id>${url}</id>
    <updated>${new Date(post.dateUpdated ?? post.date).toISOString()}</updated>
    <published>${new Date(post.date).toISOString()}</published>
    <summary>${escapeXml(post.excerpt)}</summary>
    <author><name>Jason Teixeira</name></author>
    <category term="${escapeXml(post.cluster)}" label="${escapeXml(post.category)}" />
  </entry>`
    })
    .join('')

  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Sage Ideas - Field Notes</title>
  <subtitle>Technical writing on AI systems, apps, infrastructure, fintech, testing, and solo studio operations.</subtitle>
  <link href="${baseUrl}/blog" />
  <link rel="self" href="${baseUrl}/atom.xml" />
  <id>${baseUrl}/blog</id>
  <updated>${updated}</updated>
  <author><name>Jason Teixeira</name></author>
${entries}
</feed>`

  return new Response(atom, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
