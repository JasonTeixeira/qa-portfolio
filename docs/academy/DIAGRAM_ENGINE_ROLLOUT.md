# Diagram Engine Rollout (Program C) — autonomous

Roll the Sage diagram **engine + bank + narration** ([[project_sage_diagram_engine]]) across all teaching content, and re-baseline the academy to the **exports 4** canonical skin. Run autonomously, one verified+committed unit per iteration, highest quality (target 99+ human appeal), e2e-verified. STOP+checkpoint only at genuine gates.

Engine (DONE, committed 94dba21a): `components/academy/visuals/` — arch-icons (38 bank) · colorful-pop glowing DiagramNode · dataflow pulse · NarratedDiagram storyboard engine (voice-sync-ready). Live refs (chrome-free): `/proto/design-system`, `/proto/diagram-preview`, `/proto/narrated`.

## Acceptance (every unit)
tsc clean · route compiles/gates · screenshot-verified live on :3040 (auth-gated → verify via compile+gate+no-fabrication+logic-preservation, note auth-blocked) · scoped commit (`git add` specific files, `--no-verify`, never `git add -A`, never push) · flip this ledger · NO fabrication (real data/omit/defer) · exact palette + Fraunces/Hanken/JetBrains.

## Workstreams
| | Unit | State | Notes |
|---|---|---|---|
| C0 | Colorful-pop + icons + dataflow on all 449 diagrams | **DONE** | shipped in the engine commit; SageDiagram/DiagramNode changes are live for every diagram |
| C4 | **Design-system page** documenting the engine + bank + narration | **DONE** (53b65711) | /proto/design-system now = header + Color (ramps + 5 semantic tones w/ hex+meaning) + Type (Fraunces/Hanken/JetBrains) + 5 signature visuals LIVE (SageDiagram, NarratedDiagram, SageCodeWalkthrough, SageCompare, SageViz) + part gallery + 38-icon bank. Matches exports-4 reference. tsc clean. |
| C1 | **Auto-storyboard generator** — narrate every diagram from lesson content | **DONE — 449/449 diagrams narrated across 23 courses, 0 fabricated refs** | gen-storyboards.mjs + collect-storyboards.mjs + validate-blocks fail-closed + export-course-json.mjs (Supabase→JSON+manifest for courses lacking a local copy). Every apply 0 validation failures. Voice-sync-ready. Live in Supabase. |
| C2 | **Wire NarratedDiagram into the lesson player** — storyboard present → narrated, else normal | **DONE** (f6a431c0) | additive; diagram block type gained `storyboard`; lesson route compiles+gates; all 20 backend lessons narrate in-lesson |
| C3 | **Re-baseline screens to exports 4** — Dashboard Cockpit, Emails, Field Note Article, + About/Help/Pricing/Why-Proof, and the wider academy surface | **DONE (non-gated)** — reconciled 2026-07-04 | Completed under the separate **P1/P2/P3 reskin program**, not a new build: Dashboard Cockpit (62b6b520, verified tsc-clean + route 307), Field Notes list+article (56b72500, verified live 200 on `the-invoice-that-emailed-itself-twice`), Emails theme already exports-4 + wired via waitlist route (6508d467), Lesson Player (a9b969ca), Course Map (f71a0667), Evidence (504454a5), Public Profile (475654e0), Onboarding (d565ce62), Recall Queue (ba9aaabf), Daily Rep (5dce5f7f), Studio (80102b81), Lab (a6189d54), 404 (9c323707), Help (3b8a6773), Why-Proof (59f5a305), About (Phase-2 marketing + a11y 3478077a), Pricing (e575a39c). **Deferred (gated):** Home + marketing-public (Phase-3 root-swap, concurrent-design lock), Checkout (ff3ba111), Cancel/Placement (Phase-4 Stripe/engine). New academy transactional email types in the mock (recall-due, streak-at-risk, sprout-digest, receipt) held back — no real trigger/sender backend, building them would fabricate a feature. |
| C5 | Voice-engine TTS sync — swap the beat timer for audio-segment boundaries | **DEFERRED (gate)** | voice engine not built yet; engine is already voice-sync-ready |

## Gates (STOP + checkpoint)
- Root swap (academy → sageideas.dev root): operator go + concurrent-session status.
- Live Stripe screens (Checkout, Cancel): operator + live keys.
- Voice engine (C5): doesn't exist yet.
- Team features: CUT (individual-only).

## Progress log
- 2026-07-04: engine + bank + narration committed (94dba21a); exports 4 re-baselined to design-source/sage-academy-v4; program opened.

- 2026-07-04: **C1 COMPLETE** — 449/449 diagrams narrated (23 courses), 0 bad refs academy-wide, all live in Supabase. C0/C1/C2/C4 done. Next: C3 screens.

- 2026-07-04: **C3 RECONCILED → DONE (non-gated)** — audited the screen re-baseline rather than rebuilding it. Found every academy screen already reskinned one-for-one to exports-4 under the P1/P2/P3 reskin program (Dashboard/Field Notes/Emails/Lesson Player/Course Map/Evidence/Profile/Onboarding/Recall/Daily Rep/Studio/Lab/404/Help/Why-Proof/About/Pricing). Verified this iteration: Dashboard tsc-clean + route 307; Field Note live 200 + matches design; Emails theme exact exports-4 palette + wired. No new code needed — the diagram-engine ledger's "C3 queued" row was stale. Held back (fabrication risk): mock's un-wired transactional email types. **All non-gated Program-C work (C0–C4) complete.**

- 2026-07-04: **PROGRAM C COMPLETE (non-gated).** Shipped: C0 colorful-pop+icons+dataflow on all 449 diagrams · C1 449/449 narrated storyboards (0 bad refs, live) · C2 NarratedDiagram wired into lesson player · C3 all screens on exports-4 (reconciled) · C4 design-system page. **Gated remainder (STOP):** C5 voice-engine TTS sync (engine not built — engine is already voice-sync-ready); live-Stripe Checkout/Cancel; Phase-3 root swap (academy → sageideas.dev root, incl. Home + marketing-public — concurrent-design lock + operator go); Legal (attorney).
