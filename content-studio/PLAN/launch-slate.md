# Launch Slate — first 20 (YouTube ⇄ Academy double-duty)

**Rule:** one video = one idea = one academy lesson. 2–4 min each. Every title is a
curiosity gap; every video ends with the learner holding one tangible thing.
Thumbnail keyword is the `<hl>` word in the isometric hybrid template. Analogy is the
open-book/closed-book-style hook that makes it STICK. Voice + Sync Law per TEACHING_VOICE.md.

Series buckets (become YouTube playlists + academy tracks):
- **SB — Systems, Backwards** (how real systems actually break)
- **AI — AI That Ships** (LLM/RAG/eval, the un-hyped version)
- **CR — The Craft** (idempotency, retries, the moves seniors internalize)

| # | Series | Title (curiosity gap) | The one idea | Analogy | Thumb keyword |
|---|--------|------------------------|--------------|---------|---------------|
| 01 | AI | The RAG mistake that makes your bot lie | Answer from the source — or don't answer | Open-book exam | ANSWER / ABSTAIN |
| 02 | CR | Why your payment charged twice (and the one-liner that fixes it) | Idempotency: retries are reads, not new charges | Coat-check ticket | IDEMPOTENT |
| 03 | SB | Your cache isn't fast — it's lying to you | Stale reads are a correctness bug, not a speed feature | Yesterday's newspaper | STALE |
| 04 | SB | The load balancer that sent everyone to the dead server | Health checks decide truth; a bad check is worse than none | Bouncer waving in ghosts | HEALTH |
| 05 | CR | Retry storms: how "just try again" took down prod | Backoff + jitter, or you DDoS yourself | Everyone redials at once | BACKOFF |
| 06 | SB | The database index that made things slower | An index is a bet; the wrong bet costs writes | Over-tabbed binder | INDEX |
| 07 | AI | Your LLM eval is graded by vibes. Here's the fix | Ground truth + a rubric beats "looks good to me" | Grading with an answer key | RUBRIC ≥ 80 |
| 08 | SB | Why 200 OK can still mean everything is broken | The status line lies; assert on the body | Smiling waiter, wrong dish | 200 ≠ OK |
| 09 | CR | The queue that quietly dropped your jobs | At-least-once + dedupe, or you lose work silently | Mailbox with no receipt | AT-LEAST-ONCE |
| 10 | SB | The single shard that ate your whole weekend | Hot keys break sharding; pick the key on purpose | One checkout lane, whole store | HOT KEY |
| 11 | AI | Prompt injection: the input that owns your agent | Untrusted text is code; isolate it | A note that reads itself aloud | UNTRUSTED |
| 12 | CR | Timeouts: the setting nobody sets until 3am | No timeout = infinite wait = cascading failure | Holding for a call that never ends | TIMEOUT |
| 13 | SB | Why "add a server" made it slower | Coordination cost can outrun the extra capacity | Too many cooks | COORDINATION |
| 14 | CR | The migration that locked your table for 40 minutes | Online + backfill in batches, never one big lock | Repaving one lane at a time | ONLINE |
| 15 | AI | Chunking: the boring choice that decides RAG quality | Retrieval is only as good as your chunks | Tearing a book at the wrong seams | CHUNK |
| 16 | SB | Idempotency keys vs. the double-click | The client will double-fire; design for it | Elevator button, pressed twice | DOUBLE-FIRE |
| 17 | CR | Circuit breakers: how to fail on purpose | Trip fast, recover slow — protect the healthy path | Fuse box, not a fire | TRIP |
| 18 | SB | The log that cost you $9,000 | Cardinality explodes cost; log events, not everything | A diary of every blink | CARDINALITY |
| 19 | AI | Why your embeddings retrieved garbage | Distance ≠ relevance without the right space | Nearest by address, not by need | DISTANCE ≠ RELEVANCE |
| 20 | CR | The feature flag that never got removed | Flags are debt with a deadline | Scaffolding left on the building | FLAG DEBT |

## Production cadence
- **Batch of 5 per week** → 4 weeks to the full slate (leaves room for reshoots).
- Pipeline per video: pick row → write script to spine (TEACHING_VOICE §2) → VO in Jason
  v3 + word-timestamps → assemble ported scenes (Sync Law) → `render-video.mjs` → 3-ratio
  thumbnail (hybrid-thumb.html) → queue upload (Composio) → publish academy lesson.
- **Playlists:** SB / AI / CR — each gets a playlist cover (same isometric hybrid, series color).
- **Academy:** each video's one-idea becomes a lesson (scene = the same composition, no re-work).

## IG cut (parallel, after first 5 YT land)
- Each video → one 9:16 cut (`--w 1080 --h 1920`, reuse render-video.mjs) capped ~45s:
  cold-open beat + the turn + the proof + end-card. Same VO, tighter.
- Feed carousel: 4x5 isometric hybrid (hero + the one idea) → drives to YouTube/academy.
