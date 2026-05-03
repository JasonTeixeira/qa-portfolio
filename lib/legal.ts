import fs from 'node:fs/promises'
import path from 'node:path'

export type LegalFrontmatter = {
  title?: string
  lastUpdated?: string
  summary?: string
}

export type LegalDocument = {
  frontmatter: LegalFrontmatter
  body: string
}

/**
 * Reads a legal MDX file from `content/legal/` and splits the YAML frontmatter
 * from the markdown body. Frontmatter parsing is intentionally minimal so we
 * don't ship `gray-matter` for one tiny use case.
 */
export async function readLegalDoc(slug: string): Promise<LegalDocument> {
  const filePath = path.join(process.cwd(), 'content', 'legal', `${slug}.mdx`)
  const raw = await fs.readFile(filePath, 'utf-8')

  const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/)
  if (!fmMatch) {
    return { frontmatter: {}, body: raw }
  }

  const fm: LegalFrontmatter = {}
  const lines = fmMatch[1].split('\n')
  for (const line of lines) {
    const m = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*"?([^"]*)"?\s*$/)
    if (m) {
      const key = m[1] as keyof LegalFrontmatter
      ;(fm as Record<string, string>)[key] = m[2].trim()
    }
  }

  // Strip the leading H1 from the body — we render the title in a header above
  // the MDX content from frontmatter, and don't want a duplicate H1 below it.
  let body = raw.slice(fmMatch[0].length).trimStart()
  body = body.replace(/^#\s+.+\n+/, '')

  return {
    frontmatter: fm,
    body,
  }
}

/** Backwards compat: return only the body (no frontmatter). */
export async function readLegalMdx(slug: string): Promise<string> {
  const { body } = await readLegalDoc(slug)
  return body
}
