import type { Metadata } from 'next'
import { locales, defaultLocale, localeHrefLang, type Locale } from './config'

const SITE = 'https://www.sageideas.dev'

function urlFor(locale: Locale, canonical: string): string {
  const clean = canonical === '/' ? '' : canonical
  return locale === defaultLocale ? `${SITE}${clean || '/'}` : `${SITE}/${locale}${clean}`
}

/**
 * Build `alternates` for a page (BLOG_SEO_ENGINE §8): canonical = the current
 * locale's URL, plus a full `hreflang` map for all 10 locales + `x-default`.
 * `canonicalPath` is the de-prefixed path (e.g. `/blog/foo` or `/`).
 */
export function localizedAlternates(
  canonicalPath: string,
  locale: Locale = defaultLocale,
  extra?: Metadata['alternates'],
  /** Restrict hreflang to locales that actually exist (honest hreflang). Defaults to all. */
  availableLocales: readonly Locale[] = locales,
): Metadata['alternates'] {
  const languages: Record<string, string> = {}
  for (const l of availableLocales) {
    languages[localeHrefLang[l]] = urlFor(l, canonicalPath)
  }
  languages['x-default'] = urlFor(defaultLocale, canonicalPath)

  return {
    canonical: urlFor(locale, canonicalPath),
    languages,
    ...extra,
  }
}
