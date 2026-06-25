import { supabaseAdmin } from '@/lib/supabase/server';

export type PublicProofDraftType = 'article' | 'linkedin' | 'x_thread' | 'newsletter' | 'resource_page';

export type PublicProofSourceInput = {
  sourceType: 'question' | 'answer' | 'content_queue' | 'win' | 'recap' | 'admin_note';
  sourceTable?: string | null;
  sourceRecordId?: string | null;
  title: string;
  summary: string;
  body: string;
  permissionStatus?: 'explicit' | 'anonymized' | 'blocked';
  metadata?: Record<string, unknown>;
};

export const PUBLIC_PROOF_MIN_PRIVACY_SCORE = 90;
export const PUBLIC_PROOF_MIN_QUALITY_SCORE = 80;

const PRIVATE_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  /\b(?:api[_-]?key|secret|token|password)\s*[:=]\s*['"]?[A-Za-z0-9_\-.]{10,}/i,
  /\bdiscord_user_id\b/i,
  /<@!?\d+>/,
];

export function scorePublicProofPrivacy(text: string): { passed: boolean; score: number; reasons: string[] } {
  const reasons: string[] = [];
  for (const pattern of PRIVATE_PATTERNS) {
    if (pattern.test(text)) reasons.push('private_identifier_or_secret');
  }
  if (/\bmy client\b|\btheir revenue\b|\bprivate repo\b/i.test(text)) reasons.push('potential_member_specific_private_context');
  const score = Math.max(0, 100 - new Set(reasons).size * 35);
  return {
    passed: score >= PUBLIC_PROOF_MIN_PRIVACY_SCORE && reasons.length === 0,
    score,
    reasons: [...new Set(reasons)],
  };
}

export function evaluatePublicGrowthDraft(input: {
  title: string;
  body: string;
  privacyScore: number;
}): { passed: boolean; score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 100;
  if (input.title.trim().length < 12) {
    reasons.push('title_too_short');
    score -= 20;
  }
  if (input.body.trim().length < 260) {
    reasons.push('body_too_short');
    score -= 30;
  }
  if (!/(approved community source|quality bar|apply|build|review|learning loop|proof)/i.test(input.body)) {
    reasons.push('missing_discord_growth_context');
    score -= 20;
  }
  if (input.privacyScore < PUBLIC_PROOF_MIN_PRIVACY_SCORE) {
    reasons.push('privacy_score_below_gate');
    score -= 40;
  }
  const normalized = Math.max(0, Math.min(100, score));
  return {
    passed: normalized >= PUBLIC_PROOF_MIN_QUALITY_SCORE && reasons.length === 0,
    score: normalized,
    reasons,
  };
}

export async function createPublicProofSource(input: PublicProofSourceInput): Promise<{ id: string; privacyScore: number }> {
  const combined = `${input.title}\n${input.summary}\n${input.body}`;
  const privacy = scorePublicProofPrivacy(combined);
  const permissionStatus = input.permissionStatus ?? (privacy.passed ? 'anonymized' : 'blocked');
  const { data, error } = await supabaseAdmin()
    .from('discord_public_proof_sources')
    .insert({
      source_type: input.sourceType,
      source_table: input.sourceTable ?? null,
      source_record_id: input.sourceRecordId ?? null,
      title: input.title.trim(),
      summary: input.summary.trim(),
      body: input.body.trim(),
      permission_status: permissionStatus,
      privacy_score: privacy.score,
      metadata: {
        ...(input.metadata ?? {}),
        privacy_reasons: privacy.reasons,
        public_proof_version: 'public_proof_v1',
      },
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return { id: String(data.id), privacyScore: privacy.score };
}

export function buildPublicGrowthDraft(input: {
  draftType: PublicProofDraftType;
  title: string;
  summary: string;
  body: string;
}): { title: string; body: string } {
  const title = `${input.title.trim()} - approved community proof`;
  const base = [
    `Source: approved community source.`,
    `What happened: ${input.summary.trim()}`,
    `Learning loop: a member question or build signal became a concrete lesson, review path, or resource instead of disappearing in chat.`,
    `Quality bar: no private member data, no vague AI dump, and every public asset must be approved before publishing.`,
    `Useful takeaway: ${input.body.trim()}`,
    `Apply when you want a Discord that teaches builders through real questions, build reviews, and weekly proof instead of noisy channels.`,
  ];
  if (input.draftType === 'linkedin') {
    return { title, body: base.join('\n\n') };
  }
  if (input.draftType === 'x_thread') {
    return {
      title,
      body: [
        '1/ Approved community source -> public lesson.',
        `2/ ${input.summary.trim()}`,
        '3/ The useful part is the loop: question, answer, review, resource, proof.',
        '4/ No private member data. No automatic publishing. Admin approval first.',
        '5/ Apply if you want a builder community with a real learning system.',
      ].join('\n\n'),
    };
  }
  if (input.draftType === 'newsletter') {
    return { title, body: [`This week inside Sage Ideas:`, ...base].join('\n\n') };
  }
  if (input.draftType === 'resource_page') {
    return { title, body: [`# ${title}`, ...base.map((line) => `- ${line}`)].join('\n') };
  }
  return { title, body: [`# ${title}`, ...base].join('\n\n') };
}

export async function createPublicGrowthDraft(input: {
  sourceId: string;
  draftType: PublicProofDraftType;
  title: string;
  summary: string;
  body: string;
  utmCampaign?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ id: string; privacyScore: number; qualityScore: number }> {
  const draft = buildPublicGrowthDraft(input);
  const privacy = scorePublicProofPrivacy(`${draft.title}\n${draft.body}`);
  const quality = evaluatePublicGrowthDraft({
    title: draft.title,
    body: draft.body,
    privacyScore: privacy.score,
  });
  if (!privacy.passed) throw new Error(`Public draft failed privacy gate: ${privacy.reasons.join(', ')}`);
  if (!quality.passed) throw new Error(`Public draft failed quality gate: ${quality.reasons.join(', ')}`);

  const { data, error } = await supabaseAdmin()
    .from('discord_public_growth_drafts')
    .insert({
      source_id: input.sourceId,
      draft_type: input.draftType,
      title: draft.title,
      body: draft.body,
      status: 'pending_approval',
      privacy_score: privacy.score,
      quality_score: quality.score,
      utm_campaign: input.utmCampaign ?? 'discord_public_proof',
      metadata: {
        ...(input.metadata ?? {}),
        privacy_reasons: privacy.reasons,
        quality_reasons: quality.reasons,
        public_proof_version: 'public_proof_v1',
      },
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return { id: String(data.id), privacyScore: privacy.score, qualityScore: quality.score };
}
