/**
 * i18n configuration (BLOG_SEO_ENGINE §8). Whole-site localization via the Next.js proxy
 * rewrite: the default locale (en) stays at its current unprefixed URLs so production
 * SEO is untouched; every other locale is served at a `/<locale>/…` prefix that the
 * proxy rewrites back onto the same routes, with the locale carried in a header.
 *
 * Top 10 by global internet reach — deliberately includes RTL (ar) and CJK (zh, ja)
 * so the architecture handles the hard cases from day one.
 */
export const locales = ['en', 'es', 'zh', 'hi', 'ar', 'pt', 'fr', 'ja', 'de', 'ru'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

/** Right-to-left locales — drive `<html dir>` and direction-aware layout. */
export const rtlLocales: readonly Locale[] = ['ar']

/** Endonyms (each language's own name) for the switcher — never translate these. */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  zh: '中文',
  hi: 'हिन्दी',
  ar: 'العربية',
  pt: 'Português',
  fr: 'Français',
  ja: '日本語',
  de: 'Deutsch',
  ru: 'Русский',
}

/** BCP-47 tags for `<html lang>`, hreflang, and OpenGraph locale. */
export const localeHrefLang: Record<Locale, string> = {
  en: 'en',
  es: 'es',
  zh: 'zh-Hans',
  hi: 'hi',
  ar: 'ar',
  pt: 'pt-BR',
  fr: 'fr',
  ja: 'ja',
  de: 'de',
  ru: 'ru',
}

/** OpenGraph `locale` values (underscored). */
export const localeOgLocale: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_ES',
  zh: 'zh_CN',
  hi: 'hi_IN',
  ar: 'ar_AR',
  pt: 'pt_BR',
  fr: 'fr_FR',
  ja: 'ja_JP',
  de: 'de_DE',
  ru: 'ru_RU',
}

export function isLocale(value: string | undefined | null): value is Locale {
  return value != null && (locales as readonly string[]).includes(value)
}

export function isRtl(locale: string): boolean {
  return (rtlLocales as readonly string[]).includes(locale)
}

export function normalizeLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : defaultLocale
}
