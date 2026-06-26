import type { SupabaseClient } from '@supabase/supabase-js';
import { createPublicGrowthDraft, createPublicProofSource, type PublicProofDraftType } from './public-proof';
import { runApprovedDiscordRagSourceSync } from '@/lib/rag/discord-source-sync';
import {
  buildOperatingCycleKey,
  operatingCycleGates,
  operatingCycleNextActions,
  operatingCycleStatus,
  type OperatingCycleMetrics,
} from './operating-proof-cycle-rules';

type SupabaseAny = SupabaseClient<any>;

export type OperatingCyclePublicProofResult = {
  created: boolean;
  sourceId: string | null;
  draftId: string | null;
  sourceTable: string | null;
  sourceRecordId: string | null;
  draftType: PublicProofDraftType | null;
  reusedExistingSource: boolean;
  blocker: string | null;
};

export type DiscordOperatingProofCycleResult = {
  ok: boolean;
  status: 'passed' | 'blocked';
  cycleKey: string;
  startedAt: string;
  finishedAt: string;
  metricsBefore: OperatingCycleMetrics;
  metricsAfter: OperatingCycleMetrics;
  ragSync: Awaited<ReturnType<typeof runApprovedDiscordRagSourceSync>>;
  publicProof: OperatingCyclePublicProofResult;
  finalScorecard: {
    averageScore: number | null;
    blockedBelow95: string[];
    latestRunKey: string | null;
  };
  gates: ReturnType<typeof operatingCycleGates>;
  nextActions: string[];
  auditRowId: string | null;
};

export async function runDiscordOperatingProofCycle(
  sb: SupabaseAny,
  options: {
    cycleDate?: Date;
    draftType?: PublicProofDraftType;
    dryRun?: boolean;
    finalScorecardOverride?: DiscordOperatingProofCycleResult['finalScorecard'];
    now?: Date;
  } = {},
): Promise<DiscordOperatingProofCycleResult> {
  const now = options.now ?? new Date();
  const startedAt = now.toISOString();
  const cycleKey = buildOperatingCycleKey(options.cycleDate ?? now);
  const metricsBefore = await loadOperatingCycleMetrics(sb, now);
  const ragSync = options.dryRun
    ? dryRunRagSync()
    : await runApprovedDiscordRagSourceSync(sb, { trigger: `operating_cycle:${cycleKey}` });
  const publicProof = options.dryRun
    ? dryRunPublicProof()
    : await createWeeklyPublicProofDraft(sb, {
      cycleKey,
      draftType: options.draftType ?? 'newsletter',
    });
  const metricsAfter = await loadOperatingCycleMetrics(sb, now);
  const finalScorecard = options.finalScorecardOverride ?? await loadLatestFinalScorecard(sb);
  const gates = operatingCycleGates({
    metrics: metricsAfter,
    ragSyncOk: ragSync.ok,
    publicDraftCreated: publicProof.created,
    finalScorecardAverage: finalScorecard.averageScore,
    finalScorecardBlockedBelow95: finalScorecard.blockedBelow95,
  });
  const status = operatingCycleStatus(gates);
  const nextActions = operatingCycleNextActions(gates);
  const finishedAt = new Date().toISOString();
  let auditRowId: string | null = null;

  if (!options.dryRun) {
    const { data, error } = await sb.from('discord_operating_cycles').insert({
      cycle_key: cycleKey,
      status,
      metrics_before: metricsBefore,
      metrics_after: metricsAfter,
      rag_sync: ragSync,
      public_proof: publicProof,
      final_scorecard: finalScorecard,
      gates,
      next_actions: nextActions,
      started_at: startedAt,
      finished_at: finishedAt,
    }).select('id').single();
    if (error) throw error;
    auditRowId = String(data.id);
  }

  return {
    ok: status === 'passed',
    status,
    cycleKey,
    startedAt,
    finishedAt,
    metricsBefore,
    metricsAfter,
    ragSync,
    publicProof,
    finalScorecard,
    gates,
    nextActions,
    auditRowId,
  };
}

async function loadOperatingCycleMetrics(sb: SupabaseAny, now = new Date()): Promise<OperatingCycleMetrics> {
  const since7d = new Date(now.getTime() - 7 * 86_400_000).toISOString();
  const [
    members,
    onboarded,
    activeMembers,
    premiumMembers,
    premiumReviewsProof,
    officeHoursProof,
    applicationsSubmitted,
    applicationsApproved,
    questionsApproved,
    answersApproved,
    contentQueuePublished,
    draftsApproved,
    ragDiscordSources,
    pendingKnowledgeCandidates,
    pendingPublicDrafts,
    publishedPublicDrafts,
  ] = await Promise.all([
    countRows(sb, 'discord_members', 'academy_member', true),
    countNotNull(sb, 'discord_members', 'onboarding_completed_at'),
    countGte(sb, 'discord_members', 'last_seen_at', since7d),
    countRows(sb, 'discord_members', 'premium_member', true),
    countIn(sb, 'discord_premium_review_requests', 'status', ['answered', 'completed']),
    countIn(sb, 'discord_office_hours_queue', 'status', ['completed']),
    countAll(sb, 'discord_member_applications'),
    countRows(sb, 'discord_member_applications', 'status', 'approved'),
    countIn(sb, 'discord_questions', 'status', ['answered', 'closed']),
    countRows(sb, 'discord_answers', 'helpful', true),
    countRows(sb, 'discord_content_queue', 'status', 'published'),
    countIn(sb, 'discord_content_drafts', 'status', ['approved', 'published']),
    countOr(sb, 'rag_sources', 'source_type.in.(discord_question,discord_answer,discord_content_queue),source_table.eq.discord_content_drafts'),
    countIn(sb, 'discord_content_queue', 'status', ['captured', 'candidate', 'pending_review']),
    countRows(sb, 'discord_public_growth_drafts', 'status', 'pending_approval'),
    countRows(sb, 'discord_public_growth_drafts', 'status', 'published'),
  ]);
  return {
    approvedDiscordKnowledgeSources: questionsApproved + answersApproved + contentQueuePublished + draftsApproved,
    ragDiscordSources,
    pendingKnowledgeCandidates,
    pendingPublicDrafts,
    publishedPublicDrafts,
    approvedMembers: members,
    onboardedMembers: onboarded,
    activeMembers7d: activeMembers,
    premiumMembers,
    premiumWorkflowProofs: premiumReviewsProof + officeHoursProof,
    applicationsSubmitted,
    applicationsApproved,
  };
}

async function createWeeklyPublicProofDraft(
  sb: SupabaseAny,
  input: { cycleKey: string; draftType: PublicProofDraftType },
): Promise<OperatingCyclePublicProofResult> {
  const candidate = await findPublicProofCandidate(sb);
  if (!candidate) {
    return {
      created: false,
      sourceId: null,
      draftId: null,
      sourceTable: null,
      sourceRecordId: null,
      draftType: null,
      reusedExistingSource: false,
      blocker: 'No approved Discord question, helpful answer, published content queue item, or approved draft is available for public proof.',
    };
  }

  let sourceId = await findExistingPublicProofSource(sb, candidate.sourceTable, candidate.sourceRecordId);
  const reusedExistingSource = Boolean(sourceId);
  if (!sourceId) {
    const source = await createPublicProofSource({
      sourceType: candidate.sourceType,
      sourceTable: candidate.sourceTable,
      sourceRecordId: candidate.sourceRecordId,
      title: candidate.title,
      summary: candidate.summary,
      body: candidate.body,
      permissionStatus: 'anonymized',
      metadata: {
        operating_cycle_key: input.cycleKey,
        source: 'discord_operating_cycle',
      },
    });
    sourceId = source.id;
    await sb.from('discord_growth_events').insert({
      event_type: 'source_created',
      source: 'discord_operating_cycle',
      utm_campaign: `discord_public_proof_${input.cycleKey}`,
      metadata: {
        operating_cycle_key: input.cycleKey,
        public_proof_source_id: sourceId,
        source_table: candidate.sourceTable,
        source_record_id: candidate.sourceRecordId,
      },
    });
  }

  const draft = await createPublicGrowthDraft({
    sourceId,
    draftType: input.draftType,
    title: candidate.title,
    summary: candidate.summary,
    body: candidate.body,
    utmCampaign: `discord_public_proof_${input.cycleKey}`,
    metadata: {
      operating_cycle_key: input.cycleKey,
      source: 'discord_operating_cycle',
      source_table: candidate.sourceTable,
      source_record_id: candidate.sourceRecordId,
      reused_existing_source: reusedExistingSource,
    },
  });
  await sb.from('discord_growth_events').insert({
    event_type: 'draft_created',
    source: 'discord_operating_cycle',
    utm_campaign: `discord_public_proof_${input.cycleKey}`,
    metadata: {
      operating_cycle_key: input.cycleKey,
      public_proof_source_id: sourceId,
      public_growth_draft_id: draft.id,
      draft_type: input.draftType,
      quality_score: draft.qualityScore,
      privacy_score: draft.privacyScore,
    },
  });

  return {
    created: true,
    sourceId,
    draftId: draft.id,
    sourceTable: candidate.sourceTable,
    sourceRecordId: candidate.sourceRecordId,
    draftType: input.draftType,
    reusedExistingSource,
    blocker: null,
  };
}

async function findPublicProofCandidate(sb: SupabaseAny): Promise<{
  sourceType: 'question' | 'answer' | 'content_queue' | 'recap';
  sourceTable: string;
  sourceRecordId: string;
  title: string;
  summary: string;
  body: string;
} | null> {
  const queue = await sb
    .from('discord_content_queue')
    .select('id, idea, angle, priority, channel_base_name, created_at')
    .eq('status', 'published')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10);
  if (queue.error) throw queue.error;
  for (const row of queue.data ?? []) {
    if (String(row.idea ?? '').trim().length >= 20) {
      return {
        sourceType: 'content_queue',
        sourceTable: 'discord_content_queue',
        sourceRecordId: String(row.id),
        title: titleFrom(String(row.idea)),
        summary: String(row.idea),
        body: [row.idea, row.angle].filter(Boolean).join('\n\n'),
      };
    }
  }

  const drafts = await sb
    .from('discord_content_drafts')
    .select('id, title, body, draft_type, quality_score, created_at')
    .in('status', ['approved', 'published'])
    .gte('quality_score', 80)
    .order('quality_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10);
  if (drafts.error) throw drafts.error;
  for (const row of drafts.data ?? []) {
    if (String(row.body ?? '').trim().length >= 80) {
      return {
        sourceType: row.draft_type === 'weekly_recap' ? 'recap' : 'content_queue',
        sourceTable: 'discord_content_drafts',
        sourceRecordId: String(row.id),
        title: titleFrom(String(row.title || row.draft_type || 'Approved Discord draft')),
        summary: String(row.title || 'Approved Discord draft became a public proof asset.'),
        body: String(row.body),
      };
    }
  }

  const questions = await sb
    .from('discord_questions')
    .select('id, question, context, created_at')
    .in('status', ['answered', 'closed'])
    .order('created_at', { ascending: false })
    .limit(10);
  if (questions.error) throw questions.error;
  for (const row of questions.data ?? []) {
    if (String(row.question ?? '').trim().length >= 20) {
      return {
        sourceType: 'question',
        sourceTable: 'discord_questions',
        sourceRecordId: String(row.id),
        title: titleFrom(String(row.question)),
        summary: String(row.question),
        body: [row.question, row.context].filter(Boolean).join('\n\n'),
      };
    }
  }

  const answers = await sb
    .from('discord_answers')
    .select('id, answer, created_at')
    .eq('helpful', true)
    .order('created_at', { ascending: false })
    .limit(10);
  if (answers.error) throw answers.error;
  for (const row of answers.data ?? []) {
    if (String(row.answer ?? '').trim().length >= 40) {
      return {
        sourceType: 'answer',
        sourceTable: 'discord_answers',
        sourceRecordId: String(row.id),
        title: 'Helpful Discord answer became a reusable lesson',
        summary: 'A helpful Discord answer was approved as a reusable lesson.',
        body: String(row.answer),
      };
    }
  }

  return null;
}

async function findExistingPublicProofSource(sb: SupabaseAny, sourceTable: string, sourceRecordId: string): Promise<string | null> {
  const { data, error } = await sb
    .from('discord_public_proof_sources')
    .select('id')
    .eq('source_table', sourceTable)
    .eq('source_record_id', sourceRecordId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.id ? String(data.id) : null;
}

async function loadLatestFinalScorecard(sb: SupabaseAny): Promise<DiscordOperatingProofCycleResult['finalScorecard']> {
  const { data, error } = await sb
    .from('discord_final_scorecard_runs')
    .select('run_key, average_score, blocked_below_95, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return {
    averageScore: data?.average_score === undefined || data?.average_score === null ? null : Number(data.average_score),
    blockedBelow95: Array.isArray(data?.blocked_below_95) ? data.blocked_below_95.map(String) : [],
    latestRunKey: data?.run_key ? String(data.run_key) : null,
  };
}

function titleFrom(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length > 90 ? `${normalized.slice(0, 87)}...` : normalized;
}

async function countAll(sb: SupabaseAny, table: string): Promise<number> {
  const { count, error } = await sb.from(table).select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

async function countRows(sb: SupabaseAny, table: string, column: string, value: unknown): Promise<number> {
  const { count, error } = await sb.from(table).select('*', { count: 'exact', head: true }).eq(column, value);
  if (error) throw error;
  return count ?? 0;
}

async function countIn(sb: SupabaseAny, table: string, column: string, values: unknown[]): Promise<number> {
  const { count, error } = await sb.from(table).select('*', { count: 'exact', head: true }).in(column, values);
  if (error) throw error;
  return count ?? 0;
}

async function countGte(sb: SupabaseAny, table: string, column: string, value: string): Promise<number> {
  const { count, error } = await sb.from(table).select('*', { count: 'exact', head: true }).gte(column, value);
  if (error) throw error;
  return count ?? 0;
}

async function countNotNull(sb: SupabaseAny, table: string, column: string): Promise<number> {
  const { count, error } = await sb.from(table).select('*', { count: 'exact', head: true }).not(column, 'is', null);
  if (error) throw error;
  return count ?? 0;
}

async function countOr(sb: SupabaseAny, table: string, expression: string): Promise<number> {
  const { count, error } = await sb.from(table).select('*', { count: 'exact', head: true }).or(expression);
  if (error) throw error;
  return count ?? 0;
}

function dryRunRagSync(): DiscordOperatingProofCycleResult['ragSync'] {
  return {
    ok: true,
    runKey: 'dry-run',
    status: 'completed',
    approvalPolicy: 'dry-run',
    approvedDiscordStats: null,
    stats: {
      sourcesSeen: 0,
      sourcesUpserted: 0,
      documentsUpserted: 0,
      failures: 0,
      byType: {},
    },
    blocker: null,
    sampleSources: [],
    error: null,
  };
}

function dryRunPublicProof(): OperatingCyclePublicProofResult {
  return {
    created: false,
    sourceId: null,
    draftId: null,
    sourceTable: null,
    sourceRecordId: null,
    draftType: null,
    reusedExistingSource: false,
    blocker: 'Dry run does not create public proof drafts.',
  };
}
