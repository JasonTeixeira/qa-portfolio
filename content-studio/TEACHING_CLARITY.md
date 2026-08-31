# Teaching Clarity Standard — THE global template (LOCKED)

> **This is the canonical, non-negotiable standard for EVERY Sage Academy video and academy
> lesson.** It supersedes the old "clever, scarred, cold-open" voice ([[TEACHING_VOICE]] now
> governs only visuals/Sync-Law/warmth). No video ships that doesn't follow the spine + language
> rules below. Approved by Jason 2026-08-31 after the first 8 AI-Engineering videos.

The old "clever" voice was ambiguous and didn't land. This replaces it.
**Goal: a smart beginner watches once and can re-explain it to a friend.** Clarity over cleverness, always.

## The fixed spine (every video, in this order)
1. **Welcome + promise** — "Welcome back. Today you'll learn X. By the end, you'll be able to Y." Say exactly what they'll walk away with.
2. **The problem** — one plain, concrete scenario. Show the pain simply. Name it.
3. **Why the obvious fix fails** — kill the wrong assumption early (optional but great).
4. **The core idea + one analogy** — explain the fix in plain words, then an everyday analogy a child would get.
5. **How it works, step by step** — "Step one… Step two…" One idea per step. Define every term the instant you use it.
6. **A real example, start to finish** — one concrete, relatable walk-through. Show it actually working.
7. **Common mistakes** — "Here are the mistakes people make. One… Two… Three…"
8. **Recap** — "So today you learned: 1, 2, 3, 4." Reinforce the exact takeaways from step 1.
9. **CTA** — academy + sign-off.

## Language rules (non-negotiable)
- **One idea per sentence.** Short sentences. If a sentence has two ideas, split it.
- **Define every term the moment it appears**, in plain words. ("a vector — just a list of numbers that captures meaning.")
- **Concrete before abstract.** Always lead with a real, everyday example, then the general rule.
- **Signpost constantly:** "First… Next… The problem is… The fix is… For example… So, to recap…" The viewer should never wonder where they are.
- **Direct address:** "you", "let's", "we". You're talking to one person.
- **No cold opens that confuse.** Open by telling them what they'll learn. Curiosity comes from a clear promise, not a riddle.
- **Explain like they're smart but brand new.** Never assume jargon. Never dumb down the idea — just make the words simple.
- **Every sentence earns its place.** If it doesn't help them understand, cut it.

## The test (must pass)
After watching, the viewer can finish these out loud:
- "The problem was ______."
- "The fix is ______."
- "It works by ______."
- "The mistake to avoid is ______."
If any blank is fuzzy, the script failed. Rewrite it.

## Note on the old bible
`TEACHING_VOICE.md` (Sync Law, personality) still governs VISUALS and pacing — keep the Sync Law
(show what you say) and warmth. But the SCRIPT STRUCTURE + LANGUAGE follow THIS file now. Clear wins.

---

## THE REUSABLE SCRIPT TEMPLATE (copy this for every new video)
Fill each beat with one clear chunk of narration (1–3 sentences). Keep the labels as your guide.
Scaffold lives at `scripts/scenes/_TEMPLATE.mjs` — copy it, rename, fill in.

```
['01', WELCOME + PROMISE — "Hey, welcome back. Today you're going to learn <X>. By the end, you'll <Y>."],
['02', THE PROBLEM (setup) — one concrete, everyday scenario. Name the pain.],
['03', THE PROBLEM (payoff) — show it go wrong; name the concept in plain words.],
['04', WHY THE OBVIOUS FIX FAILS — kill the wrong assumption. (optional but great)],
['05', THE CORE IDEA + ANALOGY — the fix in plain words, then a kid-simple everyday analogy.],
['06', HOW IT WORKS — step one. One idea. Define every term.],
['07', HOW IT WORKS — step two. (add more step beats as needed)],
['08', THE CRUCIAL EXTRA / the part people skip. (optional)],
['09', A REAL EXAMPLE — one concrete walk-through, start to finish, showing it work.],
['10', COMMON MISTAKES — "Here are the mistakes people make. One… Two… Three…"],
['11', RECAP — "So today you learned: 1, 2, 3, 4." Mirror the promise from beat 1.],
['12', CTA — "Build this yourself, free, at sageideas dot dev slash academy. Proof, not paper. See you in the next one."],
```

## Composition mapping (how the script becomes the video)
- **One script beat = one composition beat** (same key). Each beat gets a **kicker** that signposts
  the section: `TODAY YOU'LL LEARN` · `THE PROBLEM` · `THE FIX` · `HOW IT WORKS · STEP 1` ·
  `A REAL EXAMPLE` · `COMMON MISTAKES` · `RECAP`.
- Each beat's centerpiece is a **warehouse primitive** (`library/primitives.js`) that SHOWS the idea;
  a small caption/`key` reinforces. Never a wall of text (Sync Law + picture-superiority).
- Intro + recap use `P.steps`; problems use `P.chat`; mechanisms use `P.flow`; data uses charts.
- Pace with **dwell** (`build-vo.mjs --hold ~2.0`) so each idea sits long enough to absorb.

## Pipeline (every video, same 6 commands)
1. `scripts/scenes/<slug>.mjs` — write the script to the template.
2. `node scripts/gen-vo-generic.mjs --scenes scripts/scenes/<slug>.mjs --out renders/vo-<slug>`
3. `video/<slug>.html` — beats built from `library/primitives.js` + `mount()`.
4. `node scripts/build-vo.mjs --in renders/vo-<slug> --out renders/video/vo-<slug>.mp3 --durs renders/vo-<slug>/beat-durs.json --hold 2.0`
5. `node scripts/render-motion.mjs --comp video/<slug>.html --audio renders/video/vo-<slug>.mp3 --words renders/vo-<slug>/words.json --durs renders/vo-<slug>/beat-durs.json --out renders/video/<slug>.mp4`
6. thumbnail (thumbnail-recipe.md) → add to gen-descriptions.mjs CFG → `node scripts/yt-native.mjs --only <slug>`

## Definition of done (must all be true before publish)
- [ ] Opens with "here's what you'll learn today"
- [ ] Problem stated in one plain, concrete scenario
- [ ] Exactly one everyday analogy for the core idea
- [ ] Numbered "step one / step two" walk-through; every term defined on first use
- [ ] One real example shown working, start to finish
- [ ] Named common mistakes (1, 2, 3)
- [ ] Recap mirrors the opening promise
- [ ] Passes the test: viewer can fill "the problem was ___ / the fix is ___ / it works by ___ / the mistake is ___"
