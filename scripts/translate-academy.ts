import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { translateDictionary } from '@/lib/i18n/translate'
import { academyTracks } from '@/data/academy/tracks'
import { locales, defaultLocale, localeNames, type Locale } from '@/lib/i18n/config'

/**
 * Machine-translate Academy course data (tracks: title/description/outcome/audience/
 * format/cta/lessons) into every locale -> content/academy/i18n/<locale>.json.
 * Same engine + change-detection as the blog: a sourceHash of the English data gates
 * re-translation, so editing a track auto-refreshes it and untouched data is free.
 *   npm run i18n:academy            translate new/stale
 *   npm run i18n:academy -- --check report only
 */
try {
  for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch {
  // CI: key comes from the environment.
}

const checkOnly = process.argv.includes('--check')
const force = process.argv.includes('--force')
const I18N_DIR = path.join(process.cwd(), 'content', 'academy', 'i18n')
const TRACK_FIELDS = ['title', 'description', 'outcome', 'audience', 'format', 'cta'] as const

/** Flat English dictionary of every translatable Academy string, keyed by a stable path. */
function buildSource(): Record<string, string> {
  const dict: Record<string, string> = {}
  for (const t of academyTracks) {
    for (const f of TRACK_FIELDS) dict[`track::${t.slug}::${f}`] = t[f]
    t.lessons.forEach((l, i) => (dict[`track::${t.slug}::lesson::${i}`] = l))
  }
  return dict
}

const source = buildSource()
const sourceHash = crypto.createHash('sha256').update(JSON.stringify(source)).digest('hex').slice(0, 16)
const targets = locales.filter((l) => l !== defaultLocale)

function existingHash(locale: Locale): string {
  try {
    return JSON.parse(fs.readFileSync(path.join(I18N_DIR, `${locale}.json`), 'utf-8')).sourceHash ?? ''
  } catch {
    return ''
  }
}

void (async () => {
  const stale = targets.filter((l) => force || existingHash(l) !== sourceHash)
  if (checkOnly) {
    console.log(
      `i18n:academy - ${academyTracks.length} tracks x ${targets.length} locales\n` +
        `  up to date: ${targets.length - stale.length}\n  to translate: ${stale.length}\n` +
        (stale.length === 0 ? '  all current' : `  run \`npm run i18n:academy\``),
    )
    return
  }

  fs.mkdirSync(I18N_DIR, { recursive: true })
  let done = 0
  for (const locale of stale) {
    process.stdout.write(`academy -> ${locale} (${localeNames[locale]}) ... `)
    try {
      const values = await translateDictionary(source, { code: locale, name: localeNames[locale] })
      const merged: Record<string, string> = {}
      for (const k of Object.keys(source)) merged[k] = values[k] ?? source[k]
      fs.writeFileSync(path.join(I18N_DIR, `${locale}.json`), JSON.stringify({ sourceHash, values: merged }, null, 2) + '\n')
      done++
      console.log('ok')
    } catch (err) {
      console.log(`FAIL: ${err instanceof Error ? err.message : err}`)
      process.exitCode = 1
    }
  }
  console.log(`\nDONE - translated ${done} - up to date ${targets.length - stale.length}`)
})()
