# Sage Academy — Visual Identity ("the look")

One look across YouTube, Shorts/IG, and the academy. Locked to the sageideas.dev
system so every surface reads as one brand.

## The system
- **Ground:** near-black navy `#0A0B0F`. **Accent:** electric blue `#3D5AFE`; on-dark `#9AA8FF`. **Deep:** `#1A2680`. **Ink:** `#F4F2EC`. Semantic: green `#3ECF8E` (passed), red `#F0796E` (fails-on-purpose).
- **Type:** Fraunces (serif display, emphasis in italic `#9AA8FF`) + JetBrains Mono (kickers, code, data).
- **Marks & motifs:** the Cloud Native logo; the **proof card** (code ending in a green ✓ / red ✗); grid + blue aurora atmosphere; the Atlas orb for "guided" moments.

## Two visual layers (they must coexist)
1. **Code-driven templates** — thumbnails, Shorts frames, lower-thirds, banner, avatar. Pixel-consistent, free, instant. Source: `templates/*.html`.
2. **Generative hero art (Higgsfield / Recraft V4.1)** — cinematic abstract atmosphere for intros, b-roll, and thumbnail backgrounds. Palette-locked to the brand.

**Recraft recipe (reproducible):** model `recraft_v4_1`, `model_type: standard`, `resolution: 2k`, `colors: ["#0A0B0F","#3D5AFE","#9AA8FF","#1A2680","#F4F2EC"]`, `background_color: "#0A0B0F"`. Prompt pattern: *"cinematic abstract [concept], deep near-black navy background, electric blue light, soft volumetric glow, subtle film grain, minimalist, vast negative space on the left third for text, premium editorial, no text/words/logos."* Proven heroes: `renders/hero-rag-1.png` (documents → core), `renders/hero-rag-2.png` (vortex → answer).

## Production stack (all verified live 2026-08-30)
| Layer | Tool | Status |
|---|---|---|
| YouTube ops (upload/thumbnail/metadata) | Composio (YOUTUBE_* tools) | ✅ connected, channel @SageideasAI |
| Narration | ElevenLabs — voice "Jason — Sage narration" (`MJdPGZVWOz3O2iOT7cx5`) | ✅ Pro, verified (`renders/voice-test.mp3`) |
| Generative visuals | Higgsfield / Recraft V4.1 | ✅ Ultra, 4,532 credits |
| Video composition | hyperframes (HTML→video) | pipeline next |
| Thumbnails / frames | `templates/` engine | ✅ live |

## Application rules
- **Thumbnails:** hero art OR proof-card on the right, title on the left; title shows a *verifiable claim*, never a reaction face.
- **Video intros:** hero art + logo reveal + one mono line; keep under 3s.
- **Academy:** the same tokens already ship on sageideas.dev — reuse scene/diagram components; hero art can back section headers.
- **AI-content disclosure:** when a video uses generated voice/visuals, toggle YouTube's synthetic-media label on. Honesty rule.
