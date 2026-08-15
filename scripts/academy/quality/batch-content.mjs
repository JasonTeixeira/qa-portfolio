/**
 * Content-quality batch — runs the content auditor (validateBlocks + anti-template
 * heuristics + lab execution, via audit-courses.ts) across EVERY published course by
 * staging each course's LIVE Supabase blocks into the auditor's expected bundle. Emits
 * a ranked defect board so we can see which courses are world-class vs shells vs broken.
 *
 *   node --env-file=.env.local scripts/academy/quality/batch-content.mjs [--no-run-labs]
 *
 * Board → proof-artifacts/academy/CONTENT_BOARD.json + a printed summary (worst first).
 */
import { createClient } from '@supabase/supabase-js'
import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync, existsSync, readFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const NO_LABS = process.argv.includes('--no-run-labs')
const OUT = 'proof-artifacts/academy'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Stage a course's live blocks → the auditor's {slug: blocks[]} bundle + synthesized manifest.
function stageFromLive(courseSlug, lessons) {
  // audit-courses scans a PARENT dir for course FOLDERS → nest under dir/<slug>/.
  const dir = mkdtempSync(join(tmpdir(), `batch-${courseSlug}-`))
  const stage = join(dir, courseSlug)
  mkdirSync(stage, { recursive: true })
  const doc = {}
  for (const l of lessons) doc[l.slug] = l.blocks || []
  writeFileSync(join(stage, `${courseSlug}.lessons.json`), JSON.stringify(doc))
  const manifest = lessons.map((m) => ({
    courseSlug, slug: m.slug, title: m.title,
    moduleTitle: m.module_title || 'Module', moduleSort: m.module_sort ?? 0, sort: m.sort ?? 0,
  }))
  writeFileSync(join(stage, `${courseSlug}.manifest.json`), JSON.stringify(manifest, null, 2))
  for (const suffix of ['lab_solutions.json', 'sources.json']) {
    const f = join('data/academy/authoring', `${courseSlug}.${suffix}`)
    if (existsSync(f)) writeFileSync(join(stage, `${courseSlug}.${suffix}`), readFileSync(f))
  }
  return dir
}

function auditCourse(courseSlug, lessons) {
  const dir = stageFromLive(courseSlug, lessons)
  const jsonOut = join(mkdtempSync(join(tmpdir(), 'batch-report-')), 'r.json')
  const args = ['tsx', 'scripts/academy/authoring/audit-courses.ts', dir, '--course', courseSlug, '--json', jsonOut]
  if (NO_LABS) args.push('--no-run-labs')
  spawnSync('npx', args, { encoding: 'utf8', timeout: 180000 })
  if (!existsSync(jsonOut)) return { course: courseSlug, error: 'no report', gate: 'FAIL', fails: 999 }
  const report = JSON.parse(readFileSync(jsonOut, 'utf8'))
  const c = Array.isArray(report) ? report.find((x) => x.course === courseSlug) || report[0] : report
  const findings = c?.findings || []
  const fails = findings.filter((f) => f.sev === 'FAIL')
  const byDim = {}
  for (const f of fails) byDim[f.dim] = (byDim[f.dim] || 0) + 1
  // anti-template / shell signal: content-heuristic FAILs (templated/hollow) or near-zero visuals
  const shellFails = fails.filter((f) => /content|template|hollow|substance/i.test(f.dim + f.msg)).length
  return {
    course: courseSlug,
    lessons: lessons.length,
    gate: c?.gate ?? 'FAIL',
    fails: fails.length,
    warns: findings.filter((f) => f.sev === 'WARN').length,
    labs: c?.counts ? `${c.counts.labsPass}/${c.counts.labsRun} pass · ${c.counts.labsUnverified} unverified` : 'n/a',
    shellSignal: shellFails,
    byDim,
    topFails: fails.slice(0, 4).map((f) => `${f.lesson}:${f.dim} ${f.msg}`.slice(0, 110)),
  }
}

async function main() {
  const { data: courses } = await sb.from('academy_courses').select('slug').eq('status', 'published').order('slug')
  console.log(`content batch — ${courses.length} courses${NO_LABS ? ' (labs skipped)' : ''}\n`)
  const board = []
  for (const { slug } of courses) {
    const { data: lessons } = await sb.from('academy_lessons').select('slug,title,blocks,module_title,module_sort,sort')
      .eq('course_slug', slug).eq('status', 'published').order('module_sort').order('sort')
    const r = auditCourse(slug, lessons || [])
    board.push(r)
    process.stdout.write(`  ${r.gate === 'PASS' ? '✅' : '❌'} ${slug.padEnd(46)} fails=${String(r.fails).padStart(3)} warns=${String(r.warns).padStart(3)} labs=${r.labs}${r.shellSignal ? ` ⚠ shell:${r.shellSignal}` : ''}\n`)
  }
  board.sort((a, b) => b.fails - a.fails || b.shellSignal - a.shellSignal)
  mkdirSync(OUT, { recursive: true })
  writeFileSync(join(OUT, 'CONTENT_BOARD.json'), JSON.stringify(board, null, 2))
  const passing = board.filter((b) => b.gate === 'PASS').length
  const shells = board.filter((b) => b.shellSignal > 0).length
  console.log(`\n═══ ${passing}/${board.length} PASS · ${shells} shell-signal · board → ${OUT}/CONTENT_BOARD.json ═══`)
  console.log('\nWORST FIRST (needs work):')
  for (const b of board.filter((x) => x.gate !== 'PASS' || x.shellSignal).slice(0, 12))
    console.log(`  ${b.course}: ${b.fails} fails${b.shellSignal ? `, shell:${b.shellSignal}` : ''} — ${(b.topFails && b.topFails[0]) || b.error || ''}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
