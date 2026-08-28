# Academy Program Scorecard

This human-readable ledger mirrors `docs/evidence/academy/program-loop/state.json`. The machine-readable state is
the execution authority; Certification Harness V2 remains the certification-readiness authority.

## Current checkpoint

- Progress: **9/32 local GREEN curriculum checkpoints**.
- Registry: `sha256:1f9a2c17738c89c931c6ef6c8d7a0a6ef50dfc8648b9b010ed45c585ec3fc145`.
- Catalog: 32 courses, 640 lessons, 410 lab blocks.
- Current phase: `data-backend`.
- Next course: `career-backend_engineering`.
- Certification: 0 courses certified; lab evidence remains practice-only.

## Proven foundation checkpoints

| Course | Local curriculum checkpoint | Certification |
|---|---|---|
| `career-engineering_judgment_foundation` | GREEN | uncertified |
| `programming-fundamentals` | GREEN | uncertified |
| `python-basics` | GREEN | uncertified |
| `git-the-terminal` | GREEN | uncertified |
| `data-structures` | GREEN | uncertified |
| `career-programming_cs_foundations` | GREEN | uncertified |
| `career-networking_fundamentals_advanced_networking` | GREEN | uncertified |
| `career-security_identity` | GREEN | uncertified |
| `career-databases_data_modeling` | GREEN | uncertified |

The imported foundation checkpoint is reachable at commit `9d4d71ee`. It proves the local curriculum contract,
not controlled lab trust, expert review, human appeal, or certification.

## Sequential waves

| Wave | Courses | Status |
|---|---:|---|
| Learning judgment and automation foundations | 6 | local GREEN |
| Networking and security | 2 | local GREEN |
| Data, backend, and system design | 3 | 1/3 local GREEN — Backend selected |
| Cloud operations and platform reliability | 3 | queued |
| Applied AI, retrieval, agents, and evaluation | 5 | queued |
| Production integration | 1 unique remaining graph course | queued |
| Registry courses outside the flagship graph | 12 | queued |

`system-design` appears in two graph phases but only once in the 32-course execution queue.

## Networking checkpoint result

- 20 lessons.
- Deterministic score: 77.8 → 88.9 (not a composite quality score).
- Complete mastery-loop sections and novice-scaffolded deterministic practice now cover all 20 lessons.
- All 20 reference implementations pass exact output contracts; the final incident runbook is a capstone.
- H1/H3/H4/H5 remain zero. The 20 H2 flags preserve the correct untrusted-runtime boundary.
- Required expert/human evidence remains pending for correctness, pedagogy, sources, accessibility, visual quality,
  UX, performance, and consistency.

## Security checkpoint result

- 20 lessons.
- Deterministic score: 88.9 → 100 (not a composite quality score).
- Complete evidence-first mastery loops and novice-scaffolded deterministic practice now cover all 20 lessons.
- All 20 reference implementations pass exact output contracts; the multi-tenant export defense remains a capstone.
- The 26-source authoritative ledger remains intact. H1/H3/H4/H5 are zero; 20 H2 flags preserve the untrusted-runtime boundary.
- Required expert/human evidence remains pending for correctness, pedagogy, sources, accessibility, visual quality,
  UX, performance, and consistency.

## Databases checkpoint result

- 20 lessons in the canonical registry.
- Deterministic score: 77.8 → 98.3 (not a composite quality score).
- All 20 original SQL labs remain intact; all references now execute in the declared SQL runtime and match exact output.
- Complete mastery loops, two capstones, a 16-source official ledger, and explicit graph mappings cover all lessons.
- H1/H3/H4/H5 are zero; 20 H2 flags keep lab evidence practice-only and required expert reviews remain pending.

## Current Backend baseline

- 20 lessons in the canonical registry; the next task packet is selected from Certification Harness V2.
- Existing labs remain practice-only and certification remains blocked pending controlled evaluation and required reviews.

## Advancement rule

The next course is selected only after a scoped commit carries complete GREEN evidence. A numerical improvement
cannot override a hard fail, pending required review, lab trust limitation, or failed build gate.
