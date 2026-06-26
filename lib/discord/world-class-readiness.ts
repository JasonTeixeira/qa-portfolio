export type WorldClassScorecardItem = {
  category: string;
  score: number;
  evidence?: string[];
  knownGaps?: string[];
  nextAction?: string;
  blocker?: {
    owner?: string;
    reason?: string;
    nextAction?: string;
  } | null;
};

export type WorldClassReadinessInput = {
  generatedAt: string;
  averageScore: number;
  worldClassThreshold: number;
  worldClassEligible: boolean;
  scorecard: WorldClassScorecardItem[];
  releaseGates?: Array<{
    name: string;
    passed: boolean;
    evidence?: string;
  }>;
  operatingBlockers: string[];
  requiredOperatingProof: string[];
  ragEvalMissingPreflight?: {
    status?: string;
    ok?: boolean;
    missingEvalCount?: number;
    readyForApprovedEvalCount?: number;
    selectedMatchesCoverage?: boolean;
    approvedCommand?: string;
    releaseMeaning?: string;
  } | null;
  ragEvalRecoveryPlan?: {
    status?: string;
    ok?: boolean;
    missingEvalCount?: number;
    readyMissingEvalCount?: number;
    failedEvalCount?: number;
    approvedCommand?: string;
    releaseMeaning?: string;
  } | null;
  proofSourceRecoveryPlan?: {
    status?: string;
    ok?: boolean;
    totalShortfall?: number;
    blockedLaneCount?: number;
    nextLaneKey?: string | null;
    releaseMeaning?: string;
  } | null;
  gatewayOperatingPacket?: {
    status?: string;
    current?: number;
    target?: number;
    remaining?: number;
    usableMessageState?: string;
    messageContentEnabled?: boolean | null;
    messageContentSignalSource?: string | null;
    heartbeatFresh?: boolean;
    workerId?: string | null;
    nextActions?: string[];
    releaseMeaning?: string | null;
  } | null;
};

export type WorldClassReadinessCategory = {
  category: string;
  score: number;
  status: 'earned_95_plus' | 'strong_but_not_world_class' | 'needs_operating_proof' | 'needs_build_work';
  scoreGapTo95: number;
  nextAction: string;
  blockerReason: string | null;
  evidenceCount: number;
};

export type WorldClassReadinessReport = {
  ok: true;
  version: 'world-class-readiness-v1';
  generatedAt: string;
  releaseDecision: 'do_not_claim_world_class' | 'eligible_for_world_class_claim';
  averageScore: number;
  worldClassThreshold: number;
  worldClassEligible: boolean;
  mutationMode: 'local_file_evidence_only';
  summary: {
    categoryCount: number;
    categoriesAtOrAbove95: number;
    categoriesBelow95: number;
    categoriesBelow85: number;
    maxScoreGapTo95: number;
    operatingBlockers: string[];
    releaseGateCount: number;
    releaseGatesPassed: number;
    releaseGateFailures: string[];
  };
  ragEvalMissingPreflight: {
    status: string;
    ok: boolean;
    missingEvalCount: number;
    readyForApprovedEvalCount: number;
    selectedMatchesCoverage: boolean;
    approvedCommand: string | null;
    releaseMeaning: string | null;
  };
  ragEvalRecoveryPlan: {
    status: string;
    ok: boolean;
    missingEvalCount: number;
    readyMissingEvalCount: number;
    failedEvalCount: number;
    approvedCommand: string | null;
    releaseMeaning: string | null;
  };
  proofSourceRecoveryPlan: {
    status: string;
    ok: boolean;
    totalShortfall: number;
    blockedLaneCount: number;
    nextLaneKey: string | null;
    releaseMeaning: string | null;
  };
  gatewayOperatingPacket: {
    status: string;
    current: number;
    target: number;
    remaining: number;
    usableMessageState: string | null;
    messageContentEnabled: boolean | null;
    messageContentSignalSource: string | null;
    heartbeatFresh: boolean;
    workerId: string | null;
    nextActions: string[];
    releaseMeaning: string | null;
  };
  immediateActionOrder: string[];
  operatingProofRequired: string[];
  categories: WorldClassReadinessCategory[];
};

const OPERATING_BLOCKER_ACTIONS: Record<string, string> = {
  discord_gateway_capture_blocked:
    'Deploy or run the gateway worker with Message Content Intent proven, capture a fresh non-bot message, then rerun gateway capture diagnosis.',
  approved_discord_knowledge_sources_below_target:
    'Approve at least 10 high-signal Discord questions, answers, builds, reviews, wins, or resources as knowledge candidates.',
  rag_discord_sources_below_target:
    'Sync approved Discord candidates into authoritative RAG and rerun retrieval/answer evals.',
  public_proof_assets_below_target:
    'Create and approve four privacy-safe public proof assets from approved Discord source material.',
  public_proof_apply_clicks_below_target:
    'Publish at least one public proof asset with tracked apply/join intent before claiming growth proof.',
  applications_submitted_below_target:
    'Drive at least one measured Discord application from the approval-gated growth funnel.',
  premium_workflow_proof_below_target:
    'Run one premium review, deeper-answer, or office-hours proof path with a real or deliberately seeded premium scenario.',
};

export function classifyWorldClassCategory(item: WorldClassScorecardItem): WorldClassReadinessCategory['status'] {
  if (item.score >= 95 && !item.blocker) return 'earned_95_plus';
  if (item.score >= 90) return 'needs_operating_proof';
  if (item.score >= 85) return 'strong_but_not_world_class';
  return 'needs_build_work';
}

function uniqueActionList(actions: string[]): string[] {
  return [...new Set(actions.map((action) => action.trim()).filter(Boolean))];
}

function actionForOperatingBlocker(blocker: string): string {
  const blockerKey = blocker.split(':')[0] ?? blocker;
  return OPERATING_BLOCKER_ACTIONS[blockerKey] ?? `Resolve operating blocker: ${blocker}.`;
}

export function buildWorldClassReadinessReport(input: WorldClassReadinessInput): WorldClassReadinessReport {
  const operatingBlockers = uniqueActionList(input.operatingBlockers);
  const releaseGates = Array.isArray(input.releaseGates) ? input.releaseGates : [];
  const releaseGateFailures = releaseGates
    .filter((gate) => gate.passed !== true)
    .map((gate) => gate.name);
  const categories = input.scorecard
    .map((item) => {
      const blockerReason = item.blocker?.reason || item.knownGaps?.[0] || null;
      return {
        category: item.category,
        score: item.score,
        status: classifyWorldClassCategory(item),
        scoreGapTo95: Math.max(0, input.worldClassThreshold - item.score),
        nextAction: item.blocker?.nextAction || item.nextAction || 'Collect stronger evidence and rerun the scorecard.',
        blockerReason,
        evidenceCount: item.evidence?.length ?? 0,
      };
    })
    .sort((a, b) => {
      if (b.scoreGapTo95 !== a.scoreGapTo95) return b.scoreGapTo95 - a.scoreGapTo95;
      return a.category.localeCompare(b.category);
    });

  const categoriesAtOrAbove95 = categories.filter((item) => item.score >= input.worldClassThreshold).length;
  const categoriesBelow95 = categories.filter((item) => item.score < input.worldClassThreshold).length;
  const categoriesBelow85 = categories.filter((item) => item.score < 85).length;
  const maxScoreGapTo95 = categories.reduce((max, item) => Math.max(max, item.scoreGapTo95), 0);

  const blockerActions = operatingBlockers.map(actionForOperatingBlocker);
  const ragEvalPreflight = input.ragEvalMissingPreflight ?? null;
  const ragEvalRecoveryPlan = input.ragEvalRecoveryPlan ?? null;
  const proofSourceRecoveryPlan = input.proofSourceRecoveryPlan ?? null;
  const gatewayOperatingPacket = input.gatewayOperatingPacket ?? null;
  const gatewayReadyForFreshMessageAction = gatewayOperatingPacket?.status === 'ready_for_fresh_message'
    ? gatewayOperatingPacket.nextActions?.[0] ?? 'Post one fresh non-bot member message, then rerun gateway capture diagnosis and the gateway operating packet.'
    : null;
  const adjustedBlockerActions = blockerActions.map((action) => (
    gatewayReadyForFreshMessageAction && action.includes('gateway worker')
      ? gatewayReadyForFreshMessageAction
      : action
  ));
  const ragEvalActions = releaseGateFailures.some((failure) => failure.includes('rag_eval'))
    ? [
        'Run npm run rag:evaluate:recovery-plan to review the local missing/failed eval backlog before any approved eval execution.',
        'Run npm run rag:evaluate:missing-preflight before any approved missing-eval execution to confirm local source coverage is still ready.',
        (ragEvalRecoveryPlan?.approvedCommand ?? ragEvalPreflight?.approvedCommand)
          ? `With explicit approval, run ${ragEvalRecoveryPlan?.approvedCommand ?? ragEvalPreflight?.approvedCommand} to close missing RAG eval coverage.`
          : 'With explicit approval, run the missing RAG eval command after confirming the execution packet.',
      ]
    : [];
  const gatewayOperatingActions = gatewayReadyForFreshMessageAction
    ? [gatewayReadyForFreshMessageAction]
    : [];
  const proofRecoveryActions = proofSourceRecoveryPlan?.totalShortfall
    ? [
        'Run npm run discord:proof-source-scan, then npm run discord:proof-source-recovery-plan to refresh source-volume blockers.',
        proofSourceRecoveryPlan.nextLaneKey
          ? `Work the next proof lane: ${proofSourceRecoveryPlan.nextLaneKey}.`
          : 'Work the next blocked proof-source lane from the recovery plan.',
      ]
    : [];
  const categoryActions = categories
    .filter((item) => item.score < input.worldClassThreshold)
    .slice(0, 8)
    .map((item) => item.nextAction);
  const immediateActionOrder = uniqueActionList([
    ...ragEvalActions,
    ...gatewayOperatingActions,
    ...proofRecoveryActions,
    ...adjustedBlockerActions,
    ...categoryActions,
  ]);

  return {
    ok: true,
    version: 'world-class-readiness-v1',
    generatedAt: input.generatedAt,
    releaseDecision: input.worldClassEligible && releaseGateFailures.length === 0
      ? 'eligible_for_world_class_claim'
      : 'do_not_claim_world_class',
    averageScore: input.averageScore,
    worldClassThreshold: input.worldClassThreshold,
    worldClassEligible: input.worldClassEligible,
    mutationMode: 'local_file_evidence_only',
    summary: {
      categoryCount: categories.length,
      categoriesAtOrAbove95,
      categoriesBelow95,
      categoriesBelow85,
      maxScoreGapTo95,
      operatingBlockers,
      releaseGateCount: releaseGates.length,
      releaseGatesPassed: releaseGates.filter((gate) => gate.passed === true).length,
      releaseGateFailures,
    },
    ragEvalMissingPreflight: {
      status: ragEvalPreflight?.status ?? 'missing',
      ok: ragEvalPreflight?.ok === true,
      missingEvalCount: ragEvalPreflight?.missingEvalCount ?? 0,
      readyForApprovedEvalCount: ragEvalPreflight?.readyForApprovedEvalCount ?? 0,
      selectedMatchesCoverage: ragEvalPreflight?.selectedMatchesCoverage === true,
      approvedCommand: ragEvalPreflight?.approvedCommand ?? null,
      releaseMeaning: ragEvalPreflight?.releaseMeaning ?? null,
    },
    ragEvalRecoveryPlan: {
      status: ragEvalRecoveryPlan?.status ?? 'missing',
      ok: ragEvalRecoveryPlan?.ok === true,
      missingEvalCount: ragEvalRecoveryPlan?.missingEvalCount ?? 0,
      readyMissingEvalCount: ragEvalRecoveryPlan?.readyMissingEvalCount ?? 0,
      failedEvalCount: ragEvalRecoveryPlan?.failedEvalCount ?? 0,
      approvedCommand: ragEvalRecoveryPlan?.approvedCommand ?? null,
      releaseMeaning: ragEvalRecoveryPlan?.releaseMeaning ?? null,
    },
    proofSourceRecoveryPlan: {
      status: proofSourceRecoveryPlan?.status ?? 'missing',
      ok: proofSourceRecoveryPlan?.ok === true,
      totalShortfall: proofSourceRecoveryPlan?.totalShortfall ?? 0,
      blockedLaneCount: proofSourceRecoveryPlan?.blockedLaneCount ?? 0,
      nextLaneKey: proofSourceRecoveryPlan?.nextLaneKey ?? null,
      releaseMeaning: proofSourceRecoveryPlan?.releaseMeaning ?? null,
    },
    gatewayOperatingPacket: {
      status: gatewayOperatingPacket?.status ?? 'missing',
      current: gatewayOperatingPacket?.current ?? 0,
      target: gatewayOperatingPacket?.target ?? 1,
      remaining: gatewayOperatingPacket?.remaining ?? 1,
      usableMessageState: gatewayOperatingPacket?.usableMessageState ?? null,
      messageContentEnabled: gatewayOperatingPacket?.messageContentEnabled ?? null,
      messageContentSignalSource: gatewayOperatingPacket?.messageContentSignalSource ?? null,
      heartbeatFresh: gatewayOperatingPacket?.heartbeatFresh === true,
      workerId: gatewayOperatingPacket?.workerId ?? null,
      nextActions: gatewayOperatingPacket?.nextActions ?? [],
      releaseMeaning: gatewayOperatingPacket?.releaseMeaning ?? null,
    },
    immediateActionOrder,
    operatingProofRequired: input.requiredOperatingProof,
    categories,
  };
}
