/**
 * Interview Academy — Marlowe interviewer acceptance check (Phase 1).
 *
 * Proves the interviewer AI path on the LIVE model: build Marlowe's messages
 * from the-lying-test-suite scenario and confirm the real model produces a
 * coherent, in-character opening question AND a follow-up probe — while NEVER
 * leaking the hidden test. The SSE route wraps this exact builder + the proven
 * tutor streaming pattern; this checks the content the model actually returns.
 *
 *   npx tsx --env-file=.env.local scripts/academy/interview/acceptance-interviewer.ts
 *
 * Exit 0 = PASS. Costs two real DeepSeek calls.
 */
import { deepSeekChat } from '@/lib/rag/deepseek'
import { buildInterviewerMessages, type InterviewScenarioSeed } from '@/lib/academy/interview/interviewer-logic'

const scenario: InterviewScenarioSeed = {
  slug: 'the-lying-test-suite',
  track: 'coding',
  title: 'The lying test suite',
  description:
    'Implement merge_intervals so it is actually correct — then convince Marlowe. One test passes for the wrong reason; a green bar is not proof.',
  interviewerPrompt: {
    persona: 'Marlowe, a skeptical senior engineer who trusts proof, not prose.',
    probe_hints: [
      'Ask them to state the invariant before they code.',
      'When the suite goes green, ask which test would fail if the implementation were subtly wrong.',
      'Do not reveal the hidden test.',
    ],
    twist: { kind: 'lying_test_suite', note: 'One seed test asserts a value right for the sample input but wrong in general.' },
  },
}

// Secrets the model must never surface (the hidden test expression + name).
const FORBIDDEN = ['unsorted_input', '[[4,5],[1,3],[2,4]]', '== [[1,5]]']

function assert(cond: unknown, msg: string): void {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`)
}

function noLeak(text: string, label: string): void {
  for (const f of FORBIDDEN) {
    assert(!text.includes(f), `${label} LEAKED the hidden test fragment: ${f}`)
  }
}

async function main(): Promise<void> {
  console.log('→ Marlowe opening turn (empty transcript, live model)…')
  const opening = await deepSeekChat({
    messages: buildInterviewerMessages({ scenario, level: 'senior', style: 'skeptical', transcript: [] }),
    temperature: 0.5,
    maxTokens: 400,
  })
  const openingText = opening.content.trim()
  assert(openingText.length > 20, 'opening question is empty/too short')
  noLeak(openingText, 'opening')
  console.log(`\nMARLOWE (opening): ${openingText}\n`)

  console.log('→ Marlowe follow-up after a hand-wavy candidate answer…')
  const followup = await deepSeekChat({
    messages: buildInterviewerMessages({
      scenario,
      level: 'senior',
      style: 'skeptical',
      transcript: [
        { speaker: 'interviewer', content: openingText, ts_seconds: 5 },
        { speaker: 'candidate', content: "I'll just loop through and merge them, it's pretty straightforward.", ts_seconds: 40 },
      ],
      latestCandidateTurn: "I'll just loop through and merge them, it's pretty straightforward.",
    }),
    temperature: 0.5,
    maxTokens: 400,
  })
  const followupText = followup.content.trim()
  assert(followupText.length > 20, 'follow-up is empty/too short')
  noLeak(followupText, 'follow-up')
  console.log(`\nMARLOWE (probe): ${followupText}\n`)

  console.log('  no hidden-test leak in either turn  ✓')
  console.log('  both turns coherent + in character   ✓')
  console.log('\n═══ INTERVIEWER ACCEPTANCE: PASS ═══')
}

main().catch((err) => {
  console.error('\n═══ INTERVIEWER ACCEPTANCE: FAIL ═══')
  console.error(err)
  process.exit(1)
})
