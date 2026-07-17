/**
 * Interview Academy — grader acceptance check (Phase 1).
 *
 * Proves the integrity boundary end-to-end on REAL DeepSeek output: build the
 * committee-grader messages from a realistic transcript, call the live model
 * (temp 0, JSON), and run the result through parseVerdict. Asserts the verdict
 * is well-formed AND that the deterministic min-cap held (overall == min dim,
 * not the model's claimed number). This is the risky part static checks miss.
 *
 *   npx tsx --env-file=.env.local scripts/academy/interview/acceptance-grader.mts
 *
 * Exit 0 = PASS. Costs one real DeepSeek call.
 */
import { deepSeekChat } from '@/lib/rag/deepseek'
import { buildGraderMessages, parseVerdict } from '@/lib/academy/interview/grader-logic'

const DIM_COUNT = 6 // the fixed six-dimension taxonomy (rubric.ts)

const transcript = [
  { speaker: 'interviewer' as const, content: 'Before you code: what invariant makes merge_intervals correct?', ts_seconds: 15 },
  { speaker: 'candidate' as const, content: 'After sorting by start, I merge the current interval into the last one in the output whenever start <= last.end; otherwise I push a new interval. The invariant is that the output is always sorted and disjoint.', ts_seconds: 62 },
  { speaker: 'interviewer' as const, content: 'The suite is green. Which of those tests would still pass if your code were subtly wrong?', ts_seconds: 210 },
  { speaker: 'candidate' as const, content: 'The already_sorted_output test passes even without sorting, because its input happens to be pre-sorted — a green bar there proves nothing. I added an unsorted input to actually exercise the sort, and it caught a version that skipped sorting.', ts_seconds: 268 },
  { speaker: 'interviewer' as const, content: 'Good. Complexity?', ts_seconds: 300 },
  { speaker: 'candidate' as const, content: 'O(n log n) for the sort, O(n) for the single pass, O(n) output. The sort dominates.', ts_seconds: 322 },
]

const artifacts = [
  {
    kind: 'code' as const,
    payload: {
      filename: 'solution.py',
      code: 'def merge_intervals(intervals):\n    intervals = sorted(intervals)\n    out = []\n    for iv in intervals:\n        if out and iv[0] <= out[-1][1]:\n            out[-1][1] = max(out[-1][1], iv[1])\n        else:\n            out.append(list(iv))\n    return out\n',
      test_results: [
        { name: 'merges_two_overlapping', passed: true, hidden: false },
        { name: 'keeps_disjoint', passed: true, hidden: false },
        { name: 'already_sorted_output', passed: true, hidden: false },
        { name: 'unsorted_input', passed: true, hidden: true },
      ],
      caught_the_lie: true,
    },
  },
]

function assert(cond: unknown, msg: string): void {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`)
}

async function main(): Promise<void> {
  console.log('→ calling live DeepSeek grader (temp 0, JSON)…')
  const result = await deepSeekChat({
    messages: buildGraderMessages({ transcript, artifacts, level: 'senior' }),
    temperature: 0,
    maxTokens: 1400,
  })
  console.log(`← model returned ${result.content.length} chars`)

  const verdict = parseVerdict(result.content, { level: 'senior', prevScore: 71, words: 96 })

  // Integrity assertions on REAL model output.
  assert(verdict.dims.length === DIM_COUNT, `expected ${DIM_COUNT} dims, got ${verdict.dims.length}`)
  const slugs = new Set(verdict.dims.map((d) => d.slug))
  assert(slugs.size === DIM_COUNT, 'dims not the full distinct taxonomy')
  for (const d of verdict.dims) assert(d.score >= 0 && d.score <= 100, `dim ${d.slug} out of range: ${d.score}`)
  const minDim = Math.min(...verdict.dims.map((d) => d.score))
  assert(verdict.score === minDim, `overall ${verdict.score} is NOT the min-cap ${minDim} — integrity break`)
  assert(
    ['strong_hire', 'hire', 'lean_hire', 'no_hire', 'strong_no_hire'].includes(verdict.verdict),
    `bad verdict band: ${verdict.verdict}`,
  )

  console.log('\n=== REAL VERDICT (from live model, disposed by parseVerdict) ===')
  console.log(`  overall (min-cap): ${verdict.score}   verdict: ${verdict.verdict}   prev: ${verdict.prev_score}`)
  console.log('  dimensions:')
  for (const d of verdict.dims) console.log(`    ${String(d.score).padStart(3)}  ${d.bar_status.padEnd(10)}  ${d.slug}`)
  console.log(`  evidence moments: ${verdict.evidence.length}`)
  console.log(`  summary: ${verdict.summary_sentence}`)
  console.log(`\n  min-cap held: overall(${verdict.score}) === min dim(${minDim})  ✓`)
  console.log('\n═══ GRADER ACCEPTANCE: PASS ═══')
}

main().catch((err) => {
  console.error('\n═══ GRADER ACCEPTANCE: FAIL ═══')
  console.error(err)
  process.exit(1)
})
