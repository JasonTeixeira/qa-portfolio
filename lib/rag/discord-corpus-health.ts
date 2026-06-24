import {
  isApprovedDiscordAnswer,
  isApprovedDiscordContentDraft,
  isApprovedDiscordContentQueue,
  isApprovedDiscordQuestion,
  sourceTypeForApprovedDiscordDraft,
} from './discord-authoritative-sources';

export type DiscordCorpusKind = 'question' | 'answer' | 'content_queue' | 'content_draft';
export type DiscordCorpusState = 'synced' | 'eligible' | 'blocked' | 'stale';

export type DiscordCorpusItem = {
  kind: DiscordCorpusKind;
  id: string;
  title: string;
  body: string;
  authorName?: string | null;
  status?: string | null;
  qualityScore?: number | null;
  helpful?: boolean | null;
  draftType?: string | null;
  createdAt: string;
  sourceKey: string;
  approved: boolean;
  synced: boolean;
  state: DiscordCorpusState;
  blocker: string | null;
};

export type DiscordCorpusHealthSummary = {
  totalCandidates: number;
  authoritativeSources: number;
  synced: number;
  eligible: number;
  blocked: number;
  stale: number;
  missing: number;
  healthScore: number;
};

type SourceKeySet = Set<string>;

const STALE_MS = 24 * 60 * 60 * 1000;

export function buildDiscordCorpusQuestionItem(row: {
  id: string;
  question: string;
  context?: string | null;
  discord_username?: string | null;
  status?: string | null;
  created_at: string;
}, sourceKeys: SourceKeySet, now = new Date()): DiscordCorpusItem {
  const sourceKey = `discord_question:${row.id}`;
  const approved = isApprovedDiscordQuestion(row);
  return finalizeCorpusItem({
    kind: 'question',
    id: row.id,
    title: row.question,
    body: [row.question, row.context].filter(Boolean).join('\n\n'),
    authorName: row.discord_username,
    status: row.status,
    createdAt: row.created_at,
    sourceKey,
    approved,
    synced: sourceKeys.has(sourceKey),
    blocker: approved ? null : 'Question must be answered or closed before it becomes authoritative RAG.',
  }, now);
}

export function buildDiscordCorpusAnswerItem(row: {
  id: string;
  answer: string;
  discord_username?: string | null;
  helpful?: boolean | null;
  created_at: string;
}, sourceKeys: SourceKeySet, now = new Date()): DiscordCorpusItem {
  const sourceKey = `discord_answer:${row.id}`;
  const approved = isApprovedDiscordAnswer(row);
  return finalizeCorpusItem({
    kind: 'answer',
    id: row.id,
    title: row.answer,
    body: row.answer,
    authorName: row.discord_username,
    helpful: row.helpful,
    createdAt: row.created_at,
    sourceKey,
    approved,
    synced: sourceKeys.has(sourceKey),
    blocker: approved ? null : 'Answer must be marked helpful before it becomes authoritative RAG.',
  }, now);
}

export function buildDiscordCorpusQueueItem(row: {
  id: string;
  idea: string;
  angle?: string | null;
  discord_username?: string | null;
  status?: string | null;
  priority?: number | null;
  created_at: string;
}, sourceKeys: SourceKeySet, now = new Date()): DiscordCorpusItem {
  const sourceKey = `discord_content_queue:${row.id}`;
  const approved = isApprovedDiscordContentQueue(row);
  return finalizeCorpusItem({
    kind: 'content_queue',
    id: row.id,
    title: row.idea,
    body: [row.idea, row.angle].filter(Boolean).join('\n\n'),
    authorName: row.discord_username,
    status: row.status,
    qualityScore: row.priority,
    createdAt: row.created_at,
    sourceKey,
    approved,
    synced: sourceKeys.has(sourceKey),
    blocker: approved ? null : 'Content queue item must be published before it becomes authoritative RAG.',
  }, now);
}

export function buildDiscordCorpusDraftItem(row: {
  id: string;
  draft_type?: string | null;
  title?: string | null;
  body: string;
  status?: string | null;
  quality_score?: number | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}, sourceKeys: SourceKeySet, now = new Date()): DiscordCorpusItem {
  const sourceType = sourceTypeForApprovedDiscordDraft(row.draft_type);
  const sourceKey = `${sourceType}:discord_content_draft:${row.id}`;
  const approved = isApprovedDiscordContentDraft(row);
  return finalizeCorpusItem({
    kind: 'content_draft',
    id: row.id,
    title: row.title ?? row.body,
    body: row.body,
    status: row.status,
    qualityScore: row.quality_score,
    draftType: row.draft_type,
    createdAt: row.created_at,
    sourceKey,
    approved,
    synced: sourceKeys.has(sourceKey),
    blocker: approved ? null : draftBlocker(row),
  }, now);
}

export function summarizeDiscordCorpusHealth(items: DiscordCorpusItem[], authoritativeSources: number): DiscordCorpusHealthSummary {
  const synced = items.filter((item) => item.state === 'synced').length;
  const eligible = items.filter((item) => item.state === 'eligible').length;
  const blocked = items.filter((item) => item.state === 'blocked').length;
  const stale = items.filter((item) => item.state === 'stale').length;
  const missing = items.filter((item) => item.approved && !item.synced).length;
  const actionable = eligible + stale;
  let healthScore = 100;
  if (authoritativeSources === 0) healthScore -= 30;
  healthScore -= Math.min(35, stale * 10);
  healthScore -= Math.min(25, actionable * 5);
  healthScore -= Math.min(15, blocked * 2);
  return {
    totalCandidates: items.length,
    authoritativeSources,
    synced,
    eligible,
    blocked,
    stale,
    missing,
    healthScore: Math.max(0, Math.min(100, healthScore)),
  };
}

function finalizeCorpusItem(item: Omit<DiscordCorpusItem, 'state'>, now: Date): DiscordCorpusItem {
  const ageMs = now.getTime() - new Date(item.createdAt).getTime();
  const state: DiscordCorpusState = item.synced
    ? 'synced'
    : item.approved && ageMs > STALE_MS
      ? 'stale'
      : item.approved
        ? 'eligible'
        : 'blocked';
  return { ...item, state };
}

function draftBlocker(row: { status?: string | null; quality_score?: number | null; metadata?: Record<string, unknown> | null }) {
  if (!['approved', 'published'].includes(String(row.status ?? '').toLowerCase())) {
    return 'Draft must be approved or published before it becomes authoritative RAG.';
  }
  if (Number(row.quality_score ?? 0) < 80) return 'Draft quality score must be at least 80.';
  if (row.metadata?.policy_passed === false) return 'Draft failed the SageBot policy gate.';
  return 'Draft is not eligible for authoritative RAG.';
}
