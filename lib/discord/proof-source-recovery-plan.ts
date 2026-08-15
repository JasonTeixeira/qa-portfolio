export type DiscordProofSourceLaneReadiness = {
  current: number;
  target: number;
  blocker?: string | null;
  reviewableCandidates?: number;
  approvedKnowledgeAvailable?: number;
  applyClicks?: number;
  premiumMembers?: number;
  premiumReviews?: number;
  officeHours?: number;
};

export type DiscordProofSourceVolumeScanEvidence = {
  ok: boolean;
  generatedAt?: string;
  mutationMode?: string;
  laneReadiness: Record<string, DiscordProofSourceLaneReadiness>;
  nextActions?: string[];
  errors?: Array<{ label: string; error: string }>;
};

export type DiscordProofSourceRecoveryLane = {
  key: string;
  status: 'passed' | 'blocked';
  current: number;
  target: number;
  shortfall: number;
  priority: number;
  sourceVolumeState: 'no_source_volume' | 'needs_review' | 'needs_sync' | 'needs_publication' | 'needs_fulfillment' | 'ready';
  evidenceToCollect: string[];
  collectionCadence: string[];
  acceptanceChecklist: string[];
  doNotCount: string[];
  adminSurface: string;
  safeLocalCommand: string;
  liveActionRequired: string;
  verificationCommand: string;
  blocker: string | null;
};

export type DiscordProofSourceRecoveryPlan = {
  ok: true;
  version: 'discord-proof-source-recovery-plan-v1';
  generatedAt: string;
  mutationMode: 'local_file_evidence_only';
  releaseMeaning: string;
  scanGeneratedAt: string | null;
  status: 'passed' | 'blocked';
  summary: {
    laneCount: number;
    blockedLaneCount: number;
    totalShortfall: number;
    nextLane: string | null;
  };
  lanes: DiscordProofSourceRecoveryLane[];
  immediateActionOrder: string[];
  antiFakeRules: string[];
};

const LANE_COPY: Record<string, {
  priority: number;
  adminSurface: string;
  safeLocalCommand: string;
  liveActionRequired: string;
  verificationCommand: string;
  evidenceToCollect: string[];
  collectionCadence: string[];
  acceptanceChecklist: string[];
  doNotCount: string[];
}> = {
  approvedDiscordKnowledge: {
    priority: 1,
    adminSurface: '/admin/discord -> Content Queue, Drafts, Knowledge/RAG',
    safeLocalCommand: 'npm run discord:proof-source-scan',
    liveActionRequired: 'Collect and approve high-signal member questions, helpful answers, project submissions, reviews, wins, and resources.',
    verificationCommand: 'npm run discord:proof-source-scan && npm run discord:operating-cycle:dry-run',
    evidenceToCollect: [
      'Specific member question with goal, attempt, blocker, and reusable teaching value.',
      'Helpful answer or review that explains a decision, risk, or build pattern.',
      'Project/resource/win that can become a lesson without exposing private data.',
    ],
    collectionCadence: [
      'Daily: review captured questions, answers, builds, reviews, wins, and resources for reusable teaching value.',
      'Weekly: approve at least two privacy-safe knowledge candidates until the lane reaches 10/10.',
      'Monthly: remove stale, private, or low-context candidates that should not become durable knowledge.',
    ],
    acceptanceChecklist: [
      'Source has a concrete problem, artifact, decision, or teaching moment.',
      'Source is privacy-safe, anonymized, or explicitly approved for internal reuse.',
      'Admin decision reason explains why the source belongs in future answers or lessons.',
    ],
    doNotCount: [
      'Raw unapproved Discord chatter.',
      'Generic praise, greetings, low-context messages, or private member details.',
      'Synthetic smoke rows or dry-run drafts.',
    ],
  },
  ragDiscordSources: {
    priority: 2,
    adminSurface: '/admin/discord -> RAG Health, Corpus Health, Eval Runs',
    safeLocalCommand: 'npm run discord:proof-source-scan',
    liveActionRequired: 'After approved knowledge exists, run approved Discord RAG sync and re-run eval/scorecard.',
    verificationCommand: 'SAGE_ALLOW_DISCORD_OPERATING_CYCLE=approved npm run discord:operating-cycle && SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:approved-missing',
    evidenceToCollect: [
      'Approved Discord source synced into rag_sources with approved provenance.',
      'Generated document/chunk tied back to an approved question, answer, queue item, or draft.',
      'Retrieval/eval evidence showing the synced source is citeable.',
    ],
    collectionCadence: [
      'Weekly: run approved-source sync only after the approved knowledge lane has new material.',
      'After each sync: re-run retrieval and eval evidence before using score improvement claims.',
      'Monthly: audit Discord-derived RAG sources for stale, rejected, or privacy-sensitive material.',
    ],
    acceptanceChecklist: [
      'RAG source points to an approved Discord question, answer, queue item, or content draft.',
      'Document/chunk text is citeable and does not include raw private chatter.',
      'Retrieval evidence shows the source can be selected for relevant questions.',
    ],
    doNotCount: [
      'Raw discord_messages rows.',
      'Rejected, deleted, private, or low-quality source material.',
      'RAG sources without approved Discord provenance.',
    ],
  },
  publicProofAssets: {
    priority: 3,
    adminSurface: '/admin/discord -> Public Proof Sources, Public Growth Drafts',
    safeLocalCommand: 'npm run discord:proof-source-scan',
    liveActionRequired: 'Create privacy-safe weekly proof drafts from approved Discord source material and approve/publish them manually.',
    verificationCommand: 'SAGE_ALLOW_DISCORD_OPERATING_CYCLE=approved npm run discord:operating-cycle && npm run discord:proof-source-scan',
    evidenceToCollect: [
      'Approved Discord source with public-sharing status anonymized or explicit.',
      'Public proof draft with source provenance and a clear lesson/proof angle.',
      'Growth event or application attribution tied to the proof cycle.',
    ],
    collectionCadence: [
      'Weekly: select one approved source that can become a privacy-safe public lesson or proof asset.',
      'Weekly: approve or reject the public proof draft before publishing anywhere external.',
      'After publishing: record apply clicks, applications, and source attribution for that proof cycle.',
    ],
    acceptanceChecklist: [
      'Public proof asset references approved source provenance without leaking private member data.',
      'Draft has a clear lesson, outcome, or proof angle rather than generic promotional copy.',
      'Growth event tracking is attached before the asset counts toward the public proof target.',
    ],
    doNotCount: [
      'Public posts detached from approved source material.',
      'Member names, screenshots, or details without explicit permission.',
      'Generic social content that does not prove the community system.',
    ],
  },
  premiumWorkflowProof: {
    priority: 4,
    adminSurface: '/admin/discord -> Premium, Office Hours, Member Intelligence',
    safeLocalCommand: 'npm run discord:smoke-premium-workflows',
    liveActionRequired: 'Fulfill one premium review, deeper answer, or office-hours workflow with visible authorization and outcome.',
    verificationCommand: 'npm run discord:smoke-premium-workflows && npm run discord:proof-source-scan',
    evidenceToCollect: [
      'Premium authorization or deliberately seeded premium scenario.',
      'Submitted artifact/question with status answered, completed, or fulfilled.',
      'Logged SLA/outcome proving premium fulfillment without free-member bypass.',
    ],
    collectionCadence: [
      'Weekly: review premium members, open review requests, deeper-answer requests, and office-hours queue.',
      'Per request: record authorization, requested outcome, SLA state, and final response status.',
      'Monthly: audit premium fulfillment quality and economics before changing the premium promise.',
    ],
    acceptanceChecklist: [
      'Proof shows premium authorization or a deliberately seeded premium test scenario.',
      'Request has a submitted artifact/question and a completed or answered outcome.',
      'SLA/outcome is logged without granting premium-only workflows to unqualified free members.',
    ],
    doNotCount: [
      'Premium interest without a fulfilled workflow.',
      'Premium role alone.',
      'Queued requests with no answer/completion outcome.',
    ],
  },
};

export function buildDiscordProofSourceRecoveryPlan(input: {
  generatedAt: string;
  scan: DiscordProofSourceVolumeScanEvidence;
}): DiscordProofSourceRecoveryPlan {
  const lanes = Object.entries(input.scan.laneReadiness ?? {})
    .map(([key, lane]) => buildLane(key, lane))
    .sort((a, b) => a.priority - b.priority);
  const blocked = lanes.filter((lane) => lane.status === 'blocked');

  return {
    ok: true,
    version: 'discord-proof-source-recovery-plan-v1',
    generatedAt: input.generatedAt,
    mutationMode: 'local_file_evidence_only',
    releaseMeaning: 'This recovery plan reads source-volume evidence and writes local guidance only. It does not approve, sync, publish, assign roles, call AI models, or satisfy operating proof.',
    scanGeneratedAt: input.scan.generatedAt ?? null,
    status: blocked.length ? 'blocked' : 'passed',
    summary: {
      laneCount: lanes.length,
      blockedLaneCount: blocked.length,
      totalShortfall: lanes.reduce((sum, lane) => sum + lane.shortfall, 0),
      nextLane: blocked[0]?.key ?? null,
    },
    lanes,
    immediateActionOrder: blocked.map((lane) => lane.liveActionRequired),
    antiFakeRules: [
      'Do not count dry-run, smoke, synthetic, rejected, or raw unapproved rows as operating proof.',
      'Do not sync raw Discord messages into authoritative RAG without admin approval and privacy review.',
      'Do not publish public proof without explicit anonymized/approved sharing status.',
      'Do not count premium role membership as premium workflow fulfillment.',
    ],
  };
}

export function validateDiscordProofSourceRecoveryPlan(plan: DiscordProofSourceRecoveryPlan) {
  const failures: string[] = [];
  if (plan.version !== 'discord-proof-source-recovery-plan-v1') failures.push('wrong_version');
  if (plan.mutationMode !== 'local_file_evidence_only') failures.push('wrong_mutation_mode');
  if (!plan.releaseMeaning.includes('does not approve')) failures.push('missing_non_mutation_disclaimer');
  if (plan.lanes.length < 4) failures.push('missing_recovery_lanes');
  if (plan.lanes.some((lane) => lane.shortfall !== Math.max(0, lane.target - lane.current))) failures.push('shortfall_mismatch');
  if (plan.summary.blockedLaneCount !== plan.lanes.filter((lane) => lane.status === 'blocked').length) failures.push('blocked_lane_count_mismatch');
  if (plan.summary.totalShortfall !== plan.lanes.reduce((sum, lane) => sum + lane.shortfall, 0)) failures.push('total_shortfall_mismatch');
  if (plan.lanes.some((lane) => lane.evidenceToCollect.length < 2)) failures.push('missing_evidence_guidance');
  if (plan.lanes.some((lane) => lane.collectionCadence.length < 3)) failures.push('missing_collection_cadence');
  if (plan.lanes.some((lane) => lane.acceptanceChecklist.length < 3)) failures.push('missing_acceptance_checklist');
  if (plan.lanes.some((lane) => lane.doNotCount.length < 2)) failures.push('missing_anti_fake_lane_rules');
  if (!plan.antiFakeRules.some((rule) => rule.includes('dry-run'))) failures.push('missing_global_dry_run_rule');
  if (plan.status === 'passed' && plan.summary.blockedLaneCount > 0) failures.push('passed_with_blocked_lanes');
  if (plan.status === 'blocked' && plan.immediateActionOrder.length === 0) failures.push('blocked_without_actions');
  return {
    ok: failures.length === 0,
    failures,
  };
}

export function renderDiscordProofSourceRecoveryPlanMarkdown(plan: DiscordProofSourceRecoveryPlan): string {
  return [
    '# Discord Proof Source Recovery Plan',
    '',
    `Generated: ${plan.generatedAt}`,
    `Status: ${plan.status}`,
    `Mutation mode: ${plan.mutationMode}`,
    '',
    plan.releaseMeaning,
    '',
    '## Summary',
    '',
    `- Lanes: ${plan.summary.laneCount}`,
    `- Blocked lanes: ${plan.summary.blockedLaneCount}`,
    `- Total shortfall: ${plan.summary.totalShortfall}`,
    `- Next lane: ${plan.summary.nextLane ?? 'none'}`,
    '',
    '## Lane Plan',
    '',
    ...plan.lanes.flatMap((lane) => [
      `### ${lane.key}`,
      '',
      `- Status: ${lane.status}`,
      `- Count: ${lane.current}/${lane.target}`,
      `- Shortfall: ${lane.shortfall}`,
      `- State: ${lane.sourceVolumeState}`,
      `- Admin surface: ${lane.adminSurface}`,
      `- Safe local command: \`${lane.safeLocalCommand}\``,
      `- Live action: ${lane.liveActionRequired}`,
      `- Verification: \`${lane.verificationCommand}\``,
      '',
      'Evidence to collect:',
      ...lane.evidenceToCollect.map((item) => `- ${item}`),
      '',
      'Collection cadence:',
      ...lane.collectionCadence.map((item) => `- ${item}`),
      '',
      'Acceptance checklist:',
      ...lane.acceptanceChecklist.map((item) => `- ${item}`),
      '',
      'Do not count:',
      ...lane.doNotCount.map((item) => `- ${item}`),
      '',
    ]),
    '## Anti-Fake Rules',
    '',
    ...plan.antiFakeRules.map((rule) => `- ${rule}`),
    '',
  ].join('\n');
}

function buildLane(key: string, lane: DiscordProofSourceLaneReadiness): DiscordProofSourceRecoveryLane {
  const copy = LANE_COPY[key] ?? {
    priority: 99,
    adminSurface: '/admin/discord',
    safeLocalCommand: 'npm run discord:proof-source-scan',
    liveActionRequired: lane.blocker ?? `Collect source-volume evidence for ${key}.`,
    verificationCommand: 'npm run discord:proof-source-scan',
    evidenceToCollect: ['Lane-specific source evidence.', 'Admin-reviewed proof record.'],
    collectionCadence: ['Review this lane weekly.', 'Collect source evidence before scoring.', 'Rerun verification after collection.'],
    acceptanceChecklist: ['Evidence is source-backed.', 'Evidence is admin-reviewed.', 'Evidence is privacy-safe.'],
    doNotCount: ['Synthetic data.', 'Unapproved records.'],
  };
  const current = Number(lane.current ?? 0);
  const target = Number(lane.target ?? 0);
  const shortfall = Math.max(0, target - current);
  return {
    key,
    status: shortfall === 0 ? 'passed' : 'blocked',
    current,
    target,
    shortfall,
    priority: copy.priority,
    sourceVolumeState: classifyLaneState(key, lane, shortfall),
    evidenceToCollect: copy.evidenceToCollect,
    collectionCadence: copy.collectionCadence,
    acceptanceChecklist: copy.acceptanceChecklist,
    doNotCount: copy.doNotCount,
    adminSurface: copy.adminSurface,
    safeLocalCommand: copy.safeLocalCommand,
    liveActionRequired: copy.liveActionRequired,
    verificationCommand: copy.verificationCommand,
    blocker: lane.blocker ?? null,
  };
}

function classifyLaneState(key: string, lane: DiscordProofSourceLaneReadiness, shortfall: number): DiscordProofSourceRecoveryLane['sourceVolumeState'] {
  if (shortfall === 0) return 'ready';
  if (key === 'approvedDiscordKnowledge' && Number(lane.reviewableCandidates ?? 0) > 0) return 'needs_review';
  if (key === 'ragDiscordSources' && Number(lane.approvedKnowledgeAvailable ?? 0) > 0) return 'needs_sync';
  if (key === 'publicProofAssets' && Number(lane.approvedKnowledgeAvailable ?? 0) > 0) return 'needs_publication';
  if (key === 'premiumWorkflowProof') return 'needs_fulfillment';
  return 'no_source_volume';
}
