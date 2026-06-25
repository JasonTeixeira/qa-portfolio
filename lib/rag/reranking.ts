import type { RagSearchResult } from './retrieval';
import type { RagQueryPlan } from './query-planning';

export type RerankedRagSearchResult = RagSearchResult & {
  rerank_score: number;
  rerank_reasons: string[];
};

export const RAG_RERANKER_VERSION = 'deterministic_reranker_v2';

const SOURCE_PRIORITY: Array<[RegExp, number, string]> = [
  [/SAGEBOT_DISCORD_OPERATING_FAQ\.md/i, 0.36, 'approved_operating_faq'],
  [/DISCORD_COMMUNITY_OPERATING_SYSTEM\.md|DISCORD_EDUCATION_SERVER_RUNBOOK\.md|rag-system-build-plan\.txt/i, 0.28, 'approved_core_resource'],
  [/docs\/specs|docs\//i, 0.2, 'approved_doc'],
  [/blog\//i, 0.08, 'approved_blog'],
  [/discord_question|discord_answer/i, 0.06, 'community_qa'],
  [/discord_message/i, -0.1, 'raw_message_low_priority'],
];

export function rerankRagResults(
  plan: RagQueryPlan,
  candidates: RagSearchResult[],
  limit: number,
): RerankedRagSearchResult[] {
  const maxHybrid = Math.max(...candidates.map((candidate) => Number(candidate.hybrid_score) || 0), 0.000001);
  return candidates
    .map((candidate) => scoreCandidate(plan, candidate, maxHybrid))
    .sort((a, b) =>
      Number(b.rerank_reasons.includes('exact_preferred_source_match')) - Number(a.rerank_reasons.includes('exact_preferred_source_match'))
      || b.rerank_score - a.rerank_score
      || Number(b.rerank_reasons.includes('approved_operating_faq')) - Number(a.rerank_reasons.includes('approved_operating_faq')))
    .slice(0, limit);
}

export function sourcePriorityScore(candidate: Pick<RagSearchResult, 'title' | 'source_url' | 'source_type'>): { score: number; reasons: string[] } {
  const haystack = `${candidate.title ?? ''} ${candidate.source_url ?? ''} ${candidate.source_type ?? ''}`;
  const reasons: string[] = [];
  let score = 0;
  for (const [pattern, value, reason] of SOURCE_PRIORITY) {
    if (pattern.test(haystack)) {
      score += value;
      reasons.push(reason);
    }
  }
  return { score, reasons };
}

function scoreCandidate(plan: RagQueryPlan, candidate: RagSearchResult, maxHybrid: number): RerankedRagSearchResult {
  const text = normalize([
    candidate.title,
    candidate.source_url,
    candidate.source_type,
    candidate.chunk_key,
    candidate.content,
  ].filter(Boolean).join(' '));
  const queryTerms = significantTerms(plan.rerankText);
  const preferredTerms = significantTerms(plan.preferredSources.join(' '));
  const overlap = overlapRatio(queryTerms, text);
  const preferredOverlap = overlapRatio(preferredTerms, text);
  const exactPreferred = exactPreferredSourceScore(plan.preferredSources, text);
  const sourcePriority = sourcePriorityScore(candidate);
  const hybrid = Math.min(1, Math.max(0, Number(candidate.hybrid_score) / maxHybrid));
  const keywordBoost = Math.min(0.12, Math.max(0, Number(candidate.keyword_score)) * 0.08);
  const score =
    hybrid * 0.34
    + overlap * 0.28
    + preferredOverlap * 0.16
    + exactPreferred.score
    + sourcePriority.score
    + keywordBoost;
  return {
    ...candidate,
    rerank_score: Number(score.toFixed(6)),
    rerank_reasons: [
      ...sourcePriority.reasons,
      overlap > 0 ? 'query_term_overlap' : '',
      preferredOverlap > 0 ? 'preferred_source_overlap' : '',
      exactPreferred.score > 0 ? exactPreferred.reason : '',
      keywordBoost > 0 ? 'keyword_score_boost' : '',
    ].filter(Boolean),
  };
}

function exactPreferredSourceScore(preferredSources: string[], candidateText: string): { score: number; reason: string } {
  const matched = preferredSources.some((source) => {
    const normalizedSource = normalize(source);
    return normalizedSource.length >= 8 && candidateText.includes(normalizedSource);
  });
  return matched ? { score: 0.62, reason: 'exact_preferred_source_match' } : { score: 0, reason: '' };
}

function significantTerms(text: string): string[] {
  const stop = new Set(['the', 'and', 'for', 'with', 'that', 'what', 'how', 'why', 'should', 'does', 'into', 'from', 'this', 'your', 'are', 'use', 'used']);
  return [...new Set(normalize(text).split(' ').filter((term) => term.length >= 3 && !stop.has(term)))];
}

function overlapRatio(terms: string[], text: string): number {
  if (!terms.length) return 0;
  const matches = terms.filter((term) => text.includes(term)).length;
  return matches / terms.length;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9$+./-]+/g, ' ').trim();
}
