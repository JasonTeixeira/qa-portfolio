# Discord Security, Privacy, And Abuse Runbook

This runbook defines the Phase 18 operating posture for Sage Ideas Discord and SageBot.

## Access Model

- Unapproved members should only see `start-here` and the native Discord application flow.
- Approved free members can see free learning, questions, build, resources, and showcase channels.
- Premium members can see premium channels only after Stripe/Supabase role sync or manual admin assignment.
- `team-ops` is restricted to moderators, admins, and SageBot.
- SageBot needs the least privilege required for command handling, posting, role assignment, and operations logging.

## Admin Mutations

- Every admin dashboard mutation must call `requireAdmin()`.
- Discord interaction requests must pass Ed25519 signature verification and timestamp freshness.
- Discord interaction routes must rate limit by request headers before command execution.
- Security audit runs are stored in `discord_security_audit_runs`.

## AI Input Safety

- RAG questions and premium questions reject prompt injection attempts.
- AI input rejects secrets, credentials, emails, phone numbers, and private member/client data.
- Discord-originated content is treated as untrusted until reviewed or approved.
- Public proof content must pass privacy scoring and should be anonymized by default.

## Abuse Workflow

- `/report` records member reports and classifies spam, harassment, credential leaks, prompt injection, or review-needed content.
- Abuse reports are routed to `team-ops` for human review.
- Moderators decide whether to warn, mute, remove, ban, or mark false positive in Discord.
- Automated ban/mute is intentionally not enabled until reviewed against false-positive risk.

## Retention And Privacy

- Raw Discord messages should be retained only while useful for moderation, community intelligence, or RAG candidate review.
- Approved RAG knowledge can be retained until superseded, deleted, or requested for removal.
- Security audit rows should be retained for operational audit history.
- Public proof requires anonymization or explicit permission before using identifiable member work.

## Export And Delete Plan

For a member privacy request, search by Discord user id across member profile, application, message, question, answer, submission, points, events, content queue, and premium request tables.

- Export: provide member-owned rows and derived community profile data.
- Delete: remove or anonymize member rows that are not needed for security, billing, or abuse audit.
- Rebuild: if deleted content was approved into RAG, mark that source removed and re-run the RAG sync/re-embed flow.

## Phase 18 Proof

Run:

```bash
npm run test:unit
npm run typecheck
npm run discord:smoke-security-privacy
npm run build
```

The smoke test writes `docs/evidence/discord-ai-os/phase-18-security-privacy-abuse.json`.
