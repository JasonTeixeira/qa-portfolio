# Sage Ideas Discord Proof Candidate Audit

Generated: 2026-06-26T05:17:46.546Z
Mutation mode: local_file_evidence_only
Status: blocked
Audit OK: yes

## Release Meaning

Candidate audit reads current evidence and explains what can be reviewed next. It does not create, approve, sync, publish, or satisfy operating proof.

## Metrics Snapshot

- approvedDiscordKnowledgeSources: 0
- ragDiscordSources: 0
- pendingKnowledgeCandidates: 0
- pendingPublicDrafts: 0
- publishedPublicDrafts: 0
- premiumMembers: 0
- premiumWorkflowProofs: 0

## Candidate Lanes

### Gateway message capture

- Key: gateway_capture
- Status: blocked
- Candidate state: needs_source_volume
- Current: 0/1
- Candidate count: 0
- Remaining: 1
- Admin surface: /admin/discord -> Gateway, Messages, Jobs, and Alerts panels
- Proving command: npm run discord:gateway-capture-diagnosis && npm run discord:proof-source-scan && npm run discord:proof-backlog
- Required fields: proof_cycle_key, source_record_id, source_url_or_path, source_created_at, title, summary, reviewer, reviewed_at, decision_reason, evidence_artifact_path, operator_attestation, privacy_status, worker_id, message_content_enabled, usable_message_id, capture_health

Blockers:
- Current proof is 0/1; lane remains blocked until the target is met.
- Gateway capture must show a fresh heartbeat, Message Content Intent metadata, and one usable non-bot non-empty message.

Next review action: Identify events show Message Content Intent enabled; redeploy the heartbeat metadata build only if future heartbeat rows still omit intent metadata.

### Approved Discord knowledge

- Key: approved_discord_knowledge
- Status: blocked
- Candidate state: needs_source_volume
- Current: 0/10
- Candidate count: 0
- Remaining: 10
- Admin surface: /admin/discord -> Content Queue, Drafts, and Knowledge Candidate review panels
- Proving command: npm run discord:operating-cycle:dry-run && npm run discord:proof-backlog
- Required fields: proof_cycle_key, source_record_id, source_url_or_path, source_created_at, title, summary, reviewer, reviewed_at, decision_reason, evidence_artifact_path, operator_attestation, privacy_status, source_type, reuse_category, rag_safe

Blockers:
- Current proof is 0/10; lane remains blocked until the target is met.
- Approved knowledge plus pending candidates is 0/10; more real member source material is needed.
- No pending knowledge candidates are available for admin review.
- Capture real member questions, helpful answers, builds, reviews, wins, or resources before approving knowledge.

Next review action: Approve high-signal questions, answers, resources, wins, reviews, or drafts from /admin/discord.

### Discord knowledge synced into RAG

- Key: rag_discord_sources
- Status: blocked
- Candidate state: needs_source_volume
- Current: 0/10
- Candidate count: 0
- Remaining: 10
- Admin surface: /admin/discord -> RAG Health, Corpus Health, and Eval Runs panels
- Proving command: npm run discord:operating-cycle && npm run rag:evaluate && npm run discord:smoke-final-scorecard
- Required fields: proof_cycle_key, source_record_id, source_url_or_path, source_created_at, title, summary, reviewer, reviewed_at, decision_reason, evidence_artifact_path, operator_attestation, privacy_status, rag_source_key, chunk_count, eval_or_retrieval_proof

Blockers:
- Current proof is 0/10; lane remains blocked until the target is met.
- Approved Discord knowledge available for RAG sync is 0/10.
- No approved Discord knowledge exists to sync into authoritative RAG.
- Latest RAG sync did not upsert approved Discord sources.

Next review action: Run the approved Discord RAG sync after approving knowledge candidates.

### Public proof growth assets

- Key: public_proof_assets
- Status: blocked
- Candidate state: needs_source_volume
- Current: 0/4
- Candidate count: 0
- Remaining: 4
- Admin surface: /admin/discord -> Public Proof Sources and Public Growth Drafts panels
- Proving command: npm run discord:operating-cycle && npm run discord:proof-backlog
- Required fields: proof_cycle_key, source_record_id, source_url_or_path, source_created_at, title, summary, reviewer, reviewed_at, decision_reason, evidence_artifact_path, operator_attestation, privacy_status, asset_type, utm_campaign, publish_status

Blockers:
- Current proof is 0/4; lane remains blocked until the target is met.
- Public proof source/draft volume is 0/4.
- Public proof drafts require approved Discord source material first.
- Dry run does not create public proof drafts.

Next review action: Create privacy-safe public proof drafts from approved Discord source material and approve/publish them weekly.

### Premium workflow proof

- Key: premium_workflow_proof
- Status: blocked
- Candidate state: needs_source_volume
- Current: 0/1
- Candidate count: 0
- Remaining: 1
- Admin surface: /admin/discord -> Premium, Office Hours, and Member Intelligence panels
- Proving command: npm run discord:smoke-premium-workflows && npm run discord:proof-backlog
- Required fields: proof_cycle_key, source_record_id, source_url_or_path, source_created_at, title, summary, reviewer, reviewed_at, decision_reason, evidence_artifact_path, operator_attestation, privacy_status, premium_path, authorization_evidence, sla_status, fulfillment_summary

Blockers:
- Current proof is 0/1; lane remains blocked until the target is met.
- No answered/completed premium review or completed office-hours workflow is visible in current evidence.
- Premium proof must show authorization, request/SLA state, and fulfillment outcome together; membership or queued requests alone do not count.

Next review action: Run one premium review, deeper-answer, or office-hours flow with a real or intentionally seeded premium scenario.

## Next Actions

- Identify events show Message Content Intent enabled; redeploy the heartbeat metadata build only if future heartbeat rows still omit intent metadata.
- Approve high-signal questions, answers, resources, wins, reviews, or drafts from /admin/discord.
- Run the approved Discord RAG sync after approving knowledge candidates.
- Create privacy-safe public proof drafts from approved Discord source material and approve/publish them weekly.
- Run one premium review, deeper-answer, or office-hours flow with a real or intentionally seeded premium scenario.

## Validation Failures

None.
