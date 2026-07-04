# Diagram Engine Rollout (Program C) — autonomous

Roll the Sage diagram **engine + bank + narration** ([[project_sage_diagram_engine]]) across all teaching content, and re-baseline the academy to the **exports 4** canonical skin. Run autonomously, one verified+committed unit per iteration, highest quality (target 99+ human appeal), e2e-verified. STOP+checkpoint only at genuine gates.

Engine (DONE, committed 94dba21a): `components/academy/visuals/` — arch-icons (38 bank) · colorful-pop glowing DiagramNode · dataflow pulse · NarratedDiagram storyboard engine (voice-sync-ready). Live refs (chrome-free): `/proto/design-system`, `/proto/diagram-preview`, `/proto/narrated`.

## Acceptance (every unit)
tsc clean · route compiles/gates · screenshot-verified live on :3040 (auth-gated → verify via compile+gate+no-fabrication+logic-preservation, note auth-blocked) · scoped commit (`git add` specific files, `--no-verify`, never `git add -A`, never push) · flip this ledger · NO fabrication (real data/omit/defer) · exact palette + Fraunces/Hanken/JetBrains.

## Workstreams
| | Unit | State | Notes |
|---|---|---|---|
| C0 | Colorful-pop + icons + dataflow on all 449 diagrams | **DONE** | shipped in the engine commit; SageDiagram/DiagramNode changes are live for every diagram |
| C4 | **Design-system page** (real committed route) documenting the engine + bank + narration; retire the mock | queued | promote `/proto/design-system` → a real reference page; match exports-4 "Sage Academy Design System" |
| C1 | **Auto-storyboard generator** — per lesson, read the diagram + narrative (concept/walkthrough/mission) → generate a `DiagramStoryboard`; store on the diagram block; verify a beat maps to real node/edge ids | queued | the multiplier; batch via agents like the sourcing/lab harnesses; start on one course, verify, then scale |
| C2 | **Wire NarratedDiagram into the lesson player** — when a diagram block has a storyboard, render narrated; else normal | queued | additive; needs C1 storyboards to show |
| C3 | **Re-baseline screens to exports 4** — new/updated: Home (+menu), Dashboard Cockpit, Emails, Checkout, Field Note Article, + refresh About/Help/Pricing/etc.; align AcademyNav to the new Home menu | queued (big) | design-source/sage-academy-v4; palette consistent; per-screen units like the reskin loop |
| C5 | Voice-engine TTS sync — swap the beat timer for audio-segment boundaries | **DEFERRED (gate)** | voice engine not built yet; engine is already voice-sync-ready |

## Gates (STOP + checkpoint)
- Root swap (academy → sageideas.dev root): operator go + concurrent-session status.
- Live Stripe screens (Checkout, Cancel): operator + live keys.
- Voice engine (C5): doesn't exist yet.
- Team features: CUT (individual-only).

## Progress log
- 2026-07-04: engine + bank + narration committed (94dba21a); exports 4 re-baselined to design-source/sage-academy-v4; program opened.
