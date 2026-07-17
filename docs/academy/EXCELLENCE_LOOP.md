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
