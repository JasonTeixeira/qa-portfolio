# Academy Quality Standard — the 99+ Contract

**Status:** canonical. This document defines what "99+ appeal for humans" *means* for
Sage Academy, in terms a harness can measure and a human can sign off. Nothing ships
as "done" without a passing scorecard against this rubric. If a check here can't be
run, the unit is **not** at 99 — it is unverified.

> The honest boundary: the harness certifies the **measurables** to ≥99 and catches
> every regression. It does **not** certify taste. "Appeal" is closed by a human
> sample sign-off per phase (see §6). Any claim of "99+" that skips the human sample
> is theater.

---

## 1. Unit of measure

A **unit** is one of:
- **lesson** — the atomic scored artifact (blocks, labs, diagrams, optional voice).
- **course** — aggregate of its lessons + course-level assets (cover, description, arc).
- **screen** — a non-lesson surface (onboarding, dashboard, certificate, landing).

The harness scores lessons, rolls them up to a course score, and scores screens
independently. A course passes only when **every** lesson passes and the course-level
checks pass.

## 2. The rubric (0–100, weighted)

| # | Dimension | Wt | Signal source |
|---|---|----|---|
| 1 | Content correctness & **no fabrication** | 18 | evidence ledger + citation resolver (`docs/academy/evidence/*`) |
| 2 | Pedagogical arc | 12 | `validateBlocks` + sprint-arc heuristics (`scripts/academy/authoring/audit-courses.ts`) |
| 3 | Lab substance | 12 | execute lab, diff stdout vs check; reconstructable-from-solution heuristic |
| 4 | Diagram / visual quality | 12 | Playwright screenshot → judge panel (Sage diagram engine, honest badges, narration-sync-ready) |
| 5 | Voice / audio quality †| 12 | `ffprobe`/`ffmpeg` (peak dBFS, silence, clipping) + transcript-vs-script diff |
| 6 | Accessibility | 12 | `axe-core` + Playwright (transcript/captions, keyboard, reduced-motion, contrast) |
| 7 | UX & human appeal | 12 | judge panel, adversarial, from screenshots + transcript |
| 8 | Performance | 6 | Lighthouse (LCP/INP/CLS/TBT vs targets) |
| 9 | Consistency | 4 | design-token + lint checks against `DESIGN_SYSTEM.md` |

† **Voice is conditional.** For a unit with no narration (voice held), dimension 5 is
`N/A` and its 12 points redistribute proportionally across dimensions 1–4 and 6–9. A
silent unit is **not** penalized for silence, but it **is** required to be
caption/transcript-ready (dimension 6 still checks that the storyboard carries the
`say` text as visible/opt-in transcript). When voice is later added, dimension 5
re-activates and the unit must re-pass.

**Composite** = weighted sum over applicable dimensions, renormalized to 100.

## 3. Hard-fails (block at any composite score)

A unit with **any** of these is BLOCKED regardless of its number:

- H1 — a fabricated claim, statistic, or citation (unresolvable against its ledger).
- H2 — a lab that does not run, or whose check does not match its solution.
- H3 — missing/broken audio where narration is promised (dead URL, non-200, 0 bytes).
- H4 — a critical or serious `axe` a11y violation.
- H5 — a dead internal ref/link (diagram node ref, lesson slug, asset URL).
- H6 — a diagram/asset that is imported raster where the standard requires code-native
  Sage-engine output (per `VISUAL_TEACHING_SYSTEM.md`).

Hard-fails are non-negotiable and are **not** buy-downable with a high score elsewhere.

## 4. The gate

```
PASS  ⇔  composite ≥ 99  AND  zero hard-fails
```

Anything below 99 or with a hard-fail returns a **fix list** (concrete, per-block) and
loops (§5). No unit is marked done on a 98. No "close enough."

## 5. The autonomous loop (per unit)

```
score(unit) → scorecard.json
  ├─ PASS → record proof, advance
  └─ FAIL → fixlist → apply fixes (subagent) → re-score
             (max 3 rounds; then SURFACE with the blocking reason — never silently cap)
```

- **Deterministic checks** run first and cheaply; a hard-fail there short-circuits the
  judge panel (don't spend judge tokens on a unit with a dead lab).
- **Judge panel** (dimensions 4, 7): 3–5 independent agents, **prompted to be
  skeptical / default-fail on doubt**, majority vote, each must cite specifics from the
  screenshot/transcript. This kills plausible-but-wrong "looks great" votes.
- **No silent caps:** if a batch bounds coverage (top-N, sampling, retry limit), the
  harness `log()`s exactly what was dropped and why.

## 6. Human sign-off (closes "appeal")

Per phase, the operator reviews a **sample** (≥2 lessons/screens per course, always
including the worst-scoring passing unit). The harness surfaces the sample + its
scorecards. A phase is complete only when the board is green **and** the operator
signs the sample. This is the one step no harness replaces.

## 7. Proof artifact

Every score writes `proof-artifacts/academy/<unit-id>-scorecard.json`:

```json
{
  "unit": "system-design/capacity-estimation",
  "kind": "lesson",
  "ts": "<ISO>",
  "composite": 99.4,
  "dimensions": { "content": 99, "arc": 100, "lab": 99, "visual": 99, "voice": "n/a",
                  "a11y": 100, "ux": 98, "perf": 99, "consistency": 100 },
  "hardFails": [],
  "judges": [{ "dim": "ux", "verdict": "pass", "cite": "…", "model": "…" }],
  "fixlist": [],
  "pass": true
}
```

An index (`proof-artifacts/academy/INDEX.json`) rolls units → courses → academy, so the
board state is one read, not a re-derivation.

## 8. Phase sequence (voice held — content + visual first)

| Phase | What | Gate |
|---|---|---|
| 0 | **This document** + rubric approved | operator approves rubric |
| 1 | Build `academy-quality-harness` (the scored command + proof artifact) | scores a known-good and known-bad correctly |
| 2 | **Pilot: System Design** to 99+ (content+visual+a11y+ux+perf; no new voice) | 99+ scorecard + operator samples 2 lessons |
| 3 | Re-audit the 8 rebuilt courses (they *are* voiced → dim 5 active) | 8× 99+ |
| 4 | Content+visual to 99+ across the 23 existing courses (Workflow batch) | rolling 99+, honest skip-log |
| 5 | Academy-wide human-appeal pass (onboarding, dashboard, motion, a11y, perf) | full board + operator sample |
| 6 | Ship gate (prod verification, provenance, zero hard-fails) | operator approves publish |
| — | **Voice re-activation** (deferred): once Pro is green-lit, dim 5 turns on, re-pass | separate gate |

## 9. Non-negotiables (inherited)

- Honesty first: no fabricated data, stats, testimonials, or citations. Ever. (H1.)
- Data-viz standard: institutional/PhD-quant, no theatre/gimmicks (`DATA_VIZ_STANDARD.md`).
- Visual system: code-native Sage-engine primitives, not imported images
  (`VISUAL_TEACHING_SYSTEM.md`, `project sage-diagram-engine`).
- Content persists via Supabase publish, not git (`project academy-content-deploy`).
- Scoped commits, no `-A`, no push without an explicit ask.
