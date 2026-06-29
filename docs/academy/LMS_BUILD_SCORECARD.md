# LMS Build Scorecard — the autonomous loop's ledger

> Driven by [LMS_BUILD_PROGRAM.md](./LMS_BUILD_PROGRAM.md). The loop reads this, builds the next unblocked task,
> gates it, scoped-commits, and updates the row. Source (read-only): `/Users/Sage/AI_CAREER_OPERATING_SYSTEM` —
> 21 courses · 105 modules · 286 lessons (13 written, 8 scaffolded).

## Step 2 — Skeleton ingest (do first: gives the rails real data)
| Task | status |
|---|---|
| `ingest-career-os.ts` — 21 manifests + modules/lessons → academy_courses + academy_lessons stubs | **in progress** |
| Apply + verify catalog shows 21 courses, each walkable to module→lesson | pending |

## Step 1 — The rails (IA consolidation + scaling)
| Task | status |
|---|---|
| Retire/redirect legacy `/[track]/*` → canonical Courses; fold `my-courses` into catalog | pending |
| Menu rename Home·Courses·My Path·Practice·Profile + fix `active` keys + breadcrumbs | pending |
| Catalog groups 21 courses by domain + prereq order (00 gates) | pending |
| Lesson left-rail → collapsible Module→Lesson tree (the course side-menu) | pending |
| Promote ContentMap → first-class `/progress` "My Path" map | pending |
| Mount responsive mobile bottom TabBar (top bar ≥ md, bottom tabs < md) | pending |

## Step 3 — Tutor KB ingest (after skeleton)
| Task | status |
|---|---|
| Run KB pipeline over ingested lessons so Sage Tutor answers on the material | pending |

## Step 4 — Phase-B world-class transformation (long loop; PAUSE at each course)
| Course | lessons | status |
|---|---|---|
| 00 engineering_judgment_foundation (entry gate) | 16 | pending — do first |
| 00a concept_maps | 30 | pending |
| 01 programming_cs_foundations | 20 | pending |
| 02–19 (the rest) | ~220 | pending |

## Loop status
**Next:** build + apply the skeleton ingest → then the rails. Autonomy bounds (LMS_BUILD_PROGRAM §): build/gate/
commit autonomously; PAUSE at step + course boundaries, taste calls, irreversible/external actions, stuck gates;
never push / never fake a gate / source is read-only.
