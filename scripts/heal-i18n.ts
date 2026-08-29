import fs from 'fs'
import path from 'path'
import { translateDictionary } from '@/lib/i18n/translate'
import { locales, defaultLocale, localeNames, type Locale } from '@/lib/i18n/config'

// Re-translate ONLY the keys a locale left in English (leakage). The bulk pass
// occasionally returns short UI labels untranslated when they sit in a large
// chunk; re-translating them in isolation with a firm instruction fixes it.
// Run: npm run i18n:heal   ·   re-runnable (only touches still-leaked keys).
try {
  for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch {
  // rely on ambient env (DEEPSEEK_API_KEY)
}

const dir = path.join(process.cwd(), 'lib', 'i18n', 'messages')
const source = JSON.parse(fs.readFileSync(path.join(dir, 'en.json'), 'utf8')) as Record<string, string>

// Legitimately-identical-across-languages: brand/product/acronym/code tokens.
const KEEP = new Set([
  'Sage Academy', 'Sage Ideas', 'Sage', 'Jason Teixeira', 'Stripe', 'AWS', 'Next.js',
  'AI', 'RAG', 'API', 'DB', 'JSON', 'HTML', 'CSS', 'SQL', 'vs',
])

function isTranslatable(k: string): boolean {
  if (KEEP.has(k)) return false
  if (!/[a-z]{3,}/.test(k)) return false // needs a real lowercase word
  if (/^[A-Z0-9 ._/·—→✓✗-]+$/.test(k)) return false // all-caps / symbol / number
  if (k.length < 3) return false
  return true
}

const HEAL_NOTE =
  'IMPORTANT: every value below was previously left in English by mistake. Translate EVERY ' +
  'one into natural, native-quality text for this language — do not leave any value in English. ' +
  'These are real UI labels, buttons, and full sentences. For short labels (e.g. "Dismiss", ' +
  '"Enroll", "Growth") produce the idiomatic native term. Only keep a value unchanged if it is a ' +
  'genuine brand name (Sage Academy, Sage Ideas, Stripe) or a bare acronym (RAG, API, AI).'

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

const targets = (locales as readonly Locale[]).filter((l) => l !== defaultLocale)

void (async () => {
  for (const locale of targets) {
    const file = path.join(dir, `${locale}.json`)
    const current = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, string>
    const leaked = Object.keys(source).filter((k) => isTranslatable(k) && current[k] === source[k])
    if (leaked.length === 0) {
      console.log(`${locale} (${localeNames[locale]}): clean, nothing to heal`)
      continue
    }
    process.stdout.write(`${locale} (${localeNames[locale]}): healing ${leaked.length} keys … `)
    let healed = 0
    for (const group of chunk(leaked, 8)) {
      const dict = Object.fromEntries(group.map((k) => [k, source[k]]))
      try {
        const part = await translateDictionary(dict, { code: locale, name: localeNames[locale] }, HEAL_NOTE)
        for (const k of group) {
          if (part[k] && part[k] !== source[k]) {
            current[k] = part[k]
            healed++
          }
        }
      } catch (err) {
        console.warn(`\n  ⚠ chunk failed: ${err instanceof Error ? err.message.slice(0, 60) : err}`)
      }
    }
    fs.writeFileSync(file, JSON.stringify(current, null, 2) + '\n')
    const stillLeaked = Object.keys(source).filter((k) => isTranslatable(k) && current[k] === source[k]).length
    console.log(`healed ${healed}, still-leaked ${stillLeaked}`)
  }
})()
