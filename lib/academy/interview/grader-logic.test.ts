/**
 * Unit tests for the committee grader logic — the integrity boundary. Registered
 * into the repo's monolithic runner (tests/unit/run.mjs) via `register(test)`.
 * These lock the non-negotiable properties: deterministic min-cap, taxonomy
 * enforcement, score clamping, derived verdict band, and caught_the_lie credit.
 */

import { strict as assert } from 'node:assert'
import { buildGraderMessages, parseVerdict } from '@/lib/academy/interview/grader-logic'

type TestFn = (name: string, fn: () => void | Promise<void>) => void

function sixDims(overrides: Record<string, number> = {}, base = 80): Array<{ slug: string; score: number }> {
  const slugs = [
    'problem_framing',
    'communication',
    'technical_depth',
    'tradeoff_judgment',
    'verification_habit',
    'composure',
  ]
  return slugs.map((slug) => ({ slug, score: slug in overrides ? overrides[slug] : base }))
}

export function register(test: TestFn): void {
  test('grader-logic: parseVerdict applies the deterministic min-cap (one 40 caps overall at 40)', () => {
    const raw = JSON.stringify({
      overall: 95, // the model's claimed overall — must be IGNORED
      verdict: 'strong_hire', // the model's claimed verdict — must be IGNORED
      dims: sixDims({ verification_habit: 40 }, 88),
      evidence: [{ ts_seconds: 1922, mark: 'catch', title: 'Caught the lie', note: 'Flagged the bad test.' }],
      summary_sentence: 'Strong everywhere except verification.',
      claims_checked: 3,
    })
    const v = parseVerdict(raw, { level: 'senior', prevScore: 55, words: 300 })
    assert.equal(v.score, 40) // min over dims, NOT the model's 95
    assert.equal(v.prev_score, 55)
    assert.equal(v.words, 300)
  })

  test('grader-logic: parseVerdict rejects an out-of-taxonomy dimension slug', () => {
    const raw = JSON.stringify({
      dims: [...sixDims(), { slug: 'charisma', score: 90 }],
    })
    assert.throws(() => parseVerdict(raw, { level: 'senior' }), /out-of-taxonomy/i)
  })

  test('grader-logic: parseVerdict clamps an out-of-range score (130 → 100)', () => {
    const raw = JSON.stringify({
      dims: sixDims({ technical_depth: 130 }, 70),
    })
    const v = parseVerdict(raw, { level: 'senior' })
    const td = v.dims.find((d) => d.slug === 'technical_depth')
    assert.equal(td?.score, 100) // clamped
    assert.equal(v.score, 70) // min over the (now-clamped) dims
  })

  test('grader-logic: parseVerdict derives the verdict band from the capped score', () => {
    // Capped at 40 vs the senior bar (84): delta -44 ⇒ strong_no_hire.
    const low = parseVerdict(JSON.stringify({ dims: sixDims({ verification_habit: 40 }, 88) }), {
      level: 'senior',
    })
    assert.equal(low.verdict, 'strong_no_hire')

    // All 90 vs the senior bar (84): delta +6 ⇒ hire (strong_hire needs +8).
    const solid = parseVerdict(JSON.stringify({ dims: sixDims({}, 90) }), { level: 'senior' })
    assert.equal(solid.score, 90)
    assert.equal(solid.verdict, 'hire')
  })

  test('grader-logic: parseVerdict throws on malformed / empty grader output', () => {
    assert.throws(() => parseVerdict('this is not json', { level: 'senior' }), /JSON/i)
    assert.throws(() => parseVerdict(JSON.stringify({ dims: [] }), { level: 'senior' }), /no dimensions/i)
    assert.throws(() => parseVerdict('', { level: 'senior' }), /empty/i)
  })

  test('grader-logic: parseVerdict rejects an incomplete dimension set (missing dim would inflate the cap)', () => {
    // Drop verification_habit (the usual cap). A min over 5 dims would inflate the
    // overall by omitting the weakest — the full six-dimension taxonomy is required.
    const five = sixDims({}, 88).filter((d) => d.slug !== 'verification_habit')
    assert.throws(
      () => parseVerdict(JSON.stringify({ dims: five }), { level: 'senior' }),
      /exactly the 6 fixed dimensions/i,
    )
    // A duplicated dimension (6 entries, 5 distinct) is likewise rejected.
    const dup = [...five, { slug: 'communication', score: 88 }]
    assert.throws(() => parseVerdict(JSON.stringify({ dims: dup }), { level: 'senior' }), /fixed dimensions/i)
  })

  test('grader-logic: buildGraderMessages credits whether the candidate caught the lying test', () => {
    const caught = buildGraderMessages({
      transcript: [{ speaker: 'candidate', content: 'This test asserts the wrong value.', ts_seconds: 90 }],
      artifacts: [{ kind: 'code', payload: { caught_the_lie: true, test_results: [{ name: 'a', passed: true }] } }],
      level: 'senior',
    })
      .map((m) => m.content)
      .join('\n')
    assert.match(caught, /CAUGHT the lying test: YES/)

    const missed = buildGraderMessages({
      transcript: [{ speaker: 'candidate', content: 'All green, looks done.', ts_seconds: 90 }],
      artifacts: [{ kind: 'code', payload: { caught_the_lie: false, test_results: [] } }],
      level: 'senior',
    })
      .map((m) => m.content)
      .join('\n')
    assert.match(missed, /CAUGHT the lying test: NO/)
  })
}
