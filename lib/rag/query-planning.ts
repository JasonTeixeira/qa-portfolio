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

const SPECIFIC_QUERY_RULES: Array<{
  patterns: RegExp[];
  expansion: string;
  preferredSources: string[];
}> = [
  {
    patterns: [/ai feature.*ready|ready before shipping|evaluate ai features/i],
    expansion: 'AI feature readiness evaluation risk quality failure set human in the loop product quality citations source tool before shipping',
    preferredSources: ['How to Evaluate AI Features Before You Ship Them'],
  },
  {
    patterns: [/agent boundary|boundary problem|tool.*approval|approval.*tool/i],
    expansion: 'AI agent boundary problem tool permissions approval gates audit logs human accountability narrow tools stop conditions',
    preferredSources: ['The AI Agent Boundary Problem'],
  },
  {
    patterns: [/repeated questions|durable assets|promoted into durable/i],
    expansion: 'Discord repeated questions promote into resources lessons durable assets content queue capture-content publish content-lab',
    preferredSources: ['DISCORD_COMMUNITY_OPERATING_SYSTEM.md', 'DISCORD_EDUCATION_SERVER_RUNBOOK.md'],
  },
  {
    patterns: [/first project template|first project|project template/i],
    expansion: 'Discord first project template project acceptance criteria reviewed build lab spec artifact review request',
    preferredSources: ['DISCORD_COMMUNITY_OPERATING_SYSTEM.md', 'DISCORD_EDUCATION_SERVER_RUNBOOK.md'],
  },
  {
    patterns: [/challenge submissions|challenge submission|submit challenge|handled/i],
    expansion: 'Discord submit-challenge challenge submissions wins-showcase points award artifact review featured approved rejected',
    preferredSources: ['DISCORD_COMMUNITY_OPERATING_SYSTEM.md', 'DISCORD_EDUCATION_SERVER_RUNBOOK.md'],
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
    preferredSources: ['DISCORD_COMMUNITY_OPERATING_SYSTEM.md', 'DISCORD_EDUCATION_SERVER_RUNBOOK.md'],
  },
  {
    intent: 'content_engine',
    patterns: [/capture|content|resource|lesson|daily signal|weekly recap|publish|triage|draft/i],
    expansion: 'Discord content engine capture-content content-lab questions reusable lessons resources triaged draft published daily-signal weekly recap quality approval',
    preferredSources: ['DISCORD_COMMUNITY_OPERATING_SYSTEM.md', 'DISCORD_EDUCATION_SERVER_RUNBOOK.md', 'rag-system-build-plan.txt'],
  },
  {
    intent: 'reputation',
    patterns: [/quiz|challenge|points|leaderboard|rank|streak|mark helpful|helpful|submit project|review request|review queue|wins/i],
    expansion: 'Discord reputation quizzes challenges points leaderboard rank streak mark-helpful 15 point submit-project build-lab request-review review-queue wins-showcase',
    preferredSources: ['DISCORD_EDUCATION_SERVER_RUNBOOK.md', 'DISCORD_COMMUNITY_OPERATING_SYSTEM.md'],
  },
  {
    intent: 'premium',
    patterns: [/premium|stripe|checkout|paid|office hours|priority|deeper|private/i],
    expansion: 'Discord premium Premium Member Stripe checkout private ephemeral priority critique deeper review office-hours replays weekly recap $29 month',
    preferredSources: ['DISCORD_EDUCATION_SERVER_RUNBOOK.md', 'DISCORD_COMMUNITY_OPERATING_SYSTEM.md'],
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
  const matched = INTENT_RULES.find((rule) => rule.patterns.some((pattern) => pattern.test(commandExpanded)));
  const specific = SPECIFIC_QUERY_RULES.find((rule) => rule.patterns.some((pattern) => pattern.test(commandExpanded)));
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
