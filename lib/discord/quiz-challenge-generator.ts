import { deepSeekChat } from '@/lib/rag/deepseek';
import { createDiscordContentDraft } from './content-approval';
import {
  SAGEBOT_PERSONALITY_VERSION,
  SAGEBOT_PROMPT_VERSIONS,
  sageBotLearningGeneratorSystemPrompt,
  scoreSageBotPolicyOutput,
} from './sagebot-personality';

export const DISCORD_QUIZ_GENERATOR_PROMPT_VERSION = SAGEBOT_PROMPT_VERSIONS.quizGenerator;
export const DISCORD_CHALLENGE_GENERATOR_PROMPT_VERSION = SAGEBOT_PROMPT_VERSIONS.challengeGenerator;
export const DISCORD_LEARNING_GENERATOR_PROMPT_VERSION = DISCORD_QUIZ_GENERATOR_PROMPT_VERSION;

export type GeneratedDiscordLearningItems = {
  quiz: {
    prompt: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    difficulty: string;
  };
  challenge: {
    title: string;
    prompt: string;
    deliverable: string;
    points: number;
  };
};

export type GenerateDiscordLearningInput = {
  theme: string;
  date?: Date;
  force?: boolean;
  metadata?: Record<string, unknown>;
};

export type GenerateDiscordLearningResult = {
  ok: boolean;
  dateKey: string;
  model: string;
  quizDraftId: string;
  challengeDraftId: string;
  quizPreview: string;
  challengePreview: string;
};

export function buildLearningGeneratorPrompt(input: { theme: string; dateKey: string }): string {
  return [
    'Generate one Discord education quiz and one build challenge for Sage Ideas Academy.',
    'Audience: builders learning AI apps, full-stack, websites, cloud, automation, SEO/content, and growth.',
    'Keep it practical, specific, and testable. No generic motivation.',
    'Model policy: do not recommend OpenAI, ChatGPT, or GPT models unless a seed explicitly requires it. Use DeepSeek or provider-neutral LLM language when a model is needed.',
    'Return strict JSON only with this shape:',
    '{"quiz":{"prompt":"...","options":["...","...","...","..."],"correct_answer":"...","explanation":"...","difficulty":"foundation|intermediate|advanced"},"challenge":{"title":"...","prompt":"...","deliverable":"...","points":15}}',
    `Date: ${input.dateKey}`,
    `Theme: ${input.theme}`,
  ].join('\n');
}

export function parseGeneratedLearningItems(raw: string): GeneratedDiscordLearningItems {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('DeepSeek did not return JSON.');
  const parsed = JSON.parse(raw.slice(start, end + 1));
  const quiz = parsed.quiz;
  const challenge = parsed.challenge;
  if (!quiz?.prompt || !Array.isArray(quiz.options) || quiz.options.length !== 4 || !quiz.correct_answer || !quiz.explanation) {
    throw new Error('Generated quiz is missing required fields.');
  }
  if (!challenge?.title || !challenge.prompt || !challenge.deliverable) {
    throw new Error('Generated challenge is missing required fields.');
  }
  return {
    quiz: {
      prompt: String(quiz.prompt).trim(),
      options: quiz.options.map((option: unknown) => String(option).trim()).filter(Boolean).slice(0, 4),
      correct_answer: String(quiz.correct_answer).trim(),
      explanation: String(quiz.explanation).trim(),
      difficulty: ['foundation', 'intermediate', 'advanced'].includes(String(quiz.difficulty)) ? String(quiz.difficulty) : 'foundation',
    },
    challenge: {
      title: String(challenge.title).trim(),
      prompt: String(challenge.prompt).trim(),
      deliverable: String(challenge.deliverable).trim(),
      points: Math.max(5, Math.min(50, Math.round(Number(challenge.points ?? 15)))),
    },
  };
}

export function scoreGeneratedLearningItems(items: GeneratedDiscordLearningItems): number {
  let score = 40;
  if (items.quiz.prompt.length >= 40) score += 10;
  if (items.quiz.options.length === 4 && items.quiz.options.includes(items.quiz.correct_answer)) score += 15;
  if (items.quiz.explanation.length >= 50) score += 10;
  if (items.challenge.prompt.length >= 60) score += 10;
  if (items.challenge.deliverable.length >= 30) score += 10;
  if (items.challenge.points >= 10 && items.challenge.points <= 30) score += 5;
  return Math.max(0, Math.min(100, score));
}

export async function generateDiscordLearningDrafts(input: GenerateDiscordLearningInput): Promise<GenerateDiscordLearningResult> {
  const date = input.date ?? new Date();
  const dateKey = date.toISOString().slice(0, 10);
  const generation = await deepSeekChat({
    messages: [
      { role: 'system', content: sageBotLearningGeneratorSystemPrompt() },
      { role: 'user', content: buildLearningGeneratorPrompt({ theme: input.theme, dateKey }) },
    ],
    temperature: 0.35,
    maxTokens: 900,
  });
  const items = parseGeneratedLearningItems(generation.content);
  const quizBody = [
    `**Quiz:** ${items.quiz.prompt}`,
    `Options: ${items.quiz.options.join(' / ')}`,
    `Answer: ${items.quiz.correct_answer}`,
    `Explanation: ${items.quiz.explanation}`,
  ].join('\n');
  const challengeBody = [
    `**Challenge:** ${items.challenge.title}`,
    items.challenge.prompt,
    '',
    `Deliverable: ${items.challenge.deliverable}`,
    `Points: ${items.challenge.points}`,
  ].join('\n');
  const structuralScore = scoreGeneratedLearningItems(items);
  const quizPolicyScore = scoreSageBotPolicyOutput(quizBody, { maxLength: 1400 });
  const challengePolicyScore = scoreSageBotPolicyOutput(challengeBody, { maxLength: 1400 });
  const quizQualityScore = Math.min(structuralScore, quizPolicyScore.score);
  const challengeQualityScore = Math.min(structuralScore, challengePolicyScore.score);
  const commonMetadata = {
    generator_date: dateKey,
    theme: input.theme,
    source: 'discord_learning_generator',
    usage: generation.usage,
    personality_version: SAGEBOT_PERSONALITY_VERSION,
    ...(input.metadata ?? {}),
  };
  const [quizDraft, challengeDraft] = await Promise.all([
    createDiscordContentDraft({
      draftType: 'quiz',
      targetChannelBaseName: 'daily-signal',
      title: `Quiz - ${dateKey} - ${input.theme}`,
      body: quizBody,
      model: generation.model,
      promptVersion: DISCORD_QUIZ_GENERATOR_PROMPT_VERSION,
      qualityScore: quizQualityScore,
      metadata: {
        ...commonMetadata,
        prompt_version: DISCORD_QUIZ_GENERATOR_PROMPT_VERSION,
        policy_score: quizPolicyScore.score,
        policy_passed: quizPolicyScore.passed,
        policy_reasons: quizPolicyScore.reasons,
        policy_flags: quizPolicyScore.flags,
        quiz: items.quiz,
      },
    }),
    createDiscordContentDraft({
      draftType: 'challenge',
      targetChannelBaseName: 'daily-signal',
      title: `Challenge - ${dateKey} - ${items.challenge.title}`,
      body: challengeBody,
      model: generation.model,
      promptVersion: DISCORD_CHALLENGE_GENERATOR_PROMPT_VERSION,
      qualityScore: challengeQualityScore,
      metadata: {
        ...commonMetadata,
        prompt_version: DISCORD_CHALLENGE_GENERATOR_PROMPT_VERSION,
        policy_score: challengePolicyScore.score,
        policy_passed: challengePolicyScore.passed,
        policy_reasons: challengePolicyScore.reasons,
        policy_flags: challengePolicyScore.flags,
        challenge: items.challenge,
      },
    }),
  ]);

  return {
    ok: true,
    dateKey,
    model: generation.model,
    quizDraftId: quizDraft.id,
    challengeDraftId: challengeDraft.id,
    quizPreview: items.quiz.prompt,
    challengePreview: items.challenge.title,
  };
}
