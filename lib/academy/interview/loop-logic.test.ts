/**
 * Unit tests for the loop-simulation aggregate — the deterministic-overall
 * integrity boundary. Registered into tests/unit/run.mjs via `register(test)`.
 * These lock: the overall is the mean of the round scores banded by the level
 * bar, a weak round honestly drags the loop down, ungraded rounds do not become
 * a fabricated zero, and 0 graded rounds yields incomplete (null).
 */

import { strict as assert } from 'node:assert'
import { aggregateLoopVerdict } from '@/lib/academy/interview/loop-logic'
import { committeeVerdict, barForLevel } from '@/lib/academy/interview/rubric'

type TestFn = (name: string, fn: () => void | Promise<void>) => void

export function register(test: TestFn): void {
  test('loop-logic: overall is the mean of round scores, banded against the level bar', () => {
    const rounds = [
      { score: 80, verdict: 'hire', track: 'coding' },
      { score: 70, verdict: 'lean_hire', track: 'system_design' },
      { score: 90, verdict: 'strong_hire', track: 'behavioral' },
    ]
    const agg = aggregateLoopVerdict(rounds, { level: 'senior' })
    assert.ok(agg, 'expected an aggregate')
    // mean(80,70,90) = 80
    assert.equal(agg!.overall, 80)
    assert.equal(agg!.gradedRounds, 3)
    // verdict is DERIVED, exactly committeeVerdict(80, senior bar).
    assert.equal(agg!.verdict, committeeVerdict(80, barForLevel('senior')))
    assert.equal(agg!.perRound.length, 3)
  })

  test('loop-logic: a weak round honestly drags the loop down', () => {
    const strong = aggregateLoopVerdict(
      [
        { score: 88, track: 'coding' },
        { score: 86, track: 'system_design' },
      ],
      { level: 'senior' },
    )
    const dragged = aggregateLoopVerdict(
      [
        { score: 88, track: 'coding' },
        { score: 86, track: 'system_design' },
        { score: 40, track: 'behavioral' }, // one bombed round
      ],
      { level: 'senior' },
    )
    assert.ok(strong && dragged)
    assert.ok(dragged!.overall < strong!.overall, 'the weak round must lower the overall')
    // mean(88,86,40) = 71 (rounded)
    assert.equal(dragged!.overall, 71)
  })

  test('loop-logic: ungraded rounds are skipped, not counted as zero', () => {
    const agg = aggregateLoopVerdict(
      [
        { score: 80, track: 'coding' },
        { score: Number.NaN, track: 'system_design' }, // ungraded
        { score: 70, track: 'behavioral' },
      ],
      { level: 'mid' },
    )
    assert.ok(agg)
    assert.equal(agg!.gradedRounds, 2)
    // mean over the two graded rounds only = 75 (not (80+0+70)/3).
    assert.equal(agg!.overall, 75)
  })

  test('loop-logic: zero rounds is incomplete (null)', () => {
    assert.equal(aggregateLoopVerdict([], { level: 'senior' }), null)
  })

  test('loop-logic: all rounds ungraded is incomplete (null)', () => {
    const agg = aggregateLoopVerdict(
      [
        { score: Number.NaN, track: 'coding' },
        { score: Number.POSITIVE_INFINITY, track: 'system_design' },
      ],
      { level: 'senior' },
    )
    assert.equal(agg, null)
  })

  test('loop-logic: scores are clamped into 0–100 before averaging', () => {
    const agg = aggregateLoopVerdict(
      [
        { score: 150, track: 'coding' }, // clamps to 100
        { score: -20, track: 'system_design' }, // clamps to 0
      ],
      { level: 'senior' },
    )
    assert.ok(agg)
    assert.equal(agg!.overall, 50) // mean(100, 0)
  })

  test('loop-logic: unknown level falls back to the senior bar', () => {
    const rounds = [{ score: 84, track: 'coding' }]
    const unknown = aggregateLoopVerdict(rounds, { level: 'staff' })
    const senior = aggregateLoopVerdict(rounds, { level: 'senior' })
    assert.ok(unknown && senior)
    assert.equal(unknown!.verdict, senior!.verdict)
  })
}
