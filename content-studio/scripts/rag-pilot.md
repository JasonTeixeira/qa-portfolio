# RAG — the pilot (teaching-loop rewrite)

**One idea:** *Answer from the source, or don't answer.*
**Analogy:** closed-book vs open-book exam.
**Voice:** ElevenLabs `eleven_v3` (expressive), Jason clone. Warm, 1:1, contractions.
**On screen:** keywords only (in CAPS below), visuals carry the teaching, logo only at open/close.
**Passes the stickiness gate:** itch ✓ · predict ✓ · one idea ✓ · concrete-first ✓ · analogy ✓ · handle ✓ · proof + door ✓ · re-teachable in a sentence ✓.

> Legend — **VO:** spoken · **[V]:** what's on screen (visual does the work) · **[KEY]:** the only text overlaid · **[beat]:** silence.

---

### 1 · THE ITCH  (0:00–0:22)
**VO:** "Okay — watch this. I'm gonna ask this AI about my own company's docs. Simple question: *what's our refund window?*"
**[V]** a chat; the question types in.
**VO:** "...Thirty days. Confident. Clean."
**[V]** answer appears: **30 days.**
**VO:** "One problem. We don't *have* a thirty-day policy. It made that up."
**[V]** a red ✗ stamps over it. **[KEY]** MADE IT UP
**VO:** "And it's not broken. It did the most human thing there is — it didn't know... so it guessed. And a confident guess, in production? That's how you ship a lie."

### 2 · THE GUESS  (0:22–0:38)  — make them predict
**VO:** "So before I fix it — how would *you* stop a model from making things up?"
**[beat]** — one full second, empty screen.
**VO:** "Most people reach for a bigger, smarter model. That's the trap. Because this was never a *knowledge* problem. It's an *honesty* problem."

### 3 · THE TURN + THE PICTURE  (0:38–1:15)  — the a-ha, wrapped in the analogy
**VO:** "Here's the shift. Stop asking the model what it *knows*. Instead — hand it the *source*, and ask it to answer from *that*."
**VO:** "It's the difference between a closed-book exam... and an open-book one."
**[V]** a closed book (a nervous guess) → an open book (reading the page).
**VO:** "Closed book, it bluffs from memory. Open book, it reads you the actual page — and points at the line. *That's* RAG. Big scary name, simple move: fetch the right page first, then answer from it."
**[V]** Question → **find the page** → Answer **[1]** (diagram builds). **[KEY]** FROM THE SOURCE

### 4 · THE SECOND FAILURE + THE REAL IDEA  (1:15–2:00)
**VO:** "But watch — here's where almost everyone stops. And it's the mistake that matters."
**VO:** "Give our open-book AI a question the docs *don't* cover..."
**[V]** an out-of-scope question.
**VO:** "...and it *still* makes something up."
**[V]** it invents an answer → red ✗. **[KEY]** STILL GUESSING
**VO:** "Because we never gave it permission to do the one thing that actually builds trust."
**VO:** "One line. If the page doesn't answer it — *don't answer.* Just say: *I don't know.*"
**[V]** a guardrail snaps on → the model refuses → green ✓. **[KEY]** OR DON'T ANSWER
**VO:** "And *that* — an AI that'll look you in the eye and say 'that's not in the documents' — that's the whole difference between a demo... and something you'd put in front of a real customer."

### 5 · THE PROOF  (2:00–2:22)  — proof, not vibes
**VO:** "And we don't just take its word for it. We run a faithfulness check — every claim, traced back to a real source."
**[V]** a check sweeps the answers → all green.
**VO:** "Green means grounded. Not 'seems better.' A *number* you could gate a deploy on."
**[V]** big green ✓ · **0 ungrounded claims.**

### 6 · THE HANDLE + THE DOOR  (2:22–2:42)  — callback + tangible next step
**VO:** "So here's the whole thing, in seven words."
**[V]** the line types on, centered: **Answer from the source — or don't answer.**
**VO:** "*Answer from the source — or don't answer.* That's RAG that survives production."
**VO:** "And you can build this exact thing — free, right in your browser. The door's in the description."
**[V]** logo returns + **sageideas.dev/academy**
**VO:** "Proof, not paper. I'll see you in the next one."

---

## Why this sticks (self-check)
- **Itch** in 8 seconds (the lie), not a definition.
- **Predict** beat before the fix (they commit → the reveal lands).
- **One idea:** answer-from-source-or-refuse. Retrieval mechanics are *supporting*, not the point.
- **Analogy:** open-book exam — ties RAG to something everyone's lived.
- **Two productive failures** (makes it up → still makes it up) escalate to the real insight (abstention).
- **Handle:** "answer from the source, or don't answer" — quotable, repeated, callback-closed.
- **Proof + door:** the faithfulness check + the free lab. Tangible.
- **Re-teach test:** a viewer can now tell a friend *"RAG is just: give the AI the source, and let it say 'I don't know'"* — that's the win.
