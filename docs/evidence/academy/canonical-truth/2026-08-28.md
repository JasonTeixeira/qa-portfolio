# Sage Academy Canonical Truth Baseline

**Observed:** 2026-08-28
**Registry:** `sha256:a7ea7bd1254fe356076d0d6f6e4d00729b2f7ff16069639bc818f348f774efc6`
**Scope:** repository authoring corpus and checked-in evidence only; live database state was not mutated or asserted.

## Defensible inventory

- 32 registered course bundles
- 640 authored lessons
- 580 lab blocks
- 588 solution entries
- 527 lab lessons with same-slug solutions
- 53 lab lessons without same-slug solutions
- 19 course-level source ledgers
- 0 certified courses

## Known contradictions and launch blockers

- 32 authored course bundles versus 23 courses represented in the legacy manifest
- 640 authored lessons versus 456 lessons represented in the legacy manifest
- 53 lab lessons lack same-slug solution entries
- 13 courses lack course-level source ledgers
- Current lab output-substring evidence is not eligible for mastery or certification
- No course is certified by Academy Certification Harness V2

## Course inventory

| Course | Lessons | Legacy manifest | Labs | Labs missing solutions | Source ledger | Certification |
|---|---:|---:|---:|---:|---|---|
| `career-engineering_judgment_foundation` | 16 | 16 | 16 | 0 | no | uncertified |
| `career-concept_maps_real_world_engineering` | 30 | 30 | 30 | 0 | yes | uncertified |
| `programming-fundamentals` | 18 | 18 | 18 | 7 | no | uncertified |
| `career-programming_cs_foundations` | 20 | 20 | 20 | 0 | no | uncertified |
| `python-basics` | 12 | 12 | 12 | 0 | no | uncertified |
| `git-the-terminal` | 20 | 0 | 20 | 20 | no | uncertified |
| `data-structures` | 20 | 0 | 20 | 0 | no | uncertified |
| `career-backend_engineering` | 20 | 20 | 20 | 0 | yes | uncertified |
| `career-frontend_fullstack` | 20 | 20 | 20 | 0 | yes | uncertified |
| `career-architecture_system_design` | 20 | 20 | 20 | 0 | yes | uncertified |
| `system-design` | 24 | 0 | 24 | 0 | yes | uncertified |
| `career-security_identity` | 20 | 20 | 20 | 0 | yes | uncertified |
| `career-mobile_engineering_deep_dive` | 20 | 20 | 20 | 0 | yes | uncertified |
| `career-qa_sdet_test_automation_engineering` | 20 | 20 | 20 | 0 | yes | uncertified |
| `career-networking_fundamentals_advanced_networking` | 20 | 20 | 20 | 0 | no | uncertified |
| `career-ux_ui_product_design_for_engineers` | 20 | 20 | 20 | 0 | yes | uncertified |
| `career-databases_data_modeling` | 20 | 20 | 20 | 0 | yes | uncertified |
| `career-data_engineering_analytics` | 20 | 20 | 20 | 0 | no | uncertified |
| `career-ai_engineering_rag_eval` | 20 | 20 | 20 | 0 | yes | uncertified |
| `the-llm-api` | 20 | 0 | 20 | 0 | yes | uncertified |
| `prompt-engineering` | 20 | 0 | 20 | 0 | yes | uncertified |
| `rag-retrieval` | 20 | 0 | 20 | 0 | yes | uncertified |
| `agents-tool-use` | 20 | 0 | 20 | 0 | yes | uncertified |
| `career-cloud_devops_operations` | 20 | 20 | 20 | 0 | yes | uncertified |
| `career-observability_reliability_performance` | 20 | 20 | 20 | 0 | yes | uncertified |
| `career-platform_engineering_internal_developer_platforms` | 20 | 20 | 20 | 0 | yes | uncertified |
| `career-enterprise_it_saas_admin_business_systems` | 20 | 20 | 0 | 0 | no | uncertified |
| `nextjs-supabase` | 20 | 0 | 20 | 20 | no | uncertified |
| `stripe-auth` | 20 | 0 | 20 | 6 | no | uncertified |
| `career-interview_career_portfolio` | 20 | 20 | 0 | 0 | no | uncertified |
| `career-product_execution_market_feedback` | 20 | 20 | 20 | 0 | yes | uncertified |
| `career-engineering_leadership_staff_execution` | 20 | 20 | 0 | 0 | no | uncertified |

## Authority boundary

- `data/academy/registry.config.json` owns canonical course identity, title, topic, level, lifecycle state, and aliases.
- `data/academy/authoring/*.lessons.json` owns authored lesson content.
- `data/academy/registry.json` is the deterministic generated snapshot consumed by application and audit adapters.
- `data/academy/authoring/manifest.json` is compatibility-only during migration and cannot define a course by itself.
- Supabase is a runtime projection. Publication state must be reconciled read-only before cutover and is not inferred here.
