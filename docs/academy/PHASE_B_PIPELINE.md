# Phase-B — the visual-first transformation pipeline (scale to every lesson)

> How we re-author the remaining academy lessons VISUAL-FIRST against the locked
> template, one gated loop per lesson, with operator checkpoints per course.
> Reads with [VISUAL_SYSTEM.md](./VISUAL_SYSTEM.md) (the component system) and
> [COURSE_TEMPLATE.md](./COURSE_TEMPLATE.md) (the visual-first doctrine + the
> per-lesson gate). This doc is the *engine*; those two are the *standard*.

## The locked template (the bar every lesson copies)
`career-engineering_judgment_foundation / 03-system-map` — re-authored visual-first
and proven in the real authenticated player at **95** (visual-first 96, text-density
94, pedagogy 95). Source: `scripts/academy/course00/seed-module-1.ts` (`systemMapBlocks`).
Its shape is the reference:
- 14 blocks on the 15-beat arc, collapsed around **three hero visuals** — a `diagram`
  (dagre system map), a `code-walkthrough` (the memo section, stepped), and a
  `compare` (weak-vs-gold). The prose-heavy beats (worked-example / raw code /
  calibration / debug / tradeoff) fold INTO the visuals.
- Prose trimmed to doctrine budgets (mission ≤1–2 sentences, concept ≤~40 words,
  context ≤2 sentences, no wall-of-text block).
- Visual blocks render through `.visualBleed` (wider than the 680px prose column),
  so diagram labels stay legible and code never truncates.

## The scale
~410 lessons across ~20 courses (course 00 = the 16-lesson reference course, done).
The pipeline computes the live work-list from the DB at run time:
`select course_slug, slug, blocks from academy_lessons order by (module_sort, sort)`
and skips lessons already at the bar (tracked in the ledger, below).

## The per-lesson loop (the unit of work — exactly what was run by hand to prove it)
For each lesson, in order:

1. **Read** the lesson's current `blocks` (from its seed array; fall back to the DB
   row if no seed exists yet).
2. **Re-author visual-first** — one agent, the [Re-author prompt](#re-author-prompt-template)
   below. Input: current blocks + the lesson's skill/prereqs + COURSE_TEMPLATE's
   visual-first doctrine + the four block types (`diagram`, `viz`, `code-walkthrough`,
   `compare`). Output: a new `LessonBlock[]` that keeps the pedagogical arc, collapses
   prose-heavy beats into ≥3 hero visuals, and respects the text budgets. It writes
   the new array into the lesson's seed file (NEVER changes the slug or sort).
3. **Gate — static:** `npx tsc --noEmit` → 0, and the seed **dry-run** parses + prints
   the new block sequence (sanity-check ≥3 visuals, budgets, beat order).
4. **Apply:** run the seed with `--apply` (idempotent upsert on `course_slug,slug`).
5. **Render:** `scripts/academy/visual-first/capture-lesson.mjs <course> <lesson>`
   (creds via `ACADEMY_TEST_EMAIL`/`ACADEMY_TEST_PASSWORD` env). It logs in to the real
   player, captures readable top→bottom segments, and asserts **0 horizontal overflow**.
6. **Score — whole lesson:** one panel agent, the [Score prompt](#score-prompt-template).
   It reads ALL segments and scores visual-first / text-density / pedagogy / craft.
7. **Loop:** apply the panel's named fixes (content fixes in the seed; engine fixes in
   the shared visual system — those benefit every lesson) → re-render → re-score, until
   **≥95**. **Decaying-return stop:** after 2 consecutive rounds gaining <+2, stop and
   flag the lesson for human review rather than grind.
8. **Commit:** scoped (`git add` the touched seed + any shared-component fixes; NEVER
   `git add -A`, never `package.json`/`docs/evidence`/`tools` — owned by the concurrent
   process; never push). One commit per lesson (or per coherent module batch).

A lesson is DONE when step 6 says ≥95 on the rendered page. Record it in the ledger.

## Batching, ordering, parallelism (the real constraints)
- **Order:** course-by-course, module-by-module, lesson sort order — so the journey's
  callbacks/forward-pulls stay coherent as you go.
- **Parallelism caveat (important):** lessons in the SAME seed file share one source
  array file — parallel re-authoring of two lessons in one seed file collides. So:
  **parallelize ACROSS seed files (across courses/modules), serialize WITHIN a seed
  file.** A clean Workflow shape: `pipeline(courses, …)` fans out by course; within a
  course, lessons run sequentially (or split each course into one-seed-per-lesson first).
- **Render is the throughput bottleneck** (a real browser login + scroll per lesson).
  Reuse one authenticated context across a course's lessons where possible; cap
  concurrent browsers (~3–4) to avoid thrash.
- **Idempotent throughout:** every step is safe to re-run; a crashed batch resumes from
  the ledger (the lessons already ≥95 are skipped).

## Human checkpoints (where the operator stays in the loop)
- **Per course, not per lesson.** The pipeline transforms a full course, then PAUSES
  and surfaces a sampled set (first lesson, a mid lesson, the capstone) + the course's
  score distribution for sign-off before moving to the next course.
- **Any lesson that can't reach 95** in the decaying-return budget is surfaced (never
  silently shipped below bar, never faked).
- **Engine fixes** the panel demands (e.g. a new shared treatment) pause for a quick
  review since they change every lesson — then resume.
- Irreversible/external actions (push, deploy, deleting content, secrets) always stop.

## Cost model + recommended rollout (honest)
Per lesson ≈ 1 re-author agent + 1–3 score agents (initial + ~2 loop rounds) + render
passes. Across ~410 lessons that is a large, multi-thousand-agent run — real token and
wall-clock cost. Therefore:
1. **Validate the pipeline on one full module first** (the other 3 lessons of course 00),
   confirm it reliably lands ≥95 with the loop, and tune the prompt templates.
2. **Then scale by course**, operator signing off per course.
3. **Execute the fan-out as a Workflow** (multi-agent orchestration) — this needs the
   operator's explicit opt-in; it is NOT started implicitly. The Workflow encodes the
   `pipeline()` above with the per-lesson loop as the stages and the ledger as the
   resume journal.

## Guardrails (non-negotiable)
Prerequisite-correct (never use a concept before its lesson). NEVER change a slug or
sort (learner progress + evidence reference them). Real teaching, not filler. Labs still
genuinely verify. Idempotent seeds. Scoped commits, no push. **Never fake a gate or a
score** — a lesson is "done" only when the panel says ≥95 on the *rendered* page.

## The ledger
Track per-lesson status here (or a sibling `PHASE_B_LEDGER.md`): `course_slug/slug ·
score · date · commit · notes`. The pipeline reads it to skip done lessons and resume.

| course / lesson | score | date | commit | notes |
|---|---|---|---|---|
| career-engineering_judgment_foundation / 01-problem-frame | 96 | 2026-06-29 | — | compare + walkthrough + diagram; 94→96 after engine font bump |
| career-engineering_judgment_foundation / 02-diagnostic-route | 96 | 2026-06-29 | — | diagram + walkthrough + compare; 94→96 after font bump + worked-example fill |
| career-engineering_judgment_foundation / 03-system-map | 95 | 2026-06-29 | 1a018be2 | the locked template (reference) |
| career-engineering_judgment_foundation / 04-retrieval-protocol | 95 | 2026-06-29 | — | capstone; diagram(4-move loop) + walkthrough + compare |

**Module 1 (course 00) — COMPLETE, visual-first, all ≥95.** Validation run confirmed the
loop reliably crosses the bar (94→96 in one loop). Engine improvement landed during the
run: diagram node-label/description fonts bumped (`diagram-kinds.tsx`) — strictly improves
every diagram. Harness hardened to wait for the auth redirect (login no longer races).
Known limit surfaced: the test account throttles after many rapid logins in one batch — the
pipeline must reuse ONE authenticated context per course (already noted under Parallelism).

---

## Re-author prompt template
> Inputs filled per lesson: `{CURRENT_BLOCKS}`, `{LESSON_SKILL}`, `{PREREQS}`, `{SEED_PATH}`, `{BLOCK_ARRAY_NAME}`.

```
Re-author the academy lesson `{BLOCK_ARRAY_NAME}` in `{SEED_PATH}` to be VISUAL-FIRST
against the locked template (career .../03-system-map). OWN ONLY that block array.

Keep the pedagogical arc and the lesson's skill ({LESSON_SKILL}); stay prerequisite-correct
({PREREQS} — never use a concept before its lesson). Then REVERSE text density:
- Collapse prose-heavy beats (worked-example / raw code / calibration / debug / tradeoff)
  INTO >=3 HERO VISUALS using the four block types:
  · `diagram` (layout-free nodes/edges + kinds/tones) for any system/flow/state machine
  · `code-walkthrough` (stepped, line-highlighted) for how-code/an-artifact-works
  · `compare` (weak-vs-gold / before-after / A-vs-B) for any contrast or calibration
  · `viz` (bars/line/area) for any number/trend/tradeoff in data
- The visual is the HERO of its block; text is a tight caption beside it, not prose-then-picture.
- Text budgets: mission <=1-2 sentences, concept <=~40 words, context <=2 sentences,
  no wall-of-text block. Cut every hedge/restatement/throat-clear.
- NEVER change the slug or sort. Keep the assessment beats (quiz/verification/teachback).
Output the new `LessonBlock[]` written into the seed. Run `npx tsc --noEmit` (must be 0).
Do not run --apply/build. Report: new block count, which old beats folded into which visual,
the >=3 visuals, and tsc exit.
```

## Score prompt template
> Inputs: the segment screenshot paths from `capture-lesson.mjs`, the lesson skill, the arc.

```
Senior learning-experience + pedagogy reviewer. Score ONE complete lesson rendered in its
real player from these top->bottom segments: {SEGMENT_PATHS}. Skill: {LESSON_SKILL}. Arc: {ARC}.
Score 1-100 strictly on: A) VISUAL-FIRST (>=3 hero visuals, show-don't-tell, visual is the
hero of its block); B) TEXT DENSITY (budgets respected, scannable, no wall-of-text);
C) PEDAGOGY/ARC (prerequisite-correct, productive-failure pretest, one concept, worked
example, contrast, quiz, verification, teachback, real transfer, coherent journey, sharp
warm voice); D) CRAFT/COHESION (the visuals feel like one system; intentional not templated);
E) graspable from visuals+captions alone. Return ONLY compact JSON:
{"score":<int>,"shipReady":<bool>,"visualFirst":<int>,"textDensity":<int>,"pedagogy":<int>,
"remainingFixes":[{"fix":"...","block":"...","level":"engine|content"}],"oneLineVerdict":"..."}
Strict. 95+ = best-in-class, ships as the locked bar.
```
