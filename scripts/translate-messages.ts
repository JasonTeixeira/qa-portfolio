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

void (async () => {
  for (const locale of targets) {
    process.stdout.write(`translating → ${locale} (${localeNames[locale]}) … `)
    try {
      const translated = await translateDictionary(source, { code: locale, name: localeNames[locale] })
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
