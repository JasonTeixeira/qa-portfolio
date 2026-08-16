/**
 * Seed "Module 4 · Transfer & Gate" — the CAPSTONE module of Course 00,
 * Engineering Judgment Foundation. This course is the gate to the whole Sage
 * curriculum: it does not teach syntax, it teaches the judgment an engineer
 * uses when the evidence is incomplete and stakeholders disagree.
 *
 *   tsx scripts/academy/course00/seed-module-4.ts                          # dry-run (default)
 *   tsx --env-file=.env.local scripts/academy/course00/seed-module-4.ts --apply
 *
 * Course:  career-engineering_judgment_foundation  (existing — ingested by
 *          scripts/academy/ingest-career-os.ts as a skeleton).
 * Module:  Module 4 · Transfer & Gate  (module_sort 3 — the final module).
 *
 * What this seed does: UPDATE the four already-ingested skeleton lessons of
 * Module 4 in place (by course_slug + slug), replacing their placeholder
 * `blocks` with full world-class judgment lessons and relabelling the module to
 * "Module 4 · Transfer & Gate". It NEVER changes a slug (learner progress +
 * evidence ledger reference slugs) and it NEVER creates new rows — if a target
 * slug is missing, run the ingest first. Idempotent: re-run any time.
 *
 *   13-transfer-challenge   (sort 0)  Transfer Challenge
 *   14-package-evidence     (sort 1)  Package Evidence
 *   15-unlock-gate          (sort 2)  Unlock Gate
 *   16-capstone-rehearsal   (sort 3)  Capstone Rehearsal  ← the gate-passing moment
 *
 * VISUAL-FIRST (mirrors the locked Module 1 System Map lesson, score 95): each
 * lesson folds its prose-heavy beats into THREE hero visuals — a `diagram` for
 * the structure/flow, a `code-walkthrough` that steps a FILLED worked artifact
 * line-by-line (the decision memo / evidence ledger / gate / mastery packet),
 * and a `compare` for the weak-vs-gold contrast (the noun-swap, the topic-claim,
 * the averaged gate, the clean-vs-honest packet). The visual is the HERO; text
 * is a tight caption. The assessment beats (quiz / verification / teachback) are
 * preserved. Prose is trimmed to budget: mission ≤ 2 sentences, concept ≤ ~40
 * words, context ≤ 2 sentences.
 *
 * JUDGMENT ADAPTATION (no Pyodide / no executable code labs in this course):
 * the "guaranteed win" is a REVIEWABLE ARTIFACT, not a passing test. The artifact
 * bar lives in sprint-contract + verification; the worked artifact lives in the
 * code-walkthrough (FILLED, never a blank template); the flawed-reasoning autopsy
 * and the calibration contrast live in the compare.
 *
 * Connective tissue: transfer → package-evidence → unlock-gate → capstone reads
 * as one arc. The capstone roll-calls every lesson of the course and reads as a
 * genuine gate-passing moment, with sprint-contract intensity 'capstone'.
 *
 * Ordering: the reader (lib/academy/content.ts) sorts by (module_sort, sort).
 * Idempotent: UPDATE on (course_slug, slug); the relabel is part of that UPDATE.
 *
 * Source (read-only, mined for substance — never written to):
 *   AI_CAREER_OPERATING_SYSTEM/courses/00_engineering_judgment_foundation/
 *     modules/04_module_4/lessons/*.md
 */

import { createClient } from '@supabase/supabase-js'
import type { LessonBlock } from '@/data/academy/sample-course'

const shouldApply = process.argv.includes('--apply')

const COURSE_SLUG = 'career-engineering_judgment_foundation'
const MODULE_TITLE = 'Module 4 · Transfer & Gate'
const MODULE_SORT = 3

// The one artifact every lesson in this module reads, hardens, and reuses.
const DECISION_MEMO = 'engineering_judgment_decision_memo.md'

// =========================================================== LESSON 13
// Transfer Challenge — can the learner carry the judgment pattern into a domain
// it was never taught in, and name what stays invariant vs. what changes.

// The FILLED auth-cache decision memo — the worked example, made the hero of a
// stepped walkthrough (never a blank template).
const AUTH_CACHE_MEMO = `# Decision Memo — cache the auth endpoint to cut load
# ${DECISION_MEMO}

## Decision
Cache ONLY negative results (failed lookups), 5s TTL; never cache a valid token.

## Rejected
Caching successful auth — a stale "valid" is a security hole; that risk
dominates the latency win.

## Expected failure
A user is banned, their session revoked, but a cached "valid" keeps them in
for the TTL window — invisible in staging, where nobody gets revoked.

## Verification
Contract test: revoked sessions are NEVER served from cache.

## Reversal condition
Any auth-bypass report flips the cache off immediately — no meeting required.

## Invariant carried
Name the decision · mark assumptions · compare by cost + reversibility ·
name the realistic failure · pick the strongest proof · write the reversal.

## Domain load (re-derived)
User: every logged-in request. Risk if wrong: SECURITY, not latency.
Privacy: auth state now lives in a second place.`

const transferChallengeBlocks: LessonBlock[] = [
  {
    type: 'sprint-contract',
    outcome:
      'Apply the engineering-judgment pattern — decide, show the artifact, name the failure, prove it, defend it — COLD to a domain you were never taught. Produce a decision memo that survives a reviewer who never saw your original work.',
    intensity: 'deep',
    time: '20–30 min',
    proof: `A new ${DECISION_MEMO} for an unfamiliar decision, with an explicit "what stays invariant / what changes" section naming the new domain's user, scale, risk, cost, latency, and privacy pressures.`,
    unlock:
      'Your memo reads as judgment applied to a NEW problem — not your old answer with the nouns swapped. The invariant section and the changed-load section are both specific and both true.',
    doNotClaim:
      'Do not claim "transfer" because you reused the template. Transfer means the JUDGMENT survived the domain change — if your failure case, reviewer objection, and reversal condition did not change with the domain, you transferred a form, not a skill.',
  },
  {
    type: 'mission',
    text: 'A staff engineer drops a problem from a system you have never touched — a payments queue, a rate limiter, a retention policy — no runbook, decision due today. The junior freezes at the unfamiliar nouns; you do not, because the SHAPE is familiar: incomplete evidence, disagreeing stakeholders, a reversible-or-not call.',
  },
  {
    type: 'context',
    text: 'The market does not pay for "can do the exact thing they were trained on" — it pays for judgment that travels. This lesson is the bridge from "I learned a method" to "I own a method," and it opens the module: transfer here, package next, gate after, rehearse in the capstone.',
  },
  {
    type: 'pretest',
    prompt:
      'A learner aces a memo on shipping a feature flag, then writes one on deleting six months of user analytics — same memo, "feature flag" swapped for "data deletion." Did they transfer the skill?',
    reveal:
      'No — they transferred the template, not the judgment. The two decisions have different invariants: the flag is cheaply reversible; the deletion is not, and once the data is gone no reversal condition brings it back — which should dominate the entire memo. A real transfer changes the FAILURE case (irreversible loss, not a bad rollout), the reviewer objection (legal/retention, not user impact), and the reversal condition (there may not be one). If those three did not move, no transfer happened. Transfer is measured by what changed, not by what was reused.',
  },
  {
    type: 'concept',
    title: 'Transfer = invariant skeleton + re-derived domain load',
    text: 'The skeleton never changes: name the decision, mark assumptions, compare by cost and reversibility, name the realistic failure, pick the strongest proof, write the reversal. The LOAD is what the new domain forces on. Carry both — or get a hollow memo or a panicked guess.',
  },
  {
    type: 'diagram',
    title: 'The two layers of a real transfer',
    subtitle:
      'The invariant skeleton (unchanged everywhere) and the re-derived load (new every domain) BOTH feed the memo. Carry only the skeleton → hollow; re-derive only the load → panic. Both, or it is not transfer.',
    rankdir: 'LR',
    nodes: [
      { id: 'skeleton', label: 'Invariant skeleton', description: 'decision · assumptions · cost+reversibility · failure · proof · reversal', kind: 'process', tone: 'accent' },
      { id: 'load', label: 'Domain load', description: 're-derived: user · scale · risk · cost · latency · privacy', kind: 'process', tone: 'warning' },
      { id: 'memo', label: 'Transferred memo', description: 'judgment, not a noun-swap', kind: 'store', tone: 'success' },
      { id: 'reviewer', label: 'Cold reviewer', description: 'never saw your old work', kind: 'decision' },
      { id: 'swap', label: 'Noun-swap', description: 'old answer, new nouns', kind: 'external', tone: 'muted' },
    ],
    edges: [
      { from: 'skeleton', to: 'memo', label: 'carried unchanged', kind: 'data', tone: 'accent' },
      { from: 'load', to: 'memo', label: 're-derived from scratch', kind: 'data', tone: 'warning' },
      { from: 'memo', to: 'reviewer', label: 'must survive', kind: 'control', tone: 'success' },
      { from: 'swap', to: 'memo', label: 'skips the load — fails', kind: 'control', dashed: true, tone: 'muted' },
    ],
    legend: [
      { tone: 'accent', label: 'skeleton — true in every domain' },
      { tone: 'warning', label: 'load — re-derived for THIS domain' },
      { tone: 'muted', label: 'the noun-swap that fakes transfer' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'A real transfer, worked line by line',
    subtitle: 'Decision: add a cache in front of a slow AUTH endpoint to cut load. Watch the load re-derive the whole memo.',
    filename: DECISION_MEMO,
    language: 'bash',
    code: AUTH_CACHE_MEMO,
    steps: [
      { lines: [4, 5], label: 'The decision (load-shaped)', note: 'A weak transfer writes "add the cache." The strong one is already shaped by the auth load: cache only negatives, never a valid token.' },
      { lines: [7, 8, 9], label: 'Rejected, with the dominating risk', note: 'Caching a successful auth is rejected because a stale "valid" is a SECURITY hole — that risk dominates the latency win. The load, not the template, picks the loser.' },
      { lines: [11, 12, 13], label: 'The domain-specific failure', note: 'Not "it might be slow." A revoked session stays valid for the TTL window — sharp, auth-specific, and invisible in staging where nobody gets revoked.' },
      { lines: [15, 16], label: 'The strongest available proof', note: 'A contract test asserting revoked sessions are never served from cache. The proof is chosen for THIS failure, not pasted from the last memo.' },
      { lines: [18, 19], label: 'Reversal matched to reversibility', note: 'Cheaply reversible, so: any auth-bypass report flips the cache off immediately — no meeting. Re-derived, not inherited.' },
      { lines: [21, 22, 23, 25, 26, 27], label: 'Skeleton vs load, named', note: 'The two explicit sections the proof demands — what you carried unchanged, and what this domain forced you to re-derive.' },
    ],
    caption: 'Every load-bearing line is domain-specific. If a line would survive a find-and-replace into a different memo, it was not transferred.',
  },
  {
    type: 'compare',
    title: 'Noun-swap vs real transfer',
    subtitle: 'Same skeleton, new domain (auto-delete inactive accounts after 90 days). Only one re-derives reversibility.',
    left: {
      label: 'Noun-swap (reversible skeleton)',
      tone: 'warning',
      lines: [
        'Decision: auto-delete after 90 days',
        'Rejected: "keep forever — wastes storage"',
        'Failure: "the deletion job might be slow"',
        'Verification: "it works in staging"',
        'Reversal: "turn the job off"',
      ],
      verdict: 'Treats an irreversible call as reversible — broken',
    },
    right: {
      label: 'Real transfer (re-derived load)',
      tone: 'success',
      lines: [
        'Failure: a dormant-but-paying annual user is deleted; returns to find data gone',
        'Verification: dry-run lists what WOULD delete, reviewed first',
        'Plus a 30-day soft-delete window before hard-delete',
        'Reversal: NONE after hard-delete — which is WHY dry-run + window are mandatory',
        'Reversibility re-derived, not inherited',
      ],
      verdict: 'Judgment moved with the domain',
    },
    caption: 'The tell of a fake transfer: a failure case ("might be slow") that would be true of almost any decision. The fix is not better wording — it is re-deriving reversibility for the new domain.',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'The thing seniors know that juniors miss: attack reversibility FIRST in any unfamiliar domain. Ask "if I am wrong, how expensive is undo?" A cheaply-reversible call can be made fast and loose; an irreversible one (deleting data, leaking a secret, a public commitment) deserves ten times the rigor no matter how small it looks. Juniors weight decisions by how hard they FEEL; seniors weight them by how hard they are to UNDO — and most of the memo then writes itself.',
  },
  {
    type: 'quiz',
    question:
      'You wrote a decision memo in a brand-new domain. Which single fact most reliably tells you the JUDGMENT transferred, not just the template?',
    options: [
      'You used every heading from the skeleton.',
      'Your failure case and reversal condition are specific to this domain and would NOT be true of your previous memo.',
      'The memo is longer than your last one.',
      'A reviewer agreed the formatting was clean.',
    ],
    answer: 1,
    explanation:
      'Transfer is measured by what changed under the new load. If the failure case and reversal condition are domain-specific — true here, false in your previous memo — the judgment moved with you. Headings, length, and clean formatting can all be present in a hollow noun-swap.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes. Confirm each against your cold-domain memo:',
    items: [
      'The domain is one you were NOT walked through earlier in this course.',
      'The "Invariant" section names the skeleton you carried from prior decisions.',
      'The "Domain load" section names this domain\'s user, scale, risk, cost, latency, and privacy specifically.',
      'Your failure case is sharp enough that it would be FALSE if pasted into a different memo.',
      'Your reversal condition matches the actual reversibility of THIS decision (and says "none" honestly if there is none).',
      'A reader with no context could agree the judgment transferred, not just the format.',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'In your own words: what is the difference between transferring a template and transferring a skill?',
      'Point at the exact line in your memo that proves the failure case is domain-specific, not noun-swapped.',
      'Why does attacking reversibility first make an unfamiliar decision easier to reason about?',
      'Name one decision from your real work this week where the same invariant skeleton would apply, and one thing the load would change.',
    ],
  },
  {
    type: 'transfer',
    text: 'You just made the move the market actually pays for: you carried judgment into a problem nobody handed you a runbook for. Now widen it — next time you join a team, inherit a legacy system, or get pulled into an incident in code you have never read, run the same two-layer move: carry the invariant skeleton, re-derive the load. The domains keep changing for your whole career; the skeleton does not. Next lesson, you stop producing decisions and start packaging them — turning today\'s memo into evidence a reviewer can trust without taking your word for it.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '30 days'] },
]

// =========================================================== LESSON 14
// Package Evidence — turn a decision into something a reviewer can trust without
// taking your word for it: a ledgered, inspectable, claim-named evidence trail.

// The FILLED evidence ledger — a real git-tracked artifact, made the hero of a
// stepped walkthrough.
const EVIDENCE_LEDGER_FILLED = `# Append this decision to the course evidence ledger, commit it, and PUSH it,
# so the proof is timestamped by the remote — not a claim in your head.

cat >> evidence_ledger.md <<'ENTRY'

## auth-cache decision — 2026-06-18
- claim:    "I can decide under incomplete evidence and defend the failure case."
- artifact: ./${DECISION_MEMO}
- proof:    contract test (revoked sessions never served from cache)
- failure: stale-revoked-session — predicted IN ADVANCE, see commit below
- status:  passed
ENTRY

git add evidence_ledger.md ${DECISION_MEMO}
git commit -m "evidence: auth-cache decision memo + predicted failure autopsy"
git push   # the remote records WHEN it received this — that part you cannot backdate`

const packageEvidenceBlocks: LessonBlock[] = [
  {
    type: 'sprint-contract',
    outcome:
      'Turn last lesson\'s decision into packaged EVIDENCE — a ledgered, inspectable trail that lets a reviewer who was not in the room verify your judgment without taking your word for it. The portfolio claim must name the proof, not the topic.',
    intensity: 'deep',
    time: '20–30 min',
    proof: `An evidence ledger entry linking ${DECISION_MEMO} to a named claim, a concrete proof method, and a status — committed to git so it is timestamped and inspectable, not asserted from memory.`,
    unlock:
      'A reviewer can open your ledger, follow the link to the artifact, find the failure autopsy and the proof method, and agree the claim is earned — without asking you a single question.',
    doNotClaim:
      'Do not claim "evidence" for a confident summary of what you did. Evidence is something a skeptic can independently inspect. If the only place your proof exists is your own description of it, you have a claim, not evidence.',
  },
  {
    type: 'mission',
    text: 'Promotion committee, Friday. Two engineers both say "I have strong judgment under ambiguity." One opens a ledger — the decision, the artifact, the failure they predicted, the reviewer who pushed back and how they answered; the other says "trust me." Same words, one gets the level — the difference is who packaged the evidence.',
  },
  {
    type: 'context',
    text: 'A decision that lives only in your head is invisible to the people who decide your career, fund your project, or inherit your system. Packaging is the hinge of the course: transfer proved you can decide anywhere, this proves you can show it, and the gate next lesson uses this package as its literal key.',
  },
  {
    type: 'pretest',
    prompt:
      'An engineer writes a beautiful decision memo and saves it to their personal notes. Is that evidence a reviewer can trust?',
    reveal:
      'Not yet. A memo in private notes proves nothing to a skeptic — it is unledgered, untimestamped, and unlinked to a claim, so a reviewer cannot tell whether it was written before the outcome (judgment) or after (a story). Evidence becomes trustworthy the moment it is (1) committed somewhere timestamped, (2) linked to a specific claim, and (3) accompanied by the failure you predicted IN ADVANCE. The memo is the artifact; the package is what makes it believable. Quality of the memo is necessary — but the PACKAGING is what a reviewer actually checks.',
  },
  {
    type: 'concept',
    title: 'Evidence = claim + artifact + proof + predicted failure, made inspectable',
    text: 'CLAIM names what you can do as a proof, not a topic. ARTIFACT is the inspectable file. PROOF is the strongest check available. PREDICTED FAILURE is the autopsy written before the outcome. The binding property: independently inspectable — committed, timestamped, linked.',
  },
  {
    type: 'diagram',
    title: 'What turns a memo into evidence',
    subtitle:
      'Four parts feed the package; one property — independently inspectable — is what a skeptic actually checks. Drop a part and it weakens; drop inspectability and it is not evidence at all.',
    rankdir: 'LR',
    nodes: [
      { id: 'claim', label: 'Claim', description: 'a proof, not a topic', kind: 'process', tone: 'accent' },
      { id: 'artifact', label: 'Artifact', description: `./${DECISION_MEMO}`, kind: 'store' },
      { id: 'proof', label: 'Proof', description: 'test · contract · telemetry · reviewer rubric', kind: 'process' },
      { id: 'failure', label: 'Predicted failure', description: 'autopsy written BEFORE the outcome', kind: 'process', tone: 'warning' },
      { id: 'ledger', label: 'Evidence ledger', description: 'committed · timestamped · linked', kind: 'store', tone: 'success' },
      { id: 'skeptic', label: 'Skeptic', description: 'verifies without you in the room', kind: 'decision' },
    ],
    edges: [
      { from: 'claim', to: 'ledger', label: 'names', kind: 'data', tone: 'accent' },
      { from: 'artifact', to: 'ledger', label: 'links', kind: 'data' },
      { from: 'proof', to: 'ledger', label: 'backs', kind: 'data' },
      { from: 'failure', to: 'ledger', label: 'timestamps', kind: 'data', tone: 'warning' },
      { from: 'ledger', to: 'skeptic', label: 'inspectable — no questions', kind: 'control', tone: 'success' },
    ],
    legend: [
      { tone: 'accent', label: 'claim phrased as a proof' },
      { tone: 'warning', label: 'failure predicted in advance (pushed before the outcome)' },
      { tone: 'success', label: 'the inspectable package' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'Committing the evidence, line by line',
    subtitle: 'The ledger entry + the commit that timestamps it — the move every promotion packet repeats.',
    filename: 'evidence_ledger.md',
    language: 'bash',
    code: EVIDENCE_LEDGER_FILLED,
    steps: [
      { lines: [7], label: 'The claim — a proof, not a topic', note: '"I can decide under incomplete evidence and defend the failure case," not "I know about decision memos." A reviewer can check the first; the second is unfalsifiable.' },
      { lines: [8], label: 'The link to the artifact', note: 'A path a skeptic can open. The claim is worthless if it does not end in something inspectable.' },
      { lines: [9], label: 'The strongest available proof', note: 'A contract test here — not "I tested it." Name the check, not the feeling.' },
      { lines: [10], label: 'The predicted failure', note: 'The stale-revoked-session case, marked predicted-in-advance. This single line is what separates judgment from a post-hoc story.' },
      { lines: [14, 15, 16], label: 'Commit, then push — the timestamp a skeptic trusts', note: 'A local commit proves nothing on its own — commit dates are freely settable and history can be rewritten. The push is what matters: the shared remote records when it RECEIVED the autopsy, and a pre-outcome prediction is hard to dispute once pushed.' },
    ],
    caption: 'Push the predicted failure early, on purpose. The remote\'s record of when it arrived is the part a skeptic cannot argue with.',
  },
  {
    type: 'compare',
    title: 'Claiming the topic vs claiming the proof',
    subtitle: 'The portfolio claim is the headline a reviewer reads first — it decides whether they trust the rest.',
    left: {
      label: 'Topic claim (unfalsifiable)',
      tone: 'warning',
      lines: [
        '"Skilled at engineering judgment and decision-making."',
        '"Experienced in decision-making under ambiguity."',
        'Names a topic — proves nothing',
        'Inspectable nowhere',
        'A reviewer can neither disprove nor verify it',
      ],
      verdict: 'Zero weight — anyone can claim it',
    },
    right: {
      label: 'Proof claim (inspectable)',
      tone: 'success',
      lines: [
        '"Decided under incomplete evidence on an auth-cache change;',
        'predicted the stale-revoked-session failure in advance,',
        'proved the guard with a contract test,',
        'defended the call against a security reviewer —',
        'see evidence_ledger.md#auth-cache"',
      ],
      verdict: 'Earns the promotion — ends in an inspectable link',
    },
    caption: 'If your claim cannot be DISPROVEN by opening a file, it cannot be PROVEN by one either. Always name the inspectable thing and the failure you called in advance.',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'The pro move beginners miss: get the predicted failure onto a shared remote BEFORE the outcome. Anyone can write "I knew that would happen" after a system breaks — and anyone can backdate a local commit, so a prediction that never left your machine is still just a story. Push it, or open a PR: the remote\'s received timestamp is set by the server, which makes backdating impractical. Reviewers have seen a thousand post-hoc rationalizations; a pre-mortem that reached the remote before the outcome stops the conversation.',
  },
  {
    type: 'quiz',
    question:
      'A reviewer is deciding whether to trust your "judgment under ambiguity" claim. What do they actually check first?',
    options: [
      'How confident your summary sounds.',
      'Whether the claim names an inspectable proof and a failure you predicted in advance.',
      'How many decision memos you have written total.',
      'Whether you used the word "ambiguity" correctly.',
    ],
    answer: 1,
    explanation:
      'Reviewers trust evidence, not confidence. The first thing a skeptic checks is whether the claim points at something they can inspect — a linked artifact, a named proof, and a failure you called before the outcome. Volume and vocabulary are not proof.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes. Confirm each against your packaged evidence:',
    items: [
      'Your ledger entry names a CLAIM phrased as a proof, not a topic.',
      'The entry links to the actual memo artifact (a path a reviewer can open).',
      'The PROOF method is the strongest one available for this artifact (test / contract / telemetry / reviewer rubric).',
      'The PREDICTED FAILURE was written before the outcome — and was pushed to a shared remote before the outcome, so the order is checkable.',
      'The whole package is committed and timestamped, not living in private notes.',
      'A skeptic could verify your judgment from the ledger alone, with no questions for you.',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'Explain the difference between a claim and evidence to someone who has never made the distinction.',
      'Why does a failure autopsy timestamped BEFORE the outcome carry more weight than the same words written after?',
      'Point at the line in your portfolio claim that names the PROOF rather than the topic.',
      'What would a reviewer be unable to verify if you had left the memo in private notes?',
    ],
  },
  {
    type: 'transfer',
    text: 'You now know how to make judgment legible — and that skill outlives this course. Every promotion packet, design review, postmortem, and funding pitch is the same move: name the claim as a proof, link the inspectable artifact, show the failure you called in advance. Engineers who package evidence get believed; engineers who summarize get second-guessed. Start a real evidence_ledger.md in your actual work and add to it on every non-trivial call — in a year it is the most persuasive document you own. Next lesson, this package stops being a nice-to-have and becomes the literal key: the unlock gate checks the evidence, and only evidence opens it.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '30 days'] },
]

// =========================================================== LESSON 15
// Unlock Gate — an honest gate that opens ONLY on evidence, with no soft caps,
// and routes every gap to a specific repair instead of waving it through.

// The FILLED gate result — one required criterion MISSING, closing the gate.
const GATE_RESULT_FILLED = `# Honest gate — run as a CONJUNCTION (AND), never an average.
# All required criteria must be PASS by inspectable evidence.

retrieval:     PASS    # stated the invariant with no notes, vs the concept block
artifact:      PASS    # ./${DECISION_MEMO} exists and opens
proof:         REPAIR  # have a reviewer rubric, never ran it past anyone
failure_case:  PASS    # stale-revoked-session — realistic, production-grade
transfer:      PASS    # cold-domain memo, judgment moved

# => 4 PASS, 1 REPAIR. A gate is NOT 80% open — one required REPAIR closes it.
GATE: CLOSED

# Route the red, do not wave it through:
repair(proof) -> verification: get the reviewer rubric actually applied,
                 do NOT self-grade it green.
# Then RE-CHECK proof. Gate opens only when proof is genuinely PASS.`

const unlockGateBlocks: LessonBlock[] = [
  {
    type: 'sprint-contract',
    outcome:
      'Run an honest unlock gate on your own work: it opens ONLY when the evidence exists, refuses to round a gap up to a pass, and routes every miss to a specific repair before re-checking. Gate yourself the way a reviewer would — and pass or repair honestly.',
    intensity: 'deep',
    time: '20–30 min',
    proof:
      'A completed gate checklist against your packaged evidence, each criterion marked pass or repair, every repair routed to a named action, and a re-check after repair — applied to YOUR artifact, not a hypothetical.',
    unlock:
      'Every gate criterion is genuinely met by inspectable evidence, OR is honestly marked "repair needed" with the specific fix named. No criterion is waved through on confidence.',
    doNotClaim:
      'Do not claim the gate "passed" because most criteria were green. A gate is not an average — one missing piece of required evidence means the gate is closed. Honest red is worth more than dishonest green, and a gate you game protects nothing.',
  },
  {
    type: 'mission',
    text: 'Every real system has a gate: the merge that needs a green CI run, the release that needs sign-off, the deploy that needs the checklist — because "I am pretty sure it is fine" has shipped more outages than any bug. The engineers trusted with production gate themselves HARDER than the reviewer would, catching their own missing evidence first.',
  },
  {
    type: 'context',
    text: 'This is where the course tightens into a standard. Transfer proved you can decide anywhere; package made the decision inspectable; now the gate decides whether the evidence is actually sufficient — without mercy and without inflation. If the gate opens on confidence, the package was theater.',
  },
  {
    type: 'pretest',
    prompt:
      'A learner reviews their own evidence: "I hit retrieval, the artifact, the explanation, and the transfer — four of five. The proof is a bit thin but the rest is strong, so I will call it a pass." Honest gate?',
    reveal:
      'No — that is averaging, and a gate does not average. Proof is a REQUIRED criterion, not a weighted one; "a bit thin" on proof means the gate is closed until the proof is real, no matter how strong the other four are. The instinct to round up — "mostly there, so basically passed" — is exactly the instinct an honest gate exists to stop, because it is the same instinct that ships a release with a skipped test. A gate is a conjunction (all required AND-ed), never a sum. One honest red closes it.',
  },
  {
    type: 'concept',
    title: 'A gate is a conjunction with no soft caps, and every red has a repair route',
    text: 'Required criteria, all met by inspectable evidence — an AND, not an average. Two non-negotiables: no soft caps (honest red is the correct output when evidence is missing), and every red routes to a specific repair, then you RE-CHECK before declaring it open.',
  },
  {
    type: 'diagram',
    title: 'The gate as a conjunction',
    subtitle:
      'Every required criterion must be PASS by inspectable evidence to open. One red routes to its specific repair, then re-checks — it never averages its way open.',
    rankdir: 'LR',
    nodes: [
      { id: 'retrieval', label: 'Retrieval', description: 'invariant, no notes', kind: 'process', tone: 'success' },
      { id: 'artifact', label: 'Artifact', description: 'memo exists + opens', kind: 'process', tone: 'success' },
      { id: 'proof', label: 'Proof', description: 'rubric never run — RED', kind: 'process', tone: 'warning' },
      { id: 'gate', label: 'AND gate', description: 'all required PASS?', kind: 'decision', tone: 'accent' },
      { id: 'closed', label: 'CLOSED', description: 'one red closes it', kind: 'store', tone: 'warning' },
      { id: 'repair', label: 'Repair route', description: 'proof → verification repair', kind: 'process', tone: 'accent' },
    ],
    edges: [
      { from: 'retrieval', to: 'gate', label: 'PASS', kind: 'data', tone: 'success' },
      { from: 'artifact', to: 'gate', label: 'PASS', kind: 'data', tone: 'success' },
      { from: 'proof', to: 'gate', label: 'RED', kind: 'data', tone: 'warning' },
      { from: 'gate', to: 'closed', label: 'any red ⇒ closed', kind: 'control', tone: 'warning' },
      { from: 'closed', to: 'repair', label: 'route the red', kind: 'async', tone: 'accent' },
      { from: 'repair', to: 'gate', label: 're-check', kind: 'control', dashed: true, tone: 'accent' },
    ],
    legend: [
      { tone: 'success', label: 'met by inspectable evidence' },
      { tone: 'warning', label: 'one honest red — closes the gate' },
      { tone: 'accent', label: 'route to repair, then re-check' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'Reading a closed gate, line by line',
    subtitle: 'Four passes, one honest red. Watch why "4 of 5" is not 80% open — it is closed.',
    filename: 'gate_result.txt',
    language: 'bash',
    code: GATE_RESULT_FILLED,
    steps: [
      { lines: [4, 5], label: 'Each PASS names its evidence', note: 'Not "I think so." Retrieval is checked against the concept block; the artifact is a file that opens. A PASS you cannot point at is not a PASS.' },
      { lines: [6], label: 'The honest red', note: 'A reviewer rubric you have never actually run past anyone is not proof — it is a plan. REPAIR, not a generous PASS.' },
      { lines: [10, 11], label: 'Why 4/5 does not open it', note: 'The gate is a conjunction, not a percentage. One required REPAIR closes it regardless of how many others pass.' },
      { lines: [13, 14, 15], label: 'Route the red to a named repair', note: 'proof → verification repair: get the rubric applied. "Do better" is not a route; "run the rubric past a reviewer" is.' },
      { lines: [16], label: 'Re-check before declaring open', note: 'The gate reopens only when proof is genuinely PASS — not when you feel finished. That re-check is the whole discipline.' },
    ],
    caption: 'The honest CLOSED here is worth more than a green you would have to defend later. Gates are blind to how hard you worked.',
  },
  {
    type: 'compare',
    title: 'Two ways to read the same gate',
    subtitle: 'Same four-pass-one-red result. One averages it open; one holds the line.',
    left: {
      label: 'Averaging + effort discount',
      tone: 'warning',
      lines: [
        '"4 of 5 met — 80%, basically passed."',
        '"I worked really hard, the thin proof should count."',
        'Treats a required criterion as weighted',
        'Lets deadline / sunk cost buy a pass',
        'Gate has never once stopped anything',
      ],
      verdict: 'A rubber stamp — protects nothing',
    },
    right: {
      label: 'Honest conjunction',
      tone: 'success',
      lines: [
        'One required red ⇒ GATE CLOSED, full stop',
        'Effort is invisible to the gate — it checks evidence',
        'Red routed to verification repair, named',
        'Re-checked after repair before opening',
        'Opens only when the proof is genuinely real',
      ],
      verdict: 'A gate that means something',
    },
    caption: 'The gate is most valuable exactly when it is most inconvenient. The first time it forces you to hold a release you wanted to ship is the gate doing its entire job.',
  },
  {
    type: 'callout',
    tone: 'note',
    text: 'What pros internalize: a gate that only ever passes is decoration — it has never once stopped anything, so it proves nothing. Under deadline pressure the default is to HOLD the line, because "repair later" is where evidence goes to die. If you cannot name the reversal condition for shipping with thin proof, you do not get to ship with thin proof.',
  },
  {
    type: 'quiz',
    question:
      'Your gate has five required criteria. Four are met by inspectable evidence; one (proof) is honestly missing. What is the correct gate state?',
    options: [
      'Open — four out of five is a strong majority.',
      'Open with a note to fix proof later.',
      'Closed — a required criterion is unmet, so the conjunction fails; repair proof, then re-check.',
      'Closed permanently — a single miss disqualifies the work.',
    ],
    answer: 2,
    explanation:
      'A gate is an AND of required criteria, not a majority vote. One unmet required criterion closes it — but not permanently: you route the gap to its repair and re-check. The gate reopens the moment the evidence is real, not before.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes. Confirm each against your completed gate:',
    items: [
      'Every gate criterion is marked PASS or REPAIR — none left ambiguous.',
      'Each PASS names the inspectable thing that backs it (you can point at it).',
      'Each REPAIR names a specific route (concept / build / verification / oral-defense), not "do better."',
      'You did NOT open the gate on a majority — any required red kept it closed.',
      'After repairing a red, you RE-CHECKED that criterion before declaring the gate open.',
      'Your final gate state is one you would defend to a reviewer out loud.',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'Explain why a gate is a conjunction and not an average, to someone tempted to round up.',
      'What is the "effort discount," and why must an honest gate refuse it?',
      'Walk through one red on your gate: the criterion, the repair route, and the re-check.',
      'Describe a time a gate (CI, sign-off, review) caught something you would have shipped — or, if none, why running your own gate is the substitute.',
    ],
  },
  {
    type: 'transfer',
    text: 'You now own the most underrated senior skill: gating your own work honestly, before anyone makes you. Carry it everywhere — your pull requests get a self-gate before you request review, your designs get a gate before the meeting, your claims get a gate before they hit a resume. The engineers trusted with bigger and bigger blast radius are the ones whose self-gate is stricter than the org\'s, so their work clears review the first time. Next is the capstone: one gate over the entire course. Everything you just practiced — honest red, required-criteria conjunction, repair-then-recheck — you will now run across all four modules at once. Bring your evidence.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '30 days'] },
]

// =========================================================== LESSON 16
// Capstone Rehearsal — one gate over the whole course. Roll-call every module,
// assemble the mastery packet, and pass the gate that opens the curriculum.

// The FILLED mastery packet + its honest gate — the worked capstone artifact.
const MASTERY_PACKET_FILLED = `# Mastery Packet — Course 00: Engineering Judgment Foundation
# Assemble, then run your own HONEST gate over all of it (no soft caps).

## 1. Diagnostic        — where I started, honestly (Module 1)
## 2. Decision memo     — ${DECISION_MEMO} (Module 2)
## 3. Failure autopsy   — the failure I predicted in advance (Module 3)
## 4. Proof             — strongest check the repaired version survived (Module 3)
## 5. Reviewer objection answered — hardest pushback + my answer (Module 2)
## 6. Transfer case     — judgment carried to a new domain (Module 4 · transfer)
## 7. Evidence ledger   — claims as proofs, linked + timestamped (Module 4 · package)

## 8. HONEST GATE (Module 4 · gate) — the whole packet is AND-ed, no averaging:
gate:
  diagnostic_honest:        PASS | REPAIR
  decision_defensible:      PASS | REPAIR
  failure_predicted_early:  PASS | REPAIR
  proof_concrete:           PASS | REPAIR
  objection_answered:       PASS | REPAIR
  transfer_real:            PASS | REPAIR
  every_claim_names_proof:  PASS | REPAIR
# Gate OPENS only when every line is PASS. One REPAIR closes it — fix, re-check.

git add mastery_packet.md ${DECISION_MEMO} evidence_ledger.md
git commit -m "capstone: Course 00 mastery packet, gated honestly"`

const capstoneRehearsalBlocks: LessonBlock[] = [
  {
    type: 'sprint-contract',
    outcome:
      'Rehearse the whole course as one gate. Assemble a mastery packet that proves every capability Course 00 built — decide under ambiguity, package evidence, gate honestly, transfer judgment — and defend it the way you would in a real review. Pass it for real and you have earned what comes next.',
    intensity: 'capstone',
    time: '25–35 min',
    proof:
      'A mastery packet — diagnostic + decision memo + failure autopsy + proof + reviewer objection answered + transfer case + evidence ledger + honest unlock gate — in one inspectable bundle that a reviewer who has never met you could read and agree: this person owns engineering judgment.',
    unlock:
      'Your packet clears your own honest gate across ALL of it: every claim names a proof, every memo survives an objection, every gap is repaired or honestly red. You can defend the whole thing out loud without a single hedge.',
    doNotClaim:
      'Do not claim you "passed the capstone" because you assembled the documents. Assembly is not defense. You pass when the packet clears an HONEST gate — your own, run with no soft caps — and you can answer the hardest reviewer objection to your face. A packet you would not stake your reputation on has not passed.',
  },
  {
    type: 'mission',
    text: 'This is the gate to everything that follows — Course 00 is the foundation the entire Sage curriculum stands on, and a foundation nobody checks is just a hope. So we check it now, with you running the gate on your own complete body of work: your packet open on the table, a senior asking "show me the exact evidence this is not just a happy-path answer."',
  },
  {
    type: 'context',
    text: 'A capstone is not a new lesson — it is the course proving it was one coherent thing all along. Module 1 taught you to recognize a real decision; Module 2 to make and defend it; Module 3 to break, prove, and repair it; Module 4 to transfer, package, and gate it. This lesson roll-calls all of it into one packet and one gate.',
  },
  {
    type: 'pretest',
    prompt:
      'A learner assembles every required document into a tidy mastery packet — all sections filled, formatting clean. They have not yet answered a single reviewer objection out loud. Have they passed the capstone?',
    reveal:
      'Not yet — assembly is not defense. A complete-looking packet proves only that the documents exist, not that the judgment behind them holds. The capstone passes when the packet clears an HONEST gate (your own, no soft caps) AND you can field the hardest objection — "show me the exact evidence this is not happy-path" — without hedging. The gap between "I have all the documents" and "I can defend all the documents to a skeptic" is the entire capstone. The gate is on the defense, not the assembly.',
  },
  {
    type: 'concept',
    title: 'The mastery packet: one bundle that proves the whole course, gated honestly',
    text: 'Not seven documents — one defensible argument. Diagnostic, decision memo, failure autopsy, proof, reviewer objection answered, transfer case, evidence ledger — bound by one honest gate run across all of it: "I own engineering judgment, and here is the inspectable proof, gated the way a reviewer would."',
  },
  {
    type: 'diagram',
    title: 'The roll-call — every module contributes one provable piece',
    subtitle:
      'Each module of Course 00 feeds one inspectable piece into a single packet, bound by one honest gate. Read end to end, it is not seven documents — it is one argument a skeptic can verify clause by clause.',
    rankdir: 'LR',
    nodes: [
      { id: 'm1', label: 'Module 1', description: 'recognize the decision → DIAGNOSTIC', kind: 'process', tone: 'accent' },
      { id: 'm2', label: 'Module 2', description: 'make + defend → DECISION MEMO + OBJECTION ANSWERED', kind: 'process', tone: 'accent' },
      { id: 'm3', label: 'Module 3', description: 'break · prove · repair → AUTOPSY + PROOF', kind: 'process', tone: 'accent' },
      { id: 'm4', label: 'Module 4', description: 'transfer · package → TRANSFER CASE + LEDGER', kind: 'process', tone: 'accent' },
      { id: 'packet', label: 'Mastery packet', description: 'one inspectable bundle', kind: 'store', tone: 'success' },
      { id: 'gate', label: 'Honest gate', description: 'AND-ed · no soft caps', kind: 'decision', tone: 'warning' },
      { id: 'open', label: 'Curriculum opens', description: 'gate passed for real', kind: 'store', tone: 'success' },
    ],
    edges: [
      { from: 'm1', to: 'packet', label: 'diagnostic', kind: 'data', tone: 'accent' },
      { from: 'm2', to: 'packet', label: 'memo + objection', kind: 'data', tone: 'accent' },
      { from: 'm3', to: 'packet', label: 'autopsy + proof', kind: 'data', tone: 'accent' },
      { from: 'm4', to: 'packet', label: 'transfer + ledger', kind: 'data', tone: 'accent' },
      { from: 'packet', to: 'gate', label: 'run the conjunction', kind: 'control', tone: 'warning' },
      { from: 'gate', to: 'open', label: 'every clause PASS', kind: 'control', tone: 'success' },
    ],
    legend: [
      { tone: 'accent', label: 'one provable piece per module' },
      { tone: 'warning', label: 'one honest gate over all of it' },
      { tone: 'success', label: 'the packet, and the gate it opens' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'The mastery packet, assembled and gated',
    subtitle: 'Pull every real artifact into one bundle, then run the conjunction over all of it.',
    filename: 'mastery_packet.md',
    language: 'bash',
    code: MASTERY_PACKET_FILLED,
    steps: [
      { lines: [4, 5, 6, 7], label: 'Modules 1–3 contribute their proof', note: 'Diagnostic, decision memo, failure autopsy, proof — the recognize / decide / break-prove-repair arc, each a real artifact you produced, not a fresh stand-in.' },
      { lines: [8, 9, 10], label: 'Modules 2 & 4: objection, transfer, ledger', note: 'The reviewer objection answered (Module 2), then Module 4\'s cold-domain transfer and the evidence ledger that links every claim to an inspectable artifact.' },
      { lines: [12, 13, 14, 15, 16, 17, 18, 19, 20], label: 'The honest gate, AND-ed', note: 'Seven required lines. every_claim_names_proof is the through-line of the whole course — a claim that names a topic instead of a proof is an automatic REPAIR.' },
      { lines: [21], label: 'One REPAIR closes it', note: 'The capstone IS the gate: it opens only when every line is PASS by inspectable evidence. No averaging, no "most are green."' },
      { lines: [23, 24], label: 'Commit the whole packet', note: 'git timestamps the bundle — this commit is the artifact you will reuse in every future review.' },
    ],
    caption: 'Read end to end, the packet says "this person can decide, prove, defend, repair, transfer, and gate" — and a skeptic can verify every clause.',
  },
  {
    type: 'compare',
    title: 'Present clean vs present honest-and-repaired',
    subtitle: 'You find one claim you cannot fully defend against the hardest objection. The final test of the whole course.',
    left: {
      label: 'Present clean (assembly)',
      tone: 'warning',
      lines: [
        'Smooth over the weak claim, present a full pass',
        'Inflate the diagnostic: "started already strong"',
        'Hope the objection does not come up',
        'Gate averaged: "most are PASS, packet is strong"',
        'Collapses the instant a reviewer probes the weak claim',
      ],
      verdict: 'Looks stronger — fails on contact',
    },
    right: {
      label: 'Present honest + repaired (defense)',
      tone: 'success',
      lines: [
        'Mark the weak claim honestly, show the repair you ran',
        'Honest diagnostic: name where you were weak',
        'Defend every other clause cleanly, out loud',
        'Gate as conjunction: one red closes it, then fix',
        'Rehearsed the objection in an empty room first',
      ],
      verdict: 'Less perfect, far more credible — and it passes',
    },
    caption: 'A reviewer trusts the engineer who flags their own weak claim and shows the repair infinitely more than the one with a suspiciously clean packet. Honest red over dishonest green — the whole course in one choice.',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'The thing that separates passing this gate from gaming it: rehearse the DEFENSE out loud, not just the documents. Read your packet to an empty room and answer "show me the exact evidence this is not happy-path" for every single claim, spoken, no notes. The claims you stumble on are exactly the ones a reviewer will find — your hesitation is the tell, and they are trained to hear it. The capstone is won in the rehearsal, where stumbling is free, not in the review, where it is expensive.',
  },
  {
    type: 'quiz',
    question:
      'You are about to present your mastery packet. Which single condition means you have actually passed the capstone gate?',
    options: [
      'Every section of the packet is filled in and formatted cleanly.',
      'A majority of the gate criteria are PASS.',
      'Every gate criterion is PASS by inspectable evidence, and you can defend each claim out loud against the hardest objection.',
      'The packet is longer and more detailed than the example.',
    ],
    answer: 2,
    explanation:
      'The capstone is one honest gate over the whole course — a conjunction. It passes only when every required criterion is met by inspectable evidence AND you can defend each claim out loud. Completeness, majority, and length are not the gate; defendable evidence on every clause is.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes. This is the gate to the curriculum; confirm each against your real packet:',
    items: [
      'The packet pulls in REAL artifacts you produced across the course, not freshly invented stand-ins.',
      'The diagnostic is honest about where you started — including where you were weak.',
      'The decision memo survives the hardest reviewer objection, answered out loud without hedging.',
      'The failure you packaged was predicted in advance, and git can show the order.',
      'The transfer case is a genuine new domain — its failure case would be false in your original memo.',
      'You ran the honest gate as a conjunction: every line PASS by inspectable evidence, or honestly REPAIR-and-rechecked — never averaged.',
      'You rehearsed the defense aloud and can stake your reputation on every clause.',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'Roll-call the course: name what each module contributed to your packet, by module.',
      'Explain why assembly is not the same as passing the capstone gate.',
      'Pick your weakest claim and defend it out loud as if a senior just challenged it — or honestly mark it red and name the repair.',
      'Why is an honestly-flagged-and-repaired claim more credible to a reviewer than a suspiciously clean pass?',
    ],
  },
  {
    type: 'transfer',
    text: 'Stop and own this: you did not finish a course, you cleared a gate — the one the rest of the Sage curriculum is built on. Recognize a real decision, make it under incomplete evidence, break it, prove it, repair it, transfer it to a domain nobody walked you through, package it as inspectable proof, and gate it honestly with no soft caps. That is engineering judgment, and you can now defend that you own it, clause by clause, to anyone who asks. Everything ahead — the systems, the languages, the architectures — assumes this foundation, and it should, because you just proved it holds. Keep the evidence_ledger.md you started; add to it for the rest of your career. The mastery packet you built today is the template for every review, promotion, and design defense you will ever walk into. The gate is open. Go build on it.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '30 days'] },
]

// ================================================================= apply
type LessonRow = {
  slug: string
  title: string
  eyebrow: string
  sort: number
  est_minutes: number
  intensity: 'micro' | 'standard' | 'deep' | 'capstone'
  blocks: LessonBlock[]
}

const LESSONS: LessonRow[] = [
  {
    slug: '13-transfer-challenge',
    title: 'Transfer Challenge',
    eyebrow: `${MODULE_TITLE} · Lesson 1 · 25 min`,
    sort: 0,
    est_minutes: 25,
    intensity: 'deep',
    blocks: transferChallengeBlocks,
  },
  {
    slug: '14-package-evidence',
    title: 'Package Evidence',
    eyebrow: `${MODULE_TITLE} · Lesson 2 · 25 min`,
    sort: 1,
    est_minutes: 25,
    intensity: 'deep',
    blocks: packageEvidenceBlocks,
  },
  {
    slug: '15-unlock-gate',
    title: 'Unlock Gate',
    eyebrow: `${MODULE_TITLE} · Lesson 3 · 25 min`,
    sort: 2,
    est_minutes: 25,
    intensity: 'deep',
    blocks: unlockGateBlocks,
  },
  {
    slug: '16-capstone-rehearsal',
    title: 'Capstone Rehearsal',
    eyebrow: `${MODULE_TITLE} · Lesson 4 · 30 min`,
    sort: 3,
    est_minutes: 30,
    intensity: 'capstone',
    blocks: capstoneRehearsalBlocks,
  },
]

async function main(): Promise<void> {
  if (!shouldApply) {
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          applyCommand: 'tsx --env-file=.env.local scripts/academy/course00/seed-module-4.ts --apply',
          course: COURSE_SLUG,
          module: MODULE_TITLE,
          moduleSort: MODULE_SORT,
          note: 'UPDATE-only: re-blocks + relabels the 4 existing skeleton lessons; never changes a slug, never inserts rows.',
          lessons: LESSONS.map((l) => ({
            slug: l.slug,
            title: l.title,
            sort: l.sort,
            intensity: l.intensity,
            estMinutes: l.est_minutes,
            blocks: l.blocks.length,
            blockSequence: l.blocks.map((b) => b.type),
          })),
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

  // 1. UPDATE the four existing skeleton lessons in place. We never INSERT here:
  //    a missing slug means the ingest has not run, and we want that to be loud,
  //    not silently papered over with a new row. Slugs are never changed.
  for (const l of LESSONS) {
    const { data: updated, error } = await sb
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
      .select('slug')
    if (error) throw error
    if (!updated || updated.length === 0) {
      console.error(
        `Lesson "${l.slug}" not found under course "${COURSE_SLUG}". Run ingest-career-os.ts --apply first.`,
      )
      process.exit(1)
    }
  }

  // 2. Maintain the denormalized lesson counter from what is actually published.
  const { count } = await sb
    .from('academy_lessons')
    .select('id', { count: 'exact', head: true })
    .eq('course_slug', COURSE_SLUG)
    .eq('status', 'published')
  await sb.from('academy_courses').update({ lessons: count ?? 0 }).eq('slug', COURSE_SLUG)

  console.log(
    `Updated "${MODULE_TITLE}" (${LESSONS.length} lessons) under "${COURSE_SLUG}". Course now has ${count ?? 0} published lesson(s).`,
  )
}

main().catch((err) => {
  console.error('seed failed:', err)
  process.exit(1)
})
