export interface TocNode {
  id: string
  text: string
  level: 2 | 3
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export function injectHeadingIds(html: string): { html: string; toc: TocNode[] } {
  const counts = new Map<string, number>()
  const toc: TocNode[] = []

  const nextId = (text: string) => {
    const base = slugifyHeading(text) || 'section'
    const count = counts.get(base) ?? 0
    counts.set(base, count + 1)
    return count === 0 ? base : `${base}-${count + 1}`
  }

  const updated = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, levelRaw: string, attrs: string, inner: string) => {
      if (/\sid=(["']).*?\1/i.test(attrs)) {
        const id = attrs.match(/\sid=(["'])(.*?)\1/i)?.[2]
        const text = stripTags(inner)
        if (id && text) toc.push({ id, text, level: Number(levelRaw) as 2 | 3 })
        return match
      }

      const text = stripTags(inner)
      const id = nextId(text)
      if (text) toc.push({ id, text, level: Number(levelRaw) as 2 | 3 })
      return `<h${levelRaw}${attrs} id="${id}">${inner}</h${levelRaw}>`
    },
  )

  return { html: updated, toc }
}
