import fs from 'fs'
import { execSync } from 'child_process'
import { verifyTranslation } from '@/lib/i18n/translate'
import { getAllBlogPosts } from '@/lib/blog-server'
import { getTranslatedPost } from '@/lib/blog-i18n'
import { locales, defaultLocale, localeNames, type Locale } from '@/lib/i18n/config'

/**
 * The accuracy verification loop: an LLM judge grades sampled translations against their
 * English source (faithfulness + fluency 1-5 + term preservation). Anything below the bar
 * is RE-TRANSLATED and RE-GRADED (the loop) until it passes or attempts run out, so the
 * corpus is not just complete but genuinely correct.
 *   npm run i18n:verify                    grade a sample, report scores
 *   npm run i18n:verify -- --sample=8      sample size per locale
 *   npm run i18n:verify -- --heal          re-translate + re-grade anything < threshold
 *   npm run i18n:verify -- --locales=es,ja --strict
 */
try {
  for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch {
  /* CI: key from env */
}

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const heal = args.includes('--heal')
const sample = Number(args.find((a) => a.startsWith('--sample='))?.split('=')[1]) || 5
const localeArg = args.find((a) => a.startsWith('--locales='))?.split('=')[1]
const THRESHOLD = 4 // faithfulness must be >= 4/5
const BODY_CHARS = 1600 // grade head of the body (bounds token cost, high signal)

const targetLocales: Locale[] = (localeArg ? localeArg.split(',') : locales.filter((l) => l !== defaultLocale)).filter(
  (l): l is Locale => (locales as readonly string[]).includes(l) && l !== defaultLocale,
)

// Deterministic spread across the corpus (no Math.random) — every Nth post.
function pickPosts<T>(all: T[], n: number): T[] {
  if (all.length <= n) return all
  const step = all.length / n
  return Array.from({ length: n }, (_, i) => all[Math.floor(i * step)])
}

function reTranslate(slug: string, locale: Locale): void {
  execSync(`npx tsx scripts/translate-blog.ts --slugs=${slug} --locales=${locale} --force`, { stdio: 'ignore' })
}

void (async () => {
  const posts = pickPosts(getAllBlogPosts(), sample)
  console.log(
    `i18n accuracy verify - ${posts.length} posts x ${targetLocales.length} locales = ${posts.length * targetLocales.length} graded` +
      (heal ? ' (heal on)' : ''),
  )

  const scores: Record<string, number[]> = {}
  const flagged: string[] = []
  let healed = 0

  for (const post of posts) {
    const src = `${post.title}\n${post.excerpt}\n${(post.fullContent || post.content).slice(0, BODY_CHARS)}`
    for (const locale of targetLocales) {
      let t = getTranslatedPost(post.slug, locale)
      if (!t) {
        flagged.push(`${locale}/${post.slug} — MISSING`)
        continue
      }
      let verdict = await verifyTranslation(src, `${t.title}\n${t.excerpt}\n${t.body.slice(0, BODY_CHARS)}`, {
        code: locale,
        name: localeNames[locale],
      })

      if (heal && verdict.faithfulness < THRESHOLD) {
        for (let attempt = 0; attempt < 2 && verdict.faithfulness < THRESHOLD; attempt++) {
          reTranslate(post.slug, locale)
          t = getTranslatedPost(post.slug, locale)
          if (!t) break
          verdict = await verifyTranslation(src, `${t.title}\n${t.excerpt}\n${t.body.slice(0, BODY_CHARS)}`, {
            code: locale,
            name: localeNames[locale],
          })
        }
        if (verdict.faithfulness >= THRESHOLD) healed++
      }

      ;(scores[locale] ??= []).push(verdict.faithfulness)
      if (verdict.faithfulness < THRESHOLD || !verdict.termsPreserved) {
        flagged.push(
          `${locale}/${post.slug} — faith ${verdict.faithfulness}/5, fluency ${verdict.fluency}/5` +
            (verdict.termsPreserved ? '' : ', TERMS!') +
            (verdict.issues.length ? ` — ${verdict.issues.slice(0, 2).join('; ')}` : ''),
        )
      }
    }
  }

  console.log('\nfaithfulness by locale (avg / min):')
  for (const locale of targetLocales) {
    const s = scores[locale] ?? []
    if (!s.length) continue
    const avg = (s.reduce((a, b) => a + b, 0) / s.length).toFixed(2)
    console.log(`  ${locale}: ${avg} / ${Math.min(...s)}`)
  }
  if (heal) console.log(`\nhealed: ${healed}`)
  if (flagged.length === 0) {
    console.log(`\n  PASS - all sampled translations score >= ${THRESHOLD}/5 faithfulness with terms preserved.\n`)
  } else {
    console.log(`\n  ${flagged.length} below bar:`)
    for (const f of flagged.slice(0, 30)) console.log(`    - ${f}`)
    console.log('')
    if (strict) process.exit(1)
  }
})()
