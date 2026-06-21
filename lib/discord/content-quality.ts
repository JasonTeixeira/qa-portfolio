import { supabaseAdmin } from '@/lib/supabase/server';

export const DISCORD_CONTENT_QUALITY_EVALUATOR_VERSION = 'discord-content-quality-v1';

export type DiscordContentQualityDraft = {
  id: string;
  draft_type: string;
  title?: string | null;
  body: string;
  target_channel_base_name?: string | null;
};

export type DiscordContentQualityEvaluation = {
  score: number;
  passed: boolean;
  gates: Array<{ key: string; passed: boolean; points: number; reason: string }>;
  reasons: string[];
};

const BANNED = [
  "in today's rapidly evolving landscape",
  'game-changer',
  'revolutionary',
  'cutting-edge',
  'engagement bait',
];

export function evaluateDiscordContentDraft(draft: DiscordContentQualityDraft): DiscordContentQualityEvaluation {
  const body = draft.body.trim();
  const lower = body.toLowerCase();
  const gates = [
    gate('non_empty', body.length >= 80, 15, 'Draft has enough substance to review.'),
    gate('bounded_length', body.length <= 2200, 15, 'Draft fits Discord without becoming a wall of text.'),
    gate('specific_action', /(deliverable|next action|build prompt|challenge|question|answer|options:)/i.test(body), 20, 'Draft includes a concrete action or learning object.'),
    gate('structured', /(^#|\*\*.+:\*\*|- |\d+\.)/m.test(body), 15, 'Draft is structured for scanning.'),
    gate('no_hype_bans', !BANNED.some((phrase) => lower.includes(phrase)), 20, 'Draft avoids banned hype/filler language.'),
    gate('channel_fit', Boolean(draft.target_channel_base_name), 5, 'Draft has a target channel.'),
    gate('type_fit', Boolean(draft.draft_type), 10, 'Draft has a content type.'),
  ];
  const score = gates.reduce((total, item) => total + (item.passed ? item.points : 0), 0);
  const reasons = gates.filter((item) => !item.passed).map((item) => item.reason);
  return {
    score,
    passed: score >= 80 && reasons.length === 0,
    gates,
    reasons,
  };
}

export async function evaluateAndPersistDiscordContentDraft(draftId: string): Promise<DiscordContentQualityEvaluation & { evaluationId: string }> {
  const sb = supabaseAdmin();
  const { data: draft, error } = await sb
    .from('discord_content_drafts')
    .select('id, draft_type, title, body, target_channel_base_name')
    .eq('id', draftId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!draft) throw new Error('Content draft not found.');

  const evaluation = evaluateDiscordContentDraft(draft as DiscordContentQualityDraft);
  const { data, error: insertError } = await sb
    .from('discord_content_draft_evaluations')
    .insert({
      draft_id: draftId,
      evaluator_version: DISCORD_CONTENT_QUALITY_EVALUATOR_VERSION,
      score: evaluation.score,
      passed: evaluation.passed,
      gates: evaluation.gates,
      reasons: evaluation.reasons,
      metadata: {},
    })
    .select('id')
    .single();
  if (insertError) throw new Error(insertError.message);

  await sb
    .from('discord_content_drafts')
    .update({ quality_score: evaluation.score, updated_at: new Date().toISOString() })
    .eq('id', draftId);

  return { ...evaluation, evaluationId: String(data.id) };
}

export async function latestPassingContentDraftEvaluation(draftId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin()
    .from('discord_content_draft_evaluations')
    .select('passed')
    .eq('draft_id', draftId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data?.passed);
}

function gate(key: string, passed: boolean, points: number, reason: string) {
  return { key, passed, points, reason };
}
