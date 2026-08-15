export const DISCORD_LIVE_PROOF_ACCELERATOR_VERSION = 'discord-live-proof-accelerator-v1';

type LaneKey =
  | 'gateway_capture'
  | 'approved_discord_knowledge'
  | 'rag_discord_sources'
  | 'public_proof_assets'
  | 'premium_workflow_proof';

export type DiscordLiveProofAcceleratorLane = {
  key: LaneKey;
  title: string;
  current: number;
  target: number;
  shortfall: number;
  status: 'passed' | 'needs_live_input' | 'ready_for_guarded_run' | 'needs_source_volume';
  impact: 'critical' | 'high';
  autonomousWork: string[];
  guardedCommands: string[];
  liveApprovalBoundary: string[];
  acceptanceCriteria: string[];
};

export type DiscordLiveProofAcceleratorReport = {
  ok: boolean;
  version: typeof DISCORD_LIVE_PROOF_ACCELERATOR_VERSION;
  generatedAt: string;
  mutationMode: 'local_file_evidence_only';
  releaseMeaning: string;
  status: 'all_live_targets_met' | 'proof_acceleration_required';
  summary: {
    blockedLaneCount: number;
    passedLaneCount: number;
    totalShortfall: number;
    nextBestLane: LaneKey | null;
    nextBestAction: string;
  };
  lanes: DiscordLiveProofAcceleratorLane[];
  autonomousCommandPlan: string[];
  explicitApprovalCommandPlan: string[];
  operatorChecklist: string[];
  antiFakeRules: string[];
  failures: string[];
};

type ProofSourceVolumeScan = {
  laneReadiness?: {
    approvedDiscordKnowledge?: {
      current?: number;
      target?: number;
      reviewableCandidates?: number;
    };
    ragDiscordSources?: {
      current?: number;
      target?: number;
      approvedKnowledgeAvailable?: number;
    };
    publicProofAssets?: {
      current?: number;
      target?: number;
      approvedKnowledgeAvailable?: number;
      applyClicks?: number;
    };
    premiumWorkflowProof?: {
      current?: number;
      target?: number;
      premiumMembers?: number;
      premiumReviews?: number;
      officeHours?: number;
    };
  };
  counts?: Record<string, number>;
};

type GatewayOperatingPacket = {
  status?: string;
  target?: {
    current?: number;
    target?: number;
    remaining?: number;
    usableMessageState?: string;
  };
  messageContentSignal?: {
    effectiveEnabled?: boolean;
  };
  heartbeat?: {
    fresh?: boolean;
  };
};

type KnowledgeReviewQueue = {
  summary?: {
    reviewableCandidateCount?: number;
  };
};

function numberValue(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function laneStatus(input: {
  current: number;
  target: number;
  reviewableCandidates?: number;
  approvedKnowledgeAvailable?: number;
}): DiscordLiveProofAcceleratorLane['status'] {
  if (input.current >= input.target) return 'passed';
  if (numberValue(input.reviewableCandidates) > 0) return 'needs_live_input';
  if (numberValue(input.approvedKnowledgeAvailable) > 0) return 'ready_for_guarded_run';
  return 'needs_source_volume';
}

function buildLane(input: Omit<DiscordLiveProofAcceleratorLane, 'shortfall' | 'status'> & {
  status?: DiscordLiveProofAcceleratorLane['status'];
  reviewableCandidates?: number;
  approvedKnowledgeAvailable?: number;
}): DiscordLiveProofAcceleratorLane {
  const shortfall = Math.max(0, input.target - input.current);
  const status = input.status ?? laneStatus({
    current: input.current,
    target: input.target,
    reviewableCandidates: input.reviewableCandidates,
    approvedKnowledgeAvailable: input.approvedKnowledgeAvailable,
  });
  return {
    key: input.key,
    title: input.title,
    current: input.current,
    target: input.target,
    shortfall,
    status,
    impact: input.impact,
    autonomousWork: input.autonomousWork,
    guardedCommands: input.guardedCommands,
    liveApprovalBoundary: input.liveApprovalBoundary,
    acceptanceCriteria: input.acceptanceCriteria,
  };
}

export function buildDiscordLiveProofAccelerator(input: {
  generatedAt: string;
  proofSourceVolumeScan?: ProofSourceVolumeScan | null;
  gatewayOperatingPacket?: GatewayOperatingPacket | null;
  knowledgeReviewQueue?: KnowledgeReviewQueue | null;
}): DiscordLiveProofAcceleratorReport {
  const scan = input.proofSourceVolumeScan ?? {};
  const readiness = scan.laneReadiness ?? {};
  const gateway = input.gatewayOperatingPacket ?? {};
  const gatewayCurrent = numberValue(gateway.target?.current);
  const gatewayTarget = numberValue(gateway.target?.target, 1) || 1;
  const gatewayHealthy = gatewayCurrent >= gatewayTarget
    && gateway.messageContentSignal?.effectiveEnabled === true
    && gateway.heartbeat?.fresh === true;

  const approved = readiness.approvedDiscordKnowledge ?? {};
  const rag = readiness.ragDiscordSources ?? {};
  const proof = readiness.publicProofAssets ?? {};
  const premium = readiness.premiumWorkflowProof ?? {};

  const approvedCurrent = numberValue(approved.current);
  const approvedTarget = numberValue(approved.target, 10) || 10;
  const reviewableCandidates = input.knowledgeReviewQueue?.summary
    ? numberValue(input.knowledgeReviewQueue.summary.reviewableCandidateCount)
    : numberValue(approved.reviewableCandidates);
  const ragCurrent = numberValue(rag.current);
  const ragTarget = numberValue(rag.target, 10) || 10;
  const publicProofCurrent = numberValue(proof.current);
  const publicProofTarget = numberValue(proof.target, 4) || 4;
  const premiumCurrent = numberValue(premium.current);
  const premiumTarget = numberValue(premium.target, 1) || 1;

  const lanes: DiscordLiveProofAcceleratorLane[] = [
    buildLane({
      key: 'gateway_capture',
      title: 'Gateway message capture',
      current: gatewayCurrent,
      target: gatewayTarget,
      status: gatewayHealthy ? 'passed' : 'needs_live_input',
      impact: 'critical',
      autonomousWork: [
        'Keep gateway diagnosis, gateway operating packet, classifier, and queue automation in the loop.',
        'Surface the current gateway packet in the admin dashboard and local evidence.',
      ],
      guardedCommands: [
        'npm run discord:gateway-capture-diagnosis',
        'npm run discord:gateway-operating-packet',
        'npm run discord:proof-source-scan',
      ],
      liveApprovalBoundary: [
        'Requires at least one real non-bot member message in Discord to create fresh capture proof.',
        'Does not require publishing, but it does require live member activity.',
      ],
      acceptanceCriteria: [
        'Gateway heartbeat is fresh.',
        'Message Content Intent is effectively enabled.',
        'At least one non-bot non-empty visible message appears in discord_messages.',
      ],
    }),
    buildLane({
      key: 'approved_discord_knowledge',
      title: 'Approved Discord knowledge',
      current: approvedCurrent,
      target: approvedTarget,
      reviewableCandidates,
      impact: 'critical',
      autonomousWork: [
        reviewableCandidates > 0
          ? 'Export exact review candidates and prepare admin approval fields for the strongest reusable source material.'
          : 'Create more real source volume from member questions, answers, builds, reviews, wins, and resources.',
        'Queue operator review packets with required privacy, provenance, and RAG-safe fields.',
        'Reject synthetic, low-context, or private material before it can count.',
      ],
      guardedCommands: [
        'npm run discord:proof-source-scan',
        'npm run discord:approved-knowledge-packet',
        'npm run discord:proof-candidate-audit',
      ],
      liveApprovalBoundary: [
        'Admin must approve reusable Discord knowledge in /admin/discord before it counts.',
        'Raw messages, local seed drafts, and dry-run rows do not count as approved live knowledge.',
      ],
      acceptanceCriteria: [
        '10 approved sources exist across questions, answers, content queue, or approved Discord drafts.',
        'Every source has privacy status, decision reason, reviewer evidence, and RAG-safe text.',
      ],
    }),
    buildLane({
      key: 'rag_discord_sources',
      title: 'Discord knowledge synced into RAG',
      current: ragCurrent,
      target: ragTarget,
      approvedKnowledgeAvailable: numberValue(rag.approvedKnowledgeAvailable),
      impact: 'critical',
      autonomousWork: [
        'Keep RAG corpus health, source sync dry-runs, and eval packets current.',
        'Prepare the guarded sync/eval command sequence once approved knowledge exists.',
      ],
      guardedCommands: [
        'npm run discord:operating-cycle:dry-run',
        'npm run rag:discord-corpus-readiness',
      ],
      liveApprovalBoundary: [
        'Authoritative RAG sync is a production data mutation and must stay behind explicit approval.',
        'Only approved/anonymized Discord knowledge may be synced.',
      ],
      acceptanceCriteria: [
        '10 RAG sources/chunks have approved Discord provenance.',
        'RAG eval runs after sync and does not regress groundedness/citation coverage.',
      ],
    }),
    buildLane({
      key: 'public_proof_assets',
      title: 'Public proof growth assets',
      current: publicProofCurrent,
      target: publicProofTarget,
      approvedKnowledgeAvailable: numberValue(proof.approvedKnowledgeAvailable),
      impact: 'high',
      autonomousWork: [
        'Draft privacy-safe proof assets from approved Discord knowledge only.',
        'Keep public proof readiness and growth attribution checks current.',
      ],
      guardedCommands: [
        'npm run discord:public-growth-readiness',
        'npm run discord:operating-cycle:dry-run',
      ],
      liveApprovalBoundary: [
        'Public proof drafts require explicit admin approval before publishing.',
        'Member names/screenshots/private details require separate permission before public use.',
      ],
      acceptanceCriteria: [
        '4 pending-approved or published public proof assets exist.',
        'Each asset has source provenance, privacy score, and growth attribution path.',
      ],
    }),
    buildLane({
      key: 'premium_workflow_proof',
      title: 'Premium workflow proof',
      current: premiumCurrent,
      target: premiumTarget,
      impact: 'high',
      autonomousWork: [
        'Keep premium smoke coverage, premium readiness, and admin premium queue evidence current.',
        'Prepare one deliberate premium proof scenario without granting live access automatically.',
      ],
      guardedCommands: [
        'npm run discord:smoke-premium-workflows',
        'npm run discord:premium-readiness',
      ],
      liveApprovalBoundary: [
        'A real or explicitly seeded premium review/office-hours fulfillment must be approved before it counts.',
        'Role-only premium status does not count as workflow proof.',
      ],
      acceptanceCriteria: [
        'At least one premium review or office-hours request is answered/completed.',
        'Authorization, SLA/status, fulfillment, and no-free-member-bypass evidence are visible.',
      ],
    }),
  ];

  const blocked = lanes.filter((lane) => lane.status !== 'passed');
  const passed = lanes.filter((lane) => lane.status === 'passed');
  const nextBestLane = blocked[0] ?? null;
  const report: DiscordLiveProofAcceleratorReport = {
    ok: true,
    version: DISCORD_LIVE_PROOF_ACCELERATOR_VERSION,
    generatedAt: input.generatedAt,
    mutationMode: 'local_file_evidence_only',
    releaseMeaning: 'This accelerator writes local evidence and command plans only. It does not approve knowledge, sync RAG, publish public proof, mutate Discord, or create premium fulfillments.',
    status: blocked.length === 0 ? 'all_live_targets_met' : 'proof_acceleration_required',
    summary: {
      blockedLaneCount: blocked.length,
      passedLaneCount: passed.length,
      totalShortfall: lanes.reduce((sum, lane) => sum + lane.shortfall, 0),
      nextBestLane: nextBestLane?.key ?? null,
      nextBestAction: nextBestLane
        ? `${nextBestLane.title}: ${nextBestLane.autonomousWork[0]}`
        : 'All tracked live proof lanes are at target; run final scorecard and release review.',
    },
    lanes,
    autonomousCommandPlan: [
      'npm run discord:proof-source-scan',
      'npm run discord:approved-knowledge-packet',
      'npm run discord:proof-candidate-audit',
      'npm run discord:live-proof-accelerator',
      'npm run discord:sageforge-institutional-harness',
    ],
    explicitApprovalCommandPlan: [
      'SAGE_ALLOW_DISCORD_OPERATING_CYCLE=approved npm run discord:operating-cycle',
      'SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:approved-missing',
      'npm run discord:register',
      'npm run discord:pin-posts',
    ],
    operatorChecklist: blocked.flatMap((lane, index) => [
      `${index + 1}. ${lane.title}: current ${lane.current}/${lane.target}; shortfall ${lane.shortfall}.`,
      `   Local work: ${lane.autonomousWork[0]}`,
      `   Boundary: ${lane.liveApprovalBoundary[0]}`,
    ]),
    antiFakeRules: [
      'Do not count local drafts, smoke rows, dry-run rows, raw captured messages, or generated templates as live proof.',
      'Do not claim 95-99+ until live proof lanes meet target and final scorecard evidence passes.',
      'Do not sync raw Discord text into authoritative RAG; sync only approved, anonymized, RAG-safe source material.',
      'Do not publish public proof assets without explicit admin approval and privacy review.',
      'Do not count premium role presence as premium workflow proof.',
    ],
    failures: [],
  };

  return {
    ...report,
    ok: validateDiscordLiveProofAccelerator(report).ok,
    failures: validateDiscordLiveProofAccelerator(report).failures,
  };
}

export function validateDiscordLiveProofAccelerator(report: DiscordLiveProofAcceleratorReport): { ok: boolean; failures: string[] } {
  const failures: string[] = [];
  if (report.version !== DISCORD_LIVE_PROOF_ACCELERATOR_VERSION) failures.push('wrong_version');
  if (report.mutationMode !== 'local_file_evidence_only') failures.push('wrong_mutation_mode');
  if (!report.releaseMeaning.includes('does not approve knowledge')) failures.push('missing_non_mutation_boundary');
  for (const required of ['approved_discord_knowledge', 'rag_discord_sources', 'public_proof_assets', 'premium_workflow_proof'] satisfies LaneKey[]) {
    if (!report.lanes.some((lane) => lane.key === required)) failures.push(`missing_lane:${required}`);
  }
  if (report.lanes.some((lane) => lane.shortfall !== Math.max(0, lane.target - lane.current))) failures.push('shortfall_mismatch');
  if (report.lanes.some((lane) => lane.acceptanceCriteria.length < 2)) failures.push('thin_acceptance_criteria');
  if (!report.autonomousCommandPlan.includes('npm run discord:live-proof-accelerator')) failures.push('self_command_missing');
  if (!report.explicitApprovalCommandPlan.some((command) => command.includes('SAGE_ALLOW_DISCORD_OPERATING_CYCLE=approved'))) failures.push('missing_guarded_operating_cycle');
  if (!report.antiFakeRules.some((rule) => rule.includes('raw captured messages'))) failures.push('missing_raw_message_antifake_rule');
  if (!report.antiFakeRules.some((rule) => rule.includes('premium role'))) failures.push('missing_premium_antifake_rule');
  return { ok: failures.length === 0, failures };
}

export function renderDiscordLiveProofAcceleratorMarkdown(report: DiscordLiveProofAcceleratorReport): string {
  return [
    '# Discord Live Proof Accelerator',
    '',
    `Generated: ${report.generatedAt}`,
    `Status: ${report.status}`,
    `Mutation mode: ${report.mutationMode}`,
    '',
    report.releaseMeaning,
    '',
    '## Summary',
    '',
    `- Blocked lanes: ${report.summary.blockedLaneCount}`,
    `- Passed lanes: ${report.summary.passedLaneCount}`,
    `- Total shortfall: ${report.summary.totalShortfall}`,
    `- Next best lane: ${report.summary.nextBestLane ?? 'none'}`,
    `- Next best action: ${report.summary.nextBestAction}`,
    '',
    '## Lanes',
    '',
    ...report.lanes.flatMap((lane) => [
      `### ${lane.title}`,
      '',
      `- Key: ${lane.key}`,
      `- Status: ${lane.status}`,
      `- Current: ${lane.current}/${lane.target}`,
      `- Shortfall: ${lane.shortfall}`,
      `- Impact: ${lane.impact}`,
      `- Local work: ${lane.autonomousWork.join(' ')}`,
      `- Approval boundary: ${lane.liveApprovalBoundary.join(' ')}`,
      `- Acceptance: ${lane.acceptanceCriteria.join(' ')}`,
      '',
    ]),
    '## Autonomous Command Plan',
    '',
    ...report.autonomousCommandPlan.map((command) => `- \`${command}\``),
    '',
    '## Explicit Approval Command Plan',
    '',
    ...report.explicitApprovalCommandPlan.map((command) => `- \`${command}\``),
    '',
    '## Operator Checklist',
    '',
    ...report.operatorChecklist.map((item) => `- ${item}`),
    '',
    '## Anti-Fake Rules',
    '',
    ...report.antiFakeRules.map((item) => `- ${item}`),
    '',
  ].join('\n');
}
