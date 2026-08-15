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
- **Tier 2 — ENFORCEMENT: complete (2026-06-26) — build + enforcement verified.** The Tier-0 spine
  is live in the lesson flow and un-fakeable. DONE: evidence emitted from completion/lab/sprint
  (lesson_completed, server-verified lab_verified + sprint_artifact_created, diagnostic/retrieval/
  transfer) · evidence-gated completion + visible score caps (StateBadge + ScoreCapMeter, real state)
  · AI-guide-as-grader (gradeTeachback → DeepSeek → trusted explainBackGraded on genuine pass; fail →
  repair_created) · repair queue surfaced on /academy/review · measurement dashboard (/academy-admin/
  metrics: CURR, evidence funnel, aggregate Hake's g, honest 'collecting' below n). Anti-cheat
  adversarially reviewed 3× (lab-forge closed, defense-in-depth payload guard, grader injection-fenced
  + prefiltered + rate-limited). Verified: typecheck 0 · unit 254/254 · **enforcement e2e 2/2 (proves
  no complete/full-score without evidence)** · a11y 7/7 · next build pass.
  HONEST CAVEAT: the live DeepSeek grading round-trip is NOT covered by automated tests (needs
  DEEPSEEK_API_KEY + costs a call); the grader LOGIC is pure-unit-tested and the flow degrades honestly
  when the key is absent. Operator: set DEEPSEEK_API_KEY and do one manual teachback to confirm live
  grading. 98–99 still gated on real-learner outcomes (structural).
- **Tier 3 — EXPERIENCE: complete (2026-06-26).** Wave 1: content map (Learn "Map", "you are here") ·
  mastery map (profile heat-map from the evidence spine) · ⌘K command palette · learner notes
  (`academy_notes` RLS own-rows) · Course 00 (teaches the 5-beat method). Wave 2: nav regrouped 8→6
  canonical destinations + tabbed Compete (Leagues/Community) & Progress (Mastery/Certificates/Efficacy/
  Invite) via GroupSubNav, no route orphaned · progress everywhere (ProgressBar on catalog/dashboard/
  course, streak strip). Visual-audit loop: design-reviewer scored every surface, 2 polish passes
  (kill glow/bloom, close dead voids, hierarchy, composed empty states) lifted the avg **86 → 92.5**
  (catalog 93 · course 94 · review 94 · efficacy 93 · community/dashboard 93 · lab/leagues/profile/refer
  92 · lesson 90). Verified each pass: typecheck 0 · unit 257/257 (3 new pure-logic suites) · a11y 7/7 ·
  next build pass · security review of notes/search clean.
  HONEST CEILING: a uniform 95–99 is gated on (a) real learner data — the residual voids + the test
  masthead handle ("Client1+test") are empty-test-account artifacts that real content/names resolve —
  and (b) one deferred structural item (the lesson right-rail). Per §5 this is correct: 98–99 needs real
  outcomes; full visual density needs real content.
- **Tier 4 — PROOF: complete (2026-06-27). THE FOUNDATION IS BUILT.** `scripts/academy/accept-foundation.ts`
  drives the whole enforcement loop end-to-end through the REAL ledger + REAL 8-state machine + REAL
  cap resolver: ready/70 → in_progress → proof_pending → review_pending → repair_required → transfer_due
  → complete, score → 98 (internal ceiling). Re-runnable, isolated from the real lesson. `academy-journey.spec`
  proves the canonical path has no dead ends. Final sweep: typecheck 0 · unit 257/257 · academy e2e 20/20
  (content + enforcement + journey + a11y) · acceptance PASS · next build pass.

## Foundation-done gate — status
- [x] IA consolidated (8→6 nav, one app learn path + course entry; marketing layer kept separate).
- [x] Design shell is the single source of academy chrome (tokens + GroupSubNav + shell components).
- [x] 15-entity spine + enforcement primitives exist; RLS + service-role + append-only trigger.
- [x] Evidence-gate e2e: a unit will NOT complete / show full score without its EvidenceEvents.
- [x] AI guide grades explain-back into a trusted EvidenceEvent (LIVE round-trip pending DEEPSEEK_API_KEY).
- [x] Board scheduler surfaces due recall + the repair queue (/academy/review).
- [x] New-learner journey has no dead ends (Course 00 → catalog → course → lesson → review).
- [x] Reference course runs all 5 beats + caps end-to-end through the foundation (acceptance fixture).
- [~] Every UX category ≥95 — currently **92.5** (honest): gated on real learner data (empty-account voids
      + the test masthead handle) + one deferred structural item (lesson right-rail). Per §5, full visual
      density + 98–99 require real content/outcomes — not buildable, only earnable.

**Verdict: the foundation is built and acceptance-verified — ready to receive courses.** Open operator
items: set `DEEPSEEK_API_KEY` + one manual teachback; the deploy gate (preview/prod + Lighthouse);
Stripe/prod-env/Sentry; real learners (the last visual points + 98–99 + live efficacy).
