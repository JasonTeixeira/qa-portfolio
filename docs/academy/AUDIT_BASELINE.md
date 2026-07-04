# Course-content integrity baseline (2026-07-03)

First full run of the Master Course Auditor (`~/course-auditor-harness`) across **all 23 authored sageideas.dev career courses** (460+ lessons). Exporter: `scripts/academy/audit-export.mjs` (Supabase block-JSON → markdown → auditor). Runs local + offline + free.

## How to read this
- **Scores are uniformly low (21–36) because NONE of these courses have a source ledger yet.** That is expected — sageideas.dev's career courses have never had `sources.json`. Low score = "unsourced," NOT "wrong."
- **The auditor OVER-EXTRACTS prose as "claims"** (a known calibration issue from the Nexural evidence-ledger program — it flags teaching sentences like *"guarding a door whose lock never latched"* as critical claims). So the **17,305 total / 1,066 "critical" counts are inflated** — many are pedagogical prose, not citable facts. Some `####`/code-fence markers also bleed into claim text (exporter artifact).
- **Therefore: treat this as a directional PRIORITY MAP, not a pass/fail or a literal fact count.** The ranking (which courses carry the most factual-claim density) is the trustworthy signal.

## Ranked by claim-risk exposure (crit×3 + high) — the sourcing priority order
| Rank | Course | domain | score | claims | crit | high |
|---|---|---|---|---|---|---|
| 1 | security_identity | security | 21 | 784 | 43 | 313 |
| 2 | backend_engineering | coding | 33 | 771 | 98 | 138 |
| 3 | ai_engineering_rag_eval | ai | 21 | 752 | 46 | 281 |
| 4 | concept_maps_real_world_engineering | tech | 29 | 1209 | 58 | 121 |
| 5 | databases_data_modeling | tech | 31 | 789 | 76 | 64 |
| 6 | mobile_engineering_deep_dive | coding | 28 | 800 | 59 | 102 |
| 7 | platform_engineering_internal_developer_platforms | tech | 28 | 760 | 38 | 157 |
| 8 | cloud_devops_operations | tech | 36 | 782 | 59 | 75 |
| 9 | architecture_system_design | tech | 28 | 832 | 51 | 93 |
| 10 | data_engineering_analytics | coding | 30 | 733 | 52 | 82 |
| … | (11–21: frontend, ux_ui, observability, enterprise_it, qa_sdet, networking, programming_cs, engineering_judgment, product_execution, leadership, interview) | tech/coding | 28–32 | ~750–860 | 21–55 | 22–74 |
| 22 | programming-fundamentals | coding | 31 | 411 | 26 | 7 |
| 23 | python-basics | coding | 34 | 138 | 12 | 1 |

**Totals:** 23 courses · 17,305 extracted claims · 1,066 critical-risk · 1,948 high-risk — ALL currently unsupported (no sources).

## Recommendation
Do NOT chase the auditor score (over-extracts prose). Instead apply the **proven EVIDENCE_LEDGER pattern** (from the Nexural fact-critical program): for the top fact-dense, high-stakes courses — **security_identity, backend_engineering, ai_engineering_rag_eval, databases, networking, cloud** — hand-build web-verified Tier-1 source ledgers for the genuinely load-bearing factual claims (versions, protocols, standards, numbers), not the pedagogical prose. This is what earns the "proof, not paper" positioning: our own content must be defensible.

Skill/practice-heavy courses (interview, leadership, product, python-basics) carry few hard factual claims and are low priority for sourcing.

## Sourcing progress — evidence ledgers (docs/academy/evidence/<course>/)
Web-verified Tier-1/2 source ledgers, built by fetching every source live (WebFetch, 2026-07-03) — zero fabrication. Each = `sources.json` (auditor format) + `EVIDENCE_LEDGER.md` (claim→source→verdict).

| Course | claims | VERIFIED | QUALIFIED | CORRECTED | defects |
|---|---|---|---|---|---|
| security_identity | 26 | 21 | 5 | 0 | **0** |
| backend_engineering | 26 | 22 | 4 | 0 | **0** |
| ai_engineering_rag_eval | 20 | 11 | 9 | 0 | **0** |
| **top-3 total** | **72** | **54** | **18** | **0** | **0** |

**Headline: the top-3 fact-critical courses are factually solid — 0 defects across 72 load-bearing claims** checked against real OWASP / NIST / IETF-RFC / PostgreSQL / AWS / OpenAI-Anthropic / arXiv sources. QUALIFIED = true-with-caveats or emerging-practice (no settled standard), not wrong. The courses consistently pre-hedge their own over-attributions honestly.

**Key mechanism note:** dropping `sources.json` into the auditor does NOT auto-lift its score — keyword-matched sources become `candidate_evidence_needs_human_review`, not `verified` (conservative by design), and its `contradicted_by_source_excerpt` flags are matching artifacts (it flags code + correct sentences). So the **EVIDENCE_LEDGER is the proof, not the auditor score** — consistent with the Nexural finding. Next priority courses (unsourced): concept_maps, databases, mobile, platform, cloud.

## Reproduce
```
node scripts/academy/audit-export.mjs <course-slug> ~/course-auditor-harness/exports/<slug>
cd ~/course-auditor-harness && python3 -m course_auditor audit exports/<slug> --domain <security|ai|coding|tech> --output-dir audit-output/<slug>
```
Artifacts (claim/source/assessment ledgers + report) land in `~/course-auditor-harness/audit-output/<slug>/`.
