import type { RagAnswerResult } from './retrieval';

export type RagEvalQuestionSeed = {
  eval_key: string;
  question: string;
  expected_sources: string[];
  expected_answer_notes: string;
  tags: string[];
  metadata: {
    category: 'onboarding' | 'content_engine' | 'quiz_challenge_points' | 'premium' | 'rag_ai_build';
    required_terms: string[];
    refusal_expected?: boolean;
  };
};

export type RagEvalThresholds = {
  minOverallScore: number;
  minPassRate: number;
  minRetrievalHitRate: number;
  minCitationCoverage: number;
  minFaithfulness: number;
};

export type RagEvalScore = {
  passed: boolean;
  score: number;
  retrievalHit: boolean;
  retrievalHitRate: number;
  citationCoverage: number;
  contextPrecision: number;
  faithfulness: number;
  groundedness: number;
  answerUsefulness: number;
  refusalCorrectness: number | null;
  missingSources: string[];
  missingRequiredTerms: string[];
  notes: string;
};

export const DEFAULT_RAG_EVAL_THRESHOLDS: RagEvalThresholds = {
  minOverallScore: 0.68,
  minPassRate: 0.7,
  minRetrievalHitRate: 0.7,
  minCitationCoverage: 0.55,
  minFaithfulness: 0.65,
};

const DISCORD_COMMUNITY = 'DISCORD_COMMUNITY_OPERATING_SYSTEM.md';
const DISCORD_RUNBOOK = 'DISCORD_EDUCATION_SERVER_RUNBOOK.md';
const RAG_BUILD_PLAN = 'rag-system-build-plan.txt';

export const RAG_EVAL_QUESTION_SEEDS: RagEvalQuestionSeed[] = [
  ...buildCategoryQuestions('onboarding', [
    ['rag_onboarding_001', 'What is the correct first access path for a new Sage Ideas Discord member?', ['application', 'approval', 'start-here']],
    ['rag_onboarding_002', 'What should an approved member do after getting access?', ['onboard', 'intro', 'project']],
    ['rag_onboarding_003', 'What makes a new member application approvable?', ['rules', 'goal', 'first build']],
    ['rag_onboarding_004', 'What should get a member rejected or held during application review?', ['vague', 'spam', 'rules']],
    ['rag_onboarding_005', 'Which channels should a new member use first after approval?', ['questions', 'daily-signal', 'build-lab']],
    ['rag_onboarding_006', 'What is the first-week checklist for a new approved member?', ['intro', 'daily', 'challenge']],
    ['rag_onboarding_007', 'Why should Sage Ideas avoid too many Discord channels?', ['focused', 'lean', 'sprawl']],
    ['rag_onboarding_008', 'How should members introduce themselves in the Discord?', ['name', 'path', 'blocker']],
    ['rag_onboarding_009', 'What quality bar should questions meet in the Discord?', ['context', 'attempt', 'blocker']],
    ['rag_onboarding_010', 'What roles define member access and learning identity?', ['Academy Member', 'Premium Member', 'path']],
  ], [DISCORD_COMMUNITY]),
  ...buildCategoryQuestions('content_engine', [
    ['rag_content_001', 'What is the Sage Ideas Discord content engine loop?', ['question', 'content queue', 'resource']],
    ['rag_content_002', 'How should a useful community question become reusable content?', ['capture', 'review', 'publish']],
    ['rag_content_003', 'Which channel is responsible for content ideas and resource gaps?', ['content-lab', 'questions', 'resource']],
    ['rag_content_004', 'How should daily-signal be used for content operations?', ['daily', 'quiz', 'challenge']],
    ['rag_content_005', 'What should weekly recap include for community growth?', ['leaderboard', 'challenge', 'wins']],
    ['rag_content_006', 'How should resources be managed in the Discord?', ['templates', 'guides', 'resource drops']],
    ['rag_content_007', 'What does /capture-content do in the operating model?', ['question', 'lesson', 'content']],
    ['rag_content_008', 'How should repeated questions be promoted into durable assets?', ['resources', 'content', 'lesson']],
    ['rag_content_009', 'What admin steps move content from capture to publication?', ['triaged', 'draft', 'published']],
    ['rag_content_010', 'Why should generated content be reviewed before public posting?', ['quality', 'approval', 'useful']],
  ], [DISCORD_COMMUNITY]),
  ...buildCategoryQuestions('quiz_challenge_points', [
    ['rag_points_001', 'How do quizzes and challenges fit into daily engagement?', ['quiz', 'challenge', 'daily']],
    ['rag_points_002', 'How are points awarded for asking and answering useful questions?', ['ask', 'answer', 'points']],
    ['rag_points_003', 'What does the mark helpful command do?', ['helpful', 'admin', '15']],
    ['rag_points_004', 'How should challenge submissions be handled?', ['challenge', 'wins', 'points'], [DISCORD_COMMUNITY]],
    ['rag_points_005', 'What commands make reputation visible?', ['points', 'leaderboard', 'rank']],
    ['rag_points_006', 'What is the purpose of weekly winners?', ['leaderboard', 'weekly', 'winners']],
    ['rag_points_007', 'How should the submit project command support the build lab?', ['project', 'spec', 'build']],
    ['rag_points_008', 'What should a first project template include?', ['project', 'acceptance criteria', 'reviewed'], [DISCORD_COMMUNITY]],
    ['rag_points_009', 'How should review requests be routed?', ['review', 'queue', 'critique']],
    ['rag_points_010', 'Why does participation need durable points and profiles?', ['visible', 'participation', 'leaderboard']],
  ], [DISCORD_RUNBOOK]),
  ...buildCategoryQuestions('premium', [
    ['rag_premium_001', 'What is the premium promise for Sage Ideas Discord members?', ['premium', 'priority', 'deeper']],
    ['rag_premium_002', 'Should premium block basic participation?', ['optional', 'basic participation', 'not block']],
    ['rag_premium_003', 'Where should premium be positioned so it does not spam public channels?', ['start', 'weekly', 'ephemeral']],
    ['rag_premium_004', 'What does Premium Member access unlock?', ['premium room', 'priority', 'advanced']],
    ['rag_premium_005', 'What founding price is listed for premium?', ['$29', 'month', 'premium']],
    ['rag_premium_006', 'How should premium critique differ from free support?', ['priority', 'deeper', 'review']],
    ['rag_premium_007', 'What premium benefits relate to office hours?', ['office-hours', 'priority', 'sessions']],
    ['rag_premium_008', 'Why should checkout stay private or ephemeral?', ['private', 'ephemeral', 'spam']],
    ['rag_premium_009', 'How does Stripe relate to Premium Member access?', ['Stripe', 'Premium Member', 'synced']],
    ['rag_premium_010', 'What premium benefits should appear in weekly recap?', ['deeper review', 'replays', 'priority critique']],
  ], [DISCORD_RUNBOOK]),
  ...buildCategoryQuestions('rag_ai_build', [
    ['rag_ai_001', 'What stack should Sage Ideas use for the first RAG implementation?', ['Supabase', 'pgvector', 'TypeScript'], [RAG_BUILD_PLAN]],
    ['rag_ai_002', 'Why should DeepSeek be used for generation in this system?', ['DeepSeek', 'cheaper', 'generation'], [RAG_BUILD_PLAN]],
    ['rag_ai_003', 'Why are embeddings separate from DeepSeek generation?', ['embeddings', 'separate', 'DeepSeek'], [RAG_BUILD_PLAN]],
    ['rag_ai_004', 'What local embedding lane is proven in the RAG plan?', ['Transformers.js', 'gte-small', '384'], [RAG_BUILD_PLAN]],
    ['rag_ai_005', 'When should LangGraph be added to the system?', ['after', 'retrieval', 'human approval'], [RAG_BUILD_PLAN]],
    ['rag_ai_006', 'What should RAG evals measure before shipping prompt changes?', ['retrieval', 'citation', 'faithfulness'], [RAG_BUILD_PLAN]],
    ['rag_ai_007', 'Why should unsupported RAG claims be refused?', ['unsupported', 'context', 'refuse'], [RAG_BUILD_PLAN, 'RAG Evaluation Without the Benchmark Theater']],
    ['rag_ai_008', 'What makes an AI feature ready before shipping?', ['eval', 'risk', 'quality'], ['How to Evaluate AI Features Before You Ship Them']],
    ['rag_ai_009', 'What is the AI agent boundary problem about?', ['boundary', 'tool', 'approval'], ['The AI Agent Boundary Problem']],
    ['rag_ai_010', 'How should observability fit into production AI systems?', ['logs', 'trace', 'monitoring'], [RAG_BUILD_PLAN]],
  ], [RAG_BUILD_PLAN]),
];

function buildCategoryQuestions(
  category: RagEvalQuestionSeed['metadata']['category'],
  rows: Array<[string, string, string[], string[]?]>,
  defaultSources: string[],
): RagEvalQuestionSeed[] {
  return rows.map(([evalKey, question, requiredTerms, sources]) => ({
    eval_key: evalKey,
    question,
    expected_sources: sources ?? defaultSources,
    expected_answer_notes: `Answer should mention: ${requiredTerms.join(', ')}.`,
    tags: ['phase_2', category],
    metadata: {
      category,
      required_terms: requiredTerms,
    },
  }));
}

export function scoreRagEvalAnswer(seed: RagEvalQuestionSeed, result: RagAnswerResult): RagEvalScore {
  const answer = normalize(result.answer);
  const citations = result.citations.map((citation) => ({
    raw: citation,
    text: normalize([
      citation.title,
      citation.source_url,
      citation.source_type,
    ].filter(Boolean).join(' ')),
  }));
  const expectedSources = seed.expected_sources.map(normalize).filter(Boolean);
  const matchedSources = expectedSources.filter((source) => citations.some((citation) => citation.text.includes(source)));
  const missingSources = seed.expected_sources.filter((_, index) => !matchedSources.includes(expectedSources[index]));
  const citationCoverage = expectedSources.length ? matchedSources.length / expectedSources.length : 1;
  const contextPrecision = citations.length ? citations.filter((citation) => expectedSources.some((source) => citation.text.includes(source))).length / citations.length : 0;
  const retrievalHit = matchedSources.length > 0;
  const retrievalHitRate = retrievalHit ? 1 : 0;
  const requiredTerms = seed.metadata.required_terms.map(normalize).filter(Boolean);
  const matchedTerms = requiredTerms.filter((term) => answer.includes(term));
  const missingRequiredTerms = seed.metadata.required_terms.filter((_, index) => !matchedTerms.includes(requiredTerms[index]));
  const answerUsefulness = requiredTerms.length ? matchedTerms.length / requiredTerms.length : 1;
  const hasCitations = /\[[1-9]\d*\]/.test(result.answer);
  const unsupportedClaimPenalty = countUnsupportedClaimMarkers(answer) > 0 ? 0.2 : 0;
  const faithfulness = clamp01((hasCitations ? 0.75 : 0.35) + (citationCoverage * 0.2) - unsupportedClaimPenalty);
  const groundedness = clamp01((citationCoverage * 0.45) + (contextPrecision * 0.25) + (hasCitations ? 0.3 : 0));
  const refusalCorrectness = seed.metadata.refusal_expected ? scoreRefusal(answer) : null;
  const score = clamp01(
    retrievalHitRate * 0.2
    + citationCoverage * 0.2
    + contextPrecision * 0.1
    + faithfulness * 0.2
    + groundedness * 0.15
    + answerUsefulness * 0.15,
  );
  const passed = score >= DEFAULT_RAG_EVAL_THRESHOLDS.minOverallScore
    && retrievalHitRate >= DEFAULT_RAG_EVAL_THRESHOLDS.minRetrievalHitRate
    && citationCoverage >= DEFAULT_RAG_EVAL_THRESHOLDS.minCitationCoverage
    && faithfulness >= DEFAULT_RAG_EVAL_THRESHOLDS.minFaithfulness;

  return {
    passed,
    score: round4(score),
    retrievalHit,
    retrievalHitRate,
    citationCoverage: round4(citationCoverage),
    contextPrecision: round4(contextPrecision),
    faithfulness: round4(faithfulness),
    groundedness: round4(groundedness),
    answerUsefulness: round4(answerUsefulness),
    refusalCorrectness,
    missingSources,
    missingRequiredTerms,
    notes: passed ? 'Passed deterministic RAG eval thresholds.' : 'Failed one or more deterministic RAG eval thresholds.',
  };
}

export function summarizeRagEvalScores(scores: RagEvalScore[]) {
  const total = scores.length;
  const passed = scores.filter((score) => score.passed).length;
  const failed = total - passed;
  return {
    total,
    passed,
    failed,
    passRate: total ? round4(passed / total) : 0,
    avgScore: avg(scores.map((score) => score.score)),
    retrievalHitRate: avg(scores.map((score) => score.retrievalHitRate)),
    citationCoverage: avg(scores.map((score) => score.citationCoverage)),
    contextPrecision: avg(scores.map((score) => score.contextPrecision)),
    faithfulness: avg(scores.map((score) => score.faithfulness)),
    groundedness: avg(scores.map((score) => score.groundedness)),
    answerUsefulness: avg(scores.map((score) => score.answerUsefulness)),
  };
}

export function ragEvalSummaryPassed(summary: ReturnType<typeof summarizeRagEvalScores>, thresholds = DEFAULT_RAG_EVAL_THRESHOLDS): boolean {
  return summary.total > 0
    && summary.passRate >= thresholds.minPassRate
    && summary.avgScore >= thresholds.minOverallScore
    && summary.retrievalHitRate >= thresholds.minRetrievalHitRate
    && summary.citationCoverage >= thresholds.minCitationCoverage
    && summary.faithfulness >= thresholds.minFaithfulness;
}

function countUnsupportedClaimMarkers(answer: string): number {
  return [
    'not in the context but',
    'outside the provided context',
    'i assume',
    'probably',
  ].filter((marker) => answer.includes(marker)).length;
}

function scoreRefusal(answer: string): number {
  return /(insufficient|missing|not enough|not provided|cannot answer)/.test(answer) ? 1 : 0;
}

function normalize(value: unknown): string {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9$+./-]+/g, ' ').trim();
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return round4(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function round4(value: number): number {
  return Number(value.toFixed(4));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
