# Academy content audit — verified state (2026-06-29)

> Ground truth from the live DB (`academy_lessons` / `academy_courses`) + the source
> curriculum on disk. No estimates. Every number below is countable from the database.
> Re-run the audit: the query in this doc's "How this was measured" section.

## The headline (verified)

**23 courses · 448 lessons. 34 done · 414 not done.**

| State | Definition (countable) | Courses | Lessons |
|---|---|---:|---:|
| **DONE** | authored (≥8 blocks) AND visual-first (≥3 real visual blocks: diagram/viz/code-walkthrough/compare), render-verified ≥95 | **2** | **34** |
| **NOT DONE** | skeleton — avg ~2 blocks (a templated `context` + a "skeleton, in production" `callout`); no lesson content, no visuals | **21** | **414** |

We have genuinely built **~7.6%** of the platform's lessons. The two finished courses are real and high quality; the other 21 courses are empty scaffolds.

## DONE — the 2 real courses (34 lessons, all visual-first, render-verified ≥95)
- `programming-fundamentals` — 18 lessons (2 modules). All ≥3 visuals, avg ~16 blocks.
- `career-engineering_judgment_foundation` (Course 00) — 16 lessons (4 modules). All ≥3 visuals, avg ~15 blocks.

## NOT DONE — the 21 skeleton courses (414 lessons)
Every lesson averages ~2 blocks and is a stub. List (course_slug · lessons):

| lessons | course |
|---:|---|
| 30 | `career-concept_maps_real_world_engineering` |
| 20 | `career-programming_cs_foundations` |
| 20 | `career-backend_engineering` |
| 20 | `career-frontend_fullstack` |
| 20 | `career-databases_data_modeling` |
| 20 | `career-cloud_devops_operations` |
| 20 | `career-architecture_system_design` |
| 20 | `career-ai_engineering_rag_eval` |
| 20 | `career-data_engineering_analytics` |
| 20 | `career-security_identity` |
| 20 | `career-observability_reliability_performance` |
| 20 | `career-interview_career_portfolio` |
| 20 | `career-product_execution_market_feedback` |
| 20 | `career-mobile_engineering_deep_dive` |
| 20 | `career-qa_sdet_test_automation_engineering` |
| 20 | `career-networking_fundamentals_advanced_networking` |
| 20 | `career-ux_ui_product_design_for_engineers` |
| 20 | `career-platform_engineering_internal_developer_platforms` |
| 20 | `career-engineering_leadership_staff_execution` |
| 20 | `career-enterprise_it_saas_admin_business_systems` |
| 4 | `python-basics` |

## The good news — there is a rich SOURCE curriculum (so this is NOT from-scratch)
The skeletons were bulk-ingested by `scripts/academy/ingest-career-os.ts`, which read the real
curriculum at `/Users/Sage/AI_CAREER_OPERATING_SYSTEM/courses/<NN>_<slug>/` but only extracted a
one-paragraph summary into each stub. The **full per-lesson source** lives at:

```
/Users/Sage/AI_CAREER_OPERATING_SYSTEM/courses/<NN>_<slug>/modules/<MM>_module_M/lessons/<lesson>.md
```

Each source `.md` is structured with sections that map almost 1:1 to our 14-block visual-first arc:
`Goal` → sprint-contract · `Diagnose` → pretest · `Orient` → context · `Model` (weak vs gold) →
concept + **compare** · `Build` → code-walkthrough/lab · `Break` → debug · `Decide` → tradeoff ·
`Prove` → verification · `Explain` → teachback · `Transfer` → transfer · `Space` → spaced-review,
plus a **"Media And Diagram Hook"**, a **"Worked Expert Example"**, "Domain-Specific Vocabulary",
"Reviewer Challenge", and **"Standards Grounding"** (real external anchors, e.g. SWEBOK V4).

**Implication:** finishing the platform is a *grounded source→visual-first transform* per lesson
(content + diagram hooks come from the source md), not invention — the same job we proved on the
System Map lesson, at 414× scale. Anti-filler risk is low because every lesson is anchored to real
source + external standards.

## What "done" requires (per lesson)
Author a full 14-block visual-first lesson from the source md: ≥3 hero visuals (diagram from the
Media/Diagram hook; code-walkthrough or lab from Build; compare from Model weak-vs-gold), prose to
budget, the assessment beats, prerequisite-correct ordering — then render-verify ≥95. See
[AUTHORING_PROGRAM.md](./AUTHORING_PROGRAM.md) for the engine + the systematic autonomous run.

## How this was measured (reproducible)
A throwaway script queried every `academy_lessons` row, counted `blocks.length` and the number of
blocks whose `type` ∈ {diagram, viz, code-walkthrough, compare}, and classified: authored = ≥8
blocks; visual-first = ≥3 visual blocks; skeleton = <8 blocks. Course titles from `academy_courses`.
