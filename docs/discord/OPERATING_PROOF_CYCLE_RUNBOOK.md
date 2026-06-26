# Sage Ideas Discord Operating Proof Cycle

This runbook turns the remaining real-world blockers into a weekly operating loop. It does not pretend raw chat is curriculum and it does not publish public content without approval.

## Weekly Cycle

1. Review pending Discord applications and approve/reject inside Discord.
2. Review captured questions, answers, wins, resources, reviews, and build submissions in `/admin/discord`.
3. Approve only high-signal items into the content queue or final approved states.
4. After explicit approval, run `SAGE_ALLOW_DISCORD_OPERATING_CYCLE=approved npm run discord:operating-cycle`.
5. Review the generated public proof draft and approve/publish only if it is accurate and privacy-safe.
6. After explicit approval, run `SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate`.
7. Run `npm run discord:smoke-final-scorecard`.
8. Review `docs/evidence/discord-ai-os/phase-21-operating-proof-cycle.json`.

## What The Cycle Proves

- Approved Discord knowledge is synced into authoritative RAG.
- Raw/unapproved Discord chatter is excluded.
- One public proof draft can be created from approved source material.
- Applications, approvals, onboarded members, active members, premium members, public drafts, and RAG source counts are tracked.
- Remaining blockers are explicit instead of hidden.

## Four-Week Growth Proof

Run this once per week for four weeks. The growth loop should not be scored 95+ until the evidence shows:

- Public proof drafts are approved or published.
- Applications or apply clicks are attributed to the proof loop.
- Approved and onboarded members increase or stay healthy.
- Active members increase or stay healthy.
- Premium conversions or premium leads are measurable.

## Safety Rules

- Do not auto-publish externally.
- Do not approve raw private messages into RAG.
- Do not use member-specific private data in public proof.
- Do not count synthetic smoke rows as real operating proof.
