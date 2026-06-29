/**
 * Seed "Module 3 · Review & Repair" — Course 00 Engineering Judgment Foundation.
 *
 *   tsx scripts/academy/course00/seed-module-3.ts                              # dry-run (default)
 *   tsx --env-file=.env.local scripts/academy/course00/seed-module-3.ts --apply
 *
 * Course:  career-engineering_judgment_foundation  (already ingested by
 *          scripts/academy/ingest-career-os.ts — this seed only UPDATES the
 *          four Module-3 skeleton lessons' `blocks`, module label, and metadata).
 *
 * What this seed does (idempotent UPDATE on (course_slug, slug); slugs NEVER change —
 * learner progress + evidence reference slugs):
 *   - 09-explain-back   Explain It Back: The Feynman Gate
 *   - 10-review-rubric  The Review Rubric: Score Your Own Work
 *   - 11-repair-loop    The Repair Loop: Fix the Weakest Part
 *   - 12-spacing-queue  The Spacing Queue: Make It Stick
 *
 * Each lesson is rebuilt as the full 15-block world-class sequence per
 * docs/academy/COURSE_TEMPLATE.md:
 *   sprint-contract → mission → context → pretest → concept → worked-example →
 *   code → callout → lab → debug → quiz → verification → teachback → transfer →
 *   spaced-review.
 *
 * JUDGMENT adaptation (this is a judgment course, NOT a coding course — no Pyodide):
 *   - The "lab" produces a reviewable ARTIFACT (a decision memo / rubric / repair
 *     log / spacing queue), wired through `sprint-contract` + `calibration`
 *     (weak / passing / excellent) + `verification` instead of a runnable check.
 *   - `tradeoff` carries the real decision under ambiguity.
 *   - `debug` is a flawed-REASONING scenario (a broken argument, not broken code).
 *   - `worked-example` shows the common mistake (weak → strong on the same artifact).
 *   - `code` is used ONLY for genuine artifact text (a memo block, a rubric, a
 *     review template) — Markdown/plain-text, never theatre.
 *
 * Connective tissue: explain-back → review-rubric → repair-loop → spacing-queue
 * form one arc ("Review & Repair"), with callbacks to Modules 1–2 (the decision
 * memo, the failure autopsy, calibrated confidence) and a forward pull to the
 * capstone, which reuses every artifact built here.
 *
 * The reader (lib/academy/content.ts) orders by (module_sort, sort). Module 3
 * uses module_sort 2; lessons keep sort 0–3.
 */

import { createClient } from '@supabase/supabase-js'
import type { LessonBlock } from '@/data/academy/sample-course'

const shouldApply = process.argv.includes('--apply')

const COURSE_SLUG = 'career-engineering_judgment_foundation'
const MODULE_TITLE = 'Module 3 · Review & Repair'
const MODULE_SORT = 2

// =================================================================== LESSON 09
// Explain Back — the Feynman gate. You don't understand a decision until you can
// teach it back in order, by name, with the exact evidence a reviewer would inspect.
const explainBackMemo = `# engineering_judgment_decision_memo.md  (explain-back pass)

Decision: Ship the checkout rewrite behind a 5% flag, or hold for the full rollback test?
Context:  Conversion is flat; the new flow is 40% less code; load test is incomplete.

Teach-back, in order (the eight moves):
1. Problem  — we cannot prove the rewrite is safe at 100% traffic yet.
2. Context  — a bad checkout bug costs revenue per minute; this is the money path.
3. Artifact — this memo + the 5%-flag config + the dashboard I will watch.
4. Failure  — most likely break: the new flow drops the tax line on cart edits.
5. Proof    — flag at 5%, watch order-total parity vs. control for 24h.
6. Tradeoff — slower rollout vs. blast radius if I'm wrong (I chose smaller blast).
7. Repair   — if parity drifts >0.5%, flip the flag to 0 and autopsy the diff.
8. Transfer — same gate applies to any money-path change: small flag, watch parity.`

const explainBackBlocks: LessonBlock[] = [
  {
    type: 'sprint-contract',
    outcome:
      'Prove you actually understand a hard decision by teaching it back in a fixed order — problem, context, artifact, failure, proof, tradeoff, repair, transfer — by name, pointing at the exact evidence a reviewer would inspect. The output is a reviewable explain-back pass on your decision memo, not a vibe.',
    intensity: 'standard',
    time: '20–30 min',
    proof:
      'An explain-back pass over your engineering_judgment_decision_memo.md that hits all eight moves in order and names the artifact, the broken case, and the proof output.',
    unlock:
      'Your explain-back covers all eight moves, in order, and a second person could find the evidence you point to without you in the room.',
    doNotClaim:
      "Don't claim you understand a decision because you can describe it with the right words. Vocabulary is not understanding — being able to teach it back in order, with evidence, is.",
  },
  {
    type: 'mission',
    text: 'A staff engineer stops you mid-review: "Walk me through why you shipped it." You have the words — "blast radius", "parity", "flag" — and thirty seconds in you realize you cannot connect them; the understanding was never there.',
  },
  {
    type: 'context',
    text: 'Modules 1–2 produced artifacts — a decision memo, a failure autopsy; this module, Review & Repair, proves they are real. Explaining-back is the first and cheapest gate: it finds the hole in your reasoning before the rubric (next lesson) or production does.',
  },
  {
    type: 'pretest',
    prompt:
      'You can describe your decision fluently: you say "blast radius", "tradeoff", "rollback". A teammate asks, "Show me the exact evidence that this is not just a happy-path answer." What do you think happens to most engineers here?',
    reveal:
      'Most go quiet — because fluent vocabulary and real understanding feel identical from the inside. You only discover the gap when you are forced to point at the evidence: the artifact, the broken case, the proof output, the transfer. If you cannot point, you did not understand it; you summarized it. Explaining-back in a FIXED order forces the point every time, so the gap surfaces in practice, not in the review.',
  },
  {
    type: 'concept',
    title: 'Explain-back is the decision taught in a fixed order, by name, with evidence',
    text: 'Not a summary — your decision taught back in eight ordered moves, each pointing at the exact evidence a reviewer could inspect. The fixed order is the trick: it removes your ability to skip the part you secretly do not understand.',
  },
  {
    type: 'diagram',
    title: 'The eight moves — a fixed gate, not a free-form talk',
    subtitle:
      'Problem → Context → Artifact → Failure → Proof → Tradeoff → Repair → Transfer. The order is load-bearing: the move you want to skip (here, PROOF) is the weakest part it forces you to surface.',
    rankdir: 'LR',
    nodes: [
      { id: 'problem', label: '1 Problem', description: 'what you could not prove', kind: 'process', tone: 'accent' },
      { id: 'context', label: '2 Context', description: 'why it costs', kind: 'process', tone: 'accent' },
      { id: 'artifact', label: '3 Artifact', description: 'the memo + config', kind: 'store', tone: 'accent' },
      { id: 'failure', label: '4 Failure', description: 'most likely break', kind: 'process', tone: 'accent' },
      { id: 'proof', label: '5 Proof', description: 'measurement vs control', kind: 'decision', tone: 'warning' },
      { id: 'tradeoff', label: '6 Tradeoff', description: 'chosen vs rejected', kind: 'process', tone: 'accent' },
      { id: 'repair', label: '7 Repair', description: 'what flips, when', kind: 'process', tone: 'accent' },
      { id: 'transfer', label: '8 Transfer', description: 'same gate elsewhere', kind: 'process', tone: 'success' },
    ],
    edges: [
      { from: 'problem', to: 'context', kind: 'control' },
      { from: 'context', to: 'artifact', kind: 'control' },
      { from: 'artifact', to: 'failure', kind: 'control' },
      { from: 'failure', to: 'proof', label: 'where most stall', kind: 'control', tone: 'warning' },
      { from: 'proof', to: 'tradeoff', kind: 'control' },
      { from: 'tradeoff', to: 'repair', kind: 'control' },
      { from: 'repair', to: 'transfer', kind: 'control', tone: 'success' },
    ],
    legend: [
      { tone: 'accent', label: 'taught in order, by name' },
      { tone: 'warning', label: 'the move you tend to skip = your weakest part' },
      { tone: 'success', label: 'earns the right to generalize' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'The explain-back pass, move by move',
    subtitle: 'A FILLED explain-back over a real decision memo — each move lands on evidence, not vocabulary.',
    filename: 'explain_back.md',
    language: 'bash',
    code: explainBackMemo,
    steps: [
      { lines: [3, 4], label: 'Set the stage', note: 'Decision + context first — the money path, the incomplete load test. This is what makes the stakes real.' },
      { lines: [7, 8], label: 'Moves 1–2: problem + context', note: 'Name what you could not prove, and why being wrong costs revenue per minute. No solution smuggled in yet.' },
      { lines: [9, 10], label: 'Moves 3–4: artifact + failure', note: 'Point at the inspectable thing (memo + flag config + dashboard) and the most likely break (tax line drops on cart edits).' },
      { lines: [11], label: 'Move 5: proof', note: 'The move people stall on. A measurement plan vs. a control — parity for 24h — not "the demo went fine".' },
      { lines: [12, 13], label: 'Moves 6–7: tradeoff + repair', note: 'Chosen smaller blast radius; reversal condition is parity drift >0.5% → flip to 0 and autopsy.' },
      { lines: [14], label: 'Move 8: transfer', note: 'The gate generalizes: any money-path change gets a small flag and a parity watch.' },
    ],
    caption: 'A reviewer who was not in the room can follow this to the evidence and agree it holds. That is the pass condition.',
  },
  {
    type: 'compare',
    title: 'Same decision, explained two ways',
    subtitle: 'The weak version uses the vocabulary; the strong version teaches it in order and lands on evidence.',
    left: {
      label: 'Vocabulary, in importance order',
      tone: 'warning',
      lines: [
        '"Shipped behind a flag to reduce blast radius"',
        'Leads with the clever tradeoff (the proud part)',
        'No artifact named — nothing to inspect',
        'No failure mode — nothing to watch',
        'Proof = "it seemed like the safer call"',
      ],
      verdict: 'Fluent, named, and completely unfalsifiable',
    },
    right: {
      label: 'Taught back in the fixed order',
      tone: 'success',
      lines: [
        'Problem: could not prove safe at 100% traffic',
        'Artifact: "here is the memo + 5% flag config"',
        'Failure: "tax line drops on cart edits"',
        'Proof: "order-total parity held 0.1% over 24h"',
        'Repair: "drift >0.5% → flip to 0, autopsy the diff"',
      ],
      verdict: 'Every claim is checkable by a reviewer',
    },
    caption: 'Skipping to the tradeoff and away from failure + proof IS the dodge the fixed order exists to stop. The reordered move is your weakest part.',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'The pro move: explain it back to the wall before you explain it to a person. The stall — the move where you slow down, hedge, or reach for a buzzword — is a signal, not an embarrassment. That exact spot is where your understanding is thin, and it is far cheaper to find it talking to a wall than in front of a review board. Senior engineers are not the ones who never stall; they are the ones who notice the stall and go fix that part first.',
  },
  {
    type: 'lab',
    title: 'Explain back your decision memo',
    summary:
      'Take the engineering_judgment_decision_memo.md you wrote in Module 1 (the ship / rollback / instrument / redesign call). Explain it back in writing in the eight fixed moves, in order, by name. For each move, point at the specific evidence — the artifact path, the broken case, the proof output, the transfer case. Mark the move where you stalled: that is your repair target for Lesson 11.',
  },
  {
    type: 'debug',
    symptom:
      'An engineer presents a confident explain-back, but the review board is not convinced. Find the flaw in the REASONING, not in any code.',
    brokenCode: `Explain-back as delivered:
"Problem: the old service was slow. Context: users complained.
 Tradeoff: I picked the rewrite because it's cleaner and I know the new framework well.
 Proof: it works on my machine and the demo went fine.
 Transfer: we should rewrite the other slow services too."`,
    language: 'bash',
    task:
      'Name what is broken in this explain-back. Which of the eight moves are missing or fake, and which named evidence would a reviewer demand that this engineer cannot produce?',
    fix:
      'It skips ARTIFACT (no memo, no config to inspect), skips FAILURE (no named failure mode, so nothing to watch), and fakes PROOF — "works on my machine" and "demo went fine" are not parity-against-a-control measurements; they are happy-path anecdotes. The TRADEOFF is also self-serving ("I know the new framework") rather than risk-based. Repair: produce the artifact, name the most likely failure, replace the anecdote with a real proof metric vs. a control, and re-justify the tradeoff on blast radius, not personal comfort. Only then does the transfer ("rewrite the others") earn the right to exist.',
  },
  {
    type: 'quiz',
    question:
      'During an explain-back you sail through problem, context, and tradeoff, but you slow down and start hedging when you reach "proof." What is the correct read?',
    options: [
      'Proof is the least important move, so skip it and move on.',
      'You have located the weakest part of your reasoning — proof is your repair target.',
      'The explain-back format is wrong for this decision.',
      'You should reorder to lead with your strongest move so the reviewer is impressed.',
    ],
    answer: 1,
    explanation:
      'The stall is the signal. The fixed order exists to surface exactly this: the move you want to skip or rush is the part you understand least. That spot ("proof") is now your concrete repair target — you carry it into Lesson 11. Reordering to hide it (option 4) is the dodge the format is designed to prevent.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes. Your explain-back is real only if all of these hold:',
    items: [
      'You covered all eight moves — problem, context, artifact, failure, proof, tradeoff, repair, transfer — in that order.',
      'You used the real names of the artifacts (the memo path, the metric, the flag), not generic phrases.',
      'For "proof" you pointed at a measurement against a control or baseline, not an anecdote.',
      'You named a specific, realistic failure mode — not "it might break".',
      'You marked the one move where you stalled, and you can state why it is thin.',
      'A second person could follow your explain-back to the evidence without you narrating it.',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'Say the eight moves of an explain-back in order, from memory.',
      'Why does the FIXED order matter more than the content of any single move?',
      'On your own memo, which move did you stall on, and what makes it thin?',
      'How is an explain-back different from a summary of the same decision?',
    ],
  },
  {
    type: 'transfer',
    text: 'Explain-back is not a course exercise — it is how you survive design reviews, incident retros, and promo packets for the rest of your career. Before any high-stakes conversation, teach the decision back to a wall in the eight moves and fix the move you stall on. Use it on a teammate, too: when someone explains a decision and skips straight to the clever part, ask for the missing move — "what is the most likely failure?" — and watch the quality of the conversation jump. Next lesson you stop grading by feel and put a number on the work: the review rubric.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '30 days'] },
]

// =================================================================== LESSON 10
// Review Rubric — stop grading your own work by vibe. A rubric is a fixed,
// inspectable scoring contract: anyone applying it to your artifact lands within
// a point of you. The artifact you score is the decision memo from Lesson 09.
const reviewRubric = `# review_rubric.md  (decision-memo review board, 0–100)

Score the artifact, not the author. Each dimension is pass/partial/fail with a hard cap.

1. ARTIFACT EXISTS & IS INSPECTABLE        cap 72 if missing/thin
   - named file, readable by a stranger, not a paragraph of prose
2. FAILURE NAMED & REALISTIC               cap 82 if no real failure mode
   - a production-grade break, not a toy ("it might error")
3. PROOF IS CONCRETE                        cap 78 if proof is an anecdote
   - measurement vs. a control/baseline, reproducible
4. TRADEOFF IS DEFENSIBLE                    cap 86 if self-serving
   - chosen + rejected option + reversal condition + risk-if-wrong
5. REPAIR PATH STATED                        cap 88 if no rollback/repair
   - what flips, at what threshold, and the autopsy that follows
6. TRANSFER CHANGES CONTEXT                  cap 92 if transfer is a restatement
   - same pattern, genuinely different domain/constraints

Pass  = 80+  (all six present, none faked)
Gold  = 94+  (also: reviewer objection answered, repair re-tested)
Honest-score rule: a missing dimension CAPS the score. You may not average past a cap.`

const reviewRubricBlocks: LessonBlock[] = [
  {
    type: 'sprint-contract',
    outcome:
      'Build a review rubric: a fixed, inspectable scoring contract that turns "this feels solid" into a defensible number. Then score your own decision memo with it — honestly, respecting the caps — so a second reviewer applying the same rubric lands within a point of you.',
    intensity: 'standard',
    time: '25–35 min',
    proof:
      'A review_rubric.md with named dimensions and hard score-caps, plus a scored pass over your decision memo where every dimension cites the exact evidence (or its absence) that justifies the score.',
    unlock:
      'Your rubric is concrete enough that an independent reviewer scoring your memo with it would land within one point of your score, and you respected every cap instead of averaging past it.',
    doNotClaim:
      "Don't claim your work is \"reviewed\" because you re-read it and felt good. A review is a rubric applied with evidence and honest caps — re-reading your own work and nodding is not a review.",
  },
  {
    type: 'mission',
    text: 'Two engineers submit the same decision: one says "looks good — ship it," the other returns "78, capped — proof is an anecdote, here is the line." Guess which review the staff engineer trusts, and which quietly gets re-reviewed.',
  },
  {
    type: 'context',
    text: 'Last lesson you found the move you stall on, but "I stalled on proof" is still a feeling — a rubric converts it into a defensible score with a cap. Build it yourself and you stop being surprised in review: you already know your number, and it tells the repair loop (Lesson 11) what to fix first.',
  },
  {
    type: 'pretest',
    prompt:
      'Your memo is strong on everything except proof, where you wrote "the demo went fine." On a 0–100 scale, your instinct says it is about an 88 — the writing is sharp and the tradeoff is smart. What should the actual score be?',
    reveal:
      'It is capped at 78, regardless of how good the prose is — because a missing or fake proof CAPS the score; you cannot average a brilliant tradeoff back up over a hole in the evidence. This is the single hardest habit in self-review: a cap is not a deduction you can offset. One faked dimension holds the whole artifact down until it is repaired. The cap is what makes the number honest.',
  },
  {
    type: 'concept',
    title: 'A rubric is a fixed scoring contract with hard caps, applied to the artifact',
    text: 'A small set of named dimensions, each with a pass condition and a hard CAP for failing it. You score the artifact against evidence, not the author against charisma. Caps — not averages — are what keep a self-review honest.',
  },
  {
    type: 'diagram',
    title: 'How a cap holds the score down',
    subtitle:
      'Six dimensions score against evidence, but the lowest-capping one sets the ceiling. Here PROOF is a faked anecdote → it caps the whole artifact at 78, no matter how strong the other five are.',
    rankdir: 'LR',
    nodes: [
      { id: 'artifact', label: 'Artifact', description: 'present + inspectable', kind: 'process', tone: 'success' },
      { id: 'failure', label: 'Failure named', description: 'tax-line drop', kind: 'process', tone: 'success' },
      { id: 'proof', label: 'Proof', description: '"demo went fine" = anecdote', kind: 'decision', tone: 'warning' },
      { id: 'tradeoff', label: 'Tradeoff', description: 'chosen + rejected + reversal', kind: 'process', tone: 'success' },
      { id: 'repair', label: 'Repair path', description: 'flips at threshold', kind: 'process', tone: 'success' },
      { id: 'cap', label: 'CAP 78', description: 'ceiling set by weakest', kind: 'store', tone: 'warning' },
      { id: 'score', label: 'Score = 78', description: 'NOT an average', kind: 'store', tone: 'accent' },
    ],
    edges: [
      { from: 'artifact', to: 'score', label: 'pass', kind: 'data', tone: 'muted' },
      { from: 'failure', to: 'score', label: 'pass', kind: 'data', tone: 'muted' },
      { from: 'tradeoff', to: 'score', label: 'pass', kind: 'data', tone: 'muted' },
      { from: 'repair', to: 'score', label: 'pass', kind: 'data', tone: 'muted' },
      { from: 'proof', to: 'cap', label: 'FAIL caps at 78', kind: 'control', tone: 'warning' },
      { from: 'cap', to: 'score', label: 'ceiling wins', kind: 'control', tone: 'warning' },
    ],
    legend: [
      { tone: 'success', label: 'dimension passes on evidence' },
      { tone: 'warning', label: 'failed dimension → hard cap (cannot be averaged away)' },
      { tone: 'accent', label: 'final score = the cap, not the mean' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'Reading the rubric, dimension by dimension',
    subtitle: 'A FILLED review_rubric.md — each dimension carries its own cap so one hole holds the whole score down.',
    filename: 'review_rubric.md',
    language: 'bash',
    code: reviewRubric,
    steps: [
      { lines: [3], label: 'The governing rule', note: 'Score the artifact, not the author. Each dimension is pass/partial/fail with a hard cap — caps, not deductions.' },
      { lines: [5, 6], label: 'Dim 1: artifact exists', note: 'A named file a stranger can read, not a paragraph of prose. Missing → capped at 72.' },
      { lines: [7, 10], label: 'Dims 2–3: failure + proof', note: 'A realistic production break (cap 82) and a measurement vs. a control (cap 78). These are where most memos leak.' },
      { lines: [11, 14], label: 'Dims 4–5: tradeoff + repair', note: 'Defensible tradeoff with a reversal condition (cap 86); a stated rollback/repair path (cap 88).' },
      { lines: [15, 16], label: 'Dim 6: transfer', note: 'Same pattern in a genuinely different domain — a restatement caps at 92.' },
      { lines: [18, 20], label: 'The pass bands + cap rule', note: 'Pass 80+, Gold 94+. The honest-score rule: a missing dimension CAPS — you may not average past a cap.' },
    ],
    caption: 'An independent reviewer applying this same rubric to the same memo lands within one point of you. That is inter-rater reliability.',
  },
  {
    type: 'compare',
    title: 'Scoring the same memo two ways',
    subtitle: 'The weak review is a vibe; the strong review is the rubric applied with evidence and an honest cap.',
    left: {
      label: 'Vibe review',
      tone: 'warning',
      lines: [
        '"Solid memo, clear writing, smart tradeoff"',
        'No named dimensions',
        'No evidence cited',
        'No cap — feel-based number',
        'Verdict: "I\'d give it a 90"',
      ],
      verdict: 'Unrepeatable — a second reviewer gets a different number',
    },
    right: {
      label: 'Rubric applied',
      tone: 'success',
      lines: [
        'Artifact: present + inspectable → pass',
        'Failure: tax-line drop named → pass',
        'Proof: "demo went fine" = anecdote → FAIL, cap 78',
        'Tradeoff: chosen + rejected + reversal → pass',
        'Score = 78, capped by proof',
      ],
      verdict: 'Repeatable, and the repair target is unambiguous',
    },
    caption: 'The killer mistake is averaging past the cap: "proof fails but the rest is 95, so call it 88." No — a cap is a ceiling, not a term in a mean.',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'Pros score the artifact, never the author. The fastest way to corrupt a review is to let "but they are smart and they worked hard" leak into the number — that is how a faked proof ships. Pretend you do not know who wrote it. Better: pretend a stranger has to act on this memo at 3am with no one to ask. If the rubric forces a low score, that is the rubric doing its job — protecting you from your own optimism.',
  },
  {
    type: 'lab',
    title: 'Build and apply your review rubric',
    summary:
      'Write a review_rubric.md for the decision memo: at least the six dimensions above, each with a pass condition and a hard cap. Then score your own memo with it. For every dimension, cite the exact evidence (or name its absence) that sets the score, and respect the caps — do not average past one. Output the final number and the single repair target that is holding it down.',
  },
  {
    type: 'debug',
    symptom:
      'A reviewer hands back a score that looks rigorous but is quietly broken. Find the flaw in how the rubric was APPLIED.',
    brokenCode: `Reviewer's scoring note:
"Artifact: 9/10. Writing: 10/10. Failure case: 3/10 (none given).
 Proof: 4/10 (just a screenshot). Tradeoff: 9/10. Effort: 10/10.
 Average of the six = 7.5, so I'm scoring it 90/100. Approve."`,
    language: 'bash',
    task:
      'This score is wrong even though the per-dimension reads are reasonable. Name the two structural errors in how the rubric was applied.',
    fix:
      'First, it AVERAGES past the caps: a failure-case of 3 and a proof that is "just a screenshot" should CAP the artifact (around 78–82), not get diluted into a 7.5 average that rounds up to 90. Second, it scores "Writing" and "Effort" — author/charisma dimensions that do not belong in an artifact review; they inflate the number with things a stranger acting on the memo at 3am does not care about. Repair: drop the author dimensions, apply the proof and failure caps, and the real score lands near 78 with an obvious repair target — add a real proof measurement and a named failure mode.',
  },
  {
    type: 'quiz',
    question:
      'Your rubric has six dimensions. The artifact scores full marks on five but has no proof — a hard-capped dimension at 78. The prose is excellent. What is the defensible score?',
    options: [
      'Around 95 — five strong dimensions should pull the average up.',
      '78 — a missing capped dimension holds the score down until it is repaired.',
      'It depends on how good the writing is.',
      '88 — split the difference between the cap and the strong dimensions.',
    ],
    answer: 1,
    explanation:
      'A cap is a ceiling, not a deduction you can offset. Five strong dimensions cannot buy back a missing proof — that is exactly the failure mode the rubric exists to prevent. The score is 78, and the repair target (add a real proof) is unambiguous. Splitting the difference (option 4) is just averaging past the cap with extra steps.',
  },
  {
    type: 'verification',
    intro: 'Prove your rubric is a real review instrument, not dressed-up vibes:',
    items: [
      'Every dimension has a written pass condition AND a hard cap for failing it.',
      'You scored the artifact, not the author — no "writing", "effort", or "they are smart" dimensions.',
      'Each score cites the exact evidence (or names its absence) that justifies it.',
      'You respected every cap — no dimension was averaged back up past its ceiling.',
      'An independent reviewer applying your rubric to the same memo would land within one point.',
      'The output names the single repair target currently holding the score down.',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'Why does a rubric use hard caps instead of letting strong dimensions average up weak ones?',
      'What is inter-rater reliability, and how would you test it on your own rubric?',
      'Name one dimension you almost added that scores the author instead of the artifact — why is it dangerous?',
      'On your scored memo, which capped dimension set the final number, and what repairs it?',
    ],
  },
  {
    type: 'transfer',
    text: 'A rubric you can defend is portable: code review, design docs, vendor selection, even hiring loops all improve the moment "looks good" becomes "scored 82, capped on testability, here is the line." Reuse this exact instrument on a teammate\'s decision and watch the conversation stop being about ego and start being about evidence. You now have a number AND the reason it is held down. Next lesson turns that reason into action: the repair loop fixes the weakest part — and only the weakest part — then re-scores to prove the fix landed.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '30 days'] },
]

// =================================================================== LESSON 11
// Repair Loop — the rubric found the weakest part; now fix THAT part, re-score,
// and prove the score moved. Repair is targeted, evidenced, and re-tested — not
// a rewrite, not a polish pass on the parts that were already fine.
const repairLog = `# repair_log.md  (one entry per repair, re-tested)

Artifact:  engineering_judgment_decision_memo.md
Pre-score: 78 / 100  (capped: PROOF — "demo went fine" is an anecdote)

Weakest part (from rubric): PROOF dimension, capped at 78.
Root cause:  I never measured the new flow against a control; I trusted a demo.
Repair (smallest fix that lifts the cap):
  - Run the 5% flag for 24h.
  - Compare order-total parity, new flow vs. control cohort.
  - Record the delta + the dashboard link IN the memo's proof section.
Re-test:   Apply the SAME rubric. Proof dimension now: measurement vs. control → PASS.
Post-score: 91 / 100  (cap lifted; new ceiling is TRANSFER, the next-weakest part)
Reviewer objection answered: "Is 5% representative?" → cohort matched on device + region.
Did the score move for the RIGHT reason? Yes — proof, the capped dimension, not the prose.`

const repairLoopBlocks: LessonBlock[] = [
  {
    type: 'sprint-contract',
    outcome:
      'Run the repair loop: take the single weakest part your rubric flagged, fix exactly that, re-apply the same rubric, and prove the score moved for the right reason. The output is a repair log that shows pre-score, root cause, the smallest fix that lifts the cap, and the re-tested post-score.',
    intensity: 'standard',
    time: '25–35 min',
    proof:
      'A repair_log.md with a pre-score, the capped dimension, a root cause, the smallest targeted fix, and a re-test using the SAME rubric showing the cap lifted — plus a one-line check that the score moved because of the repaired dimension, not the prose.',
    unlock:
      'Your post-score is higher than your pre-score, the rubric re-test confirms the previously-capped dimension now passes, and you can show the lift came from the repair — not from re-grading the parts that were already fine.',
    doNotClaim:
      "Don't claim you \"repaired\" the work because you polished it and the score went up. If the lift came from anything other than the capped dimension you targeted, you tuned the grader, not the artifact.",
  },
  {
    type: 'mission',
    text: 'The review hands you a brutal, accurate verdict: 78, capped on proof. The tempting move is to rewrite the whole memo and expand the tradeoff table — an hour spent, score unmoved, because none of that was the weakest part. Repair is a scalpel, not a renovation.',
  },
  {
    type: 'context',
    text: 'Explain-back found the stall (09); the rubric turned it into a capped score (10); now you act — but only on the capped dimension. Re-testing with the SAME rubric is the non-negotiable: it is how you know the score moved for the right reason, not because you quietly moved the goalposts.',
  },
  {
    type: 'pretest',
    prompt:
      'Your memo is capped at 78 on proof. You have one hour. You could (a) rewrite the prose and expand the tradeoff table to four options, or (b) run the flag for 24h and record one parity measurement. Which raises the score, and why does the other one feel more productive?',
    reveal:
      'Only (b) raises the score, because proof is the capped dimension and a cap can only be lifted by repairing the thing it caps. (a) feels productive — more words, more options, visible effort — but it touches dimensions that already passed, so the cap (and the 78) does not move an inch. This is the repair trap: the satisfying work is usually not the targeted work. Always repair the cap first; everything else is polishing a thing that was never broken.',
  },
  {
    type: 'concept',
    title: 'Repair = fix the capped dimension, re-test with the same rubric, prove the lift',
    text: 'Four moves: identify the dimension that capped the score, find its root cause (not symptom), make the SMALLEST change that lifts the cap, then re-apply the SAME rubric and confirm the lift came from that dimension. The loop repeats on the new weakest part.',
  },
  {
    type: 'diagram',
    title: 'The repair loop — a scalpel, not a renovation',
    subtitle:
      'Find the capped dimension → root cause → smallest fix → re-test with the SAME rubric. A pass lifts the cap and the loop moves to the next weakest part. Two traps (churn, loosening the rubric) are dead-ends, not steps.',
    rankdir: 'LR',
    nodes: [
      { id: 'cap', label: 'Capped dim', description: 'PROOF, 78', kind: 'process', tone: 'warning' },
      { id: 'cause', label: 'Root cause', description: 'no measurement vs control', kind: 'process', tone: 'accent' },
      { id: 'fix', label: 'Smallest fix', description: 'run flag 24h, record parity', kind: 'process', tone: 'accent' },
      { id: 'retest', label: 'Re-test', description: 'SAME rubric, unchanged', kind: 'decision', tone: 'accent' },
      { id: 'lift', label: 'Cap lifts → 91', description: 'next weakest = TRANSFER', kind: 'store', tone: 'success' },
      { id: 'churn', label: 'Rewrite everything', description: 'touches passing dims', kind: 'external', tone: 'warning' },
      { id: 'goalpost', label: 'Loosen the cap', description: 'grade the grader', kind: 'external', tone: 'warning' },
    ],
    edges: [
      { from: 'cap', to: 'cause', label: 'not the symptom', kind: 'control', tone: 'accent' },
      { from: 'cause', to: 'fix', label: 'smallest change', kind: 'control', tone: 'accent' },
      { from: 'fix', to: 'retest', label: 'unchanged rubric', kind: 'control', tone: 'accent' },
      { from: 'retest', to: 'lift', label: 'dim now passes', kind: 'control', tone: 'success' },
      { from: 'lift', to: 'cap', label: 'loop on next weakest', kind: 'async', dashed: true, tone: 'muted' },
      { from: 'churn', to: 'cap', label: 'score does not move', kind: 'data', dashed: true, tone: 'warning' },
      { from: 'goalpost', to: 'cap', label: 'fakes a lift', kind: 'data', dashed: true, tone: 'warning' },
    ],
    legend: [
      { tone: 'accent', label: 'the four targeted moves' },
      { tone: 'success', label: 'a real, provable lift' },
      { tone: 'warning', label: 'dead-ends: churn and moving the goalposts' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'The repair log, line by line',
    subtitle: 'A FILLED repair_log.md — pre-score, root cause, smallest fix, re-test, post-score, honesty check.',
    filename: 'repair_log.md',
    language: 'bash',
    code: repairLog,
    steps: [
      { lines: [3, 4], label: 'Pre-state', note: 'Name the artifact and the pre-score with its cap: 78, capped on PROOF because "demo went fine" is an anecdote.' },
      { lines: [6, 7], label: 'Weakest part + root cause', note: 'The symptom is "weak proof"; the root cause is "I never measured the new flow against a control." Fix the cause.' },
      { lines: [8, 11], label: 'The smallest fix', note: 'Run the existing 5% flag 24h, compare order-total parity vs. control, record the delta IN the memo. No rewrite.' },
      { lines: [12], label: 'Re-test with the SAME rubric', note: 'Proof is now a measurement vs. control → PASS. The cap lifts because the dimension genuinely improved.' },
      { lines: [13], label: 'Post-score + new ceiling', note: 'Now 91; the new weakest part is TRANSFER. The loop moves there next — repair is iterative.' },
      { lines: [14, 15], label: 'The honesty check', note: 'The objection ("is 5% representative?") is answered, and the +13 came from PROOF — not from polishing prose. Right reason.' },
    ],
    caption: 'A repair is real only when the lift traces to the capped dimension and the rubric never changed mid-pass.',
  },
  {
    type: 'compare',
    title: 'Two hours on a capped memo',
    subtitle: 'Both feel like work. Only one moves the score — because only one targets the cap.',
    left: {
      label: 'Renovation (churn)',
      tone: 'warning',
      lines: [
        'Rewrite the whole memo, sharpen the prose',
        'Add three more options to the tradeoff table',
        'Tighten the summary',
        'All of it touches dimensions that already passed',
        'PROOF cap untouched',
      ],
      verdict: 'Score still 78 — an hour spent, nothing lifted',
    },
    right: {
      label: 'Repair (scalpel)',
      tone: 'success',
      lines: [
        'Leave the passing dimensions alone',
        'Root cause: no measurement vs. a control',
        'Run the flag 24h, record parity vs. control',
        'Re-test with the SAME rubric → PROOF passes',
        'Lift traces to PROOF, not prose',
      ],
      verdict: 'Score 78 → 91 for the right reason',
    },
    caption: 'The satisfying work is usually not the targeted work. Repair the cap first; everything else is polishing a thing that was never broken.',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'The senior habit: re-test with the EXACT rubric you scored with the first time, and never edit the rubric in the same pass as the repair. The instant you loosen a cap "because the fix is basically done", you have stopped repairing the artifact and started repairing the grader — and your score becomes a lie you told yourself. If the rubric genuinely needs changing, do it in a separate, logged pass, then re-score everything. Keep the measuring stick fixed while you measure.',
  },
  {
    type: 'lab',
    title: 'Run one repair loop on your memo',
    summary:
      'Take the capped dimension your rubric flagged in Lesson 10. Write a repair_log.md: record the pre-score and the cap, the root cause (not the symptom), the smallest fix that lifts the cap, and the re-test using the SAME rubric. Show the post-score and add the one-line honesty check: the lift came from the repaired dimension, not from re-grading the parts that already passed.',
  },
  {
    type: 'debug',
    symptom:
      'An engineer reports a successful repair: the score went from 78 to 90. But the review board rejects the repair. Find the flaw in the REASONING.',
    brokenCode: `Repair report:
"Score was 78, capped on proof. I rewrote the memo to be much clearer,
 added two more options to the tradeoff table, and tightened the summary.
 I also decided the proof dimension was too strict, so I relaxed its cap.
 New score: 90. Repair complete."`,
    language: 'bash',
    task:
      'The score went up but the repair is not real. Name the two reasons the review board rejects it.',
    fix:
      'First, the work targeted the WRONG dimensions — rewriting prose and expanding the tradeoff table touches things that already passed; the capped dimension (proof) was never actually fixed. Second, and worse, the engineer LOOSENED the rubric\'s proof cap in the same pass — moving the goalposts, not improving the artifact. The 90 is an artifact of a changed measuring stick, not a better decision. Real repair: leave the rubric fixed, add a real proof measurement vs. a control, then re-score. If proof now genuinely passes, the lift is legitimate. If you must change the rubric, do it in a separate logged pass and re-score the whole artifact.',
  },
  {
    type: 'quiz',
    question:
      'Your memo is capped at 78 on proof. After an hour of work the score is still 78. Which action most likely explains the stuck score?',
    options: [
      'You repaired the capped dimension, so the score should have moved — the rubric is broken.',
      'You spent the hour improving dimensions that already passed, leaving the cap untouched.',
      'The artifact is simply unrepairable and should be discarded.',
      'You should lower the proof cap so the score can move.',
    ],
    answer: 1,
    explanation:
      'A stuck score after real effort almost always means the effort missed the cap — you polished prose or expanded a tradeoff that already passed, so the proof cap (and the 78) never moved. The fix is to redirect the work onto the capped dimension. Lowering the cap (option 4) is moving the goalposts, which fakes a lift without repairing anything.',
  },
  {
    type: 'verification',
    intro: 'Prove the repair is real, not a re-grade:',
    items: [
      'Your repair log records the pre-score and which dimension was capping it.',
      'You wrote the ROOT CAUSE, not just the symptom the rubric named.',
      'The fix is the smallest change that lifts the cap — not a full rewrite.',
      'You re-tested with the SAME rubric, unchanged, and the capped dimension now passes.',
      'The post-score is higher, and you can show the lift came from the repaired dimension.',
      'You did not loosen any cap to make the number move.',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'State the four moves of the repair loop in order.',
      'Why must you re-test with the SAME rubric rather than a fresh judgment?',
      'What is the difference between repairing the symptom and repairing the root cause? Give your own example.',
      'On your memo, what was the capped dimension, the root cause, and the smallest fix that lifted it?',
    ],
  },
  {
    type: 'transfer',
    text: 'The repair loop is how every durable system improves: incident retros, flaky-test triage, performance work, even career feedback. The move is always the same — find the one capped dimension, fix the root cause, re-measure with the unchanged yardstick, prove the lift came from the fix. Resist the renovation instinct; cut once, in the right place. But a repair that you never revisit decays — the proof you added today is the proof you will have forgotten the reasoning behind in a month. The last lesson closes the loop: the spacing queue makes your repaired judgment stick.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '30 days'] },
]

// =================================================================== LESSON 12
// Spacing Queue — judgment you proved once decays. A spacing queue schedules the
// recall of your hardest decisions at expanding intervals, interleaved so you
// cannot coast on topic order. This is the capstone of Review & Repair.
const spacingQueue = `# spacing_queue.md  (expanding-interval recall, interleaved)

Each card = one hard-won judgment to recall WITHOUT notes, then re-score honestly.

card                          | due (same/3/7/30) | last recall | confidence
------------------------------|-------------------|-------------|-----------
checkout flag: proof-vs-control | day 7            | passed      | 4
tax-line failure autopsy        | day 3            | shaky       | 2  → repair
rubric cap rule (no averaging)  | day 30           | passed      | 5
repair = root cause, re-test    | day 7            | passed      | 4
explain-back: the 8 moves       | day 3            | passed      | 4

Rules:
1. Expanding intervals: same-day → day 3 → day 7 → day 30. A miss resets the card.
2. INTERLEAVE: shuffle cards across topics; never review in lesson order.
3. Calibrate: confidence 4–5 + a wrong/shaky recall → that card goes to repair (Lesson 11).
4. Due-only: review what is due, not everything — spacing is the point.`

const spacingQueueBlocks: LessonBlock[] = [
  {
    type: 'sprint-contract',
    outcome:
      'Build a spacing queue that keeps your hard-won judgment from decaying: each card is a decision you recall without notes at expanding intervals, interleaved across topics, with calibrated confidence routing shaky-but-confident recalls back into repair. This is the capstone of Review & Repair — it makes everything you proved this module stick.',
    intensity: 'capstone',
    time: '25–35 min',
    proof:
      'A spacing_queue.md seeded with your Module-3 decisions, each card carrying an expanding-interval due date, an interleave rule, and a calibration column that routes high-confidence misses to repair.',
    unlock:
      'Your queue schedules recall at same-day / day 3 / day 7 / day 30, interleaves cards across topics so order gives no hints, and has an explicit rule sending confident-but-wrong recalls back to the repair loop.',
    doNotClaim:
      "Don't claim a decision is \"learned\" because you got it right once today. One correct recall on the same day is the weakest possible evidence — learned means recalled cold, after a gap, interleaved with other material.",
  },
  {
    type: 'mission',
    text: 'Three weeks later a new hire asks why checkout shipped behind a 5% flag — and nothing sharp comes out. You explained it back, scored it, repaired it, then never touched it again; proven-once is a half-life, not a permanent state.',
  },
  {
    type: 'context',
    text: 'This module built a chain — explain-back surfaced the weak part (09), the rubric scored it (10), the repair loop fixed it (11) — but all of it decays. The spacing queue is the maintenance layer: it returns your hardest decisions at widening, interleaved gaps and reuses calibrated confidence to catch the dangerous case — confident, and wrong.',
  },
  {
    type: 'pretest',
    prompt:
      'You nail a hard decision in review today, completely cold. Your instinct: "Got it — locked in, move on." When are you actually most at risk of having lost it, and what does that imply about reviewing it again tomorrow?',
    reveal:
      'You are most at risk right after you stop reviewing — recall today proves almost nothing about recall in three weeks, which is when the new hire asks. And reviewing it AGAIN tomorrow is nearly wasted effort: massed practice (cramming the same card on consecutive days) feels productive but barely moves long-term retention. The counterintuitive truth: the right time to review is just as you are about to forget — at an EXPANDING gap (day 3, day 7, day 30), not the next day. Easy, well-timed effort beats hard, mistimed effort.',
  },
  {
    type: 'concept',
    title: 'A spacing queue schedules recall at expanding, interleaved intervals',
    text: 'A small set of cards — each a decision you recall WITHOUT notes — scheduled at EXPANDING intervals (same-day, 3, 7, 30): a miss resets it, a pass pushes it out. Interleave across topics so order gives no hints, and route confident-but-wrong recalls to repair.',
  },
  {
    type: 'diagram',
    title: 'Review & Repair — the closed loop this queue completes',
    subtitle:
      'Explain-back (09) surfaced the weak part, the rubric (10) scored it, the repair loop (11) fixed it — and the spacing queue (12) makes it stick, routing any confident-but-wrong recall back into repair. One circuit, not four tricks.',
    rankdir: 'LR',
    nodes: [
      { id: 'explain', label: '09 Explain-back', description: 'find the weak part', kind: 'process', tone: 'accent' },
      { id: 'rubric', label: '10 Rubric', description: 'score it, honest caps', kind: 'process', tone: 'accent' },
      { id: 'repair', label: '11 Repair loop', description: 'fix the capped dim', kind: 'process', tone: 'accent' },
      { id: 'queue', label: '12 Spacing queue', description: 'recall cold, spaced', kind: 'decision', tone: 'success' },
      { id: 'calib', label: 'Calibrate', description: 'confident + wrong?', kind: 'decision', tone: 'warning' },
    ],
    edges: [
      { from: 'explain', to: 'rubric', label: 'stall → score', kind: 'control', tone: 'accent' },
      { from: 'rubric', to: 'repair', label: 'cap → fix', kind: 'control', tone: 'accent' },
      { from: 'repair', to: 'queue', label: 'fixed → schedule', kind: 'control', tone: 'success' },
      { from: 'queue', to: 'calib', label: 'recall + score', kind: 'data' },
      { from: 'calib', to: 'repair', label: 'confident-wrong → repair', kind: 'async', tone: 'warning' },
      { from: 'calib', to: 'queue', label: 'passed → push out', kind: 'control', dashed: true, tone: 'muted' },
    ],
    legend: [
      { tone: 'accent', label: 'the module’s four moves' },
      { tone: 'success', label: 'the maintenance layer that makes it last' },
      { tone: 'warning', label: 'confident-but-wrong → highest-priority repair' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'Reading the queue, row by row',
    subtitle: 'A FILLED spacing_queue.md — cards from THIS module, each with an expanding due date and a calibration column.',
    filename: 'spacing_queue.md',
    language: 'bash',
    code: spacingQueue,
    steps: [
      { lines: [3], label: 'What a card is', note: 'One hard-won judgment to recall WITHOUT notes, then re-score honestly. Recognition is not recall.' },
      { lines: [5, 6], label: 'The table header', note: 'Each row: card · due (same/3/7/30) · last recall · confidence. The schedule and the calibration live together.' },
      { lines: [8], label: 'A shaky card', note: 'The tax-line autopsy: due day 3, recall "shaky", confidence 2 → flagged for repair. The queue catches decay.' },
      { lines: [9], label: 'A mastered card', note: 'The rubric cap rule: passed at confidence 5, pushed all the way out to day 30. Earned its long interval.' },
      { lines: [14, 15], label: 'Rules 1–2: expand + interleave', note: 'Same-day → 3 → 7 → 30, a miss resets; shuffle cards across topics so lesson order never leaks the answer.' },
      { lines: [16, 17], label: 'Rules 3–4: calibrate + due-only', note: 'Confidence 4–5 + a wrong recall routes to repair (Lesson 11). Review only what is due — spacing is the point.' },
    ],
    caption: 'Seeded with your real Module-3 decisions, this queue is the artifact that keeps the whole module alive a month later.',
  },
  {
    type: 'compare',
    title: 'Two ways to keep a decision fresh',
    subtitle: 'One feels like studying. The other actually retains.',
    left: {
      label: 'Massed re-reading',
      tone: 'warning',
      lines: [
        'Re-read the memo every day for a week',
        'Same set, same order, eyes open',
        'Recognition ("yes, I wrote that") ≠ recall',
        'Builds false familiarity, not retrieval',
        'No calibration — confident-wrong stays hidden',
      ],
      verdict: 'Feels diligent; a month later, nothing sharp comes out',
    },
    right: {
      label: 'Spaced, interleaved, calibrated',
      tone: 'success',
      lines: [
        'Turn each decision into a recall-cold card',
        'Expanding gaps: same-day → 3 → 7 → 30',
        'Interleave across topics — order gives no hints',
        'Recall WITHOUT notes; a miss resets the card',
        'Confident-but-wrong → routed to repair',
      ],
      verdict: 'A month later the new hire asks and it comes out sharp',
    },
    caption: 'The goal is effortful retrieval, not comfortable familiarity. The uncomfortable test is the one that builds durable judgment.',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'The trap pros avoid: confusing familiarity with mastery. Re-reading your own sharp memo feels great and teaches you almost nothing — your brain rewards recognition, not retrieval. The uncomfortable test (recall it cold, no notes, after a gap, mixed in with unrelated cards) is the one that actually builds durable judgment. And watch the calibration column hardest: a card you got WRONG while feeling CONFIDENT is more dangerous than one you knew you were unsure of, because confident-wrong is exactly the state in which engineers ship the bad decision. Route those to repair first.',
  },
  {
    type: 'lab',
    title: 'Seed your spacing queue (Module 3 capstone)',
    summary:
      'Build a spacing_queue.md from THIS module: at least five cards — your explain-back eight moves, the rubric cap rule, your repaired proof, the failure autopsy, the repair-loop discipline. Give each an expanding-interval due date (same-day / day 3 / day 7 / day 30), write the interleave rule (shuffle across topics, never lesson order), and add a calibration column that routes any confident-but-wrong recall back to the repair loop. This is the artifact that keeps the whole module alive.',
  },
  {
    type: 'debug',
    symptom:
      'An engineer keeps a diligent-looking review routine but cannot recall their own decisions cold a month later. Find the flaw in the ROUTINE.',
    brokenCode: `Review routine:
"Every morning I re-read all my decision memos in order, start to finish.
 I always remember them as I read — feels solid. I review the same set daily
 so nothing slips. If I recognize it, I mark it 'known' and move on."`,
    language: 'bash',
    task:
      'This routine feels rigorous but builds almost no durable recall. Name the three things it gets wrong.',
    fix:
      'First, it is MASSED, not spaced — daily review of the same set is cramming; it should expand to day 3 / 7 / 30 so each review lands as forgetting begins. Second, it is RE-READING, not retrieval — "I always remember them as I read" is recognition, not recall; the test must be answering cold with the memo closed. Third, it is in ORDER, not interleaved — same-order review lets you coast on context, so cards must be shuffled across topics. And marking on "recognize it" with no confidence check misses the confident-but-wrong cards entirely. Repair: close the notes, expand the intervals, interleave the cards, and route confident misses to the repair loop.',
  },
  {
    type: 'quiz',
    question:
      'On a day-7 review you recall a decision confidently — but you get the rollback threshold wrong. Confidence 4, recall incorrect. Where does this card go?',
    options: [
      'Mark it passed — you were confident, so you basically know it.',
      'Push it to the day-30 interval since you almost had it.',
      'Route it to the repair loop — confident-but-wrong is the highest-priority fix.',
      'Discard the card; the decision is clearly too hard to retain.',
    ],
    answer: 2,
    explanation:
      'Confident-and-wrong is the most dangerous calibration state — it is exactly how engineers ship bad decisions, certain they are right. The calibration column exists to catch precisely this: high confidence plus an incorrect recall routes straight to the repair loop (Lesson 11), not forward to a longer interval. Pushing it out (option 2) would let a confident error harden.',
  },
  {
    type: 'verification',
    intro: 'Prove your spacing queue will actually keep judgment alive:',
    items: [
      'Each card is a recall-without-notes prompt, not a re-reading prompt.',
      'Intervals EXPAND (same-day / day 3 / day 7 / day 30), and a miss resets the card.',
      'Cards are interleaved across topics — review order gives no hints.',
      'A calibration column routes confident-but-wrong recalls to the repair loop.',
      'The queue is seeded with your real Module-3 decisions, not generic facts.',
      'You can explain why daily re-reading would have been worse than this schedule.',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'Why do expanding intervals beat reviewing the same card every day?',
      'What does interleaving prevent, and how would you interleave your queue?',
      'Why is a confident-but-wrong recall more dangerous than an unsure one?',
      'Roll-call the module: how do explain-back (09), the rubric (10), the repair loop (11), and this queue (12) form one closed loop?',
    ],
  },
  {
    type: 'transfer',
    text: 'You now hold the full Review & Repair loop: explain it back to find the weak part (09), score it with a rubric and honest caps (10), repair the one capped dimension and re-test (11), and queue it for spaced, interleaved recall so it lasts (12). This is not a course mechanic — it is how durable engineering judgment is actually built and kept: prove it, find the hole, fix the hole, make it stick. Point the same loop at anything you must not forget — incident lessons, system invariants, the reasoning behind a hard call. The capstone reuses every artifact you built here: the memo, the rubric, the repair log, and this queue ARE your evidence ledger. You did not just read about good judgment. You built the system that maintains it. That is the work.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '30 days'] },
]

// =================================================================== lessons
const lessons = [
  {
    slug: '09-explain-back',
    title: 'Explain It Back: The Feynman Gate',
    eyebrow: `${MODULE_TITLE} · Lesson 1 · 25 min`,
    sort: 0,
    est_minutes: 25,
    intensity: 'standard',
    blocks: explainBackBlocks,
  },
  {
    slug: '10-review-rubric',
    title: 'The Review Rubric: Score Your Own Work',
    eyebrow: `${MODULE_TITLE} · Lesson 2 · 25 min`,
    sort: 1,
    est_minutes: 25,
    intensity: 'standard',
    blocks: reviewRubricBlocks,
  },
  {
    slug: '11-repair-loop',
    title: 'The Repair Loop: Fix the Weakest Part',
    eyebrow: `${MODULE_TITLE} · Lesson 3 · 25 min`,
    sort: 2,
    est_minutes: 25,
    intensity: 'standard',
    blocks: repairLoopBlocks,
  },
  {
    slug: '12-spacing-queue',
    title: 'The Spacing Queue: Make It Stick',
    eyebrow: `${MODULE_TITLE} · Lesson 4 · 25 min`,
    sort: 3,
    est_minutes: 25,
    intensity: 'capstone',
    blocks: spacingQueueBlocks,
  },
]

// =================================================================== apply
async function main(): Promise<void> {
  if (!shouldApply) {
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          applyCommand:
            'tsx --env-file=.env.local scripts/academy/course00/seed-module-3.ts --apply',
          course: COURSE_SLUG,
          module: MODULE_TITLE,
          moduleSort: MODULE_SORT,
          lessons: lessons.map((l) => ({
            slug: l.slug,
            title: l.title,
            sort: l.sort,
            blocks: l.blocks.length,
            blockTypes: l.blocks.map((b) => b.type),
          })),
          note: 'UPDATE-only: these four lesson rows already exist (ingested by ingest-career-os.ts). Slugs + per-lesson sort are never changed.',
        },
        null,
        2,
      ),
    )
    console.log(
      `\nDRY-RUN: would update ${lessons.length} Module-3 lessons in "${COURSE_SLUG}". Re-run with --apply to write.`,
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
      `Course "${COURSE_SLUG}" not found. Run ingest-career-os.ts --apply first, then re-run this seed.`,
    )
    process.exit(1)
  }

  // 1. Guard: the four skeleton lessons must already exist — this seed UPDATEs
  //    their blocks, it does not create them (so we never invent the wrong slug).
  for (const l of lessons) {
    const { data: existing, error: existErr } = await sb
      .from('academy_lessons')
      .select('slug')
      .eq('course_slug', COURSE_SLUG)
      .eq('slug', l.slug)
      .maybeSingle()
    if (existErr) throw existErr
    if (!existing) {
      console.error(
        `Lesson "${l.slug}" not found in "${COURSE_SLUG}". Expected the ingest skeleton to have created it. Aborting before partial write.`,
      )
      process.exit(1)
    }
  }

  // 2. UPDATE each lesson's blocks + Module-3 metadata. Idempotent on
  //    (course_slug, slug). Slugs and per-lesson sort are kept exactly.
  for (const l of lessons) {
    const { error } = await sb
      .from('academy_lessons')
      .update({
        title: l.title,
        eyebrow: l.eyebrow,
        module_title: MODULE_TITLE,
        module_sort: MODULE_SORT,
        sort: l.sort,
        est_minutes: l.est_minutes,
        is_free_preview: false,
        status: 'published',
        intensity: l.intensity,
        blocks: l.blocks,
      })
      .eq('course_slug', COURSE_SLUG)
      .eq('slug', l.slug)
    if (error) throw error
  }

  // 3. Maintain the denormalized lesson counter on the course.
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
