# Sage Ideas Discord Proof Intake Readiness

Generated: 2026-06-26T10:46:18.573Z
Mutation mode: local_file_evidence_only
Readiness OK: yes

## Release Meaning

Proof intake readiness only defines the review contract. It does not satisfy real operating proof lanes until real approved community/premium/growth records exist.

## Weekly Intake Order

1. Confirm gateway capture is healthy before reviewing downstream knowledge candidates.
2. Review candidates and fill required proof fields.
3. Reject private, generic, low-context, or unsupported material.
4. Approve reusable knowledge and sync only approved items into RAG.
5. Create privacy-safe public proof assets from approved sources.
6. Fulfill and log one premium path when premium activity exists.
7. Rerun operating cycle, proof backlog, operator brief, and final scorecard.

## Lanes

### Gateway message capture

- Key: gateway_capture
- Target: 1
- Admin surface: /admin/discord -> Gateway, Messages, Jobs, and Alerts
- Source tables: discord_gateway_heartbeats, discord_gateway_events, discord_messages, discord_gateway_dead_letters
- Verification: npm run discord:gateway-capture-diagnosis && npm run discord:proof-source-scan && npm run discord:proof-backlog
- Evidence paths: docs/evidence/engineering-loop/discord-gateway-capture-diagnosis-latest.json, docs/evidence/engineering-loop/discord-proof-source-volume-scan-latest.json, docs/evidence/engineering-loop/discord-proof-backlog-latest.json

Required fields:
- proof_cycle_key: Weekly operating cycle key, for example 2026-W26.
- source_record_id: Stable database id, Discord message id, or evidence artifact id.
- source_url_or_path: Discord link, admin URL, or local evidence path that lets the reviewer inspect the source.
- source_created_at: Original source timestamp proving the item came from the current operating window or a reviewed backlog.
- title: Short title describing the reusable teaching/proof value.
- summary: Two to four sentence summary of why this item matters.
- reviewer: Admin/operator who approved, rejected, or escalated the item.
- reviewed_at: ISO timestamp for the approval or rejection decision.
- decision_reason: Specific reason the item qualifies or fails the proof lane.
- evidence_artifact_path: Evidence JSON, screenshot, dashboard URL, or audit artifact that supports the proof claim.
- operator_attestation: Plain-language statement of what was verified and what was not verified.
- privacy_status: One of public, anonymized, permissioned, private_blocked, or rejected.
- worker_id: Gateway worker id that captured the message or wrote the heartbeat.
- message_content_enabled: Boolean confirmation from heartbeat metadata and Discord Developer Portal state.
- usable_message_id: Fresh non-bot Discord message id captured with non-empty visible content.
- capture_health: healthy, warning, or blocked with root cause.

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

### Approved Discord knowledge

- Key: approved_discord_knowledge
- Target: 10
- Admin surface: /admin/discord -> Knowledge/RAG -> candidate review
- Source tables: discord_questions, discord_answers, discord_content_queue, discord_content_drafts
- Verification: npm run discord:proof-backlog && npm run discord:operator-brief
- Evidence paths: docs/evidence/discord-ai-os/phase-21-operating-proof-cycle.json, docs/evidence/engineering-loop/discord-proof-backlog-latest.json

Required fields:
- proof_cycle_key: Weekly operating cycle key, for example 2026-W26.
- source_record_id: Stable database id, Discord message id, or evidence artifact id.
- source_url_or_path: Discord link, admin URL, or local evidence path that lets the reviewer inspect the source.
- source_created_at: Original source timestamp proving the item came from the current operating window or a reviewed backlog.
- title: Short title describing the reusable teaching/proof value.
- summary: Two to four sentence summary of why this item matters.
- reviewer: Admin/operator who approved, rejected, or escalated the item.
- reviewed_at: ISO timestamp for the approval or rejection decision.
- decision_reason: Specific reason the item qualifies or fails the proof lane.
- evidence_artifact_path: Evidence JSON, screenshot, dashboard URL, or audit artifact that supports the proof claim.
- operator_attestation: Plain-language statement of what was verified and what was not verified.
- privacy_status: One of public, anonymized, permissioned, private_blocked, or rejected.
- source_type: question, answer, resource, win, review, build, or approved draft.
- reuse_category: Lesson, resource, FAQ, checklist, challenge, or prompt.
- rag_safe: Boolean confirmation that the item can be cited later without leaking private context.

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

### Discord knowledge synced into RAG

- Key: rag_discord_sources
- Target: 10
- Admin surface: /admin/discord -> RAG Health -> Sync approved Discord knowledge
- Source tables: rag_sources, rag_documents, rag_chunks
- Verification: npm run discord:operating-cycle && SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate && npm run discord:smoke-final-scorecard
- Evidence paths: docs/evidence/discord-ai-os/phase-21-operating-proof-cycle.json, docs/evidence/rag/eval-latest.json, docs/evidence/discord-ai-os/phase-20-final-scorecard.json

Required fields:
- proof_cycle_key: Weekly operating cycle key, for example 2026-W26.
- source_record_id: Stable database id, Discord message id, or evidence artifact id.
- source_url_or_path: Discord link, admin URL, or local evidence path that lets the reviewer inspect the source.
- source_created_at: Original source timestamp proving the item came from the current operating window or a reviewed backlog.
- title: Short title describing the reusable teaching/proof value.
- summary: Two to four sentence summary of why this item matters.
- reviewer: Admin/operator who approved, rejected, or escalated the item.
- reviewed_at: ISO timestamp for the approval or rejection decision.
- decision_reason: Specific reason the item qualifies or fails the proof lane.
- evidence_artifact_path: Evidence JSON, screenshot, dashboard URL, or audit artifact that supports the proof claim.
- operator_attestation: Plain-language statement of what was verified and what was not verified.
- privacy_status: One of public, anonymized, permissioned, private_blocked, or rejected.
- rag_source_key: Stable source key created by the approved Discord sync.
- chunk_count: Number of chunks produced from the approved source.
- eval_or_retrieval_proof: Evidence that the synced item can be retrieved or cited.

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

### Public proof growth assets

- Key: public_proof_assets
- Target: 4
- Admin surface: /admin/discord -> Content -> public proof sources and public growth drafts
- Source tables: discord_public_proof_sources, discord_public_growth_drafts, discord_growth_events
- Verification: npm run discord:operating-cycle && npm run discord:proof-backlog
- Evidence paths: docs/evidence/discord-ai-os/phase-21-operating-proof-cycle.json, docs/evidence/engineering-loop/discord-proof-backlog-latest.json

Required fields:
- proof_cycle_key: Weekly operating cycle key, for example 2026-W26.
- source_record_id: Stable database id, Discord message id, or evidence artifact id.
- source_url_or_path: Discord link, admin URL, or local evidence path that lets the reviewer inspect the source.
- source_created_at: Original source timestamp proving the item came from the current operating window or a reviewed backlog.
- title: Short title describing the reusable teaching/proof value.
- summary: Two to four sentence summary of why this item matters.
- reviewer: Admin/operator who approved, rejected, or escalated the item.
- reviewed_at: ISO timestamp for the approval or rejection decision.
- decision_reason: Specific reason the item qualifies or fails the proof lane.
- evidence_artifact_path: Evidence JSON, screenshot, dashboard URL, or audit artifact that supports the proof claim.
- operator_attestation: Plain-language statement of what was verified and what was not verified.
- privacy_status: One of public, anonymized, permissioned, private_blocked, or rejected.
- asset_type: Article, newsletter, social post, proof card, recap, or showcase item.
- utm_campaign: Campaign key used to track applications or engagement from the asset.
- publish_status: pending_approval, approved, published, or rejected.
- growth_tracking_status: Tracked, pending_first_click, pending_application, or not_counted with the reason.

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

### Premium workflow proof

- Key: premium_workflow_proof
- Target: 1
- Admin surface: /admin/discord -> Premium, Office Hours, and Member Intelligence
- Source tables: discord_members, discord_premium_review_requests, discord_office_hours_queue
- Verification: npm run discord:smoke-premium-workflows && npm run discord:proof-backlog
- Evidence paths: docs/evidence/discord-ai-os/phase-15-premium-workflows-proof.json, docs/evidence/engineering-loop/discord-proof-backlog-latest.json

Required fields:
- proof_cycle_key: Weekly operating cycle key, for example 2026-W26.
- source_record_id: Stable database id, Discord message id, or evidence artifact id.
- source_url_or_path: Discord link, admin URL, or local evidence path that lets the reviewer inspect the source.
- source_created_at: Original source timestamp proving the item came from the current operating window or a reviewed backlog.
- title: Short title describing the reusable teaching/proof value.
- summary: Two to four sentence summary of why this item matters.
- reviewer: Admin/operator who approved, rejected, or escalated the item.
- reviewed_at: ISO timestamp for the approval or rejection decision.
- decision_reason: Specific reason the item qualifies or fails the proof lane.
- evidence_artifact_path: Evidence JSON, screenshot, dashboard URL, or audit artifact that supports the proof claim.
- operator_attestation: Plain-language statement of what was verified and what was not verified.
- privacy_status: One of public, anonymized, permissioned, private_blocked, or rejected.
- premium_path: premium_review, deeper_answer, office_hours, or premium_role_sync.
- authorization_evidence: Premium role, paid status, or intentionally seeded scenario marker.
- sla_status: queued, in_review, answered, scheduled, completed, or breached.
- fulfillment_summary: What was delivered and where the outcome is recorded.

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

## Validation Failures

None.
