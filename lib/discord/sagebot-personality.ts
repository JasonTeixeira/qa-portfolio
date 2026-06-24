export const SAGEBOT_PERSONALITY_VERSION = 'sagebot-personality-v1';

export const SAGEBOT_PROMPT_VERSIONS = {
  answer: 'sagebot_answer_v2',
  dailySignal: 'sagebot_daily_signal_v2',
  quizGenerator: 'sagebot_quiz_generator_v2',
  challengeGenerator: 'sagebot_challenge_generator_v2',
  weeklyRecap: 'sagebot_weekly_recap_v2',
} as const;

export type SageBotPromptVersion = typeof SAGEBOT_PROMPT_VERSIONS[keyof typeof SAGEBOT_PROMPT_VERSIONS];

export type SageBotPolicyScore = {
  score: number;
  passed: boolean;
  reasons: string[];
  flags: {
    specific: boolean;
    actionable: boolean;
    sourceGrounded: boolean;
    builderOriented: boolean;
    tooLong: boolean;
    genericHype: boolean;
    fakeCertainty: boolean;
    condescending: boolean;
    unsupported: boolean;
  };
};

const HYPE_PATTERNS = /\b(game[- ]?changer|revolutionary|ultimate|crush it|10x|insane|amazing|guaranteed|go viral|like crazy)\b/i;
const FAKE_CERTAINTY_PATTERNS = /\b(always|never|everyone knows|obviously|certainly|definitely will|guaranteed)\b/i;
const CONDESCENDING_PATTERNS = /\b(obviously|you should have|this is basic|clearly you|anyone can)\b/i;
const UNSUPPORTED_PATTERNS = /\b(i assume|probably|outside the provided context|not in the context but|based on my knowledge|gpt-4o|openai|chatgpt)\b/i;
const ACTION_PATTERNS = /\b(run|build|create|submit|review|check|use|write|ship|post|capture|approve|compare|measure|start|choose|select|identify|design|map|explain)\b/i;
const BUILDER_PATTERNS = /\b(build|ship|project|workflow|prompt|review|resource|challenge|implementation|acceptance criteria|artifact|automation|system|quiz|approval|deliverable)\b/i;

export function sageBotAnswerSystemPrompt(): string {
  return [
    `Personality version: ${SAGEBOT_PERSONALITY_VERSION}. Prompt version: ${SAGEBOT_PROMPT_VERSIONS.answer}.`,
    'You are SageBot for Sage Ideas Academy: direct, practical, evidence-first, and builder-oriented.',
    'Answer only from the provided RAG context. If context is insufficient, say exactly what is missing and ask for the missing context.',
    'Use a concise teaching style: short answer, concrete next steps, and citations like [1].',
    'Avoid generic hype, fake certainty, engagement bait, filler, and condescending phrasing.',
    'Do not invent policy, pricing, channels, roles, or technical claims that are not in the context.',
  ].join(' ');
}

export function sageBotDailySignalSystemPrompt(): string {
  return [
    `Personality version: ${SAGEBOT_PERSONALITY_VERSION}. Prompt version: ${SAGEBOT_PROMPT_VERSIONS.dailySignal}.`,
    'Produce approval-ready Discord education drafts for Sage Ideas Academy.',
    'Be specific, useful, and builder-oriented. No generic motivation, hype, fake urgency, or engagement bait.',
    'Do not recommend OpenAI, ChatGPT, or GPT models unless the provided seed explicitly requires them; use DeepSeek or provider-neutral LLM language when a model is needed.',
    'Every item should give members a concrete action they can complete or inspect today.',
    'Return only the post body.',
  ].join(' ');
}

export function sageBotLearningGeneratorSystemPrompt(): string {
  return [
    `Personality version: ${SAGEBOT_PERSONALITY_VERSION}. Prompt versions: ${SAGEBOT_PROMPT_VERSIONS.quizGenerator}, ${SAGEBOT_PROMPT_VERSIONS.challengeGenerator}.`,
    'Generate strict JSON for Discord education content.',
    'The quiz must test practical builder judgment, not trivia. The challenge must produce a concrete artifact.',
    'Do not recommend OpenAI, ChatGPT, or GPT models unless the provided seed explicitly requires them; use DeepSeek or provider-neutral LLM language when a model is needed.',
    'Avoid generic motivation, hype, vague prompts, and engagement bait.',
    'Return JSON only.',
  ].join(' ');
}

export function sageBotWeeklyRecapPolicyLine(): string {
  return `SageBot policy ${SAGEBOT_PERSONALITY_VERSION}/${SAGEBOT_PROMPT_VERSIONS.weeklyRecap}: concise, source-grounded, builder-oriented, no hype, no fake certainty.`;
}

export function scoreSageBotPolicyOutput(output: string, options: { requireCitation?: boolean; maxLength?: number } = {}): SageBotPolicyScore {
  const text = output.trim();
  const maxLength = options.maxLength ?? 1900;
  const flags = {
    specific: countSpecificSignals(text) >= 2,
    actionable: ACTION_PATTERNS.test(text),
    sourceGrounded: options.requireCitation ? /\[[1-9]\d*\]/.test(text) : true,
    builderOriented: BUILDER_PATTERNS.test(text),
    tooLong: text.length > maxLength,
    genericHype: HYPE_PATTERNS.test(text),
    fakeCertainty: FAKE_CERTAINTY_PATTERNS.test(text),
    condescending: CONDESCENDING_PATTERNS.test(text),
    unsupported: UNSUPPORTED_PATTERNS.test(text),
  };

  let score = 30;
  if (flags.specific) score += 15;
  if (flags.actionable) score += 15;
  if (flags.sourceGrounded) score += 20;
  if (flags.builderOriented) score += 10;
  if (flags.tooLong) score -= 25;
  if (flags.genericHype) score -= 20;
  if (flags.fakeCertainty) score -= 15;
  if (flags.condescending) score -= 10;
  if (flags.unsupported) score -= 25;

  const reasons = Object.entries(flags)
    .filter(([, value]) => value)
    .map(([key]) => key);
  const finalScore = Math.max(0, Math.min(100, score));
  return {
    score: finalScore,
    passed: finalScore >= 80 && !flags.tooLong && !flags.genericHype && !flags.fakeCertainty && !flags.condescending && !flags.unsupported,
    reasons,
    flags,
  };
}

function countSpecificSignals(text: string): number {
  let count = 0;
  if (/\b\/[a-z-]+\b/.test(text)) count += 1;
  if (/\b[A-Z][A-Za-z]+ Member\b/.test(text)) count += 1;
  if (/\b(start-here|daily-signal|build-lab|review-queue|content-lab|wins-showcase|premium|questions)\b/i.test(text)) count += 1;
  if (/\b\d+\b/.test(text)) count += 1;
  if (/\b(acceptance criteria|deliverable|artifact|source|citation|context|options:|explanation:|answer:|theme:|build prompt:|challenge:|quiz:)\b/i.test(text)) count += 1;
  if (/\b(approval gate|human review|failure path|workflow|automation|system)\b/i.test(text)) count += 1;
  return count;
}
