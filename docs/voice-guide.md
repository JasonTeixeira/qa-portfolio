# Sage Ideas — Voice Guide

> Locked during Phase 6. This is the voice. Every page, every email, every error state, every empty state. If it doesn't pass this bar, rewrite it.

---

## The one-line test

If you read a sentence and can't tell whether Sage Ideas wrote it or any other agency wrote it, **delete the sentence**.

---

## What we are

- A small studio that ships production systems for trading desks, fintechs, and ops teams who can't afford a vague engagement.
- Run out of Orlando by Sage. One operator, real receipts, no farmed-out work.
- Opinionated about the stack, the process, and the contract.

## What we are not

- An "innovative AI-powered solutions provider".
- A growth-hacked Webflow shop.
- A six-person team pretending to be twelve.

---

## Voice rules

### 1. Specific over impressive
- **No:** "We build cutting-edge solutions that drive results."
- **Yes:** "We shipped a real-time options book for AlphaStream in 11 weeks. p99 fill latency: 38ms."

### 2. Opinionated, not hedged
- **No:** "We can help you explore your AI options."
- **Yes:** "Most AI projects fail because the data pipeline is broken. We fix that first, then we ship the model."

### 3. Dry-funny, never quippy
- Allowed: a single dry aside per page. Usually inside a `// comment` or in a small caption.
- Not allowed: exclamation points, "Boom.", "Let's gooo.", emoji in marketing surfaces.

### 4. Verbs over nouns
- **No:** "Implementation of an enterprise-grade observability platform."
- **Yes:** "Wire Sentry, Grafana, and PagerDuty into one dashboard. Page the right human in 60 seconds."

### 5. Terminal cadence
- Short. Then short. Then a longer sentence when it earns it.
- Lists of three. Never lists of five.
- Headlines under 7 words when possible. Subheads under 18.

### 6. Honest before flattering
- We name what almost went wrong. Every case study has a "what almost happened" line.
- We say "we don't take this kind of work" out loud.

---

## Words we use

`ship`, `wire`, `instrument`, `harden`, `cut`, `migrate`, `unblock`, `production`, `receipts`, `the work`, `the stack`, `the contract`, `p99`, `uptime`, `the diff`, `before / after`

## Words we don't use

`solutions`, `synergy`, `leverage` (verb), `journey`, `unlock potential`, `cutting-edge`, `revolutionary`, `seamless`, `world-class`, `craft` (as a noun for code), `transform your business`, `next-level`, `boutique`, `bespoke` (overused), `innovative`, `passionate`

## Phrases we keep

- "We ship the boring part."
- "Receipts, not vibes."
- "If the data pipeline is broken, the model is theater."
- "Two-week kill switch in every contract."
- "Built by one operator. Audited by three."

---

## Per-surface defaults

### Headlines (H1)
- Under 7 words. Declarative. No questions.
- One verb minimum.
- Test: would this look good on a poster?

### Subheads (H2/H3)
- Under 14 words.
- Answers "so what" for the section that follows.

### CTAs
- Verb + object. Never "Learn more."
- Examples: "See the work", "Book a 20-min call", "Read the manifesto", "Wire the diff".

### Empty states
- One line of what's missing. One line of what to do next. Done.
- Example: "No projects yet. Start one with /book or hit ⌘K."

### Error states
- Honest. Specific. No "Oops!".
- Example: "Couldn't reach the server. Try once more, or email sage@sageideas.dev — I'll see it."

### 404
- Owns the miss. Offers the next move.
- Example: "Route not on the map. Try ⌘K, or go home."

### Microcopy in forms
- Labels: noun. Placeholders: example, not instruction.
- "Email" / "you@company.com" — not "Enter your email address"

---

## Cyberpunk terminal cadence (visual + copy interaction)

- Use `sage-prompt` `$` lines for diegetic UI text (commands, statuses).
- Use `// comment` style for dry asides — must be inside `{'// ...'}` JSX strings.
- Never mix marketing voice with terminal voice in the same sentence. Pick one.

---

## The manifesto paragraph (canonical)

> Most agency sites are theater. Logos you can't verify, testimonials from clients who never agreed to be quoted, mockups for products that never shipped. Sage Ideas is one operator in Orlando shipping production systems for trading desks and fintechs that can't afford a vague engagement. Every project on this page has a build log, a contract, and a kill switch. If you're here to compare us to a thirty-person agency, we're not the right shop. If you're here because the last vendor disappeared mid-sprint and you need someone who'll actually pick up the phone — we should talk.

This paragraph is the screenshot moment. It should appear on `/about`, `/pov`, and (compressed to 3 lines) on the homepage Manifesto act.
