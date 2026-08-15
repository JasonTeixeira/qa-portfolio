import { SAGEBOT_PERSONALITY_VERSION, SAGEBOT_PROMPT_VERSIONS, scoreSageBotPolicyOutput } from './sagebot-personality';

export const SAGEFORGE_INSTITUTIONAL_HARNESS_VERSION = 'sageforge-institutional-harness-v2';

export type SageForgeGateStatus = 'passed' | 'blocked';

export type SageForgeGate = {
  key: string;
  status: SageForgeGateStatus;
  score: number;
  maxScore: number;
  evidence: string;
  requiredForProduction: boolean;
  recovery: string;
};

export type SageForgeCategory = {
  key: string;
  title: string;
  status: SageForgeGateStatus;
  score: number;
  maxScore: number;
  gates: SageForgeGate[];
};

export type SageForgeInstitutionalHarnessInput = {
  generatedAt: string;
  botName?: string;
  packageJson: any;
  institutionalReadiness: any;
  knowledgeBaseHarness: any;
  worldClassReadiness: any;
  gatewayCaptureDiagnosis: any;
  observabilityQualityReadiness: any;
  contentFactoryReadiness: any;
  durableJobsReadiness: any;
  premiumWorkflowReadiness: any;
  publicGrowthReadiness: any;
  securityPrivacyReadiness: any;
  localVerification: any;
  ragEvalLatest: any;
  langfuseSmoke: any;
  humanAppealHarness: any;
};

export type SageForgeInstitutionalHarnessResult = {
  ok: boolean;
  version: typeof SAGEFORGE_INSTITUTIONAL_HARNESS_VERSION;
  generatedAt: string;
  botName: string;
  botNameRationale: string;
  mutationMode: 'local_file_evidence_only';
  releaseMeaning: string;
  status: 'institutional_ready' | 'locally_strong_waiting_on_live_proof' | 'blocked_local_harness';
  score: number;
  targetScoreRange: '95-99';
  categoryScores: Record<string, number>;
  categories: SageForgeCategory[];
  productionStopConditions: string[];
  safeAutonomousCommands: string[];
  explicitApprovalCommands: string[];
  liveOperatorActions: string[];
  autonomyContract: {
    allowedWithoutMoreInput: string[];
    stopsForApproval: string[];
    completionDefinition: string[];
  };
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

function scriptExists(packageJson: any, scriptName: string): boolean {
  return typeof packageJson?.scripts?.[scriptName] === 'string' && packageJson.scripts[scriptName].length > 0;
}

function gate(input: {
  key: string;
  passed: boolean;
  score?: number;
  maxScore?: number;
  evidence: string;
  requiredForProduction?: boolean;
  recovery: string;
}): SageForgeGate {
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
function category(input: { key: string; title: string; gates: SageForgeGate[] }): SageForgeCategory {
  const score = input.gates.reduce((sum, item) => sum + item.score, 0);
  const maxScore = input.gates.reduce((sum, item) => sum + item.maxScore, 0);
  return {
    ...input,
    status: input.gates.every((item) => item.status === 'passed') ? 'passed' : 'blocked',
    score,
    maxScore,
  };
}

function extractBlockedProof(readiness: any): Array<{ key: string; current: number; target: number }> {
  return asArray(readiness?.blockedLiveProof).map((item: any) => ({
    key: String(item.key ?? 'unknown'),
    current: numberValue(item.current),
    target: numberValue(item.target),
  }));
}

function proofMet(readiness: any, key: string): boolean {
  const item = extractBlockedProof(readiness).find((entry) => entry.key === key);
  return Boolean(item && item.current >= item.target && item.target > 0);
}

function proofEvidence(readiness: any, key: string, fallbackTarget: number): string {
  const item = extractBlockedProof(readiness).find((entry) => entry.key === key);
  return `${item?.current ?? 0}/${item?.target ?? fallbackTarget}`;
}

function sampleAnswerPolicyPasses(): boolean {
  const score = scoreSageBotPolicyOutput(
    'Use /ask-sage with the exact project context, then submit the artifact in build-lab. If the answer needs facts, cite the approved source like [1].',
    { requireCitation: true },
  );
  return score.passed;
}

export function buildSageForgeInstitutionalHarness(
  input: SageForgeInstitutionalHarnessInput,
): SageForgeInstitutionalHarnessResult {
  const botName = input.botName || 'SageForge';
  const readinessScore = numberValue(input.institutionalReadiness?.score);
  const gateway = input.gatewayCaptureDiagnosis ?? {};
  const gatewayStatus = gateway?.diagnosis?.status;
  const gatewayHeartbeat = gateway?.heartbeat?.latest ?? {};
  const knowledgeScore = numberValue(input.knowledgeBaseHarness?.score);
  const worldClassSummary = input.worldClassReadiness?.summary ?? {};
  const worldClassAt95 = numberValue(worldClassSummary.categoriesAtOrAbove95);
  const worldClassBelow95 = numberValue(worldClassSummary.categoriesBelow95);
  const ragPassRate = numberValue(input.ragEvalLatest?.summary?.passRate);
  const ragTotal = numberValue(input.ragEvalLatest?.summary?.total);

  const categories = [
    category({
      key: 'bot_identity_invocation',
      title: 'Bot Identity And Invocation',
      gates: [
        gate({
          key: 'name_selected',
          passed: botName === 'SageForge',
          evidence: `botName=${botName}`,
          recovery: 'Set the public bot identity to SageForge and keep SageBot OS as the internal system name.',
        }),
        gate({
          key: 'ask_commands_registered_in_code',
          passed: scriptExists(input.packageJson, 'discord:register')
            && String(input.packageJson?.scripts?.['discord:smoke'] ?? '').length > 0,
          evidence: 'discord:register and discord:smoke scripts exist',
          recovery: 'Keep Discord command registration and smoke verification scripts wired in package.json.',
        }),
        gate({
          key: 'core_member_commands_present',
          passed: ['discord:smoke-ask-sage', 'discord:smoke-learning-lab-v2', 'discord:smoke-approved-slash-flows'].every((script) => scriptExists(input.packageJson, script)),
          evidence: 'ask-sage, learning lab, and approved slash-flow smoke scripts exist',
          recovery: 'Add smoke coverage for /ask-sage, /quiz, /challenge, /submit-project, /leaderboard, and approved-member flows.',
        }),
      ],
    }),
	    category({
	      key: 'personality_kernel',
	      title: 'Personality Kernel',
      gates: [
        gate({
          key: 'prompt_versions_defined',
          passed: Object.values(SAGEBOT_PROMPT_VERSIONS).length >= 5,
          evidence: `personality=${SAGEBOT_PERSONALITY_VERSION}; prompts=${Object.values(SAGEBOT_PROMPT_VERSIONS).join(', ')}`,
          recovery: 'Define versioned prompts for answer, daily signal, quiz, challenge, and weekly recap paths.',
        }),
        gate({
          key: 'policy_scoring_active',
          passed: sampleAnswerPolicyPasses(),
          evidence: 'sample SageForge answer passes source-grounded builder policy score',
          recovery: 'Fix scoreSageBotPolicyOutput so generic, unsupported, too-long, or hype-driven answers are blocked.',
        }),
        gate({
          key: 'quality_readiness_valid',
          passed: input.observabilityQualityReadiness?.ok === true,
          evidence: `observability/quality ok=${String(input.observabilityQualityReadiness?.ok)}`,
          recovery: 'Run npm run discord:observability-quality-readiness and fix trace, quality rollup, and admin-surface gaps.',
        }),
      ],
	    }),
    category({
      key: 'human_appeal_visual_system',
      title: 'Human Appeal And Visual System',
      gates: [
        gate({
          key: 'human_appeal_harness_ready',
          passed: input.humanAppealHarness?.ok === true && numberValue(input.humanAppealHarness?.score) >= 95,
          evidence: `human appeal ok=${String(input.humanAppealHarness?.ok)} score=${numberValue(input.humanAppealHarness?.score)}`,
          recovery: 'Run npm run discord:human-appeal-harness and fix embed, voice, smoke, and live visual proof gaps.',
        }),
        gate({
          key: 'ask_sage_embed_proven',
          passed: input.humanAppealHarness?.categories?.some((category: any) => category.key === 'proof_and_regression_gates' && category.status === 'passed') === true,
          evidence: 'human appeal proof/regression gates passed',
          recovery: 'Ensure /ask-sage smoke proves a Sage Ideas Answer embed with question, Sage take, and Sources fields.',
        }),
        gate({
          key: 'visual_proof_live_card_exists',
          passed: input.humanAppealHarness?.categories?.some((category: any) => category.key === 'visual_embed_contract' && category.status === 'passed') === true,
          evidence: 'human appeal visual embed contract passed',
          recovery: 'Keep member-facing bot messages on Discord embed cards with colored rails, readable fields, and footers.',
        }),
      ],
    }),
	    category({
	      key: 'knowledge_base',
      title: 'Authoritative Knowledge Base',
      gates: [
        gate({
          key: 'knowledge_harness_local_ok',
          passed: input.knowledgeBaseHarness?.ok === true,
          evidence: `knowledge harness score=${knowledgeScore}`,
          recovery: 'Run npm run discord:knowledge-base-harness and fix source seed, approval, RAG, and proof contract failures.',
        }),
        gate({
          key: 'rag_eval_strong',
          passed: input.ragEvalLatest?.ok === true && ragPassRate >= 0.95 && ragTotal >= 50,
          evidence: `rag passRate=${ragPassRate}; total=${ragTotal}`,
          recovery: 'Improve missing eval coverage, approved sources, retrieval/reranking, and failed golden questions.',
        }),
        gate({
          key: 'approved_discord_knowledge_live_target',
          passed: proofMet(input.institutionalReadiness, 'approved_discord_knowledge'),
          evidence: proofEvidence(input.institutionalReadiness, 'approved_discord_knowledge', 10),
          recovery: 'Approve 10 reusable, privacy-safe Discord knowledge items through the admin workflow.',
        }),
        gate({
          key: 'discord_rag_sources_live_target',
          passed: proofMet(input.institutionalReadiness, 'rag_discord_sources'),
          evidence: proofEvidence(input.institutionalReadiness, 'rag_discord_sources', 10),
          recovery: 'After approval, sync approved Discord knowledge into authoritative RAG and rerun evals.',
        }),
      ],
    }),
    category({
      key: 'content_factory',
      title: 'Content Factory',
      gates: [
        gate({
          key: 'content_factory_readiness_ok',
          passed: input.contentFactoryReadiness?.ok === true,
          evidence: `content factory ok=${String(input.contentFactoryReadiness?.ok)}`,
          recovery: 'Run npm run discord:content-factory-readiness and fix daily, weekly, approval, quality, and source-link gates.',
        }),
        gate({
          key: 'public_proof_live_target',
          passed: proofMet(input.institutionalReadiness, 'public_proof_assets'),
          evidence: proofEvidence(input.institutionalReadiness, 'public_proof_assets', 4),
          recovery: 'Approve or publish four privacy-safe proof assets sourced from real approved Discord knowledge.',
        }),
        gate({
          key: 'growth_loop_readiness_ok',
          passed: input.publicGrowthReadiness?.ok === true,
          evidence: `public growth ok=${String(input.publicGrowthReadiness?.ok)}`,
          recovery: 'Run npm run discord:public-growth-readiness and fix public proof/privacy/growth-cycle gaps.',
        }),
      ],
    }),
    category({
      key: 'learning_engagement',
      title: 'Learning And Engagement Engine',
      gates: [
        gate({
          key: 'learning_scripts_exist',
          passed: ['discord:generate-learning', 'discord:smoke-learning-generator', 'discord:smoke-learning-lab-scheduler', 'discord:smoke-weekly-leaderboard-recap'].every((script) => scriptExists(input.packageJson, script)),
          evidence: 'learning generator, scheduler, and weekly leaderboard recap scripts exist',
          recovery: 'Wire quiz, challenge, scheduler, and weekly leaderboard proof commands into package.json.',
        }),
        gate({
          key: 'durable_jobs_ok',
          passed: input.durableJobsReadiness?.ok === true,
          evidence: `durable jobs ok=${String(input.durableJobsReadiness?.ok)}`,
          recovery: 'Run npm run discord:durable-jobs-readiness and fix idempotency, retry, dead-letter, and admin visibility gaps.',
        }),
        gate({
          key: 'premium_workflow_live_target',
          passed: proofMet(input.institutionalReadiness, 'premium_workflow_proof'),
          evidence: proofEvidence(input.institutionalReadiness, 'premium_workflow_proof', 1),
          recovery: 'Run one premium review/deeper-answer/office-hours workflow with authorization and fulfillment evidence.',
        }),
      ],
    }),
    category({
      key: 'production_operations',
      title: 'Production Operations',
      gates: [
        gate({
          key: 'gateway_healthy',
          passed: gatewayStatus === 'healthy' && gatewayHeartbeat.messageContentEnabled === true,
          evidence: `gateway=${gatewayStatus}; worker=${String(gatewayHeartbeat.workerId ?? 'missing')}; messageContent=${String(gatewayHeartbeat.messageContentEnabled)}`,
          recovery: 'Keep Railway gateway alive with DISCORD_GATEWAY_MESSAGE_CONTENT=true and rerun npm run discord:gateway-capture-diagnosis.',
        }),
        gate({
          key: 'langfuse_smoke_passes',
          passed: input.langfuseSmoke?.ok === true && input.langfuseSmoke?.provider === 'langfuse',
          evidence: `langfuse ok=${String(input.langfuseSmoke?.ok)} provider=${String(input.langfuseSmoke?.provider ?? 'missing')}`,
          recovery: 'Run npm run langfuse:smoke and confirm production env vars are set in Vercel/Railway.',
        }),
        gate({
          key: 'security_privacy_ok',
          passed: input.securityPrivacyReadiness?.ok === true,
          evidence: `security/privacy ok=${String(input.securityPrivacyReadiness?.ok)}`,
          recovery: 'Run npm run discord:security-privacy-readiness and fix approval gates, privacy, abuse, and public-proof safeguards.',
        }),
        gate({
          key: 'local_verification_ok',
          passed: input.localVerification?.ok === true,
          evidence: `local verification ok=${String(input.localVerification?.ok)}`,
          recovery: 'Run npm run verify:local:evidence after local gates and fix missing evidence files.',
        }),
      ],
    }),
  ];

  const totalScore = categories.reduce((sum, item) => sum + item.score, 0);
  const maxScore = categories.reduce((sum, item) => sum + item.maxScore, 0);
  const score = Math.round((totalScore / maxScore) * 100);
  const failures = categories.flatMap((item) => item.gates
    .filter((g) => g.status === 'blocked')
    .map((g) => `${item.key}:${g.key}`));
  const productionStopConditions = categories.flatMap((item) => item.gates
    .filter((g) => g.status === 'blocked' && g.requiredForProduction)
    .map((g) => `${g.key}: ${g.recovery}`));
  const liveProofFailures = failures.filter((failure) => (
    failure.includes('approved_discord_knowledge_live_target')
    || failure.includes('discord_rag_sources_live_target')
    || failure.includes('public_proof_live_target')
    || failure.includes('premium_workflow_live_target')
  ));
  const localFailures = failures.filter((failure) => !liveProofFailures.includes(failure));
  const status = failures.length === 0 && readinessScore >= 95 && worldClassBelow95 === 0
    ? 'institutional_ready'
    : localFailures.length === 0
      ? 'locally_strong_waiting_on_live_proof'
      : 'blocked_local_harness';

  return {
    ok: localFailures.length === 0,
    version: SAGEFORGE_INSTITUTIONAL_HARNESS_VERSION,
    generatedAt: input.generatedAt,
    botName,
    botNameRationale: 'SageForge is builder-oriented, brandable, memorable in Discord mentions, and keeps SageBot OS available as the internal system name.',
    mutationMode: 'local_file_evidence_only',
    releaseMeaning: 'This institutional harness reads local/prod evidence files and grades SageForge readiness. It does not post to Discord, approve knowledge, sync RAG, push, deploy, change Stripe, mutate Supabase, or claim live operating proof.',
    status,
    score,
    targetScoreRange: '95-99',
    categoryScores: Object.fromEntries(categories.map((item) => [item.key, Math.round((item.score / item.maxScore) * 100)])),
    categories,
    productionStopConditions,
    safeAutonomousCommands: [
	      'npm run discord:sageforge-institutional-harness',
	      'npm run discord:human-appeal-harness',
	      'npm run loop:sageforge:once',
	      'npm run loop:sageforge:quality',
	      'npm run loop:sageforge:human',
      'npm run langfuse:smoke',
      'npm run discord:gateway-capture-diagnosis',
      'npm run discord:knowledge-base-harness',
      'npm run discord:release-local',
    ],
    explicitApprovalCommands: [
      'npm run discord:register',
      'npm run discord:pin-posts',
      'SAGE_ALLOW_DISCORD_OPERATING_CYCLE=approved npm run discord:operating-cycle',
      'SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:approved-missing',
      'SAGE_ALLOW_KNOWLEDGE_BASE_E2E=approved npm run discord:knowledge-base-e2e',
      'vercel deploy --prod',
      'railway up --service sagebot-gateway',
      'git push',
    ],
    liveOperatorActions: [
      'Approve 10 high-signal Discord knowledge items.',
      'Sync approved Discord knowledge into authoritative RAG.',
      'Run real member /ask-sage, /quiz, /challenge, /submit-project flows and capture evidence.',
      'Approve four privacy-safe public proof assets.',
      'Fulfill one premium workflow proof.',
      'Review Langfuse production traces for real bot calls.',
    ],
    autonomyContract: {
      allowedWithoutMoreInput: [
        'Run local-safe audits, typecheck, lint, build, unit tests, dry-runs, readiness scripts, and evidence writers.',
        'Improve local harnesses, quality gates, prompt policy, deterministic evals, admin dashboard code, and documentation.',
        'Generate approval-gated drafts and local proof artifacts that do not publish or mutate live services.',
      ],
      stopsForApproval: [
        'Pushes, deploys, production database migrations, Stripe changes, live Discord mutations, publishing, deleting remote resources, or commands containing SAGE_ALLOW_.',
        'Any action that approves knowledge into authoritative RAG or sends messages to live Discord.',
      ],
      completionDefinition: [
        'All local gates pass.',
        'SageForge institutional harness score is 95+.',
        'No local harness failures remain.',
        'Live proof blockers are either satisfied with evidence or explicitly listed as operator actions.',
      ],
    },
    antiFakeRules: [
      'Generated seeds and local dry-runs do not count as approved Discord knowledge.',
      'Smoke rows do not count as live member usage.',
      'Env presence does not prove integration correctness; at least one smoke/readback is required.',
      'No 95-99 claim without live approved knowledge, Discord RAG sources, public proof, premium workflow proof, and production traces.',
      'Bot personality is not complete until real replies are scored and reviewed against the policy kernel.',
      `Current world-class category state: ${worldClassAt95} categories at/above 95 and ${worldClassBelow95} below 95.`,
    ],
    failures,
  };
}
