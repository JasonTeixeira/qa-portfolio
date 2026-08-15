// Generate a scoring Workflow script for ONE course's lessons, written to a file
// (the slug+segment list stays out of the orchestrator context). Invoke via
// Workflow({scriptPath}). Reads a segs JSON ({slug: segmentCount}) from the sweep.
//
// Usage: node scripts/academy/authoring/gen-score-workflow.mjs <courseSlug> <segsJsonFile>

import { readFileSync, writeFileSync } from 'node:fs'

const [courseSlug, segsFile] = process.argv.slice(2)
if (!courseSlug || !segsFile) {
  console.error('usage: gen-score-workflow.mjs <courseSlug> <segsJsonFile>')
  process.exit(2)
}
const segs = JSON.parse(readFileSync(segsFile, 'utf8'))
const lessons = Object.entries(segs).map(([slug, s]) => ({ slug, segs: s }))
if (!lessons.length) { console.error('no lessons in segs file'); process.exit(1) }

const script = `export const meta = {
  name: 'score-${courseSlug}',
  description: 'Score ${courseSlug} (${lessons.length} lessons) against the 95 bar',
  phases: [{ title: 'Score', detail: 'one agent per lesson' }],
}
phase('Score')
const SHOTS = '/tmp/academy-shots'
const C = ${JSON.stringify(courseSlug)}
const LESSONS = ${JSON.stringify(lessons)}
const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['slug', 'score', 'shipReady', 'hollow', 'grounded', 'topFix'],
  properties: {
    slug: { type: 'string' }, score: { type: 'integer' }, shipReady: { type: 'boolean' },
    hollow: { type: 'boolean' }, grounded: { type: 'boolean' }, topFix: { type: 'string' },
  },
}
const promptFor = (L) => {
  const paths = Array.from({ length: L.segs }, (_, i) => SHOTS + '/lesson-' + C + '-' + L.slug + '-seg-' + i + '.png').join('\\n')
  return 'Senior engineer + pedagogy reviewer. Score ONE complete lesson rendered in its real player. Read these ' + L.segs + ' top->bottom segments:\\n' + paths + '\\n\\n' +
    'Lesson "' + L.slug + '" (course ' + C + '), AI-authored from a real source-curriculum md. Confirm it is real, >=95, NON-HOLLOW, technically correct.\\n' +
    'Score 1-100 strictly: A) VISUAL-FIRST (>=3 hero visuals show-don\\'t-tell); B) TEXT DENSITY (budgets, scannable); C) PEDAGOGY/ARC (prereq-correct, productive-failure pretest, concept, visuals, quiz, verification, teachback, transfer, sharp warm voice; capstone/mini-project must synthesize + roll-call + read as triumph); D) TECHNICAL CORRECTNESS + GROUNDING (real domain content/code/failure-modes/tradeoffs, correct — flag any error or hand-wavy filler); E) CRAFT (flag clipped/tiny/broken/empty-template). hollow=true if ANY block is auto-generated/generic/ungrounded. Bar=95.\\n' +
    'Return via StructuredOutput: slug="' + L.slug + '", score, shipReady (>=95 AND not hollow AND grounded), hollow, grounded, topFix (one line or "none").'
}
const results = await parallel(LESSONS.map((L) => () => agent(promptFor(L), { label: 'score:' + L.slug, phase: 'Score', schema: SCHEMA }).catch(() => null)))
const ok = results.filter(Boolean)
const below = ok.filter((r) => r.score < 95 || r.hollow || !r.grounded)
return {
  scored: ok.length, avg: ok.length ? Math.round(ok.reduce((s, r) => s + r.score, 0) / ok.length) : 0,
  below: below.map((r) => ({ slug: r.slug, score: r.score, hollow: r.hollow, grounded: r.grounded, topFix: r.topFix })),
  all: ok.map((r) => ({ slug: r.slug, score: r.score })),
}
`
const outPath = `/tmp/score-${courseSlug}.wf.js`
writeFileSync(outPath, script)
console.log(JSON.stringify({ scriptPath: outPath, lessons: lessons.length }))
