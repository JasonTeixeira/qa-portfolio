import { createHash } from 'node:crypto';

export type RagSourceType =
  | 'discord_message'
  | 'discord_question'
  | 'discord_answer'
  | 'discord_content_queue'
  | 'blog_post'
  | 'resource'
  | 'lesson'
  | 'admin_note'
  | 'uploaded_document';

export type RagSourceInput = {
  sourceType: RagSourceType;
  externalId: string;
  title?: string | null;
  body: string;
  sourceUrl?: string | null;
  sourceTable?: string | null;
  sourceRecordId?: string | null;
  authorUserId?: string | null;
  authorName?: string | null;
  channelId?: string | null;
  channelBaseName?: string | null;
  sourceCreatedAt?: string | null;
  qualityScore?: number | null;
  metadata?: Record<string, unknown>;
};

export type NormalizedRagSource = {
  source_key: string;
  source_type: RagSourceType;
  external_id: string;
  title: string | null;
  source_url: string | null;
  source_table: string | null;
  source_record_id: string | null;
  author_user_id: string | null;
  author_name: string | null;
  channel_id: string | null;
  channel_base_name: string | null;
  status: 'active' | 'ignored' | 'deleted';
  quality_score: number;
  content_hash: string;
  metadata: Record<string, unknown>;
  source_created_at: string | null;
  updated_at: string;
};

export type NormalizedRagDocument = {
  document_key: string;
  title: string | null;
  body: string;
  body_hash: string;
  language: 'en';
  token_estimate: number;
  status: 'pending';
  metadata: Record<string, unknown>;
  updated_at: string;
};

export type NormalizedRagRecord = {
  source: NormalizedRagSource;
  document: NormalizedRagDocument;
};

export function stableHash(value: string): string {
  return createHash('sha256').update(value.trim().replace(/\s+/g, ' '), 'utf8').digest('hex');
}

export function buildSourceKey(sourceType: RagSourceType, externalId: string): string {
  return `${sourceType}:${externalId.trim()}`;
}

export function normalizeRagText(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

export function estimateTokens(value: string): number {
  const normalized = normalizeRagText(value);
  if (!normalized) return 0;
  return Math.ceil(normalized.length / 4);
}

export function normalizeRagSource(input: RagSourceInput): NormalizedRagRecord | null {
  const body = normalizeRagText(input.body);
  if (!body) return null;
  const externalId = input.externalId.trim();
  if (!externalId) return null;
  const now = new Date().toISOString();
  const sourceKey = buildSourceKey(input.sourceType, externalId);
  const hash = stableHash(body);
  const qualityScore = Math.max(0, Math.min(100, Math.round(input.qualityScore ?? defaultQualityScore(input.sourceType))));

  return {
    source: {
      source_key: sourceKey,
      source_type: input.sourceType,
      external_id: externalId,
      title: nullableTrim(input.title),
      source_url: nullableTrim(input.sourceUrl),
      source_table: nullableTrim(input.sourceTable),
      source_record_id: nullableTrim(input.sourceRecordId),
      author_user_id: nullableTrim(input.authorUserId),
      author_name: nullableTrim(input.authorName),
      channel_id: nullableTrim(input.channelId),
      channel_base_name: nullableTrim(input.channelBaseName),
      status: 'active',
      quality_score: qualityScore,
      content_hash: hash,
      metadata: input.metadata ?? {},
      source_created_at: nullableTrim(input.sourceCreatedAt),
      updated_at: now,
    },
    document: {
      document_key: `doc:${sourceKey}`,
      title: nullableTrim(input.title),
      body,
      body_hash: hash,
      language: 'en',
      token_estimate: estimateTokens(body),
      status: 'pending',
      metadata: input.metadata ?? {},
      updated_at: now,
    },
  };
}

function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function defaultQualityScore(sourceType: RagSourceType): number {
  switch (sourceType) {
    case 'discord_answer':
      return 75;
    case 'blog_post':
    case 'resource':
    case 'lesson':
      return 85;
    case 'discord_question':
    case 'discord_content_queue':
      return 65;
    case 'discord_message':
      return 50;
    default:
      return 50;
  }
}
