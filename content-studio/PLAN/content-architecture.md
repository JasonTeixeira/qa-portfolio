# Sage Academy — Content Architecture (the university map)

**Purpose:** the living skeleton for the YouTube channel + academy. Every track = one
YouTube **playlist** = one academy **course**. One curriculum, two front doors.
Build into it, iterate, adapt. Quality first; breadth over time.

## Format tiers (same render engine, any length)
| Tier | Length | Job | Cadence target |
|------|--------|-----|----------------|
| **Flagship longform** | 6–12 min | the real lesson; searchable library; academy funnel | the 500+ core |
| **Standard** | 3–6 min | one concept, one mechanism | fills tracks |
| **Short (9:16)** | 20–50s | discovery; derived from a flagship beat | 1–2 per flagship |

## The 7 schools · ~32 tracks
Each track lists: scope · target video count (grow-into) · maps to a playlist + course.

### School I — AI & ML Engineering  *(the wedge — lead here)*
1. **AI Engineering** — RAG, agents, evals, tool-use, guardrails · ~40
2. **LLM Internals** — tokens, attention, transformers, inference, quantization · ~30
3. **Prompt & Context Engineering** — prompting, context windows, structured output · ~25
4. **ML Systems / MLOps** — training, serving, feature stores, drift, rollback · ~35
5. **Applied ML** — embeddings, vector search, recommenders, ranking · ~30

### School II — Systems & Architecture
6. **System Design** — load balancing, caching, sharding, queues, consistency · ~50
7. **Distributed Systems** — consensus, CAP, partitioning, clocks, replication · ~35
8. **Databases** — indexes, transactions, query plans, isolation, storage · ~40
9. **Scalability & Performance** — profiling, latency, concurrency, memory · ~35
10. **Networking** — HTTP, DNS, TCP/QUIC, gRPC, TLS, CDNs · ~30

### School III — Backend & Craft
11. **Backend Craft** — idempotency, retries, timeouts, migrations · ~40
12. **API Design** — REST, GraphQL, gRPC, versioning, pagination · ~30
13. **Concurrency & Async** — threads, locks, actors, event loops · ~25
14. **Testing & Quality** — unit/integration/e2e, TDD, mutation, coverage · ~30
15. **Clean Code / Refactoring** — smells, patterns, boundaries, naming · ~25

### School IV — Infra & Ops
16. **DevOps & CI/CD** — pipelines, artifacts, gates, blue-green, canary · ~30
17. **Cloud & Infrastructure** — containers, k8s, IaC, autoscaling · ~35
18. **Observability & SRE** — logs, metrics, traces, SLOs, incidents · ~30
19. **Security Engineering** — authz, secrets, injection, threat modeling · ~35
20. **Cost / FinOps** — cost models, right-sizing, egress, caching economics · ~15

### School V — Data
21. **Data Engineering** — pipelines, batch/stream, orchestration · ~30
22. **Data Warehousing & Analytics** — modeling, OLAP, query engines · ~25
23. **Event-Driven Architecture** — messaging, Kafka, CDC, sagas · ~25

### School VI — Foundations & CS Core
24. **Data Structures & Algorithms** — the practical, judgment version · ~45
25. **Operating Systems** — processes, memory, files, scheduling · ~30
26. **Computer Architecture** — caches, pipelines, memory hierarchy · ~20
27. **CS Theory (applied)** — complexity, automata, why-it-matters · ~20

### School VII — Career & Judgment  *(the "senior" moat)*
28. **The Interview** — system-design + coding patterns (→ Interview Academy) · ~40
29. **Senior Judgment** — tradeoffs, war stories, "why we chose X" · ~35
30. **Career / Staff+** — scope, influence, technical leadership · ~25
31. **Building in Public** — product engineering, shipping, this-channel's-own-build · ~20
32. **Foundations of Great Engineers** — mental models, learning how to learn · ~15

**Total capacity: ~32 tracks · ~980 flagship videos + ~1,000 derived Shorts.**

## Launch sequence (quality first, expand track-by-track)
- **Wave 0 (proof):** AI Engineering — RAG flagship ✅ (built). Ship 5 more in this track.
- **Wave 1 (the wedge):** go deep in **School I** (AI Eng, LLM Internals, Prompt Eng) + **System Design** + **Backend Craft** — 5 tracks, ~10–15 flagships. This is the differentiated, trending, high-value core.
- **Wave 2:** add Databases, Distributed Systems, Observability, Security, The Interview.
- **Wave 3+:** fill remaining tracks as the library and audience grow.

## Rules that keep it a university, not a feed
- Every video belongs to exactly one track (playlist + course). No orphans.
- A track ships in a coherent order (a real syllabus), not random uploads.
- Flagship first; its Short is derived, never the other way around.
- Cross-link: video → free lesson → paid course → "we build it for you." One brand, two doors.
- Naming stays consistent per track so the channel reads as departments.

## Maps to (already built)
- Render engine + warehouse generators → every video, any length.
- `launch-slate.md` = the first concrete videos (folds into Wave 0/1 tracks above).
- Academy ↔ YouTube double-duty: each flagship = the course lesson.
