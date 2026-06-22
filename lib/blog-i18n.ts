import fs from 'fs'
import path from 'path'
import { parseFrontmatter } from '@/lib/frontmatter'
import { locales, defaultLocale, type Locale } from '@/lib/i18n/config'

/**
 * Machine-translated blog bodies live at content/blog/i18n/<locale>/<slug>.md with a
 * tiny frontmatter (translated title + excerpt) + the translated markdown body. The
 * English MDX stays the single source of all structured metadata (date, cluster, tags,
 * links); only the human-readable text is swapped per locale. Missing translations fall
 * back to English — search/hreflang stay honest by only advertising locales that exist.
 */
const I18N_DIR = path.join(process.cwd(), 'content', 'blog', 'i18n')

export interface TranslatedPost {
  title: string
  excerpt: string
  body: string
}

function translationPath(locale: Locale, slug: string): string {
  return path.join(I18N_DIR, locale, `${slug}.md`)
}

export function getTranslatedPost(slug: string, locale: Locale): TranslatedPost | undefined {
  if (locale === defaultLocale) return undefined
  const filepath = translationPath(locale, slug)
  if (!fs.existsSync(filepath)) return undefined
  try {
    const { data, content } = parseFrontmatter(fs.readFileSync(filepath, 'utf-8'))
    const title = typeof data.title === 'string' ? data.title : undefined
    const excerpt = typeof data.excerpt === 'string' ? data.excerpt : undefined
    if (!content.trim()) return undefined
    return { title: title ?? '', excerpt: excerpt ?? '', body: content }
  } catch {
    return undefined
  }
}

/** Locales (always including English) that actually have a translation of this post. */
export function getTranslatedLocales(slug: string): Locale[] {
  return [
    defaultLocale,
    ...locales.filter((l) => l !== defaultLocale && fs.existsSync(translationPath(l, slug))),
  ]
}
