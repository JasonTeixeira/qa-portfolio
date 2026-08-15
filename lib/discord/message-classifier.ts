export const DISCORD_MESSAGE_CLASSIFIER_VERSION = 'discord-message-classifier-v1';

export type DiscordMessageCategory =
  | 'question'
  | 'answer'
  | 'project'
  | 'review_request'
  | 'win'
  | 'resource'
  | 'content_seed'
  | 'support'
  | 'spam'
  | 'general';

export type DiscordMessageRecommendedAction =
  | 'ignore'
  | 'track_question'
  | 'track_answer'
  | 'candidate_content'
  | 'candidate_resource'
  | 'candidate_review'
  | 'candidate_win'
  | 'needs_human_review';

export type DiscordMessageClassifierInput = {
  discordMessageId: string;
  channelBaseName?: string | null;
  authorBot?: boolean | null;
  content: string;
  detectedKind?: string | null;
  linkCount?: number | null;
  attachmentCount?: number | null;
  referencedMessageId?: string | null;
};

export type DiscordMessageClassification = {
  discord_message_id: string;
  category: DiscordMessageCategory;
  recommended_action: DiscordMessageRecommendedAction;
  confidence: number;
  quality_score: number;
  content_value_score: number;
  spam_score: number;
  signals: Record<string, boolean | number | string>;
  rationale: string;
  classifier_version: string;
  classified_at: string;
  updated_at: string;
};

const QUESTION_RE = /\?|^(how|what|why|when|where|can|could|should|would|is|are|do|does|did)\b/i;
const REVIEW_RE = /\b(review|feedback|critique|audit|roast|look at|check my|what do you think)\b/i;
const BUILD_RE = /\b(built|building|shipped|launched|repo|demo|prototype|project|app|site|agent|workflow|feature)\b/i;
const WIN_RE = /\b(win|shipped|launched|closed|finished|got accepted|first client|milestone|breakthrough)\b/i;
const RESOURCE_RE = /\b(resource|template|guide|docs|article|tutorial|tool|library|repo|checklist)\b/i;
const SUPPORT_RE = /\b(stuck|blocked|error|bug|issue|fails|broken|help|confused)\b/i;
const CONTENT_RE = /\b(content|post|newsletter|thread|video|lesson|clip|case study|writeup|breakdown)\b/i;
const SPAM_RE = /\b(free money|airdrop|crypto pump|guaranteed profit|dm me|click here|giveaway|nitro|forex)\b/i;

export function classifyDiscordMessage(input: DiscordMessageClassifierInput): DiscordMessageClassification {
  const content = input.content.trim();
  const wordCount = content ? content.split(/\s+/).length : 0;
  const linkCount = Math.max(0, Number(input.linkCount ?? 0));
  const attachmentCount = Math.max(0, Number(input.attachmentCount ?? 0));
  const signals = {
    author_bot: Boolean(input.authorBot),
    empty: content.length === 0,
    short: wordCount > 0 && wordCount < 4,
    has_question: QUESTION_RE.test(content),
    asks_for_review: REVIEW_RE.test(content),
    mentions_build: BUILD_RE.test(content),
    mentions_win: WIN_RE.test(content),
    shares_resource: RESOURCE_RE.test(content) || linkCount > 0,
    asks_for_support: SUPPORT_RE.test(content),
    content_opportunity: CONTENT_RE.test(content),
    has_link: linkCount > 0,
    has_attachment: attachmentCount > 0,
    reply: Boolean(input.referencedMessageId),
    spam_terms: SPAM_RE.test(content),
    word_count: wordCount,
  };

  const spamScore = clampScore(
    (signals.spam_terms ? 70 : 0)
    + (signals.author_bot ? 25 : 0)
    + (signals.short && signals.has_link ? 30 : 0)
    + (linkCount >= 3 ? 30 : 0),
  );

  let category: DiscordMessageCategory = 'general';
  if (signals.author_bot || signals.empty) category = 'general';
  else if (spamScore >= 70) category = 'spam';
  else if (input.detectedKind === 'review' || signals.asks_for_review) category = 'review_request';
  else if (input.detectedKind === 'question' || signals.has_question || signals.asks_for_support) category = 'question';
  else if (input.detectedKind === 'answer' || signals.reply) category = 'answer';
  else if (input.detectedKind === 'win' || signals.mentions_win) category = 'win';
  else if (input.detectedKind === 'resource' || signals.shares_resource) category = 'resource';
  else if (input.detectedKind === 'project' || signals.mentions_build) category = 'project';
  else if (signals.content_opportunity) category = 'content_seed';

  const qualityScore = clampScore(
    (wordCount >= 12 ? 30 : wordCount >= 6 ? 15 : 0)
    + (signals.has_question ? 15 : 0)
    + (signals.mentions_build ? 15 : 0)
    + (signals.asks_for_review ? 15 : 0)
    + (signals.shares_resource ? 10 : 0)
    + (signals.has_attachment ? 10 : 0)
    + (signals.content_opportunity ? 10 : 0)
    - (signals.author_bot ? 35 : 0)
    - (signals.short ? 15 : 0)
    - Math.round(spamScore * 0.5),
  );
  const contentValueScore = clampScore(
    qualityScore
    + (['question', 'answer', 'review_request', 'project', 'win', 'resource', 'content_seed'].includes(category) ? 20 : 0)
    + (signals.content_opportunity ? 15 : 0)
    - (category === 'spam' ? 80 : 0),
  );
  const recommendedAction = recommendedActionFor(category, qualityScore, contentValueScore, spamScore);
  const confidence = confidenceFor(category, signals, qualityScore, spamScore);
  const now = new Date().toISOString();

  return {
    discord_message_id: input.discordMessageId,
    category,
    recommended_action: recommendedAction,
    confidence,
    quality_score: qualityScore,
    content_value_score: contentValueScore,
    spam_score: spamScore,
    signals,
    rationale: rationaleFor(category, recommendedAction, signals),
    classifier_version: DISCORD_MESSAGE_CLASSIFIER_VERSION,
    classified_at: now,
    updated_at: now,
  };
}

function recommendedActionFor(
  category: DiscordMessageCategory,
  qualityScore: number,
  contentValueScore: number,
  spamScore: number,
): DiscordMessageRecommendedAction {
  if (spamScore >= 70) return 'needs_human_review';
  if (category === 'question') return qualityScore >= 25 ? 'track_question' : 'ignore';
  if (category === 'answer') return qualityScore >= 25 ? 'track_answer' : 'ignore';
  if (category === 'review_request') return 'candidate_review';
  if (category === 'win') return 'candidate_win';
  if (category === 'resource') return qualityScore >= 20 ? 'candidate_resource' : 'ignore';
  if (category === 'project' || category === 'content_seed') return contentValueScore >= 45 ? 'candidate_content' : 'ignore';
  return contentValueScore >= 60 ? 'candidate_content' : 'ignore';
}

function confidenceFor(
  category: DiscordMessageCategory,
  signals: Record<string, boolean | number | string>,
  qualityScore: number,
  spamScore: number,
): number {
  if (signals.author_bot || signals.empty) return 0.95;
  if (category === 'spam' || spamScore >= 70) return 0.85;
  const signalCount = Object.entries(signals).filter(([, value]) => value === true).length;
  return Number(Math.min(0.95, Math.max(0.35, 0.4 + signalCount * 0.06 + qualityScore / 300)).toFixed(4));
}

function rationaleFor(
  category: DiscordMessageCategory,
  action: DiscordMessageRecommendedAction,
  signals: Record<string, boolean | number | string>,
): string {
  const reasons = Object.entries(signals)
    .filter(([, value]) => value === true)
    .map(([key]) => key.replace(/_/g, ' '))
    .slice(0, 4);
  return `${category} -> ${action}${reasons.length ? ` because ${reasons.join(', ')}` : ''}`;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
