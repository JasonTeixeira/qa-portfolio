import { InlineNewsletterCTA } from './inline-newsletter-cta'

interface ArticleBodyProps {
  html: string
}

/**
 * Splits rendered article HTML by <h2> sections and injects the inline
 * newsletter CTA after the middle H2. Renders inside #article-body so the
 * reading-progress bar can compute scroll progress against this element.
 */
export function ArticleBody({ html }: ArticleBodyProps) {
  // Split by H2 tags (preserve them on the trailing chunk)
  const parts = html.split(/(?=<h2[\s>])/i)

  if (parts.length <= 1) {
    return (
      <div
        id="article-body"
        className="markdown-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  const mid = Math.floor(parts.length / 2)
  const before = parts.slice(0, mid).join('')
  const after = parts.slice(mid).join('')

  return (
    <div id="article-body" className="markdown-body">
      <div dangerouslySetInnerHTML={{ __html: before }} />
      <InlineNewsletterCTA />
      <div dangerouslySetInnerHTML={{ __html: after }} />
    </div>
  )
}
