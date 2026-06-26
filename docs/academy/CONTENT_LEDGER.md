# Sage Academy — Content Ledger (the ingestion backlog)

> The single backlog for [CONTENT_LOOP.md](./CONTENT_LOOP.md). The loop reads this,
> takes the next `PENDING` lesson under the active course, and marks it `DONE` when
> all gates + review pass. Source: `/Users/Sage/engineering-mastery-system`.
>
> Status: `DONE` (gated + reviewed + committed) · `WIP` · `PENDING` · `🔒` (needs source authored).

## Current focus
**Active course → `programming-fundamentals`** (topic `engineering`).
Next lesson → **`testing-and-debugging`** (PENDING). Done: lessons 1–6 (input-validation → files-and-io).

## Active course: Programming Fundamentals (`programming-fundamentals`)
Source: `01-programming-fundamentals/README.md` (9 clusters) + the matching `concepts/deep-nodes/*`.
Intensity: `standard`. Each cluster → one lesson.

| # | Lesson slug | Cluster | Source node | Status |
|---|---|---|---|---|
| 1 | `input-validation` | Input validation | `deep-nodes/input-validation.md` | **DONE** (content gate ✓, renders ✓) |
| 2 | `error-handling` | Error handling | `deep-nodes/error-handling.md` | **DONE** (content gate ✓, render ✓, 2-agent senior QA ✓) |
| 3 | `functions-and-modules` | Functions & modules | cluster + std CS | **DONE** (content gate ✓, typecheck ✓, lab determinism ✓, 2-agent senior QA ✓; ⚠ browser-render reverify pending — dev `.next` cache corrupted by a concurrent Next process) |
| 4 | `types-and-data` | Types | cluster + std CS | **DONE** (content gate ✓, typecheck ✓, lab determinism ✓; 2-agent audit + render → batch) |
| 5 | `control-flow` | Data & control flow | cluster + std CS | **DONE** (content gate ✓, typecheck ✓, lab determinism ✓; 2-agent audit + render → batch) |
| 6 | `files-and-io` | Files & I/O | cluster + std CS | **DONE** (content gate ✓, typecheck ✓, lab determinism ✓; 2-agent audit + render → batch) |
| 7 | `testing-and-debugging` | (craft) testing/debug | `deep-nodes/testing-strategy.md` | PENDING |
| 8 | `cli-workflow` | CLI workflow | `deep-nodes/cli-safety.md` | PENDING |
| 9 | `git-fundamentals` | Git fundamentals | cluster + std CS | PENDING |

**Course exit gate:** all 9 `DONE` + a final content-review pass over the whole course.

## Next courses (in ledger order)
Each numbered mastery track → one flagship course. Build after the active course is done.

| Order | Course (slug) | Topic | Source track | Lessons from | Status |
|---|---|---|---|---|---|
| 1 | `programming-fundamentals` | engineering | `01-programming-fundamentals` | 9 clusters | **WIP (6/9)** |
| 2 | `core-engineering-scenarios` | engineering | `scenario-pipelines/` (core 1–10) | 10 pipelines (System Is Slow first) | PENDING |
| 3 | `dsa-patterns` | engineering | `02-dsa-leetcode-patterns` + `deep-nodes/dsa-pattern-recognition.md` | pattern bank | PENDING |
| 4 | `software-craft` | engineering | `03-software-craft` + `deep-nodes/{code-review,testing-strategy}.md` | clusters | PENDING |
| 5 | `web-api-backend` | engineering | `04-web-api-backend` + `deep-nodes/{api-contracts,tcp-http-networking}.md` | clusters | PENDING |
| 6 | `data-databases` | data | `05-data-databases` + `deep-nodes/{transactions-isolation,sharding-partitioning}.md` | clusters | PENDING |
| 7 | `distributed-systems` | engineering | `07-distributed-systems` + `deep-nodes/{consensus-leader-election,backpressure}.md` | clusters | PENDING |
| 8 | `cloud-devops` | ship-it | `08-cloud-devops-reliability` + `deep-nodes/{ci-cd-release-engineering,kubernetes-operations}.md` | clusters | PENDING |
| 9 | `security` | engineering | `09-security` + `deep-nodes/{threat-modeling,injection-prevention,authorization}.md` | clusters | PENDING |
| 10 | `ai-ml-engineering` | ai-engineering | `11-ai-ml-engineering` + `deep-nodes/{rag-systems,model-serving,ai-evaluations}.md` | clusters | PENDING |
| 11 | `architecture-system-design` | engineering | `12-architecture-system-design` + `scenario-pipelines/` (senior) | clusters + pipelines | PENDING |
| … | (tracks 06,10,13,14,15,16) | — | remaining tracks | clusters | PENDING |

## Shared banks → engine layers (reused, not re-authored)
- `retrieval/` (740 prompts) → FSRS review cards + course quiz banks (by domain).
- `socratic/` (150 sets) → `teachback` prompts + `quiz` blocks.
- `concepts/deep-nodes/` (60) → the grounding for `concept` + `worked-example` + `debug`.
- `capstones/` → course capstone lessons (`capstone` intensity) once a track's lessons exist.
- `proof-artifacts/` → the academy portfolio + `transfer` tasks.

## Rules
- One lesson per pass; mark `DONE` only after the full pipeline (gate + render + review + commit).
- Keep this table the single source of truth; update it every pass.
- A course's `level` follows its track depth (fundamentals = Beginner; senior scenarios = Advanced).
- 🔒 a row only when its source genuinely needs the operator to author more — don't fabricate.
