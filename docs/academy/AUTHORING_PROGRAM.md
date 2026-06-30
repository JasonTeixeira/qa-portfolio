# Academy authoring program — finish the platform (390 lessons, grounded, autonomous)

> The systematic engine to author every remaining skeleton lesson visual-first, GROUNDED in
> the real source curriculum, gated to ≥95, and run course-by-course autonomously. Reads with
> [CONTENT_AUDIT.md](./CONTENT_AUDIT.md) (what's missing) + [PHASE_B_PIPELINE.md](./PHASE_B_PIPELINE.md)
> (the proven transform loop this extends) + [VISUAL_SYSTEM.md](./VISUAL_SYSTEM.md) (the components).

## The job, precisely
**390 lessons across 19 courses** are empty skeletons (~2 blocks) with a 1:1 real source `.md`
(verified: `data/academy/authoring/manifest.json`, 390/390 matched, 0 drift). Each source md is a
structured lesson pack whose sections map onto our 14-block visual-first arc. So this is a
**grounded source→visual-first authoring** job — not invention. The two done courses
(`programming-fundamentals` 18, `career-engineering_judgment_foundation` 16) are the bar.

Out of scope / cleanup (not authoring): `career-programming_cs_foundations` (20) is a duplicate
**superseded** by `programming-fundamentals` → hide or delete, don't author. `python-basics` (4) has
no source → separate decision.

## The engine (built + committed)
1. **Manifest** — `scripts/academy/authoring/build-manifest.ts` → `data/academy/authoring/manifest.json`.
   Walks the source tree with the EXACT ingest slug derivation, emits `{courseSlug, slug, title,
   moduleTitle, moduleSort, sort, sourceMdPath}` per lesson, cross-checked against the DB (390/390).
2. **Author** — a Workflow (one agent per lesson, parallel within a course). Each agent READS its
   `sourceMdPath`, the locked template, the `LessonBlock` union, and the doctrine, then authors ~14
   visual-first blocks with **≥3 hero visuals** (diagram from the md's "Media And Diagram Hook";
   code-walkthrough from Build + Worked Expert Example; compare from Model weak-vs-gold), grounded in
   the real content. Returns blocks JSON. The reusable prompt lives in the authoring Workflow script.
3. **Validate + apply** — `lib/academy/validate-blocks.ts` (runtime validator for all 24 block types,
   fail-closed, diagram edge→node referential check) + `scripts/academy/authoring/apply-course.ts`.
   Reads `data/academy/authoring/<course_slug>.lessons.json` (`{slug: LessonBlock[]}`), validates every
   block, enforces the ≥3-visual floor (warn), and upserts to `academy_lessons` (on `course_slug,slug`
   — metadata from the manifest, so NO stray rows, slugs/sorts preserved). Dry-run by default; `--apply`
   writes. The JSON is the version-controlled provenance.
4. **Render + score** — `sweep-lessons.mjs` (single-login multi-lesson capture) + a scoring Workflow
   (one agent per lesson reads the segments, scores visual-first/density/pedagogy/lab-integrity/hollow).
   Same gate that locked the first 34.

## The per-course loop (the unit of autonomous work)
For each of the 19 courses, in curriculum order:
1. `author-<course>` Workflow → authors all its lessons from their source mds (parallel; ≤16 at once).
2. Write the returned `{slug: blocks}` to `data/academy/authoring/<course_slug>.lessons.json`.
3. `apply-course <course>` dry-run → fix any validation failures (re-author the offending lesson) →
   `apply-course <course> --apply`.
4. `sweep-lessons <course> <all slugs>` → scoring Workflow → any lesson <95 or hollow loops (re-author
   that lesson with the panel's fix) until the course's lessons are all ≥95.
5. Scoped commit: the course JSON + manifest; update the ledger below. Then the next course.

Human checkpoint per course (not per lesson): surface the course's score distribution + a sampled
lesson for sign-off before moving on. Anything that can't reach 95 in the loop budget is surfaced,
never shipped below bar, never faked.

## Honest cost + cadence
390 lessons × (1 author agent + 1 render + 1–2 score agents + occasional re-author) ≈ a few thousand
agent-runs total — large tokens + wall-clock. Therefore: **course-by-course**, ~20 lessons per
authoring Workflow, validated + scored before the next. ~19 course-cycles. This is the autonomous run:
each cycle is bounded, gated, and committed; a crashed cycle resumes from the per-course JSON + ledger.
Login throttle is handled by `sweep-lessons.mjs` (one context per course).

## Quality guardrails (non-negotiable)
Grounded in the real source md (no invented filler — that is the whole point of the source curriculum).
Prerequisite-correct (curriculum order). NEVER change a slug/sort. ≥3 real visuals + the arc + the
assessment beats. Validate-before-apply (fail closed). Real teaching anchored to the md's Standards
Grounding. Render-verified ≥95 — a lesson is "done" only when the panel says so on the rendered page.
Scoped commits, no push.

## Status + ledger (courses)
Engine: manifest ✓, validator + apply ✓, sweep + scoring ✓ (reused from Phase-B). Proving run:
backend Module 1 (4 lessons) — first end-to-end author→apply→render→score (in progress; result recorded
here once scored).

| course | lessons | authored | applied | scored ≥95 | notes |
|---|---:|---:|---:|---:|---|
| career-backend_engineering | 20 | 20 | 20 | **20** | DONE — avg 96 (96–97), all grounded, none hollow |
| career-concept_maps_real_world_engineering | 30 | 30 | 30 | **30** | DONE — avg 96 (96–97), all grounded, none hollow |
| _(remaining 17 courses)_ | ~340 | — | — | — | queued, course-by-course (same loop) |

**Measured cost per course (backend):** ~3M subagent tokens (author 4+16 lessons + score 20) across ~4 Workflows. The remaining 18 courses scale roughly linearly. Engine proven end-to-end AND at full-course scale.
