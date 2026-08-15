/**
 * Unit tests for the drill planner logic — the mastery-loop integrity boundary.
 * Registered into the repo's monolithic runner (tests/unit/run.mjs) via
 * `register(test)`. These lock the non-negotiable properties: exactly three
 * drills, every slug real (hallucinations dropped + back-filled), weakest-
 * dimension scenarios preferred, cap-first ordering, and throw on bad JSON.
 */

import { strict as assert } from 'node:assert'
import {
  buildDrillPlanMessages,
  parseDrills,
  DRILL_COUNT,
  type AvailableScenario,
} from '@/lib/academy/interview/drill-logic'

type TestFn = (name: string, fn: () => void | Promise<void>) => void

// Five real scenarios; trains map to rubric dimension slugs.
const SCENARIOS: AvailableScenario[] = [
  { slug: 'the-lying-test-suite', title: 'The lying test suite', track: 'coding', trains: ['verification_habit', 'technical_depth'] },
  { slug: 'design-a-rate-limiter', title: 'Design a rate limiter', track: 'system_design', trains: ['tradeoff_judgment', 'technical_depth'] },
  { slug: 'two-sum-prove-it', title: 'Two sum, prove it', track: 'coding', trains: ['verification_habit'] },
  { slug: 'the-conflict-you-lost', title: 'The conflict you lost', track: 'behavioral', trains: ['communication', 'composure'] },
  { slug: 'the-lowball-anchor', title: 'The lowball anchor', track: 'negotiation', trains: ['composure', 'tradeoff_judgment'] },
]
const SLUGS = new Set(SCENARIOS.map((s) => s.slug))

// Weakest first: tradeoff_judgment is the cap.
const WEAKEST = [
  { slug: 'tradeoff_judgment', score: 41, bar_status: 'below_bar' },
  { slug: 'verification_habit', score: 55, bar_status: 'below_bar' },
  { slug: 'communication', score: 72, bar_status: 'near_bar' },
]

export function register(test: TestFn): void {
  test('drill-logic: parseDrills returns exactly three real drills', () => {
    const raw = JSON.stringify({
      drills: [
        { scenario_slug: 'design-a-rate-limiter', tag: 'tradeoff_judgment', title: 'Rate limiter', meta: 'Attacks the cap.' },
        { scenario_slug: 'the-lying-test-suite', tag: 'verification_habit', title: 'Prove it', meta: 'Verification rep.' },
        { scenario_slug: 'the-conflict-you-lost', tag: 'communication', title: 'Conflict', meta: 'Narrate under pressure.' },
      ],
    })
    const drills = parseDrills(raw, { availableScenarios: SCENARIOS, weakestDims: WEAKEST })
    assert.equal(drills.length, DRILL_COUNT)
    for (const d of drills) assert.ok(SLUGS.has(d.scenario_slug), `slug ${d.scenario_slug} not real`)
  })

  test('drill-logic: a hallucinated scenario_slug is dropped and back-filled from real scenarios', () => {
    const raw = JSON.stringify({
      drills: [
        { scenario_slug: 'design-a-rate-limiter', tag: 'tradeoff_judgment', title: 'Rate limiter', meta: '' },
        { scenario_slug: 'invent-a-fake-scenario', tag: 'x', title: 'Ghost', meta: '' }, // hallucination → dropped
        { scenario_slug: 'the-conflict-you-lost', tag: 'communication', title: 'Conflict', meta: '' },
      ],
    })
    const drills = parseDrills(raw, { availableScenarios: SCENARIOS, weakestDims: WEAKEST })
    // Still exactly three, all real, and the fake slug is gone.
    assert.equal(drills.length, DRILL_COUNT)
    const slugs = drills.map((d) => d.scenario_slug)
    for (const s of slugs) assert.ok(SLUGS.has(s), `slug ${s} not real`)
    assert.ok(!slugs.includes('invent-a-fake-scenario'), 'hallucinated slug survived')
    assert.equal(new Set(slugs).size, DRILL_COUNT, 'drills should be distinct')
  })

  test('drill-logic: all returned slugs are within availableScenarios even when the model returns none', () => {
    const drills = parseDrills(JSON.stringify({ drills: [] }), {
      availableScenarios: SCENARIOS,
      weakestDims: WEAKEST,
    })
    assert.equal(drills.length, DRILL_COUNT)
    for (const d of drills) assert.ok(SLUGS.has(d.scenario_slug))
  })

  test('drill-logic: back-fill prefers weakest-dimension scenarios (cap-first)', () => {
    // Model returns nothing → pure deterministic back-fill. The weakest dim is
    // tradeoff_judgment, so a scenario training it must lead.
    const drills = parseDrills(JSON.stringify({ drills: [] }), {
      availableScenarios: SCENARIOS,
      weakestDims: WEAKEST,
    })
    const leadScenario = SCENARIOS.find((s) => s.slug === drills[0].scenario_slug)!
    assert.ok(
      leadScenario.trains.includes('tradeoff_judgment'),
      `lead drill ${drills[0].scenario_slug} does not attack the weakest dim`,
    )
    // Every chosen scenario should attack at least one weak dim before an
    // unrelated one is used (two-sum trains only verification_habit — still a weak
    // dim — so all three leads attack the cap set).
    const weakSet = new Set(WEAKEST.map((w) => w.slug))
    for (const d of drills) {
      const sc = SCENARIOS.find((s) => s.slug === d.scenario_slug)!
      assert.ok(sc.trains.some((t) => weakSet.has(t)), `${d.scenario_slug} attacks no weak dim`)
    }
  })

  test('drill-logic: cap-first ordering holds even when the model lists them out of order', () => {
    // Model lists a non-cap behavioral drill first; the disposer must reorder so
    // the tradeoff_judgment (weakest) scenario leads.
    const raw = JSON.stringify({
      drills: [
        { scenario_slug: 'the-conflict-you-lost', tag: 'communication', title: 'Conflict', meta: '' },
        { scenario_slug: 'design-a-rate-limiter', tag: 'tradeoff_judgment', title: 'Rate limiter', meta: '' },
        { scenario_slug: 'two-sum-prove-it', tag: 'verification_habit', title: 'Two sum', meta: '' },
      ],
    })
    const drills = parseDrills(raw, { availableScenarios: SCENARIOS, weakestDims: WEAKEST })
    assert.equal(drills[0].scenario_slug, 'design-a-rate-limiter') // attacks the weakest dim (index 0)
  })

  test('drill-logic: back-filled drills get a deterministic cap-targeting meta', () => {
    const drills = parseDrills(JSON.stringify({ drills: [] }), {
      availableScenarios: SCENARIOS,
      weakestDims: WEAKEST,
    })
    const lead = drills[0]
    assert.match(lead.meta, /weakest dimension/i)
    assert.equal(lead.tag, 'tradeoff_judgment')
  })

  test('drill-logic: parseDrills throws on malformed / empty planner output', () => {
    assert.throws(() => parseDrills('this is not json', { availableScenarios: SCENARIOS }), /JSON/i)
    assert.throws(() => parseDrills('', { availableScenarios: SCENARIOS }), /empty/i)
  })

  test('drill-logic: buildDrillPlanMessages fences the verdict and lists only real slugs', () => {
    const messages = buildDrillPlanMessages({
      verdict: { score: 41, verdict: 'no_hire', summary_sentence: 'Weak on tradeoffs.' },
      weakestDims: WEAKEST,
      availableScenarios: SCENARIOS,
    })
    assert.equal(messages.length, 2)
    const joined = messages.map((m) => m.content).join('\n')
    assert.match(joined, /NEVER invent a scenario slug/i)
    assert.match(joined, /untrusted data/i)
    assert.match(joined, /design-a-rate-limiter/)
    assert.match(joined, /attack the CAP FIRST/i)
  })
}
