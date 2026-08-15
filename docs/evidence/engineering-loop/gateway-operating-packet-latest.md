# Gateway Operating Packet

Generated: 2026-06-30T13:25:43.250Z
Status: proven
Mutation mode: local_file_evidence_only

This gateway operating packet converts the latest diagnosis into a live proof contract. It does not run the worker, post messages, change Discord, mutate Supabase, classify messages, or satisfy operating proof.

## Target

- Current usable non-bot non-empty messages: 1/1
- Remaining: 0
- State: fresh_usable_message_proven
- Source evidence: docs/evidence/engineering-loop/discord-gateway-capture-diagnosis-latest.json
- Admin surface: /admin/discord -> Gateway operating packet, Gateway capture diagnosis, Jobs, Knowledge/RAG

## Signals

- Worker: sagebot-main
- Heartbeat fresh: true
- Heartbeat age minutes: 1
- Effective message content: true
- Signal source: heartbeat
- Identify created at: 2026-06-30T12:40:18.938637+00:00

## Required Fields

- proof_cycle_key: Weekly operating cycle key, for example 2026-W26.
- worker_id: Long-lived gateway worker id that produced the fresh heartbeat.
- heartbeat_status: Latest worker heartbeat status, such as ready, resumed, or heartbeat_ack.
- heartbeat_last_seen_at: Fresh heartbeat timestamp from discord_gateway_heartbeats.
- heartbeat_age_minutes: Heartbeat age at proof time; must be within the accepted freshness window.
- message_content_enabled: Boolean confirmation that Message Content Intent is enabled for the worker identify path.
- message_content_signal_source: heartbeat or identify_event source used for the intent proof.
- identify_event_created_at: Timestamp for the gateway_identify_sent event that proves current intent configuration.
- usable_message_id: discord_messages row id for the fresh non-bot non-empty member message.
- channel_base_name: Channel where the fresh member message was captured.
- author_bot: Must be false. Bot/system messages cannot prove community corpus capture.
- content_length: Captured message content length; must be greater than zero.
- captured_at: Timestamp for the captured message; must be after current Message Content-enabled identify evidence.
- deleted: Must be false. Deleted or cleanup rows cannot prove durable corpus capture.
- classification_state: Classifier/candidate state after capture, or explicit note that classification is the next step.
- dead_letter_count: Recent unresolved gateway dead-letter count at proof time.
- evidence_artifact_path: Path to the diagnosis JSON, dashboard screenshot, or proof artifact.
- operator_attestation: Plain-language statement of exactly what live capture was verified and what remains unverified.

## Acceptance Checklist

- Latest gateway heartbeat is fresh, from the intended long-lived worker, and has no unresolved fatal close code.
- Message Content Intent is proven by heartbeat metadata or a recent gateway_identify_sent event.
- A fresh non-bot, non-deleted member message exists in discord_messages with content_length greater than zero.
- The usable message was captured after the current Message Content-enabled identify event.
- Recent gateway dead letters are zero or explicitly reviewed and not related to message capture.
- The captured message can proceed to classifier and content queue review without exposing private data.
- Operator attestation identifies the worker id, channel, message row, captured_at, and evidence artifact.

## Reject If

- Only bot messages are captured.
- Non-bot messages exist but content_length is zero.
- The message row is deleted, synthetic, smoke-created, or from a local one-shot rehearsal.
- Message Content Intent is inferred from config text but no identify or heartbeat evidence exists.
- Heartbeat is stale, missing, or from an unrelated worker.
- Old non-empty deleted rows are being counted as current corpus proof.

## Live Proof Steps

- Keep the long-lived gateway worker running with Message Content Intent enabled.
- Post a fresh, harmless non-bot member message in an approved free channel.
- Run npm run discord:gateway-capture-diagnosis and confirm non_bot_non_empty is at least 1 from a non-deleted row.
- Run npm run discord:classify-messages and npm run discord:queue-content after explicit approval for live Supabase mutation.
- Approve useful candidates through /admin/discord before syncing anything into authoritative RAG.

## Verification Commands

- `npm run discord:gateway-operating-packet`
- `npm run discord:gateway-capture-diagnosis`
- `npm run discord:proof-source-scan`
- `npm run verify:local:evidence`

## Anti-Fake Rules

- This packet is not live capture proof; it is the contract for proving live capture.
- Do not count identify-only evidence without a fresh non-bot non-empty message row.
- Do not count empty content, bot messages, deleted messages, smoke rows, dry-run rows, or one-shot local rehearsal rows.
- Do not count stale heartbeat rows or heartbeat rows that lack a link to the current worker proof window.
- Do not count old non-empty messages captured before the current Message Content-enabled identify event.
- Do not claim Discord corpus readiness until capture, classification, candidate queueing, approval, and RAG sync are separately proven.

## Next Actions

- Run classifier and content queue jobs only with explicit approval for live Supabase mutation.
- Review resulting candidates in /admin/discord and approve durable knowledge items.
- Rerun proof-source scan after approvals.
