# The Excellence Loop — beyond structural completeness

**Operator mandate (2026-07-17):** *"when we say we are done with all the courses we can continuously
audit and iterate till the course content is genuinely excellent."*

The content board (32/32 PASS) proves **structure**: every lesson has the sprint arc, runnable labs,
proof gates. It does NOT prove the content is *good teaching*. This loop closes that gap.

## The loop
```
judge (skeptical master-teacher, samples first/mid/capstone per course)
   → EXCELLENCE_BOARD.json (ranked worst-first, cited defects + executable fixList)
   → fix wave (editor agents execute fixLists → audit 0-fail → apply live)
   → re-judge
   → repeat until genuinely excellent
```

## Dimensions (0–100, skeptical; default lower on doubt)
| Dimension | Question |
|---|---|
| clarity | Does every explanation earn its words? Jargon defined before use? |
| depth | Teaches the WHY + failure modes a senior knows, or surface how-to? |
| exampleQuality | Are worked examples illuminating traces, or box-ticking? |
| labMeaning | Does the lab make the learner confront the core idea, or busywork? |
| momentum | Does the arc pull forward (hook → tension → resolution)? |
| correctnessRisk | 100 = nothing dubious; deduct for wrong/outdated/misleading claims |
| **excellenceScore** | Holistic verdict (judgment, not an average) |

## Wave 1 result (2026-07-17) — 12/32 judged, **average 82**
Board: `proof-artifacts/academy/EXCELLENCE_BOARD.json`. 20 courses unjudged (usage limit).

**This loop works — it found real, shipped defects the structural gate cannot see:**

| Course | Score | Headline defect (cited) |
|---|---|---|
| agents-tool-use | **58** | Capstone's canonical "Bounded agent" code has an **infinite loop**: the denial path `continue`s before `log.steps++`, so a repeated denied tool never trips the budget. Also a dead `- denied.length * 0` term claiming to score safety. |
| career-enterprise_it | 80 | Single-failure monoculture — the SCIM ghost-contractor scenario is the central example in all 3 sampled lessons. |
| career-eng_leadership | 82 | Self-contradicting DORA claim in one callout ("consistent with DORA" then "DORA does not describe…"). |
| career-ai_eng_rag_eval | 83 | Capstone lab reduces the whole course to a 5-line threshold fn; the real deliverable is off-platform + infeasible in the stated time box. |
| career-architecture_sd | 84 | Occupancy math assumes cancellation propagation that the lesson's own debug block disproves. |
| career-backend_eng | 84 | **Capstone models the exact race the course corrected** — find-then-insert idempotency, listed as REJECTED in its own worked example. |
| career-concept_maps | 84 | Lab constants contradict the worked example (0.0s vs 0.8s/batch) — in the lesson whose thesis is *measured edges*. |
| career-databases | 84 | Capstone's `ALTER TABLE … UNIQUE USING INDEX` over an **expression index — Postgres rejects this**; the climax step errors on real PG. |
| career-eng_judgment | 84 | "Testa" is load-bearing jargon **never defined anywhere** in the course. |
| career-frontend | 84 | All 3 sampled lessons name the identical proof artifact filename (copy-template scaffolding). |
| career-data_eng | 85 | Two contradictory freshness semantics (per-row event age vs newest-record recency). |
| career-cloud_devops | 87 | Unlock gate cites ~2,960 absorbed; the lab's own check output is 336 — the proof chain breaks at ~10x. |

## Why this matters
Every one of these ships today and would embarrass a senior reviewer — a capstone that infinite-loops,
a SQL step that errors on real Postgres, gates whose numbers contradict their own labs. **Structural
completeness was necessary and insufficient.** The loop is the mechanism that makes "excellent" mean
something.

## Next
1. Judge the remaining 20 courses (resume `wf_6c9c8584-41f`).
2. Fix wave: worst-first (agents-tool-use at 58 is a genuine correctness emergency), editor agents
   execute fixLists → audit → apply → re-judge.
3. Target: no course below ~95, zero correctness defects, then re-verify the content board still 32/32.

---

## FIX WAVE 1 — RESOLVED + VERIFIED (2026-07-17)

**Lab integrity gate + correctness bombs, all verified against LIVE data (not agent claims):**

| Metric | Before | After |
|---|---|---|
| Labs that hand the answer (632 labs) | **25.9%** (system-design 92%) | **1.7%** — GATE PASS |
| Correctness bombs fixed | — | 20 across 15 courses |
| Labs still execute (reworked courses) | — | system-design 22/22, agents 17/17, data-structures 17/17 |
| Content board | 32/32 | **32/32** (survived) |
| Quiz integrity | PASS | **PASS** (no collateral) |
| Storyboard narration beats | 4,582 | **4,582** (intact) |

**Confirmed correctness bombs killed (by inspection/re-execution, not scores):**
- `agents-tool-use` capstone infinite loop → FIXED: `log.turns++` now at the TOP of the loop
  ("no branch below can skip it"), so a repeated denied tool trips the budget. Dead `denied.length * 0`
  scoring term removed.
- `career-databases_data_modeling` → the `UNIQUE USING INDEX` step is now correct TEACHING: "there is
  NO promote-to-constraint step. Postgres refuses… ERROR: index contains expressions."
- `system-design` cap-and-consistency: algorithm-in-comment removed from the lab starter.

**Method note:** two of my own signature regexes false-alarmed (the `denied.push; continue` pattern
persists but the bug was the step-ordering, now fixed; the databases string appears in
teaching-about-the-error). Always read the CONTEXT, not just the substring.

The `lab-integrity.mjs` gate is now permanent — run after any lab-touching change.

---

## FIX WAVE 2 (2nd pass, 17 uncovered courses) — 2026-07-17

14/17 applied, **82 defects fixed**, 73 confirmed already-stale (killed by quiz/lab gates).
GLOBAL gates all held: quiz-integrity PASS (16.1% longest, −0.5% length adv), lab-integrity
IMPROVED to 0.2%, content board 32/32, 4,582 narration beats intact. The per-course "quiz FAIL"
reports were small-N artifacts (20-quiz courses); the global length-tell is dead.

Verified wins: career-interview SWEBOK/ABET citation fraud 48→1; git-the-terminal +10; observability
+12; qa_sdet +10; ux +9; security +8; networking +7; platform +6; nextjs +8.

**3 not-applied (agents claimed all defects stale) — SPOT-CHECK CAUGHT A PUNT:**
- career-enterprise_it: **phantom capstone CONFIRMED STILL LIVE** — 34 "capstone" mentions, zero
  capstone lesson. Agent said stale; it is not. → targeted fix (build the capstone or remove the
  phantom forward-refs).
- career-engineering_judgment_foundation: "Testa" jargon confirmed GONE; walkthrough-highlight +
  gate-arithmetic defects need re-verify.
- career-architecture_system_design: capstone has a real substantive lab; cache-aside "resurrection"
  claim + dead-gate need re-verify.
LESSON (again): an agent reporting "defect stale" is a CLAIM — spot-check the objective ones.
