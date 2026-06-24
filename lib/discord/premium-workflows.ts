import { supabaseAdmin } from '@/lib/supabase/server';
import { answerRagQuestion } from '@/lib/rag/retrieval';
import { SAGEBOT_PERSONALITY_VERSION, SAGEBOT_PROMPT_VERSIONS } from './sagebot-personality';

export type PremiumReviewType = 'code' | 'design' | 'ai' | 'architecture' | 'seo' | 'cloud' | 'growth' | 'general';

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
      metadata: { source: 'slash_command' },
    })
    .select('id, priority')
    .single();
  if (error) throw new Error(error.message);
  return { id: String(data.id), priority: Number(data.priority) };
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
