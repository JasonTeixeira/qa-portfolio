# Sage Academy — Platform Architecture & The Canonical Loop (single source of truth)

> How EVERY course on Sage Academy works. One loop, one grounding, beginner → senior,
> across every domain. This consolidates the two content systems and the web runtime
> into one operating system. Upstream canon: `AI_CAREER_OPERATING_SYSTEM/` (the
> MASTER_LEARNING_LOOP_CONTRACT_V3 + Board-Style layer + Course Factory). This doc is
> the runtime/web codification of that canon.

## 1. The three layers (the whole system)
| Layer | Source | Role |
|---|---|---|
| **The OS** — contract + factory + audit | `AI_CAREER_OPERATING_SYSTEM` | Single source of truth: the V3 loop, board-style layer, Course Factory + validator, senior audit ledger, the 12 canonical courses. |
| **The asset library** — raw mastery material | `engineering-mastery-system` | A content mine (55 scenarios · 60 concept nodes · 740 retrieval prompts · 150 socratic sets · 260 failure modes) that *feeds* the factory; not a second course system. |
| **The runtime** — loop as product logic | the web academy | Ingests factory output and ENFORCES the loop: evidence-gated completion, score caps, repair queue, board-style scheduler, mastery map. |

## 2. The canonical loop — what every course feels like
The proven cognitive loop is V3's 16 stages. But 16 steps is too many for a human to
internalize as a habit, so we group them into **5 memorable BEATS that repeat identically
in every lesson of every course.** Same rhythm everywhere = the learner always knows what's
coming. That predictability is the habit.

```
HOOK  →  MODEL  →  DO  →  PROVE  →  LOCK
```

| Beat | V3 stages | What the learner does | The science |
|---|---|---|---|
| **HOOK** | Scenario · Goal · Diagnose | "Here's a real problem — can you?" A scenario they care about, then a pretest before reading. | emotional stakes · retrieval · productive failure |
| **MODEL** | Orient · Model · Concept | See where it fits, study one worked example, get the smallest idea needed. | worked-example effect · concreteness |
| **DO** | Retrieve · Build · Break | Recall from memory, build a tiny real artifact, then handle the broken case. | generation effect · application · desirable difficulty |
| **PROVE** | Decide · Prove · Explain · Review · Repair | Choose under a tradeoff, verify it, teach it back, get scored, fix the weakness. | feedback · elaboration · deliberate practice |
| **LOCK** | Space · Transfer · Package · Unlock | Schedule the review, transfer to a NEW context, package the proof, pass the gate. | spacing · transfer · investment |

Every lesson opens with the **scenario** (the human hook) and ends only at an **evidence-gated
unlock** — never "I read it." This 5-beat shape is the template that sets the tone for the
entire platform.

## 3. The loop is NESTED in a habit loop (this is what makes it sticky)
The 5 beats teach mastery. They don't, by themselves, make a learner come back tomorrow.
So the cognitive loop runs *inside* a motivation loop (the growth engine you already built):

```
Trigger (streak / daily goal / "up next") → enter lesson → [HOOK→MODEL→DO→PROVE→LOCK]
   → Variable reward (XP · celebration · mastery bar moves · league) → Investment (proof
   artifact · streak · portfolio item) → strengthens the next Trigger.
```
**Cognitive loop = mastery. Habit loop = stickiness. You need both.** The platform's job is
to run the cognitive loop while the habit loop keeps the learner returning to it.

## 4. Same loop, scaled by level (beginner → senior on one spine)
The beats are identical; their DEPTH scales with the learner (handles the expertise-reversal
effect — heavy scaffolding helps novices, bores experts):

| Level | Loop shape |
|---|---|
| **Beginner** | Micro/Standard sprint: more scaffold, worked examples first, one tiny build, gentle gate. |
| **Practitioner** | Full standard sprint: all 5 beats, real artifact + verification + transfer. |
| **Senior** | Deep sprint + Scenario Exam: ambiguous brief, adversarial review, attack outline, oral defense, multiple failure branches. |
| **Interview-ready** | Adds timed oral defense + mixed practice + portfolio packet. |

Same expectation, rising difficulty — the learner feels growth on a single, familiar track.

## 5. Evidence is the currency (nothing is faked, nothing is "read")
Completion requires evidence; scores are capped by missing evidence (V3 + Board caps):
- 11 evidence events emitted by the loop (diagnostic_completed, retrieval_attempted,
  lesson_completed, sprint_artifact_created, lab_verified, repair_created, repair_completed,
  transfer_attempted, capstone_submitted, portfolio_item_created, interview_answer_scored).
- The 8-state machine per unit: locked → ready → in-progress → proof-pending → review-pending
  → repair-required → transfer-due → complete.
- Score caps: no retrieval → 70 · no artifact → 72 · no verification → 78 · no broken case →
  82 · no explain-back → 84 · no review → 86 · no repair → 88 · no spacing → 90 · no transfer
  → 92 · no portfolio → 94 · no board asset → 95 · no external/outcome data → 98. **No 99+
  without real learner outcomes.**

## 6. Stickiness after the lesson — the Board-Style layer
Every serious course emits board assets so the skill survives: question bank · spaced-recall
card · **error log** (mistakes → repair rules) · attack outline · **oral defense** · mixed
practice · **confidence scoring** · visual atlas. The engineering-mastery library (retrieval
prompts, socratic sets, failure modes, mermaid maps) is exactly the raw material for these.

## 7. The one build pipeline (every course, identical grounding)
```
Course Factory (canonical templates + validator)
  ← source material: AI_CAREER tracks/01-12  +  engineering-mastery scenarios/nodes/banks
  → canonical course folder (course_map · diagnostic · modules · lessons(17 sections) ·
    sprints · labs · capstone · scorecards · board assets · evidence · web_app_mapping)
  → validate_generated_course.py + run_all_checks.sh   (fail-closed gate)
  → senior audit ledger (manifest + review_ledger.jsonl + score caps)
  → IMPORTER → web academy DB (the 15-entity spine)
  → web app runs the 5-beat loop + habit loop + board scheduler + mastery map
```

## 8. The unified content spine (15 entities — the same for every course)
Course → Modules → Lessons (lesson_v3 17 sections) + Sprints + Labs + Capstone; each emits
Concept · Skill · RetrievalCard · Artifact · TestaCheck; gated by EvidenceEvent + the
8-state machine + score caps; made sticky by the Board-Style assets; proven by PortfolioItem
+ Review/Repair/Transfer records.

## 9. engineering-mastery → canonical mapping (how they reconcile)
scenario pipeline → Sprint/Scenario-Exam · deep-node → Concept + Worked Example · mental
models → Concept/Explain · tradeoffs → Decide · failure branches → Break + Error Log ·
socratic (150) → Explain + Oral Defense · retrieval (740) → RetrievalCard + Question Bank ·
capstones → Capstone · proof artifacts → Portfolio/Evidence · mermaid maps → Visual Atlas +
Mastery Map. The mastery library *completes* the board-style layer the runtime is missing.

## 10. What the runtime must implement (the enforcement contract)
Build these so the loop is product logic, not pages: evidence-gated completion · the 8-state
machine · the 11 evidence events · score caps · repair queue · the board-style scheduler ·
the AI guide (immediate hint/explain/review, grounded in the lesson + deep-nodes) · the
mastery map (the visible progress + "you are here") · the artifact ladder.

## 11. Definition of done (per course)
A course is canonical only when: built through the Factory · passes `validate_generated_course.py`
+ `run_all_checks.sh` · every required file is `senior_review_pass` in the audit ledger ·
imported to the runtime · the runtime runs all 5 beats with evidence-gating + board assets +
score caps. Anything less is content, not a Sage course.

## 12. The last 5 points — what takes the FOUNDATION from ~91 to 95–97
The loop above is a 91 as a *spec*. It describes the 6 stickiness enrichments as prose. A
95+ foundation **enforces and measures** them — and, per §5, **98–99 is honestly gated on
real learner outcomes** (no faking the top of the scale). Six foundation pieces close it:

1. **The 6 enrichments are CONTRACT, not prose — each with its own cap.** A course cannot
   claim ≥95 unless it ships all six: scenario-first HOOK · the 5-beat shape · habit triggers
   wired (trigger→reward→investment) · an AI-guide hook per lesson · a mastery-map entry · a
   social surface. Caps when missing: no scenario-first → 90 · no AI-guide grounding → 93 ·
   no habit triggers → 92 · no mastery-map entry → 92 · no social surface → 94. These stack
   with the V3/Board caps in §5 (the binding score is the **minimum** of all caps).
2. **Measurement contract (you can't claim 95 you can't measure).** The loop must emit the
   metrics that prove it works: **CURR** (retention) · **mastery-gain** (Hake's normalized
   `g = (post−pre)/(100−pre)`) · evidence-completion funnel per beat · confidence calibration
   (predicted vs actual) · beat-level drop-off. Internal score is capped at 97 until these
   read green on real n; 98–99 requires real learner outcome + independent-review evidence.
3. **Onboarding-to-the-loop (Course 00).** The learner's first run *teaches the 5-beat method
   itself* — so the habit/expectation forms on day one, not by accident over weeks. Every new
   learner completes Course 00 before any track. (Upstream: AI_CAREER Course 00 — wire it.)
4. **A gold exemplar per beat.** One reference 95+ HOOK / MODEL / DO / PROVE / LOCK lives in
   the Factory; every authored beat is built and audited against it, so quality is one bar
   across every domain — not a per-author guess. The validator diffs structure against it.
5. **Disengagement-recovery path (repair, don't punish).** When a learner stalls or fails a
   gate repeatedly, the loop must respond: easier on-ramp, scaffolded hint escalation, a
   re-engagement trigger, and an affective reset — never a dead end. Failing the gate routes
   to the repair queue, not to a wall. This is the affective half of the habit loop.
6. **Genuine-evidence / anti-gaming contract.** Evidence must be *real* or the caps mean
   nothing: retrieval is closed-note, **confidence is recorded before the answer**, the lab
   actually verifies output, and the explain-back / oral-defense is **graded by the AI guide**
   (not self-marked). The AI guide is therefore load-bearing — it is the grader that makes
   explain-back, repair, and oral defense count as evidence rather than clicks.

**Net:** with §12 enforced the foundation is a defensible **95–97**; the remaining 2–3 points
are unlocked only by real learners (CURR + mastery-gain + external review). That ceiling is
correct — a foundation that could self-grade 99 would be lying.
