/**
 * Interview Academy — drill planner acceptance check (Phase 2).
 *
 * Proves the mastery-loop integrity boundary end-to-end on REAL DeepSeek output:
 * build the drill-plan messages from a realistic senior verdict (weakest =
 * tradeoff_judgment) + a small list of REAL scenarios, call the live model
 * (temp 0, JSON), and run the result through parseDrills. Asserts exactly three
 * drills, every slug a REAL scenario, and cap-first ordering (the weakest
 * dimension is attacked first). This is the risky part static checks miss.
 *
 *   npx tsx --env-file=.env.local scripts/academy/interview/acceptance-drills.ts
 *
 * Exit 0 = PASS. Costs one real DeepSeek call.
 */
import { deepSeekChat } from '@/lib/rag/deepseek'
import {
  buildDrillPlanMessages,
  parseDrills,
  DRILL_COUNT,
  type AvailableScenario,
} from '@/lib/academy/interview/drill-logic'

// A realistic senior verdict capped by tradeoff_judgment.
const verdict = { score: 43, verdict: 'no_hire' as const, summary_sentence: 'Solid coder, but folds on tradeoffs under pressure.' }

// Weakest first — tradeoff_judgment is the cap.
const weakestDims = [
  { slug: 'tradeoff_judgment', score: 43, bar_status: 'below_bar' },
  { slug: 'composure', score: 58, bar_status: 'below_bar' },
  { slug: 'verification_habit', score: 66, bar_status: 'near_bar' },
]

// Real published scenario slugs (matching the seed set).
const availableScenarios: AvailableScenario[] = [
  { slug: 'the-lying-test-suite', title: 'The lying test suite', track: 'coding', trains: ['verification_habit', 'technical_depth'] },
  { slug: 'design-a-rate-limiter', title: 'Design a rate limiter', track: 'system_design', trains: ['tradeoff_judgment', 'technical_depth'] },
  { slug: 'two-sum-prove-it', title: 'Two sum, prove it', track: 'coding', trains: ['verification_habit'] },
  { slug: 'the-conflict-you-lost', title: 'The conflict you lost', track: 'behavioral', trains: ['communication', 'composure'] },
  { slug: 'the-lowball-anchor', title: 'The lowball anchor', track: 'negotiation', trains: ['composure', 'tradeoff_judgment'] },
]
const REAL_SLUGS = new Set(availableScenarios.map((s) => s.slug))

function assert(cond: unknown, msg: string): void {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`)
}

/** capPriority mirror: index of the earliest weak dim a scenario trains (lower = weaker). */
function capPriority(slug: string): number {
  const sc = availableScenarios.find((s) => s.slug === slug)!
  const weakSlugs = weakestDims.map((w) => w.slug)
  let best = Number.POSITIVE_INFINITY
  for (const dim of sc.trains) {
    const idx = weakSlugs.indexOf(dim)
    if (idx >= 0 && idx < best) best = idx
  }
  return best
}

async function main(): Promise<void> {
  console.log('→ calling live DeepSeek drill planner (temp 0, JSON)…')
  const result = await deepSeekChat({
    messages: buildDrillPlanMessages({ verdict, weakestDims, availableScenarios }),
    temperature: 0,
    maxTokens: 700,
  })
  console.log(`← model returned ${result.content.length} chars`)

  const drills = parseDrills(result.content, { availableScenarios, weakestDims })

  // Integrity assertions on REAL model output.
  assert(drills.length === DRILL_COUNT, `expected ${DRILL_COUNT} drills, got ${drills.length}`)
  const slugs = drills.map((d) => d.scenario_slug)
  for (const s of slugs) assert(REAL_SLUGS.has(s), `hallucinated / unreal scenario slug: ${s}`)
  assert(new Set(slugs).size === DRILL_COUNT, 'drills are not distinct')
  // Cap-first: priorities must be non-decreasing (weakest-attacking scenario leads).
  const priorities = slugs.map(capPriority)
  for (let i = 1; i < priorities.length; i += 1) {
    assert(priorities[i] >= priorities[i - 1], `cap-first ordering broken at ${i}: ${priorities.join(',')}`)
  }
  assert(priorities[0] === 0, `lead drill must attack the weakest dim (tradeoff_judgment); got priority ${priorities[0]}`)

  console.log('\n=== REAL DRILL PLAN (from live model, disposed by parseDrills) ===')
  drills.forEach((d, i) => {
    console.log(`  ${i + 1}. [${d.tag}]  ${d.scenario_slug}  — ${d.title}`)
    console.log(`      ${d.meta}`)
  })
  console.log(`\n  cap-first held: lead attacks the weakest dim (tradeoff_judgment)  ✓`)
  console.log('\n═══ DRILL ACCEPTANCE: PASS ═══')
}

main().catch((err) => {
  console.error('\n═══ DRILL ACCEPTANCE: FAIL ═══')
  console.error(err)
  process.exit(1)
})
