import { deepSeekChat } from '@/lib/rag/deepseek';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createDiscordContentDraft } from './content-approval';
import { getDailyChallengeFromStore, getDailyContentPlan, getDailyQuizFromStore } from './engagement';

export const DISCORD_DAILY_PLANNER_PROMPT_VERSION = 'discord-daily-planner-v1';

export type DiscordDailyPlannerInput = {
  date?: Date;
  force?: boolean;
  metadata?: Record<string, unknown>;
};

export type DiscordDailyPlannerResult = {
  ok: boolean;
  skipped: boolean;
  draftId: string | null;
  dateKey: string;
  model: string | null;
  title: string;
  bodyPreview: string;
};

export function buildDailyPlannerPrompt(input: {
  dateKey: string;
  theme?: string | null;
  prompt?: string | null;
  quizPrompt: string;
  quizOptions: string[];
  challengeTitle: string;
  challengePrompt: string;
  challengeDeliverable: string;
}): string {
  return [
    'Create a high-signal Discord daily education post for Sage Ideas Academy.',
    'Audience: builders learning AI apps, websites, automation, cloud, SEO/content, and growth.',
    'Style: practical, specific, no hype, no generic motivation, no engagement bait.',
    'Format exactly:',
    '# Daily Signal',
    '**Theme:** ...',
    '**Build prompt:** ...',
    '**AI/tool pattern:** ...',
    '**Question:** ...',
    '**Quiz:** ...',
    'Options: ... / ... / ... / ...',
    '**Challenge:** ...',
    'Deliverable: ...',
    '',
    `Date: ${input.dateKey}`,
    `Theme seed: ${input.theme ?? 'Use the strongest useful builder theme.'}`,
    `Build prompt seed: ${input.prompt ?? 'Create a useful daily build prompt.'}`,
    `Quiz seed: ${input.quizPrompt}`,
    `Quiz options: ${input.quizOptions.join(' / ')}`,
    `Challenge seed: ${input.challengeTitle} - ${input.challengePrompt}`,
    `Challenge deliverable: ${input.challengeDeliverable}`,
  ].join('\n');
}

export function scoreDailyPlannerDraft(body: string): number {
  let score = 35;
  if (body.includes('# Daily Signal')) score += 10;
  if (/\*\*Theme:\*\*/i.test(body)) score += 8;
  if (/\*\*Build prompt:\*\*/i.test(body)) score += 10;
  if (/\*\*Quiz:\*\*/i.test(body)) score += 8;
  if (/\*\*Challenge:\*\*/i.test(body)) score += 8;
  if (/Deliverable:/i.test(body)) score += 8;
  if (body.length >= 500 && body.length <= 1800) score += 13;
  return Math.max(0, Math.min(100, score));
}

export async function createDailyPlannerDraft(input: DiscordDailyPlannerInput = {}): Promise<DiscordDailyPlannerResult> {
  const date = input.date ?? new Date();
  const dateKey = date.toISOString().slice(0, 10);
  const existing = input.force ? null : await findExistingDailyPlannerDraft(dateKey);
  if (existing) {
    return {
      ok: true,
      skipped: true,
      draftId: existing.id,
      dateKey,
      model: existing.model ?? null,
      title: existing.title ?? `Daily Signal - ${dateKey}`,
      bodyPreview: String(existing.body ?? '').slice(0, 300),
    };
  }

  const [plan, quiz, challenge] = await Promise.all([
    getDailyContentPlan(date),
    getDailyQuizFromStore(date),
    getDailyChallengeFromStore(date),
  ]);
  const prompt = buildDailyPlannerPrompt({
    dateKey,
    theme: plan?.theme ?? null,
    prompt: plan?.prompt ?? null,
    quizPrompt: quiz.prompt,
    quizOptions: quiz.options,
    challengeTitle: challenge.title,
    challengePrompt: challenge.prompt,
    challengeDeliverable: challenge.deliverable,
  });
  const generation = await deepSeekChat({
    messages: [
      {
        role: 'system',
        content: 'You produce approval-ready Discord education drafts. Return only the post body.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.4,
    maxTokens: 520,
  });
  const body = generation.content.trim();
  const draft = await createDiscordContentDraft({
    draftType: 'daily_signal',
    targetChannelBaseName: 'daily-signal',
    title: `Daily Signal - ${dateKey}`,
    body,
    model: generation.model,
    promptVersion: DISCORD_DAILY_PLANNER_PROMPT_VERSION,
    qualityScore: scoreDailyPlannerDraft(body),
    status: 'pending_approval',
    metadata: {
      planner_date: dateKey,
      source: 'discord_daily_planner',
      usage: generation.usage,
      ...(input.metadata ?? {}),
    },
  });

  return {
    ok: true,
    skipped: false,
    draftId: draft.id,
    dateKey,
    model: generation.model,
    title: `Daily Signal - ${dateKey}`,
    bodyPreview: body.slice(0, 300),
  };
}

async function findExistingDailyPlannerDraft(dateKey: string): Promise<{ id: string; title: string | null; body: string; model: string | null } | null> {
  const { data, error } = await supabaseAdmin()
    .from('discord_content_drafts')
    .select('id, title, body, model, metadata')
    .eq('draft_type', 'daily_signal')
    .in('status', ['draft', 'pending_approval', 'approved'])
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return ((data ?? []) as Array<{ id: string; title: string | null; body: string; model: string | null; metadata?: { planner_date?: string } }>)
    .find((row) => row.metadata?.planner_date === dateKey) ?? null;
}
