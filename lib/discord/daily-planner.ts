import { deepSeekChat } from '@/lib/rag/deepseek';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createDiscordContentDraft } from './content-approval';
import { getDailyChallengeFromStore, getDailyContentPlan, getDailyQuizFromStore } from './engagement';
import { recordDiscordEvent, recordDiscordScheduledRun } from './analytics';
import { postToChannelByBaseName } from './sage-rest';
import {
  DISCORD_NEWS_TO_ACTION_REGISTRY_VERSION,
  approvedNewsToActionSources,
  buildNewsToActionSourcePolicyLine,
} from './news-to-action';
import { DISCORD_NEWS_TO_ACTION_INGESTION_VERSION, fetchNewsToActionCandidates } from './news-ingestion';
import {
  SAGEBOT_PERSONALITY_VERSION,
  SAGEBOT_PROMPT_VERSIONS,
  sageBotDailySignalSystemPrompt,
  scoreSageBotPolicyOutput,
} from './sagebot-personality';

export const DISCORD_DAILY_PLANNER_PROMPT_VERSION = SAGEBOT_PROMPT_VERSIONS.dailySignal;
export const DISCORD_DAILY_SIGNAL_SCHEDULER_VERSION = 'discord-daily-signal-scheduler-v1';

export const dailySignalWeeklyThemes = [
  { day: 1, label: 'Foundations', focus: 'core concepts, clean specs, and first principles' },
  { day: 2, label: 'Implementation', focus: 'shipping small working artifacts' },
  { day: 3, label: 'Critique', focus: 'review, feedback, and improving quality' },
  { day: 4, label: 'Automation and AI', focus: 'AI workflows, agents, structured output, and approval gates' },
  { day: 5, label: 'Ship and win', focus: 'visible progress, launches, and proof' },
  { day: 6, label: 'Resource lab', focus: 'templates, reusable assets, and useful references' },
  { day: 0, label: 'Recap and planning', focus: 'weekly synthesis and next-week planning' },
] as const;

export const dailySignalPostTypes = [
  'build_prompt',
  'ai_tool_update',
  'news_to_action',
  'daily_question',
  'daily_quiz',
  'daily_challenge',
  'resource_drop',
] as const;

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
  observability?: {
    traceId: string;
    observationId: string;
    provider: 'langfuse' | 'local';
  };
};

export type DiscordDailySignalScheduleResult = {
  ok: boolean;
  posted: boolean;
  skipped: boolean;
  reason?: string;
  dateKey: string;
  draftId: string | null;
  messageId: string | null;
};

export function dailySignalRunKey(dateKey: string): string {
  return `daily-signal-${dateKey}`;
}

export function getDailySignalWeeklyTheme(now = new Date()): typeof dailySignalWeeklyThemes[number] {
  return dailySignalWeeklyThemes.find((item) => item.day === now.getUTCDay()) ?? dailySignalWeeklyThemes[0];
}

export function buildDailyPlannerPrompt(input: {
  dateKey: string;
  theme?: string | null;
  prompt?: string | null;
  quizPrompt: string;
  quizOptions: string[];
  challengeTitle: string;
  challengePrompt: string;
  challengeDeliverable: string;
  newsToAction?: string | null;
}): string {
  return [
    'Create a high-signal Discord daily education post for Sage Ideas Academy.',
    'Audience: builders learning AI apps, websites, automation, cloud, SEO/content, and growth.',
    'Style: practical, specific, no hype, no generic motivation, no engagement bait.',
    'Model policy: do not recommend OpenAI, ChatGPT, or GPT models unless a seed explicitly requires it. Use DeepSeek or provider-neutral LLM language when a model is needed.',
    'Every section must create a concrete action a member can take today.',
    'Format exactly:',
    '# Daily Signal',
    '**Theme:** ...',
    '**Build prompt:** ...',
    '**AI/tool pattern:** ...',
    '**News-to-action:** ...',
    '**Question:** ...',
    '**Quiz:** ...',
    'Options: ... / ... / ... / ...',
    '**Challenge:** ...',
    'Deliverable: ...',
    '',
    `Date: ${input.dateKey}`,
    `Theme seed: ${input.theme ?? 'Use the strongest useful builder theme.'}`,
    `Build prompt seed: ${input.prompt ?? 'Create a useful daily build prompt.'}`,
    `News-to-action seed: ${input.newsToAction ?? buildNewsToActionSourcePolicyLine()}`,
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

  const [plan, quiz, challenge, news] = await Promise.all([
    getDailyContentPlan(date),
    getDailyQuizFromStore(date),
    getDailyChallengeFromStore(date),
    fetchNewsToActionCandidates({ now: date, maxItems: 1 }).catch((error) => ({
      ok: false,
      version: DISCORD_NEWS_TO_ACTION_INGESTION_VERSION,
      checkedSources: approvedNewsToActionSources.length,
      fetchedFeeds: 0,
      items: [],
      errors: [{ sourceKey: 'news_ingestion', feedUrl: 'all', error: error instanceof Error ? error.message : String(error) }],
    })),
  ]);
  const newsSeed = news.items[0]?.draft.body ?? buildNewsToActionSourcePolicyLine();
  const prompt = buildDailyPlannerPrompt({
    dateKey,
    theme: plan?.theme ?? getDailySignalWeeklyTheme(date).label,
    prompt: plan?.prompt ?? null,
    quizPrompt: quiz.prompt,
    quizOptions: quiz.options,
    challengeTitle: challenge.title,
    challengePrompt: challenge.prompt,
    challengeDeliverable: challenge.deliverable,
    newsToAction: newsSeed,
  });
  const generation = await deepSeekChat({
    messages: [
      {
        role: 'system',
        content: sageBotDailySignalSystemPrompt(),
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.4,
    maxTokens: 520,
  });
  const body = generation.content.trim();
  const policyScore = scoreSageBotPolicyOutput(body, { maxLength: 1900 });
  const qualityScore = Math.min(scoreDailyPlannerDraft(body), policyScore.score);
  const draft = await createDiscordContentDraft({
    draftType: 'daily_signal',
    targetChannelBaseName: 'daily-signal',
    title: `Daily Signal - ${dateKey}`,
    body,
    model: generation.model,
    promptVersion: DISCORD_DAILY_PLANNER_PROMPT_VERSION,
    qualityScore,
    status: 'pending_approval',
    metadata: {
      planner_date: dateKey,
      weekly_theme: getDailySignalWeeklyTheme(date),
      post_types: dailySignalPostTypes,
      source: 'discord_daily_planner',
      usage: generation.usage,
      personality_version: SAGEBOT_PERSONALITY_VERSION,
      prompt_version: DISCORD_DAILY_PLANNER_PROMPT_VERSION,
      policy_score: policyScore.score,
      policy_passed: policyScore.passed,
      policy_reasons: policyScore.reasons,
      policy_flags: policyScore.flags,
      scheduler_version: DISCORD_DAILY_SIGNAL_SCHEDULER_VERSION,
      news_registry_version: DISCORD_NEWS_TO_ACTION_REGISTRY_VERSION,
      news_ingestion_version: DISCORD_NEWS_TO_ACTION_INGESTION_VERSION,
      news_source_policy: 'approved_sources_only',
      approved_news_sources: approvedNewsToActionSources.map((source) => source.key),
      news_ingestion: {
        ok: news.ok,
        checked_sources: news.checkedSources,
        fetched_feeds: news.fetchedFeeds,
        selected_source_key: news.items[0]?.draft.sourceKey ?? null,
        selected_source_url: news.items[0]?.draft.sourceUrl ?? null,
        error_count: news.errors.length,
      },
      ai_trace_id: generation.observability.traceId,
      ai_observation_id: generation.observability.observationId,
      ai_observability_provider: generation.observability.provider,
      langfuse_trace_id: generation.observability.provider === 'langfuse' ? generation.observability.traceId : null,
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
    observability: generation.observability,
  };
}

export async function publishApprovedDailySignalDraft(input: {
  date?: Date;
  source: string;
  createIfMissing?: boolean;
}): Promise<DiscordDailySignalScheduleResult> {
  const date = input.date ?? new Date();
  const dateKey = date.toISOString().slice(0, 10);
  const alreadyPosted = await findPublishedDailySignalDraft(dateKey);
  if (alreadyPosted) {
    await recordDiscordScheduledRun({
      runKey: dailySignalRunKey(dateKey),
      kind: 'daily_signal',
      status: 'skipped',
      messageId: alreadyPosted.published_message_id ?? null,
      metadata: {
        source: input.source,
        reason: 'already_published',
        draft_id: alreadyPosted.id,
        scheduler_version: DISCORD_DAILY_SIGNAL_SCHEDULER_VERSION,
      },
    });
    return {
      ok: true,
      posted: false,
      skipped: true,
      reason: 'already_published',
      dateKey,
      draftId: alreadyPosted.id,
      messageId: alreadyPosted.published_message_id ?? null,
    };
  }

  let approved = await findApprovedDailySignalDraft(dateKey);
  if (!approved && input.createIfMissing) {
    await createDailyPlannerDraft({ date, force: false, metadata: { requested_by: input.source } });
    approved = await findApprovedDailySignalDraft(dateKey);
  }

  if (!approved) {
    await recordDiscordScheduledRun({
      runKey: dailySignalRunKey(dateKey),
      kind: 'daily_signal',
      status: 'skipped',
      metadata: {
        source: input.source,
        reason: 'no_approved_daily_signal_draft',
        scheduler_version: DISCORD_DAILY_SIGNAL_SCHEDULER_VERSION,
      },
    });
    return {
      ok: false,
      posted: false,
      skipped: true,
      reason: 'no_approved_daily_signal_draft',
      dateKey,
      draftId: null,
      messageId: null,
    };
  }

  const messageId = await postToChannelByBaseName(approved.target_channel_base_name, approved.body);
  await supabaseAdmin()
    .from('discord_content_drafts')
    .update({
      status: messageId ? 'published' : 'approved',
      published_message_id: messageId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', approved.id);

  await supabaseAdmin()
    .from('discord_content_calendar')
    .update({ status: messageId ? 'posted' : 'planned', updated_at: new Date().toISOString() })
    .eq('calendar_date', dateKey);

  await recordDiscordScheduledRun({
    runKey: dailySignalRunKey(dateKey),
    kind: 'daily_signal',
    status: messageId ? 'posted' : 'failed',
    messageId,
    metadata: {
      source: input.source,
      draft_id: approved.id,
      scheduler_version: DISCORD_DAILY_SIGNAL_SCHEDULER_VERSION,
    },
  });
  await recordDiscordEvent({
    eventType: messageId ? 'daily_signal_posted' : 'daily_signal_post_failed',
    commandName: input.source,
    channelBaseName: approved.target_channel_base_name,
    metadata: { message_id: messageId, draft_id: approved.id },
  });

  return {
    ok: Boolean(messageId),
    posted: Boolean(messageId),
    skipped: false,
    dateKey,
    draftId: approved.id,
    messageId,
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

async function findApprovedDailySignalDraft(dateKey: string): Promise<{
  id: string;
  body: string;
  target_channel_base_name: string;
} | null> {
  const { data, error } = await supabaseAdmin()
    .from('discord_content_drafts')
    .select('id, body, target_channel_base_name, metadata, quality_score')
    .eq('draft_type', 'daily_signal')
    .eq('status', 'approved')
    .order('quality_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return ((data ?? []) as Array<{ id: string; body: string; target_channel_base_name: string; metadata?: { planner_date?: string } }>)
    .find((row) => row.metadata?.planner_date === dateKey) ?? null;
}

async function findPublishedDailySignalDraft(dateKey: string): Promise<{
  id: string;
  published_message_id: string | null;
} | null> {
  const { data, error } = await supabaseAdmin()
    .from('discord_content_drafts')
    .select('id, published_message_id, metadata')
    .eq('draft_type', 'daily_signal')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return ((data ?? []) as Array<{ id: string; published_message_id: string | null; metadata?: { planner_date?: string } }>)
    .find((row) => row.metadata?.planner_date === dateKey) ?? null;
}
