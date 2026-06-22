import fs from 'fs'
import path from 'path'
import { defaultLocale, type Locale } from '@/lib/i18n/config'
import type { AcademyTrack } from '@/data/academy/tracks'

/**
 * Serve machine-translated Academy track data per locale (content/academy/i18n/<locale>.json),
 * overlaying only the translatable text onto the English track. Missing translation -> English
 * fallback, so the page never breaks. Mirrors lib/blog-i18n.ts.
 */
const I18N_DIR = path.join(process.cwd(), 'content', 'academy', 'i18n')

const cache = new Map<Locale, Record<string, string> | null>()

function loadValues(locale: Locale): Record<string, string> | null {
  if (cache.has(locale)) return cache.get(locale) ?? null
  let values: Record<string, string> | null = null
  try {
    values = JSON.parse(fs.readFileSync(path.join(I18N_DIR, `${locale}.json`), 'utf-8')).values ?? null
  } catch {
    values = null
  }
  cache.set(locale, values)
  return values
}

/** The translatable fields of a track in `locale`, or undefined when none exist. */
export function getTranslatedTrack(slug: string, locale: Locale): Partial<AcademyTrack> | undefined {
  if (locale === defaultLocale) return undefined
  const v = loadValues(locale)
  if (!v) return undefined
  const get = (field: string) => v[`track::${slug}::${field}`]

  const lessons: string[] = []
  for (let i = 0; ; i++) {
    const lesson = v[`track::${slug}::lesson::${i}`]
    if (lesson === undefined) break
    lessons.push(lesson)
  }

  const out: Partial<AcademyTrack> = {}
  for (const field of ['title', 'description', 'outcome', 'audience', 'format', 'cta'] as const) {
    const value = get(field)
    if (value !== undefined) out[field] = value
  }
  if (lessons.length) out.lessons = lessons
  return Object.keys(out).length ? out : undefined
}

/** Merge the English track with its translation for `locale` (English fallback per field). */
export function localizeTrack(track: AcademyTrack, locale: Locale): AcademyTrack {
  const t = getTranslatedTrack(track.slug, locale)
  return t ? { ...track, ...t } : track
}
