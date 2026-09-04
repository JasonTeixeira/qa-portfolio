# Sage Academy — YouTube Channel Setup

Repurposing the connected "Jason Teixeira" channel (`UC782pAxkWXhZg5WOAgdV_zw`)
into the Sage Academy content channel.

## ✅ Done via API (Composio)
- **7 trading videos unlisted** (CPI/PPI, broadcasts, live-session tests). Hidden,
  not deleted — reversible any time. Public uploads are now clear.

## ⚙️ Your 2-minute manual steps (YouTube Studio — API can't set channel identity)

Go to **studio.youtube.com → Customization**.

**1. Branding tab**
- **Picture (avatar):** upload `content-studio/renders/avatar.png` (800×800).
- **Banner:** upload `content-studio/renders/banner.png` (2048×1152).
- **Video watermark:** upload `content-studio/renders/avatar.png` (or the logo) — shows bottom-right on every video as a subscribe nudge.

**2. Basic info tab**
- **Name:** `Sage Academy`
- **Handle:** try `@SageAcademy` → fallbacks `@SageAcademyAI`, `@sageideas`.
- **Description** (paste this — keyword-rich for search + funnel):

> Learn to build with AI — by building. Every video ends in a runnable proof:
> real code, real tests, real systems you can verify yourself.
>
> AI engineering, agents, RAG, evals, MCP, system design, and the judgment
> senior engineers actually use — taught with zero hype. If a concept can't end
> in something you can run and check, we don't teach it. Proof, not paper.
>
> ▸ Start free: https://sageideas.dev/academy
> ▸ Every build, runnable on the site: https://sageideas.dev/academy/labs
> New build every week.

- **Links:** add — `sageideas.dev` (Website), `sageideas.dev/academy` (Start free),
  `sageideas.dev/academy/labs` (The Labs). Set the first as the primary link.
- **Contact email:** your business email (for sponsors/press).

**3. Settings → Channel → Advanced**
- **Keywords:** `AI engineering, learn AI, build with AI, RAG, AI agents, LLM evals,
  MCP, system design, prompt engineering, vector database, AI tutorial, coding`

That's it — save. The channel is then pro and ready to receive uploads via CLI.

## Handle/name note
If `@SageAcademy` is taken, grab the closest available and tell me — I'll match the
banner/handle references. The **name** "Sage Academy" can be identical across many
channels; only the **@handle** must be unique.

## Upload defaults I'll apply per video (via API)
- Title: proof-framed (names a verifiable claim, not "X explained")
- Thumbnail: engine-rendered (`templates/thumbnail.html`)
- Description template: 1-line hook · what you'll build · **▸ Run it free: <lab link>** ·
  timestamps · "Proof, not paper — every concept ends in something you can run."
- Tags: topic + `sage academy, proof not paper, AI engineering`
- Category: Education · Language: per cut · Made-for-kids: No
- **AI-content disclosure:** toggled ON when a video uses generated voice/visuals (YouTube's "altered/synthetic media" setting) — honesty rule.

## Playlists (manual — API has no create/delete)
Your 10 saved personal playlists (System Design, Hacking, Coding…) are watch-lists,
not channel content — set them **Private** in Studio if you don't want them shown.
Create the content playlists as we ship series: "Agents in Production", "Build With
Me", "Proof in 100 Seconds", "How Senior Engineers Think".
