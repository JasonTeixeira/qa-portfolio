# Sage Academy — Developer Handoff (Next.js implementation spec)

The design source of truth is the set of `Sage *.dc.html` files in this project — every screen,
state, and flow is built and interactive. This doc maps them to a production Next.js build.

## Stack recommendations
- **Framework**: Next.js (App Router) — matches the existing sageideas.dev repo
- **Auth**: Clerk or NextAuth — GitHub + Google OAuth, email/password, email verification codes,
  password-reset flow (all three flows are designed in `Sage Auth.dc.html`)
- **Billing**: Stripe — plans: monthly $29 / annual $250 / team $190-seat (NET-30 invoicing).
  Proration both directions (see `Sage Checkout.dc.html` copy). Cancel/pause/downgrade flows in
  `Sage Cancel.dc.html` — pause = Stripe pause_collection, 2 months.
- **Email**: Resend. Five templates + sending rules (triggers, rate limits, opt-outs) fully
  specced in `Sage Emails.dc.html` (see the SPEC note under each template).
- **Labs**: Pyodide (Python in-browser) for lesson labs; check runner compares structured output.
  Lab UX reference: `Sage Lab.dc.html` (starter-fails-on-purpose, hint tracking for badges).
- **AI (Sprout)**: Anthropic API server-side. Four integrations, system prompts already written:
  1. Ask Sprout tutor — `Sage Lesson Player.dc.html` (Socratic, never the lab answer)
  2. Teachback grading — same file (VERDICT: HELD|GAPPED first-line contract)
  3. Lab hints — `Sage Lab.dc.html` (<45 words, no code, taking a hint voids No-Hint badge)
  4. Weekly read + transfer prompts — `Sage Dashboard Cockpit.dc.html`, `Sage Recall Queue.dc.html`
- **Recall scheduling**: FSRS (open-source implementations exist) — windows 1/3/7/30d.
- **OG images**: @vercel/og — share-card design in sage-widgets.js (SageShare component).
- **Analytics**: PostHog (self-hosted per privacy policy) + Sentry.
- **Search**: pg_trgm or Typesense across lessons + field notes.
- **Verification endpoint**: public `GET /verify/:certId` returning JSON
  `{ status, issued, proofs_holding, revoked }` — the product's signature move.

## Page map (design file → route)
| Design file | Route |
|---|---|
| Sage Home.dc.html | / |
| Sage How It Works.dc.html | /how-it-works |
| Sage Why Proof.dc.html | /why-proof |
| Sage Courses.dc.html | /courses |
| Sage Course Landing.dc.html | /courses/[slug] |
| Sage Pricing.dc.html | /pricing |
| Sage Field Notes.dc.html | /notes |
| Sage Field Note Article.dc.html | /notes/[slug] |
| Sage About.dc.html | /about |
| Sage Help.dc.html | /help |
| Sage Legal.dc.html | /terms, /privacy, /refunds (tabs → routes) |
| Sage 404.dc.html | not-found.tsx |
| Sage Auth.dc.html | /signin (modes: signup/login/reset/verify) |
| Sage Onboarding.dc.html | /welcome (5 steps) |
| Sage Checkout.dc.html | /checkout (Stripe Elements) |
| Sage Cancel.dc.html | /account/cancel |
| Sage Settings.dc.html | /account |
| Sage Dashboard Cockpit.dc.html | /app (NBA states: repair/recall/continue/post-failure/promotion-week/first-session) |
| Sage Course Map.dc.html | /app/course/[slug] |
| Sage Lesson Player.dc.html | /app/lesson/[id] (14-block arc, j/k/c keys, Ask Sprout) |
| Sage Lab.dc.html | /app/lab/[id] |
| Sage Recall Queue.dc.html | /app/recall |
| Sage Daily Rep.dc.html | /app/rep |
| Sage Progress.dc.html | /app/progress (incl. concept-level skill graph) |
| Sage Leagues.dc.html | /app/leagues (+ cohort invite) |
| Sage Weekly Challenge.dc.html | /app/challenge |
| Sage Evidence Portfolio.dc.html | /app/evidence |
| Sage Public Profile.dc.html | /@[handle] (public) |
| Sage Certificate.dc.html | /certificates/[id] (public) |
| Sage Placement.dc.html | /app/placement |
| Sage Team Admin.dc.html | /team (admin role) |
| Sage Emails.dc.html | email templates (Resend/react-email) |

## Shared components (sage-widgets.js → React)
- SageState → real per-user state (the localStorage keys show exactly which state must sync
  across screens: lesson completion, gate passes, recallDue, dailyRepDone, streak, badges)
- sage-app-nav → post-login nav (current-page highlight, hides <1080px)
- sage-notify → recall due pill + notification bell (3 event types wired)
- sage-chat → Sprout marketing-site helper (keyword replies designed; upgrade to real AI)
- sage-share → share-card modal (→ @vercel/og image + share intents)
- sage-lang-switch → i18n (EN/ES/ZH/HI/PT/FR translations already written in page dicts —
  extract to next-intl message files)

## Data model sketch
users, subscriptions, teams, team_members, courses, modules, lessons, labs,
proofs (user_id, lesson_id, verdict, artifact_url, eval_score), artifacts,
recall_cards (fsrs state), streaks, badges, leagues + league_members,
challenges + challenge_entries, certificates (public, revocable), notifications.

## Non-negotiable product rules (from the designs)
1. Score = min(proof scores), never average. Cap always names its repair.
2. Certificates verify by public endpoint; revoke only on failed proofs.
3. XP from shipped proofs + held recalls only — never logins.
4. Managers see verdicts/artifacts/mastery — never activity surveillance.
5. Email rules: recall fires only when due; digest skips inactive weeks;
   streak-at-risk max once/day at 19:00 local; receipts unmutable.
6. Cancel = two clicks. Guarantee = reply "guarantee", same-day refund.
7. Sprout nudges, never spoils. Hints are tracked (No-Hint Repair badge).

## SEO / OG meta spec (per public page)
Global: dark OG frames via @vercel/og using the share-card design (◆ mark, Fraunces headline,
mono kicker, #0B0B0E bg, #3D5AFE accent). Twitter card: summary_large_image. Canonicals on all.

| Route | <title> | Description | OG headline |
|---|---|---|---|
| / | Sage Academy — Learn to think like a senior engineer, and prove it | 23 courses that end in evidence a reviewer trusts — not a certificate of completion. | Prove it — no vibes. |
| /how-it-works | The Mastery Loop — How Sage Academy works | Ten moves senior engineers run on autopilot, each ending in something a reviewer can inspect. | Frame it. Map it. Prove it. |
| /why-proof | Why Proof — the Sage Academy manifesto | Certificates claim; ledgers show. Why every lesson ends in a check a skeptic can run. | A map you can defend beats a diagram of everything. |
| /courses | Course catalog — 23 courses, 448 lessons | Every course ends in an artifact a reviewer trusts. Six live, seventeen on the same engine. | Courses that end in artifacts. |
| /courses/[slug] | {Course} — Sage Academy | {outcome sentence} · {n} lessons · final artifact: {artifact} | {course name} |
| /notes | Field Notes — real incidents, mapped in public | 62 free engineering field notes. Every note routes into the sprint that trains the skill. | Real incidents, mapped in public. |
| /notes/[slug] | {Note title} — Field Notes | {dek, ≤155 chars} | {note title} |
| /pricing | Pricing — one membership, every course | $29/mo or $250/yr, everything included. 14-day honest guarantee: no proof shipped, full refund. | You're buying a body of work. |
| /about | About — why Sage Academy exists | The difference between engineers isn't what they know. It's what they can defend. | Confident guesses end here. |
| /@[handle] | {Name} — verified engineering portfolio | {n} proofs held · certificates verifiable by code. Pick any claim, follow the artifact. | {name}'s evidence ledger |
| /certificates/[id] | Certificate {id} — verifiable | Issued by code, revocable by code. Run the curl to verify. | curl sageideas.dev/verify/{id} |

Sitemap: marketing + notes + public profiles + certificates. noindex: /app/*, /account, /team, /checkout.
JSON-LD: Course + Organization on course pages; Article on notes; Person on profiles.

## Print spec
Certificate page carries data-noprint attributes on nav/actions; print stylesheet hides them
(implemented in the design). PDF export = puppeteer print of /certificates/[id] at A4 landscape.
