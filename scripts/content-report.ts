/**
 * Content-engine health report (BLOG_SEO_ENGINE §4/§7).
 * Run: `npm run content:report`  ·  CI gate: `npm run content:report -- --strict`
 *
 * Reports: cluster coverage · orphans · keyword coverage · linking health · the
 * top of the editorial queue. Informational by default; `--strict` exits non-zero
 * when orphans exist so CI can fail once the library is meant to be airtight.
 *
 * Shares all logic with the /content-ops dashboard via lib/seo/content-health.ts.
 */
import { getAllBlogPosts } from '@/lib/blog-server'
import { getContentHealth, getEditorialQueue } from '@/lib/seo/content-health'

const strict = process.argv.includes('--strict')

const dim = (s: string) => `\x1b[2m${s}\x1b[0m`
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`
const green = (s: string) => `\x1b[32m${s}\x1b[0m`
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`
const red = (s: string) => `\x1b[31m${s}\x1b[0m`
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`

function rule(label: string) {
  console.log('\n' + bold(cyan(`── ${label} ${'─'.repeat(Math.max(0, 56 - label.length))}`)))
}

const posts = getAllBlogPosts()
const health = getContentHealth(posts)
console.log(bold('\n📊 Content Engine Report') + dim(`  ·  ${health.total} posts  ·  ${health.clusters.length} clusters\n`))

rule('Cluster coverage')
for (const c of health.clusters) {
  const tone = c.count === 0 ? red : c.count < 4 ? yellow : green
  console.log(
    `${tone(String(c.count).padStart(3))} ${tone('█'.repeat(Math.min(c.count, 30)).padEnd(30))} ${c.title}` +
      dim(`  ·  ${c.gaps.length} open gaps`),
  )
}

rule('Orphans (no inbound sibling links)')
if (health.orphans.length === 0) console.log(green('  ✓ none — every post is linked by at least one sibling'))
else for (const slug of health.orphans) console.log(yellow(`  ⚠ ${slug}`))

rule('Keyword coverage')
if (health.uncoveredKeywords.length === 0) console.log(green('  ✓ every blog/topic keyword points at a live page'))
else for (const k of health.uncoveredKeywords) console.log(yellow(`  ⚠ "${k.term}" → ${k.assignedUrl}`))
console.log(dim(`  ${health.driftCount} post(s) not yet in the keyword map (drift — track as you scale)`))

rule('Linking health (§2 minimum)')
if (health.thinLinked.length === 0) console.log(green('  ✓ every post resolves ≥2 sibling links'))
else for (const p of health.thinLinked) console.log(yellow(`  ⚠ ${p.slug} — only ${p.links} sibling link(s)`))

rule('Editorial queue (top 8)')
for (const item of getEditorialQueue(posts).slice(0, 8)) {
  const tone = item.priority === 'P0' ? red : item.priority === 'P1' ? yellow : dim
  console.log(`  ${tone(item.priority)} ${item.title}` + dim(`  ·  ${item.clusterTitle}`))
}

rule('Summary')
console.log(
  health.issues === 0
    ? green(`  ✓ content graph healthy — 0 issues`)
    : yellow(`  ${health.issues} issue(s): ${health.orphans.length} orphan · ${health.uncoveredKeywords.length} uncovered keyword · ${health.thinLinked.length} thin-linked`),
)
console.log('')

if (strict && health.orphans.length > 0) {
  console.error(red(`content:report --strict failed: ${health.orphans.length} orphan(s)`))
  process.exit(1)
}
