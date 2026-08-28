# Academy Program Scorecard

This human-readable ledger mirrors `docs/evidence/academy/program-loop/state.json`. The machine-readable state is
the execution authority; Certification Harness V2 remains the certification-readiness authority.

## Current checkpoint

- Progress: **7/32 local GREEN curriculum checkpoints**.
- Registry: `sha256:6f78a6ac668e99f6369ca567504faadd7dd1be30e99433ad644eb9c7fb23f3d4`.
- Catalog: 32 courses, 640 lessons, 390 lab blocks.
- Current phase: `network-security`.
- Next course: `career-security_identity`.
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

The imported foundation checkpoint is reachable at commit `9d4d71ee`. It proves the local curriculum contract,
not controlled lab trust, expert review, human appeal, or certification.

## Sequential waves

| Wave | Courses | Status |
|---|---:|---|
| Learning judgment and automation foundations | 6 | local GREEN |
| Networking and security | 2 | 1/2 local GREEN — Security selected |
| Data, backend, and system design | 3 | queued |
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

## Current Security baseline

- 20 lessons.
- Deterministic score: 88.9; standard, deep, and capstone learning-loop remediation remains.
- Existing source ledger is present, but expert correctness, pedagogy, accessibility, UX, visual, performance, and
  consistency evidence remains pending.
- Current labs are `not_applicable`; practical threat-model, authorization, secrets, and incident exercises are next.

## Advancement rule

The next course is selected only after a scoped commit carries complete GREEN evidence. A numerical improvement
cannot override a hard fail, pending required review, lab trust limitation, or failed build gate.
