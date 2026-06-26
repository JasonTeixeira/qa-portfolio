# Sage Academy — Autonomous Content Loop (weave the mastery system in)

> The driver for a `/loop` run that weaves `/Users/Sage/engineering-mastery-system`
> into the academy, **one lesson at a time**, at the gold-standard bar — with real,
> layered checks on both the CONTENT and the CODE. Read this +
> [CONTENT_LEDGER.md](./CONTENT_LEDGER.md) (the backlog) at the start of every pass.
>
> Companion to [LOOP.md](./LOOP.md) (the growth-engine convergence loop). That loop
> perfects the *machine*; this loop fills it with *real courses*.

## Objective
Convert the engineering-mastery system (16 tracks · 55 scenario pipelines · 60 concept
deep-nodes) into published academy courses, faithfully, at the quality of the seeded
template lesson (`programming-fundamentals / input-validation`). Stop at the exit gate.

## The unit = ONE lesson
Each pass produces exactly one lesson, fully checked, reviewed, committed. Small units
keep quality high and every commit reviewable. Never batch-generate unreviewed lessons.

## Source of truth + grounding rule (NON-NEGOTIABLE)
- Every lesson is **grounded in a specific source file** — a `concepts/deep-nodes/*.md`
  node and/or a `scenario-pipelines/*.md` pipeline + its `concept-attachment-map.md` entry.
  The seed script MUST cite the source path in a comment.
- Author standard, correct engineering content **grounded in that source's substance and
  voice**. You may write clear teaching prose + runnable examples (established CS), but you
  may **NOT invent claims, numbers, or facts** the source/established practice doesn't support.
- **Faithful, not fabricated.** If the source is thin, the lesson stays scoped to what it
  supports — don't pad. Honest "this cluster is a scaffold" beats invented depth.

## The per-lesson pipeline (one pass)
1. **SELECT** — open CONTENT_LEDGER.md; take the next `PENDING` lesson under the active course.
2. **GROUND** — read its source node/pipeline + attached socratic/retrieval/tradeoffs/failures.
3. **AUTHOR** — add the lesson to the course's seed script (`scripts/academy/seed-<course>.ts`)
   as a full Learning-Engine sprint:
   - Intensity by depth: `standard` for a normal lesson, `deep` for senior scenarios (adds calibration).
   - **Lab discipline:** a *runnable Pyodide lab* where code genuinely applies (fundamentals/DSA);
     a *reasoning/diagnosis* `verification` + `teachback` where the skill is judgment (systems
     scenarios). Never fake an executable lab for a non-code skill.
   - Course `pretest`/`posttest` (≥3 each) from the source's retrieval/socratic prompts.
4. **SELF-CHECK (content)** — map the lesson against the gates below; fix gaps before running tools.
5. **AUTOMATED GATES — all must pass (GREEN):**
   - `tsx --env-file=.env.local scripts/academy/seed-<course>.ts --apply` (idempotent upsert)
   - `tsx --env-file=.env.local scripts/academy/check-course.ts <slug>` → **CONTENT GATE PASS**
     (block schema · sprint completeness via the app's REQUIRED_SECTIONS · 8 polish gates · pre/post)
   - `npx tsc --noEmit --pretty false` → 0 errors
   - `RUN_ACADEMY_CONTENT_E2E=1 … run-playwright … academy-content.spec.ts` → renders (course · sprint · lab · gate)
   - **Lab determinism:** the reference solution's stdout contains the lab's `check` string.
6. **ADVERSARIAL REVIEW (two agents, parallel):**
   - **Content reviewer** — faithfulness to the source node (no invented facts), technical
     accuracy, pedagogy, reading level, the 8 polish gates, the quality-bar 10 questions.
   - **Code/data reviewer** — block-schema correctness, lab safety (sandboxed), seed idempotency,
     no PII / unsafe strings, no anti-patterns. Fix every CRITICAL + HIGH; re-run gates.
7. **COMMIT** — scoped to the seed script + ledger (+ any topic/code change). Conventional
   message, no push, no Co-Authored-By.
8. **LEDGER** — mark the lesson `DONE` with its check result; update course lesson count.
9. **LOOP or STOP** — exit gate met? → final course audit + report. Else → next lesson.

## Content quality gates (the lesson's own review)
A lesson is acceptable only when it answers the **quality-bar 10** and clears the **8 polish
gates** — both enforced by `check-course.ts` (structural) + the content-review agent (semantic):

| Quality-bar question | Block that answers it |
|---|---|
| What real problem does this solve? | `mission` + `context` |
| How does it work? | `concept` + `worked-example` |
| What tradeoff does it make? | `tradeoff` |
| Where does it fail? / detect? / fix? | `debug` |
| When should I NOT use it? | `tradeoff.guidance` / `transfer` |
| Simplest implementation? | `lab` / `worked-example` |
| Production-grade version? | `concept` / `calibration.excellent` |
| How does it connect? | `transfer` |

| Polish gate | Enforced by |
|---|---|
| 1 Scenario grounding | `mission` present |
| 2 Failure awareness | `debug` present (≥1 failure mode + fix) |
| 3 Implementation proof | `lab`/`verification` + checklist |
| 4 Socratic pressure | `teachback` present |
| 5 Retrieval + spacing | `spaced-review` + `quiz`/`pretest` |
| 6 Senior judgment | `tradeoff` present (standard+) |
| 7 External calibration | mapped to source node's coverage |
| 8 Useability | renders + lab runs + assessment gate works (e2e) |

## Exit gate (per course → per track → system)
- **Course done** when every planned lesson in CONTENT_LEDGER.md is `DONE` (content gate +
  render + review all green) AND a final course audit (one content-reviewer pass over the whole
  course) is clean.
- Advance to the next course in ledger order. The **system** is done when every track's
  flagship course is published. Then stop + write a convergence report.

## Guardrails (NON-NEGOTIABLE)
- Faithful grounding; cite the source; no fabricated facts/numbers.
- Reasoning-labs vs code-labs by domain — never fake an executable lab.
- One lesson per pass; never commit a lesson that fails any gate or has an open CRITICAL/HIGH.
- Scoped commits only (`git add` the seed + ledger + touched files); never `git add -A`; no push.
- No Stripe / prod / outward actions. Leave all driver docs in place.
- Never claim verification not run; quote the gate output.

## Commands
- Seed:    `tsx --env-file=.env.local scripts/academy/seed-<course>.ts --apply`
- Content gate: `tsx --env-file=.env.local scripts/academy/check-course.ts <slug>` (or `--all`)
- Typecheck: `npx tsc --noEmit --pretty false`
- Render e2e: `RUN_ACADEMY_CONTENT_E2E=1 PW_BASE_URL=http://127.0.0.1:3040 node --env-file-if-exists=.env.local scripts/ops/run-playwright.mjs test tests/e2e/academy-content.spec.ts --config=playwright.e2e.config.ts --project=chromium`
- Supabase project: `hocrntqhgvmeaxwlhzwl` (MCP). Topics live in `lib/academy/topics.ts`.

## Run it
```
/loop Weave the engineering-mastery system into the academy per docs/academy/CONTENT_LOOP.md.
One lesson per pass: ground in the source node → author the sprint in the course seed script →
seed --apply → check-course content gate → typecheck → render e2e → 2-agent review (content +
code) → fix → scoped commit → update CONTENT_LEDGER.md. Stop at the exit gate. Honor the
grounding rule (faithful, never fabricated) and all guardrails. Keep next dev -p 3040 running.
```
