# Discord Scale And Failure Readiness Runbook

This runbook defines the Phase 19 operating posture for scaling Sage Ideas Discord without breaking onboarding, content jobs, RAG, points, or moderation.

## Load Policy

- Do not load test by spamming live Discord channels.
- Use synthetic load models for 100, 500, 1,000, and 5,000 member scenarios.
- Use isolated smoke tests for real side-effect proof.
- Treat Discord API `429` responses as expected provider pressure, not as crashes.

## Job Failure

1. Open `/admin/discord#jobs`.
2. Review `discord_job_runs` for `failed` or `dead_lettered` rows.
3. If retryable, use the dashboard retry action or `retryDiscordDurableDeadLetter`.
4. If publish-related, verify no duplicate Discord post was created before retrying.
5. If non-retryable, resolve with admin notes and create a follow-up content/task item.

## Discord API Outage Or 429 Spike

1. Pause publish jobs; drafts may continue.
2. Leave approval queues open, but do not force posting.
3. Retry only after `retry_after` windows or provider recovery.
4. Confirm the gateway heartbeat is fresh and dead letters are not growing.

## Supabase Outage Or Latency

1. Treat command writes, role sync, points, and content approvals as degraded.
2. Do not manually award points unless the ledger is writable.
3. Re-run stuck durable jobs after the database recovers.
4. Check `discord_scale_readiness_runs`, `discord_job_runs`, and `discord_gateway_dead_letters` after recovery.

## Bad Post Rollback

1. Delete or edit the bad Discord message manually.
2. Mark the source draft rejected or corrected.
3. Add a content quality note explaining the failure.
4. If it came from RAG, mark the source stale/blocked and re-run RAG sync.

## Bad Point Award Reversal

1. Do not edit historical ledger rows directly.
2. Add a compensating negative ledger entry with the same source context.
3. Rebuild leaderboard snapshots if the award affected a weekly result.
4. Add an admin note if abuse or farming was involved.

## RAG Quality Regression

1. Review failed evals and failed source citations.
2. Block low-quality or private Discord knowledge candidates.
3. Re-run RAG sync/re-embed only after source approval is fixed.
4. Do not lower citation or faithfulness gates to make a release pass.

## Phase 19 Proof

Run:

```bash
npm run test:unit
npm run typecheck
npm run discord:smoke-scale-failure
npm run build
```

The smoke test writes `docs/evidence/discord-ai-os/phase-19-scale-failure-readiness.json`.
