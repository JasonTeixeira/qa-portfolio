# Sage Ideas Discord Weekly Proof Packet

Generated: 2026-06-26T03:07:56.929Z
Mutation mode: local_file_evidence_only
Backlog status: blocked
Packet OK: yes

## Release Meaning

Weekly proof packet is an operator collection template. It does not create or satisfy operating proof without real approved Discord, RAG, public proof, and premium records.

## Weekly Intake Order

1. Confirm gateway capture is healthy before reviewing downstream knowledge candidates.
2. Review candidates and fill required proof fields.
3. Reject private, generic, low-context, or unsupported material.
4. Approve reusable knowledge and sync only approved items into RAG.
5. Create privacy-safe public proof assets from approved sources.
6. Fulfill and log one premium path when premium activity exists.
7. Rerun operating cycle, proof backlog, operator brief, and final scorecard.

## Proof Lanes

### Gateway message capture

- Key: gateway_capture
- Status: blocked
- Current: 0/1
- Remaining: 1
- Admin surface: /admin/discord -> Gateway, Messages, Jobs, and Alerts
- Source tables: discord_gateway_heartbeats, discord_gateway_events, discord_messages, discord_gateway_dead_letters
- Verify: npm run discord:gateway-capture-diagnosis && npm run discord:proof-source-scan && npm run discord:proof-backlog
- Evidence paths: docs/evidence/engineering-loop/discord-gateway-capture-diagnosis-latest.json, docs/evidence/engineering-loop/discord-proof-source-volume-scan-latest.json, docs/evidence/engineering-loop/discord-proof-backlog-latest.json

Required intake template:
```json
{
  "proof_cycle_key": "<YYYY-W##>",
  "source_record_id": "<source_record_id>",
  "source_url_or_path": "<source_url_or_path>",
  "source_created_at": "<ISO timestamp>",
  "title": "<title>",
  "summary": "<summary>",
  "reviewer": "<reviewer>",
  "reviewed_at": "<ISO timestamp>",
  "decision_reason": "<decision_reason>",
  "evidence_artifact_path": "<evidence_artifact_path>",
  "operator_attestation": "<what was verified and what remains unverified>",
  "privacy_status": "<public | anonymized | permissioned | private_blocked | rejected>",
  "worker_id": "<worker_id>",
  "message_content_enabled": "<message_content_enabled>",
  "usable_message_id": "<usable_message_id>",
  "capture_health": "<capture_health>"
}
```

Accept:
- Gateway heartbeat is fresh and tied to the current worker build.
- Message Content Intent metadata is present and enabled.
- At least one fresh non-bot message is captured with non-empty content.
- No recent dead letters or close codes invalidate the capture proof.

Reject:
- Deleted, bot-only, or empty-content messages.
- Stale heartbeat rows or worker metadata that does not expose Message Content Intent state.
- Gateway close codes, dead letters, or invalid sessions that make capture unreliable.

Privacy:
- Use only content that is visible in approved free/community channels.
- Do not promote private, deleted, moderation-sensitive, or member-identifying content into public proof without review.

Quality gates:
- Proof must come from real operating data or explicitly approved historical backlog, not synthetic smoke data.
- Proof must have a reviewer, timestamp, source id, evidence artifact, and decision reason.
- Proof must be tied to a blocked proof lane and weekly cycle key.
- Proof must be reproducible from the listed admin surface, source table, or evidence path.
- Heartbeat and identify evidence must come from the same deployed worker family or the mismatch must be explained.
- Usable message proof must be fresh, non-bot, non-empty, and not deleted.

Does not count as proof:
- Unit tests, typecheck, lint, build, and dry-run scripts by themselves.
- Seed rows, smoke rows, deleted rows, local-only mock rows, or intentionally synthetic examples.
- Screenshots or summaries without a source id and reviewer decision.
- AI-generated content that was not approved by an admin/operator.
- A gateway identify event with Message Content Intent but no captured non-empty message.
- A stale heartbeat from a one-shot local worker.

### Approved Discord knowledge

- Key: approved_discord_knowledge
- Status: blocked
- Current: 0/10
- Remaining: 10
- Admin surface: /admin/discord -> Knowledge/RAG -> candidate review
- Source tables: discord_questions, discord_answers, discord_content_queue, discord_content_drafts
- Verify: npm run discord:proof-backlog && npm run discord:operator-brief
- Evidence paths: docs/evidence/discord-ai-os/phase-21-operating-proof-cycle.json, docs/evidence/engineering-loop/discord-proof-backlog-latest.json

Required intake template:
```json
{
  "proof_cycle_key": "<YYYY-W##>",
  "source_record_id": "<source_record_id>",
  "source_url_or_path": "<source_url_or_path>",
  "source_created_at": "<ISO timestamp>",
  "title": "<title>",
  "summary": "<summary>",
  "reviewer": "<reviewer>",
  "reviewed_at": "<ISO timestamp>",
  "decision_reason": "<decision_reason>",
  "evidence_artifact_path": "<evidence_artifact_path>",
  "operator_attestation": "<what was verified and what remains unverified>",
  "privacy_status": "<public | anonymized | permissioned | private_blocked | rejected>",
  "source_type": "<source_type>",
  "reuse_category": "<reuse_category>",
  "rag_safe": "<true | false>"
}
```

Accept:
- Contains a specific member problem, answer, build, review, win, or resource.
- Has enough context to be useful outside the original thread.
- Reviewer wrote a concrete decision reason.
- Privacy status is public, anonymized, or permissioned.

Reject:
- Generic chatter, low-context praise, or unsupported claims.
- Private/member-sensitive content without consent or anonymization.
- Moderation-sensitive material or content that should not become a teaching asset.

Privacy:
- Remove names, screenshots, private business details, credentials, and contact information unless explicitly permissioned.
- Do not approve DMs or private-channel content as public knowledge without explicit consent.

Quality gates:
- Proof must come from real operating data or explicitly approved historical backlog, not synthetic smoke data.
- Proof must have a reviewer, timestamp, source id, evidence artifact, and decision reason.
- Proof must be tied to a blocked proof lane and weekly cycle key.
- Proof must be reproducible from the listed admin surface, source table, or evidence path.
- Knowledge must be approved through admin review before it can count.
- Knowledge must contain enough context to be reused without asking the original member for missing details.

Does not count as proof:
- Unit tests, typecheck, lint, build, and dry-run scripts by themselves.
- Seed rows, smoke rows, deleted rows, local-only mock rows, or intentionally synthetic examples.
- Screenshots or summaries without a source id and reviewer decision.
- AI-generated content that was not approved by an admin/operator.
- Raw Discord messages that were captured but not reviewed.
- Generic introductions, greetings, or low-context praise.

### Discord knowledge synced into RAG

- Key: rag_discord_sources
- Status: blocked
- Current: 0/10
- Remaining: 10
- Admin surface: /admin/discord -> RAG Health -> Sync approved Discord knowledge
- Source tables: rag_sources, rag_documents, rag_chunks
- Verify: npm run discord:operating-cycle && npm run rag:evaluate && npm run discord:smoke-final-scorecard
- Evidence paths: docs/evidence/discord-ai-os/phase-21-operating-proof-cycle.json, docs/evidence/rag/eval-latest.json, docs/evidence/discord-ai-os/phase-20-final-scorecard.json

Required intake template:
```json
{
  "proof_cycle_key": "<YYYY-W##>",
  "source_record_id": "<source_record_id>",
  "source_url_or_path": "<source_url_or_path>",
  "source_created_at": "<ISO timestamp>",
  "title": "<title>",
  "summary": "<summary>",
  "reviewer": "<reviewer>",
  "reviewed_at": "<ISO timestamp>",
  "decision_reason": "<decision_reason>",
  "evidence_artifact_path": "<evidence_artifact_path>",
  "operator_attestation": "<what was verified and what remains unverified>",
  "privacy_status": "<public | anonymized | permissioned | private_blocked | rejected>",
  "rag_source_key": "<rag_source_key>",
  "chunk_count": "<number>",
  "eval_or_retrieval_proof": "<eval_or_retrieval_proof>"
}
```

Accept:
- Source was approved before RAG sync.
- RAG source points back to approved Discord provenance.
- Generated chunks are searchable and citeable.
- Latest RAG eval or retrieval smoke still passes after sync.

Reject:
- Raw Discord messages synced without review.
- Rejected, deleted, private, or low-quality sources.
- Sources with no provenance back to the approved item.

Privacy:
- RAG text must use the anonymized/approved version of the source, not raw private text.
- Citations should identify the source type and approved title, not private member identity.

Quality gates:
- Proof must come from real operating data or explicitly approved historical backlog, not synthetic smoke data.
- Proof must have a reviewer, timestamp, source id, evidence artifact, and decision reason.
- Proof must be tied to a blocked proof lane and weekly cycle key.
- Proof must be reproducible from the listed admin surface, source table, or evidence path.
- RAG source must trace back to an approved Discord knowledge item.
- Retrieval/eval proof must be generated after the approved sync.

Does not count as proof:
- Unit tests, typecheck, lint, build, and dry-run scripts by themselves.
- Seed rows, smoke rows, deleted rows, local-only mock rows, or intentionally synthetic examples.
- Screenshots or summaries without a source id and reviewer decision.
- AI-generated content that was not approved by an admin/operator.
- Existing docs/blog RAG chunks that do not come from approved Discord knowledge.
- Dry-run RAG sync output with zero persisted Discord sources.

### Public proof growth assets

- Key: public_proof_assets
- Status: blocked
- Current: 0/4
- Remaining: 4
- Admin surface: /admin/discord -> Content -> public proof sources and public growth drafts
- Source tables: discord_public_proof_sources, discord_public_growth_drafts, discord_growth_events
- Verify: npm run discord:operating-cycle && npm run discord:proof-backlog
- Evidence paths: docs/evidence/discord-ai-os/phase-21-operating-proof-cycle.json, docs/evidence/engineering-loop/discord-proof-backlog-latest.json

Required intake template:
```json
{
  "proof_cycle_key": "<YYYY-W##>",
  "source_record_id": "<source_record_id>",
  "source_url_or_path": "<source_url_or_path>",
  "source_created_at": "<ISO timestamp>",
  "title": "<title>",
  "summary": "<summary>",
  "reviewer": "<reviewer>",
  "reviewed_at": "<ISO timestamp>",
  "decision_reason": "<decision_reason>",
  "evidence_artifact_path": "<evidence_artifact_path>",
  "operator_attestation": "<what was verified and what remains unverified>",
  "privacy_status": "<public | anonymized | permissioned | private_blocked | rejected>",
  "asset_type": "<asset_type>",
  "utm_campaign": "<utm_campaign>",
  "publish_status": "<publish_status>"
}
```

Accept:
- Asset is tied to an approved Discord source.
- Public draft has privacy-safe source provenance.
- Admin approved the draft before publishing externally.
- Growth event or UTM path is recorded for the weekly cycle.

Reject:
- Generic public content not tied to approved community activity.
- Private member details, screenshots, names, or business context without permission.
- External publishing without explicit admin approval.

Privacy:
- Use anonymized summaries by default.
- Require explicit permission before using member names, screenshots, or identifiable stories.

Quality gates:
- Proof must come from real operating data or explicitly approved historical backlog, not synthetic smoke data.
- Proof must have a reviewer, timestamp, source id, evidence artifact, and decision reason.
- Proof must be tied to a blocked proof lane and weekly cycle key.
- Proof must be reproducible from the listed admin surface, source table, or evidence path.
- Public proof asset must trace to approved source material and explicit admin approval.
- Growth proof must include UTM/campaign evidence or an explicit note that conversion is not proven yet.

Does not count as proof:
- Unit tests, typecheck, lint, build, and dry-run scripts by themselves.
- Seed rows, smoke rows, deleted rows, local-only mock rows, or intentionally synthetic examples.
- Screenshots or summaries without a source id and reviewer decision.
- AI-generated content that was not approved by an admin/operator.
- Generic marketing content that is not tied to approved community activity.
- A draft that was generated but never approved or published.

### Premium workflow proof

- Key: premium_workflow_proof
- Status: blocked
- Current: 0/1
- Remaining: 1
- Admin surface: /admin/discord -> Premium, Office Hours, and Member Intelligence
- Source tables: discord_members, discord_premium_review_requests, discord_office_hours_queue
- Verify: npm run discord:smoke-premium-workflows && npm run discord:proof-backlog
- Evidence paths: docs/evidence/discord-ai-os/phase-15-premium-workflows-proof.json, docs/evidence/engineering-loop/discord-proof-backlog-latest.json

Required intake template:
```json
{
  "proof_cycle_key": "<YYYY-W##>",
  "source_record_id": "<source_record_id>",
  "source_url_or_path": "<source_url_or_path>",
  "source_created_at": "<ISO timestamp>",
  "title": "<title>",
  "summary": "<summary>",
  "reviewer": "<reviewer>",
  "reviewed_at": "<ISO timestamp>",
  "decision_reason": "<decision_reason>",
  "evidence_artifact_path": "<evidence_artifact_path>",
  "operator_attestation": "<what was verified and what remains unverified>",
  "privacy_status": "<public | anonymized | permissioned | private_blocked | rejected>",
  "premium_path": "<premium_path>",
  "authorization_evidence": "<authorization_evidence>",
  "sla_status": "<sla_status>",
  "fulfillment_summary": "<fulfillment_summary>"
}
```

Accept:
- Authorization is visible and non-premium bypass is blocked.
- Request status and SLA state are recorded.
- Fulfillment outcome is logged.
- Smoke test still proves the premium authorization path.

Reject:
- Premium interest without a fulfilled workflow.
- Unverified payment/role state.
- Free member can access premium-only workflow.

Privacy:
- Premium reviews may contain sensitive artifacts; default to private/admin-only evidence.
- Public repurposing requires separate public proof approval and anonymization.

Quality gates:
- Proof must come from real operating data or explicitly approved historical backlog, not synthetic smoke data.
- Proof must have a reviewer, timestamp, source id, evidence artifact, and decision reason.
- Proof must be tied to a blocked proof lane and weekly cycle key.
- Proof must be reproducible from the listed admin surface, source table, or evidence path.
- Premium workflow must prove authorization and fulfillment, not only interest.
- Seeded premium scenarios must be labeled as seeded and cannot count as paid conversion proof.

Does not count as proof:
- Unit tests, typecheck, lint, build, and dry-run scripts by themselves.
- Seed rows, smoke rows, deleted rows, local-only mock rows, or intentionally synthetic examples.
- Screenshots or summaries without a source id and reviewer decision.
- AI-generated content that was not approved by an admin/operator.
- A premium role or checkout setup without a fulfilled review/deeper answer/office-hours workflow.
- Premium workflow smoke tests without a real or explicitly seeded premium scenario.

## Next Actions

- Deploy the current heartbeat metadata build so future heartbeat rows preserve Message Content Intent and intents.
- Approve high-signal questions, answers, resources, wins, reviews, or drafts from /admin/discord.
- Run the approved Discord RAG sync after approving knowledge candidates.
- Create privacy-safe public proof drafts from approved Discord source material and approve/publish them weekly.
- Run one premium review, deeper-answer, or office-hours flow with a real or intentionally seeded premium scenario.

## Validation Failures

None.
