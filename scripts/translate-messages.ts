import fs from 'fs'
import path from 'path'
import { translateDictionary } from '@/lib/i18n/translate'
import { locales, defaultLocale, localeNames } from '@/lib/i18n/config'

// Machine-translate the UI message catalog (en.json) into every other locale.
// Run: npm run i18n:messages   ·   re-runnable (overwrites each locale file).
try {
  for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch {
  // No .env.local (e.g. CI) - rely on the ambient environment (DEEPSEEK_API_KEY).
}

const dir = path.join(process.cwd(), 'lib', 'i18n', 'messages')
const source = JSON.parse(fs.readFileSync(path.join(dir, 'en.json'), 'utf8')) as Record<string, string>
const targets = locales.filter((l) => l !== defaultLocale)

// The model returns one JSON object per request; a whole large catalog overflows
// the response token budget and truncates the JSON. Translate in small chunks and
// merge. Keep chunks small — some values are full marketing paragraphs.
const CHUNK_SIZE = 30

function chunkEntries(obj: Record<string, string>, size: number): Record<string, string>[] {
  const entries = Object.entries(obj)
  const chunks: Record<string, string>[] = []
  for (let i = 0; i < entries.length; i += size) {
    chunks.push(Object.fromEntries(entries.slice(i, i + size)))
  }
  return chunks
}

// Resilient chunk translation: if a chunk still won't parse after the translator's
// hotter retries, bisect it so one poison key never drops its neighbours. A single
// key that still fails keeps its English source value (honest fallback — renders
// English rather than losing the whole locale).
async function translateResilient(
  chunk: Record<string, string>,
  target: { code: string; name: string },
): Promise<Record<string, string>> {
  try {
    return await translateDictionary(chunk, target)
  } catch (err) {
    const keys = Object.keys(chunk)
    if (keys.length <= 1) {
      console.warn(`\n  ⚠ ${target.code}: kept English for ${JSON.stringify(keys[0])} (${err instanceof Error ? err.message.slice(0, 60) : err})`)
      return { ...chunk }
    }
    const mid = Math.ceil(keys.length / 2)
    const left = Object.fromEntries(keys.slice(0, mid).map((k) => [k, chunk[k]]))
    const right = Object.fromEntries(keys.slice(mid).map((k) => [k, chunk[k]]))
    const a = await translateResilient(left, target)
    const b = await translateResilient(right, target)
    return { ...a, ...b }
  }
}

void (async () => {
  const chunks = chunkEntries(source, CHUNK_SIZE)
  for (const locale of targets) {
    process.stdout.write(`translating → ${locale} (${localeNames[locale]}) · ${chunks.length} chunks … `)
    try {
      const translated: Record<string, string> = {}
      for (const chunk of chunks) {
        const part = await translateResilient(chunk, { code: locale, name: localeNames[locale] })
        Object.assign(translated, part)
      }
      // Guarantee every source key exists (fall back to English for any the model dropped).
      const merged: Record<string, string> = {}
      for (const key of Object.keys(source)) merged[key] = translated[key] ?? source[key]
      fs.writeFileSync(path.join(dir, `${locale}.json`), JSON.stringify(merged, null, 2) + '\n')
      console.log(`done (${Object.keys(merged).length} keys)`)
    } catch (err) {
      console.log(`FAILED: ${err instanceof Error ? err.message : err}`)
      process.exitCode = 1
    }
  }
})()
