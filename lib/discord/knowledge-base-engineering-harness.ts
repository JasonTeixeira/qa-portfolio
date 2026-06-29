export const KNOWLEDGE_BASE_ENGINEERING_HARNESS_VERSION = 'knowledge-base-engineering-harness-v1';

type GateStatus = 'passed' | 'blocked';

export type KnowledgeBaseHarnessGate = {
  key: string;
  status: GateStatus;
  score: number;
  maxScore: number;
  evidence: string;
  requiredForProduction: boolean;
  recovery: string;
};

export type KnowledgeBaseHarnessPhase = {
  key: string;
  title: string;
  status: GateStatus;
  score: number;
  maxScore: number;
  gates: KnowledgeBaseHarnessGate[];
};

export type KnowledgeBaseEngineeringHarnessInput = {
  generatedAt: string;
  careerContentHarness: any;
  sageKernelContentHarness: any;
  approvedKnowledgePacket: any;
  proofCandidateAudit: any;
  discordCorpusReadiness: any;
  knowledgeBaseE2eReadiness: any;
  ragEvalCoverage: any;
  localVerification: any;
  autonomousLoopState: any;
};

export type KnowledgeBaseEngineeringHarnessResult = {
  ok: boolean;
  version: typeof KNOWLEDGE_BASE_ENGINEERING_HARNESS_VERSION;
  generatedAt: string;
  mutationMode: 'local_file_evidence_only';
  releaseMeaning: string;
  status: 'locally_verified_waiting_on_live_approval' | 'blocked_local_harness' | 'production_ready';
  score: number;
  targetScoreRange: '95-99';
  sourceSeedSummary: {
    totalCandidates: number;
    totalApprovalDrafts: number;
    channelsCovered: string[];
  };
  phases: KnowledgeBaseHarnessPhase[];
  productionStopConditions: string[];
  safeLocalCommands: string[];
  explicitApprovalCommands: string[];
  liveOperatorActions: string[];
  antiFakeRules: string[];
  failures: string[];
};

function numberValue(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asArray<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function gate(input: {
  key: string;
  passed: boolean;
  score?: number;
  maxScore?: number;
  evidence: string;
  requiredForProduction?: boolean;
  recovery: string;
}): KnowledgeBaseHarnessGate {
  const maxScore = input.maxScore ?? 10;
  return {
    key: input.key,
    status: input.passed ? 'passed' : 'blocked',
    score: input.passed ? (input.score ?? maxScore) : 0,
    maxScore,
    evidence: input.evidence,
    requiredForProduction: input.requiredForProduction ?? true,
    recovery: input.recovery,
  };
}

function phase(input: { key: string; title: string; gates: KnowledgeBaseHarnessGate[] }): KnowledgeBaseHarnessPhase {
  const score = input.gates.reduce((sum, item) => sum + item.score, 0);
  const maxScore = input.gates.reduce((sum, item) => sum + item.maxScore, 0);
  return {
    ...input,
    status: input.gates.every((item) => item.status === 'passed') ? 'passed' : 'blocked',
    score,
    maxScore,
  };
}

function sourceChannelNames(...plans: any[]): string[] {
  return [...new Set(plans.flatMap((plan) => asArray(plan).map((item: any) => item.channel).filter(Boolean)))].sort();
}

function draftsAreApprovalGated(drafts: any[]): boolean {
  return drafts.length > 0 && drafts.every((draft) => (
    draft.status === 'planned_for_admin_review'
    && draft.operatingContract?.adminAction === 'review_then_approve_or_reject'
    && draft.operatingContract?.publishAllowedBeforeApproval === false
    && draft.operatingContract?.operatingProofEligible === false
  ));
}

function hasAntiFakeRule(payload: any, pattern: RegExp): boolean {
  return asArray<string>(payload?.antiFakeRules).some((rule) => pattern.test(rule));
}

export function buildKnowledgeBaseEngineeringHarness(
  input: KnowledgeBaseEngineeringHarnessInput,
): KnowledgeBaseEngineeringHarnessResult {
  const careerCandidates = asArray(input.careerContentHarness?.candidates);
  const careerDrafts = asArray(input.careerContentHarness?.approvalDrafts);
  const sageCandidates = asArray(input.sageKernelContentHarness?.candidates);
  const sageDrafts = asArray(input.sageKernelContentHarness?.approvalDrafts);
  const totalCandidates = careerCandidates.length + sageCandidates.length;
  const totalApprovalDrafts = careerDrafts.length + sageDrafts.length;
  const channelsCovered = sourceChannelNames(
    input.careerContentHarness?.channelPlan,
    input.sageKernelContentHarness?.channelPlan,
  );
  const approvedTarget = input.approvedKnowledgePacket?.target ?? {};
  const approvedCurrent = numberValue(approvedTarget.current);
  const approvedRequired = numberValue(approvedTarget.target || 10);
  const proofLanes = asArray(input.proofCandidateAudit?.lanes);
  const ragLane = proofLanes.find((lane: any) => lane.key === 'rag_discord_sources');
  const publicProofLane = proofLanes.find((lane: any) => lane.key === 'public_proof_assets');
  const premiumLane = proofLanes.find((lane: any) => lane.key === 'premium_workflow_proof');
  const localSummary = input.localVerification?.summary ?? {};
  const loopCurrent = input.autonomousLoopState?.current ?? {};

  const phases = [
    phase({
      key: 'source_seed_factory',
      title: 'Source Seed Factory',
      gates: [
        gate({
          key: 'career_harness_ok',
          passed: input.careerContentHarness?.ok === true,
          evidence: `career harness ok=${String(input.careerContentHarness?.ok)} candidates=${careerCandidates.length}`,
          recovery: 'Run npm run discord:career-content-harness and fix corpus path/readiness failures.',
        }),
        gate({
          key: 'sage_kernel_harness_ok',
          passed: input.sageKernelContentHarness?.ok === true,
          evidence: `sage-kernel harness ok=${String(input.sageKernelContentHarness?.ok)} candidates=${sageCandidates.length}`,
          recovery: 'Run npm run discord:sage-kernel-content-harness and fix source clone/readiness failures.',
        }),
        gate({
          key: 'seed_volume_ready',
          passed: totalCandidates >= 80 && totalApprovalDrafts >= 18,
          evidence: `${totalCandidates} source candidates / ${totalApprovalDrafts} approval-gated drafts`,
          recovery: 'Add or repair source harnesses until at least 80 candidates and 18 approval-gated drafts are available.',
        }),
        gate({
          key: 'channel_coverage_ready',
          passed: channelsCovered.length >= 6,
          evidence: `channels covered: ${channelsCovered.join(', ') || 'none'}`,
          recovery: 'Balance source candidates across daily-signal, build-lab, resources, questions, office-hours, and content-queue.',
        }),
      ],
    }),
    phase({
      key: 'approval_contract',
      title: 'Approval Contract',
      gates: [
        gate({
          key: 'drafts_are_approval_gated',
          passed: draftsAreApprovalGated([...careerDrafts, ...sageDrafts]),
          evidence: `${totalApprovalDrafts} drafts checked for publishAllowedBeforeApproval=false and operatingProofEligible=false`,
          recovery: 'Ensure every generated draft is pending admin review and cannot claim operating proof before approval.',
        }),
        gate({
          key: 'approved_knowledge_packet_valid',
          passed: input.approvedKnowledgePacket?.ok === true,
          evidence: `approved packet ok=${String(input.approvedKnowledgePacket?.ok)} current=${approvedCurrent}/${approvedRequired}`,
          recovery: 'Run npm run discord:approved-knowledge-packet and fix missing packet fields/checklists.',
        }),
        gate({
          key: 'proof_candidate_audit_valid',
          passed: input.proofCandidateAudit?.ok === true,
          evidence: `proof candidate audit ok=${String(input.proofCandidateAudit?.ok)} lanes=${proofLanes.length}`,
          recovery: 'Run npm run discord:proof-candidate-audit and fix missing critical proof fields.',
        }),
        gate({
          key: 'anti_fake_rules_present',
          passed: hasAntiFakeRule(input.sageKernelContentHarness, /do not count as approved Discord knowledge/)
            && hasAntiFakeRule(input.approvedKnowledgePacket, /not operating proof/i),
          evidence: 'source seed and approved-knowledge packet both contain anti-fake proof boundaries',
          recovery: 'Add explicit anti-fake rules blocking generated seeds, dry-runs, smoke rows, and raw messages from counting as proof.',
        }),
        gate({
          key: 'e2e_runner_guarded',
          passed: input.knowledgeBaseE2eReadiness?.ok === true,
          evidence: `knowledge-base E2E readiness ok=${String(input.knowledgeBaseE2eReadiness?.ok)} approval=${String(input.knowledgeBaseE2eReadiness?.approvalEnvRequiredForLiveE2e ?? 'missing')}`,
          recovery: 'Run npm run discord:knowledge-base-e2e-readiness and fix guarded runner/spec cleanup contract failures.',
        }),
      ],
    }),
    phase({
      key: 'rag_readiness',
      title: 'RAG Readiness',
      gates: [
        gate({
          key: 'discord_corpus_readiness_valid',
          passed: input.discordCorpusReadiness?.ok === true,
          evidence: `discord corpus readiness ok=${String(input.discordCorpusReadiness?.ok)}`,
          recovery: 'Run npm run rag:discord-corpus-readiness and fix corpus/readiness contract failures.',
        }),
        gate({
          key: 'rag_eval_coverage_ready',
          passed: input.ragEvalCoverage?.ok === true && input.ragEvalCoverage?.releaseReady === true,
          evidence: `rag eval coverage ok=${String(input.ragEvalCoverage?.ok)} releaseReady=${String(input.ragEvalCoverage?.releaseReady)}`,
          recovery: 'Run npm run rag:evaluate:coverage-readiness and repair missing eval coverage before RAG claims.',
        }),
        gate({
          key: 'approved_knowledge_target_met',
          passed: approvedCurrent >= approvedRequired,
          evidence: `${approvedCurrent}/${approvedRequired} approved Discord knowledge sources`,
          recovery: 'Approve at least 10 reusable, privacy-safe knowledge items before syncing Discord-derived RAG.',
        }),
        gate({
          key: 'rag_sources_target_met',
          passed: numberValue(ragLane?.currentCount) >= numberValue(ragLane?.targetCount || 10),
          evidence: `${numberValue(ragLane?.currentCount)}/${numberValue(ragLane?.targetCount || 10)} Discord RAG sources`,
          recovery: 'With explicit approval, sync approved Discord knowledge into authoritative RAG and rerun evals.',
        }),
      ],
    }),
    phase({
      key: 'operating_proof',
      title: 'Operating Proof',
      gates: [
        gate({
          key: 'local_verification_passes',
          passed: input.localVerification?.ok === true && localSummary.localVerificationPassed === true,
          evidence: `local verification ok=${String(input.localVerification?.ok)} summary=${String(localSummary.localVerificationPassed)}`,
          recovery: 'Run npm run verify:local:evidence and fix release evidence failures.',
        }),
        gate({
          key: 'autonomous_loop_state_current',
          passed: input.autonomousLoopState?.ok === true && loopCurrent.localVerificationPassed === true,
          evidence: `loop state ok=${String(input.autonomousLoopState?.ok)} average=${String(loopCurrent.averageScore)}`,
          recovery: 'Run npm run loop:audit and fix stale or missing autonomous loop state.',
        }),
        gate({
          key: 'public_proof_target_met',
          passed: numberValue(publicProofLane?.currentCount) >= numberValue(publicProofLane?.targetCount || 4),
          evidence: `${numberValue(publicProofLane?.currentCount)}/${numberValue(publicProofLane?.targetCount || 4)} public proof assets`,
          recovery: 'Create and approve four privacy-safe public proof assets from approved Discord knowledge.',
        }),
        gate({
          key: 'premium_workflow_target_met',
          passed: numberValue(premiumLane?.currentCount) >= numberValue(premiumLane?.targetCount || 1),
          evidence: `${numberValue(premiumLane?.currentCount)}/${numberValue(premiumLane?.targetCount || 1)} premium workflow proofs`,
          recovery: 'Run one premium review, deeper answer, or office-hours flow with authorization and fulfillment evidence.',
        }),
      ],
    }),
  ];

  const totalScore = phases.reduce((sum, item) => sum + item.score, 0);
  const maxScore = phases.reduce((sum, item) => sum + item.maxScore, 0);
  const score = Math.round((totalScore / maxScore) * 100);
  const failures = phases.flatMap((item) => item.gates
    .filter((g) => g.status === 'blocked')
    .map((g) => `${item.key}:${g.key}`));
  const productionStopConditions = phases.flatMap((item) => item.gates
    .filter((g) => g.status === 'blocked' && g.requiredForProduction)
    .map((g) => `${g.key}: ${g.recovery}`));
  const localGateFailures = failures.filter((failure) => (
    !failure.includes('approved_knowledge_target_met')
    && !failure.includes('rag_sources_target_met')
    && !failure.includes('public_proof_target_met')
    && !failure.includes('premium_workflow_target_met')
  ));
  const status = failures.length === 0
    ? 'production_ready'
    : localGateFailures.length === 0
      ? 'locally_verified_waiting_on_live_approval'
      : 'blocked_local_harness';

  return {
    ok: localGateFailures.length === 0,
    version: KNOWLEDGE_BASE_ENGINEERING_HARNESS_VERSION,
    generatedAt: input.generatedAt,
    mutationMode: 'local_file_evidence_only',
    releaseMeaning: 'This harness reads local evidence and grades the Discord knowledge-base pipeline. It does not approve records, post to Discord, mutate Supabase, sync RAG, call AI models, push, deploy, or satisfy live operating proof.',
    status,
    score,
    targetScoreRange: '95-99',
    sourceSeedSummary: {
      totalCandidates,
      totalApprovalDrafts,
      channelsCovered,
    },
    phases,
    productionStopConditions,
    safeLocalCommands: [
      'npm run discord:career-content-harness',
      'npm run discord:sage-kernel-content-harness',
      'npm run discord:knowledge-base-e2e-readiness',
      'npm run discord:release-local',
      'npm run discord:knowledge-base-harness',
      'npm run loop:knowledge-base:once',
      'npm run loop:knowledge-base:full',
    ],
    explicitApprovalCommands: [
      'SAGE_ALLOW_DISCORD_OPERATING_CYCLE=approved npm run discord:operating-cycle',
      'SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:approved-missing',
      'SAGE_ALLOW_KNOWLEDGE_BASE_E2E=approved npm run discord:knowledge-base-e2e',
    ],
    liveOperatorActions: [
      'Approve 10 high-signal Discord knowledge items through the admin review workflow.',
      'Sync approved Discord knowledge into authoritative RAG only after explicit approval.',
      'Approve or publish four privacy-safe public proof assets from approved knowledge.',
      'Complete one premium workflow proof with authorization, SLA, and fulfillment evidence.',
      'Run the guarded knowledge-base E2E command only against an approved Supabase environment.',
    ],
    antiFakeRules: [
      'Source seeds and generated drafts are curriculum fuel only; they are not approved Discord knowledge.',
      'Raw Discord messages, dry-run rows, smoke rows, and generated templates cannot satisfy operating proof.',
      'RAG can cite only approved, privacy-safe, source-linked knowledge records.',
      'The system cannot claim 95-99 until live approval, RAG sync, public proof, premium proof, and final scorecard evidence pass.',
      'E2E readiness is not the same as live E2E execution; the guarded Playwright command must pass before claiming admin workflow proof.',
    ],
    failures,
  };
}
