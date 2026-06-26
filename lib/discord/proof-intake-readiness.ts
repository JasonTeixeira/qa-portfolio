export type DiscordProofIntakeField = {
  key: string;
  label: string;
  required: boolean;
  description: string;
};

export type DiscordProofIntakeLane = {
  key: string;
  title: string;
  targetCount: number;
  adminSurface: string;
  sourceTables: string[];
  requiredFields: DiscordProofIntakeField[];
  acceptanceChecks: string[];
  rejectionChecks: string[];
  privacyChecks: string[];
  verificationCommands: string[];
  evidencePaths: string[];
};

export type DiscordProofIntakeReadinessReport = {
  ok: boolean;
  version: 'discord-proof-intake-readiness-v1';
  generatedAt: string;
  mutationMode: 'local_file_evidence_only';
  releaseMeaning: string;
  lanes: DiscordProofIntakeLane[];
  requiredLaneCount: number;
  requiredFieldCount: number;
  failures: string[];
  weeklyIntakeOrder: string[];
};

function field(key: string, label: string, description: string, required = true): DiscordProofIntakeField {
  return { key, label, description, required };
}

const SHARED_REQUIRED_FIELDS = [
  field('source_record_id', 'Source record id', 'Stable database id, Discord message id, or evidence artifact id.'),
  field('source_url_or_path', 'Source URL or path', 'Discord link, admin URL, or local evidence path that lets the reviewer inspect the source.'),
  field('title', 'Reusable title', 'Short title describing the reusable teaching/proof value.'),
  field('summary', 'Reusable summary', 'Two to four sentence summary of why this item matters.'),
  field('reviewer', 'Reviewer', 'Admin/operator who approved, rejected, or escalated the item.'),
  field('reviewed_at', 'Reviewed at', 'ISO timestamp for the approval or rejection decision.'),
  field('decision_reason', 'Decision reason', 'Specific reason the item qualifies or fails the proof lane.'),
  field('privacy_status', 'Privacy status', 'One of public, anonymized, permissioned, private_blocked, or rejected.'),
];

export function buildDiscordProofIntakeReadinessReport(input: {
  generatedAt: string;
}): DiscordProofIntakeReadinessReport {
  const lanes: DiscordProofIntakeLane[] = [
    {
      key: 'gateway_capture',
      title: 'Gateway message capture',
      targetCount: 1,
      adminSurface: '/admin/discord -> Gateway, Messages, Jobs, and Alerts',
      sourceTables: ['discord_gateway_heartbeats', 'discord_gateway_events', 'discord_messages', 'discord_gateway_dead_letters'],
      requiredFields: [
        ...SHARED_REQUIRED_FIELDS,
        field('worker_id', 'Worker id', 'Gateway worker id that captured the message or wrote the heartbeat.'),
        field('message_content_enabled', 'Message content enabled', 'Boolean confirmation from heartbeat metadata and Discord Developer Portal state.'),
        field('usable_message_id', 'Usable message id', 'Fresh non-bot Discord message id captured with non-empty visible content.'),
        field('capture_health', 'Capture health', 'healthy, warning, or blocked with root cause.'),
      ],
      acceptanceChecks: [
        'Gateway heartbeat is fresh and tied to the current worker build.',
        'Message Content Intent metadata is present and enabled.',
        'At least one fresh non-bot message is captured with non-empty content.',
        'No recent dead letters or close codes invalidate the capture proof.',
      ],
      rejectionChecks: [
        'Deleted, bot-only, or empty-content messages.',
        'Stale heartbeat rows or worker metadata that does not expose Message Content Intent state.',
        'Gateway close codes, dead letters, or invalid sessions that make capture unreliable.',
      ],
      privacyChecks: [
        'Use only content that is visible in approved free/community channels.',
        'Do not promote private, deleted, moderation-sensitive, or member-identifying content into public proof without review.',
      ],
      verificationCommands: [
        'npm run discord:gateway-capture-diagnosis',
        'npm run discord:proof-source-scan',
        'npm run discord:proof-backlog',
      ],
      evidencePaths: [
        'docs/evidence/engineering-loop/discord-gateway-capture-diagnosis-latest.json',
        'docs/evidence/engineering-loop/discord-proof-source-volume-scan-latest.json',
        'docs/evidence/engineering-loop/discord-proof-backlog-latest.json',
      ],
    },
    {
      key: 'approved_discord_knowledge',
      title: 'Approved Discord knowledge',
      targetCount: 10,
      adminSurface: '/admin/discord -> Knowledge/RAG -> candidate review',
      sourceTables: ['discord_questions', 'discord_answers', 'discord_content_queue', 'discord_content_drafts'],
      requiredFields: [
        ...SHARED_REQUIRED_FIELDS,
        field('source_type', 'Source type', 'question, answer, resource, win, review, build, or approved draft.'),
        field('reuse_category', 'Reuse category', 'Lesson, resource, FAQ, checklist, challenge, or prompt.'),
        field('rag_safe', 'RAG safe', 'Boolean confirmation that the item can be cited later without leaking private context.'),
      ],
      acceptanceChecks: [
        'Contains a specific member problem, answer, build, review, win, or resource.',
        'Has enough context to be useful outside the original thread.',
        'Reviewer wrote a concrete decision reason.',
        'Privacy status is public, anonymized, or permissioned.',
      ],
      rejectionChecks: [
        'Generic chatter, low-context praise, or unsupported claims.',
        'Private/member-sensitive content without consent or anonymization.',
        'Moderation-sensitive material or content that should not become a teaching asset.',
      ],
      privacyChecks: [
        'Remove names, screenshots, private business details, credentials, and contact information unless explicitly permissioned.',
        'Do not approve DMs or private-channel content as public knowledge without explicit consent.',
      ],
      verificationCommands: [
        'npm run discord:proof-backlog',
        'npm run discord:operator-brief',
      ],
      evidencePaths: [
        'docs/evidence/discord-ai-os/phase-21-operating-proof-cycle.json',
        'docs/evidence/engineering-loop/discord-proof-backlog-latest.json',
      ],
    },
    {
      key: 'rag_discord_sources',
      title: 'Discord knowledge synced into RAG',
      targetCount: 10,
      adminSurface: '/admin/discord -> RAG Health -> Sync approved Discord knowledge',
      sourceTables: ['rag_sources', 'rag_documents', 'rag_chunks'],
      requiredFields: [
        ...SHARED_REQUIRED_FIELDS,
        field('rag_source_key', 'RAG source key', 'Stable source key created by the approved Discord sync.'),
        field('chunk_count', 'Chunk count', 'Number of chunks produced from the approved source.'),
        field('eval_or_retrieval_proof', 'Eval or retrieval proof', 'Evidence that the synced item can be retrieved or cited.'),
      ],
      acceptanceChecks: [
        'Source was approved before RAG sync.',
        'RAG source points back to approved Discord provenance.',
        'Generated chunks are searchable and citeable.',
        'Latest RAG eval or retrieval smoke still passes after sync.',
      ],
      rejectionChecks: [
        'Raw Discord messages synced without review.',
        'Rejected, deleted, private, or low-quality sources.',
        'Sources with no provenance back to the approved item.',
      ],
      privacyChecks: [
        'RAG text must use the anonymized/approved version of the source, not raw private text.',
        'Citations should identify the source type and approved title, not private member identity.',
      ],
      verificationCommands: [
        'npm run discord:operating-cycle',
        'npm run rag:evaluate',
        'npm run discord:smoke-final-scorecard',
      ],
      evidencePaths: [
        'docs/evidence/discord-ai-os/phase-21-operating-proof-cycle.json',
        'docs/evidence/rag/eval-latest.json',
        'docs/evidence/discord-ai-os/phase-20-final-scorecard.json',
      ],
    },
    {
      key: 'public_proof_assets',
      title: 'Public proof growth assets',
      targetCount: 4,
      adminSurface: '/admin/discord -> Content -> public proof sources and public growth drafts',
      sourceTables: ['discord_public_proof_sources', 'discord_public_growth_drafts', 'discord_growth_events'],
      requiredFields: [
        ...SHARED_REQUIRED_FIELDS,
        field('asset_type', 'Asset type', 'Article, newsletter, social post, proof card, recap, or showcase item.'),
        field('utm_campaign', 'UTM campaign', 'Campaign key used to track applications or engagement from the asset.'),
        field('publish_status', 'Publish status', 'pending_approval, approved, published, or rejected.'),
        field('conversion_snapshot', 'Conversion snapshot', 'Applications, approvals, active members, or other growth metric tied to the asset.', false),
      ],
      acceptanceChecks: [
        'Asset is tied to an approved Discord source.',
        'Public draft has privacy-safe source provenance.',
        'Admin approved the draft before publishing externally.',
        'Growth event or UTM path is recorded for the weekly cycle.',
      ],
      rejectionChecks: [
        'Generic public content not tied to approved community activity.',
        'Private member details, screenshots, names, or business context without permission.',
        'External publishing without explicit admin approval.',
      ],
      privacyChecks: [
        'Use anonymized summaries by default.',
        'Require explicit permission before using member names, screenshots, or identifiable stories.',
      ],
      verificationCommands: [
        'npm run discord:operating-cycle',
        'npm run discord:proof-backlog',
      ],
      evidencePaths: [
        'docs/evidence/discord-ai-os/phase-21-operating-proof-cycle.json',
        'docs/evidence/engineering-loop/discord-proof-backlog-latest.json',
      ],
    },
    {
      key: 'premium_workflow_proof',
      title: 'Premium workflow proof',
      targetCount: 1,
      adminSurface: '/admin/discord -> Premium, Office Hours, and Member Intelligence',
      sourceTables: ['discord_members', 'discord_premium_review_requests', 'discord_office_hours_queue'],
      requiredFields: [
        ...SHARED_REQUIRED_FIELDS,
        field('premium_path', 'Premium path', 'premium_review, deeper_answer, office_hours, or premium_role_sync.'),
        field('authorization_evidence', 'Authorization evidence', 'Premium role, paid status, or intentionally seeded scenario marker.'),
        field('sla_status', 'SLA status', 'queued, in_review, answered, scheduled, completed, or breached.'),
        field('fulfillment_summary', 'Fulfillment summary', 'What was delivered and where the outcome is recorded.'),
      ],
      acceptanceChecks: [
        'Authorization is visible and non-premium bypass is blocked.',
        'Request status and SLA state are recorded.',
        'Fulfillment outcome is logged.',
        'Smoke test still proves the premium authorization path.',
      ],
      rejectionChecks: [
        'Premium interest without a fulfilled workflow.',
        'Unverified payment/role state.',
        'Free member can access premium-only workflow.',
      ],
      privacyChecks: [
        'Premium reviews may contain sensitive artifacts; default to private/admin-only evidence.',
        'Public repurposing requires separate public proof approval and anonymization.',
      ],
      verificationCommands: [
        'npm run discord:smoke-premium-workflows',
        'npm run discord:proof-backlog',
      ],
      evidencePaths: [
        'docs/evidence/discord-ai-os/phase-15-premium-workflows-proof.json',
        'docs/evidence/engineering-loop/discord-proof-backlog-latest.json',
      ],
    },
  ];

  const failures: string[] = [];
  for (const lane of lanes) {
    if (lane.requiredFields.filter((item) => item.required).length < 8) failures.push(`${lane.key}:insufficient_required_fields`);
    if (!lane.acceptanceChecks.length) failures.push(`${lane.key}:missing_acceptance_checks`);
    if (!lane.rejectionChecks.length) failures.push(`${lane.key}:missing_rejection_checks`);
    if (!lane.privacyChecks.length) failures.push(`${lane.key}:missing_privacy_checks`);
    if (!lane.verificationCommands.length) failures.push(`${lane.key}:missing_verification_commands`);
    if (!lane.evidencePaths.length) failures.push(`${lane.key}:missing_evidence_paths`);
  }

  return {
    ok: failures.length === 0,
    version: 'discord-proof-intake-readiness-v1',
    generatedAt: input.generatedAt,
    mutationMode: 'local_file_evidence_only',
    releaseMeaning: 'Proof intake readiness only defines the review contract. It does not satisfy real operating proof lanes until real approved community/premium/growth records exist.',
    lanes,
    requiredLaneCount: lanes.length,
    requiredFieldCount: lanes.reduce((sum, lane) => sum + lane.requiredFields.filter((item) => item.required).length, 0),
    failures,
    weeklyIntakeOrder: [
      'Confirm gateway capture is healthy before reviewing downstream knowledge candidates.',
      'Review candidates and fill required proof fields.',
      'Reject private, generic, low-context, or unsupported material.',
      'Approve reusable knowledge and sync only approved items into RAG.',
      'Create privacy-safe public proof assets from approved sources.',
      'Fulfill and log one premium path when premium activity exists.',
      'Rerun operating cycle, proof backlog, operator brief, and final scorecard.',
    ],
  };
}

export function validateDiscordProofIntakeReadinessReport(report: DiscordProofIntakeReadinessReport): {
  ok: boolean;
  failures: string[];
} {
  const failures = [...report.failures];
  if (report.version !== 'discord-proof-intake-readiness-v1') failures.push('wrong_version');
  if (report.mutationMode !== 'local_file_evidence_only') failures.push('wrong_mutation_mode');
  if (report.requiredLaneCount !== 5) failures.push('wrong_lane_count');
  if (report.requiredFieldCount < 50) failures.push('insufficient_required_field_count');
  if (!report.releaseMeaning.includes('does not satisfy real operating proof lanes')) failures.push('missing_non_proof_disclaimer');
  if (!report.weeklyIntakeOrder.some((item) => item.includes('gateway capture is healthy'))) failures.push('missing_gateway_capture_step');
  if (!report.weeklyIntakeOrder.some((item) => item.includes('sync only approved items into RAG'))) failures.push('missing_approved_rag_sync_step');
  if (!report.lanes.every((lane) => lane.privacyChecks.length >= 2)) failures.push('privacy_checks_too_thin');
  return {
    ok: report.ok === true && failures.length === 0,
    failures,
  };
}
