# RAG — the pilot (final: full North Star + Sync Law)

**One idea:** *Answer from the source — or don't answer.*
**Analogy:** closed-book vs open-book exam. **Voice:** ElevenLabs `eleven_v3` (expressive), Jason clone — dry, warm, scarred, 1:1.
**Handle (say twice, call back):** "Answer from the source — or don't answer."
**Passes the gate:** itch ✓ predict ✓ one-idea ✓ concrete-first ✓ analogy ✓ handle ✓ proof+door ✓ re-teachable ✓ · **+ personality:** scar ✓ hot-take ✓ humor ✓ end-question ✓ · **+ Sync Law:** every VO line has its visual on the beat ✓

> **Format — the Sync Law made visible.** Each row: **VO** (spoken) ‖ **[V]** the visual, timed to the words ‖ **[KEY]** the only text overlaid, on the spoken word. Visual carries it; text reinforces; logo only at open/close.

---

### 1 · COLD OPEN — the scar + "watch it break"  (0:00–0:25)
| VO | [V] on the beat | [KEY] |
|---|---|---|
| "Last year I shipped a chatbot to production. Three days in, it told a customer we had a thirty-day refund policy." | a real chat UI; the bot's reply types in: *"You have 30 days to request a refund."* | — |
| "Confident. Clean. …Total lie. We've never had one." | on **"lie"** → red ✗ stamps across the message | **MADE IT UP** |
| "It didn't malfunction — it did the most human thing there is. It didn't know… so it made something up. And here's the uncomfortable part: your AI is probably one line of code away from the exact same bug." | the message glitches; a single line of code faintly highlights | — |
| "I'll show you that line. But first — let's watch it break." *(open loop + ritual)* | hard cut to black → the demo | — |

### 2 · THE GUESS — make them predict  (0:25–0:40)
| VO | [V] | [KEY] |
|---|---|---|
| "So before I fix it: how would *you* stop a model from making things up?" | empty frame, a cursor blinks · **[beat: 1s silence]** | — |
| "Most people grab a bigger, smarter model. That's the trap. This was never a *knowledge* problem — it's an *honesty* problem." | on **"honesty"** the word lands alone, centered | **HONESTY, NOT SMARTS** |

### 3 · THE TURN + THE ANALOGY — the a-ha  (0:40–1:15)
| VO | [V] | [KEY] |
|---|---|---|
| "Here's the shift. Stop asking the model what it *knows*. Hand it the *source*, and make it answer from *that*." | — | — |
| "It's the difference between a closed-book exam…" | on **"closed-book"** → a closed book, a sweating student guessing | — |
| "…and an open-book one." | on **"open-book"** → the book opens, a finger on the line | — |
| "Closed book, it bluffs from memory. Open book, it reads you the actual page — and points at the line. That's RAG. Fancy name, simple move: fetch the right page first, then answer from it." | the diagram builds *in time with the words*: Question → **find the page** → Answer **[1]** | **FROM THE SOURCE** |

### 4 · RE-HOOK + SECOND FAILURE + THE REAL IDEA  (1:15–2:05)
| VO | [V] | [KEY] |
|---|---|---|
| "But watch — here's the part that took me way too long to learn." *(re-hook)* | tension: a held frame | — |
| "Most RAG tutorials stop right here. Retrieve, then answer. That's the easy half — and it's exactly why their demos look great and their production quietly lies." *(hot take)* | a "tutorial" thumbnail wall, then it cracks | — |
| "Because give our open-book AI a question the docs *don't* cover…" | an out-of-scope question types in | — |
| "…and it *still* makes something up." | on **"still"** → it invents an answer → red ✗ | **STILL GUESSING** |
| "We never gave it permission to do the one thing that builds trust. One line: if the page doesn't answer it — don't answer. Just say: I don't know." | a guardrail snaps on; reply becomes *"That's not in the documents."* → on **"I don't know"** green ✓ | **OR DON'T ANSWER** |
| "An AI that'll look you in the eye and admit it doesn't know? *That's* the whole difference between a demo… and something you'd put in front of a real customer." | split: demo (✗) vs production (✓) | — |

### 5 · THE PROOF — proof, not vibes  (2:05–2:25)
| VO | [V] | [KEY] |
|---|---|---|
| "And we don't take its word for it." | a faithfulness check begins to sweep the answers | — |
| "Every claim, traced to a real source. Green means grounded. Not 'seems better' — a *number* you could gate a deploy on." | on **"grounded"** → big green ✓ · *0 ungrounded claims* | **PROVEN, NOT VIBES** |

### 6 · HANDLE + END-QUESTION + SIGN-OFF  (2:25–2:48)
| VO | [V] | [KEY] |
|---|---|---|
| "So here's the whole thing, in seven words." | center stage clears | — |
| "Answer from the source — or don't answer. That's RAG that survives production." | the line types on, in sync, word by word | **Answer from the source — or don't answer.** |
| "You can build this exact thing, free, right in your browser — the door's in the description." | logo returns · **sageideas.dev/academy** | — |
| "And I'm genuinely curious — what's the worst hallucination *you've* ever shipped? Tell me below. Proof, not paper. I'll see you in the next one." *(end-question + sign-off)* | fade to the mark | — |

---

**Re-teach test:** after this, a viewer tells a friend — *"RAG is just: give the AI the source, and let it say 'I don't know.'"* That's the win.
**Owner note:** the cold-open scar is written generic-realistic; swap in a real one of yours to make it authentically you.
