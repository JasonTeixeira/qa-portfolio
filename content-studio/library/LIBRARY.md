# Sage Component Library — reuse plan

You already built a coherent, coded component system (~70–80% of what the video +
academy production machine needs). We **adopt and port** it — we do not rebuild.
Canonical sources are copied into `library/source/`; tokens are extracted to
`library/tokens.css`.

## Two skins, one brand (the reconciliation)
- **Feed skin** — thumbnails, covers, Shorts, social. The locked **isometric
  hybrid** (Poppins, vivid palette). Bright, friendly, made to win the feed.
  → `content-studio/templates/hybrid-thumb.html`.
- **Teaching system** — in-video diagrams, code walkthroughs, charts, and the
  academy lessons. **This library** (Fraunces + Hanken Grotesk + JetBrains Mono +
  the 10-hue teaching spectrum). Precise, code-driven, accurate, animatable.
  → the components below.

They share the ◆ brand + blue accent; each is used where it's strongest.

## What you already built (adopt directly)
**Named component contracts** (`Sage Academy Design System.dc.html`):
- **SageDiagram** — hero visual, positioned nodes + edges + legend, data-driven. → our `diagram-flow`.
- **SageCodeWalkthrough** — stepped, annotated real code with clickable dots. → our `code-card`.
- **SageCompare** — weak-vs-gold two-column (works in grayscale). → our `analogy/compare` scene.
- **SageViz** — embedded chart, honest axes, one accent series, zero chartjunk. → our `chart`.

**Data-viz widgets** (`Sage Data Viz & Widgets.dc.html`, pure SVG/CSS):
- `viz/histogram` (p50/p99 threshold lines) · `viz/gauge` (SLO arc → our `gauge`) ·
  `viz/curve` (capacity + "shard here" dot) · `viz/bars` (mastery, capped-by-proof tick).
- Interactive teaching widgets: sequence-builder, incident-replay, recall card,
  capacity calculator, CAP picker, inline quiz. → academy lesson interactivity.

**System Design Kit** (`Sage System Design Kit.dc.html`, the richest — 39 SVGs):
- The **10-hue component spectrum** (in tokens.css) · **12 infra icons**
  (client/cdn/lb/gateway/service/cache/db/queue/ratelimit/replica/shard/consensus) ·
  the **diagram grammar**: 4 animated edge types (request·sync solid comet /
  async gold dash / replication green dotted / failure broken red blinking),
  node anatomy (mono kicker + label + status chip) · a full interactive
  **Systems Stage** (9 nodes, re-renders per scenario).
- **Callout voices**: Key insight · Tradeoff · Failure mode · Capacity math.

**Motion Scenes** (`Sage Motion Scenes.dc.html`) — animated sequences ideal for
video: Life of a request · Backpressure · Consistent hashing · Scale out.

**App chrome** (`sage-widgets.js`) — 11 real `customElements` (nav, tab-bar,
notify, chat, share OG-card, search, footer, reward, lang-switch). For the academy web app.

## Gaps to build (small, net-new)
1. **Fail/Pass stamp** — a bold FAIL ✗ / PASS ✓ badge (the failure *language*
   exists; package it as a stamp). Core to "watch it break."
2. **Proof-✓ chip** — a standalone grounded/verified check chip.
3. **Analogy-split** — a true real-world ↔ system split scene (repurpose SageCompare).
4. **Port layer** — everything is browser-DOM SVG/CSS today; port each primitive
   into reusable scene components against `tokens.css`, drivable by the render
   pipeline (word-timestamp synced per the Sync Law).

## The machine (build order)
1. **Port** SageDiagram / CodeWalkthrough / Compare / Viz + the viz widgets +
   the diagram grammar into `library/scenes/` as parameterized components on tokens.css.
2. **Build the 4 gaps** (fail/pass stamp, proof chip, analogy-split, + reuse motion scenes).
3. **Render pipeline** — one command: structured script → VO+timestamps →
   assemble scenes → headless MP4 → 3-ratio thumbnails → queue upload.
4. **Content-ops board** — topic pipeline (50-slate + curriculum), states
   (idea→scripted→VO→rendered→scheduled→live), publish calendar, 1–3 wk backlog.
5. **Academy ↔ YouTube double-duty** — every lesson's core concept = one 3-min
   video = the YouTube video; the academy wraps it with code/lab/text/quiz. One
   production line, two products, automatic funnel.
