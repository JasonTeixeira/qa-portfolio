# Sage Ideas — Reference Design Spec (world-class bar)

*Built from real best-in-class references + AI-slop research, June 2026. Governs the Figma design and the code. Pairs with [ART_DIRECTION.md](./ART_DIRECTION.md) — this is the "what good looks like, with receipts" layer.*

## The one principle the references all share
**Reserve the accent. Let content be the hero.** Spotify, Netflix, Linear, Steam all do the same thing: near-black canvas, the brand/accent color used *only* on interactive elements (CTAs, status), and the real content (album art, video, product UI) carries the page through contrast. This is identical to our own ART_DIRECTION "reserve electric" rule — which the current build violates with ~70 decorative gradients.

## What separates world-class from AI-slop (grounded)

| Dimension | AI-slop (what we're doing) | World-class (the bar) | Reference |
|---|---|---|---|
| **Color** | 70 gradient washes, off-palette purple/pink, glow on every surface | Near-black + ONE reserved accent on interaction only; color = meaning, not decoration | Spotify, Netflix, Linear, Notion |
| **Motion** | Canvas particle field (`Atmosphere`), ambient drift, glow | Purposeful only — scroll-staging that builds anticipation, motion on CTAs/state changes; nothing decorative | Cosmos Studio, 925studios |
| **Imagery** | One product shot in a sea of type + gradients | Real product UI / photography as the HERO, emerging from darkness, gallery-style | Isabel Moranta, Steam, Spotify |
| **Type** | (OK already) Bricolage + Coconat + mono | Dual voice telling the brand story — mono precision + serif expression; huge/tiny, no mid-range | Isabel Moranta, Linear |
| **Icons** | `lucide-react` (the tutorial default) | Custom / curated marks | 925studios |
| **Copy** | Rewritten by me, generic | Founder's actual voice; "would Jason say this?"; specific claims, zero hedging | 925studios |

## The 7 rules for every section (design + build to these)
1. **One accent, reserved.** `#3D5AFE` only on CTAs + the live/system layer. Zero decorative gradients. Backgrounds are near-black with grain + a single temperature grade, never a color wash.
2. **Content is the hero.** Every major section leads with real imagery (product UI, the operator, a real artifact) emerging from darkness — not a headline over a gradient.
3. **Dual-voice type, extremes only.** Coconat (serif, expressive) for emotional beats; Bricolage (huge) for structure; JetBrains Mono (tiny, tracked) for the instrument layer. No mid-range emphasis.
4. **Motion must mean something.** Kill the particle field. Motion = scroll-staged reveals that build anticipation + CTA/state feedback. Nothing ambient-decorative.
5. **Asymmetry + overlap.** Off-axis composition, type over image, one full-bleed moment per section. Never centered-everything.
6. **Real, not generic.** Real screenshots/photography/custom marks. No Lucide-default icons, no stock, no AI illustration.
7. **Founder voice.** Copy sounds like Jason. Revert the regressed hero to "I build the product, the brand, and the AI that runs it." Specific, unhedged.

## The process change (the actual needle-mover)
Design-first in **Figma** (Pro account authenticated): build the design system (tokens + type + components) and the page comps *in Figma*, art-direct them like a designer, then implement from the real file via **Code Connect** — instead of vibe-coding CSS. A design discipline makes it look designed.

## Tooling wired for this
- **Figma MCP + Code Connect** — design-first, implement from real comps.
- **Awwwards** — the reference standard to design against (this doc is round one).
- **21st.dev / Magic UI MCP** — curated animated components for polished moments (selective, not wholesale).
- **better-icons** — replace the Lucide default.
- **Chrome DevTools MCP** — objective floor (a11y/perf/contrast); already at Lighthouse 100s, so it can't catch taste — that's on the design eye.

## Sources
- [Dark mode website examples (Lovable)](https://lovable.dev/guides/dark-mode-website-examples-guide)
- [AI-slop web design guide (925studios)](https://www.925studios.co/blog/ai-slop-web-design-guide)
- [Escape AI-slop landing pages (Monet)](https://www.monet.design/blog/posts/escape-ai-slop-landing-page-design)
- [Best design MCP servers 2026 (AgentRank)](https://agentrank-ai.com/blog/best-mcp-servers-design/)
- [Awwwards — Sites of the Day](https://www.awwwards.com/websites/sites_of_the_day/) · [Design agencies](https://www.awwwards.com/websites/design-agencies/)
