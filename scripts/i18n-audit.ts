import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { getAllBlogPosts } from '@/lib/blog-server'
import { academyTracks } from '@/data/academy/tracks'
import enMessages from '@/lib/i18n/messages/en.json'
import { locales, defaultLocale, type Locale } from '@/lib/i18n/config'

/**
 * The accuracy/completeness audit — one command that verifies EVERY content piece is
 * translated into EVERY locale and structurally sound. Runs in the GitHub Action after
 * translation and locally via `npm run i18n:audit`. Catches the real failure modes that
 * make a translation wrong: missing locale, stale (English changed), dropped frontmatter,
 * structural drift (code-block count != source), truncation/bloat, missing message keys.
 * `--strict` exits non-zero on any issue (CI gate).
 */
const strict = process.argv.includes('--strict')
const targets = locales.filter((l) => l !== defaultLocale)
const issues: string[] = []
const note = (s: string) => issues.push(s)

function sha(...parts: string[]): string {
  return crypto.createHash('sha256').update(parts.join(' ')).digest('hex').slice(0, 16)
}
function fenced(md: string): number {
  return (md.match(/```/g) ?? []).length
}

// ---- Blog ---------------------------------------------------------------
const posts = getAllBlogPosts()
let blogChecked = 0
for (const post of posts) {
  const enBody = post.fullContent || post.content
  const enHash = sha(post.title, post.excerpt, enBody)
  const enFences = fenced(enBody)
  for (const locale of targets) {
    blogChecked++
    const file = path.join(process.cwd(), 'content', 'blog', 'i18n', locale, `${post.slug}.md`)
    if (!fs.existsSync(file)) {
      note(`blog MISSING   ${locale}/${post.slug}`)
      continue
    }
    const raw = fs.readFileSync(file, 'utf-8')
    const fm = raw.slice(0, raw.indexOf('\n---', 4) + 4)
    const body = raw.slice(fm.length)
    if (!/^title:/m.test(fm) || !/^excerpt:/m.test(fm)) note(`blog NO-FRONTMATTER ${locale}/${post.slug}`)
    if (body.trim().length < 40) note(`blog EMPTY-BODY ${locale}/${post.slug}`)
    const h = fm.match(/^sourceHash:\s*(\w+)/m)?.[1]
    if (h !== enHash) note(`blog STALE     ${locale}/${post.slug}`)
    if (fenced(body) !== enFences) note(`blog CODE-DRIFT ${locale}/${post.slug} (${fenced(body)} vs ${enFences})`)
    const ratio = body.length / Math.max(1, enBody.length)
    if (ratio < 0.35 || ratio > 3.2) note(`blog LENGTH    ${locale}/${post.slug} (ratio ${ratio.toFixed(2)})`)
  }
}

// ---- Academy ------------------------------------------------------------
const acadSource: Record<string, string> = {}
for (const t of academyTracks) {
  for (const f of ['title', 'description', 'outcome', 'audience', 'format', 'cta'] as const) acadSource[`track::${t.slug}::${f}`] = t[f]
  t.lessons.forEach((l, i) => (acadSource[`track::${t.slug}::lesson::${i}`] = l))
}
const acadHash = sha(JSON.stringify(acadSource))
let acadChecked = 0
for (const locale of targets) {
  acadChecked++
  const file = path.join(process.cwd(), 'content', 'academy', 'i18n', `${locale}.json`)
  if (!fs.existsSync(file)) {
    note(`academy MISSING ${locale}`)
    continue
  }
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
  if (data.sourceHash !== acadHash) note(`academy STALE  ${locale}`)
  const missing = Object.keys(acadSource).filter((k) => !data.values?.[k])
  if (missing.length) note(`academy MISSING-KEYS ${locale} (${missing.length})`)
}

// ---- UI messages --------------------------------------------------------
let msgChecked = 0
for (const locale of targets) {
  msgChecked++
  let cat: Record<string, string> = {}
  try {
    cat = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'lib', 'i18n', 'messages', `${locale}.json`), 'utf-8'))
  } catch {
    note(`messages MISSING ${locale}`)
    continue
  }
  const missing = Object.keys(enMessages).filter((k) => !cat[k])
  if (missing.length) note(`messages MISSING-KEYS ${locale} (${missing.length})`)
}

// ---- Report -------------------------------------------------------------
console.log(`\ni18n accuracy audit  (${targets.length} locales)`)
console.log(`  blog:     ${posts.length} posts x ${targets.length} = ${blogChecked} files`)
console.log(`  academy:  ${academyTracks.length} tracks x ${targets.length} = ${acadChecked} catalogs`)
console.log(`  messages: ${Object.keys(enMessages).length} keys x ${msgChecked} locales`)
if (issues.length === 0) {
  console.log(`\n  PASS - every content piece is translated, current, and structurally sound.\n`)
} else {
  console.log(`\n  ${issues.length} issue(s):`)
  for (const i of issues.slice(0, 50)) console.log(`    - ${i}`)
  if (issues.length > 50) console.log(`    ... and ${issues.length - 50} more`)
  console.log('')
  if (strict) process.exit(1)
}
