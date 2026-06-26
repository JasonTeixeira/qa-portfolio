# Sage Academy — Autonomous Content Loop (ingest the Factory, don't re-author)

> The driver for a `/loop` run that brings **canonical Course-Factory output** into the
> runtime academy, **one course (or one lesson) per pass**, with real checks on both the
> CONTENT and the IMPORT. Read this + [PLATFORM_ARCHITECTURE.md](./PLATFORM_ARCHITECTURE.md)
> (the canon — §7 pipeline, §8 spine, §11 done, §12 enforcement) + [CONTENT_LEDGER.md](./CONTENT_LEDGER.md)
> (the backlog) at the start of every pass.
>
> Companion to [LOOP.md](./LOOP.md) (growth-engine machine) and [UX_LOOP.md](./UX_LOOP.md)
> (the runtime that *enforces* the loop). This loop fills the machine with **real courses**.

## What changed (and why)
The academy used to hand-author lessons inside `seed-<course>.ts`. That makes every course a
per-author guess and forks the content away from the canon. **The canonical source of truth is
`AI_CAREER_OPERATING_SYSTEM`'s Course Factory** (templates + `validate_generated_course.py` +
the senior audit ledger), fed by the `engineering-mastery-system` asset library. This loop's
job is therefore **INGEST + VALIDATE + IMPORT**, not invent: take a Factory-built canonical
course folder, prove it passes the canon's own gates and senior ledger, import it into the
15-entity runtime spine, and verify the runtime runs all 5 beats on it. One bar, every domain.

## Objective
Bring every canonical Factory course into the runtime academy, faithfully and evidence-gated,
until each track's flagship course is live and enforced. Author **nothing new** in the runtime;
the Factory authors, this loop ingests. Stop at the exit gate.

## The unit = ONE canonical course folder (lesson-at-a-time within it)
Each pass ingests one course (or, for a large course, one module/lesson of it), fully
validated, imported, verified, reviewed, committed. Never bulk-import unvalidated folders.

## Source of truth + grounding rule (NON-NEGOTIABLE)
- The **only** content input is a canonical course folder produced by the Course Factory
  (`AI_CAREER_OPERATING_SYSTEM/course_factory` + `tracks/01-12`), itself grounded in the
  `engineering-mastery-system` asset library. Cite the source course path in the importer run.
- **Do NOT re-write the content in the importer.** The importer is a faithful mapping of the
  canonical folder → DB spine. Any content defect is fixed **upstream in the Factory**, then
  re-ingested — never patched in the runtime (that would re-fork the canon).
- If the Factory has **not yet produced** the next course, the loop does NOT invent it in a
  seed script. It either (a) runs the Factory build for that course from the asset library,
  or (b) marks the ledger `BLOCKED — needs Factory build` and advances. Honest gap > fake course.
- The legacy `programming-fundamentals` seed script stays as the **gold runtime exemplar**
  (the import target shape) but is frozen; new courses arrive via the importer.

## The per-pass pipeline (one course/lesson)
1. **SELECT** — open CONTENT_LEDGER.md; take the next `PENDING` course in track order
   (or the next module of an in-progress course).
2. **LOCATE** — find its canonical Factory folder. If absent → run the Factory build or mark
   `BLOCKED — needs Factory build` and pick the next. Never substitute hand-authored content.
3. **VALIDATE (canon gates, upstream):**
   - `python validate_generated_course.py <course>` → PASS (structure · 17-section lessons ·
     sprints · labs · capstone · board assets · evidence map · web_app_mapping).
   - `run_all_checks.sh <course>` → PASS.
   - Confirm every required file is `senior_review_pass` in the course's `review_ledger.jsonl`
     (manifest current). If any file is unreviewed → STOP, route to the senior audit, don't import.
4. **IMPORT** — run the importer (`scripts/academy/import-course.ts <course-folder>`): maps the
   canonical folder → the 15-entity spine (Course→Modules→Lessons(v3 17)→Sprints→Labs→Capstone;
   Concept/Skill/RetrievalCard/Artifact/Check; EvidenceEvent wiring; Board assets; pre/post).
   Idempotent upsert keyed on `course_slug` + canonical slugs. No content rewriting in the mapper.
5. **RUNTIME GATES — all must pass (GREEN):**
   - `tsx --env-file=.env.local scripts/academy/check-course.ts <slug>` → **RUNTIME GATE PASS**
     (block schema · sprint completeness via the app's REQUIRED_SECTIONS · 8 polish gates · pre/post).
   - `npx tsc --noEmit --pretty false` → 0 errors.
   - `RUN_ACADEMY_CONTENT_E2E=1 … academy-content.spec.ts` → renders (course · sprint · lab · gate)
     **and** the evidence-gate actually blocks completion without evidence (per UX_LOOP enforcement).
   - **Lab determinism:** the canonical reference solution's stdout contains the lab's `check` string.
   - **§12 contract:** the imported course carries scenario-first HOOK · 5-beat shape · habit-trigger
     hooks · an AI-guide hook · a mastery-map entry · a social surface. Missing any → cap, not GREEN.
6. **ADVERSARIAL REVIEW (two agents, parallel):**
   - **Fidelity reviewer** — does the imported runtime course faithfully match the canonical
     folder? (no dropped sections, no silent content drift, evidence map intact, caps wired.)
   - **Import/data reviewer** — mapper correctness, block-schema, lab safety (sandboxed),
     idempotency, no PII/unsafe strings, RLS. Fix every CRITICAL + HIGH **in the importer or
     upstream Factory** (never by editing imported content by hand); re-run gates.
7. **COMMIT** — scoped to the importer + ledger (+ any mapper/topic code). Conventional message,
   no push, no Co-Authored-By.
8. **LEDGER** — mark the course/lesson `DONE` with: validator PASS · senior-ledger PASS ·
   runtime gate PASS · render+gate e2e PASS · review clean. Update counts.
9. **LOOP or STOP** — exit gate met? → final per-track audit + report. Else → next unit.

## Runtime acceptance gates (what "imported correctly" means)
Enforced by `check-course.ts` (structural) + the fidelity-review agent (semantic) — the runtime
must reproduce the canon's quality-bar 10 and 8 polish gates from the imported data:

| Quality-bar question | Spine field it maps to |
|---|---|
| What real problem does this solve? | `mission` + `context` (from canonical scenario) |
| How does it work? | `concept` + `worked-example` (deep-node) |
| What tradeoff does it make? | `tradeoff` (canonical decide stage) |
| Where does it fail? / detect? / fix? | `debug` (failure branch + error log) |
| When should I NOT use it? | `tradeoff.guidance` / `transfer` |
| Simplest vs production-grade? | `lab` / `concept` / `calibration.excellent` |
| How does it connect? | `transfer` |

| Polish gate | Enforced by |
|---|---|
| 1 Scenario grounding | `mission` present (canonical scenario) |
| 2 Failure awareness | `debug` present (≥1 failure mode + fix) |
| 3 Implementation proof | `lab`/`verification` + checklist |
| 4 Socratic pressure | `teachback` present (from socratic set) |
| 5 Retrieval + spacing | `spaced-review` + `quiz`/`pretest` (retrieval bank) |
| 6 Senior judgment | `tradeoff` present (standard+) |
| 7 External calibration | mapped to canonical node coverage + score caps |
| 8 Useability | renders + lab runs + evidence-gate blocks (e2e) |

## Exit gate (per course → per track → system)
- **Course done** when: validator PASS · `run_all_checks.sh` PASS · every file `senior_review_pass`
  · imported · runtime gate PASS · render+evidence-gate e2e PASS · 2-agent review clean · §12
  contract present. A final fidelity pass over the whole imported course is clean.
- Advance in ledger order. The **system** is done when every track's flagship course is imported
  and enforced. Then stop + write a convergence report.

## Guardrails (NON-NEGOTIABLE)
- **Obey [LOOP_HARDENING.md](./LOOP_HARDENING.md)** — stable server, full-sweep no-regression,
  stuck-handling, anchored scoring (validator + senior ledger + reviewer, never self-graded),
  wiring-dep policy.
- **Ingest, don't author.** Content lives in the Factory/canon; the runtime only imports it.
  Fix defects upstream and re-ingest — never hand-edit imported content.
- One course/lesson per pass; never commit an import that fails any gate or has an open
  CRITICAL/HIGH, or whose source isn't `senior_review_pass`.
- Reasoning-labs vs code-labs by domain — never fabricate an executable lab for a judgment skill.
- Scoped commits only (`git add` the importer + ledger + touched files); never `git add -A`; no push.
- No Stripe / prod / outward actions. Leave all driver docs in place.
- Never claim verification not run; quote the gate output.

## Commands
- Validate (canon): `python AI_CAREER_OPERATING_SYSTEM/course_factory/validate_generated_course.py <course>`
- Checks (canon):   `AI_CAREER_OPERATING_SYSTEM/course_factory/run_all_checks.sh <course>`
- Import:           `tsx --env-file=.env.local scripts/academy/import-course.ts <course-folder> --apply`
- Runtime gate:     `tsx --env-file=.env.local scripts/academy/check-course.ts <slug>` (or `--all`)
- Typecheck:        `npx tsc --noEmit --pretty false`
- Render+gate e2e:  `RUN_ACADEMY_CONTENT_E2E=1 PW_BASE_URL=http://127.0.0.1:3040 node --env-file-if-exists=.env.local scripts/ops/run-playwright.mjs test tests/e2e/academy-content.spec.ts --config=playwright.e2e.config.ts --project=chromium`
- Supabase project: `hocrntqhgvmeaxwlhzwl` (MCP). Topics live in `lib/academy/topics.ts`.

> **First-pass note:** `scripts/academy/import-course.ts` does not exist yet — building it
> (faithful canonical-folder → 15-entity-spine mapper, idempotent, no content rewriting) is the
> loop's **pass 0** before any course is ingested. The `programming-fundamentals` seed is the
> target shape the importer must produce.

## Run it
```
/loop Ingest canonical Course-Factory courses into the runtime per docs/academy/CONTENT_LOOP.md.
Pass 0: build scripts/academy/import-course.ts (faithful canonical-folder → 15-entity-spine
mapper, idempotent, no content rewriting). Then one course per pass: locate the Factory folder
→ validate (validate_generated_course.py + run_all_checks.sh + senior_review_pass) → import
→ check-course runtime gate → typecheck → render+evidence-gate e2e → 2-agent fidelity+import
review → fix upstream → scoped commit → update CONTENT_LEDGER.md. Stop at the exit gate. Ingest,
never author. Honor §12 contract and all guardrails. Keep next dev -p 3040 running.
```
