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
| C1 | **Auto-storyboard generator** — per lesson, read the diagram + narrative → generate a `DiagramStoryboard`; store on the diagram block; every ref validated real | **BUILT + scaling (5/23 courses)** | gen-storyboards.mjs + collect-storyboards.mjs + validate-blocks fail-closed check. **career-backend_engineering: 20/20 narrated, 0 bad refs, live in Supabase, verified coherent** (d3be6fa1). Remaining: ai_engineering, then the rest — ONE workflow at a time. |
| C2 | **Wire NarratedDiagram into the lesson player** — storyboard present → narrated, else normal | **DONE** (f6a431c0) | additive; diagram block type gained `storyboard`; lesson route compiles+gates; all 20 backend lessons narrate in-lesson |
| C3 | **Re-baseline screens to exports 4** — new/updated: Home (+menu), Dashboard Cockpit, Emails, Checkout, Field Note Article, + refresh About/Help/Pricing/etc.; align AcademyNav to the new Home menu | queued (big) | design-source/sage-academy-v4; palette consistent; per-screen units like the reskin loop |
| C5 | Voice-engine TTS sync — swap the beat timer for audio-segment boundaries | **DEFERRED (gate)** | voice engine not built yet; engine is already voice-sync-ready |

## Gates (STOP + checkpoint)
- Root swap (academy → sageideas.dev root): operator go + concurrent-session status.
- Live Stripe screens (Checkout, Cancel): operator + live keys.
- Voice engine (C5): doesn't exist yet.
- Team features: CUT (individual-only).

## Progress log
- 2026-07-04: engine + bank + narration committed (94dba21a); exports 4 re-baselined to design-source/sage-academy-v4; program opened.
