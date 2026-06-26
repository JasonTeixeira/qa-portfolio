import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import { isApprovedDiscordContentDraft } from '../../lib/rag/discord-authoritative-sources';

type SupabaseClient = ReturnType<typeof createClient<any>>;

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'engineering-loop');
const candidateActions = [
  'track_question',
  'track_answer',
  'candidate_content',
  'candidate_resource',
  'candidate_review',
  'candidate_win',
];

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

async function safeCount(label: string, run: () => PromiseLike<{ count: number | null; error: unknown }>): Promise<{ label: string; count: number; error: string | null }> {
  try {
    const { count, error } = await run();
    if (error) return { label, count: 0, error: error instanceof Error ? error.message : String(error) };
    return { label, count: count ?? 0, error: null };
  } catch (error) {
    return { label, count: 0, error: error instanceof Error ? error.message : String(error) };
  }
}

async function countAll(sb: SupabaseClient, table: string) {
  return safeCount(`${table}.all`, () => sb.from(table).select('*', { count: 'exact', head: true }));
}

async function countRows(sb: SupabaseClient, table: string, column: string, value: unknown) {
  return safeCount(`${table}.${column}=${String(value)}`, () => sb.from(table).select('*', { count: 'exact', head: true }).eq(column, value));
}

async function countIn(sb: SupabaseClient, table: string, column: string, values: unknown[]) {
  return safeCount(`${table}.${column}.in`, () => sb.from(table).select('*', { count: 'exact', head: true }).in(column, values));
}

async function countOr(sb: SupabaseClient, table: string, expression: string) {
  return safeCount(`${table}.or`, () => sb.from(table).select('*', { count: 'exact', head: true }).or(expression));
}

async function countApprovedDiscordDrafts(sb: SupabaseClient) {
  const label = 'discord_content_drafts.approved_with_discord_provenance';
  try {
    const { data, error } = await sb
      .from('discord_content_drafts')
      .select('status, quality_score, content_queue_id, metadata')
      .in('status', ['approved', 'published'])
      .gte('quality_score', 80)
      .limit(1000);
    if (error) return { label, count: 0, error: error instanceof Error ? error.message : String(error) };
    return { label, count: (data ?? []).filter(isApprovedDiscordContentDraft).length, error: null };
  } catch (error) {
    return { label, count: 0, error: error instanceof Error ? error.message : String(error) };
  }
}

async function countNonEmptyMessages(sb: SupabaseClient) {
  return safeCount('discord_messages.non_empty_visible', () => sb
    .from('discord_messages')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)
    .eq('author_bot', false)
    .neq('content', ''));
}

async function countRecentMessages(sb: SupabaseClient, sinceIso: string) {
  return safeCount('discord_messages.recent_7d_visible', () => sb
    .from('discord_messages')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)
    .eq('author_bot', false)
    .neq('content', '')
    .gte('captured_at', sinceIso));
}

async function sampleQueueRows(sb: SupabaseClient) {
  const { data, error } = await sb
    .from('discord_content_queue')
    .select('id, status, priority, channel_base_name, source_classification_action, source_classification_category, created_at')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(8);
  if (error) return { error: error instanceof Error ? error.message : String(error), rows: [] };
  return {
    error: null,
    rows: (data ?? []).map((row: any) => ({
      id: String(row.id),
      status: String(row.status ?? ''),
      priority: Number(row.priority ?? 0),
      channelBaseName: row.channel_base_name ? String(row.channel_base_name) : null,
      action: row.source_classification_action ? String(row.source_classification_action) : null,
      category: row.source_classification_category ? String(row.source_classification_category) : null,
      createdAt: row.created_at ? String(row.created_at) : null,
    })),
  };
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const startedAt = new Date();
  const since7d = new Date(startedAt.getTime() - 7 * 86_400_000).toISOString();

  const [
    messagesAll,
    messagesVisible,
    messagesRecent7d,
    classificationsAll,
    classificationsCandidateActions,
    contentQueueAll,
    contentQueueReviewable,
    contentQueuePublished,
    questionsAll,
    questionsApproved,
    answersAll,
    answersHelpful,
    draftsAll,
    draftsApproved,
    ragDiscordSources,
    publicProofSources,
    publicDraftsPending,
    publicDraftsPublished,
    publicProofApplyClicks,
    premiumMembers,
    premiumReviewsProof,
    officeHoursProof,
  ] = await Promise.all([
    countAll(sb, 'discord_messages'),
    countNonEmptyMessages(sb),
    countRecentMessages(sb, since7d),
    countAll(sb, 'discord_message_classifications'),
    countIn(sb, 'discord_message_classifications', 'recommended_action', candidateActions),
    countAll(sb, 'discord_content_queue'),
    countIn(sb, 'discord_content_queue', 'status', ['captured', 'candidate', 'pending_review']),
    countRows(sb, 'discord_content_queue', 'status', 'published'),
    countAll(sb, 'discord_questions'),
    countIn(sb, 'discord_questions', 'status', ['answered', 'closed']),
    countAll(sb, 'discord_answers'),
    countRows(sb, 'discord_answers', 'helpful', true),
    countAll(sb, 'discord_content_drafts'),
    countApprovedDiscordDrafts(sb),
    countOr(sb, 'rag_sources', 'source_type.in.(discord_question,discord_answer,discord_content_queue),source_table.eq.discord_content_drafts'),
    countAll(sb, 'discord_public_proof_sources'),
    countRows(sb, 'discord_public_growth_drafts', 'status', 'pending_approval'),
    countRows(sb, 'discord_public_growth_drafts', 'status', 'published'),
    countRows(sb, 'discord_growth_events', 'event_type', 'apply_click'),
    countRows(sb, 'discord_members', 'premium_member', true),
    countIn(sb, 'discord_premium_review_requests', 'status', ['answered', 'completed']),
    countIn(sb, 'discord_office_hours_queue', 'status', ['completed']),
  ]);
  const queueSample = await sampleQueueRows(sb);

  const counts = Object.fromEntries([
    messagesAll,
    messagesVisible,
    messagesRecent7d,
    classificationsAll,
    classificationsCandidateActions,
    contentQueueAll,
    contentQueueReviewable,
    contentQueuePublished,
    questionsAll,
    questionsApproved,
    answersAll,
    answersHelpful,
    draftsAll,
    draftsApproved,
    ragDiscordSources,
    publicProofSources,
    publicDraftsPending,
    publicDraftsPublished,
    publicProofApplyClicks,
    premiumMembers,
    premiumReviewsProof,
    officeHoursProof,
  ].map((item) => [item.label, item.count]));
  const queryErrors = [
    messagesAll,
    messagesVisible,
    messagesRecent7d,
    classificationsAll,
    classificationsCandidateActions,
    contentQueueAll,
    contentQueueReviewable,
    contentQueuePublished,
    questionsAll,
    questionsApproved,
    answersAll,
    answersHelpful,
    draftsAll,
    draftsApproved,
    ragDiscordSources,
    publicProofSources,
    publicDraftsPending,
    publicDraftsPublished,
    publicProofApplyClicks,
    premiumMembers,
    premiumReviewsProof,
    officeHoursProof,
  ].filter((item) => item.error);

  const approvedKnowledge = questionsApproved.count + answersHelpful.count + contentQueuePublished.count + draftsApproved.count;
  const reviewableKnowledgeCandidates = classificationsCandidateActions.count + contentQueueReviewable.count;
  const publicProofAssets = publicDraftsPending.count + publicDraftsPublished.count;
  const premiumWorkflowProofs = premiumReviewsProof.count + officeHoursProof.count;

  const evidence = {
    ok: queryErrors.length === 0 && !queueSample.error,
    version: 'discord-proof-source-volume-scan-v1',
    generatedAt: new Date().toISOString(),
    mutationMode: 'read_only_supabase_selects_and_local_file_evidence_only',
    releaseMeaning: 'This scan reads live Supabase counts and writes local evidence only. It does not approve, sync, publish, assign roles, or satisfy operating proof.',
    counts,
    laneReadiness: {
      approvedDiscordKnowledge: {
        current: approvedKnowledge,
        target: 10,
        reviewableCandidates: reviewableKnowledgeCandidates,
        blocker: approvedKnowledge > 0
          ? null
          : reviewableKnowledgeCandidates > 0
            ? 'Reviewable candidates exist; admin approval is still required before they count as approved knowledge.'
            : 'No reviewable Discord knowledge candidates found in captured messages/classifications/content queue.',
      },
      ragDiscordSources: {
        current: ragDiscordSources.count,
        target: 10,
        approvedKnowledgeAvailable: approvedKnowledge,
        blocker: ragDiscordSources.count > 0
          ? null
          : approvedKnowledge > 0
            ? 'Approved Discord knowledge exists but has not been synced into authoritative RAG.'
            : 'No approved Discord knowledge exists to sync into RAG.',
      },
      publicProofAssets: {
        current: publicProofAssets,
        target: 4,
        approvedKnowledgeAvailable: approvedKnowledge,
        applyClicks: publicProofApplyClicks.count,
        blocker: publicProofAssets >= 4
          ? null
          : approvedKnowledge > 0
            ? `Approved Discord knowledge exists, but only ${publicProofAssets}/4 public proof drafts or published assets exist.`
            : 'Public proof requires approved Discord knowledge first.',
      },
      premiumWorkflowProof: {
        current: premiumWorkflowProofs,
        target: 1,
        premiumMembers: premiumMembers.count,
        premiumReviews: premiumReviewsProof.count,
        officeHours: officeHoursProof.count,
        blocker: premiumWorkflowProofs > 0
          ? null
          : 'No answered/completed premium review or completed office-hours proof row is visible.',
      },
    },
    samples: {
      contentQueue: queueSample.rows,
    },
    errors: [
      ...queryErrors.map((item) => ({ label: item.label, error: item.error })),
      ...(queueSample.error ? [{ label: 'discord_content_queue.sample', error: queueSample.error }] : []),
    ],
    nextActions: [
      reviewableKnowledgeCandidates > 0
        ? 'Review captured/classified candidates in /admin/discord and approve only privacy-safe reusable knowledge.'
        : 'Generate source volume by capturing real member questions, answers, builds, reviews, wins, and resources.',
      approvedKnowledge > 0
        ? 'Run approved Discord RAG sync after reviewing privacy/provenance.'
        : 'Do not run RAG sync yet; there are no approved Discord knowledge rows.',
      publicProofAssets >= 4
        ? 'Review pending public proof drafts and track growth/application attribution.'
        : 'Create public proof drafts only after approved Discord source material exists.',
      premiumWorkflowProofs > 0
        ? 'Verify premium authorization, SLA, and fulfillment before counting premium proof.'
        : 'Create or wait for one fulfilled real/deliberately seeded premium workflow before claiming premium readiness.',
    ],
    startedAt: startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
  };

  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'discord-proof-source-volume-scan-latest.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!evidence.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
