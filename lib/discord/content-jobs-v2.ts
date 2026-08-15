import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { deepSeekChat, type DeepSeekChatResult } from '@/lib/rag/deepseek';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createDiscordContentDraft } from './content-approval';
import { evaluateDiscordContentDraft } from './content-quality';
import { recordDiscordEvent } from './analytics';
import { postToChannelByBaseName } from './sage-rest';
import {
  SAGEBOT_PERSONALITY_VERSION,
  SAGEBOT_PROMPT_VERSIONS,
  sageBotDailySignalSystemPrompt,
  scoreSageBotPolicyOutput,
} from './sagebot-personality';

export const DISCORD_CONTENT_JOBS_V2_VERSION = 'discord-content-jobs-v2';
export const DISCORD_CONTENT_JOBS_V2_PROMPT_VERSION = 'sagebot_content_jobs_v2';

export const contentJobTypes = [
  'daily_signal',
  'daily_question',
  'daily_quiz',
  'daily_challenge',
  'resource_drop',
  'weekly_recap',
  'member_win_highlight',
  'unanswered_question_roundup',
  'article_draft',
  'social_draft',
  'newsletter_draft',
] as const;

export type DiscordContentJobType = typeof contentJobTypes[number];

const draftTypeMap: Record<DiscordContentJobType, 'daily_signal' | 'quiz' | 'challenge' | 'resource_drop' | 'weekly_recap' | 'social_post' | 'lesson' | 'announcement'> = {
  daily_signal: 'daily_signal',
  daily_question: 'announcement',
  daily_quiz: 'quiz',
  daily_challenge: 'challenge',
  resource_drop: 'resource_drop',
  weekly_recap: 'weekly_recap',
  member_win_highlight: 'announcement',
  unanswered_question_roundup: 'announcement',
  article_draft: 'lesson',
  social_draft: 'social_post',
  newsletter_draft: 'lesson',
};

const targetChannelMap: Record<DiscordContentJobType, string> = {
  daily_signal: 'daily-signal',
  daily_question: 'daily-signal',
  daily_quiz: 'daily-signal',
  daily_challenge: 'daily-signal',
  resource_drop: 'resources',
  weekly_recap: 'wins-showcase',
  member_win_highlight: 'wins-showcase',
  unanswered_question_roundup: 'questions',
  article_draft: 'content-queue',
  social_draft: 'content-queue',
  newsletter_draft: 'content-queue',
};

export type DiscordContentSource = {
  id: string;
  sourceId: string;
  sourceType: 'discord_question' | 'discord_answer' | 'discord_content_queue' | 'discord_content_draft';
  sourceTable: string;
  recordId: string;
  title: string;
  body: string;
  channelBaseName: string | null;
  createdAt: string | null;
  qualityScore: number;
};

export type ContentJobDraftGenerationInput = {
  jobType: DiscordContentJobType;
  topic?: string | null;
  maxSources?: number;
  sourceIds?: string[];
  metadata?: Record<string, unknown>;
};

export type ContentJobDraftResult = {
  ok: boolean;
  draftId: string;
  jobType: DiscordContentJobType;
  draftType: string;
  targetChannelBaseName: string;
  title: string;
  qualityScore: number;
  sourceIds: string[];
  model: string;
  observability: DeepSeekChatResult['observability'];
};

export type PublishDiscordContentDraftResult = {
  ok: boolean;
  posted: boolean;
  skipped: boolean;
  reason?: 'already_published' | 'not_approved';
  draftId: string;
  targetChannelBaseName: string | null;
  messageId: string | null;
};

export const GeneratedContentJobDraftSchema = z.object({
  title: z.string().trim().min(12).max(120),
  body: z.string().trim().min(220).max(1900),
  draft_type: z.enum(['daily_signal', 'quiz', 'challenge', 'resource_drop', 'weekly_recap', 'social_post', 'lesson', 'announcement']),
  target_channel_base_name: z.string().trim().min(3).max(64),
  source_ids: z.array(z.string().trim().min(2)).min(1).max(6),
  citations: z.array(z.object({
    source_id: z.string().trim().min(2),
    label: z.string().trim().min(2).max(120),
    quote: z.string().trim().max(220).optional(),
  })).min(1).max(6),
  quality_notes: z.array(z.string().trim().min(4).max(180)).max(6).default([]),
});

export type GeneratedContentJobDraft = z.infer<typeof GeneratedContentJobDraftSchema>;

export type ContentJobQualityGate = {
  key: string;
  passed: boolean;
  reason: string;
};

export type ContentJobQualityResult = {
  passed: boolean;
  score: number;
  gates: ContentJobQualityGate[];
  reasons: string[];
};

const PRIVATE_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  /\b(?:api[_-]?key|secret|token|password)\s*[:=]\s*['"]?[A-Za-z0-9_\-.]{12,}/i,
  /\bdiscord_user_id\b/i,
];

export function parseGeneratedContentJobDraft(raw: string): GeneratedContentJobDraft {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('DeepSeek did not return a JSON object.');
  const parsed = JSON.parse(raw.slice(start, end + 1));
  return GeneratedContentJobDraftSchema.parse(parsed);
}

export function evaluateContentJobDraftV2(
  draft: GeneratedContentJobDraft,
  input: {
    expectedDraftType: GeneratedContentJobDraft['draft_type'];
    expectedTargetChannel: string;
    allowedSourceIds: string[];
  },
): ContentJobQualityResult {
  const uniqueSourceIds = new Set(draft.source_ids);
  const citations = new Set(draft.citations.map((citation) => citation.source_id));
  const body = draft.body.trim();
  const policy = scoreSageBotPolicyOutput(body, { requireCitation: false, maxLength: 2000 });
  const structural = evaluateDiscordContentDraft({
    id: 'content-job-v2-preview',
    draft_type: draft.draft_type,
    title: draft.title,
    body,
    target_channel_base_name: draft.target_channel_base_name,
  });
  const gates: ContentJobQualityGate[] = [
    gate('expected_type', draft.draft_type === input.expectedDraftType, `Draft type must be ${input.expectedDraftType}.`),
    gate('expected_channel', draft.target_channel_base_name === input.expectedTargetChannel, `Target channel must be ${input.expectedTargetChannel}.`),
    gate('source_ids_allowed', draft.source_ids.every((id) => input.allowedSourceIds.includes(id)), 'Every source ID must come from the approved source registry.'),
    gate('citation_for_each_source', [...uniqueSourceIds].every((id) => citations.has(id)), 'Every selected source must have a citation object.'),
    gate('body_cites_sources', [...uniqueSourceIds].some((id) => body.includes(`[${id}]`)), 'Body must cite at least one source marker such as [S1].'),
    gate('specific_action', /(deliverable|next action|build|review|ship|checklist|question|challenge|answer)/i.test(body), 'Draft must include a concrete action.'),
    gate('privacy_guard', !PRIVATE_PATTERNS.some((pattern) => pattern.test(body)), 'Draft must not leak private contact data, secrets, or raw internal IDs.'),
    gate('policy_gate', policy.passed, `Policy gate must pass: ${policy.reasons.join('; ') || 'ok'}`),
    gate('quality_gate', structural.passed, `Content quality gate must pass: ${structural.reasons.join('; ') || 'ok'}`),
  ];
  const failed = gates.filter((item) => !item.passed);
  const score = Math.max(0, Math.min(100, Math.round(Math.min(policy.score, structural.score) - failed.length * 6)));
  return {
    passed: failed.length === 0 && score >= 80,
    score,
    gates,
    reasons: failed.map((item) => item.reason),
  };
}

export async function buildDiscordContentSourceRegistry(
  sb: SupabaseClient<any> = supabaseAdmin(),
  input: { limit?: number; sourceIds?: string[] } = {},
): Promise<DiscordContentSource[]> {
  const limit = Math.max(1, Math.min(30, input.limit ?? 12));
  const [questionsRes, answersRes, queueRes, draftsRes] = await Promise.all([
    sb.from('discord_questions')
      .select('id, question, context, channel_base_name, created_at, updated_at')
      .eq('status', 'closed')
      .order('updated_at', { ascending: false })
      .limit(limit),
    sb.from('discord_answers')
      .select('id, question_id, answer, discord_username, created_at, updated_at')
      .eq('helpful', true)
      .order('updated_at', { ascending: false })
      .limit(limit),
    sb.from('discord_content_queue')
      .select('id, idea, angle, channel_base_name, priority, status, created_at, updated_at, metadata')
      .eq('status', 'published')
      .order('priority', { ascending: false })
      .order('updated_at', { ascending: false })
      .limit(limit),
    sb.from('discord_content_drafts')
      .select('id, draft_type, title, body, target_channel_base_name, quality_score, status, created_at, updated_at')
      .in('status', ['approved', 'published'])
      .gte('quality_score', 80)
      .order('updated_at', { ascending: false })
      .limit(limit),
  ]);

  for (const result of [questionsRes, answersRes, queueRes, draftsRes]) {
    if (result.error) throw new Error(result.error.message);
  }

  const sources: DiscordContentSource[] = [
    ...((questionsRes.data ?? []) as any[]).map((row) => ({
      id: `S${0}`,
      sourceId: '',
      sourceType: 'discord_question' as const,
      sourceTable: 'discord_questions',
      recordId: String(row.id),
      title: 'Approved question',
      body: [row.question, row.context].filter(Boolean).join('\n\n'),
      channelBaseName: row.channel_base_name ?? null,
      createdAt: row.updated_at ?? row.created_at ?? null,
      qualityScore: 84,
    })),
    ...((answersRes.data ?? []) as any[]).map((row) => ({
      id: `S${0}`,
      sourceId: '',
      sourceType: 'discord_answer' as const,
      sourceTable: 'discord_answers',
      recordId: String(row.id),
      title: `Helpful answer from ${row.discord_username ?? 'member'}`,
      body: String(row.answer ?? ''),
      channelBaseName: null,
      createdAt: row.updated_at ?? row.created_at ?? null,
      qualityScore: 88,
    })),
    ...((queueRes.data ?? []) as any[]).map((row) => ({
      id: `S${0}`,
      sourceId: '',
      sourceType: 'discord_content_queue' as const,
      sourceTable: 'discord_content_queue',
      recordId: String(row.id),
      title: String(row.idea ?? 'Approved content queue item'),
      body: [row.idea, row.angle, typeof row.metadata?.source_content_preview === 'string' ? row.metadata.source_content_preview : null].filter(Boolean).join('\n\n'),
      channelBaseName: row.channel_base_name ?? null,
      createdAt: row.updated_at ?? row.created_at ?? null,
      qualityScore: Math.max(80, Math.min(100, Number(row.priority ?? 80))),
    })),
    ...((draftsRes.data ?? []) as any[]).map((row) => ({
      id: `S${0}`,
      sourceId: '',
      sourceType: 'discord_content_draft' as const,
      sourceTable: 'discord_content_drafts',
      recordId: String(row.id),
      title: String(row.title ?? row.draft_type ?? 'Approved draft'),
      body: String(row.body ?? ''),
      channelBaseName: row.target_channel_base_name ?? null,
      createdAt: row.updated_at ?? row.created_at ?? null,
      qualityScore: Math.max(80, Math.min(100, Number(row.quality_score ?? 80))),
    })),
  ]
    .filter((source) => source.body.trim().length >= 40)
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, limit)
    .map((source, index) => ({
      ...source,
      id: `S${index + 1}`,
      sourceId: `${source.sourceTable}:${source.recordId}`,
    }));

  if (input.sourceIds?.length) {
    const allow = new Set(input.sourceIds);
    return sources.filter((source) => allow.has(source.sourceId) || allow.has(source.id));
  }
  return sources;
}

export function buildContentJobPrompt(input: {
  jobType: DiscordContentJobType;
  topic?: string | null;
  sources: DiscordContentSource[];
}): string {
  const expectedDraftType = draftTypeMap[input.jobType];
  const targetChannel = targetChannelMap[input.jobType];
  return [
    `Create one ${input.jobType} Discord content draft for Sage Ideas Academy.`,
    'Use only the approved sources below. Do not invent claims, prices, member facts, or results.',
    'Audience: builders learning AI apps, websites, automation, cloud, content engines, and growth.',
    'Voice: concise, practical, direct, source-grounded, no generic hype, no engagement bait.',
    'Model policy: use DeepSeek or provider-neutral language when model choice is relevant.',
    `Expected draft_type: ${expectedDraftType}`,
    `Expected target_channel_base_name: ${targetChannel}`,
    input.topic ? `Admin topic: ${input.topic}` : 'Admin topic: use the strongest source-grounded teaching angle.',
    'Return strict JSON only with this shape:',
    '{"title":"...","body":"... [S1]","draft_type":"...","target_channel_base_name":"...","source_ids":["S1"],"citations":[{"source_id":"S1","label":"...","quote":"short excerpt"}],"quality_notes":["..."]}',
    'Body requirements: cite source markers like [S1], include one concrete next action or deliverable, and keep it under 1900 characters.',
    '',
    'Approved sources:',
    ...input.sources.map((source) => [
      `[${source.id}] ${source.sourceType} ${source.sourceId}`,
      `Title: ${source.title}`,
      `Body: ${source.body.slice(0, 900)}`,
    ].join('\n')),
  ].join('\n\n');
}

export async function createDiscordContentJobDraftV2(input: ContentJobDraftGenerationInput): Promise<ContentJobDraftResult> {
  const sources = await buildDiscordContentSourceRegistry(supabaseAdmin(), {
    limit: input.maxSources ?? 6,
    sourceIds: input.sourceIds,
  });
  if (!sources.length) throw new Error('No approved Discord content sources available for content job.');

  const expectedDraftType = draftTypeMap[input.jobType];
  const expectedTargetChannel = targetChannelMap[input.jobType];
  const prompt = buildContentJobPrompt({ jobType: input.jobType, topic: input.topic, sources });
  const generation = await deepSeekChat({
    messages: [
      { role: 'system', content: sageBotDailySignalSystemPrompt() },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    maxTokens: 900,
    observability: {
      name: 'discord.content_jobs_v2.generate',
      metadata: {
        phase: 10,
        job_type: input.jobType,
        source_count: sources.length,
        prompt_version: DISCORD_CONTENT_JOBS_V2_PROMPT_VERSION,
      },
    },
  });

  const parsed = parseGeneratedContentJobDraft(generation.content);
  const quality = evaluateContentJobDraftV2(parsed, {
    expectedDraftType,
    expectedTargetChannel,
    allowedSourceIds: sources.map((source) => source.id),
  });
  if (!quality.passed) {
    throw new Error(`Content job draft failed quality gate: ${quality.reasons.join('; ') || `score ${quality.score}`}`);
  }

  const selectedSources = sources.filter((source) => parsed.source_ids.includes(source.id));
  const primaryQueueSource = selectedSources.find((source) => source.sourceTable === 'discord_content_queue');
  const draft = await createDiscordContentDraft({
    contentQueueId: primaryQueueSource?.recordId ?? null,
    draftType: parsed.draft_type,
    targetChannelBaseName: parsed.target_channel_base_name,
    title: parsed.title,
    body: parsed.body,
    citations: parsed.citations,
    model: generation.model,
    promptVersion: DISCORD_CONTENT_JOBS_V2_PROMPT_VERSION,
    qualityScore: quality.score,
    status: 'pending_approval',
    metadata: {
      phase: 10,
      source: DISCORD_CONTENT_JOBS_V2_VERSION,
      job_type: input.jobType,
      topic: input.topic ?? null,
      source_ids: selectedSources.map((source) => source.sourceId),
      source_refs: selectedSources,
      source_registry_version: DISCORD_CONTENT_JOBS_V2_VERSION,
      prompt_version: DISCORD_CONTENT_JOBS_V2_PROMPT_VERSION,
      personality_version: SAGEBOT_PERSONALITY_VERSION,
      upstream_prompt_versions: SAGEBOT_PROMPT_VERSIONS,
      quality_score_v2: quality.score,
      quality_gates_v2: quality.gates,
      quality_reasons_v2: quality.reasons,
      policy_passed: true,
      usage: generation.usage,
      ai_trace_id: generation.observability.traceId,
      ai_observation_id: generation.observability.observationId,
      ai_observability_provider: generation.observability.provider,
      ...(input.metadata ?? {}),
    },
  });

  await recordDiscordEvent({
    eventType: 'content_job_draft_generated',
    commandName: 'content_jobs_v2',
    channelBaseName: parsed.target_channel_base_name,
    metadata: {
      draft_id: draft.id,
      job_type: input.jobType,
      draft_type: parsed.draft_type,
      source_ids: selectedSources.map((source) => source.sourceId),
      quality_score: quality.score,
      prompt_version: DISCORD_CONTENT_JOBS_V2_PROMPT_VERSION,
    },
  });

  return {
    ok: true,
    draftId: draft.id,
    jobType: input.jobType,
    draftType: parsed.draft_type,
    targetChannelBaseName: parsed.target_channel_base_name,
    title: parsed.title,
    qualityScore: quality.score,
    sourceIds: selectedSources.map((source) => source.sourceId),
    model: generation.model,
    observability: generation.observability,
  };
}

export async function publishApprovedDiscordContentDraft(input: {
  draftId: string;
  source: string;
}): Promise<PublishDiscordContentDraftResult> {
  const sb = supabaseAdmin();
	  const { data: draft, error } = await sb
	    .from('discord_content_drafts')
	    .select('id, draft_type, title, body, status, target_channel_base_name, published_message_id, metadata')
    .eq('id', input.draftId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!draft) throw new Error('Discord content draft not found.');

  if (draft.status === 'published') {
    return {
      ok: true,
      posted: false,
      skipped: true,
      reason: 'already_published',
      draftId: input.draftId,
      targetChannelBaseName: draft.target_channel_base_name ?? null,
      messageId: draft.published_message_id ?? null,
    };
  }
  if (draft.status !== 'approved') {
    return {
      ok: false,
      posted: false,
      skipped: true,
      reason: 'not_approved',
      draftId: input.draftId,
      targetChannelBaseName: draft.target_channel_base_name ?? null,
      messageId: null,
    };
  }

  const messageId = await postToChannelByBaseName(draft.target_channel_base_name, draft.body, {
    embed: true,
    title: draft.title,
    variant: draft.draft_type === 'weekly_recap' ? 'win' : draft.draft_type === 'daily_signal' ? 'signal' : 'sage',
    footer: 'Sage Ideas content engine',
  });
  const metadata = {
    ...(typeof draft.metadata === 'object' && draft.metadata ? draft.metadata : {}),
    published_by: input.source,
    published_at: new Date().toISOString(),
  };
  await sb
    .from('discord_content_drafts')
    .update({
      status: messageId ? 'published' : 'approved',
      published_message_id: messageId,
      metadata,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.draftId);

  await recordDiscordEvent({
    eventType: messageId ? 'content_job_draft_published' : 'content_job_draft_publish_failed',
    commandName: input.source,
    channelBaseName: draft.target_channel_base_name,
    metadata: { draft_id: input.draftId, message_id: messageId },
  });

  return {
    ok: Boolean(messageId),
    posted: Boolean(messageId),
    skipped: false,
    draftId: input.draftId,
    targetChannelBaseName: draft.target_channel_base_name ?? null,
    messageId,
  };
}

function gate(key: string, passed: boolean, reason: string): ContentJobQualityGate {
  return { key, passed, reason };
}
