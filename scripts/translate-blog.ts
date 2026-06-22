import fs from 'fs'
import path from 'path'
import { translateDictionary, translateMarkdown } from '@/lib/i18n/translate'
import { getAllBlogPosts } from '@/lib/blog-server'
import { locales, defaultLocale, localeNames, type Locale } from '@/lib/i18n/config'

/**
 * Machine-translate blog posts into every locale, writing content/blog/i18n/<locale>/<slug>.md
 * (translated title + excerpt frontmatter + translated body). Resumable — skips files that
 * already exist unless --force. Scope flags keep proof runs cheap:
 *   npm run i18n:blog -- --slugs=a,b --locales=es,ja,ar     # targeted
 *   npm run i18n:blog                                        # full corpus (long)
 */
for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const args = process.argv.slice(2)
const force = args.includes('--force')
const slugArg = args.find((a) => a.startsWith('--slugs='))?.split('=')[1]
const localeArg = args.find((a) => a.startsWith('--locales='))?.split('=')[1]
const concurrency = Number(args.find((a) => a.startsWith('--concurrency='))?.split('=')[1]) || 6

const I18N_DIR = path.join(process.cwd(), 'content', 'blog', 'i18n')
const targetLocales: Locale[] = (localeArg ? localeArg.split(',') : locales.filter((l) => l !== defaultLocale)).filter(
  (l): l is Locale => (locales as readonly string[]).includes(l) && l !== defaultLocale,
)

interface Job {
  post: ReturnType<typeof getAllBlogPosts>[number]
  locale: Locale
  out: string
}

async function runJob(job: Job): Promise<boolean> {
  const { post, locale, out } = job
  try {
    const meta = await translateDictionary(
      { title: post.title, excerpt: post.excerpt },
      { code: locale, name: localeNames[locale] },
    )
    const body = await translateMarkdown(post.fullContent || post.content, {
      code: locale,
      name: localeNames[locale],
    })
    fs.mkdirSync(path.dirname(out), { recursive: true })
    const frontmatter = `---\ntitle: ${JSON.stringify(meta.title ?? post.title)}\nexcerpt: ${JSON.stringify(
      meta.excerpt ?? post.excerpt,
    )}\nsourceSlug: ${post.slug}\nlocale: ${locale}\nmachineTranslated: true\n---\n\n`
    fs.writeFileSync(out, frontmatter + body.trim() + '\n')
    return true
  } catch (err) {
    console.log(`  ✗ ${locale}/${post.slug} — ${err instanceof Error ? err.message : err}`)
    return false
  }
}

void (async () => {
  const all = getAllBlogPosts()
  const posts = slugArg ? all.filter((p) => slugArg.split(',').includes(p.slug)) : all

  // Build the work list, skipping anything already translated (resumable).
  const jobs: Job[] = []
  let skipped = 0
  for (const post of posts) {
    for (const locale of targetLocales) {
      const out = path.join(I18N_DIR, locale, `${post.slug}.md`)
      if (!force && fs.existsSync(out)) skipped++
      else jobs.push({ post, locale, out })
    }
  }

  const total = jobs.length
  console.log(
    `blog translation · ${posts.length} posts × ${targetLocales.length} locales · ` +
      `${total} to do, ${skipped} already done · concurrency ${concurrency}\n`,
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
      if (n % 10 === 0 || n === total) {
        console.log(`  progress ${n}/${total} (${done} ok, ${failed} failed)`)
      }
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker))
  console.log(`\nDONE · translated ${done} · failed ${failed} · skipped ${skipped}`)
  if (failed > 0) process.exitCode = 1
})()
