# Sage Academy — Foundation Build-Program & Done-Gate (build the stadium, then add courses)

> The master plan for building the **platform itself** — the institutional structure every
> course sits on top of — to 95–99, before any course is ingested. Answers: in what ORDER do
> the loops build, and when is the foundation DONE (ready to just-add-courses)?
>
> Reads with: [PLATFORM_ARCHITECTURE.md](./PLATFORM_ARCHITECTURE.md) (the loop canon),
> [INFORMATION_ARCHITECTURE.md](./INFORMATION_ARCHITECTURE.md) (every page/tab/sub-tab),
> [DATA_SPINE.md](./DATA_SPINE.md) (the schema contract + enforcement primitives),
> [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) (the institutional-editorial shell).

## The principle
A course must never carry platform logic. Everything reusable — the loop enforcement, the
navigation, the design shell, the data spine — is **foundation**, built once, here. A course is
then *only*: canonical content mapped to the spine. If building a new course requires touching
the runtime, the foundation wasn't finished. **This program finishes it.**

## Build order (you cannot skip a tier — each rests on the one below)
The three loops do not run in parallel from a cold start; they layer:

```
TIER 0 — SPINE        DATA_SPINE.md → migrations: the 15 entities + enforcement primitives
                      (EvidenceEvent · 8-state machine · score-cap resolver) exist & are tested.
   │  gate: pure-logic unit tests for the state machine + cap resolver green; RLS in place.
   ▼
TIER 1 — SHELL        DESIGN_SYSTEM.md → tokens + type + the academy shell (nav, rails, surfaces,
                      states) as real components. ONE route group, ONE layout, consolidated IA.
   │  gate: INFORMATION_ARCHITECTURE.md routes consolidated (duplicates redirected); shell renders;
   │        axe 0 serious/critical; no overflow 320–1440.
   ▼
TIER 2 — ENFORCEMENT  UX_LOOP.md (enforcement-first half) → evidence-gating, score-cap UI, AI
                      guide as grader, board scheduler, repair queue, mastery map, measurement.
   │  gate: evidence-gate e2e (no fake completion · caps bind · fail→repair); guide grades explain-back.
   ▼
TIER 3 — EXPERIENCE   UX_LOOP.md (experience half) → content map, sidebars, progress everywhere,
                      ⌘K, notes, Course 00, mobile/empty-states. + LOOP.md growth-engine to 95.
   │  gate: every UX scorecard category ≥95 by design-reviewer verdict on screenshots.
   ▼
TIER 4 — PROOF        ONE reference course (programming-fundamentals) runs the WHOLE loop end to
                      end through the foundation — the foundation's acceptance fixture.
        gate: the foundation-done gate below.
   ▼
THEN — COURSES        CONTENT_LOOP.md ingests course after course. Foundation never changes.
```

Map to loops: **Tier 0–1** are setup passes (do them before looping). **Tier 2–3** = UX_LOOP
(enforcement categories first, per its sequencing) + LOOP.md in parallel once the spine exists.
**Tier 4** = the proof fixture. **Then** CONTENT_LOOP, indefinitely.

## The foundation-done gate (when "just add courses" becomes true)
The foundation is DONE — and only then do we start ingesting courses — when ALL hold, each
backed by a quoted gate (never self-graded):

**Structure**
- [ ] IA consolidated: exactly one learn path, one course entry, one nav tree; every duplicate
      route redirects; every page/tab/sub-tab in INFORMATION_ARCHITECTURE.md exists or is a
      deliberate honest empty-state. No orphan surfaces in learner nav.
- [ ] The design shell is the single source of all academy chrome; no page hand-rolls layout.

**Spine & enforcement**
- [ ] The 15-entity spine + enforcement primitives exist (DATA_SPINE.md), RLS on, service-role
      anti-cheat for evidence writes.
- [ ] Evidence-gate e2e proves: a unit will NOT complete without its EvidenceEvents; the score
      is the **minimum** of all binding caps; a forced gate-failure routes to the repair queue.
- [ ] The AI guide **grades** an explain-back into a real EvidenceEvent (closed-note; confidence
      captured before answer). Explain-back is evidence, not a click.
- [ ] The board scheduler surfaces due recall/repair and writes spacing/transfer events.

**Experience (institutional 95–99)**
- [ ] Every UX_LOOP scorecard category ≥95 (experience AND enforcement) by design-reviewer verdict.
- [ ] Full sweep green: typecheck · `next build` · render e2e · a11y (0 serious/critical) ·
      responsive (no overflow 320/768/1024/1440) · CWV in budget on lesson + lab.
- [ ] A new learner can: land → Course 00 teaches the 5-beat method → enroll → run a lesson →
      see progress + mastery map → get a due review — with zero dead ends. (Journey e2e.)

**Proof**
- [ ] The reference course runs all 5 beats + board assets + caps end-to-end through the
      foundation, with the §12 contract present. Two-agent audit clean (no open CRITICAL/HIGH).

**Honesty ceiling:** the foundation tops out at an internal **95–97**. The last 2–3 points
(98–99) are unlocked only by real learner outcomes (CURR + Hake's mastery-gain + external
review) per PLATFORM_ARCHITECTURE §5/§12 — not buildable, only earnable.

## What "adding a course" looks like once the foundation is done
1. Course Factory produces the canonical folder (fed by the asset library).
2. `validate_generated_course.py` + `run_all_checks.sh` + senior-review ledger pass.
3. `import-course.ts` maps it to the spine. No runtime change.
4. `check-course.ts` runtime gate + render/evidence-gate e2e pass.
5. It appears in the catalog + content map, runs the loop, emits evidence, earns its score cap.
That is the entire course-add surface. If a course needs more than this, file it as a foundation
gap — do not patch the runtime per course.

## Status
- Canon + loops + hardening: ✅ written.
- Foundation docs (this set): IA / data-spine / design-system: ✅ written.
- **Tier 0 — SPINE: ✅ done (2026-06-26).** `evidence-events-logic.ts` (11 events · 8-state
  machine · signal derivation) + `caps-logic.ts` (min-of-caps resolver, 98 structural ceiling)
  + `evidence-events.ts` (service-role writer/reader) + migration `0104` (append-only table ·
  RLS read-own · explicit REVOKE · DB-level append-only trigger). Pure-logic unit tests green
  (scripted sequence drives locked→complete + capped score; stray-repair + reopened-repair edge
  cases). 2-agent adversarial audit clean: 1 logic bug (stray `repair_completed` lifting the cap)
  + RLS/append-only hardening fixed; CRITICAL/HIGH addressed via the `@security` caller contract.
- **Tier 1 — SHELL: structurally complete (2026-06-26).** Design reconciled to disciplined-dark
  Institutional Editorial (preserves the existing dark `AcademyShell` + ~30 pages). DONE: `--ac-*`
  tokens pinned (base/state/type/space/motion + AA-safe `--ac-accent-strong`/`--ac-accent-text`) ·
  shell restyled to tokens (one component → all academy pages) · mobile nav (no-JS scrollable row) ·
  shell components built (StateBadge/ScoreCapMeter/Surface/TabBar) · **a11y gate 7/7 green** (axe,
  0 serious/critical) · responsive clean 320–1440 · IA audited + consolidated (the `[track]` family
  is the marketing/SEO layer, kept separate — not a dup; app has one learn path + one course entry).
  DEFERRED (decisions, documented): route-group `layout.tsx` promotion — the per-page `<AcademyShell>`
  wrap is the right pattern since landing/auth pages take no chrome; the 8→6-destination nav regroup +
  tabbed Compete/Progress surfaces — depends on Tier-3 page-building; track→flagship-course resolver.
- **Tier 2 — ENFORCEMENT: NOT started.** Next.
- Tiers 3–4: NOT started.
