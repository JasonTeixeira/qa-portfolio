# Flagship #1 — "What is RAG, really?"

**Format:** long-form ~6 min · **Series:** Build With Me / Concepts · **Proof:** grounded answer + abstention + an automated faithfulness check that goes green.
**CTA:** run it free → the interactive RAG Lab (`/academy/labs/rag-grounded-docs-qa`).
**Narration voice:** ElevenLabs `MJdPGZVWOz3O2iOT7cx5` (Jason — Sage narration).
**Thumbnail:** `renders/thumb-rag-hero.png`.

> Direction: build-with-me. Show it **hallucinate first**, then fix. Every claim
> ends in something that runs. No hype, no "INSANE." Numbers on screen are real.

---

### 0:00 — Cold open (hook)
**VISUAL:** hero-rag-1 art, title card "What is RAG, really?"; then cut to a terminal.
**NARRATION:** "Ask a language model about your own documents, and it will do something dangerous — it'll answer confidently, and make it up. Watch."
**VISUAL:** prompt "What's our refund window?" → model invents "30 days" (red ✗ *not in any doc*).
**NARRATION:** "There's no refund policy in its training data. It guessed. In production, that's how you ship a lie. RAG is how you fix it — and the part everyone skips is teaching it to say *'I don't know.'*"

### 0:35 — The frame (what RAG actually is)
**VISUAL:** clean diagram — Question → [Retrieve top-k from your docs] → [Answer using only that] → grounded answer + citation.
**NARRATION:** "RAG is two moves. Retrieve the passages that are actually relevant. Then answer using *only* those — and cite them. That's it. The model stops guessing because you handed it the source."

### 1:15 — Build it (retrieve)
**VISUAL:** code, stepped: chunk docs → embed → `ctx = search(query, k=4)`. Show 4 real passages returned.
**NARRATION:** "We split the docs into chunks, embed them, and for any question pull the four closest passages. No magic — nearest-neighbor search over meaning."

### 2:20 — Answer from context
**VISUAL:** `answer = llm(query, ctx)` → correct grounded answer + a [1] citation to the real passage.
**NARRATION:** "Now we hand those passages to the model and ask it to answer from them, with a citation. Same question — now it's right, and it shows its source."

### 3:10 — The part tutorials skip: abstention
**VISUAL:** ask something NOT in the docs → naive RAG still invents an answer (red ✗).
**NARRATION:** "But here's the trap. Ask something the docs don't cover, and a naive RAG still makes something up — because we never told it it's allowed to refuse."
**VISUAL:** add the rule: "if the passages don't answer it, say you don't know" → same question → *"That's not covered in the provided documents."* (green ✓)
**NARRATION:** "One instruction, one guardrail: if the context doesn't contain the answer, don't answer. Now it refuses instead of lying. That single behavior is the difference between a demo and something you'd put in front of a customer."

### 4:10 — Prove it (no vibes)
**VISUAL:** an automated faithfulness check runs over a test set → every answer traced to a source or correctly abstained → **✓ grounded · 0 ungrounded claims**.
**NARRATION:** "And we don't take its word for it. A faithfulness check scores every answer against its sources — is each claim actually supported? Green means grounded. That's the proof. Not 'seems better' — a number you can gate a deploy on."

### 5:00 — Close + CTA
**VISUAL:** recap card (retrieve · answer-from-source · abstain · verify) → Cloud Native mark → link.
**NARRATION:** "Retrieve, answer from the source, refuse when you can't, and verify it's grounded. That's RAG that survives production. You can build this exact thing — it runs in your browser, free, no signup — at sageideas.dev/academy. Proof, not paper. I'll see you in the next one."

---

## Shorts cuts (from this source)
1. **0:00–0:35** the hallucination → "it guessed" (the hook). CTA: full video.
2. **3:10–4:10** abstention — "one instruction stops it lying." Strongest standalone.
3. **4:10–5:00** the faithfulness check going green — "prove it, no vibes."

## Production checklist
- [ ] Narrate each block via ElevenLabs (Jason Sage voice) → per-scene audio.
- [ ] Hero art: reuse hero-rag-1; generate 1–2 more scene visuals if needed (Higgsfield).
- [ ] Build hyperframes composition (reuse academy diagram/scene components for the RAG diagram + code walkthrough + the green-check proof).
- [ ] Captions (.vtt) — accessibility + silent autoplay.
- [ ] Thumbnail: `thumb-rag-hero.png` (done).
- [ ] Upload via Composio `YOUTUBE_UPLOAD_VIDEO` + set thumbnail + description (Lab link) + AI-disclosure ON.
