import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { translateDictionary, translateMarkdown } from '@/lib/i18n/translate'
import { getAllBlogPosts } from '@/lib/blog-server'
import { locales, defaultLocale, localeNames, type Locale } from '@/lib/i18n/config'

/**
 * Machine-translate blog posts into every locale, writing content/blog/i18n/<locale>/<slug>.md
 * (translated title + excerpt frontmatter + translated body). The engine is incremental: it
 * stamps a sourceHash of the English content into each translation and only (re)translates what
 * is NEW or whose English has CHANGED, so editing a post auto-refreshes its translations and
 * untouched posts cost nothing. Flags:
 *   npm run i18n:blog                  translate everything new/stale
 *   npm run i18n:blog -- --check       report missing/stale, translate nothing
 *   npm run i18n:blog -- --slugs=a,b   scope to specific posts
 *   npm run i18n:blog -- --force       re-translate everything
 */
try {
  for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch {
  // No .env.local (e.g. CI) - rely on the ambient environment (DEEPSEEK_API_KEY).
}

const args = process.argv.slice(2)
const force = args.includes('--force')
const checkOnly = args.includes('--check')
const slugArg = args.find((a) => a.startsWith('--slugs='))?.split('=')[1]
const localeArg = args.find((a) => a.startsWith('--locales='))?.split('=')[1]
const concurrency = Number(args.find((a) => a.startsWith('--concurrency='))?.split('=')[1]) || 6

const I18N_DIR = path.join(process.cwd(), 'content', 'blog', 'i18n')

function sourceHash(title: string, excerpt: string, body: string): string {
  return crypto.createHash('sha256').update([title, excerpt, body].join(' ')).digest('hex').slice(0, 16)
}

function existingHash(file: string): string {
  try {
    const m = fs.readFileSync(file, 'utf-8').match(/^sourceHash:\s*(\w+)/m)
    return m ? m[1] : ''
  } catch {
    return ''
  }
}

const targetLocales: Locale[] = (localeArg ? localeArg.split(',') : locales.filter((l) => l !== defaultLocale)).filter(
  (l): l is Locale => (locales as readonly string[]).includes(l) && l !== defaultLocale,
)

interface Job {
  post: ReturnType<typeof getAllBlogPosts>[number]
  locale: Locale
  out: string
  hash: string
  reason: 'missing' | 'stale'
}

function fenceCount(md: string): number {
  return (md.match(/```/g) ?? []).length
}

/**
 * Translate the body, validating that the number of ``` code fences matches the source.
 * The model occasionally converts an indented code block into a (sometimes unclosed)
 * fenced one; a quick retry fixes it deterministically. Keeps the best of N attempts.
 */
async function translateBodyWithParity(post: Job['post'], locale: Locale): Promise<string> {
  const src = post.fullContent || post.content
  const want = fenceCount(src)
  let best = ''
  for (let attempt = 0; attempt < 3; attempt++) {
    const body = await translateMarkdown(src, { code: locale, name: localeNames[locale] })
    if (fenceCount(body) === want) return body
    best = best || body
  }
  // Couldn't reach parity. If the source has NO fenced blocks, every ``` in the output
  // is spurious (the model fenced an indented block, sometimes leaving it unclosed) -
  // strip the fence markers so the doc is never malformed. The prose is untouched.
  if (want === 0) return best.split('\n').filter((l) => !/^\s*```/.test(l)).join('\n')
  return best
}

async function runJob(job: Job): Promise<boolean> {
  const { post, locale, out, hash } = job
  try {
    const meta = await translateDictionary(
      { title: post.title, excerpt: post.excerpt },
      { code: locale, name: localeNames[locale] },
    )
    const body = await translateBodyWithParity(post, locale)
    fs.mkdirSync(path.dirname(out), { recursive: true })
    const frontmatter =
      '---\n' +
      `title: ${JSON.stringify(meta.title ?? post.title)}\n` +
      `excerpt: ${JSON.stringify(meta.excerpt ?? post.excerpt)}\n` +
      `sourceSlug: ${post.slug}\n` +
      `locale: ${locale}\n` +
      `sourceHash: ${hash}\n` +
      'machineTranslated: true\n' +
      '---\n\n'
    fs.writeFileSync(out, frontmatter + body.trim() + '\n')
    return true
  } catch (err) {
    console.log(`  FAIL ${locale}/${post.slug} - ${err instanceof Error ? err.message : err}`)
    return false
  }
}

void (async () => {
  const all = getAllBlogPosts()
  const posts = slugArg ? all.filter((p) => slugArg.split(',').includes(p.slug)) : all

  const jobs: Job[] = []
  let upToDate = 0
  for (const post of posts) {
    const hash = sourceHash(post.title, post.excerpt, post.fullContent || post.content)
    for (const locale of targetLocales) {
      const out = path.join(I18N_DIR, locale, `${post.slug}.md`)
      const exists = fs.existsSync(out)
      if (!force && exists && existingHash(out) === hash) {
        upToDate++
        continue
      }
      jobs.push({ post, locale, out, hash, reason: exists ? 'stale' : 'missing' })
    }
  }

  const total = jobs.length
  if (checkOnly) {
    const missing = jobs.filter((j) => j.reason === 'missing').length
    const stale = jobs.filter((j) => j.reason === 'stale').length
    console.log(
      `i18n:check - ${posts.length} posts x ${targetLocales.length} locales\n` +
        `  up to date: ${upToDate}\n  missing:    ${missing}\n  stale:      ${stale}\n` +
        (total === 0 ? '  all translations current' : `  run \`npm run i18n:blog\` to translate ${total}`),
    )
    return
  }

  console.log(
    `blog translation - ${posts.length} posts x ${targetLocales.length} locales - ` +
      `${total} to do (new/stale), ${upToDate} up to date - concurrency ${concurrency}\n`,
  )

  let done = 0
  let failed = 0
  let cursor = 0
  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor++]
      const ok = await runJob(job)
      if (ok) done++
      else failed++
      const n = done + failed
      if (n % 10 === 0 || n === total) console.log(`  progress ${n}/${total} (${done} ok, ${failed} failed)`)
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker))
  console.log(`\nDONE - translated ${done} - failed ${failed} - up to date ${upToDate}`)
  if (failed > 0) process.exitCode = 1
})()
