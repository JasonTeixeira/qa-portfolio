import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import { isApprovedDiscordContentDraft } from '../../lib/rag/discord-authoritative-sources';

type SupabaseClient = ReturnType<typeof createClient<any>>;

type ReviewCandidate = {
  sourceTable: 'discord_content_queue' | 'discord_questions' | 'discord_answers' | 'discord_content_drafts';
  sourceRecordId: string;
  status: string | null;
  title: string;
  summary: string;
  channelBaseName: string | null;
  qualitySignal: number;
  createdAt: string | null;
  evidence: Record<string, unknown>;
  recommendedDecision: 'review_for_approval' | 'needs_more_context' | 'already_approved_candidate';
  approvalChecklist: string[];
};

const root = process.cwd();
const evidenceDir = path.join(root, 'docs', 'evidence', 'engineering-loop');
const jsonPath = path.join(evidenceDir, 'discord-knowledge-review-queue-latest.json');
const mdPath = path.join(evidenceDir, 'discord-knowledge-review-queue-latest.md');

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function snippet(value: unknown, max = 220): string {
  const normalized = text(value).replace(/\s+/g, ' ');
  return normalized.length > max ? `${normalized.slice(0, max - 1)}…` : normalized;
}

function checklist(sourceType: string): string[] {
  return [
    `Confirm this ${sourceType} is reusable for future members, not only the original thread.`,
    'Confirm private names, handles, screenshots, credentials, client names, and sensitive context are removed or permissioned.',
    'Add a decision reason, privacy status, reviewer, reviewed_at timestamp, and RAG-safe approved text.',
    'Reject if the source is generic, synthetic, low-context, moderation-sensitive, or unsupported.',
  ];
}

async function selectCandidates(
  label: string,
  run: () => PromiseLike<{ data: any[] | null; error: unknown }>,
): Promise<{ label: string; rows: any[]; error: string | null }> {
  try {
    const { data, error } = await run();
    if (error) return { label, rows: [], error: error instanceof Error ? error.message : String(error) };
    return { label, rows: data ?? [], error: null };
  } catch (error) {
    return { label, rows: [], error: error instanceof Error ? error.message : String(error) };
  }
}

async function readCandidateRows(sb: SupabaseClient) {
  return Promise.all([
    selectCandidates('discord_content_queue.reviewable', () => sb
      .from('discord_content_queue')
      .select('id, status, source, discord_username, channel_base_name, idea, angle, priority, source_message_id, source_classification_action, source_classification_category, metadata, created_at')
      .in('status', ['captured', 'triaged', 'candidate', 'pending_review', 'drafted'])
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(25)),
    selectCandidates('discord_questions.reusable', () => sb
      .from('discord_questions')
      .select('id, status, discord_username, channel_base_name, question, context, message_id, created_at')
      .in('status', ['answered', 'closed'])
      .order('created_at', { ascending: false })
      .limit(25)),
    selectCandidates('discord_answers.helpful', () => sb
      .from('discord_answers')
      .select('id, question_id, discord_username, answer, helpful, points_awarded, message_id, created_at')
      .eq('helpful', true)
      .order('created_at', { ascending: false })
      .limit(25)),
    selectCandidates('discord_content_drafts.pending_discord_provenance', () => sb
      .from('discord_content_drafts')
      .select('id, content_queue_id, source_message_id, draft_type, target_channel_base_name, title, body, status, quality_score, prompt_version, citations, metadata, created_at')
      .in('status', ['draft', 'pending_approval', 'approved'])
      .gte('quality_score', 80)
      .order('quality_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)),
  ]);
}

function mapContentQueue(row: any): ReviewCandidate {
  const action = text(row.source_classification_action, 'content_queue');
  return {
    sourceTable: 'discord_content_queue',
    sourceRecordId: String(row.id),
    status: row.status ? String(row.status) : null,
    title: snippet(row.idea, 90) || 'Untitled content queue item',
    summary: snippet(row.angle || row.idea),
    channelBaseName: row.channel_base_name ? String(row.channel_base_name) : null,
    qualitySignal: Number(row.priority ?? 0),
    createdAt: row.created_at ? String(row.created_at) : null,
    evidence: {
      source: row.source ?? null,
      source_message_id: row.source_message_id ?? null,
      source_classification_action: row.source_classification_action ?? null,
      source_classification_category: row.source_classification_category ?? null,
      metadata: row.metadata ?? {},
    },
    recommendedDecision: Number(row.priority ?? 0) >= 80 ? 'review_for_approval' : 'needs_more_context',
    approvalChecklist: checklist(action),
  };
}

function mapQuestion(row: any): ReviewCandidate {
  return {
    sourceTable: 'discord_questions',
    sourceRecordId: String(row.id),
    status: row.status ? String(row.status) : null,
    title: snippet(row.question, 90) || 'Untitled question',
    summary: snippet(row.context || row.question),
    channelBaseName: row.channel_base_name ? String(row.channel_base_name) : null,
    qualitySignal: row.context ? 80 : 65,
    createdAt: row.created_at ? String(row.created_at) : null,
    evidence: {
      message_id: row.message_id ?? null,
      discord_username_present: Boolean(row.discord_username),
    },
    recommendedDecision: row.context ? 'review_for_approval' : 'needs_more_context',
    approvalChecklist: checklist('question'),
  };
}

function mapAnswer(row: any): ReviewCandidate {
  return {
    sourceTable: 'discord_answers',
    sourceRecordId: String(row.id),
    status: row.helpful ? 'helpful' : null,
    title: snippet(row.answer, 90) || 'Untitled helpful answer',
    summary: snippet(row.answer),
    channelBaseName: null,
    qualitySignal: Math.min(100, 80 + Number(row.points_awarded ?? 0)),
    createdAt: row.created_at ? String(row.created_at) : null,
    evidence: {
      question_id: row.question_id ?? null,
      message_id: row.message_id ?? null,
      points_awarded: row.points_awarded ?? 0,
      discord_username_present: Boolean(row.discord_username),
    },
    recommendedDecision: 'review_for_approval',
    approvalChecklist: checklist('helpful answer'),
  };
}

function mapDraft(row: any): ReviewCandidate | null {
  if (!isApprovedDiscordContentDraft(row) && !row.content_queue_id && !row.source_message_id) return null;
  return {
    sourceTable: 'discord_content_drafts',
    sourceRecordId: String(row.id),
    status: row.status ? String(row.status) : null,
    title: snippet(row.title || row.body, 90) || 'Untitled content draft',
    summary: snippet(row.body),
    channelBaseName: row.target_channel_base_name ? String(row.target_channel_base_name) : null,
    qualitySignal: Number(row.quality_score ?? 0),
    createdAt: row.created_at ? String(row.created_at) : null,
    evidence: {
      content_queue_id: row.content_queue_id ?? null,
      source_message_id: row.source_message_id ?? null,
      draft_type: row.draft_type ?? null,
      prompt_version: row.prompt_version ?? null,
      citations_count: Array.isArray(row.citations) ? row.citations.length : 0,
      metadata: row.metadata ?? {},
    },
    recommendedDecision: row.status === 'approved' ? 'already_approved_candidate' : 'review_for_approval',
    approvalChecklist: checklist('source-linked draft'),
  };
}

function renderMarkdown(report: any): string {
  return [
    '# Discord Knowledge Review Queue',
    '',
    `Generated: ${report.generatedAt}`,
    `Mutation mode: ${report.mutationMode}`,
    `Reviewable candidates: ${report.summary.reviewableCandidateCount}`,
    `Approval shortfall: ${report.summary.approvedKnowledgeShortfall}`,
    '',
    report.releaseMeaning,
    '',
    '## Candidates',
    '',
    ...report.candidates.flatMap((candidate: ReviewCandidate, index: number) => [
      `### ${index + 1}. ${candidate.title}`,
      '',
      `- Source: ${candidate.sourceTable}:${candidate.sourceRecordId}`,
      `- Status: ${candidate.status ?? 'unknown'}`,
      `- Channel: ${candidate.channelBaseName ?? 'unknown'}`,
      `- Quality signal: ${candidate.qualitySignal}`,
      `- Recommended decision: ${candidate.recommendedDecision}`,
      `- Created: ${candidate.createdAt ?? 'unknown'}`,
      `- Summary: ${candidate.summary}`,
      '- Approval checklist:',
      ...candidate.approvalChecklist.map((item) => `  - ${item}`),
      '',
    ]),
    '## Errors',
    '',
    ...(report.errors.length ? report.errors.map((item: any) => `- ${item.label}: ${item.error}`) : ['- None']),
    '',
  ].join('\n');
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const candidateSources = await readCandidateRows(sb);
  const candidates = candidateSources.flatMap((source) => {
    if (source.label === 'discord_content_queue.reviewable') return source.rows.map(mapContentQueue);
    if (source.label === 'discord_questions.reusable') return source.rows.map(mapQuestion);
    if (source.label === 'discord_answers.helpful') return source.rows.map(mapAnswer);
    return source.rows.map(mapDraft).filter(Boolean) as ReviewCandidate[];
  }).sort((left, right) => right.qualitySignal - left.qualitySignal || String(right.createdAt).localeCompare(String(left.createdAt)));
  const uniqueCandidates = Array.from(
    new Map(candidates.map((candidate) => [`${candidate.sourceTable}:${candidate.sourceRecordId}`, candidate])).values(),
  ).slice(0, 25);
  const errors = candidateSources.filter((source) => source.error).map((source) => ({
    label: source.label,
    error: source.error,
  }));
  const reviewableCandidateCount = uniqueCandidates.filter((candidate) => candidate.recommendedDecision !== 'needs_more_context').length;
  const report = {
    ok: errors.length === 0,
    version: 'discord-knowledge-review-queue-v1',
    generatedAt: new Date().toISOString(),
    mutationMode: 'read_only_supabase_selects_and_local_file_evidence_only',
    releaseMeaning: 'This queue exports exact review candidates for the admin approval workflow. It does not approve records, sync RAG, publish content, assign roles, or mutate live services.',
    summary: {
      candidateCount: uniqueCandidates.length,
      reviewableCandidateCount,
      approvedKnowledgeTarget: 10,
      approvedKnowledgeShortfall: Math.max(0, 10 - reviewableCandidateCount),
      recommendedNextAction: reviewableCandidateCount > 0
        ? 'Open /admin/discord and approve only the reusable, privacy-safe candidates from this queue.'
        : 'Create more real source volume from member questions, answers, builds, reviews, wins, and resources.',
    },
    candidates: uniqueCandidates,
    errors,
  };

  await mkdir(evidenceDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(mdPath, renderMarkdown(report));
  console.log(JSON.stringify({
    ok: report.ok,
    candidateCount: report.summary.candidateCount,
    reviewableCandidateCount: report.summary.reviewableCandidateCount,
    approvedKnowledgeShortfall: report.summary.approvedKnowledgeShortfall,
    recommendedNextAction: report.summary.recommendedNextAction,
    evidencePath: path.relative(root, jsonPath),
    markdownPath: path.relative(root, mdPath),
    errors,
  }, null, 2));
  if (!report.ok) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
