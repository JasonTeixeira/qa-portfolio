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
 * JUDGMENT ADAPTATION (no Pyodide / no executable code labs in this course):
 * the "guaranteed win" is a REVIEWABLE ARTIFACT, not a passing test. Every
 * lesson drives the learner to produce and harden one named markdown artifact
 * (`engineering_judgment_decision_memo.md` and, in the capstone, a mastery
 * packet) via `sprint-contract` (the contract) + `calibration` (the rubric) +
 * `verification` (prove-it-no-vibes). `tradeoff` carries the option comparison;
 * `debug` is a flawed-REASONING autopsy (broken decision memo, not broken code);
 * `worked-example` shows the weak version next to the strong version with the
 * common mistake named. `code` is used ONLY for genuine command / artifact text
 * (the decision-memo skeleton, a git-tracked evidence ledger), never to pretend
 * this is a coding course.
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

const shouldApply = process.argv.includes('--apply')

const COURSE_SLUG = 'career-engineering_judgment_foundation'
const MODULE_TITLE = 'Module 4 · Transfer & Gate'
const MODULE_SORT = 3

// The one artifact every lesson in this module reads, hardens, and reuses.
const DECISION_MEMO = 'engineering_judgment_decision_memo.md'

// The reviewable decision-memo skeleton — the artifact contract, shown as a
// genuine command-line / file artifact (the only legitimate use of `code` here).
const DECISION_MEMO_SKELETON = `# Decision Memo — <one-line decision>
# engineering_judgment_decision_memo.md

## Context
What is true right now, and what is still unknown.

## Assumptions
The beliefs this decision rests on. Mark each: verified | unverified | guess.

## Options considered
- A — <option>: cost, reversibility, blast radius if wrong.
- B — <option>: cost, reversibility, blast radius if wrong.

## Decision
The option chosen, in one sentence.

## Rejected approach
What you did NOT do, and the specific reason.

## Expected failure
The most realistic way this is wrong, and what it would look like in production.

## Verification method
The strongest check available: test, contract/schema, telemetry, or — when none
exist — the reviewer rubric the memo must survive.

## Reviewer objection + answer
The hardest question a senior will ask, written down with your answer.

## Repair notes
The weakest part of this memo and how you would strengthen it on the next pass.

## Reversal condition
The single signal that would make you undo this decision.

## Capstone connection
Which course capability this memo proves, named — not the topic, the proof.`

// The evidence ledger — a real, inspectable git-tracked file (genuine artifact).
const EVIDENCE_LEDGER_COMMAND = `# Append this decision to the course evidence ledger and commit it,
# so the proof is timestamped and reviewable — not a claim in your head.

cat >> evidence_ledger.md <<'ENTRY'

## ${DECISION_MEMO} — <date>
- claim:     "I can decide under incomplete evidence and defend it."
- proof:     decision memo + failure autopsy + reviewer answer
- artifact:  ./${DECISION_MEMO}
- status:    passed | repair-needed
ENTRY

git add evidence_ledger.md ${DECISION_MEMO}
git commit -m "evidence: decision memo for <decision>, with failure autopsy"`

// =========================================================== LESSON 13
// Transfer Challenge — can the learner carry the judgment pattern into a domain
// it was never taught in, and name what stays invariant vs. what changes.
const transferChallengeBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Take the engineering-judgment pattern you have been building all course — decide, show the artifact, name the failure, prove it, defend it under objection — and apply it cold to a domain you were never taught. Produce a decision memo that survives a reviewer who has never seen your original work.',
    intensity: 'deep',
    time: '20–30 min',
    proof:
      `A new ${DECISION_MEMO} for an unfamiliar decision, with an explicit "what stays invariant / what changes" section that names the new domain's user, scale, risk, cost, latency, and privacy pressures.`,
    unlock:
      'Your memo reads as judgment applied to a NEW problem — not your old answer with the nouns swapped. The invariant section and the changed-constraints section are both specific and both true.',
    doNotClaim:
      'Do not claim "transfer" because you reused the template. Transfer means the JUDGMENT survived the domain change — if your failure case, your reviewer objection, and your reversal condition did not change with the domain, you transferred a form, not a skill.',
  },
  {
    type: 'mission',
    text: 'A staff engineer drops a problem on your desk from a system you have never touched — a payments queue, a rate limiter, a data-retention policy. No onboarding, no runbook, decision needed today. The junior freezes because the nouns are unfamiliar. You do not, because the SHAPE is familiar: incomplete evidence, disagreeing stakeholders, a reversible-or-not call. That moment — recognizing the shape under an unfamiliar surface — is the entire point of this course. This lesson is where you prove it on a problem nobody walked you through.',
  },
  {
    type: 'context',
    text: 'Everything before this taught you to make one good decision in a domain you were shown. That is necessary and not sufficient. The market does not pay for "can do the exact thing they were trained on" — it pays for judgment that travels. This lesson is the bridge between "I learned a method" and "I own a method," and it sets up the next three: you will transfer the judgment here, package the evidence next, gate it after, and rehearse the whole thing in the capstone. Transfer first, because evidence you cannot reuse in a new domain is not evidence of judgment — it is evidence of memory.',
  },
  {
    type: 'pretest',
    prompt:
      'A learner aces a decision memo about whether to ship a feature flag. Asked to write one about whether to delete six months of user analytics, they produce the same memo with "feature flag" swapped for "data deletion." Did they transfer the skill?',
    reveal:
      'No — they transferred the template, not the judgment. The two decisions have different invariants. The feature-flag call is cheaply reversible; the deletion is not — once the data is gone, no reversal condition can bring it back, which should dominate the entire memo. A real transfer changes the FAILURE case (irreversible loss, not a bad rollout), the reviewer objection (legal/retention, not user impact), and the reversal condition (there may not be one). If those three did not move, no transfer happened. That is the "oh" — transfer is measured by what changed, not by what was reused.',
  },
  {
    type: 'concept',
    title: 'Transfer = invariant skeleton + domain-specific load',
    text: 'A transferable skill has two layers. The INVARIANT skeleton is what is true in every domain: name the decision, surface assumptions and mark each verified/unverified/guess, compare options by cost and reversibility, name the most realistic failure, pick the strongest available proof, write down the reversal condition. That skeleton never changes. The LOAD is what the new domain forces onto the skeleton: who the user is, the scale, the risk if wrong, the cost, the latency budget, the privacy/legal weight, the team constraints. Transfer is correctly carrying the skeleton AND re-deriving the load from scratch. Carry only the skeleton and you get a hollow memo; re-derive only the load with no skeleton and you get a panicked guess. You need both, and you must be able to point at each.',
  },
  {
    type: 'worked-example',
    intro:
      `Same skeleton, a genuinely new domain. The decision: a team wants to add a 200ms server-side cache to an auth endpoint to cut load. Watch the weak transfer fail and the strong transfer hold.`,
    steps: [
      'WEAK transfer: "Decision: add the cache. Rejected: not adding it. Failure: it might be slow. Proof: it works in staging. Reversal: turn it off." — this is the ship-a-feature memo with auth words pasted in. Nothing in it is specific to caching an AUTH path.',
      'Re-derive the load. User: every logged-in request depends on this path. Risk if wrong: a stale cache serves a revoked session as still-valid — a SECURITY failure, not a latency one. Cost: cheap to add, expensive to reason about. Privacy: you are now holding auth state in a second place.',
      'STRONG decision: add the cache ONLY for negative results (failed lookups) with a 5s TTL; never cache a valid session token. Rejected: caching successful auth — rejected because a stale "valid" is a security hole, and that risk dominates the latency win.',
      'STRONG failure case: a user is banned, their session is revoked, but a cached "valid" keeps them in for the TTL window. That is the realistic production failure — and it is invisible in staging, where nobody gets revoked.',
      'STRONG proof + reversal: contract test asserting revoked sessions are never served from cache; reversal condition = any auth-bypass report flips the cache off immediately, no meeting required.',
    ],
    commonMistake:
      'The common mistake is "noun-swap transfer": keeping your original failure case, objection, and reversal condition and only changing the subject. The tell is that your failure case could be true of almost any decision ("it might be slow," "users might not like it"). A transferred failure case is sharp and domain-specific — here, "a revoked session stays valid for the TTL." If your failure case would survive a find-and-replace into a different memo, you have not transferred.',
  },
  {
    type: 'code',
    filename: DECISION_MEMO,
    language: 'bash',
    code: DECISION_MEMO_SKELETON,
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'The thing seniors know that juniors miss: the fastest way to a defensible decision in an unfamiliar domain is to attack the reversibility first, before anything else. Ask "if I am wrong, how expensive is undo?" A cheaply-reversible decision can be made fast and loose — ship it, watch it, revert if needed. An irreversible one (deleting data, leaking a secret, a public commitment) deserves ten times the rigor no matter how small it looks. Juniors weight decisions by how hard they FEEL; seniors weight them by how hard they are to UNDO. Re-derive reversibility in every new domain and most of the memo writes itself.',
  },
  {
    type: 'lab',
    title: `Transfer the pattern: write a cold-domain decision memo`,
    summary:
      `Pick a decision from a domain you have NOT worked in this course (suggestions: enable a third-party tracking SDK; raise an API rate limit; auto-delete inactive accounts after 90 days). Write ${DECISION_MEMO} for it using the skeleton above. The memo MUST end with two explicit sections: "Invariant — what I carried from every prior decision" and "Domain load — what changed because of this domain's user, scale, risk, cost, latency, and privacy." A reviewer with no context should be able to read it and agree the judgment, not just the format, transferred.`,
  },
  {
    type: 'debug',
    symptom:
      'A memo that LOOKS transferred but is a noun-swap. The reasoning is broken even though the format is perfect. Find the flaw.',
    language: 'bash',
    brokenCode: `# Decision Memo — auto-delete inactive accounts after 90 days
## Decision: auto-delete inactive accounts after 90 days.
## Rejected: keeping them forever (wastes storage).
## Expected failure: the deletion job might be slow.
## Verification: it works in staging.
## Reversal condition: turn the job off.`,
    task:
      'This memo treats an IRREVERSIBLE decision as if it were a reversible one. Name the broken reasoning and rewrite the failure, verification, and reversal lines so they fit the actual domain.',
    fix:
      'The flaw: "turn the job off" is not a reversal condition for deletion — once accounts are deleted, turning the job off recovers nothing. The whole memo inherited a reversible-decision skeleton without re-deriving the load. Repaired: Expected failure = "an account that is dormant but not abandoned (a paying annual user) gets deleted; the user returns to find their data gone." Verification = "dry-run mode that lists what WOULD be deleted, reviewed before any real run, plus a 30-day soft-delete window." Reversal condition = "there is none after hard-delete — which is exactly why the soft-delete window and the dry-run review are mandatory, not optional." The fix is not better wording; it is re-deriving reversibility for the new domain.',
  },
  {
    type: 'quiz',
    question:
      'You have written a decision memo in a brand-new domain. Which single fact most reliably tells you the JUDGMENT transferred, not just the template?',
    options: [
      'You used every heading from the skeleton.',
      'Your failure case and reversal condition are specific to this domain and would NOT be true of your previous memo.',
      'The memo is longer than your last one.',
      'A reviewer agreed the formatting was clean.',
    ],
    answer: 1,
    explanation:
      'Transfer is measured by what changed under the new load. If the failure case and reversal condition are domain-specific — true here and false in your previous memo — the judgment moved with you. Headings, length, and clean formatting can all be present in a hollow noun-swap.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes. You can confirm each of these against your cold-domain memo:',
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
    text: 'You just made the move the whole market actually pays for: you carried judgment into a problem nobody handed you a runbook for. Now widen it. The next time you join a new team, inherit a legacy system, or get pulled into an incident in code you have never read, run the same two-layer move — carry the invariant skeleton, re-derive the load. The domains will keep changing for the rest of your career; the skeleton will not. That is what separates an engineer who is useful only where they were trained from one who is useful anywhere. Next lesson, you stop producing decisions and start packaging them — turning today\'s memo into evidence a reviewer can trust without taking your word for it.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '30 days'] },
]

// =========================================================== LESSON 14
// Package Evidence — turn a decision into something a reviewer can trust without
// taking your word for it: a ledgered, inspectable, claim-named evidence trail.
const packageEvidenceBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Turn the decision you made last lesson into packaged EVIDENCE — a ledgered, inspectable trail that lets a reviewer who was not in the room verify your judgment without taking your word for it. The portfolio claim must name the proof, not the topic.',
    intensity: 'deep',
    time: '20–30 min',
    proof:
      `An evidence ledger entry that links ${DECISION_MEMO} to a named claim, a concrete proof method, and a status — committed to git so it is timestamped and inspectable, not asserted from memory.`,
    unlock:
      'A reviewer can open your ledger, follow the link to the artifact, find the failure autopsy and the proof method, and agree the claim is earned — all without asking you a single question.',
    doNotClaim:
      'Do not claim "evidence" for a confident summary of what you did. Evidence is something a skeptic can independently inspect. If the only place your proof exists is your own description of it, you have a claim, not evidence.',
  },
  {
    type: 'mission',
    text: 'Promotion committee, Friday afternoon. Two engineers both say "I have strong judgment under ambiguity." One opens a ledger: here is the decision, here is the artifact, here is the failure I predicted, here is the reviewer who pushed back and how I answered. The other says "trust me, I make good calls." Same words, one of them gets the level. The difference is not who is better — it is who packaged the evidence. Last lesson you made a defensible decision. This lesson you make it PROVABLE to someone who was not there.',
  },
  {
    type: 'context',
    text: 'A decision that lives only in your head is invisible to the people who decide your career, fund your project, or inherit your system. Packaging evidence is the act of making judgment legible — converting "I am good at this" into "here is the proof, inspect it yourself." This is the hinge of the whole course: the transfer lesson proved you can decide anywhere, this lesson proves you can show it, and the next lesson uses this packaged evidence as the literal key that unlocks the gate. No package, no gate — because the gate is a check on evidence, not on confidence.',
  },
  {
    type: 'pretest',
    prompt:
      'An engineer writes a beautiful decision memo and saves it to their personal notes. Is that evidence a reviewer can trust?',
    reveal:
      'Not yet. A memo in private notes proves nothing to a skeptic — it is unledgered, untimestamped, and unlinked to a claim, so a reviewer cannot tell whether it was written before the outcome (judgment) or after (a story). Evidence becomes trustworthy the moment it is (1) committed somewhere timestamped, (2) linked to a specific claim, and (3) accompanied by the failure you predicted IN ADVANCE. The memo is the artifact; the package is what makes the artifact believable. That is the "oh" — quality of the memo is necessary but the PACKAGING is what a reviewer actually checks.',
  },
  {
    type: 'concept',
    title: 'Evidence = claim + artifact + proof + predicted failure, made inspectable',
    text: 'A package of evidence has four parts and one property. The CLAIM names what you assert you can do, in the form of a proof not a topic ("I can decide under incomplete evidence and defend the failure case," not "I know about decision memos"). The ARTIFACT is the inspectable thing — the memo file. The PROOF is the strongest available check: a test, a contract/schema, telemetry, or a reviewer rubric the artifact survived. The PREDICTED FAILURE is the autopsy you wrote before the outcome was known, which is what distinguishes judgment from a post-hoc story. The property that ties it together: it is INDEPENDENTLY INSPECTABLE — committed, timestamped, linked — so a skeptic verifies it without you in the room. Drop any of the four and the package weakens; drop inspectability and it is not evidence at all.',
  },
  {
    type: 'worked-example',
    intro:
      'A portfolio claim, weak then strong. The claim is the headline a reviewer reads first — it decides whether they trust the rest.',
    steps: [
      'WEAK claim: "Skilled at engineering judgment and decision-making." — names a topic, proves nothing, inspectable nowhere. A reviewer cannot disagree with it OR verify it, so it carries zero weight.',
      'Better: "Wrote a decision memo for an auth-cache change." — names an artifact but still no proof and no failure; it could be a happy-path write-up.',
      'STRONG claim: "Decided under incomplete evidence on an auth-cache change; predicted the stale-revoked-session failure in advance, proved the guard with a contract test, and defended the call against a security reviewer — see evidence_ledger.md#auth-cache."',
      'Why the strong claim wins: it names the PROOF (predicted failure + contract test + survived reviewer), not the topic, and it ends in an inspectable link. A skeptic can open it and check. That is the difference between a claim that earns a promotion and a claim that gets a polite nod.',
    ],
    commonMistake:
      'The common mistake is claiming the TOPIC instead of the PROOF: "experienced in decision-making under ambiguity." Topics are unfalsifiable and therefore worthless as evidence — anyone can claim them. Always name the specific thing a reviewer can inspect and the specific failure you called in advance. If your claim cannot be disproven by opening a file, it cannot be proven by it either.',
  },
  {
    type: 'code',
    filename: 'evidence_ledger.md',
    language: 'bash',
    code: EVIDENCE_LEDGER_COMMAND,
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'The pro move beginners miss: timestamp the predicted failure BEFORE the outcome, and let git prove the order. Anyone can write "I knew that would happen" after a system breaks — that is a story, not evidence. A failure autopsy committed before the outcome is known is the single most credible artifact you can own, because the commit history makes it impossible to fake. Reviewers have seen a thousand post-hoc rationalizations; a timestamped pre-mortem stops the conversation. Commit your predicted failure early, on purpose.',
  },
  {
    type: 'lab',
    title: 'Package your decision as inspectable evidence',
    summary:
      `Take the ${DECISION_MEMO} from last lesson and package it. Append an entry to evidence_ledger.md (use the command artifact above) that contains: a CLAIM phrased as a proof not a topic; a link to the memo artifact; the PROOF method (test, contract, telemetry, or the reviewer rubric it survived); and the PREDICTED FAILURE you wrote in advance. Then write the one-line portfolio claim a reviewer would read first. The win: a reviewer could verify your judgment from the ledger alone, without asking you anything.`,
  },
  {
    type: 'debug',
    symptom:
      'A portfolio bullet that sounds impressive but is not evidence. The reasoning behind it is broken. Find the flaw.',
    language: 'bash',
    brokenCode: `# Portfolio bullet
"Recognized as a strong decision-maker with excellent judgment under pressure,
 consistently making high-impact calls that drove successful outcomes."`,
    task:
      'This bullet is confident and entirely unverifiable. Name what makes it non-evidence and rewrite it as a claim a skeptic could inspect.',
    fix:
      'The flaw: every phrase is a topic or a self-assessment — "strong," "excellent," "high-impact," "successful" — none of which a reviewer can open, check, or disprove. It is a feeling wearing a resume. Repaired: "Made a reversible-vs-irreversible call on a 90-day account-deletion policy; predicted the dormant-paying-user failure in advance, gated it behind a dry-run + soft-delete window, and defended the design against a privacy reviewer — evidence_ledger.md#account-deletion." Now the claim names the proof and ends in something inspectable. The fix is not stronger adjectives; it is replacing self-assessment with inspectable proof.',
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
      'The PREDICTED FAILURE was written before the outcome — and git history can show it.',
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
    text: 'You now know how to make judgment legible — and that skill outlives this course. Every promotion packet, every design review, every postmortem, every funding pitch is the same move: name the claim as a proof, link the inspectable artifact, show the failure you called in advance. Engineers who package evidence get believed; engineers who summarize get second-guessed. Start a real evidence_ledger.md in your actual work and add to it every time you make a non-trivial call — in a year it is the most persuasive document you own. Next lesson, this package stops being a nice-to-have and becomes the literal key: the unlock gate checks the evidence, and only evidence opens it.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '30 days'] },
]

// =========================================================== LESSON 15
// Unlock Gate — an honest gate that opens ONLY on evidence, with no soft caps,
// and routes every gap to a specific repair instead of waving it through.
const unlockGateBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Run an honest unlock gate on your own work: a gate that opens ONLY when the evidence exists, refuses to round a gap up to a pass, and routes every miss to a specific repair before re-checking. You will gate yourself the way a reviewer would — and pass or repair honestly.',
    intensity: 'deep',
    time: '20–30 min',
    proof:
      'A completed gate checklist against your packaged evidence, with each criterion marked pass or repair, every repair routed to a named action, and a re-check after repair — applied to YOUR artifact, not a hypothetical.',
    unlock:
      'Every gate criterion is genuinely met by inspectable evidence, OR is honestly marked "repair needed" with the specific fix named. No criterion is waved through on confidence.',
    doNotClaim:
      'Do not claim the gate "passed" because most criteria were green. A gate is not an average — one missing piece of required evidence means the gate is closed. Honest red is worth more than dishonest green, and a gate you game is a gate that protects nothing.',
  },
  {
    type: 'mission',
    text: 'Every real system has a gate: the merge that needs a green CI run, the release that needs sign-off, the deploy that needs the checklist. The gate exists because "I am pretty sure it is fine" has shipped more outages than any bug. The engineers people trust with production are the ones who gate themselves HARDER than the reviewer would — who catch their own missing evidence before anyone else has to. This lesson hands you that gate and makes you run it on your own work, where it is hardest to be honest.',
  },
  {
    type: 'context',
    text: 'This is where the course tightens into a standard. The transfer lesson proved you can decide anywhere; the package lesson made that decision inspectable; now the gate decides whether the evidence is actually sufficient — and it does so without mercy and without inflation. An honest gate is the thing that makes the whole evidence system mean something: if the gate opens on confidence, the package was theater. The gate also sets up the capstone, which is one big gate over the entire course. Learn to gate one lesson honestly here, and you can gate the whole course there.',
  },
  {
    type: 'pretest',
    prompt:
      'A learner reviews their own evidence and thinks: "I hit retrieval, the artifact, the explanation, and the transfer — four out of five. The proof is a bit thin but the rest is strong, so I will call it a pass." Is that an honest gate?',
    reveal:
      'No — that is averaging, and a gate does not average. Proof is a REQUIRED criterion, not a weighted one; "a bit thin" on proof means the gate is closed until the proof is real, no matter how strong the other four are. The instinct to round up — "mostly there, so basically passed" — is exactly the instinct an honest gate exists to stop, because it is the same instinct that ships a release with a skipped test. The "oh": a gate is a conjunction (all required AND-ed), never a sum. One honest red closes it.',
  },
  {
    type: 'concept',
    title: 'An honest gate is a conjunction with no soft caps, and every red has a repair route',
    text: 'A gate is a list of REQUIRED criteria, all of which must be met by inspectable evidence — it is an AND, not an average. It has two non-negotiable properties. First, no soft caps: you do not let "almost" count as "done," and you do not inflate a score because the work felt good or took effort; honest red is the correct output when evidence is missing. Second, every red routes to a specific repair, not a vague "do better": a missing invariant routes to concept repair, a thin artifact to build repair, missing proof to verification repair, a vague explanation to oral-defense repair — and then you RE-CHECK after the repair before declaring the gate open. The gate is not there to make you feel finished. It is there to make "finished" mean something a reviewer would agree with.',
  },
  {
    type: 'worked-example',
    intro:
      'Running the gate on a real piece of evidence. Each criterion is checked against something inspectable, and the one gap is handled honestly.',
    steps: [
      'Criterion — retrieval: can you state the invariant without notes? Yes, against your concept block. PASS.',
      'Criterion — artifact: does a named, inspectable memo exist? Yes, ./engineering_judgment_decision_memo.md. PASS.',
      'Criterion — proof: is there a concrete check (test/contract/telemetry/reviewer rubric)? You have a reviewer rubric but never actually ran it past anyone. REPAIR — route to verification repair: get the rubric applied, do not self-grade it green.',
      'Criterion — failure case: is the predicted failure realistic and production-grade? Yes, the stale-revoked-session case. PASS.',
      'Criterion — transfer: did the judgment move to a new domain? Yes, the cold-domain memo. PASS.',
      'Gate result: CLOSED — four passes do not open a gate with one required red. Run the verification repair, re-check the proof criterion, THEN the gate opens. That is the honest result, and it is more valuable than a green you would have to defend later.',
    ],
    commonMistake:
      'The common mistake is the "effort discount": "I worked really hard on this, so the thin proof should still count." Gates are blind to effort — they check evidence, full stop. The moment you let effort, deadline pressure, or sunk cost buy a criterion a pass, the gate stops protecting anything and becomes a rubber stamp. The discipline is to let the red stand and fix the actual gap.',
  },
  {
    type: 'tradeoff',
    question:
      'Your proof criterion is genuinely thin and the deadline is now. Do you open the gate anyway, or hold it closed and repair first?',
    optionA: {
      label: 'Open it — ship, repair later',
      text: 'Mark the gate passed despite thin proof so you hit the deadline, with a note to strengthen the proof afterward. Fast now; relies on "later" actually happening and on nothing depending on the proof in the meantime.',
    },
    optionB: {
      label: 'Hold it closed — repair, then open',
      text: 'Leave the gate honestly red, route the thin proof to verification repair, and only open it once the proof is real. Slower now; the gate keeps its meaning and you never ship a claim you cannot defend.',
    },
    guidance:
      'Reach for B by default — a gate that opens under deadline pressure is not a gate, and "repair later" is where evidence goes to die. The narrow case for A is a genuinely reversible, low-blast-radius decision where the cost of waiting exceeds the cost of being wrong AND the red is written down loudly so it cannot be quietly forgotten. The senior tell is which one is your DEFAULT: juniors default to opening under pressure; seniors default to holding the line and make opening-under-pressure a rare, documented exception. If you cannot name the reversal condition for shipping with thin proof, you do not get to ship with thin proof.',
  },
  {
    type: 'callout',
    tone: 'note',
    text: 'What pros internalize: the gate is most valuable exactly when it is most inconvenient. A gate that only ever passes is decoration — it has never once stopped anything, so it proves nothing. The first time your own gate forces you to hold a release you wanted to ship, that is the gate doing its entire job. Treasure the inconvenient red; it is the only evidence your gate is real.',
  },
  {
    type: 'lab',
    title: 'Gate your own evidence honestly',
    summary:
      'Run this gate against the evidence you packaged last lesson. For EACH criterion — retrieval, artifact, proof, predicted failure, reviewer objection answered, transfer — mark PASS (and name the inspectable thing that proves it) or REPAIR (and name the specific repair route: concept / build / verification / oral-defense). If any required criterion is red, the gate is CLOSED; run that repair, then re-check. The win: a completed, honest gate where every green is backed by inspectable evidence and every red has a named fix — not an average rounded up to a pass.',
  },
  {
    type: 'debug',
    symptom:
      'A gate decision with broken reasoning — it opened when it should have stayed closed. Find the flaw in the logic.',
    language: 'bash',
    brokenCode: `# Gate result
retrieval:        PASS
artifact:         PASS
proof:            MISSING (no test, no reviewer ran the rubric)
failure case:     PASS
transfer:         PASS
=> 4 / 5 criteria met (80%) => GATE OPEN: PASS`,
    task:
      'The arithmetic is right but the gate logic is wrong. Explain why "80% of criteria" must not open this gate, and state the correct result and next action.',
    fix:
      'The flaw: the gate was treated as a percentage when it is a conjunction. Proof is a REQUIRED criterion; "MISSING" on a required criterion closes the gate regardless of how many others pass — 4/5 with proof missing is not 80% open, it is closed. Correct result: GATE CLOSED. Next action: route the proof gap to verification repair (actually run the reviewer rubric or write the contract check), then RE-CHECK the proof criterion. Only when proof is genuinely PASS does the gate open. The fix is not a higher percentage threshold; it is recognizing that required criteria are AND-ed, not summed.',
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
    text: 'You now own the most underrated senior skill: gating your own work honestly, before anyone makes you. Carry it everywhere — your own pull requests get a self-gate before you request review, your own designs get a gate before the design meeting, your own claims get a gate before they hit a resume. The engineers who get trusted with bigger and bigger blast radius are the ones whose self-gate is stricter than the org\'s gate, so their work clears review the first time. Next is the capstone: one gate over the entire course. Everything you just practiced — honest red, required-criteria conjunction, repair-then-recheck — you will now run across all four modules at once. Bring your evidence.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '30 days'] },
]

// =========================================================== LESSON 16
// Capstone Rehearsal — one gate over the whole course. Roll-call every module,
// assemble the mastery packet, and pass the gate that opens the curriculum.
const capstoneRehearsalBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Rehearse the whole course as one gate. Assemble a mastery packet that proves every capability Course 00 built — decide under ambiguity, package evidence, gate honestly, transfer judgment — and defend it the way you would in a real review. This is the gate to the entire curriculum: pass it for real, and you have earned what comes next.',
    intensity: 'capstone',
    time: '25–35 min',
    proof:
      'A mastery packet — diagnostic + decision memo + failure autopsy + reviewer objection answered + transfer case + evidence ledger + honest unlock gate — assembled into one inspectable bundle that a reviewer who has never met you could read and agree: this person owns engineering judgment.',
    unlock:
      'Your packet clears your own honest gate across ALL of it: every claim names a proof, every memo survives an objection, every gap is repaired or honestly red. You can defend the whole thing out loud without reaching for a single hedge.',
    doNotClaim:
      'Do not claim you "passed the capstone" because you assembled the documents. Assembly is not defense. You pass when the packet clears an HONEST gate — your own, run with no soft caps — and you can answer the hardest reviewer objection to your face. A packet you would not stake your reputation on has not passed.',
  },
  {
    type: 'mission',
    text: 'This is the gate to everything that follows. Course 00 is the foundation the entire Sage curriculum stands on, and a foundation that nobody checks is just a hope. So we check it — here, now, with you running the gate on your own complete body of work. Picture the review: a senior you respect, your packet open on the table, the question "show me the exact evidence that this is not just a happy-path answer." Everything you built across four modules was rehearsal for this moment. Walk in with the packet, clear your own honest gate, and the curriculum opens. This is not a formality. It is the day your judgment becomes provable.',
  },
  {
    type: 'context',
    text: 'A capstone is not a new lesson — it is the course proving it was one coherent thing all along. Module 1 taught you to recognize a real engineering decision; Module 2 taught you to make and defend it; Module 3 taught you to break, prove, and repair it; and Module 4 — transfer, package, gate — taught you to carry it anywhere, make it inspectable, and check it honestly. This lesson roll-calls all of it into a single packet and a single gate. Pass it and you are not "done with a course," you are cleared to build on a foundation you can defend. That is why this gate is strict: everything downstream assumes it held.',
  },
  {
    type: 'pretest',
    prompt:
      'A learner assembles every required document into a tidy mastery packet, all sections filled in, formatting clean. They have not yet answered a single reviewer objection out loud. Have they passed the capstone?',
    reveal:
      'Not yet — assembly is not defense. A complete-looking packet is necessary but proves only that the documents exist, not that the judgment behind them holds. The capstone passes when the packet clears an HONEST gate (your own, no soft caps) AND you can field the hardest objection — "show me the exact evidence this is not happy-path" — without hedging. The gap between "I have all the documents" and "I can defend all the documents to a skeptic" is the entire capstone. That is the "oh": the gate is on the defense, not the assembly.',
  },
  {
    type: 'concept',
    title: 'The mastery packet: one bundle that proves the whole course, gated honestly',
    text: 'A mastery packet is the course made inspectable. It contains, for the capability the course built: a DIAGNOSTIC (where you started, honestly), a DECISION MEMO (judgment under incomplete evidence), a FAILURE AUTOPSY (the production-grade failure you predicted in advance), a REVIEWER OBJECTION ANSWERED (the hardest pushback, written with your answer), a TRANSFER CASE (the judgment carried to a new domain), and an EVIDENCE LEDGER (claims phrased as proofs, linked to artifacts). The packet is bound together by one HONEST UNLOCK GATE run across all of it — every claim names a proof, every required criterion met or honestly red-and-repaired. The packet is not a portfolio of nice work; it is a single defensible argument: "I own engineering judgment, and here is the inspectable proof, gated the way a reviewer would gate it."',
  },
  {
    type: 'worked-example',
    intro:
      'The capstone roll-call: each module of Course 00 contributes one provable piece to the packet. Walk the whole arc and watch it become one argument.',
    steps: [
      'Module 1 (recognize the decision) → the DIAGNOSTIC: you can tell a real engineering decision from a fake one, and you state honestly where you began.',
      'Module 2 (make and defend) → the DECISION MEMO: a real call under incomplete evidence, with the rejected option and the reason named.',
      'Module 3 (break, prove, repair) → the FAILURE AUTOPSY + the PROOF: the production-grade failure you predicted in advance, and the strongest available check that the repaired version holds.',
      'Module 4 / transfer → the TRANSFER CASE: the same judgment carried cold into a domain you were never taught, with invariant and load both named.',
      'Module 4 / package → the EVIDENCE LEDGER: every claim phrased as a proof, linked to an inspectable artifact, timestamped in git.',
      'Module 4 / gate → the HONEST GATE over the whole packet: a conjunction of required criteria, no soft caps, every red repaired or stated honestly.',
      'Result: not six documents — one argument. Read end to end, the packet says "this person can decide, prove, defend, repair, transfer, and gate," and a skeptic can verify every clause.',
    ],
    commonMistake:
      'The common mistake at the capstone is mistaking COMPLETENESS for DEFENSIBILITY — filling every section and calling it passed. A complete packet with one un-defendable claim fails the gate, because the gate is a conjunction and the capstone is the gate. The other common mistake is inflating the diagnostic to look impressive; an honest "here is where I was weak and here is the repair" is worth more than a flawless-looking start nobody believes. Defend every clause or honestly red it — do not assemble your way past the gate.',
  },
  {
    type: 'tradeoff',
    question:
      'Running the capstone gate on yourself, you find one claim you cannot fully defend against the hardest objection. Do you present the packet as a clean pass, or present it with that claim honestly marked and repaired?',
    optionA: {
      label: 'Present clean',
      text: 'Smooth over the weak claim, present the packet as a full pass, and hope the objection does not come up. Looks stronger on the surface; collapses the instant a reviewer pushes on exactly that claim — and they will, because weak claims are what reviewers probe.',
    },
    optionB: {
      label: 'Present honest + repaired',
      text: 'Mark the weak claim honestly, show the repair you ran (or the honest red if it is not yet fixed), and defend the rest cleanly. Looks slightly less perfect; is far more credible, and is exactly the self-gating the course just taught.',
    },
    guidance:
      'B, without hesitation — and the fact that this is even a temptation is the final test of the whole course. The entire point of Modules 1–4 was to make honest red worth more than dishonest green. A reviewer trusts the engineer who flags their own weak claim and shows the repair infinitely more than the one who presents a suspiciously clean packet, because the first one demonstrably runs their own gate honestly and the second one might be hiding anything. Presenting clean is the effort-discount and the deadline-open dressed up for the capstone; you already learned to refuse both. Stake your reputation on a packet you can defend every clause of — including the clause that says "this part needed repair, and here it is."',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'The thing that separates passing this gate from gaming it: rehearse the DEFENSE out loud, not just the documents. Read your packet to an empty room and answer "show me the exact evidence this is not happy-path" for every single claim, spoken, no notes. The claims you stumble on are exactly the ones a reviewer will find — your hesitation is the tell, and they are trained to hear it. The capstone is won in the rehearsal, where stumbling is free, not in the review, where it is expensive. Engineers who rehearse the objection out loud walk into the room already having survived it.',
  },
  {
    type: 'code',
    filename: 'mastery_packet.md',
    language: 'bash',
    code: `# Mastery Packet — Course 00: Engineering Judgment Foundation
# Assemble, then run your own HONEST gate over all of it (no soft caps).

## 1. Diagnostic        — where I started, honestly (Module 1)
## 2. Decision memo     — ${DECISION_MEMO} (Module 2)
## 3. Failure autopsy   — the failure I predicted in advance (Module 3)
## 4. Proof             — strongest check the repaired version survived (Module 3)
## 5. Reviewer objection answered — hardest pushback + my answer
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
git commit -m "capstone: Course 00 mastery packet, gated honestly"`,
  },
  {
    type: 'lab',
    title: 'Assemble and gate your Course 00 mastery packet',
    summary:
      `Build mastery_packet.md (use the skeleton above) by pulling in the real artifacts you produced across this course: the diagnostic, the ${DECISION_MEMO}, the failure autopsy, the proof, the reviewer objection answered, the transfer case, and the evidence ledger. Then run the HONEST GATE over the whole thing — every line PASS or REPAIR, no averaging, no effort discount. Finally, rehearse the defense OUT LOUD: for each claim, answer "show me the exact evidence this is not happy-path." The win: a single inspectable packet that clears your own honest gate and that you can defend, clause by clause, to a skeptic — the gate to the rest of the curriculum, passed for real.`,
  },
  {
    type: 'debug',
    symptom:
      'A capstone packet presented as a full pass. The reasoning that produced the "pass" is broken. Find the flaw before a reviewer does.',
    language: 'bash',
    brokenCode: `# Mastery Packet — gate result
diagnostic_honest:        PASS   # "started already strong" (inflated, no evidence)
decision_defensible:      PASS
failure_predicted_early:  REPAIR # autopsy written AFTER the outcome
objection_answered:       PASS
transfer_real:            PASS   # same memo, nouns swapped
every_claim_names_proof:  PASS
=> "Most are PASS, packet is strong" => CAPSTONE: PASSED`,
    task:
      'Two claims are quietly broken and the gate logic is wrong on top of them. Name all three problems and state the correct capstone result.',
    fix:
      'Three problems. (1) The gate averaged — "most are PASS" cannot open a conjunction with a REPAIR in it; failure_predicted_early is REPAIR, so the gate is CLOSED, full stop. (2) diagnostic_honest is a dishonest green: "started already strong" with no evidence is the inflation the course warned against — an honest diagnostic names where you were weak. (3) transfer_real is a noun-swap, not a real transfer — same memo with the nouns changed is not judgment carried to a new domain. Correct result: CAPSTONE CLOSED. Actions: write the failure autopsy honestly (and accept it is now post-hoc — note that), re-do the diagnostic honestly, produce a genuine cold-domain transfer, then re-run the gate. The capstone passes on a packet you can defend every clause of, not on a majority of greens over two hidden reds.',
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
  blocks: unknown[]
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
