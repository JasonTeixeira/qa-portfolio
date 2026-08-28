# Academy Program Scorecard

This human-readable ledger mirrors `docs/evidence/academy/program-loop/state.json`. The machine-readable state is
the execution authority; Certification Harness V2 remains the certification-readiness authority.

## Current checkpoint

- Progress: **6/32 local GREEN curriculum checkpoints**.
- Registry: `sha256:316bd5e02d538190890016de1bbf1b3087f543bdec04ec7f0fc7093616387ff0`.
- Catalog: 32 courses, 640 lessons, 370 lab blocks.
- Current phase: `network-security`.
- Next course: `career-networking_fundamentals_advanced_networking`.
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

The imported foundation checkpoint is reachable at commit `9d4d71ee`. It proves the local curriculum contract,
not controlled lab trust, expert review, human appeal, or certification.

## Sequential waves

| Wave | Courses | Status |
|---|---:|---|
| Learning judgment and automation foundations | 6 | local GREEN |
| Networking and security | 2 | in progress — Networking selected |
| Data, backend, and system design | 3 | queued |
| Cloud operations and platform reliability | 3 | queued |
| Applied AI, retrieval, agents, and evaluation | 5 | queued |
| Production integration | 1 unique remaining graph course | queued |
| Registry courses outside the flagship graph | 12 | queued |

`system-design` appears in two graph phases but only once in the 32-course execution queue.

## Current Networking baseline

- 20 lessons.
- Deterministic score: 77.8 (not a composite quality score).
- Decision: `needs_remediation`.
- Primary deterministic gap: the standard learning loop is incomplete across the course.
- Required expert/human evidence remains pending for correctness, pedagogy, sources, accessibility, visual quality,
  UX, performance, and consistency.
- Current labs: `not_applicable`; practical packet-analysis and diagnostic exercises must still be authored and tested.

## Advancement rule

The next course is selected only after a scoped commit carries complete GREEN evidence. A numerical improvement
cannot override a hard fail, pending required review, lab trust limitation, or failed build gate.
