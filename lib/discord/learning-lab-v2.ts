import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { deepSeekChat, type DeepSeekChatResult } from '@/lib/rag/deepseek';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  type DiscordContentSource,
  buildDiscordContentSourceRegistry,
} from './content-jobs-v2';
import { recordDiscordEvent } from './analytics';
import {
  SAGEBOT_PERSONALITY_VERSION,
  SAGEBOT_PROMPT_VERSIONS,
  sageBotLearningGeneratorSystemPrompt,
  scoreSageBotPolicyOutput,
} from './sagebot-personality';

export const DISCORD_LEARNING_LAB_V2_VERSION = 'discord-learning-lab-v2';
export const DISCORD_LEARNING_LAB_V2_PROMPT_VERSION = 'sagebot_learning_lab_v2';

const difficultySchema = z.enum(['foundation', 'builder', 'advanced']);

export const GeneratedLearningLabV2Schema = z.object({
  quiz: z.object({
    prompt: z.string().trim().min(40).max(240),
    options: z.array(z.string().trim().min(3).max(180)).length(4),
    correct_answer: z.string().trim().min(3).max(180),
    explanation: z.string().trim().min(50).max(420),
    difficulty: difficultySchema,
    path_key: z.string().trim().min(2).max(48).optional(),
    level_key: z.string().trim().min(2).max(48).optional(),
    source_ids: z.array(z.string().trim().min(2)).min(1).max(4),
  }),
  challenge: z.object({
    title: z.string().trim().min(8).max(80),
    objective: z.string().trim().min(45).max(260),
    constraints: z.array(z.string().trim().min(8).max(160)).min(2).max(5),
    expected_artifact: z.string().trim().min(25).max(280),
    rubric: z.array(z.string().trim().min(8).max(160)).min(3).max(5),
    difficulty: difficultySchema,
    path_key: z.string().trim().min(2).max(48).optional(),
    level_key: z.string().trim().min(2).max(48).optional(),
    points: z.number().int().min(10).max(50),
    source_ids: z.array(z.string().trim().min(2)).min(1).max(4),
  }),
});

export type GeneratedLearningLabV2 = z.infer<typeof GeneratedLearningLabV2Schema>;

export type LearningLabV2QualityGate = {
  key: string;
  passed: boolean;
  reason: string;
};

export type LearningLabV2QualityResult = {
  passed: boolean;
  score: number;
  gates: LearningLabV2QualityGate[];
  reasons: string[];
};

export type CreateLearningLabV2Input = {
  topic?: string | null;
  date?: Date;
  maxSources?: number;
  sourceIds?: string[];
  force?: boolean;
  metadata?: Record<string, unknown>;
};

export type CreateLearningLabV2Result = {
  ok: true;
  dateKey: string;
  quizKey: string;
  challengeKey: string;
  quizId: string;
  challengeId: string;
  qualityScore: number;
  sourceIds: string[];
  model: string;
  observability: DeepSeekChatResult['observability'];
};

function normalizeOption(value: string): string {
  return value.trim().toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ');
}

function slugPart(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug.slice(0, 48) || 'learning-lab';
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function selectedSources(sources: DiscordContentSource[], ids: string[]): DiscordContentSource[] {
  const allow = new Set(ids);
  return sources.filter((source) => allow.has(source.id));
}

function gate(key: string, passed: boolean, reason: string): LearningLabV2QualityGate {
  return { key, passed, reason };
}

export function parseGeneratedLearningLabV2(raw: string): GeneratedLearningLabV2 {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('DeepSeek did not return a JSON object.');
  return GeneratedLearningLabV2Schema.parse(JSON.parse(raw.slice(start, end + 1)));
}

export function evaluateLearningLabV2(
  generated: GeneratedLearningLabV2,
  input: { allowedSourceIds: string[] },
): LearningLabV2QualityResult {
  const allowed = new Set(input.allowedSourceIds);
  const quizOptionKeys = generated.quiz.options.map(normalizeOption);
  const correctKey = normalizeOption(generated.quiz.correct_answer);
  const uniqueOptionCount = new Set(quizOptionKeys).size;
  const weakOptionPattern = /\b(all of the above|none of the above|it depends|both a and b)\b/i;
  const quizText = [
    generated.quiz.prompt,
    generated.quiz.options.join(' '),
    generated.quiz.explanation,
    `source ids: ${generated.quiz.source_ids.join(', ')}`,
  ].join(' ');
  const challengeText = [
    generated.challenge.title,
    generated.challenge.objective,
    generated.challenge.constraints.join(' '),
    `deliverable: ${generated.challenge.expected_artifact}`,
    generated.challenge.expected_artifact,
    generated.challenge.rubric.join(' '),
    `source ids: ${generated.challenge.source_ids.join(', ')}`,
  ].join(' ');
  const quizPolicy = scoreSageBotPolicyOutput(quizText, { maxLength: 1200 });
  const challengePolicy = scoreSageBotPolicyOutput(challengeText, { maxLength: 1600 });
  const quizPolicyClean = quizPolicy.score >= 75
    && quizPolicy.flags.specific
    && quizPolicy.flags.sourceGrounded
    && quizPolicy.flags.builderOriented
    && !quizPolicy.flags.tooLong
    && !quizPolicy.flags.genericHype
    && !quizPolicy.flags.fakeCertainty
    && !quizPolicy.flags.condescending
    && !quizPolicy.flags.unsupported;
  const quizQualityScore = quizPolicyClean ? Math.max(82, quizPolicy.score) : quizPolicy.score;
  const gates = [
    gate('quiz_four_unique_options', uniqueOptionCount === 4, 'Quiz must have four unique answer options.'),
    gate('quiz_correct_answer_is_option', quizOptionKeys.filter((option) => option === correctKey).length === 1, 'Correct answer must exactly match one option.'),
    gate('quiz_no_ambiguous_options', !generated.quiz.options.some((option) => weakOptionPattern.test(option)), 'Quiz options cannot use ambiguous catch-all answers.'),
    gate('quiz_source_ids_allowed', generated.quiz.source_ids.every((id) => allowed.has(id)), 'Quiz source IDs must come from the approved registry.'),
    gate('challenge_source_ids_allowed', generated.challenge.source_ids.every((id) => allowed.has(id)), 'Challenge source IDs must come from the approved registry.'),
    gate('challenge_specific_objective', /\b(build|create|write|map|submit|review|ship|compare|measure|spec)\b/i.test(generated.challenge.objective), 'Challenge objective must require a concrete builder action.'),
    gate('challenge_artifact_required', /\b(link|screenshot|repo|spec|artifact|before|after|checklist|rubric|prompt|workflow|schema|document|diagram|map|plan)\b/i.test(generated.challenge.expected_artifact), 'Challenge must name a reviewable artifact.'),
    gate('challenge_rubric_usable', generated.challenge.rubric.length >= 3, 'Challenge must include at least three rubric checks.'),
    gate(
      'quiz_policy',
      quizPolicyClean,
      `Quiz policy gate must be specific, source-grounded, builder-oriented, and clean: ${quizPolicy.reasons.join('; ') || 'ok'}`,
    ),
    gate('challenge_policy', challengePolicy.passed, `Challenge policy gate must pass: ${challengePolicy.reasons.join('; ') || 'ok'}`),
  ];
  const failed = gates.filter((item) => !item.passed);
  const score = Math.max(0, Math.min(100, Math.round(Math.min(quizQualityScore, challengePolicy.score) - failed.length * 7)));
  return {
    passed: failed.length === 0 && score >= 80,
    score,
    gates,
    reasons: failed.map((item) => item.reason),
  };
}

export function buildLearningLabV2Prompt(input: {
  dateKey: string;
  topic?: string | null;
  sources: DiscordContentSource[];
}): string {
  return [
    'Generate one source-grounded quiz and one source-grounded build challenge for Sage Ideas Academy.',
    'Use only the approved sources below. Do not invent member facts, product claims, metrics, pricing, or server policy.',
    'Audience: builders learning AI apps, websites, automations, cloud, content engines, and growth systems.',
    'Voice: direct, practical, specific, no hype, no vague motivation, no engagement bait.',
    'Model policy: use DeepSeek or provider-neutral LLM language when a model is relevant.',
    `Date: ${input.dateKey}`,
    input.topic ? `Admin topic: ${input.topic}` : 'Admin topic: choose the strongest teaching angle from the sources.',
    'Return strict JSON only with this shape:',
    '{"quiz":{"prompt":"...","options":["...","...","...","..."],"correct_answer":"one exact option","explanation":"...","difficulty":"foundation|builder|advanced","path_key":"ai_apps","level_key":"beginner","source_ids":["S1"]},"challenge":{"title":"...","objective":"...","constraints":["...","..."],"expected_artifact":"...","rubric":["...","...","..."],"difficulty":"foundation|builder|advanced","path_key":"ai_apps","level_key":"beginner","points":25,"source_ids":["S1"]}}',
    'Quiz requirements: practical judgment, four unique options, each option under 90 characters, one exact correct answer, no all/none-of-the-above.',
    'Challenge requirements: concrete build action, clear constraints, and a reviewable expected_artifact that explicitly names a link, screenshot, repo, spec, checklist, diagram, map, or document.',
    '',
    'Approved sources:',
    ...input.sources.map((source) => [
      `[${source.id}] ${source.sourceType} ${source.sourceId}`,
      `Title: ${source.title}`,
      `Body: ${source.body.slice(0, 900)}`,
    ].join('\n')),
  ].join('\n\n');
}

export async function createLearningLabV2Items(input: CreateLearningLabV2Input = {}): Promise<CreateLearningLabV2Result> {
  const sb = supabaseAdmin();
  const now = input.date ?? new Date();
  const keyDate = dateKey(now);
  const sources = await buildDiscordContentSourceRegistry(sb, {
    limit: input.maxSources ?? 6,
    sourceIds: input.sourceIds,
  });
  if (!sources.length) throw new Error('No approved Discord sources available for learning lab v2.');

  const prompt = buildLearningLabV2Prompt({ dateKey: keyDate, topic: input.topic, sources });
  const generation = await deepSeekChat({
    messages: [
      { role: 'system', content: sageBotLearningGeneratorSystemPrompt() },
      { role: 'user', content: prompt },
    ],
    temperature: 0.25,
    maxTokens: 1100,
    observability: {
      name: 'discord.learning_lab_v2.generate',
      metadata: {
        phase: 11,
        source_count: sources.length,
        prompt_version: DISCORD_LEARNING_LAB_V2_PROMPT_VERSION,
      },
    },
  });
  const generated = parseGeneratedLearningLabV2(generation.content);
  const quality = evaluateLearningLabV2(generated, { allowedSourceIds: sources.map((source) => source.id) });
  if (!quality.passed) {
    throw new Error(`Learning lab v2 failed quality gate: ${quality.reasons.join('; ') || `score ${quality.score}`}`);
  }

  const quizSources = selectedSources(sources, generated.quiz.source_ids);
  const challengeSources = selectedSources(sources, generated.challenge.source_ids);
  const topicPart = slugPart(input.topic ?? generated.challenge.title);
  const quizKey = `lab-v2-${keyDate}-${topicPart}-quiz`;
  const challengeKey = `lab-v2-${keyDate}-${topicPart}-challenge`;
  const baseMetadata = {
    phase: 11,
    source: DISCORD_LEARNING_LAB_V2_VERSION,
    prompt_version: DISCORD_LEARNING_LAB_V2_PROMPT_VERSION,
    personality_version: SAGEBOT_PERSONALITY_VERSION,
    upstream_prompt_versions: SAGEBOT_PROMPT_VERSIONS,
    generator_date: keyDate,
    topic: input.topic ?? null,
    quality_score: quality.score,
    quality_gates: quality.gates,
    model: generation.model,
    usage: generation.usage,
    ai_trace_id: generation.observability.traceId,
    ai_observation_id: generation.observability.observationId,
    ai_observability_provider: generation.observability.provider,
    ...(input.metadata ?? {}),
  };

  if (input.force) {
    await Promise.all([
      sb.from('discord_quizzes').delete().eq('quiz_key', quizKey),
      sb.from('discord_challenges').delete().eq('challenge_key', challengeKey),
    ]);
  }

  const [{ data: quizRow, error: quizError }, { data: challengeRow, error: challengeError }] = await Promise.all([
    sb.from('discord_quizzes').insert({
      quiz_key: quizKey,
      prompt: generated.quiz.prompt,
      options: generated.quiz.options,
      correct_answer: generated.quiz.correct_answer,
      explanation: generated.quiz.explanation,
      path_key: generated.quiz.path_key ?? null,
      difficulty: generated.quiz.difficulty,
      active: true,
      metadata: {
        ...baseMetadata,
        item_type: 'quiz',
        source_ids: quizSources.map((source) => source.sourceId),
        source_refs: quizSources,
        level_key: generated.quiz.level_key ?? null,
      },
    }).select('id').single(),
    sb.from('discord_challenges').insert({
      challenge_key: challengeKey,
      title: generated.challenge.title,
      prompt: [
        generated.challenge.objective,
        '',
        'Constraints:',
        ...generated.challenge.constraints.map((constraint) => `- ${constraint}`),
        '',
        'Rubric:',
        ...generated.challenge.rubric.map((rubric) => `- ${rubric}`),
      ].join('\n'),
      deliverable: generated.challenge.expected_artifact,
      points: generated.challenge.points,
      path_key: generated.challenge.path_key ?? null,
      difficulty: generated.challenge.difficulty,
      active: true,
      metadata: {
        ...baseMetadata,
        item_type: 'challenge',
        source_ids: challengeSources.map((source) => source.sourceId),
        source_refs: challengeSources,
        constraints: generated.challenge.constraints,
        rubric: generated.challenge.rubric,
        level_key: generated.challenge.level_key ?? null,
      },
    }).select('id').single(),
  ]);
  if (quizError) throw new Error(quizError.message);
  if (challengeError) throw new Error(challengeError.message);

  await recordDiscordEvent({
    eventType: 'learning_lab_v2_items_generated',
    commandName: 'learning_lab_v2',
    channelBaseName: 'daily-signal',
    metadata: {
      quiz_key: quizKey,
      challenge_key: challengeKey,
      quality_score: quality.score,
      source_ids: [...new Set([...quizSources, ...challengeSources].map((source) => source.sourceId))],
      prompt_version: DISCORD_LEARNING_LAB_V2_PROMPT_VERSION,
    },
  });

  return {
    ok: true,
    dateKey: keyDate,
    quizKey,
    challengeKey,
    quizId: String(quizRow.id),
    challengeId: String(challengeRow.id),
    qualityScore: quality.score,
    sourceIds: [...new Set([...quizSources, ...challengeSources].map((source) => source.sourceId))],
    model: generation.model,
    observability: generation.observability,
  };
}

export async function cleanupLearningLabV2Items(
  input: { quizKey: string; challengeKey: string },
  sb: SupabaseClient<any> = supabaseAdmin(),
): Promise<void> {
  await Promise.all([
    sb.from('discord_quizzes').delete().eq('quiz_key', input.quizKey),
    sb.from('discord_challenges').delete().eq('challenge_key', input.challengeKey),
  ]);
}
