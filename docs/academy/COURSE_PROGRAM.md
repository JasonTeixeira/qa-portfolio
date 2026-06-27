# Sage Academy — World-Class First Course: Programming Fundamentals (Python)

> The course-build program (parallels [ENGAGEMENT_PROGRAM.md](./ENGAGEMENT_PROGRAM.md)). Audience: **absolute
> beginner → ships real code**. Labs: in-browser Python (Pyodide, $0, already wired). Authoring source:
> `scripts/academy/seed-programming-fundamentals.ts` (Module 2) + `scripts/academy/seed-first-steps.ts` (Module 1, new).

## The gap this closes
The existing 9 lessons are genuinely strong but pitched at "can already write functions" (lesson 1 is *write a
validator that rejects hostile input*). An absolute beginner can't start there. World-class here = add a
**First Steps** on-ramp module to the same standard, then the existing **Foundations / craft** module reads as
the level-up. Slugs of existing lessons are unchanged (learner progress/evidence reference slugs) — only
`module_title` + `sort` shift.

## Structure
- **Module 1 · First Steps** (NEW, ~8 lessons, sort 0–7): your-first-program · variables-and-values ·
  numbers-and-strings · booleans-and-logic · lists · loops · functions-basics · build-a-tiny-program (ship).
- **Module 2 · Foundations** (the existing 9, sort 8–16, module relabelled): input-validation → … → git.

## The per-lesson quality bar (every First Steps lesson must hit ALL)
A world-class lesson is a deliberate sequence, not a block dump:
1. `sprint-contract` — the concrete outcome + the proof + what NOT to claim.
2. `mission` + `context` — a real, vivid reason this matters (a stake, not "in this lesson we will").
3. `pretest` — activate prior intuition with a reveal (productive failure before instruction).
4. `concept` — the mental model, plain-language, one idea.
5. `worked-example` — fully worked, with the **common mistake** named.
6. `code` — a clean, runnable canonical snippet.
7. `callout` (tip/note) — the one thing pros know that beginners miss.
8. `lab` — a Pyodide exercise with `starter` + a `check` harness that genuinely verifies the skill (the win).
9. `debug` — a broken version; the learner finds + fixes the bug.
10. `quiz` — one sharp check-for-understanding with an explanation.
11. `verification` + `teachback` + `transfer` — prove it, say it back, apply it elsewhere.
12. `spaced-review` — seeds the FSRS recall prompt.
Voice: sharp, practical, opinionated, kind. No filler. Beginner-correct (never assume an unseen concept).

## The per-lesson gate (GREEN = ship the lesson)
- The lesson seeds idempotently (upsert on course_slug+slug); `npx tsc` 0; the seed script type-checks.
- It RENDERS in the lesson player (screenshot the live page) with every block intact.
- The lab `starter` runs and the `check` passes for a correct solution + fails for the starter (lab is real).
- a11y on the lesson page (0 serious/critical); enforcement + journey e2e still green.
- A pedagogy review (design/teaching reviewer) scores the lesson ≥95 for an absolute beginner (clarity,
  motivation, correctness, the guaranteed win, no unexplained leaps) — loop the named fixes until ≥95.

## The loop
For each First Steps lesson in order: author (in `seed-first-steps.ts`, matching the existing format/voice) →
seed → gate → pedagogy review → loop-until-≥95 → commit. Then re-sort/relabel the existing module (one
migration of module_title+sort, slugs untouched). DONE when all ~8 First Steps lessons are ≥95 + the full
course reads as one coherent beginner→ship arc + the assessment (pre/post) spans both modules.

## Guardrails
Beginner-correct (no concept used before it's taught). Labs must genuinely verify (no theatre checks). Content
is real teaching, not LLM filler. Idempotent seeds, scoped commits, no push. Honest: a lesson isn't "world-class"
until the pedagogy review says so on the rendered page.
