# Sage Academy — Visual Design System (standardize every visual to a repeatable 99+)

> The canonical design system for ALL academy visuals (diagrams, charts, code-walkthroughs, concept animations) so
> every one is high-end + on-brand + legible BY CONSTRUCTION — not hand-tuned per lesson. Built on the integrated
> Sage Design OS components + the `--ac-*` dark-luxury tokens. Reads with [VISUAL_ENGINE.md](./VISUAL_ENGINE.md)
> (the declarative engine) + [COURSE_TEMPLATE.md](./COURSE_TEMPLATE.md) (the visual-first doctrine).

## The core unlock: AUTO-LAYOUT (kill hand-placed coordinates)
Why the system-map needed 3 loops: it used manual `x/y` per node. The standardization is to make diagram specs
**layout-free** — the author writes only nodes + edges + kinds; a **layout engine** (hierarchical/dagre-style, e.g.
`elkjs` or `dagre`) positions them cleanly and consistently every time, with standard spacing, no overlaps, no
clipping, no dead-bands. **This is what makes every diagram look professional with zero per-diagram tuning.** Authors
describe MEANING (what connects to what, and its role); the system owns LAYOUT + STYLE + MOTION.

## The canonical visual language (the standard every visual conforms to)
1. **Node taxonomy** (`kind`): `service` · `store` (db/cache) · `queue` · `external` · `client` · `decision` ·
   `process` — each a standard shape/treatment (rounded card / cylinder / etc.), so a "store" always looks like a store.
2. **Semantic tone system** (`tone`): `default` · `accent` (focus / suspect path) · `warning` (blast radius / risk) ·
   `success` (source of truth / healthy) · `muted` (out of scope) — mapped to `--ac-accent/-danger/-mastery/-ink-faint`.
   Color carries MEANING, used consistently across every diagram; a legend auto-renders when tones are used.
3. **Edge taxonomy** (`kind`): `sync` (solid) · `async`/`event` (dashed) · `data` · `control` — standard stroke +
   the tone system + arrowheads + auto-offset labels in pills. The "primary path" reads heavier (a 2–3 step weight ramp).
4. **Spacing / grid:** one rank/node spacing scale (from the layout engine) so every diagram has the same rhythm.
5. **Typography for visuals:** title = `--ac-font-display`, kicker + node labels + edge labels = `--ac-font-mono`,
   one type scale. No ad-hoc sizes.
6. **Motion language:** edges draw in along flow order, nodes fade-up in dependency order, `--ac-ease-out-expo`,
   compositor-only, `prefers-reduced-motion` = the legible static state instantly (meaning never lives in motion).
7. **Chart standard (`viz`):** a fixed set of presets (bars/line/area/scatter), honest axes + units, tabular nums,
   one accent series, NO chartjunk — the institutional "PhD quant viz" bar.
8. **Code standard (`code-walkthrough`):** the terminal-look stepper, JetBrains Mono, standard line-highlight +
   annotation gutter + step-dot progress.
9. **Frame standard:** every visual is a `<figure>` with a standard title/kicker/legend/caption layout + the same
   dark surface, hairline, elevation, grain — so a Sage visual is instantly recognizable.

## The standardized components (all conform to the above)
`components/academy/visuals/`: `SageDiagram` (auto-layout), `SageViz` (chart presets), `SageCodeWalkthrough`,
`SageConceptAnim` (the concept-animation registry), `SageCompare`. Each takes a LAYOUT-FREE / preset spec and renders
the standard. Shared internals: the tone map, the node/edge kind renderers, the layout engine, the legend, the frame,
the motion hooks — defined ONCE so nothing is bespoke.

## The catalog (the asset bank, documented)
`components/academy/visuals/REGISTRY.md` — every visual type + kind + tone + preset, with a live example, its spec
shape, and the rule for when to use it. Authors (human or agent) pull from the catalog; consistency is enforced by
the shared internals + this doc. Reconciles with the Sage Design OS registry.

## The gate (every visual)
Standing gate + : compositor-only + reduced-motion-correct + AA + 0 CLS + **conforms to the system** (uses the tone/
kind taxonomy + auto-layout + the standard frame — no hand-placed coords, no off-system colors) + a **visual-design
panel scores it ≥ 95** (legible at a glance, on-brand, the motion clarifies) + the **text-density / visual-first**
checks from COURSE_TEMPLATE.

## Build plan
1. **The system core:** add the layout engine (elkjs/dagre) + refactor `SageDiagram` to LAYOUT-FREE specs (nodes +
   edges + kinds/tones, no x/y) + the node/edge-kind renderers + the shared tone/frame/legend/motion internals.
2. **The component set:** `SageCodeWalkthrough` + `SageCompare` to the standard; `SageViz` presets locked; seed the
   `SageConceptAnim` registry with 3–5 reusable mechanisms.
3. **The catalog:** `REGISTRY.md` + a visuals storybook/preview route, every type shown on-brand.
4. **Prove + lock:** re-author the course-00 system-map lesson VISUAL-FIRST on the standardized system (layout-free
   diagram + a `compare` + tight captions, low text) → visual panel ≥ 95 → operator sign-off → it becomes THE bar.
5. **Fold into Phase-B:** every lesson authored visual-first against this system + gate.

## Readiness
HAVE: the integrated Sage Design OS components + `--ac-*` tokens, the SageDiagram/SageViz/reveal start, the
visual-first doctrine, the asset bank (sage-design-os registry). NEED only to ADD: a layout engine dependency
(elkjs or dagre — small, well-supported) and the standardized refactor above. Ready to build on the operator's go.
