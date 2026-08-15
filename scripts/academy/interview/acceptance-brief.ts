/**
 * Interview Academy — company-brief acceptance check (Phase 3).
 *
 * Proves the brief integrity boundary end-to-end on REAL DeepSeek output: build
 * the brief messages from a realistic pasted senior-backend JD + a small list of
 * REAL scenarios + a tiny member history, call the live model (temp 0, JSON), and
 * run the result through parseBrief. Asserts decoded/rounds non-empty, every
 * queue slug REAL, confidence in-set, and no obviously-fabricated private facts
 * in the STRUCTURED output. This is the risky part static checks miss.
 *
 *   npx tsx --env-file=.env.local scripts/academy/interview/acceptance-brief.ts
 *
 * Exit 0 = PASS. Costs one real DeepSeek call.
 */
import { deepSeekChat } from '@/lib/rag/deepseek'
import {
  buildBriefMessages,
  parseBrief,
  BRIEF_CONFIDENCE,
  type BriefScenario,
  type BriefMemberHistory,
} from '@/lib/academy/interview/brief-logic'

// A realistic pasted JD for a senior backend role.
const JD_TEXT = `Senior Backend Engineer — Meridian Labs

About the role:
You will design and operate high-throughput services that back our real-time
data platform. We ship to production continuously and expect engineers to own
reliability end to end, including on-call rotation.

What you'll do:
- Design distributed systems for low-latency, high-availability workloads
- Write Go and work with PostgreSQL at scale (sharding, replication, query tuning)
- Add tests and observability as first-class parts of every change
- Make and defend architecture tradeoffs in design reviews
- Collaborate across teams and mentor mid-level engineers

Requirements:
- 5+ years building backend services in a typed language
- Strong grasp of concurrency, caching, and data modeling
- A habit of proving correctness with tests, not assertions
- Clear written and verbal communication under pressure`

// A tiny, realistic member history (their OWN readiness — weakest first).
const memberHistory: BriefMemberHistory = {
  targetLevel: 'senior',
  sessionsCount: 4,
  latestVerdict: 'lean_hire',
  latestScore: 74,
  readiness: [
    { slug: 'tradeoff_judgment', score: 63, bar_status: 'below_bar' },
    { slug: 'communication', score: 71, bar_status: 'near_bar' },
    { slug: 'verification_habit', score: 82, bar_status: 'above_bar' },
    { slug: 'technical_depth', score: 84, bar_status: 'above_bar' },
  ],
}

// Real published scenario slugs (matching the seed set).
const availableScenarios: BriefScenario[] = [
  { slug: 'the-lying-test-suite', title: 'The lying test suite', track: 'coding', trains: ['verification_habit', 'technical_depth'] },
  { slug: 'design-a-rate-limiter', title: 'Design a rate limiter', track: 'system_design', trains: ['tradeoff_judgment', 'technical_depth'] },
  { slug: 'two-sum-prove-it', title: 'Two sum, prove it', track: 'coding', trains: ['verification_habit'] },
  { slug: 'the-conflict-you-lost', title: 'The conflict you lost', track: 'behavioral', trains: ['communication', 'composure'] },
  { slug: 'the-lowball-anchor', title: 'The lowball anchor', track: 'negotiation', trains: ['composure', 'tradeoff_judgment'] },
]
const REAL_SLUGS = new Set(availableScenarios.map((s) => s.slug))
const availableSlugs = availableScenarios.map((s) => s.slug)

// Private facts NOT present in the JD — a grounded brief must not assert these.
const FABRICATION_MARKERS = [
  /\$\s?\d{2,3}\s?[kK]\b/, // a comp figure like $250k
  /\b\d{2,4}\s+(engineers|employees|people)\b/i, // headcount claim
  /\bseries\s+[a-e]\b/i, // funding stage
  /\bheadcount\b/i,
]

function assert(cond: unknown, msg: string): void {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`)
}

async function main(): Promise<void> {
  console.log('→ calling live DeepSeek brief generator (temp 0, JSON)…')
  const result = await deepSeekChat({
    messages: buildBriefMessages({
      jdText: JD_TEXT,
      memberHistory,
      availableScenarios,
      company: 'Meridian Labs',
      role: 'Senior Backend Engineer',
    }),
    temperature: 0,
    maxTokens: 1100,
  })
  console.log(`← model returned ${result.content.length} chars`)

  const brief = parseBrief(result.content, { availableSlugs })

  // Integrity assertions on REAL model output.
  assert(brief.decoded.length > 0, 'decoded phrases must be non-empty')
  assert(brief.rounds.length > 0, 'predicted rounds must be non-empty')
  assert(brief.queue.length > 0, 'tuned queue must be non-empty')
  for (const slug of brief.queue) assert(REAL_SLUGS.has(slug), `hallucinated / unreal queue slug: ${slug}`)
  assert(new Set(brief.queue).size === brief.queue.length, 'queue slugs are not distinct')
  assert((BRIEF_CONFIDENCE as readonly string[]).includes(brief.confidence), `confidence out of set: ${brief.confidence}`)

  // No obviously-fabricated PRIVATE facts in the structured output.
  const haystack = [
    brief.edge,
    brief.risk,
    ...brief.decoded.flatMap((d) => [d.phrase, d.means]),
    ...brief.rounds.flatMap((r) => [r.name, r.focus]),
  ].join(' \n ')
  for (const re of FABRICATION_MARKERS) {
    assert(!re.test(haystack), `brief asserts a private fact not in the JD (matched ${re}): "${haystack.slice(0, 200)}…"`)
  }

  console.log('\n=== REAL COMPANY BRIEF (from live model, disposed by parseBrief) ===')
  console.log(`  company: Meridian Labs · role: Senior Backend Engineer · confidence: ${brief.confidence}`)
  console.log('\n  decoded:')
  brief.decoded.forEach((d) => console.log(`   - "${d.phrase}" → ${d.means}`))
  console.log('\n  predicted rounds:')
  brief.rounds.forEach((r) => console.log(`   - ${r.name}: ${r.focus}`))
  console.log(`\n  edge: ${brief.edge}`)
  console.log(`  risk: ${brief.risk}`)
  console.log(`\n  tuned queue (all REAL): ${brief.queue.join(', ')}`)
  console.log('\n  no fabricated private company facts in the structured output  ✓')
  console.log('\n═══ BRIEF ACCEPTANCE: PASS ═══')
}

main().catch((err) => {
  console.error('\n═══ BRIEF ACCEPTANCE: FAIL ═══')
  console.error(err)
  process.exit(1)
})
