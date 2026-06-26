import type { OperatingCycleMetrics } from './operating-proof-cycle-rules';

export type DiscordGatewayCaptureProof = {
  status: 'healthy' | 'warning' | 'blocked';
  usableMessageCount: number;
  rootCauses: string[];
  nextActions: string[];
};

export type DiscordGatewayOperatingProof = {
  status: 'proven' | 'ready_for_fresh_message' | 'blocked' | 'missing';
  current: number;
  target: number;
  remaining: number;
  usableMessageState: string;
  messageContentEnabled: boolean | null;
  messageContentSignalSource: string | null;
  heartbeatFresh: boolean;
  workerId: string | null;
  nextActions: string[];
  antiFakeRules: string[];
};

export type DiscordProofBacklogLane = {
  key: string;
  title: string;
  currentCount: number;
  targetCount: number;
  status: 'passed' | 'blocked';
  sourceTables: string[];
  qualifyingEvidence: string[];
  rejectionRules: string[];
  weeklyOperatorSteps: string[];
  safeLocalCommand: string | null;
  adminSurface: string;
  verificationCommand: string;
  liveActionRequired: string;
  evidenceRequired: string;
};

export type DiscordProofChecklistStep = {
  order: number;
  laneKey: string;
  title: string;
  operatorAction: string;
  safeLocalCommand: string | null;
  liveCommand: string | null;
  adminSurface: string;
  verificationCommand: string;
  evidencePath: string;
  acceptanceCriteria: string;
};

export type DiscordProofBacklogReport = {
  ok: true;
  version: 'discord-proof-backlog-v1';
  generatedAt: string;
  mutationMode: 'local_file_evidence_only';
  status: 'passed' | 'blocked';
  lanes: DiscordProofBacklogLane[];
  weeklyChecklist: DiscordProofChecklistStep[];
  nextActions: string[];
};

function lane(input: Omit<DiscordProofBacklogLane, 'status'>): DiscordProofBacklogLane {
  return {
    ...input,
    status: input.currentCount >= input.targetCount ? 'passed' : 'blocked',
  };
}

const LIVE_COMMANDS_BY_LANE: Record<string, string | null> = {
  gateway_capture: null,
  approved_discord_knowledge: null,
  rag_discord_sources: 'npm run discord:operating-cycle',
  public_proof_assets: 'npm run discord:operating-cycle',
  premium_workflow_proof: 'npm run discord:smoke-premium-workflows',
};

const EVIDENCE_PATHS_BY_LANE: Record<string, string> = {
  gateway_capture: 'docs/evidence/engineering-loop/gateway-operating-packet-latest.json',
  approved_discord_knowledge: 'docs/evidence/discord-ai-os/phase-21-operating-proof-cycle.json',
  rag_discord_sources: 'docs/evidence/discord-ai-os/phase-21-operating-proof-cycle.json',
  public_proof_assets: 'docs/evidence/discord-ai-os/phase-21-operating-proof-cycle.json',
  premium_workflow_proof: 'docs/evidence/engineering-loop/discord-proof-backlog-latest.json',
};

function checklistStep(laneItem: DiscordProofBacklogLane, order: number): DiscordProofChecklistStep {
  return {
    order,
    laneKey: laneItem.key,
    title: laneItem.title,
    operatorAction: laneItem.liveActionRequired,
    safeLocalCommand: laneItem.safeLocalCommand,
    liveCommand: LIVE_COMMANDS_BY_LANE[laneItem.key] ?? null,
    adminSurface: laneItem.adminSurface,
    verificationCommand: laneItem.verificationCommand,
    evidencePath: EVIDENCE_PATHS_BY_LANE[laneItem.key] ?? 'docs/evidence/engineering-loop/discord-proof-backlog-latest.json',
    acceptanceCriteria: `${laneItem.title} reaches ${laneItem.targetCount}/${laneItem.targetCount}; current evidence is ${laneItem.currentCount}/${laneItem.targetCount}. ${laneItem.evidenceRequired}`,
  };
}

export function buildDiscordProofBacklogReport(input: {
  generatedAt: string;
  metrics: OperatingCycleMetrics;
  gatewayCapture?: DiscordGatewayCaptureProof | null;
  gatewayOperatingPacket?: DiscordGatewayOperatingProof | null;
}): DiscordProofBacklogReport {
  const gatewayCapture = input.gatewayCapture ?? {
    status: 'blocked',
    usableMessageCount: 0,
    rootCauses: ['Gateway capture diagnosis evidence was not provided to the proof backlog.'],
    nextActions: ['Run npm run discord:gateway-capture-diagnosis before claiming proof backlog readiness.'],
  };
  const gatewayOperatingPacket = input.gatewayOperatingPacket ?? null;
  const gatewayCurrentCount = gatewayOperatingPacket
    ? gatewayOperatingPacket.current
    : gatewayCapture.status === 'healthy' && gatewayCapture.usableMessageCount > 0
      ? gatewayCapture.usableMessageCount
      : 0;
  const gatewayLiveAction = gatewayOperatingPacket?.nextActions[0]
    ?? gatewayCapture.nextActions[0]
    ?? 'Capture one fresh non-bot Discord message with non-empty content through the long-lived gateway worker.';
  const gatewayStateDetail = gatewayOperatingPacket
    ? `Gateway packet state: ${gatewayOperatingPacket.usableMessageState}; Message Content Intent: ${String(gatewayOperatingPacket.messageContentEnabled)} via ${gatewayOperatingPacket.messageContentSignalSource ?? 'unknown'}; heartbeat fresh: ${String(gatewayOperatingPacket.heartbeatFresh)}; worker: ${gatewayOperatingPacket.workerId ?? 'unknown'}.`
    : `Current root causes: ${gatewayCapture.rootCauses.join('; ') || 'none'}.`;
  const lanes = [
    lane({
      key: 'gateway_capture',
      title: 'Gateway message capture',
      currentCount: gatewayCurrentCount,
      targetCount: 1,
      sourceTables: [
        'discord_gateway_heartbeats',
        'discord_gateway_events',
        'discord_messages',
        'discord_gateway_dead_letters',
      ],
      qualifyingEvidence: [
        'Fresh gateway heartbeat proves the deployed worker is alive.',
        'Message Content Intent metadata is present and enabled.',
        'At least one fresh visible non-bot message is captured with non-empty content.',
        ...(gatewayOperatingPacket?.messageContentEnabled === true ? ['Current packet shows Message Content Intent is effectively enabled.'] : []),
      ],
      rejectionRules: [
        'Do not count deleted messages, bot-only messages, or empty-content rows as usable capture proof.',
        'Do not count stale heartbeat rows or gateway rows that lack Message Content Intent metadata.',
        ...(gatewayOperatingPacket?.antiFakeRules ?? []).slice(0, 3),
      ],
      weeklyOperatorSteps: [
        'Run the gateway capture diagnosis before reviewing proof candidates.',
        'If blocked, fix worker deployment/env/Discord intent before expecting content candidates.',
        'After a real member posts, rerun diagnosis, classifier, queue automation, and proof backlog.',
      ],
      safeLocalCommand: 'npm run discord:gateway-capture-diagnosis && npm run discord:gateway-operating-packet',
      adminSurface: '/admin/discord -> Gateway, Messages, Jobs, and Alerts panels',
      verificationCommand: 'npm run discord:gateway-capture-diagnosis && npm run discord:gateway-operating-packet && npm run discord:proof-source-scan && npm run discord:proof-backlog',
      liveActionRequired: gatewayLiveAction,
      evidenceRequired: `Gateway packet must reach 1/1 usable non-bot non-empty message. ${gatewayStateDetail}`,
    }),
    lane({
      key: 'approved_discord_knowledge',
      title: 'Approved Discord knowledge',
      currentCount: input.metrics.approvedDiscordKnowledgeSources,
      targetCount: 10,
      sourceTables: [
        'discord_questions',
        'discord_answers',
        'discord_content_queue',
        'discord_content_drafts',
      ],
      qualifyingEvidence: [
        'Specific member question with enough context to answer later.',
        'Helpful answer or review that contains a reusable teaching point.',
        'Build, win, resource, or draft that can be cited without exposing private data.',
      ],
      rejectionRules: [
        'Reject generic chatter, private details, low-context praise, or unsupported claims.',
        'Do not approve moderation-sensitive content or anything that needs member consent first.',
      ],
      weeklyOperatorSteps: [
        'Review pending questions, answers, reviews, wins, resources, and drafts.',
        'Approve only items that can become reusable lessons, RAG sources, or proof assets.',
        'Record why the source is useful before syncing it into RAG.',
      ],
      safeLocalCommand: 'npm run discord:operating-cycle:dry-run',
      adminSurface: '/admin/discord -> Content Queue, Drafts, and Knowledge Candidate review panels',
      verificationCommand: 'npm run discord:operating-cycle:dry-run && npm run discord:proof-backlog',
      liveActionRequired: 'Approve high-signal questions, answers, resources, wins, reviews, or drafts from /admin/discord.',
      evidenceRequired: 'At least 10 approved Discord knowledge sources before RAG sync and scorecard improvement.',
    }),
    lane({
      key: 'rag_discord_sources',
      title: 'Discord knowledge synced into RAG',
      currentCount: input.metrics.ragDiscordSources,
      targetCount: 10,
      sourceTables: ['rag_sources', 'rag_documents', 'rag_chunks'],
      qualifyingEvidence: [
        'RAG source has approved Discord provenance and an approved source record.',
        'RAG chunk is searchable, citeable, and tied back to the approved source.',
      ],
      rejectionRules: [
        'Do not sync raw Discord messages directly into authoritative RAG.',
        'Do not sync deleted, rejected, private, or low-quality source material.',
      ],
      weeklyOperatorSteps: [
        'Run approved Discord RAG sync after knowledge approvals.',
        'Re-embed and run retrieval/answer evals against the updated corpus.',
        'Review any low-scoring eval examples before claiming score improvement.',
      ],
      safeLocalCommand: 'npm run discord:operating-cycle:dry-run',
      adminSurface: '/admin/discord -> RAG Health, Corpus Health, and Eval Runs panels',
      verificationCommand: 'npm run discord:operating-cycle && SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate && npm run discord:smoke-final-scorecard',
      liveActionRequired: 'Run the approved Discord RAG sync after approving knowledge candidates.',
      evidenceRequired: 'RAG sources include approved Discord question/answer/content/draft records, not raw unapproved chatter.',
    }),
    lane({
      key: 'public_proof_assets',
      title: 'Public proof growth assets',
      currentCount: input.metrics.pendingPublicDrafts + input.metrics.publishedPublicDrafts,
      targetCount: 4,
      sourceTables: [
        'discord_public_proof_sources',
        'discord_public_growth_drafts',
        'discord_growth_events',
      ],
      qualifyingEvidence: [
        'Approved source material can be shared publicly without exposing private member data.',
        'Draft has a clear learning/proof angle and source provenance.',
        'Application or attribution path can track the growth cycle.',
      ],
      rejectionRules: [
        'Do not publish private member details, screenshots, or names without explicit approval.',
        'Reject generic public posts that are not tied to a real approved Discord source.',
      ],
      weeklyOperatorSteps: [
        'Select one approved source that shows a useful problem, build, win, or lesson.',
        'Generate or review a privacy-safe public proof draft.',
        'Approve/publish manually and track applications or engagement from that asset.',
      ],
      safeLocalCommand: 'npm run discord:operating-cycle:dry-run',
      adminSurface: '/admin/discord -> Public Proof Sources and Public Growth Drafts panels',
      verificationCommand: 'npm run discord:operating-cycle && npm run discord:proof-backlog',
      liveActionRequired: 'Create privacy-safe public proof drafts from approved Discord source material and approve/publish them weekly.',
      evidenceRequired: 'Four weekly proof drafts or published assets with application/source tracking.',
    }),
    lane({
      key: 'premium_workflow_proof',
      title: 'Premium workflow proof',
      currentCount: input.metrics.premiumWorkflowProofs,
      targetCount: 1,
      sourceTables: [
        'discord_members',
        'discord_premium_review_requests',
        'discord_office_hours_queue',
      ],
      qualifyingEvidence: [
        'Premium role or deliberately seeded premium scenario exists.',
        'Answered/completed premium review or completed office-hours request proves authorization and SLA behavior.',
        'Fulfillment outcome is logged with traceable status and no free-member bypass.',
      ],
      rejectionRules: [
        'Do not count a premium proof unless authorization, request status, and fulfillment are all visible.',
        'Do not use vague premium interest as proof of fulfilled premium workflow.',
      ],
      weeklyOperatorSteps: [
        'Review premium role sync, open premium requests, and office-hours queue.',
        'Fulfill one valid premium path and log the SLA/outcome.',
        'Run premium workflow smoke after changes to Stripe, roles, or premium commands.',
      ],
      safeLocalCommand: 'npm run discord:smoke-premium-workflows',
      adminSurface: '/admin/discord -> Premium, Office Hours, and Member Intelligence panels',
      verificationCommand: 'npm run discord:smoke-premium-workflows && npm run discord:proof-backlog',
      liveActionRequired: 'Run one premium review, deeper-answer, or office-hours flow with a real or intentionally seeded premium scenario.',
      evidenceRequired: 'At least one fulfilled premium path proves authorization, SLA, and fulfillment behavior; membership or queued requests alone do not count.',
    }),
  ];

  const blocked = lanes.filter((item) => item.status === 'blocked');
  const weeklyChecklist = blocked.map((item, index) => checklistStep(item, index + 1));
  return {
    ok: true,
    version: 'discord-proof-backlog-v1',
    generatedAt: input.generatedAt,
    mutationMode: 'local_file_evidence_only',
    status: blocked.length === 0 ? 'passed' : 'blocked',
    lanes,
    weeklyChecklist,
    nextActions: blocked.map((item) => item.liveActionRequired),
  };
}
