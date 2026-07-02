// Merge authored lab blocks (from a gen-lab Workflow output) into a course's lesson JSON.
// Reads the task-output {result:{course, labs:[{slug,title,summary,starter,check,stdin?}]}},
// inserts a `lab` block into each lesson's blocks just BEFORE the prove/consolidate tail
// (verification | teachback | spaced-review | transfer | sprint-contract), falling back to
// append. Idempotent: skips lessons that already have a lab block. Dry-run by default.
//
// Usage: node scripts/academy/authoring/collect-labs.mjs <task-output.json> [--apply]

import { readFileSync, writeFileSync } from 'node:fs'

const [inPath, ...rest] = process.argv.slice(2)
const APPLY = rest.includes('--apply')
if (!inPath) { console.error('usage: collect-labs.mjs <task-output.json> [--apply]'); process.exit(2) }

const raw = JSON.parse(readFileSync(inPath, 'utf8'))
const result = raw.result ?? raw
const course = result.course
const labs = result.labs ?? []
if (!course || !labs.length) { console.error('no course/labs in input'); process.exit(1) }

const jsonPath = `data/academy/authoring/${course}.lessons.json`
const data = JSON.parse(readFileSync(jsonPath, 'utf8'))

const TAIL = new Set(['verification', 'teachback', 'spaced-review', 'transfer', 'sprint-contract'])
let inserted = 0, skipped = 0, missing = 0
const report = []
for (const lab of labs) {
  const blocks = data[lab.slug]
  if (!blocks) { missing++; report.push(`MISS ${lab.slug} (no lesson)`); continue }
  if (blocks.some((b) => b.type === 'lab')) { skipped++; report.push(`skip ${lab.slug} (already has lab)`); continue }
  const block = { type: 'lab', title: lab.title, summary: lab.summary, starter: lab.starter, check: lab.check }
  if (lab.stdin != null && String(lab.stdin).length) block.stdin = lab.stdin
  const at = blocks.findIndex((b) => TAIL.has(b.type))
  if (at === -1) blocks.push(block)
  else blocks.splice(at, 0, block)
  inserted++
  report.push(`OK   ${lab.slug} @${at === -1 ? 'end' : at} · check=${JSON.stringify(String(lab.check).slice(0, 40))}`)
}

console.log(`labs: ${labs.length} | inserted: ${inserted} | skipped: ${skipped} | missing: ${missing}`)
for (const r of report) console.log('  ' + r)

if (!APPLY) { console.log('\nDRY RUN — re-run with --apply to write the course JSON, then apply-course.ts ' + course + ' --apply'); process.exit(0) }
writeFileSync(jsonPath, JSON.stringify(data, null, 2))
console.log(`\nWROTE ${jsonPath}. Now: npx tsx --env-file=.env.local scripts/academy/authoring/apply-course.ts ${course} --apply`)
