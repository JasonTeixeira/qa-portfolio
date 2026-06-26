export type GatewayOperatingPacketField = {
  key: string;
  label: string;
  required: boolean;
  description: string;
};

export type GatewayCaptureDiagnosisEvidence = {
  ok?: boolean;
  generatedAt?: string;
  mutationMode?: string;
  releaseMeaning?: string;
  diagnosis?: {
    status?: 'healthy' | 'blocked' | 'warning';
    rootCauses?: string[];
    nextActions?: string[];
  };
  heartbeat?: {
    latest?: {
      workerId?: string;
      status?: string;
      lastSeenAt?: string | null;
      ageMinutes?: number | null;
      messageContentEnabled?: boolean | null;
      guildMembersEnabled?: boolean | null;
      intents?: unknown;
      lastCloseCode?: number | null;
      lastCloseReason?: string | null;
    } | null;
  };
  identify?: {
    latest?: {
      messageContentEnabled?: boolean | null;
      intents?: number | null;
      createdAt?: string | null;
    } | null;
    messageContentSignalSource?: string | null;
    effectiveMessageContentEnabled?: boolean | null;
  } | null;
  counts?: Record<string, number>;
  recentMessages?: Array<{
    id?: string;
    channelBaseName?: string | null;
    authorBot?: boolean;
    authorPresent?: boolean;
    contentLength?: number;
    detectedKind?: string | null;
    capturedAt?: string | null;
    deleted?: boolean;
  }>;
  errors?: Array<{ label: string; error: string }>;
};

export type GatewayOperatingPacket = {
  ok: boolean;
  version: 'gateway-operating-packet-v1';
  generatedAt: string;
  mutationMode: 'local_file_evidence_only';
  releaseMeaning: string;
  status: 'proven' | 'ready_for_fresh_message' | 'blocked';
  target: {
    current: number;
    target: number;
    remaining: number;
    usableMessageState: 'fresh_usable_message_proven' | 'message_content_ready_needs_fresh_member_message' | 'message_content_not_proven' | 'heartbeat_stale_or_missing';
  };
  sourceEvidencePath: string;
  adminSurface: string;
  messageContentSignal: {
    effectiveEnabled: boolean | null;
    source: string | null;
    identifyEnabled: boolean | null;
    heartbeatEnabled: boolean | null;
    identifyCreatedAt: string | null;
  };
  heartbeat: {
    workerId: string | null;
    status: string | null;
    ageMinutes: number | null;
    lastSeenAt: string | null;
    fresh: boolean;
    lastCloseCode: number | null;
  };
  fields: GatewayOperatingPacketField[];
  acceptanceChecklist: string[];
  rejectionChecklist: string[];
  antiFakeRules: string[];
  liveProofSteps: string[];
  verificationCommands: string[];
  nextActions: string[];
  failures: string[];
};

function field(key: string, label: string, description: string, required = true): GatewayOperatingPacketField {
  return { key, label, description, required };
}

const REQUIRED_FIELDS = [
  field('proof_cycle_key', 'Proof cycle key', 'Weekly operating cycle key, for example 2026-W26.'),
  field('worker_id', 'Worker id', 'Long-lived gateway worker id that produced the fresh heartbeat.'),
  field('heartbeat_status', 'Heartbeat status', 'Latest worker heartbeat status, such as ready, resumed, or heartbeat_ack.'),
  field('heartbeat_last_seen_at', 'Heartbeat last seen at', 'Fresh heartbeat timestamp from discord_gateway_heartbeats.'),
  field('heartbeat_age_minutes', 'Heartbeat age minutes', 'Heartbeat age at proof time; must be within the accepted freshness window.'),
  field('message_content_enabled', 'Message content enabled', 'Boolean confirmation that Message Content Intent is enabled for the worker identify path.'),
  field('message_content_signal_source', 'Message content signal source', 'heartbeat or identify_event source used for the intent proof.'),
  field('identify_event_created_at', 'Identify event created at', 'Timestamp for the gateway_identify_sent event that proves current intent configuration.'),
  field('usable_message_id', 'Usable message id', 'discord_messages row id for the fresh non-bot non-empty member message.'),
  field('channel_base_name', 'Channel base name', 'Channel where the fresh member message was captured.'),
  field('author_bot', 'Author bot', 'Must be false. Bot/system messages cannot prove community corpus capture.'),
  field('content_length', 'Content length', 'Captured message content length; must be greater than zero.'),
  field('captured_at', 'Captured at', 'Timestamp for the captured message; must be after current Message Content-enabled identify evidence.'),
  field('deleted', 'Deleted', 'Must be false. Deleted or cleanup rows cannot prove durable corpus capture.'),
  field('classification_state', 'Classification state', 'Classifier/candidate state after capture, or explicit note that classification is the next step.'),
  field('dead_letter_count', 'Dead letter count', 'Recent unresolved gateway dead-letter count at proof time.'),
  field('evidence_artifact_path', 'Evidence artifact path', 'Path to the diagnosis JSON, dashboard screenshot, or proof artifact.'),
  field('operator_attestation', 'Operator attestation', 'Plain-language statement of exactly what live capture was verified and what remains unverified.'),
];

const SOURCE_EVIDENCE_PATH = 'docs/evidence/engineering-loop/discord-gateway-capture-diagnosis-latest.json';

function count(diagnosis: GatewayCaptureDiagnosisEvidence, key: string): number {
  return Number(diagnosis.counts?.[key] ?? 0);
}

function heartbeatIsFresh(ageMinutes: number | null | undefined): boolean {
  return typeof ageMinutes === 'number' && Number.isFinite(ageMinutes) && ageMinutes <= 10;
}

export function buildGatewayOperatingPacket(input: {
  generatedAt: string;
  diagnosis: GatewayCaptureDiagnosisEvidence;
}): GatewayOperatingPacket {
  const diagnosis = input.diagnosis;
  const current = count(diagnosis, 'discord_messages.non_bot_non_empty');
  const target = 1;
  const remaining = Math.max(0, target - current);
  const effectiveEnabled = diagnosis.identify?.effectiveMessageContentEnabled ?? null;
  const freshHeartbeat = heartbeatIsFresh(diagnosis.heartbeat?.latest?.ageMinutes);
  const usableMessageState: GatewayOperatingPacket['target']['usableMessageState'] = current >= target
    ? 'fresh_usable_message_proven'
    : freshHeartbeat && effectiveEnabled === true
      ? 'message_content_ready_needs_fresh_member_message'
      : freshHeartbeat
        ? 'message_content_not_proven'
        : 'heartbeat_stale_or_missing';
  const status: GatewayOperatingPacket['status'] = current >= target
    ? 'proven'
    : usableMessageState === 'message_content_ready_needs_fresh_member_message'
      ? 'ready_for_fresh_message'
      : 'blocked';

  const packet: GatewayOperatingPacket = {
    ok: true,
    version: 'gateway-operating-packet-v1',
    generatedAt: input.generatedAt,
    mutationMode: 'local_file_evidence_only',
    releaseMeaning: 'This gateway operating packet converts the latest diagnosis into a live proof contract. It does not run the worker, post messages, change Discord, mutate Supabase, classify messages, or satisfy operating proof.',
    status,
    target: {
      current,
      target,
      remaining,
      usableMessageState,
    },
    sourceEvidencePath: SOURCE_EVIDENCE_PATH,
    adminSurface: '/admin/discord -> Gateway operating packet, Gateway capture diagnosis, Jobs, Knowledge/RAG',
    messageContentSignal: {
      effectiveEnabled,
      source: diagnosis.identify?.messageContentSignalSource ?? null,
      identifyEnabled: diagnosis.identify?.latest?.messageContentEnabled ?? null,
      heartbeatEnabled: diagnosis.heartbeat?.latest?.messageContentEnabled ?? null,
      identifyCreatedAt: diagnosis.identify?.latest?.createdAt ?? null,
    },
    heartbeat: {
      workerId: diagnosis.heartbeat?.latest?.workerId ?? null,
      status: diagnosis.heartbeat?.latest?.status ?? null,
      ageMinutes: diagnosis.heartbeat?.latest?.ageMinutes ?? null,
      lastSeenAt: diagnosis.heartbeat?.latest?.lastSeenAt ?? null,
      fresh: freshHeartbeat,
      lastCloseCode: diagnosis.heartbeat?.latest?.lastCloseCode ?? null,
    },
    fields: REQUIRED_FIELDS,
    acceptanceChecklist: [
      'Latest gateway heartbeat is fresh, from the intended long-lived worker, and has no unresolved fatal close code.',
      'Message Content Intent is proven by heartbeat metadata or a recent gateway_identify_sent event.',
      'A fresh non-bot, non-deleted member message exists in discord_messages with content_length greater than zero.',
      'The usable message was captured after the current Message Content-enabled identify event.',
      'Recent gateway dead letters are zero or explicitly reviewed and not related to message capture.',
      'The captured message can proceed to classifier and content queue review without exposing private data.',
      'Operator attestation identifies the worker id, channel, message row, captured_at, and evidence artifact.',
    ],
    rejectionChecklist: [
      'Only bot messages are captured.',
      'Non-bot messages exist but content_length is zero.',
      'The message row is deleted, synthetic, smoke-created, or from a local one-shot rehearsal.',
      'Message Content Intent is inferred from config text but no identify or heartbeat evidence exists.',
      'Heartbeat is stale, missing, or from an unrelated worker.',
      'Old non-empty deleted rows are being counted as current corpus proof.',
    ],
    antiFakeRules: [
      'This packet is not live capture proof; it is the contract for proving live capture.',
      'Do not count identify-only evidence without a fresh non-bot non-empty message row.',
      'Do not count empty content, bot messages, deleted messages, smoke rows, dry-run rows, or one-shot local rehearsal rows.',
      'Do not count stale heartbeat rows or heartbeat rows that lack a link to the current worker proof window.',
      'Do not count old non-empty messages captured before the current Message Content-enabled identify event.',
      'Do not claim Discord corpus readiness until capture, classification, candidate queueing, approval, and RAG sync are separately proven.',
    ],
    liveProofSteps: [
      'Keep the long-lived gateway worker running with Message Content Intent enabled.',
      'Post a fresh, harmless non-bot member message in an approved free channel.',
      'Run npm run discord:gateway-capture-diagnosis and confirm non_bot_non_empty is at least 1 from a non-deleted row.',
      'Run npm run discord:classify-messages and npm run discord:queue-content after explicit approval for live Supabase mutation.',
      'Approve useful candidates through /admin/discord before syncing anything into authoritative RAG.',
    ],
    verificationCommands: [
      'npm run discord:gateway-operating-packet',
      'npm run discord:gateway-capture-diagnosis',
      'npm run discord:proof-source-scan',
      'npm run verify:local:evidence',
    ],
    nextActions: status === 'proven'
      ? [
        'Run classifier and content queue jobs only with explicit approval for live Supabase mutation.',
        'Review resulting candidates in /admin/discord and approve durable knowledge items.',
        'Rerun proof-source scan after approvals.',
      ]
      : effectiveEnabled === true
        ? [
          'Post or request one fresh non-bot member message now that identify evidence shows Message Content Intent enabled.',
          'Rerun npm run discord:gateway-capture-diagnosis after the message is posted.',
          'Do not claim Discord corpus readiness until content_length is greater than zero for a fresh non-bot row.',
        ]
        : [
          'Confirm Message Content Intent remains enabled in Discord Developer Portal and worker env.',
          'Restart or deploy the worker if heartbeat metadata and identify events remain missing or stale.',
          'Rerun npm run discord:gateway-capture-diagnosis before any content-corpus claim.',
        ],
    failures: [],
  };

  const validation = validateGatewayOperatingPacket(packet);
  return {
    ...packet,
    ok: validation.ok,
    failures: validation.failures,
  };
}

export function validateGatewayOperatingPacket(packet: GatewayOperatingPacket) {
  const failures: string[] = [];
  if (packet.version !== 'gateway-operating-packet-v1') failures.push('wrong_version');
  if (packet.mutationMode !== 'local_file_evidence_only') failures.push('wrong_mutation_mode');
  if (!packet.releaseMeaning.includes('does not run the worker')) failures.push('missing_worker_non_mutation_disclaimer');
  if (!packet.releaseMeaning.includes('mutate Supabase')) failures.push('missing_supabase_non_mutation_disclaimer');
  if (packet.target.target !== 1) failures.push('wrong_target');
  if (packet.target.remaining !== Math.max(0, packet.target.target - packet.target.current)) failures.push('remaining_mismatch');
  if (packet.fields.filter((item) => item.required).length < 16) failures.push('insufficient_required_fields');
  for (const required of ['worker_id', 'message_content_enabled', 'usable_message_id', 'content_length', 'author_bot', 'deleted', 'evidence_artifact_path', 'operator_attestation']) {
    if (!packet.fields.some((item) => item.key === required && item.required)) failures.push(`missing_required_field:${required}`);
  }
  if (packet.acceptanceChecklist.length < 6) failures.push('acceptance_checklist_too_thin');
  if (packet.rejectionChecklist.length < 5) failures.push('rejection_checklist_too_thin');
  if (packet.antiFakeRules.length < 5) failures.push('anti_fake_rules_too_thin');
  if (!packet.antiFakeRules.some((rule) => rule.includes('identify-only'))) failures.push('missing_identify_only_rule');
  if (!packet.antiFakeRules.some((rule) => rule.includes('empty content'))) failures.push('missing_empty_content_rule');
  if (!packet.antiFakeRules.some((rule) => rule.includes('bot messages'))) failures.push('missing_bot_message_rule');
  if (!packet.antiFakeRules.some((rule) => rule.includes('deleted messages'))) failures.push('missing_deleted_message_rule');
  if (!packet.antiFakeRules.some((rule) => rule.includes('stale heartbeat'))) failures.push('missing_stale_heartbeat_rule');
  if (packet.verificationCommands.some((command) => command.includes('discord:gateway:once') || command.includes('discord:classify-messages'))) failures.push('unsafe_local_verification_command');
  if (packet.status === 'proven' && packet.target.current < 1) failures.push('proven_without_message');
  if (packet.status !== 'proven' && packet.target.remaining < 1) failures.push('blocked_with_no_remaining_target');
  return {
    ok: failures.length === 0,
    failures,
  };
}

export function renderGatewayOperatingPacketMarkdown(packet: GatewayOperatingPacket): string {
  return [
    '# Gateway Operating Packet',
    '',
    `Generated: ${packet.generatedAt}`,
    `Status: ${packet.status}`,
    `Mutation mode: ${packet.mutationMode}`,
    '',
    packet.releaseMeaning,
    '',
    '## Target',
    '',
    `- Current usable non-bot non-empty messages: ${packet.target.current}/${packet.target.target}`,
    `- Remaining: ${packet.target.remaining}`,
    `- State: ${packet.target.usableMessageState}`,
    `- Source evidence: ${packet.sourceEvidencePath}`,
    `- Admin surface: ${packet.adminSurface}`,
    '',
    '## Signals',
    '',
    `- Worker: ${packet.heartbeat.workerId ?? 'missing'}`,
    `- Heartbeat fresh: ${packet.heartbeat.fresh}`,
    `- Heartbeat age minutes: ${packet.heartbeat.ageMinutes ?? 'missing'}`,
    `- Effective message content: ${String(packet.messageContentSignal.effectiveEnabled)}`,
    `- Signal source: ${packet.messageContentSignal.source ?? 'missing'}`,
    `- Identify created at: ${packet.messageContentSignal.identifyCreatedAt ?? 'missing'}`,
    '',
    '## Required Fields',
    '',
    ...packet.fields.filter((item) => item.required).map((item) => `- ${item.key}: ${item.description}`),
    '',
    '## Acceptance Checklist',
    '',
    ...packet.acceptanceChecklist.map((item) => `- ${item}`),
    '',
    '## Reject If',
    '',
    ...packet.rejectionChecklist.map((item) => `- ${item}`),
    '',
    '## Live Proof Steps',
    '',
    ...packet.liveProofSteps.map((item) => `- ${item}`),
    '',
    '## Verification Commands',
    '',
    ...packet.verificationCommands.map((item) => `- \`${item}\``),
    '',
    '## Anti-Fake Rules',
    '',
    ...packet.antiFakeRules.map((item) => `- ${item}`),
    '',
    '## Next Actions',
    '',
    ...packet.nextActions.map((item) => `- ${item}`),
    '',
  ].join('\n');
}
