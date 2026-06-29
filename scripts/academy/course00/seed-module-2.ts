/**
 * Seed Course 00 · Module 2 · "Build & Prove" — the four applied-judgment
 * lessons that turn Module 1's thinking (frame, diagnose, map, retrieve) into
 * reviewable evidence: a tiny artifact, a failure you injected on purpose, a
 * defended tradeoff, and a Testa proof.
 *
 *   tsx scripts/academy/course00/seed-module-2.ts                        # dry-run (default)
 *   tsx --env-file=.env.local scripts/academy/course00/seed-module-2.ts --apply
 *
 * SOURCE (READ-ONLY — never modified here):
 *   /Users/Sage/AI_CAREER_OPERATING_SYSTEM/courses/00_engineering_judgment_foundation/
 *     modules/02_module_2/lessons/*.md   (05 Tiny Artifact … 08 Testa Proof)
 *
 * TARGET (academy DB):
 *   academy_lessons rows already exist as a SKELETON (ingested by
 *   scripts/academy/ingest-career-os.ts). This seed UPDATES the `blocks` (and
 *   module label/sort/eyebrow/est_minutes/status) of the four Module 2 slugs in
 *   course `career-engineering_judgment_foundation`:
 *     05-tiny-artifact · 06-failure-injection · 07-tradeoff-decision · 08-testa-proof
 *   Slugs are NEVER changed (learner progress + evidence reference slugs).
 *
 * JUDGMENT ADAPTATION (no Pyodide): this is an engineering-judgment course, not
 * a coding course. The guaranteed win in each lesson is a REVIEWABLE ARTIFACT,
 * not a passing test. We carry that with sprint-contract (outcome + proof),
 * calibration (weak / passing / excellent rubric the learner self-scores
 * against), and verification (prove-it checklist).
 *
 * VISUAL-FIRST (mirrors seed-module-1.ts, the locked template): every lesson is
 * a sequence of HERO VISUALS with tight captions, not prose. Each judgment
 * lesson grows one memo SECTION, so each lesson folds its worked-example + raw
 * memo code + calibration/debug contrast into THREE hero visuals:
 *   - a `code-walkthrough` that steps the FILLED memo section line-by-line,
 *   - a `diagram` for the lesson's flow/decision/structure,
 *   - a `compare` for the weak-vs-gold (debug repair) contrast.
 * Prose blocks (worked-example / standalone code) collapse INTO those visuals;
 * the assessment beats (quiz / verification / teachback) stay. The `tradeoff`
 * block survives in L07 (the decision IS a tradeoff).
 *
 * Mirrors scripts/academy/seed-first-steps.ts / seed-module-1.ts: createClient
 * from env, default dry-run, --apply flag, idempotent upserts, denormalized
 * lesson counter.
 *
 * Connective tissue: tiny-artifact -> failure-injection -> tradeoff -> proof reads
 * as one arc ("Build & Prove"), and each mission calls back to Module 1's
 * framing and forward-pulls the next lesson. The shared artifact is
 * engineering_judgment_decision_memo.md — every lesson grows the same memo.
 */

import { createClient } from '@supabase/supabase-js'

import type { LessonBlock } from '../../../data/academy/sample-course'

const shouldApply = process.argv.includes('--apply')

const COURSE_SLUG = 'career-engineering_judgment_foundation'
const MODULE_TITLE = 'Module 2 · Build & Prove'
const MODULE_SORT = 1

// The shared artifact every lesson in this module grows. Named once here so the
// memo template stays identical across lessons (the capstone reuses it).
const MEMO = 'engineering_judgment_decision_memo.md'

// ============================================================ LESSON 05
// Tiny Artifact — the smallest reviewable thing that proves you can do the work.
// Hero visuals: code-walkthrough (the FILLED memo, line by line) ·
// diagram (the anatomy of a tiny artifact) · compare (vibes vs inspectable).

const TINY_ARTIFACT_MEMO = `# ${MEMO} — the tiny artifact (grows all module)
# Under two minutes to read. Inspectable beats impressive.

## Context
Release v2.4.0, 14:02. Checkout p99 latency 280ms -> 910ms in 8 min. Error rate flat.

## Assumptions
Latency signal is real (cross-checked two sources). No upstream incident open.

## Decision
Rolled back to v2.3.9 at 14:11.

## Rejected option
Feature-flag the new checkout path off. Rejected: flag not wired for the payment
call -> partial disable risked double-charge.

## Verification method
p99 < 350ms within 5 min of rollback. (Observed 14:16: p99 = 240ms. PASS.)

## Reviewer objection + answer
"Was the spike a metrics blip?" -> Two independent latency sources agreed.`

const tinyArtifactBlocks: LessonBlock[] = [
  {
    type: 'sprint-contract',
    outcome:
      `Turn an ambiguous engineering decision into one small, named, inspectable artifact — ${MEMO} — that a reviewer can open and judge in under two minutes.`,
    intensity: 'standard',
    time: '20–30 min',
    proof:
      `A real ${MEMO} on disk with context, the decision, the rejected option, and the proof you will run — an artifact someone could review, not a note.`,
    unlock: 'You produced the memo and a reviewer could find the decision and its evidence without asking you a single question.',
    doNotClaim:
      'Do not claim you "have judgment" because you can describe the decision out loud. Until the artifact exists and is inspectable, you have an opinion, not evidence.',
  },
  {
    type: 'mission',
    text: 'A staff engineer drops in: "Ship, roll back, instrument, or redesign — ten minutes, the dashboards disagree, two people above you want opposite things." Module 1 made you frame, diagnose, map, and retrieve under pressure. Now the thinking has to leave your head and become something a reviewer can hold.',
  },
  {
    type: 'context',
    text: 'This is the first lesson of Build & Prove: a tiny artifact (now), a failure you injected on purpose (next), a tradeoff you can defend, then a proof that holds. It all rides on one habit — collapsing a fuzzy decision into the smallest thing a reviewer can inspect.',
  },
  {
    type: 'pretest',
    prompt:
      'You roll back a release under pressure. A teammate asks "why?" You say: "It felt risky and the error rate looked off." Before reading on — what is wrong with that answer in a review, even if rolling back was the RIGHT call?',
    reveal:
      'The decision may be correct and still fail review, because nothing is inspectable. "Felt risky" and "looked off" cannot be checked, reproduced, or argued with — a reviewer cannot tell a calibrated call from a lucky guess. The fix is not a better sentence; it is a smaller artifact: the exact metric, the threshold it crossed, the option you rejected, and how you would prove the rollback worked. The win in engineering judgment is never the opinion; it is the reviewable thing the opinion produced.',
  },
  {
    type: 'concept',
    title: 'A tiny artifact is the smallest output a reviewer can inspect without you in the room',
    text: 'Every ambiguous decision must terminate in something named, small, and inspectable. Named = it has a filename. Small = read in under two minutes. Inspectable = the reasoning, the rejected option, and the planned proof are all on the page. Small is for reviewability, not modesty.',
  },
  {
    type: 'code-walkthrough',
    title: 'The tiny artifact, line by line',
    subtitle: 'Watch a paragraph of vibes become a memo a reviewer can check — the filled template you grow all module.',
    filename: MEMO,
    language: 'bash',
    code: TINY_ARTIFACT_MEMO,
    steps: [
      { lines: [4, 5], label: 'Context — measured, not vibes', note: 'A number and a threshold ("280ms -> 910ms in 8 min"), not "seemed unstable". A reviewer can disagree with the number; they cannot disagree with a feeling.' },
      { lines: [7, 8], label: 'Assumptions named up front', note: 'State the thing that could be wrong ("latency signal is real"). Naming the assumption is what makes the next lesson — injecting its failure — even possible.' },
      { lines: [10, 11], label: 'The decision, one line', note: 'The actual call with a timestamp. Not "we discussed options" — the verb and the time.' },
      { lines: [13, 14, 15], label: 'Rejected option — the most convincing line', note: 'The credible alternative AND the specific reason it loses (flag not wired for payments). Write this FIRST; it separates a calibrated call from a reflex.' },
      { lines: [17, 18], label: 'Verification method', note: 'Something that could be RUN to confirm the call worked, with the observed result. This is the seed of the Lesson 08 proof.' },
      { lines: [20, 21], label: 'Objection answered in advance', note: 'Pre-empt the sharpest "but what about…". The memo invites challenge instead of defending against it.' },
    ],
    caption: 'A reviewer who never spoke to you finds the decision and its evidence in under two minutes. That is the whole skill.',
  },
  {
    type: 'diagram',
    title: 'The anatomy of a tiny artifact',
    subtitle: 'Four inspectable parts make the decision reviewable; bulk (background, glossary, five diagrams) is kept OUT — it destroys reviewability.',
    rankdir: 'LR',
    nodes: [
      { id: 'context', label: 'Context', description: 'measured: metric + threshold', kind: 'process', tone: 'accent' },
      { id: 'rejected', label: 'Rejected option', description: 'credible alt + why it loses', kind: 'process', tone: 'accent' },
      { id: 'proof', label: 'Verification', description: 'a check you could run', kind: 'process', tone: 'success' },
      { id: 'artifact', label: 'Tiny artifact', description: 'inspectable in < 2 min', kind: 'store', tone: 'success' },
      { id: 'bulk', label: 'Bulk', description: 'padding to look rigorous', kind: 'external', tone: 'muted' },
    ],
    edges: [
      { from: 'context', to: 'artifact', label: 'grounds', kind: 'data' },
      { from: 'rejected', to: 'artifact', label: 'most convincing', kind: 'data', tone: 'accent' },
      { from: 'proof', to: 'artifact', label: 'makes it checkable', kind: 'data', tone: 'success' },
      { from: 'bulk', to: 'artifact', label: 'must NOT leak in', kind: 'control', dashed: true, tone: 'muted' },
    ],
    legend: [
      { tone: 'accent', label: 'the parts that carry the judgment' },
      { tone: 'success', label: 'what makes it reviewable' },
      { tone: 'muted', label: 'padding — kept out on purpose' },
    ],
  },
  {
    type: 'compare',
    title: 'Two decision memos, same call',
    subtitle: 'A teammate submits the left as their artifact. It reads as thorough; a reviewer cannot use it. Find the flaw — then read the repair.',
    mono: true,
    left: {
      label: 'Unreviewable (vibes)',
      tone: 'warning',
      lines: [
        'Decision memo: caching layer',
        '"Weighed the tradeoffs carefully…"',
        '"…the right call for our scale"',
        '"…aligns with best practices"',
        '"Everyone agreed. Confident."',
      ],
      verdict: 'No metric, no rejected option, no proof',
    },
    right: {
      label: 'Inspectable (gold)',
      tone: 'success',
      lines: [
        'Context: p99 = 740ms; 80% of reads hit 12 hot keys',
        'Decision: 60s TTL cache on those keys',
        'Rejected: read replica — bottleneck is repeated',
        '  identical reads, not replication lag',
        'Verify: p99 < 300ms + hit-rate > 85% over 24h',
      ],
      verdict: 'A reviewer can disagree with the number',
    },
    caption: '"Best practices" and "everyone agreed" are appeals to authority, not evidence. The repair names the metric, the rejected option, and the verification — now it is a real artifact.',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'The pro move beginners miss: write the "Rejected option" line FIRST, before the decision. The credible alternative and the specific reason it loses is the single most convincing thing in the memo. Anyone can state what they did; naming why the alternative loses is what separates a calibrated engineer from someone narrating a foregone conclusion. If you cannot name a real rejected option, you have not made a decision — you have had a reflex.',
  },
  {
    type: 'lab',
    title: `Produce ${MEMO} for a real decision`,
    summary:
      `Take one ambiguous call you actually face right now (ship/rollback/instrument/redesign, a tool choice, a "do we refactor this") and fill the ${MEMO} template: Context, Assumptions, Decision, Rejected option (with the specific reason it loses), Verification method, Reviewer objection + answer. Keep it under two minutes to read. The win is the file existing and being inspectable — not being long.`,
  },
  {
    type: 'quiz',
    question: 'What makes a decision artifact "tiny" in the sense this lesson means?',
    options: [
      'It is short because the engineer did not do much analysis.',
      'It is shrunk to the smallest form a reviewer can inspect in about two minutes, while still carrying the decision, the rejected option, and the proof.',
      'It contains only the final decision, with the reasoning kept verbal.',
      'It is a long, exhaustive document so nothing is left out.',
    ],
    answer: 1,
    explanation:
      '"Tiny" is about reviewability, not laziness or omission. The artifact is deliberately small so a second pair of eyes can check it fast — but it still must carry the decision, the credible rejected option, and the planned proof. Drop those and it is small but worthless; pad it and it stops being reviewable.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes. You can claim the Tiny Artifact skill only if every item is literally true of your memo:',
    items: [
      `${MEMO} exists as a file you can open right now.`,
      'A reviewer who has never spoken to you could find the decision in under two minutes.',
      'It names one credible rejected option AND the specific reason it loses.',
      'It states a verification method — something that could be run to confirm the decision worked.',
      'It contains zero unmeasurable phrases like "felt risky" or "looked off" standing in for evidence.',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'In one sentence: why does a correct decision still fail review if it is not an inspectable artifact?',
      'Explain to a teammate why the "rejected option" line is the most convincing part of a decision memo.',
      'Say back the invariant of Tiny Artifact in your own words — what must every ambiguous decision terminate in?',
    ],
  },
  {
    type: 'transfer',
    text: 'This is not just for incidents. The same tiny-artifact move upgrades a pull-request description (state the rejected approach and how you verified), a vendor choice (the one real alternative and the metric that decided it), and a postmortem (the inspectable timeline, not the narrated one). Anywhere a decision currently lives only in your head or a Slack thread, replace it with the smallest named, inspectable artifact — and you become reviewable, which is what "trusted with hard calls" actually means. Next lesson, you stop trusting the happy path: you deliberately inject a failure into this very artifact to find out what it does NOT survive.',
  },
  {
    type: 'calibration',
    artifact: MEMO,
    weak:
      'A paragraph of reasoning with no named artifact, or a memo full of unmeasurable phrases ("seemed risky", "best practice"). No rejected option, no verification method. A reviewer cannot check anything without interviewing you.',
    passing:
      `${MEMO} exists and is inspectable: context, decision, one credible rejected option with its reason, and a verification method — all readable in under two minutes.`,
    excellent:
      'All of passing, plus a reviewer objection answered in advance, an explicitly stated assumption that could be wrong, and an "expected failure" line naming what observation would prove the decision wrong. The memo invites challenge instead of defending against it.',
    note:
      'Score yourself honestly. If you land at weak, the repair is not more words — it is naming the rejected option and the verification method. A correct call with an unreviewable artifact still scores weak, because in this module the artifact is the deliverable.',
  },
  {
    type: 'spaced-review',
    schedule: ['same day', 'day 3', 'day 7', 'day 30'],
  },
]

// ============================================================ LESSON 06
// Failure Injection — break your own artifact on purpose, before reality does.
// Hero visuals: code-walkthrough (the FILLED failure autopsy section) ·
// diagram (inject -> blast radius -> detection -> response) ·
// compare (theater "risks" line vs a real autopsy).

const FAILURE_AUTOPSY_SECTION = `## Failure autopsy (appended to ${MEMO})
# Attack your OWN decision with the most realistic failure — before reality does.

## Injected failure
The latency spike was caused by a downstream cache eviction, NOT the release.
Rollback recovered p99 by coincidence; the real bug is still live in v2.3.9.

## Blast radius
We declare the incident resolved, page nobody, and the spike returns at the next
traffic peak — now with no release to blame, so diagnosis takes 3x longer.

## Detection signal
Watch whether p99 stays recovered through the NEXT traffic peak, not just the
5 minutes after rollback. Re-spike on v2.3.9 means the release was never the cause.

## Response
If it re-spikes on the old version: stop blaming the release, pull the downstream
cache metrics, and REOPEN the incident instead of closing it.`

const failureInjectionBlocks: LessonBlock[] = [
  {
    type: 'sprint-contract',
    outcome:
      `Deliberately inject a realistic failure into the decision from your ${MEMO}, and add a failure autopsy that names what breaks, how you would detect it, and what you would do — turning a happy-path memo into one that survives reality.`,
    intensity: 'standard',
    time: '20–30 min',
    proof:
      `A "Failure autopsy" section appended to ${MEMO}: the injected failure, the blast radius, the detection signal, and the response — written before the failure happens, not after.`,
    unlock: 'Your memo now documents a realistic failure mode of your OWN decision, with how you would catch it and what you would do.',
    doNotClaim:
      'Do not claim your decision is "safe" because you cannot immediately think of how it breaks. Not having imagined the failure is not the same as the failure not existing.',
  },
  {
    type: 'mission',
    text: 'Last lesson you built a tiny artifact and felt good about it. Now break it on purpose. Every decision has a failure mode reality will find — at 3am, in front of a customer, during the demo. The only question is whether YOU find it first, in a quiet room, or production finds it for you, loud and expensive.',
  },
  {
    type: 'context',
    text: 'Second lesson of Build & Prove. Your tiny artifact made the decision inspectable — but a happy-path decision is still a happy-path decision. This lesson hardens it: the failure you find here becomes the "risk if wrong" in the tradeoff lesson, and the detection signal seeds the proof at the close.',
  },
  {
    type: 'pretest',
    prompt:
      'Your rollback worked: latency recovered. A reviewer asks "what would have made the rollback the WRONG move?" You start to say "nothing, it worked." Before reading on — why is "it worked, so it was right" a dangerous answer?',
    reveal:
      '"It worked" confirms the outcome, not the reasoning — and outcome and reasoning come apart constantly. A reckless call can get a good outcome by luck; a calibrated call can get a bad outcome from a risk you correctly accepted. If you cannot name what would have made the rollback wrong (the spike was downstream and the rollback masked the real cause, delaying the fix), you cannot tell skill from luck, and neither can your reviewer. Injecting the failure is how you separate the two: you state the condition under which your right-looking decision is actually wrong.',
  },
  {
    type: 'concept',
    title: 'Failure injection: attack your own decision with the most realistic failure, not a toy one',
    text: 'A decision is not hardened until you inject the most realistic failure it faces and show what changes. Two rules: no toy failures (use the credible production one, not a strawman), and every injected failure needs a detection signal — the specific thing you would watch. A failure you cannot detect is not handled; it is just named.',
  },
  {
    type: 'code-walkthrough',
    title: 'The failure autopsy, line by line',
    subtitle: 'Inject a failure into the rollback memo from Lesson 05. Notice it attacks the decision that already looked good.',
    filename: MEMO,
    language: 'bash',
    code: FAILURE_AUTOPSY_SECTION,
    steps: [
      { lines: [5, 6], label: 'Inject the most realistic failure', note: 'Not "what if the data center floods?" — the credible one: the spike was downstream, so the rollback recovered p99 by coincidence and the real bug still lives.' },
      { lines: [9, 10], label: 'Blast radius', note: 'What and who it hurts, and how widely. Closing the incident wrongly is worse than the spike: the next recurrence has no release to blame and takes 3x longer.' },
      { lines: [13, 14], label: 'Detection signal — the hardest question', note: 'Not "what breaks?" but "how would we even know?" Here: watch the NEXT traffic peak, not the 5 minutes after rollback. A failure with no signal is the highest-priority gap.' },
      { lines: [17, 18], label: 'Response', note: 'What you actually do when the signal fires. If the autopsy did not add a line to the response plan, you injected a strawman, not a failure.' },
    ],
    caption: 'A real injected failure should make you LESS comfortable with your decision and ADD a line to the plan. If it changed nothing, it was theater.',
  },
  {
    type: 'diagram',
    title: 'The failure autopsy as a loop',
    subtitle: 'Take the good-looking decision → inject the realistic failure → trace blast radius → demand a detection signal → write the response. The silent-failure branch (no signal) is the top risk.',
    rankdir: 'LR',
    nodes: [
      { id: 'decision', label: 'Decision', description: 'the call that looked good', kind: 'process', tone: 'muted' },
      { id: 'inject', label: 'Inject failure', description: 'most realistic, not a toy', kind: 'process', tone: 'accent' },
      { id: 'blast', label: 'Blast radius', description: 'what + who, how widely', kind: 'process', tone: 'warning' },
      { id: 'detect', label: 'Detection signal', description: '"how would we know?"', kind: 'decision', tone: 'accent' },
      { id: 'response', label: 'Response', description: 'what you do on the signal', kind: 'store', tone: 'success' },
      { id: 'silent', label: 'Silent gap', description: 'no signal = top risk', kind: 'store', tone: 'warning' },
    ],
    edges: [
      { from: 'decision', to: 'inject', label: 'attack it', kind: 'control', tone: 'accent' },
      { from: 'inject', to: 'blast', label: 'who it hurts', kind: 'data', tone: 'warning' },
      { from: 'blast', to: 'detect', label: 'can we see it?', kind: 'control' },
      { from: 'detect', to: 'response', label: 'on "yes"', kind: 'async', tone: 'success' },
      { from: 'detect', to: 'silent', label: 'on "no" — flag it', kind: 'async', tone: 'warning' },
    ],
    legend: [
      { tone: 'accent', label: 'inject + demand a detection signal' },
      { tone: 'success', label: 'the response the signal triggers' },
      { tone: 'warning', label: 'silent failure — the highest-value finding' },
    ],
  },
  {
    type: 'compare',
    title: 'Theater vs a real autopsy',
    subtitle: 'A teammate adds a "failure analysis" to look rigorous. It checks the box and does nothing. Spot why — then read the repair.',
    mono: true,
    left: {
      label: 'Failure theater',
      tone: 'warning',
      lines: [
        'Failure analysis: new caching layer',
        'Risk: the cache could fail.',
        'Mitigation: we will monitor it and fix issues.',
        'Overall this is low risk.',
        'We are confident in the approach.',
      ],
      verdict: 'A category, not a failure; no signal',
    },
    right: {
      label: 'Real autopsy',
      tone: 'success',
      lines: [
        'Injected: stale price served after a change',
        '  (TTL 60s, no invalidate-on-write)',
        'Blast radius: every read shows old price 60s →',
        '  pricing-integrity bug at checkout',
        'Detect: alert if checkout price != source-of-truth',
        '  — we have NO such check (the real gap)',
        'Response: invalidate on write, not TTL',
      ],
      verdict: 'Changes the design',
    },
    caption: '"The cache could fail" is a category, not a failure mode; "we will monitor it" names no signal. The repair injects a concrete failure, surfaces a silent-failure gap, and changes what you build.',
  },
  {
    type: 'callout',
    tone: 'note',
    text: 'The thing seasoned on-call engineers know: the most dangerous failures are the ones with no detection signal, because they fail silently and you find out from a customer. When you inject a failure, the hardest and most valuable question is not "what breaks?" but "how would we even know?" If your honest answer is "we would not", you have just found the highest-priority gap in the whole decision — more important than the failure itself. Write that down; it is often the most useful line in the entire memo.',
  },
  {
    type: 'lab',
    title: `Append a Failure autopsy to ${MEMO}`,
    summary:
      `Take YOUR decision from Lesson 05's memo and inject the single most realistic failure it faces — not a toy one. Append a "Failure autopsy" section with four lines: Injected failure (the credible way it goes wrong), Blast radius (what and who it hurts, and how widely), Detection signal (the specific thing you would watch — or an honest "we currently could not detect this"), and Response (what you would do when you see the signal). The win is a memo that now documents its own most realistic failure.`,
  },
  {
    type: 'quiz',
    question: 'Why does this lesson insist the injected failure be a realistic production failure, not a toy one?',
    options: [
      'Toy failures are easier to write up, which saves time.',
      'Because the purpose is to harden the decision: a realistic failure changes what you would watch and do, while a toy failure lets you feel thorough without improving anything.',
      'Realistic failures are required by company policy.',
      'There is no real difference; any failure works as long as one is listed.',
    ],
    answer: 1,
    explanation:
      'The autopsy only earns its place if it changes the decision — adds a detection signal, a response, or surfaces a gap. A toy failure ("the building floods") cannot be dismissed AND cannot be acted on, so it changes nothing. A realistic one ("rollback masks a downstream cause") forces a concrete response and often reveals you cannot even detect it — which is the highest-value finding.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes. Your failure injection is real only if all of these hold:',
    items: [
      `${MEMO} now contains a "Failure autopsy" section attached to YOUR decision.`,
      'The injected failure is one a reviewer would agree could actually happen in production — not a strawman.',
      'You named a specific detection signal, OR you honestly wrote that you currently could not detect it (and flagged that as the gap).',
      'There is a response: what you would do when the signal fires.',
      'The autopsy changed something — a thing you would now watch or do that you would not have before.',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'Explain why "it worked, so it was the right call" cannot distinguish skill from luck.',
      'In your own words: what makes an injected failure realistic instead of a toy, and why does it matter?',
      'Why is "how would we even know?" often more valuable than "what breaks?"',
    ],
  },
  {
    type: 'transfer',
    text: 'Failure injection is the engine behind premortems, chaos engineering, and threat modeling — the same move at different scales: attack your own plan with a realistic failure before reality does, and demand a detection signal for each one. Apply it to a migration (what is the realistic data-loss path, and would we notice mid-migration?), to a hiring decision (what is the realistic way this is the wrong hire, and what early signal would tell us?), to a launch (what realistically makes us roll it back, and is that instrumented?). Next lesson, the failure you injected here becomes ammunition: it is the "risk if wrong" you weigh when you compare options and defend a tradeoff.',
  },
  {
    type: 'calibration',
    artifact: MEMO,
    weak:
      'A vague "risks" line ("it could fail", "some risk exists") with no specific failure, no detection signal, and no change to the plan. Or a toy failure that cannot happen and cannot be acted on.',
    passing:
      'A realistic injected failure with a blast radius, a named detection signal (or an honest "cannot currently detect"), and a response. The autopsy changed at least one thing you would watch or do.',
    excellent:
      'All of passing, plus the autopsy surfaces a silent-failure gap (something with no detection signal) and explicitly flags it as the top risk, and the injected failure is tied to the assumption from Lesson 05 that, if wrong, triggers it.',
    note:
      'Be honest: if your autopsy did not make you less comfortable with the decision or add a line to the response, you injected a strawman. The repair is to find the failure you have been avoiding thinking about — that is the one worth writing.',
  },
  {
    type: 'spaced-review',
    schedule: ['same day', 'day 3', 'day 7', 'day 30'],
  },
]

// ============================================================ LESSON 07
// Tradeoff Decision — compare real options and defend the call under pressure.
// Hero visuals: code-walkthrough (the FILLED tradeoff section) ·
// diagram (options -> binding constraint -> choice + reversal) ·
// compare (pro-tally vs constraint-decided). Keeps the `tradeoff` block —
// the decision IS a tradeoff.

const TRADEOFF_SECTION = `## Tradeoff (added to ${MEMO})
# Selection by the binding constraint, with a stated reversal condition.

## Real options (each wins under SOME condition)
A — full rollback to v2.3.9
B — feature-flag the new checkout path off
C — leave it up, instrument harder for 10 more minutes

## Binding constraint (what actually decides)
Customer-facing latency event: the cost of being slow now exceeds the cost of
losing the new feature for an hour. Time-to-recover dominates.

## Choice — by the constraint, not a pro/con tally
A: fastest, fully reversible. B: flag not wired for payments (the L06 failure)
-> double-charge risk. C: keeps the pain live. Under time-to-recover, A wins.

## Reversal condition (the specific change that flips it)
Once the payment flag is wired safely AND latency is isolated to a non-payment
path, the same event next quarter flips to B (smaller blast radius, keeps feature).

## Risk if wrong (reuse the L06 injected failure)
If the spike was downstream, A recovers p99 by coincidence -> pair A with the
L06 detection signal: watch the next traffic peak.`

const tradeoffDecisionBlocks: LessonBlock[] = [
  {
    type: 'sprint-contract',
    outcome:
      `Turn the decision in your ${MEMO} into a defended tradeoff: a comparison of real options against the constraints that actually bind, with a chosen option, a reversal condition, and the risk if you are wrong.`,
    intensity: 'standard',
    time: '20–30 min',
    proof:
      `A "Tradeoff" section in ${MEMO}: at least two credible options compared against the binding constraints, the chosen option, the explicit reversal condition, and the risk-if-wrong (the failure you injected last lesson).`,
    unlock: 'Your memo now defends the decision as a tradeoff a reviewer could attack — with a stated reversal condition, not a one-way door pretending to be obvious.',
    doNotClaim:
      'Do not claim you "made a tradeoff" if you only listed the option you already wanted. A tradeoff requires a second option that could genuinely have won under different constraints.',
  },
  {
    type: 'mission',
    text: 'The review that ends careers-in-place: you present a decision, a principal leans back and asks "what else did you consider, and what would have to be true for you to be wrong?" — and you have nothing. A tradeoff is the opposite posture: real alternatives on the table, the constraint that decided named, and the condition under which you would reverse yourself, said out loud.',
  },
  {
    type: 'context',
    text: 'Third lesson of Build & Prove. You have an inspectable decision (L05) and you injected its failure (L06). Now you defend the choice itself — the injected failure becomes the "risk if wrong" column, and the reversal condition admits the call depends on assumptions that could flip. Next lesson you prove the thing holds; this one makes sure it is the right thing to prove.',
  },
  {
    type: 'pretest',
    prompt:
      'You compare two databases. You list Postgres with five upsides and the alternative with five downsides, and conclude "clearly Postgres." Before reading on — why will a sharp reviewer distrust this even if Postgres is the right answer?',
    reveal:
      'A comparison where one option has all upsides and the other all downsides is not a tradeoff — it is a decision already made, dressed up. Real options each win under SOME condition; if the alternative had no scenario where it wins, it was never credible and listing it is theater. The reviewer distrusts it because no constraint is doing the deciding — it reads as motivated reasoning. A real tradeoff names the binding constraint ("we need multi-region writes in 6 months") and shows how THAT, not a tally of pros, selects the option. Honest tradeoffs admit the alternative wins in a world slightly different from yours.',
  },
  {
    type: 'concept',
    title: 'A tradeoff is selection by binding constraint, with a stated reversal condition',
    text: 'Three parts. Real options: each must win under some plausible condition. The binding constraint: the one or two things (latency, cost, team skill, risk, time) that actually decide — name them and you explain the call in one sentence. The reversal condition: the specific change in the world that would flip your choice. No reversal condition means a true one-way door (rare) or a bluff.',
  },
  {
    type: 'code-walkthrough',
    title: 'The tradeoff section, line by line',
    subtitle: 'Defend the rollback as a tradeoff. Watch a constraint — not a pro/con tally — do the deciding, and the L06 failure return as the risk-if-wrong.',
    filename: MEMO,
    language: 'bash',
    code: TRADEOFF_SECTION,
    steps: [
      { lines: [5, 6, 7], label: 'Real options, each credible', note: 'Three options that each win under SOME condition. If one is all-downside, it is set dressing — cut it and find a real alternative.' },
      { lines: [10, 11], label: 'Name the binding constraint', note: 'Not a pile of pros — the one thing that decides: time-to-recover dominates. State it and the whole call fits in one sentence.' },
      { lines: [14, 15], label: 'Select BY the constraint', note: 'A wins because time-to-recover dominates — not because "A has more pluses". One binding constraint beats ten pros listed evenly.' },
      { lines: [18, 19], label: 'Reversal condition — the senior signal', note: 'The precise change that flips the call ("once the payment flag is wired safely"). Stating it proves the decision is reasoned, not reflexive.' },
      { lines: [22, 23], label: 'Risk if wrong reuses L06', note: 'The injected failure is not wasted — it becomes the risk column, paired with its detection signal. The module compounds.' },
    ],
    caption: 'The senior signal is not picking A — it is naming the exact condition under which you would pick B instead.',
  },
  {
    type: 'diagram',
    title: 'How a tradeoff actually decides',
    subtitle: 'Real options enter; the binding constraint — not a pro/con tally — selects the choice; the reversal condition and the L06 risk hang off it. A pro-tally is the failure mode, kept OUT.',
    rankdir: 'LR',
    nodes: [
      { id: 'options', label: 'Real options', description: 'each wins under some condition', kind: 'process', tone: 'accent' },
      { id: 'constraint', label: 'Binding constraint', description: 'the one thing that decides', kind: 'decision', tone: 'accent' },
      { id: 'choice', label: 'Choice', description: 'selected BY the constraint', kind: 'process', tone: 'success' },
      { id: 'reversal', label: 'Reversal condition', description: 'the change that flips it', kind: 'store', tone: 'success' },
      { id: 'risk', label: 'Risk if wrong', description: 'the L06 injected failure', kind: 'store', tone: 'warning' },
      { id: 'tally', label: 'Pro/con tally', description: 'counting bullets ≠ judgment', kind: 'external', tone: 'muted' },
    ],
    edges: [
      { from: 'options', to: 'constraint', label: 'tested against', kind: 'data', tone: 'accent' },
      { from: 'constraint', to: 'choice', label: 'selects', kind: 'control', tone: 'success' },
      { from: 'choice', to: 'reversal', label: 'admits', kind: 'data', tone: 'success' },
      { from: 'choice', to: 'risk', label: 'carries', kind: 'data', tone: 'warning' },
      { from: 'tally', to: 'choice', label: 'must NOT decide', kind: 'control', dashed: true, tone: 'muted' },
    ],
    legend: [
      { tone: 'accent', label: 'options selected by the binding constraint' },
      { tone: 'success', label: 'the choice + its reversal condition' },
      { tone: 'muted', label: 'pro/con tally — kept from deciding' },
    ],
  },
  {
    type: 'tradeoff',
    question:
      'Under a customer-facing latency event with the payment-path flag NOT wired, do you full-rollback (A) or feature-flag the new path off (B)?',
    optionA: {
      label: 'Full rollback (A)',
      text: 'Fastest, fully reversible recovery; loses the new feature for an hour. Wins when time-to-recover is the binding constraint and the blast radius spans the payment path.',
    },
    optionB: {
      label: 'Feature-flag off (B)',
      text: 'Smaller blast radius, keeps the rest of the release; but the flag is not wired for the payment call, so a partial disable risks double-charge. Wins only once that flag is safe AND the latency is isolated to a non-payment path.',
    },
    guidance:
      'Choose A here, and say WHY in one line: time-to-recover dominates and the unsafe flag makes B a correctness risk, not just a smaller one. Then state the reversal explicitly: wire the payment flag safely and the same event next quarter flips to B. The senior signal is not picking A — it is naming the exact condition under which you would pick B instead.',
  },
  {
    type: 'compare',
    title: 'Pro-tally vs a defensible tradeoff',
    subtitle: 'A teammate presents the left in a design review. It looks balanced; it is not a real decision. Find the flaw — then read the repair.',
    mono: true,
    left: {
      label: 'Pro-tally (dressed up)',
      tone: 'warning',
      lines: [
        'Tradeoff: message queue',
        'A (Kafka): scalable, durable, standard, ecosystem',
        'B (SQS): simple, managed, less ops',
        'Decision: Kafka — scores higher overall',
        'We can revisit later if needed.',
      ],
      verdict: 'No constraint decides; "revisit" commits to nothing',
    },
    right: {
      label: 'Constraint-decided',
      tone: 'success',
      lines: [
        'Binding constraint: 3-person team, no streaming',
        '  experience, live in 4 weeks',
        'Under that: SQS wins — Kafka ops burden is the',
        '  biggest risk for a 3-person team',
        'Reversal: ~10k msg/s sustained OR need replay',
        '  -> Kafka earns its cost; migrate',
        'Risk if wrong: 256KB limit -> alert at 200KB',
      ],
      verdict: 'The constraint decides; the reversal is concrete',
    },
    caption: '"Scores higher overall" is a tally, not a reason; "revisit later" is not a reversal condition. The repair names the constraint that decides and a trigger you could literally check.',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'What principal engineers do that mid-levels skip: they argue the OTHER side first. Before defending your choice, state the strongest case for the option you rejected — out loud, generously. Two things happen. You find the condition under which you are wrong (your reversal condition writes itself), and the room trusts you, because someone who can articulate the opposing case clearly is obviously not just rationalizing. If you cannot make a genuinely strong case for the rejected option, you have not understood the decision well enough to defend yours.',
  },
  {
    type: 'lab',
    title: `Add a defended Tradeoff section to ${MEMO}`,
    summary:
      `Take YOUR decision and write a "Tradeoff" section with: at least two REAL options (each must win under some condition), the one or two binding constraints that actually decide it, the chosen option justified BY that constraint (not a pro/con tally), an explicit reversal condition (the specific change that would flip your choice), and the risk-if-wrong — reuse the failure you injected in Lesson 06. The win is a decision a reviewer could attack and you could defend without flinching.`,
  },
  {
    type: 'quiz',
    question: 'What is the clearest sign that a written "tradeoff" is actually a decision already made and dressed up?',
    options: [
      'It picks the more popular technology.',
      'One option carries only upsides and the other only downsides, and a pro/con tally — not a binding constraint — does the deciding.',
      'It includes more than two options.',
      'It was written quickly under time pressure.',
    ],
    answer: 1,
    explanation:
      'Real options each win under some condition. When one is all upside and the other all downside, the alternative was never credible — it is set dressing. And when the decision rests on counting pros rather than on a binding constraint, no real selection happened. A genuine tradeoff names the constraint that decides and the condition that would reverse the call.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes. Your tradeoff is defensible only if all of these are true:',
    items: [
      `${MEMO} has a "Tradeoff" section comparing at least two options that each win under some condition.`,
      'You can state, in ONE sentence, the binding constraint that decided it.',
      'There is an explicit reversal condition — a specific, checkable change that would flip your choice.',
      'The risk-if-wrong reuses the realistic failure you injected in Lesson 06.',
      'You could make a genuinely strong case for the option you rejected (and did, at least to yourself).',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'Explain the difference between selecting an option by a binding constraint versus by a pro/con tally.',
      'In your own words: why is stating a reversal condition a sign of strength, not indecision, in a review?',
      'Why does arguing the rejected option\'s strongest case first make your own decision more trusted?',
    ],
  },
  {
    type: 'transfer',
    text: 'Defended tradeoffs are the literal substance of architecture decision records (ADRs), build-vs-buy memos, and roadmap prioritization. The pattern transfers everywhere a choice has real alternatives and binding constraints: choosing a framework (what constraint — team skill, hiring pool, performance — actually decides, and what reverses it?), pricing a feature (which constraint binds, and at what number do you change course?), even accepting a job (what would have to be true for the rejected offer to have been right?). Last lesson left: you have a decision that is inspectable, fails honestly, and is defended as a tradeoff. Now you PROVE it holds — with the strongest evidence available, not a vibe.',
  },
  {
    type: 'calibration',
    artifact: MEMO,
    weak:
      'One option dressed up with a strawman alternative; the decision rests on a pro/con tally; no binding constraint named and no real reversal condition ("revisit later" does not count).',
    passing:
      'At least two credible options, a clearly named binding constraint doing the deciding, an explicit checkable reversal condition, and a risk-if-wrong tied to the injected failure.',
    excellent:
      'All of passing, plus the strongest case for the rejected option is stated generously, and the reversal condition is precise enough to be a literal trigger ("at 50k writes/s", "once the payment flag is wired") rather than a vague "if things change".',
    note:
      'Honest check: if you could not argue the rejected option well, you do not understand the decision well enough to defend yours. The repair is to steelman the alternative until you find the exact condition where it wins — that condition IS your reversal line.',
  },
  {
    type: 'spaced-review',
    schedule: ['same day', 'day 3', 'day 7', 'day 30'],
  },
]

// ============================================================ LESSON 08
// Testa Proof — close the loop with the strongest available evidence. CAPSTONE.
// Hero visuals: code-walkthrough (the FILLED Proof section + roll-call) ·
// diagram (the Testa mode ladder, strongest-first) ·
// compare (weakest-proof-as-rigor vs named-strongest-mode).

const PROOF_SECTION = `## Proof (Testa mode: executable test + contract check)
# Capstone close. Strongest available evidence — and honesty about which it is.

## Executable test (strongest mode available)
Hot-path test asserts p99 < 300ms.
FAILED pre-cache (740ms) -> PASSES cached (210ms). Both runs attached.

## Contract check (closes the L06 failure)
10k sampled reads: cached price == source-of-truth price.
Result: 0 mismatches over 24h. (Proves the L06 stale-price failure absent.)

## Calibrated confidence
4/5. Not 5: load test was synthetic; real hot-key traffic not yet reproduced.
What would raise it: replay production traffic shape against the cache.

## Portfolio claim (names the proof, not the topic)
"Cut checkout p99 740ms -> 210ms with a targeted TTL cache, and proved
correctness under the stale-price failure with a 24h contract check (0 mismatches)."

## Module roll-call — the four-part artifact, complete
Inspectable (L05) -> Failure injected + detected (L06) ->
Tradeoff defended with reversal (L07) -> Proven, strongest evidence (L08).`

const testaProofBlocks: LessonBlock[] = [
  {
    type: 'sprint-contract',
    outcome:
      `Close ${MEMO} with a Testa proof: the strongest available evidence that the decision actually holds — executable test, contract/schema check, a domain check (a11y/security/reliability/eval), or a reviewer rubric when execution is impossible — and a one-line portfolio claim that names the proof, not the topic.`,
    intensity: 'capstone',
    time: '25–35 min',
    proof:
      `A "Proof" section in ${MEMO} naming the Testa mode used and its concrete result, plus a calibrated-confidence line and a portfolio claim of the form "I decided X under constraint Y and proved it with Z."`,
    unlock: 'Your decision is now backed by the strongest proof the situation allows, your confidence is calibrated against that proof, and you can make a portfolio claim that names the evidence.',
    doNotClaim:
      'Do not claim "proven" when you ran the weakest available check because it was easy. The proof must be the strongest mode the situation actually allows — and you must say which mode it is.',
  },
  {
    type: 'mission',
    text: 'The close of Build & Prove, and the difference between an engineer people trust and one they double-check. Your memo is inspectable, fails honestly, and defends its tradeoff. None of it matters if, when a reviewer says "prove it", you reach for a vibe. Testa proof is reaching for the STRONGEST evidence the situation allows — and being honest about how strong that is.',
  },
  {
    type: 'context',
    text: 'Final lesson of Build & Prove, the capstone. Roll the call: L05 built a tiny inspectable artifact; L06 injected the most realistic failure and demanded a detection signal; L07 defended the choice as a tradeoff with a reversal condition. This lesson closes the loop — prove it holds with the strongest evidence, calibrate confidence to that evidence, and turn the memo into a portfolio claim. This same four-part artifact is exactly what the course capstone reuses.',
  },
  {
    type: 'pretest',
    prompt:
      'You changed a config and the bug went away, so you write "fixed and verified." Before reading on — under the Testa discipline, why is "the symptom disappeared" often the WEAKEST proof, not the strongest?',
    reveal:
      'A vanished symptom proves the symptom is gone right now — not that you fixed the cause, and not that it stays gone. The bug could be intermittent (gone by luck of timing), or your change masked it (the cause still lurks), or it depended on load you are not currently generating. The strongest available proof targets the CAUSE and is repeatable: a failing test that now passes (and failed before your fix), a contract check the artifact must satisfy, a load test that reproduces the original condition. "The symptom disappeared" is where proof STARTS, not where it ends. Testa forces the question: what is the strongest evidence this situation actually allows, and did I run THAT?',
  },
  {
    type: 'concept',
    title: 'Testa proof: the strongest evidence the situation allows — and honesty about which one it is',
    text: 'A decision is proven only by the strongest evidence mode available, named so its strength is legible. Strongest to weakest: (1) executable test — failed before, passes after, run by you; (2) contract/schema check; (3) domain check (a11y/security/reliability/eval); (4) reviewer rubric when execution is impossible. Reach for the strongest mode, not the easiest — and say which one. Pair it with calibrated confidence that tracks the proof, not your mood.',
  },
  {
    type: 'code-walkthrough',
    title: 'The Proof section, line by line',
    subtitle: 'Prove the caching decision. Watch the strongest available mode get selected, the L06 failure closed, and confidence calibrated to the evidence.',
    filename: MEMO,
    language: 'bash',
    code: PROOF_SECTION,
    steps: [
      { lines: [4, 5, 6], label: 'Executable: strongest mode available', note: 'Running code exists, so a reviewer rubric would be cheating. The test FAILED pre-cache (740ms) and PASSES cached (210ms) — failed-then-passed is the proof, not "it works".' },
      { lines: [8, 9, 10], label: 'Contract check closes L06', note: 'The Lesson 06 injected failure was stale prices. 10k sampled reads, 0 mismatches over 24h — this proves the injected failure does not occur. The module closes its own loop.' },
      { lines: [12, 13], label: 'Calibrate confidence to the proof', note: '4/5, not 5 — the load test used synthetic traffic. Confidence tracks the evidence, and you say out loud what would raise it.' },
      { lines: [16, 17], label: 'Portfolio claim names the PROOF', note: 'Not "I worked on caching" — "cut p99 740ms -> 210ms and proved correctness with a 24h contract check (0 mismatches)." Interview-ready: X under constraint Y, proved with Z.' },
      { lines: [20, 21], label: 'Module roll-call', note: 'Inspectable (L05) -> injected + detected (L06) -> defended with reversal (L07) -> proven (L08). The four-part artifact, complete — what the course capstone asks for on demand.' },
    ],
    caption: 'Proven means strongest-available-and-named, with confidence that tracks the evidence. That standard, applied honestly, is the judgment this course exists to build.',
  },
  {
    type: 'diagram',
    title: 'The Testa mode ladder',
    subtitle: 'Reach for the strongest mode the situation ALLOWS, not the easiest — and name it. "No proof" is not a tier; it is the absence of the skill. Confidence is calibrated to whichever rung you reached.',
    rankdir: 'TB',
    nodes: [
      { id: 'executable', label: '1 · Executable test', description: 'failed before, passes after', kind: 'process', tone: 'success' },
      { id: 'contract', label: '2 · Contract / schema', description: 'validate against the contract', kind: 'process', tone: 'accent' },
      { id: 'domain', label: '3 · Domain check', description: 'a11y / security / reliability / eval', kind: 'process', tone: 'accent' },
      { id: 'rubric', label: '4 · Reviewer rubric', description: 'only when execution is impossible', kind: 'process', tone: 'warning' },
      { id: 'confidence', label: 'Calibrated confidence', description: 'tracks the rung you reached', kind: 'decision', tone: 'success' },
    ],
    edges: [
      { from: 'executable', to: 'contract', label: 'else drop to', kind: 'control' },
      { from: 'contract', to: 'domain', label: 'else drop to', kind: 'control' },
      { from: 'domain', to: 'rubric', label: 'last resort', kind: 'control', tone: 'warning' },
      { from: 'executable', to: 'confidence', label: 'name the mode', kind: 'data', tone: 'success' },
      { from: 'rubric', to: 'confidence', label: 'lower the score', kind: 'data', tone: 'warning' },
    ],
    legend: [
      { tone: 'success', label: 'strongest available — reach for this' },
      { tone: 'accent', label: 'mid-strength modes' },
      { tone: 'warning', label: 'weakest — only if nothing stronger is possible' },
    ],
  },
  {
    type: 'compare',
    title: 'Weakest proof dressed as rigor vs a named strongest mode',
    subtitle: 'A teammate marks a decision "proven" and moves on. The proof is the weakest possible one in a suit. Spot it — then read the repair.',
    mono: true,
    left: {
      label: 'Weakest, dressed up',
      tone: 'warning',
      lines: [
        '## Proof',
        'We tested it and it works.',
        'Behaves correctly in our testing.',
        'We are 100% confident, production-ready.',
        'QA gave a thumbs up. Status: PROVEN.',
      ],
      verdict: 'No mode, no assertion, uncalibrated',
    },
    right: {
      label: 'Strongest mode, named',
      tone: 'success',
      lines: [
        'Testa mode: executable.',
        'Discounted total for known cart == $42.30;',
        '  FAILED pre-fix ($47.00) -> PASSES now.',
        'Edge cases (empty cart, 100% off) covered.',
        'Confidence 4/5 — concurrent discount+tax',
        '  rounding not yet tested (next test).',
        'Status: proven for single-discount path.',
      ],
      verdict: 'Names mode, strength, and honest boundary',
    },
    caption: '"We tested it and it works" names nothing that would have failed if the code were broken; "100% confident" is uncalibrated by definition. The repair states the mode, the failed-then-passed assertion, and the unproven boundary.',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'The senior tell beginners never show: stating what would CHANGE your mind, attached to your proof. "Confidence 4/5; it drops to 2 if the load test does not hold at 3x traffic" signals that your confidence is a measured quantity tracking evidence, not a personality trait. Anyone can say "I am confident." Saying exactly what observation would lower your confidence — and by how much — is the difference between calibration and bravado. Reviewers trust calibrated engineers with bigger decisions, because calibration is what makes your "I am confident" worth believing.',
  },
  {
    type: 'lab',
    title: `Close ${MEMO} with a Testa proof, calibrated confidence, and a portfolio claim`,
    summary:
      `Take YOUR decision and add a "Proof" section: (1) name the STRONGEST Testa mode the situation allows — executable test, contract/schema check, domain check, or reviewer rubric — and run it, recording the concrete result; if you used a test, it must have FAILED before and PASSED after. (2) Add a calibrated-confidence line (1-5) with what would raise or lower it. (3) Write a one-line portfolio claim of the form "I decided X under constraint Y and proved it with Z" — naming the proof, not just the topic. The win is a complete four-part artifact you could hand to a reviewer or paste into a portfolio.`,
  },
  {
    type: 'quiz',
    question: 'Under the Testa discipline, what makes a proof "the strongest available"?',
    options: [
      'It is the proof that was fastest and easiest to produce.',
      'It is the strongest mode the situation actually allows (executable > contract > domain check > reviewer rubric), run for real and named so its strength is legible.',
      'It is any proof that results in a PASS.',
      'It is a reviewer giving verbal approval.',
    ],
    answer: 1,
    explanation:
      'Testa ranks modes by strength and demands you reach for the strongest the situation permits — not the cheapest. If code exists, an executable test that failed-then-passed beats a rubric; choosing the rubric anyway is weak proof dressed up. And you must NAME the mode, so a reviewer can judge how much the proof is worth and your confidence can be calibrated to it.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes. This is the capstone gate. Claim the proof only if every item holds:',
    items: [
      `${MEMO} has a "Proof" section that NAMES the Testa mode used (executable / contract / domain check / reviewer rubric).`,
      'It is the strongest mode the situation actually allowed — not the easiest one available.',
      'If a test was used, it FAILED before the decision and PASSES after (both states recorded).',
      'Your stated confidence (1-5) tracks the proof\'s strength, and you named what would raise or lower it.',
      'There is a portfolio claim that names the PROOF, not just the topic ("...and proved it with Z").',
      'The full four-part artifact is present: inspectable (L05), failure injected (L06), tradeoff defended (L07), proven (L08).',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'Explain why "the symptom disappeared" is usually the weakest proof, and what would make it strong.',
      'In your own words: what does it mean to calibrate confidence to the strength of a proof?',
      'Walk a teammate through the full Build & Prove artifact — inspectable, injected, defended, proven — using your own memo as the example.',
    ],
  },
  {
    type: 'transfer',
    text: 'This four-part artifact is your engineering-judgment signature, and it transfers to every decision you will ever defend: an incident review, a design doc, a promotion packet, a portfolio piece, a system-design interview where the interviewer asks "how do you know?" In each, the move is identical — make it inspectable, inject the realistic failure, defend the tradeoff with a reversal condition, and prove it with the strongest evidence the situation allows, calibrating your confidence to that evidence. That is the whole of Build & Prove, and it is what Module 1\'s thinking was always pointing at: you do not just reason well — you produce evidence that a reviewer, a system, or your future self can check. Keep ' + MEMO + ' as your reusable template. The course capstone will ask you to produce exactly this, on a decision that matters, on demand. You are now equipped to do it.',
  },
  {
    type: 'calibration',
    artifact: MEMO,
    weak:
      'A "proof" that names no mode, asserts nothing that could have failed, and reports uncalibrated confidence ("100% sure", "it works"). The weakest check chosen because it was easy; no portfolio claim or one that names only the topic.',
    passing:
      'The strongest available Testa mode is named and run for real (an executable test failed-then-passed, or the appropriate contract/domain/rubric check), confidence is calibrated to it, and there is a portfolio claim that names the proof.',
    excellent:
      'All of passing, plus the proof explicitly closes the Lesson 06 injected failure (shows it does not occur), confidence states what observation would raise OR lower it and by how much, and the portfolio claim is interview-ready: "I decided X under constraint Y and proved it with Z."',
    note:
      'This is the capstone rubric — be ruthless. If you reached for a reviewer rubric when a test was possible, you score weak no matter how nicely it is written. Proven means strongest-available-and-named, with confidence that tracks the evidence. That standard, applied honestly, is the judgment this course exists to build.',
  },
  {
    type: 'spaced-review',
    schedule: ['same day', 'day 3', 'day 7', 'day 30'],
  },
]

// ----------------------------------------------------------------- lessons
const lessons = [
  {
    slug: '05-tiny-artifact',
    title: 'Tiny Artifact: Make the Decision Inspectable',
    eyebrow: 'Module 2 · Lesson 5 · 25 min',
    sort: 0,
    est_minutes: 25,
    is_free_preview: false,
    intensity: 'standard',
    blocks: tinyArtifactBlocks,
  },
  {
    slug: '06-failure-injection',
    title: 'Failure Injection: Break Your Own Decision First',
    eyebrow: 'Module 2 · Lesson 6 · 25 min',
    sort: 1,
    est_minutes: 25,
    is_free_preview: false,
    intensity: 'standard',
    blocks: failureInjectionBlocks,
  },
  {
    slug: '07-tradeoff-decision',
    title: 'Tradeoff Decision: Defend the Call Under Pressure',
    eyebrow: 'Module 2 · Lesson 7 · 25 min',
    sort: 2,
    est_minutes: 25,
    is_free_preview: false,
    intensity: 'standard',
    blocks: tradeoffDecisionBlocks,
  },
  {
    slug: '08-testa-proof',
    title: 'Testa Proof: Prove It With the Strongest Evidence',
    eyebrow: 'Module 2 · Lesson 8 · 25 min',
    sort: 3,
    est_minutes: 25,
    is_free_preview: false,
    intensity: 'capstone',
    blocks: testaProofBlocks,
  },
]

// ------------------------------------------------------------------- main
async function main(): Promise<void> {
  if (!shouldApply) {
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          applyCommand:
            'tsx --env-file=.env.local scripts/academy/course00/seed-module-2.ts --apply',
          course: COURSE_SLUG,
          module: MODULE_TITLE,
          moduleSort: MODULE_SORT,
          lessons: lessons.map((l) => ({
            slug: l.slug,
            title: l.title,
            sort: l.sort,
            intensity: l.intensity,
            blocks: l.blocks.length,
            blockTypes: l.blocks.map((b) => b.type),
          })),
          note: 'UPDATEs blocks of 4 existing skeleton slugs. Slugs + course never changed.',
        },
        null,
        2,
      ),
    )
    return
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (load .env.local).')
    process.exit(1)
  }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  // 0. Guard: the course must already exist (ingested by ingest-career-os.ts).
  const { data: course, error: courseErr } = await sb
    .from('academy_courses')
    .select('slug')
    .eq('slug', COURSE_SLUG)
    .maybeSingle()
  if (courseErr) throw courseErr
  if (!course) {
    console.error(
      `Course "${COURSE_SLUG}" not found. Run scripts/academy/ingest-career-os.ts --apply first, then re-run this seed.`,
    )
    process.exit(1)
  }

  // 1. Guard: each target lesson slug must already exist (skeleton ingested).
  //    We UPDATE blocks rather than blind-upsert so a missing slug is a loud
  //    error, never a silently-orphaned row.
  for (const l of lessons) {
    const { data: existing, error: findErr } = await sb
      .from('academy_lessons')
      .select('slug')
      .eq('course_slug', COURSE_SLUG)
      .eq('slug', l.slug)
      .maybeSingle()
    if (findErr) throw findErr
    if (!existing) {
      console.error(
        `Lesson "${l.slug}" not found in "${COURSE_SLUG}". Run ingest-career-os.ts --apply first.`,
      )
      process.exit(1)
    }

    const { error: updErr } = await sb
      .from('academy_lessons')
      .update({
        title: l.title,
        eyebrow: l.eyebrow,
        module_title: MODULE_TITLE,
        module_sort: MODULE_SORT,
        sort: l.sort,
        est_minutes: l.est_minutes,
        is_free_preview: l.is_free_preview,
        status: 'published',
        intensity: l.intensity,
        blocks: l.blocks,
      })
      .eq('course_slug', COURSE_SLUG)
      .eq('slug', l.slug)
    if (updErr) throw updErr
  }

  // 2. Maintain the denormalized lesson counter from what is actually published.
  const { count } = await sb
    .from('academy_lessons')
    .select('id', { count: 'exact', head: true })
    .eq('course_slug', COURSE_SLUG)
    .eq('status', 'published')
  await sb.from('academy_courses').update({ lessons: count ?? 0 }).eq('slug', COURSE_SLUG)

  console.log(
    `Updated "${MODULE_TITLE}" (${lessons.length} lessons) in "${COURSE_SLUG}". Course now has ${count ?? 0} published lesson(s).`,
  )
}

main().catch((err) => {
  console.error('seed failed:', err)
  process.exit(1)
})
