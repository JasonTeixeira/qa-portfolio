/**
 * ASSESSMENT INTEGRITY — a permanent hard-fail gate over every live quiz.
 *
 * The academy's thesis is "proof, not vibes": unlock-gates consume quiz results, so a quiz that
 * can be passed WITHOUT READING makes the gate certify nothing. On 2026-07-17 a direct count found
 * the correct answer was the LONGEST option in 621/632 (98.3%, random ~25%) and at index 1 in 88.1%.
 * This script makes that measurable, gated, and impossible to silently regress.
 *
 *   node --env-file=.env.local scripts/academy/quality/quiz-integrity.mjs [--course <slug>] [--json <out>]
 *
 * Exit 0 = PASS. Exit 1 = FAIL (a "answer without reading" strategy beats chance).
 */
import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'node:fs'

const args = process.argv.slice(2)
const only = args.includes('--course') ? args[args.indexOf('--course') + 1] : null
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null

// Thresholds: with 4 options, a blind strategy should win ~25%. We allow honest variance but
// nothing that makes a tell *reliable*.
const MAX_LONGEST_WINS = 0.35   // "always pick the longest" must not beat this
const MAX_INDEX_SHARE = 0.35    // no single answer position may dominate
const MAX_LEN_ADVANTAGE = 0.25  // correct option may not average >25% longer than distractors

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const q = sb.from('academy_lessons').select('course_slug,slug,blocks').eq('status', 'published')
const { data: lessons, error } = only ? await q.eq('course_slug', only) : await q
if (error) { console.error('supabase:', error.message); process.exit(1) }

const quizzes = []
for (const l of lessons ?? []) {
  for (const b of l.blocks ?? []) {
    if (b.type !== 'quiz' || !Array.isArray(b.options) || typeof b.answer !== 'number') continue
    if (b.answer < 0 || b.answer >= b.options.length) continue
    quizzes.push({ course: l.course_slug, lesson: l.slug, options: b.options.map(String), answer: b.answer, question: String(b.question ?? '') })
  }
}
if (quizzes.length === 0) { console.log('no quizzes found'); process.exit(0) }

const idx = {}
let longestWins = 0
let advantageSum = 0
const perCourse = {}
const offenders = []

for (const z of quizzes) {
  const lens = z.options.map((o) => o.length)
  const max = Math.max(...lens)
  const correctLen = lens[z.answer]
  const others = lens.filter((_, i) => i !== z.answer)
  const avgOther = others.reduce((a, b) => a + b, 0) / Math.max(1, others.length)
  const advantage = avgOther > 0 ? (correctLen - avgOther) / avgOther : 0
  advantageSum += advantage
  const isLongest = correctLen === max
  if (isLongest) longestWins++
  idx[z.answer] = (idx[z.answer] || 0) + 1
  const c = (perCourse[z.course] ||= { n: 0, longest: 0, advSum: 0, idx: {} })
  c.n++; if (isLongest) c.longest++; c.advSum += advantage; c.idx[z.answer] = (c.idx[z.answer] || 0) + 1
  // an individual quiz is an offender when the tell is blatant
  if (isLongest && advantage > 0.5) offenders.push({ course: z.course, lesson: z.lesson, advantage: +(advantage * 100).toFixed(0), q: z.question.slice(0, 70) })
}

const n = quizzes.length
const longestRate = longestWins / n
const maxIdxShare = Math.max(...Object.values(idx)) / n
const avgAdvantage = advantageSum / n

const fails = []
if (longestRate > MAX_LONGEST_WINS) fails.push(`longest-option-wins ${(longestRate * 100).toFixed(1)}% > ${(MAX_LONGEST_WINS * 100)}% — a learner can pass without reading`)
if (maxIdxShare > MAX_INDEX_SHARE) fails.push(`answer-position bias ${(maxIdxShare * 100).toFixed(1)}% on one index > ${(MAX_INDEX_SHARE * 100)}%`)
if (avgAdvantage > MAX_LEN_ADVANTAGE) fails.push(`correct option averages ${(avgAdvantage * 100).toFixed(1)}% longer than distractors > ${(MAX_LEN_ADVANTAGE * 100)}%`)

const report = {
  generated: new Date().toISOString(),
  scope: only ?? 'all published',
  quizzes: n,
  longestWins: { count: longestWins, rate: +longestRate.toFixed(4), threshold: MAX_LONGEST_WINS },
  answerIndex: { distribution: idx, maxShare: +maxIdxShare.toFixed(4), threshold: MAX_INDEX_SHARE },
  lengthAdvantage: { avg: +avgAdvantage.toFixed(4), threshold: MAX_LEN_ADVANTAGE },
  gate: fails.length === 0 ? 'PASS' : 'FAIL',
  fails,
  worstCourses: Object.entries(perCourse)
    .map(([course, c]) => ({ course, quizzes: c.n, longestRate: +(c.longest / c.n).toFixed(3), avgAdvantage: +(c.advSum / c.n).toFixed(3), idx: c.idx }))
    .sort((a, b) => b.longestRate - a.longestRate || b.avgAdvantage - a.avgAdvantage),
  blatantOffenders: offenders.length,
}
if (jsonOut) writeFileSync(jsonOut, JSON.stringify(report, null, 2))

console.log(`\n═══ ASSESSMENT INTEGRITY · ${n} quizzes · ${report.scope} ═══`)
console.log(`  longest-option-wins : ${(longestRate * 100).toFixed(1)}%  (random ~25%, gate ≤${MAX_LONGEST_WINS * 100}%)`)
console.log(`  answer-index spread : ${JSON.stringify(idx)}  maxShare ${(maxIdxShare * 100).toFixed(1)}% (gate ≤${MAX_INDEX_SHARE * 100}%)`)
console.log(`  correct-vs-distractor length advantage : ${(avgAdvantage * 100).toFixed(1)}% (gate ≤${MAX_LEN_ADVANTAGE * 100}%)`)
console.log(`  blatant single-quiz tells (>50% longer) : ${offenders.length}`)
console.log(`\n  GATE: ${report.gate}${fails.length ? '\n   ✗ ' + fails.join('\n   ✗ ') : ''}`)
if (report.gate === 'FAIL') {
  console.log('\n  worst courses:')
  for (const c of report.worstCourses.slice(0, 8)) console.log(`    ${(c.longestRate * 100).toFixed(0).padStart(3)}% longest · +${(c.avgAdvantage * 100).toFixed(0)}% len · ${c.course}`)
}
process.exit(report.gate === 'PASS' ? 0 : 1)
