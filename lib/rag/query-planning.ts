export type RagQueryIntent =
  | 'onboarding'
  | 'content_engine'
  | 'reputation'
  | 'premium'
  | 'rag_ai'
  | 'general';

export type RagQueryPlan = {
  originalQuery: string;
  normalizedQuery: string;
  intent: RagQueryIntent;
  searchQueries: string[];
  rerankText: string;
  preferredSources: string[];
  metadata: {
    plannerVersion: string;
    rewriteReasons: string[];
  };
};

const PLANNER_VERSION = 'query_planner_v2';
const DISCORD_OPERATING_SOURCES = [
  'SAGEBOT_DISCORD_OPERATING_FAQ.md',
  'DISCORD_COMMUNITY_OPERATING_SYSTEM.md',
  'DISCORD_EDUCATION_SERVER_RUNBOOK.md',
];
const DISCORD_PROOF_CONTROL_SOURCES = ['WORLD_CLASS_PROOF_OPERATING_CONTROLS.md'];

const SPECIFIC_QUERY_RULES: Array<{
  patterns: RegExp[];
  expansion: string;
  preferredSources: string[];
}> = [
  {
    patterns: [/ai feature.*ready|ready before shipping|evaluate ai features/i],
    expansion: 'AI feature readiness evaluation risk quality failure set human in the loop product quality citations source tool before shipping',
    preferredSources: ['SAGEBOT_DISCORD_OPERATING_FAQ.md', 'How to Evaluate AI Features Before You Ship Them'],
  },
  {
    patterns: [/agent boundary|boundary problem|tool.*approval|approval.*tool/i],
    expansion: 'AI agent boundary problem tool permissions approval gates audit logs human accountability narrow tools stop conditions',
    preferredSources: ['The AI Agent Boundary Problem'],
  },
  {
    patterns: [/world.?class proof|proof backlog|proof lane|weekly proof checklist|95\+|operating proof/i],
    expansion: 'Discord world-class proof backlog proof lanes weekly proof checklist approved knowledge RAG sync public proof premium workflow evidence no synthetic smoke rows',
    preferredSources: [...DISCORD_PROOF_CONTROL_SOURCES, ...DISCORD_OPERATING_SOURCES],
  },
  {
    patterns: [/weekly checklist.*approved discord knowledge|approved discord knowledge.*rag|move approved discord knowledge/i],
    expansion: 'weekly checklist approve approved Discord knowledge operating-cycle RAG sync rag_sources rag_documents proof backlog admin review',
    preferredSources: [...DISCORD_PROOF_CONTROL_SOURCES, ...DISCORD_OPERATING_SOURCES],
  },
  {
    patterns: [/public proof growth assets|evidence proves public proof|public proof assets.*ready/i],
    expansion: 'four weekly public proof drafts application apply click approved source material privacy review published proof asset growth metrics',
    preferredSources: [...DISCORD_PROOF_CONTROL_SOURCES, ...DISCORD_OPERATING_SOURCES],
  },
  {
    patterns: [/premium workflow readiness|evidence proves premium workflow|premium workflow proof/i],
    expansion: 'premium workflow proof premium review office-hours SLA fulfilled response completed request status premium member evidence',
    preferredSources: [...DISCORD_PROOF_CONTROL_SOURCES, ...DISCORD_OPERATING_SOURCES],
  },
  {
    patterns: [/repeated questions|durable assets|promoted into durable/i],
    expansion: 'Discord repeated questions promote into resources lessons durable assets content queue capture-content publish content-queue',
    preferredSources: DISCORD_OPERATING_SOURCES,
  },
  {
    patterns: [/project-submissions|project submissions|members submit.*project/i],
    expansion: 'project-submissions project screenshot proof link risk next risk goal target user build artifact',
    preferredSources: DISCORD_OPERATING_SOURCES,
  },
  {
    patterns: [/office-hours questions|prepare.*office hours|office hours.*prepared/i],
    expansion: 'office-hours questions artifact blocker decision useful live session context submitted blocker',
    preferredSources: DISCORD_OPERATING_SOURCES,
  },
  {
    patterns: [/accountability check/i],
    expansion: 'accountability check committed shipped slipped next action weekly proof shipping rhythm',
    preferredSources: DISCORD_OPERATING_SOURCES,
  },
  {
    patterns: [/weekly winners|purpose.*weekly winners/i],
    expansion: 'weekly winners leaderboard weekly winners featured builds wins showcase points challenge recap',
    preferredSources: DISCORD_OPERATING_SOURCES,
  },
  {
    patterns: [/founding price.*premium|premium.*founding price/i],
    expansion: '$29 month premium founding price Premium Member checkout private ephemeral',
    preferredSources: DISCORD_OPERATING_SOURCES,
  },
  {
    patterns: [/premium critique.*free support|free support.*premium critique/i],
    expansion: 'premium critique priority deeper review priority review deeper critique specific artifact risks next steps',
    preferredSources: DISCORD_OPERATING_SOURCES,
  },
  {
    patterns: [/premium benefits.*office hours|office hours.*premium benefits/i],
    expansion: 'premium benefits office-hours priority sessions replays premium review queue',
    preferredSources: DISCORD_OPERATING_SOURCES,
  },
  {
    patterns: [/avoid too many.*channels|too many discord channels|channel sprawl/i],
    expansion: 'lean focused channels avoid sprawl simple server structure fewer channels clear routing',
    preferredSources: DISCORD_OPERATING_SOURCES,
  },
  {
    patterns: [/source types.*rag source registry|rag source registry.*source types/i],
    expansion: 'discord_questions discord_answers discord_content_queue source registry approved Discord knowledge rag_sources source types',
    preferredSources: ['rag-system-build-plan.txt'],
  },
  {
    patterns: [/admin rag dashboard|rag dashboard.*inspect/i],
    expansion: 'admin RAG dashboard inspect sources chunks feedback eval failures retrieval logs corpus health',
    preferredSources: ['rag-system-build-plan.txt'],
  },
  {
    patterns: [/rag system production-ready|production-ready.*rag|rag.*production-ready/i],
    expansion: 'production-ready RAG retrieval citations evals traces quality gates approved sources admin dashboard failure visibility',
    preferredSources: ['rag-system-build-plan.txt'],
  },
  {
    patterns: [/weekly recap|recap.*community growth|community growth.*recap/i],
    expansion: 'Discord weekly recap leaderboard challenge wins featured builds top questions useful resources premium review next week build focus',
    preferredSources: ['SAGEBOT_DISCORD_OPERATING_FAQ.md', 'DISCORD_COMMUNITY_OPERATING_SYSTEM.md'],
  },
  {
    patterns: [/first project template|first project|project template/i],
    expansion: 'Discord first project template project acceptance criteria reviewed build lab spec artifact review request',
    preferredSources: DISCORD_OPERATING_SOURCES,
  },
  {
    patterns: [/challenge submissions|challenge submission|submit challenge|handled/i],
    expansion: 'Discord submit-challenge challenge submissions wins-showcase points award artifact review featured approved rejected',
    preferredSources: DISCORD_OPERATING_SOURCES,
  },
];

const INTENT_RULES: Array<{
  intent: RagQueryIntent;
  patterns: RegExp[];
  expansion: string;
  preferredSources: string[];
}> = [
  {
    intent: 'onboarding',
    patterns: [/onboard|approval|apply|application|member access|start here|intro|first week|rules/i],
    expansion: 'Discord onboarding start-here application approval rules intro first project first-week checklist Academy Member roles quality bar',
    preferredSources: DISCORD_OPERATING_SOURCES,
  },
  {
    intent: 'content_engine',
    patterns: [/capture|content|resource|lesson|daily signal|weekly recap|publish|triage|draft|proof backlog|proof lane|public proof|weekly proof/i],
    expansion: 'Discord content engine capture-content content-queue questions reusable lessons resources triaged draft published daily-signal weekly recap quality approval proof backlog proof lanes public proof',
    preferredSources: [...DISCORD_OPERATING_SOURCES, 'rag-system-build-plan.txt'],
  },
  {
    intent: 'reputation',
    patterns: [/quiz|challenge|points|leaderboard|rank|streak|mark helpful|helpful|submit project|review request|review queue|wins/i],
    expansion: 'Discord reputation quizzes challenges points leaderboard rank streak mark-helpful 15 point submit-project build-lab request-review review-queue wins-showcase',
    preferredSources: DISCORD_OPERATING_SOURCES,
  },
  {
    intent: 'premium',
    patterns: [/premium|stripe|checkout|paid|office hours|priority|deeper|private/i],
    expansion: 'Discord premium Premium Member Stripe checkout private ephemeral priority critique deeper review office-hours replays weekly recap $29 month',
    preferredSources: DISCORD_OPERATING_SOURCES,
  },
  {
    intent: 'rag_ai',
    patterns: [/rag|retrieval|embedding|deepseek|langgraph|observability|trace|eval|agent|ai feature|generation/i],
    expansion: 'RAG build plan Supabase pgvector TypeScript DeepSeek generation embeddings Transformers.js gte-small LangGraph retrieval evals observability trace human approval',
    preferredSources: ['rag-system-build-plan.txt', 'RAG Evaluation Without the Benchmark Theater', 'How to Evaluate AI Features Before You Ship Them'],
  },
];

export function planRagQuery(query: string): RagQueryPlan {
  const normalizedQuery = normalizeQuery(query);
  const commandExpanded = expandCommandTerms(normalizedQuery);
  const ruleText = `${normalizedQuery} ${commandExpanded}`;
  const matched = INTENT_RULES.find((rule) => rule.patterns.some((pattern) => pattern.test(ruleText)));
  const specific = SPECIFIC_QUERY_RULES.find((rule) => rule.patterns.some((pattern) => pattern.test(ruleText)));
  const intent = matched?.intent ?? 'general';
  const rewriteReasons = [];
  const preferredSources = uniqueNonEmpty([...(specific?.preferredSources ?? []), ...(matched?.preferredSources ?? [])]);
  const searchQueries = uniqueNonEmpty([
    normalizedQuery,
    commandExpanded,
    specific ? `${commandExpanded} ${specific.expansion}` : '',
    specific && preferredSources.length ? `${specific.expansion} ${preferredSources.join(' ')}` : '',
    matched ? `${commandExpanded} ${matched.expansion}` : '',
    matched && preferredSources.length ? `${matched.expansion} ${preferredSources.join(' ')}` : '',
  ]);
  if (commandExpanded !== normalizedQuery) rewriteReasons.push('expanded_slash_command_terms');
  if (matched) rewriteReasons.push(`intent:${matched.intent}`);
  if (specific) rewriteReasons.push('specific_source_rule');

  return {
    originalQuery: query,
    normalizedQuery,
    intent,
    searchQueries,
    rerankText: uniqueNonEmpty([commandExpanded, specific?.expansion ?? '', matched?.expansion ?? '', preferredSources.join(' ')]).join(' '),
    preferredSources,
    metadata: {
      plannerVersion: PLANNER_VERSION,
      rewriteReasons,
    },
  };
}

export function normalizeQuery(query: string): string {
  return query
    .replace(/[`*_~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function expandCommandTerms(query: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/\/?mark-helpful/gi, 'mark helpful helpful answer quality bonus 15 points'],
    [/\/?capture-content/gi, 'capture content question lesson content queue resource'],
    [/\/?submit-project/gi, 'submit project project spec build lab first project template'],
    [/\/?submit-challenge/gi, 'submit challenge challenge submission wins showcase points'],
    [/\/?request-review/gi, 'request review review queue critique feedback'],
    [/\/?daily-signal/gi, 'daily signal daily prompt quiz challenge'],
    [/\/?onboard/gi, 'onboard choose path level roles Academy Member'],
    [/\/?premium/gi, 'premium Premium Member Stripe checkout priority critique'],
  ];
  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), query);
}

function uniqueNonEmpty(values: string[]): string[] {
  return [...new Set(values.map((value) => value.replace(/\s+/g, ' ').trim()).filter(Boolean))];
}
