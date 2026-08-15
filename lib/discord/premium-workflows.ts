import { supabaseAdmin } from '@/lib/supabase/server';
import { answerRagQuestion } from '@/lib/rag/retrieval';
import { SAGEBOT_PERSONALITY_VERSION, SAGEBOT_PROMPT_VERSIONS } from './sagebot-personality';
import { validateRagUserInputSecurity } from './security-privacy';

export type PremiumReviewType = 'code' | 'design' | 'ai' | 'architecture' | 'seo' | 'cloud' | 'growth' | 'general';
export type PremiumWorkflowStatus = 'queued' | 'in_review' | 'answered' | 'closed' | 'archived';

export const PREMIUM_REVIEW_SLA_HOURS = 48;
export const PREMIUM_RESPONSE_MIN_QUALITY_SCORE = 80;

export async function isPremiumDiscordMember(discordUserId: string): Promise<boolean> {
  const { data } = await supabaseAdmin()
    .from('discord_members')
    .select('premium_member')
    .eq('discord_user_id', discordUserId)
    .maybeSingle();
  return Boolean(data?.premium_member);
}

export function normalizePremiumReviewType(value: string): PremiumReviewType {
  const normalized = value.trim().toLowerCase();
  const allowed = new Set(['code', 'design', 'ai', 'architecture', 'seo', 'cloud', 'growth', 'general']);
  return allowed.has(normalized) ? normalized as PremiumReviewType : 'general';
}

export function premiumReviewSlaDueAt(createdAt: Date = new Date()): string {
  return new Date(createdAt.getTime() + PREMIUM_REVIEW_SLA_HOURS * 60 * 60 * 1000).toISOString();
}

export function evaluatePremiumResponseQuality(input: {
  response: string;
  citations?: unknown[];
  judgmentBasis?: string | null;
}): { passed: boolean; score: number; reasons: string[] } {
  const response = input.response.trim();
  const citations = Array.isArray(input.citations) ? input.citations : [];
  const judgmentBasis = String(input.judgmentBasis ?? '').trim();
  const reasons: string[] = [];
  let score = 100;
  if (response.length < 180) {
    reasons.push('response_too_short');
    score -= 35;
  }
  if (!/(next step|risk|tradeoff|because|recommend|ship|review|change)/i.test(response)) {
    reasons.push('missing_actionable_judgment');
    score -= 20;
  }
  if (citations.length === 0 && judgmentBasis.length < 40) {
    reasons.push('missing_citations_or_judgment_basis');
    score -= 35;
  }
  if (/\b(api[_-]?key|secret|password|token)\b/i.test(response)) {
    reasons.push('unsafe_secret_language');
    score -= 40;
  }
  const normalized = Math.max(0, Math.min(100, score));
  return {
    passed: normalized >= PREMIUM_RESPONSE_MIN_QUALITY_SCORE && reasons.length === 0,
    score: normalized,
    reasons,
  };
}

export async function createPremiumReviewRequest(input: {
  discordUserId: string;
  username?: string | null;
  reviewType: string;
  summary: string;
  link?: string | null;
}): Promise<{ id: string; priority: number }> {
  const summary = input.summary.trim();
  if (summary.length < 12) throw new Error('Premium review summary is too short.');
  const priority = await isPremiumDiscordMember(input.discordUserId) ? 95 : 65;
  const { data, error } = await supabaseAdmin()
    .from('discord_premium_review_requests')
    .insert({
      discord_user_id: input.discordUserId,
      discord_username: input.username ?? null,
      review_type: normalizePremiumReviewType(input.reviewType),
      summary,
      link: input.link?.trim() || null,
      priority,
      sla_due_at: premiumReviewSlaDueAt(),
      metadata: { source: 'slash_command', premium_workflow_version: 'premium_v2' },
    })
    .select('id, priority')
    .single();
  if (error) throw new Error(error.message);
  await recordPremiumWorkflowEvent({
    requestId: String(data.id),
    eventType: 'requested',
    actor: input.username ?? input.discordUserId,
    status: 'queued',
    note: summary,
    metadata: { priority, review_type: normalizePremiumReviewType(input.reviewType) },
  });
  return { id: String(data.id), priority: Number(data.priority) };
}

export async function assignPremiumReviewRequest(input: {
  requestId: string;
  actor: string;
  assignedTo: string;
  note?: string | null;
}): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin()
    .from('discord_premium_review_requests')
    .update({
      status: 'in_review',
      assigned_to: input.assignedTo,
      assigned_at: now,
      updated_at: now,
      metadata: { assigned_source: 'admin_dashboard' },
    })
    .eq('id', input.requestId)
    .in('status', ['queued', 'in_review']);
  if (error) throw new Error(error.message);
  await recordPremiumWorkflowEvent({
    requestId: input.requestId,
    eventType: 'assigned',
    actor: input.actor,
    status: 'in_review',
    note: input.note ?? null,
    metadata: { assigned_to: input.assignedTo },
  });
}

export async function completePremiumReviewRequest(input: {
  requestId: string;
  actor: string;
  response: string;
  citations?: unknown[];
  judgmentBasis?: string | null;
}): Promise<{ qualityScore: number; followUpDueAt: string }> {
  const response = input.response.trim();
  const judgmentBasis = input.judgmentBasis?.trim() || null;
  const citations = Array.isArray(input.citations) ? input.citations : [];
  const quality = evaluatePremiumResponseQuality({ response, citations, judgmentBasis });
  if (!quality.passed) {
    throw new Error(`Premium response failed quality gate: ${quality.reasons.join(', ')}`);
  }
  const now = new Date();
  const followUpDueAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabaseAdmin()
    .from('discord_premium_review_requests')
    .update({
      status: 'answered',
      response,
      response_quality_score: quality.score,
      response_citations: citations,
      judgment_basis: judgmentBasis,
      completed_at: now.toISOString(),
      follow_up_due_at: followUpDueAt,
      updated_at: now.toISOString(),
    })
    .eq('id', input.requestId)
    .in('status', ['queued', 'in_review', 'answered']);
  if (error) throw new Error(error.message);
  await recordPremiumWorkflowEvent({
    requestId: input.requestId,
    eventType: 'answered',
    actor: input.actor,
    status: 'answered',
    note: response.slice(0, 500),
    metadata: {
      quality_score: quality.score,
      citation_count: citations.length,
      follow_up_due_at: followUpDueAt,
      judgment_basis: judgmentBasis,
    },
  });
  return { qualityScore: quality.score, followUpDueAt };
}

async function recordPremiumWorkflowEvent(input: {
  requestId: string;
  eventType: 'requested' | 'assigned' | 'answered' | 'completed' | 'follow_up_due' | 'closed' | 'archived';
  actor?: string | null;
  status?: PremiumWorkflowStatus | null;
  note?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const { error } = await supabaseAdmin()
    .from('discord_premium_workflow_events')
    .insert({
      request_id: input.requestId,
      event_type: input.eventType,
      actor: input.actor ?? null,
      status: input.status ?? null,
      note: input.note ?? null,
      metadata: input.metadata ?? {},
    });
  if (error && !/does not exist/i.test(error.message)) throw new Error(error.message);
}

export async function createOfficeHoursQueueItem(input: {
  discordUserId: string;
  username?: string | null;
  question: string;
  context?: string | null;
}): Promise<{ id: string; priority: number; premiumMember: boolean }> {
  const question = input.question.trim();
  if (question.length < 8) throw new Error('Office-hours question is too short.');
  const premiumMember = await isPremiumDiscordMember(input.discordUserId);
  const priority = premiumMember ? 90 : 55;
  const { data, error } = await supabaseAdmin()
    .from('discord_office_hours_queue')
    .insert({
      discord_user_id: input.discordUserId,
      discord_username: input.username ?? null,
      question,
      context: input.context?.trim() || null,
      premium_member: premiumMember,
      priority,
      metadata: { source: 'slash_command' },
    })
    .select('id, priority, premium_member')
    .single();
  if (error) throw new Error(error.message);
  return { id: String(data.id), priority: Number(data.priority), premiumMember: Boolean(data.premium_member) };
}

export async function answerPremiumQuestion(input: {
  discordUserId: string;
  username?: string | null;
  question: string;
  context?: string | null;
}): Promise<{ id: string; answer: string; answerId: string | null; retrievalLogId: string | null; model: string }> {
  const premiumMember = await isPremiumDiscordMember(input.discordUserId);
  if (!premiumMember) throw new Error('Premium answers require Premium Member access.');
  validateRagUserInputSecurity({ question: input.question, context: input.context });
  const normalizedQuestion = [
    input.question.trim(),
    input.context?.trim() ? `Premium member context: ${input.context.trim()}` : null,
    'Give a deeper answer with implementation steps, risks, and what to do next.',
  ].filter(Boolean).join('\n\n');
  const result = await answerRagQuestion(supabaseAdmin(), normalizedQuestion, { limit: 8, persist: true });
  const { data, error } = await supabaseAdmin()
    .from('discord_premium_answer_requests')
    .insert({
      discord_user_id: input.discordUserId,
      discord_username: input.username ?? null,
      question: input.question.trim(),
      context: input.context?.trim() || null,
      rag_answer_id: result.answerId,
      retrieval_log_id: result.retrievalLogId,
      model: result.model,
      status: 'answered',
      metadata: {
        citation_count: result.citations.length,
        source: 'slash_command',
        prompt_version: SAGEBOT_PROMPT_VERSIONS.answer,
        personality_version: SAGEBOT_PERSONALITY_VERSION,
      },
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return {
    id: String(data.id),
    answer: result.answer,
    answerId: result.answerId,
    retrievalLogId: result.retrievalLogId,
    model: result.model,
  };
}
