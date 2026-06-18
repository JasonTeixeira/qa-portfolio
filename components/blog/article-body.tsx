import { ArticleLeadMagnet } from './article-route-cards'
import type { BlogPost } from '@/lib/blog-server'
import type { HubMeta } from '@/data/content/clusters'

interface ArticleBodyProps {
  html: string
  cluster: HubMeta
  currentPost: BlogPost
}

/**
 * Splits rendered article HTML by <h2> sections and injects the inline
 * newsletter CTA after the middle H2. Renders inside #article-body so the
 * reading-progress bar can compute scroll progress against this element.
 */
export function ArticleBody({ html, cluster, currentPost }: ArticleBodyProps) {
  // Split by H2 tags (preserve them on the trailing chunk)
  const parts = html.split(/(?=<h2[\s>])/i)

  if (parts.length <= 1) {
    return (
      <div id="article-body" className="markdown-body">
        <div dangerouslySetInnerHTML={{ __html: html }} />
        <ArticleLeadMagnet cluster={cluster} currentPost={currentPost} />
      </div>
    )
  }

  const mid = Math.floor(parts.length / 2)
  const before = parts.slice(0, mid).join('')
  const after = parts.slice(mid).join('')

  return (
    <div id="article-body" className="markdown-body">
      <div dangerouslySetInnerHTML={{ __html: before }} />
      <ArticleLeadMagnet cluster={cluster} currentPost={currentPost} />
      <div dangerouslySetInnerHTML={{ __html: after }} />
    </div>
  )
}
