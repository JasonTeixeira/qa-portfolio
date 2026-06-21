export type ClassifiedDiscordMessageForQueue = {
  discord_message_id: string;
  channel_base_name: string | null;
  author_user_id: string | null;
  author_username: string | null;
  content: string;
  category: string;
  recommended_action: string;
  confidence: number;
  quality_score: number;
  content_value_score: number;
  signals: Record<string, unknown>;
  rationale: string;
};

export type ContentQueueCandidate = {
  source: string;
  source_message_id: string;
  source_classification_action: string;
  source_classification_category: string;
  discord_user_id: string | null;
  discord_username: string | null;
  channel_base_name: string | null;
  idea: string;
  angle: string;
  status: 'captured';
  priority: number;
  metadata: Record<string, unknown>;
};

const queueableActions = new Set([
  'track_question',
  'track_answer',
  'candidate_content',
  'candidate_resource',
  'candidate_review',
  'candidate_win',
]);

export function buildContentQueueCandidate(input: ClassifiedDiscordMessageForQueue): ContentQueueCandidate | null {
  if (!queueableActions.has(input.recommended_action)) return null;
  if (!input.content.trim()) return null;
  const priority = Math.max(1, Math.min(100, Math.round(
    input.content_value_score * 0.7 + input.quality_score * 0.2 + input.confidence * 10,
  )));

  return {
    source: 'discord_message_classifier',
    source_message_id: input.discord_message_id,
    source_classification_action: input.recommended_action,
    source_classification_category: input.category,
    discord_user_id: input.author_user_id,
    discord_username: input.author_username,
    channel_base_name: input.channel_base_name,
    idea: buildIdea(input),
    angle: buildAngle(input),
    status: 'captured',
    priority,
    metadata: {
      classifier_action: input.recommended_action,
      classifier_category: input.category,
      confidence: input.confidence,
      quality_score: input.quality_score,
      content_value_score: input.content_value_score,
      rationale: input.rationale,
      signals: input.signals,
      source_content_preview: input.content.slice(0, 500),
    },
  };
}

function buildIdea(input: ClassifiedDiscordMessageForQueue): string {
  const clean = input.content.replace(/\s+/g, ' ').trim();
  if (input.recommended_action === 'track_question') return `Answer this member question: ${clean}`;
  if (input.recommended_action === 'track_answer') return `Turn this member answer into a reusable lesson: ${clean}`;
  if (input.recommended_action === 'candidate_review') return `Create a review/critique asset from this request: ${clean}`;
  if (input.recommended_action === 'candidate_resource') return `Turn this shared resource into a resource drop: ${clean}`;
  if (input.recommended_action === 'candidate_win') return `Turn this member win into proof/story content: ${clean}`;
  return `Turn this Discord moment into education content: ${clean}`;
}

function buildAngle(input: ClassifiedDiscordMessageForQueue): string {
  switch (input.recommended_action) {
    case 'track_question':
      return 'Question-driven teaching asset: answer publicly, capture the resource gap, and consider a daily prompt.';
    case 'track_answer':
      return 'Community answer reuse: extract the principle, caveat, and example.';
    case 'candidate_review':
      return 'Critique workflow: turn the review into a before/after lesson and checklist.';
    case 'candidate_resource':
      return 'Resource drop: explain when to use it, who it helps, and one practical next step.';
    case 'candidate_win':
      return 'Member proof: summarize the win, what changed, and what others can copy.';
    default:
      return 'Content seed: turn into one useful post, one Discord prompt, and one resource gap.';
  }
}
