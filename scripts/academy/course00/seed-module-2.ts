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
 * against), and verification (prove-it checklist). `tradeoff` carries the
 * decision; `debug` is a flawed-reasoning scenario the learner repairs;
 * `worked-example` is a worked judgment call with the common mistake named;
 * `code` appears ONLY where a real artifact (a memo template, a command, a
 * structured table) is the thing being produced.
 *
 * Mirrors scripts/academy/seed-first-steps.ts: createClient from env, default
 * dry-run, --apply flag, idempotent upserts, denormalized lesson counter.
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
const tinyArtifactBlocks: LessonBlock[] = [
  {
    type: 'sprint-contract',
    outcome:
      `Turn an ambiguous engineering decision into one small, named, inspectable artifact — ${MEMO} — that a reviewer can open and judge in under two minutes.`,
    intensity: 'standard',
    time: '20–30 min',
    proof:
      `A real ${MEMO} on disk with context, the decision, the rejected option, and the proof you will run — not a note, an artifact someone could review.`,
    unlock: 'You produced the memo and a reviewer could find the decision and its evidence without asking you a single question.',
    doNotClaim:
      'Do not claim you "have judgment" because you can describe the decision out loud. Until the artifact exists and is inspectable, you have an opinion, not evidence.',
  },
  {
    type: 'mission',
    text: 'A staff engineer drops into your channel: "Ship it, roll back, instrument, or redesign — you have ten minutes, the dashboards disagree, and two people above you want opposite things." In Module 1 you learned to frame the problem, diagnose the red signals, map the system, and retrieve under pressure. That was the thinking. Now the thinking has to leave your head and become something a reviewer can hold. The engineers who get trusted with hard calls are not the ones with the best monologue. They are the ones who can produce, on demand, a small artifact that survives a second pair of eyes.',
  },
  {
    type: 'context',
    text: 'This is the first lesson of Build & Prove. Module 1 made you a clearer thinker. This module makes you a producer of evidence: a tiny artifact (this lesson), a failure you injected on purpose (next), a tradeoff you can defend (after that), and a proof that holds up (the close). It all rides on one habit you build today — collapsing a fuzzy decision into the smallest thing a reviewer can actually inspect. Get this and every later lesson has a surface to write on.',
  },
  {
    type: 'pretest',
    prompt:
      'You decide, under time pressure, to roll back a release. A teammate asks "why?" You say: "It felt risky and the error rate looked off." Before reading on — what is wrong with that answer in a review, even if rolling back was the RIGHT call?',
    reveal:
      'The decision may be correct and still fail review, because nothing is inspectable. "Felt risky" and "looked off" cannot be checked, reproduced, or argued with. A reviewer cannot tell a calibrated call from a lucky guess. The fix is not a better sentence — it is a smaller artifact: the exact metric, the threshold it crossed, the option you rejected, and how you would prove the rollback worked. The win in engineering judgment is never the opinion; it is the reviewable thing the opinion produced.',
  },
  {
    type: 'concept',
    title: 'A tiny artifact is the smallest output a reviewer can inspect without you in the room',
    text: 'The invariant of the Tiny Artifact skill: every ambiguous decision must terminate in something named, small, and inspectable — not a note, an artifact. "Named" means it has a filename and lives somewhere (engineering_judgment_decision_memo.md). "Small" means a reviewer reads it in under two minutes. "Inspectable" means the reasoning, the rejected option, and the planned proof are all visible on the page. The point of small is not modesty; it is reviewability. A 12-page design doc nobody reads has less judgment-value than a 12-line memo a reviewer can actually check. Shrink the artifact until it is reviewable, then make sure it carries the decision, the road not taken, and the evidence.',
  },
  {
    type: 'worked-example',
    intro:
      'Watch the same rollback decision become a tiny artifact. The weak version is a paragraph of vibes; the strong version is a memo a reviewer can check.',
    steps: [
      'Weak: "We rolled back because the new release seemed unstable and a few things looked wrong. Better safe than sorry." Nothing here is inspectable — no metric, no threshold, no rejected option, no proof.',
      'Strong, step 1 — Context: "Release v2.4.0 at 14:02. Checkout p99 latency rose 280ms -> 910ms within 8 min; error rate flat."',
      'Strong, step 2 — Decision: "Rolled back to v2.3.9 at 14:11."',
      'Strong, step 3 — Rejected option: "Considered feature-flagging the new checkout path off instead of full rollback; rejected because the flag was not wired for the payment call, so a partial disable could double-charge."',
      'Strong, step 4 — Proof to run: "Confirm p99 returns under 350ms within 5 min of rollback (it did: 14:16, p99 = 240ms)."',
      'Strong, step 5 — Reviewer objection answered in advance: "Was 280ms->910ms real or a metrics blip? Cross-checked two independent latency sources; both agreed."',
    ],
    commonMistake:
      'Padding the artifact to look rigorous — three pages of background, a glossary, five diagrams — so it stops being reviewable. Bulk is not evidence. The reviewer needs the decision, the rejected option, and the proof, on one screen. If they have to scroll to find the call, the artifact failed its one job.',
  },
  {
    type: 'code',
    filename: MEMO,
    language: 'bash',
    code: `# ${MEMO} — the tiny artifact template you will grow all module.
# Keep it under two minutes to read. Inspectable beats impressive.

## Context
Release v2.4.0, 14:02. Checkout p99 latency 280ms -> 910ms in 8 min. Error rate flat.

## Assumptions
Latency signal is real (cross-checked two sources). No upstream incident open.

## Decision
Rolled back to v2.3.9 at 14:11.

## Rejected option
Feature-flag the new checkout path off. Rejected: flag not wired for the payment
call -> partial disable risked double-charge.

## Expected failure (the thing I am watching for)
Rollback does NOT recover p99 -> means latency source is downstream, not the release.

## Verification method
p99 < 350ms within 5 min of rollback. (Observed 14:16: p99 = 240ms. PASS.)

## Reviewer objection + answer
"Was the spike a metrics blip?" -> Two independent latency sources agreed.

## Capstone connection
This memo is the seed artifact reused by every later lesson in Build & Prove.`,
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'The pro move beginners miss: write the "Rejected option" line FIRST, before you write the decision. The option you almost chose, and the specific reason you did not, is the single most convincing thing in the memo. Anyone can state what they did. Naming the credible alternative and why it loses is what separates a calibrated engineer from someone narrating a foregone conclusion. If you cannot name a real rejected option, you have not actually made a decision — you have had a reflex.',
  },
  {
    type: 'lab',
    title: `Produce ${MEMO} for a real decision`,
    summary:
      `Take one ambiguous call you actually face right now (ship/rollback/instrument/redesign, a tool choice, a "do we refactor this") and fill the ${MEMO} template: Context, Assumptions, Decision, Rejected option (with the specific reason it loses), Expected failure, Verification method, Reviewer objection + answer. Keep it under two minutes to read. The win is the file existing and being inspectable — not being long.`,
  },
  {
    type: 'debug',
    symptom:
      'A teammate submits this as their decision artifact and asks you to review it. It reads as thorough but a reviewer cannot actually use it. Find the flaw and repair it.',
    brokenCode: `## Decision memo: caching layer
We looked at a lot of options and discussed them as a team. After weighing the
tradeoffs carefully, we decided to add a caching layer because it is the right
call for our scale and aligns with best practices. We are confident this is the
correct long-term direction. Everyone agreed.`,
    language: 'bash',
    task:
      'This artifact is unreviewable. Name what is missing that makes it impossible to check, and rewrite it so a reviewer could challenge it.',
    fix:
      'Nothing here is inspectable: no metric ("our scale" = what number?), no named rejected option, no stated assumption, and no verification method. "Best practices" and "everyone agreed" are appeals to authority, not evidence. Repair: "Context: read p99 = 740ms, 80% of reads hit 12 hot keys. Decision: add a 60s TTL cache on those keys. Rejected: a read replica — rejected because the bottleneck is repeated identical reads, not replication lag. Verification: p99 < 300ms on the hot path after deploy; cache hit-rate > 85% measured for 24h." Now a reviewer can disagree with the number, the TTL, or the rejected option — which means it is finally a real artifact.',
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
    text: 'This is not just for incidents. The same tiny-artifact move upgrades a pull-request description (state the rejected approach and how you verified), a vendor choice (the one real alternative and the metric that decided it), and a postmortem (the inspectable timeline, not the narrated one). Anywhere a decision currently lives only in your head or a Slack thread, replace it with the smallest named, inspectable artifact — and you become reviewable, which is what "trusted with hard calls" actually means. Next lesson, you stop trusting the happy path: you will deliberately inject a failure into this very artifact to find out what it does NOT survive.',
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
      'Score yourself honestly against this rubric. If you land at weak, the repair is not more words — it is naming the rejected option and the verification method. A correct call with an unreviewable artifact still scores weak, because in this module the artifact is the deliverable.',
  },
  {
    type: 'spaced-review',
    schedule: ['same day', 'day 3', 'day 7', 'day 30'],
  },
]

// ============================================================ LESSON 06
// Failure Injection — break your own artifact on purpose, before reality does.
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
    text: 'Last lesson you built a tiny artifact and felt good about it. Good. Now break it on purpose. Every decision you make has a failure mode that reality will find for you — at 3am, in front of a customer, during the demo. The only question is whether YOU find it first, in a quiet room, or whether production finds it for you, loud and expensive. Failure injection is choosing the quiet room. You take your own memo and ask the question reviewers and incidents both ask: "What is the realistic way this goes wrong, and would we even notice?"',
  },
  {
    type: 'context',
    text: 'Second lesson of Build & Prove. Your tiny artifact made the decision inspectable. But an inspectable happy-path decision is still a happy-path decision. This lesson hardens it: you inject the failure yourself so the artifact carries its own autopsy. This is the bridge to the next two lessons — the failure you find here is exactly the "risk if the choice is wrong" you will weigh in the tradeoff lesson, and the detection signal you write here is the seed of the proof you will run at the close.',
  },
  {
    type: 'pretest',
    prompt:
      'Your rollback decision worked: latency recovered. A reviewer asks "what would have made the rollback the WRONG move?" You start to say "nothing, it worked." Before reading on — why is "it worked, so it was right" a dangerous answer?',
    reveal:
      '"It worked" confirms the outcome, not the reasoning — and outcome and reasoning come apart constantly. A reckless call can get a good outcome by luck; a calibrated call can get a bad outcome from a risk you correctly accepted. If you cannot name what would have made the rollback wrong (e.g., the spike was downstream and the rollback masked the real cause, delaying the fix), you cannot tell skill from luck, and neither can your reviewer. Injecting the failure is how you separate the two: you state the condition under which your right-looking decision is actually wrong.',
  },
  {
    type: 'concept',
    title: 'Failure injection: attack your own decision with the most realistic failure, not a toy one',
    text: 'The invariant: a decision is not hardened until you have injected the most realistic failure it faces and shown what changes — in behavior, safety, correctness, user experience, operability, or security. Two rules make it real. First, no toy failures: if the domain has a credible production failure ("rollback masks a downstream cause", "cache serves stale prices", "feature flag double-charges"), use that, not a strawman you can easily wave away. Second, every injected failure needs a detection signal — the specific thing you would watch that would tell you it is happening. A failure you cannot detect is not handled; it is just named. The failure autopsy is the artifact: injected failure, blast radius, detection signal, response.',
  },
  {
    type: 'worked-example',
    intro:
      'Inject a failure into the rollback memo from Lesson 05. Notice it attacks the decision that already looked good.',
    steps: [
      'Start from the good-looking decision: "Rolled back v2.4.0; p99 recovered to 240ms."',
      'Inject the most realistic failure: "What if the latency spike was caused by a downstream cache eviction, NOT the release? Then the rollback recovered p99 by coincidence (load dropped at 14:16 anyway), and the real bug is still live in v2.3.9."',
      'Blast radius: "We declare the incident resolved, page nobody, and the same spike returns at the next traffic peak — now without an obvious release to blame, so it takes 3x longer to diagnose."',
      'Detection signal: "Watch whether p99 stays recovered through the NEXT traffic peak, not just the 5 minutes after rollback. If it spikes again with v2.3.9 deployed, the release was never the cause."',
      'Response: "If it re-spikes on the old version, stop blaming the release, pull the downstream cache metrics, and reopen the incident instead of closing it."',
    ],
    commonMistake:
      'Injecting a failure you can trivially dismiss ("what if the data center floods?") so you get to feel thorough without changing anything. A real injected failure should make you LESS comfortable with your decision and ADD a line to the response plan. If your failure autopsy did not change what you would do or watch, you injected a strawman, not a failure.',
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
      `Take YOUR decision from Lesson 05's memo and inject the single most realistic failure it faces — not a toy one. Append a "Failure autopsy" section with four lines: Injected failure (the credible way it goes wrong), Blast radius (what and who it hurts, and how widely), Detection signal (the specific thing you would watch that tells you it is happening — or an honest "we currently could not detect this"), and Response (what you would do when you see the signal). The win is a memo that now documents its own most realistic failure.`,
  },
  {
    type: 'debug',
    symptom:
      'A teammate adds a "failure analysis" to their decision to make it look rigorous. It checks the box but does nothing. Find why it is theater and repair it.',
    brokenCode: `## Failure analysis: new caching layer
Risk: the cache could fail.
Mitigation: we will monitor it and fix any issues that come up.
Overall this is low risk and we are confident in the approach.`,
    language: 'bash',
    task:
      'This injects no real failure and adds no real safety. Name what makes it theater, and rewrite it as an actual failure autopsy.',
    fix:
      '"The cache could fail" is not a failure mode — it is a category. "We will monitor it" names no signal and no threshold. "Low risk, confident" is a feeling, not analysis. Real autopsy: "Injected failure: cache serves a stale price after a price change, because the TTL is 60s and we do not invalidate on write. Blast radius: every read of that product for up to 60s shows the old price; at checkout that is a pricing-integrity bug, not a latency one. Detection signal: alert if a checkout price differs from the source-of-truth price by more than $0 — we currently have no such check, which is the real gap. Response: invalidate the key on write instead of relying on TTL." Now it changes the design.',
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
    text: 'Failure injection is the engine behind premortems, chaos engineering, and threat modeling — all the same move at different scales: attack your own plan with a realistic failure before reality does, and demand a detection signal for each one. Apply it to a migration (what is the realistic data-loss path, and would we notice mid-migration?), to a hiring decision (what is the realistic way this is the wrong hire, and what early signal would tell us?), to a launch (what realistically makes us roll it back, and is that instrumented?). Next lesson, the failure you injected here becomes ammunition: it is the "risk if wrong" you weigh when you compare options and defend a tradeoff.',
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
const tradeoffDecisionBlocks: LessonBlock[] = [
  {
    type: 'sprint-contract',
    outcome:
      `Turn the decision in your ${MEMO} into a defended tradeoff: a comparison of real options against the constraints that actually bind, with a chosen option, a reversal condition, and the risk if you are wrong.`,
    intensity: 'standard',
    time: '20–30 min',
    proof:
      `A "Tradeoff" section in ${MEMO}: at least two credible options compared against the binding constraints, the chosen option, the explicit reversal condition, and the risk-if-wrong (which is the failure you injected last lesson).`,
    unlock: 'Your memo now defends the decision as a tradeoff a reviewer could attack — with a stated reversal condition, not a one-way door pretending to be obvious.',
    doNotClaim:
      'Do not claim you "made a tradeoff" if you only listed the option you already wanted. A tradeoff requires a second option that could genuinely have won under different constraints.',
  },
  {
    type: 'mission',
    text: 'Here is the review that ends careers-in-place: you present a decision, a principal engineer leans back and asks "what else did you consider, and what would have to be true for you to be wrong?" — and you have nothing. You picked the option you liked and reverse-engineered reasons. Everyone in the room knows. A tradeoff is the opposite posture: you put the real alternatives on the table, name the constraint that actually decided it, and state out loud the condition under which you would reverse yourself. That is not weakness. That is the single most senior thing you can do in a room.',
  },
  {
    type: 'context',
    text: 'Third lesson of Build & Prove. You have an inspectable decision (Lesson 05) and you have injected its failure (Lesson 06). Now you defend the choice itself. The failure you injected last lesson is not wasted — it becomes the "risk if wrong" column of your tradeoff. And the reversal condition you write here is what makes the decision honest: it admits the call depends on assumptions that could flip. Next lesson you prove the whole thing holds; this lesson makes sure the thing you are about to prove is actually the right thing to prove.',
  },
  {
    type: 'pretest',
    prompt:
      'You compare two databases for a new service. You list Postgres with five upsides and the alternative with five downsides, and conclude "clearly Postgres." Before reading on — why will a sharp reviewer distrust this comparison even if Postgres is the right answer?',
    reveal:
      'A comparison where one option has all upsides and the other all downsides is not a tradeoff — it is a decision already made, dressed up. Real options each win under SOME conditions; if the alternative had no scenario where it wins, it was never a credible option and listing it is theater. The reviewer distrusts it because it shows no constraint actually doing the deciding — it reads as motivated reasoning. A real tradeoff names the binding constraint ("we need multi-region writes in 6 months") and shows how THAT, not a tally of pros, selects the option. Honest tradeoffs admit the alternative wins in a world slightly different from yours.',
  },
  {
    type: 'concept',
    title: 'A tradeoff is selection by binding constraint, with a stated reversal condition',
    text: 'The invariant: a defensible decision compares real options against the constraints that actually bind, and states what would reverse it. Three parts. First, real options: each must win under some plausible condition, or it is not a credible alternative. Second, the binding constraint: not a pile of pros, but the one or two constraints (latency, cost, team skill, risk, time, privacy) that actually do the deciding — name them and you can explain the call in one sentence. Third, the reversal condition: the specific change in the world ("if write volume crosses 50k/s" or "if the team grows past 3 engineers") that would flip your choice. A decision with no reversal condition is either a true one-way door (rare) or a bluff. Stating the reversal condition is how you prove the decision is reasoned, not reflexive.',
  },
  {
    type: 'worked-example',
    intro:
      'Defend the rollback decision as a tradeoff. Note how the injected failure from Lesson 06 becomes the risk-if-wrong, and how a constraint — not a pro/con tally — does the deciding.',
    steps: [
      'Frame the real options under pressure: Option A = full rollback to v2.3.9; Option B = feature-flag the new checkout path off; Option C = leave it up and instrument harder for 10 more minutes.',
      'Name the binding constraint: "We are in a customer-facing latency event; the cost of being slow now exceeds the cost of losing the new feature for an hour. Time-to-recover dominates."',
      'Select by the constraint: "A recovers fastest and is fully reversible; B is faster to ship but the flag is not wired for payments (the Lesson 06 failure); C keeps the pain live while we gather data. Under time-to-recover, A wins."',
      'State the reversal condition: "If the latency had been isolated to a non-payment path, B would win — smaller blast radius, keeps the feature. The moment the flag is wired safely for payments, B beats A for this class of event."',
      'Risk if wrong (reuse the injected failure): "If the spike was downstream, A recovers p99 by coincidence and hides the real cause — so A is paired with the Lesson 06 detection signal: watch the next traffic peak."',
    ],
    commonMistake:
      'Listing options but letting a pro/con tally do the deciding instead of a constraint. Counting bullet points ("A has 4 pros, B has 2") is not judgment — it weights trivia equally with the thing that matters. The reviewer wants to hear "time-to-recover dominated, so A", not "A had more pluses". One binding constraint stated clearly beats ten pros listed evenly.',
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
    type: 'debug',
    symptom:
      'A teammate presents this tradeoff in a design review. It looks balanced but is not a real decision. Find the flaw and repair it.',
    brokenCode: `## Tradeoff: message queue
Option A (Kafka): scalable, durable, industry standard, great ecosystem.
Option B (SQS): simple, managed, less ops burden.
Decision: Kafka, because it scores higher on our requirements overall.
We can always revisit later if needed.`,
    language: 'bash',
    task:
      'This is a pro-tally with a non-committal reversal. Name what is missing for it to be a defensible tradeoff, and repair it.',
    fix:
      'No binding constraint does the deciding — "scores higher overall" is a tally, not a reason. "Revisit later if needed" is not a reversal condition; it commits to nothing checkable. And SQS is described only by upsides too, so neither option shows where it loses. Repair: "Binding constraint: we are a 3-person team with no streaming experience and need this live in 4 weeks. Under that constraint, SQS wins — Kafka\'s ops burden is a 3-person team\'s biggest risk. Reversal condition: if we cross ~10k msg/s sustained OR need event replay, Kafka\'s durability earns its operational cost and we migrate. Risk if wrong: SQS\'s 256KB message limit forces a redesign if payloads grow — detection: alert at 200KB payloads." Now the constraint decides, and the reversal is concrete.',
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
const testaProofBlocks: LessonBlock[] = [
  {
    type: 'sprint-contract',
    outcome:
      `Close ${MEMO} with a Testa proof: the strongest available evidence that the decision actually holds — executable test, contract or schema check, a domain check (a11y/security/reliability/eval), or a reviewer rubric when execution is impossible — and a one-line portfolio claim that names the proof, not the topic.`,
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
    text: 'This is the close of Build & Prove, and it is the difference between an engineer people trust and one they double-check. You have a memo that is inspectable, that fails honestly, and that defends its tradeoff. None of it matters if, when a reviewer says "prove it", you reach for a vibe. Testa proof is the discipline of reaching for the STRONGEST evidence the situation allows — and being honest about how strong that is. Run a real test if code exists. Check the contract if the artifact is structured. Run the security or reliability check if the domain demands it. And when none of that is possible, a rigorous reviewer rubric — not a shrug. The proof, and your honesty about its strength, is what you put your name on.',
  },
  {
    type: 'context',
    text: 'Final lesson of Build & Prove, and the capstone of the module. Roll the call: in Lesson 05 you built a tiny, inspectable artifact; in Lesson 06 you injected the most realistic failure and demanded a detection signal; in Lesson 07 you defended the choice as a tradeoff with a reversal condition. This lesson closes the loop — you prove the thing holds with the strongest evidence available, calibrate your confidence to match that evidence, and turn the whole memo into a portfolio claim. This same four-part artifact — inspectable, injected, defended, proven — is exactly what the course capstone reuses. If you can produce it on demand, you have the engineering judgment this whole course was built to give you.',
  },
  {
    type: 'pretest',
    prompt:
      'You changed a config and the bug went away, so you write "fixed and verified." Before reading on — under the Testa discipline, why is "the symptom disappeared" often the WEAKEST proof, not the strongest?',
    reveal:
      'A vanished symptom proves the symptom is gone right now — not that you fixed the cause, and not that it stays gone. The bug could be intermittent (gone by luck of timing), or your change masked it (the cause still lurks), or it depended on load you are not currently generating. The strongest available proof targets the CAUSE and is repeatable: a failing test that now passes (and that failed before your fix), a contract check the artifact must satisfy, a load test that reproduces the original condition. "The symptom disappeared" is where proof STARTS, not where it ends. Testa discipline forces the question: what is the strongest evidence this situation actually allows, and did I run THAT?',
  },
  {
    type: 'concept',
    title: 'Testa proof: the strongest evidence the situation allows — and honesty about which one it is',
    text: 'The invariant: a decision is proven only by the strongest evidence mode available, named explicitly so its strength is legible. The modes, strongest to weakest: (1) executable test — if code exists, a test that FAILED before and PASSES after, run by you; (2) contract or schema check — if the artifact is structured, validate it against its contract; (3) domain check — accessibility, security, reliability, or eval check when the domain demands it; (4) reviewer rubric — when execution is genuinely impossible, a rigorous rubric a second person could apply identically. The skill is two-fold: reach for the strongest mode the situation allows (not the easiest), and STATE which mode you used so a reviewer can judge the proof\'s strength. "No proof" is not a tier — it is the absence of the skill. Pair the proof with calibrated confidence: your stated confidence should track the strength of the proof, not your mood.',
  },
  {
    type: 'worked-example',
    intro:
      'Prove the caching decision from the module. Watch the strongest available mode get selected, and confidence get calibrated to it.',
    steps: [
      'Identify the artifact type: structured config + running code exists -> executable + contract modes are available, so a reviewer rubric alone would be cheating.',
      'Strongest mode 1 (executable): "Wrote a test that hits the hot path 1000x and asserts p99 < 300ms. It FAILED on the pre-cache build (p99 = 740ms) and PASSES on the cached build (p99 = 210ms). Both runs attached."',
      'Strongest mode 2 (contract): "The Lesson 06 failure was stale prices. Added a contract check: for 10k sampled reads, cached price == source-of-truth price. Result: 0 mismatches over 24h." This proves the injected failure does not occur.',
      'Calibrate confidence: "Confidence 4/5. Not 5 — the load test used synthetic traffic; real traffic has hot-key patterns I have not reproduced. The reversal condition from Lesson 07 (write volume) is not yet load-tested."',
      'Portfolio claim (names the proof, not the topic): "Cut checkout p99 from 740ms to 210ms with a targeted TTL cache, and proved correctness under the stale-price failure with a 24h source-of-truth contract check (0 mismatches)."',
    ],
    commonMistake:
      'Claiming "proven" from the weakest mode because it was the easiest to reach — writing a reviewer rubric when an executable test was clearly possible, or asserting the symptom is gone without a test that failed first. The tell is a confidence level that does not match the evidence: "100% confident" off a single manual check. Calibrated confidence means your certainty tracks the proof\'s strength — and you say out loud what would raise it.',
  },
  {
    type: 'code',
    filename: MEMO,
    language: 'bash',
    code: `# ${MEMO} — the "Proof" section that closes the artifact (capstone).

## Proof (Testa mode: executable test + contract check)
- Executable: hot-path test asserts p99 < 300ms.
  FAILED pre-cache (740ms) -> PASSES cached (210ms). Both runs attached.
- Contract: 10k sampled reads, cached price == source-of-truth price.
  Result: 0 mismatches over 24h. (Proves the Lesson 06 stale-price failure absent.)

## Calibrated confidence
4/5. Not 5: load test was synthetic; real hot-key traffic not yet reproduced.
What would raise it: replay production traffic shape against the cache.

## Portfolio claim (names the proof, not the topic)
"Cut checkout p99 740ms -> 210ms with a targeted TTL cache, and proved
correctness under the stale-price failure with a 24h source-of-truth contract
check (0 mismatches)."

## Module roll-call (the four-part artifact, complete)
Inspectable (L05) -> Failure injected + detected (L06) -> Tradeoff defended with
reversal condition (L07) -> Proven with the strongest available evidence (L08).`,
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'The senior tell that beginners never show: stating what would CHANGE your mind, attached to your proof. "Confidence 4/5; it drops to 2 if the load test does not hold at 3x traffic" signals that your confidence is a measured quantity tracking evidence, not a personality trait. Anyone can say "I am confident." Saying exactly what observation would lower your confidence — and by how much — is the difference between calibration and bravado. Reviewers trust calibrated engineers with bigger decisions, because calibration is the thing that makes your "I am confident" worth believing.',
  },
  {
    type: 'lab',
    title: `Close ${MEMO} with a Testa proof, calibrated confidence, and a portfolio claim`,
    summary:
      `Take YOUR decision and add a "Proof" section: (1) name the STRONGEST Testa mode the situation allows — executable test, contract/schema check, domain check, or reviewer rubric — and run it, recording the concrete result; if you used a test, it must have FAILED before and PASSED after. (2) Add a calibrated-confidence line (1-5) with what would raise or lower it. (3) Write a one-line portfolio claim of the form "I decided X under constraint Y and proved it with Z" — naming the proof, not just the topic. The win is a complete four-part artifact you could hand to a reviewer or paste into a portfolio.`,
  },
  {
    type: 'debug',
    symptom:
      'A teammate marks a decision "proven" and moves on. The proof is the weakest possible one dressed up as rigor. Find the flaw and repair it.',
    brokenCode: `## Proof
We tested it and it works. The feature behaves correctly in our testing and we
are 100% confident it is production-ready. QA gave a thumbs up.
Status: PROVEN.`,
    language: 'bash',
    task:
      'Name why this is the weakest proof masquerading as the strongest, then rewrite it under the Testa discipline.',
    fix:
      '"We tested it and it works" names no mode, no assertion, and nothing that would have failed if the code were broken — an untestable claim. "100% confident" is uncalibrated by definition. "QA thumbs up" is an appeal to authority, not evidence a reviewer can re-run. Repair: "Testa mode: executable. Test asserts the discounted total for a known cart == $42.30; it FAILED on the pre-fix build ($47.00) and PASSES now. Edge cases (empty cart, 100% discount) covered. Confidence 4/5 — not 5 because we have not tested concurrent discount + tax-rounding; that is the next test. Status: proven for the single-discount path; the concurrent path is unproven and flagged." Now the proof states its mode, its strength, and its honest boundary.',
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
