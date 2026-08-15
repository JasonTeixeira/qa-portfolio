# Sage Academy — Visual Engine (the ultimate visual mastery look)

> How we make every lesson explain complex topics visually — dense diagrams, animated explainers, code with
> movement — in our own editorial dark-luxury / ink-wash-dojo style, at the scale of 426 lessons. Reads with
> [DESIGN_OS_PROGRAM.md](./DESIGN_OS_PROGRAM.md) (the visual standard) + [COURSE_TEMPLATE.md](./COURSE_TEMPLATE.md).

## The core principle: AUTHOR DATA, NOT ANIMATION
You cannot hand-animate 426 lessons. So the engine is **declarative**: each visual is a small JSON-ish SPEC that an
author (human or agent) writes from the lesson content, and a single branded RENDERER turns the spec into the
animated, accessible, on-brand visual. Add a spec to a lesson's `blocks[]`; the engine does the motion, the style,
the reduced-motion fallback, and the a11y. This is what makes "visual everywhere" tractable.

## Layer 1 — New visual LessonBlock types (the spec surface)
Extend the `LessonBlock` union (`data/academy/sample-course.ts`) with declarative visual blocks, each rendered by a
component in `components/academy/visuals/`:
- **`diagram`** — a node/edge graph spec: `{ nodes:[{id,label,group?,kind?}], edges:[{from,to,label?,kind?}],
  steps?:[...] }` → an animated SVG (reveal-on-scroll, optional step-through highlight). Covers system maps,
  pipelines, request flows, architectures, state machines, dependency graphs. THE workhorse — most lessons get one.
- **`code-walkthrough`** — `{ code, language, steps:[{lines:[a,b], note}] }` → a code panel (terminal-look, JetBrains
  Mono) that steps line-by-line, highlighting + annotating each step with movement (and an optional "type-in" intro).
  The interactive cousin of the reel-forge code explainers.
- **`viz`** — a data-viz spec `{ chart:'bars'|'line'|'scatter'|'area', data, encoding }` → a branded, institutional
  animated chart (honest data-viz standard — no chartjunk, real axes/units). For quant/data/perf concepts.
- **`concept-anim`** — `{ name:'hashmap'|'request-flow'|'binary-search'|…, params }` → a reusable, parameterized
  animated concept component pulled from a growing library. The "how X actually works" micro-animations.
- **`compare`** — `{ before, after }` or A/B → an animated before→after / weak-vs-gold reveal.
- **`annotated-image`** — `{ src, hotspots:[{x,y,label}] }` → a branded callout-over-image (for diagrams from
  `public/images/diagrams/*.svg` or the scene art).

All are DATA. A lesson author emits the spec; the renderer owns motion + style + a11y.

## Layer 2 — The branded primitive library (our uniqueness)
`components/academy/visuals/` — the reusable, on-brand React primitives the renderers compose:
- Diagram primitives: `Node`, `Edge`, `Flow`, `Group` in the editorial dark-luxury palette (`--ac-*` tokens), with
  the ink/accent/grain treatment + the house motion language (`--ac-ease-out-expo`, slow `clip-path`/`opacity`
  reveals). Edges can "draw in"; nodes fade/scale up in dependency order.
- `CodeStepper` — the terminal-look stepper (line highlight, annotation gutter, dot-progress).
- Viz primitives — institutional charts (tabular nums, real axes), the "PhD quant viz" bar (NO theatre/gimmicks).
- Motion hooks — `useInView` (IntersectionObserver-driven reveal), `useReducedMotion`, a scroll-progress hook.
- The **visual signature**: the ink-wash atmosphere + the constellation/network motif + serif/mono pairing + the
  one accent + grain — applied consistently so a Sage diagram is instantly recognizable as ours.
RULES: compositor-only motion (transform/opacity/clip-path/stroke-dashoffset), `prefers-reduced-motion` = the final
state instantly (the MEANING lives in the diagram, never in the motion), AA contrast, keyboard where interactive,
explicit dimensions (no CLS), lazy below-the-fold.

## Layer 3 — The cinematic Remotion lane (the showcase, used sparingly)
For high-impact NARRATIVE moments — a course intro, a "big picture" explainer, the marketing/social cut — use
**Remotion** (we already run it in reel-forge): branded compositions parameterized by data, rendered to MP4/WebM
ONCE and embedded via the `video` block. Reserve for hero/intro per course/module + social — NOT every lesson
(render cost + bandwidth + it's not interactive/accessible). Skills available: `remotion-best-practices`,
`remotion-to-hyperframes`, `hyperframes-*`, `threejs-*`. Reuse the reel-forge templates/aesthetic.

## Live (in-browser) vs Remotion — the decision
- **Default = LIVE in-browser** (SVG/Canvas/CSS/light Three.js): interactive (scrub/replay/hover), accessible
  (pausable, reduced-motion), $0, lightweight, and authorable-at-scale via specs. ~90% of in-lesson "movement".
- **Remotion = the 10%**: cinematic course intros + social. Rendered once, embedded as video.
This split is what makes it both ultra-visual AND shippable across 426 lessons.

## The authoring pipeline (how it scales to 426 lessons)
1. During Phase-B transformation, each lesson author ALSO emits the visual specs from the content — the system map →
   a `diagram`, the code → a `code-walkthrough`, the data point → a `viz`, the mechanism → a `concept-anim`. It's
   just more blocks in the same seed.
2. The `concept-anim` library grows: each genuinely-new mechanism becomes a reusable component, used across courses.
3. A visual-design panel gates each lesson's visuals (≥95: clarifies the concept, on-brand, reduced-motion-correct,
   perf-safe). A "every lesson has ≥1 real diagram/animation" coverage check.
4. Remotion hero per course authored once from a template.

## The Asset Bank (the compounding moat)
The engine + the library together ARE an asset bank: a versioned, reusable inventory you compose any lesson's
visuals from — and it COMPOUNDS (every lesson you build adds reusable assets, so lesson #400 is faster + richer
than lesson #1). It holds:
- **Primitives** — `Node/Edge/Flow`, `CodeStepper`, the viz primitives, motion hooks (the raw building blocks).
- **Concept animations** — the `concept-anim` registry: named, parameterized "how X works" components (hashmap,
  request-flow, binary-search, RAG-pipeline, B-tree, TCP-handshake, gradient-descent, …) — the bank grows one entry
  per genuinely-new mechanism, then it's reused across every course that needs it.
- **Diagram + viz templates** — common shapes (a 3-tier architecture, a CI/CD pipeline, a state machine, a latency
  histogram) as parameterized presets.
- **Remotion compositions** — branded course-intro / explainer templates (the reel-forge lane), parameterized by data.
- **Brand art** — the scene set (`public/path/scenes/*`), ink-wash (`public/art/*`), the constellation/network motif,
  the Icon system, the `--ac-*` tokens + motion language.
Catalogued in `components/academy/visuals/REGISTRY.md` (what exists, its props, where it's used) so authors (human or
agent) pull from the bank instead of reinventing. **This is the winner you're pointing at:** nail the bank once and
every lesson — and every future course, social cut, and marketing page — draws from one unmistakable visual language.

## Build plan (the program)
1. **Foundation:** add the `diagram` + `code-walkthrough` block types + their branded renderers + the primitive
   library + motion hooks. (Highest leverage — these two cover most lessons.)
2. **Proof:** wire them into 1–2 course-00 lessons (the system-map lesson → a real animated diagram; a coding
   lesson → an animated code-walkthrough). Gate + visual panel ≥95. PAUSE for taste sign-off.
3. **Expand:** `viz`, `concept-anim` (seed the library), `compare`, `annotated-image`.
4. **Remotion lane:** one branded course-intro composition, rendered + embedded.
5. **Fold into Phase-B:** every subsequent course's lessons emit visual specs by default; the coverage check enforces it.

## Standing gate additions for visuals
The standing gate (DESIGN_OS_PROGRAM §) PLUS: every visual is compositor-only + reduced-motion-correct (static
fallback carries the meaning) + AA + has explicit dimensions (0 CLS) + a visual-design panel scores it ≥95 for
"does the motion clarify the concept." No motion-for-motion's-sake; no chartjunk; honest data only.

## Guardrails
On-brand (the ink-wash/constellation/serif-mono signature), accessible (meaning never lives only in motion),
performant (lazy, compositor-only, no CLS), honest (real data-viz, no theatre). Declarative specs so it scales.
