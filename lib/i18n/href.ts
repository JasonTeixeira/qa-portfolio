import { defaultLocale, locales } from './config'

/**
 * Prefix an internal href with the active locale (no-op for the default locale and
 * for external/hash/api links). Strips any existing locale prefix first so it's
 * idempotent. Shared by the locale-aware Link and the language switcher.
 */
/** Paths that are intentionally English-only (auth/portal/admin/api) — never prefixed. */
const UNLOCALIZED_PREFIXES = ['/api', '/_next', '/login', '/signup', '/auth', '/portal', '/admin', '/academy-admin']

export function localizeHref(href: string, locale: string): string {
  if (typeof href !== 'string' || !href.startsWith('/')) return href
  if (UNLOCALIZED_PREFIXES.some((p) => href === p || href.startsWith(p + '/'))) return href

  // Drop an existing locale prefix, if present.
  const segments = href.split('/')
  const stripped = (locales as readonly string[]).includes(segments[1])
    ? '/' + segments.slice(2).join('/')
    : href
  const canonical = stripped === '/' ? '' : stripped

  if (locale === defaultLocale) return canonical || '/'
  return `/${locale}${canonical}`
}

/** Remove a leading locale segment from a path → the canonical (en) path. */
export function canonicalPath(path: string): string {
  const segments = path.split('/')
  if ((locales as readonly string[]).includes(segments[1])) {
    const rest = '/' + segments.slice(2).join('/')
    return rest === '/' ? '/' : rest.replace(/\/$/, '')
  }
  return path
}
