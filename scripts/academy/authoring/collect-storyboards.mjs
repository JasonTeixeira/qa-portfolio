// Collect authored storyboards (from the gen-storyboards Workflow output) into a
// course's lesson JSON — with HARD validation against the real diagram.
//
// For each lesson's diagram block we build the real node-id + edge-key sets and:
//   - filter every beat's `nodes` to ids that EXIST in the diagram,
//   - filter every beat's `edges` to [from,to] pairs that EXIST in the diagram,
//   - keep only beats that still have a `say` line,
// then write the cleaned `storyboard` onto the diagram block. A fabricated ref can
// never survive. Idempotent. Dry-run by default.
//
// Usage: node scripts/academy/authoring/collect-storyboards.mjs <wf-output.json> [--apply]

import { readFileSync, writeFileSync } from 'node:fs'

const [inPath, ...rest] = process.argv.slice(2)
const APPLY = rest.includes('--apply')
if (!inPath) { console.error('usage: collect-storyboards.mjs <wf-output.json> [--apply]'); process.exit(2) }

const raw = JSON.parse(readFileSync(inPath, 'utf8'))
const result = raw.result ?? raw
const course = result.course
const storyboards = result.storyboards ?? []
if (!course || !storyboards.length) { console.error('no course/storyboards in input'); process.exit(1) }

const jsonPath = `data/academy/authoring/${course}.lessons.json`
const data = JSON.parse(readFileSync(jsonPath, 'utf8'))

let applied = 0, missing = 0, droppedRefs = 0, droppedBeats = 0
const report = []

for (const sb of storyboards) {
  const blocks = data[sb.slug]
  if (!blocks) { missing++; report.push(`MISS ${sb.slug} (no lesson)`); continue }
  const diagram = blocks.find((b) => b.type === 'diagram')
  if (!diagram || !Array.isArray(diagram.nodes)) { missing++; report.push(`MISS ${sb.slug} (no diagram)`); continue }

  const nodeIds = new Set(diagram.nodes.map((n) => n.id))
  const edgeKeys = new Set((diagram.edges ?? []).map((e) => `${e.from}->${e.to}`))

  const clean = []
  for (const beat of sb.beats ?? []) {
    if (!beat || typeof beat.say !== 'string' || !beat.say.trim()) { droppedBeats++; continue }
    const nodes = (beat.nodes ?? []).filter((n) => {
      const ok = nodeIds.has(n); if (!ok) droppedRefs++; return ok
    })
    const edges = (beat.edges ?? []).filter((p) => {
      const ok = Array.isArray(p) && p.length === 2 && edgeKeys.has(`${p[0]}->${p[1]}`)
      if (!ok) droppedRefs++; return ok
    })
    const ms = Number.isFinite(beat.ms) ? Math.min(6000, Math.max(2800, beat.ms)) : 3800
    clean.push({ say: beat.say.trim(), nodes, edges, ms })
  }
  if (!clean.length) { report.push(`skip ${sb.slug} (no valid beats)`); continue }
  diagram.storyboard = clean
  applied++
  report.push(`OK   ${sb.slug} · ${clean.length} beats · ${clean.reduce((a, b) => a + b.nodes.length, 0)} node-spots`)
}

console.log(`storyboards: ${storyboards.length} | applied: ${applied} | missing: ${missing} | dropped bad refs: ${droppedRefs} | dropped empty beats: ${droppedBeats}`)
for (const r of report) console.log('  ' + r)

if (!APPLY) { console.log('\nDRY RUN — re-run with --apply to write the course JSON, then apply-course.ts ' + course + ' --apply'); process.exit(0) }
writeFileSync(jsonPath, JSON.stringify(data, null, 2))
console.log(`\nWROTE ${jsonPath}. Now: npx tsx --env-file=.env.local scripts/academy/authoring/apply-course.ts ${course} --apply`)
