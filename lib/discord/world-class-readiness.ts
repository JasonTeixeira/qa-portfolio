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
  immediateActionOrder: string[];
  operatingProofRequired: string[];
  categories: WorldClassReadinessCategory[];
};

const OPERATING_BLOCKER_ACTIONS: Record<string, string> = {
  discord_gateway_capture_blocked:
    'Deploy or run the gateway worker with Message Content Intent proven, capture a fresh non-bot message, then rerun gateway capture diagnosis.',
  approved_discord_knowledge_sources_empty:
    'Approve at least 10 high-signal Discord questions, answers, builds, reviews, wins, or resources as knowledge candidates.',
  rag_discord_sources_empty:
    'Sync approved Discord candidates into authoritative RAG and rerun retrieval/answer evals.',
  public_proof_drafts_empty:
    'Create and approve one privacy-safe public proof draft from approved Discord source material.',
  premium_workflow_live_proof_empty:
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

  const blockerActions = operatingBlockers.map(
    (blocker) => OPERATING_BLOCKER_ACTIONS[blocker] ?? `Resolve operating blocker: ${blocker}.`,
  );
  const categoryActions = categories
    .filter((item) => item.score < input.worldClassThreshold)
    .slice(0, 8)
    .map((item) => item.nextAction);
  const immediateActionOrder = uniqueActionList([...blockerActions, ...categoryActions]);

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
    immediateActionOrder,
    operatingProofRequired: input.requiredOperatingProof,
    categories,
  };
}
