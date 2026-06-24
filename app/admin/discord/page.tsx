import type { ReactNode } from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  BookOpenCheck,
  CalendarDays,
  ChevronRight,
  FileCheck2,
  GitPullRequestArrow,
  HeartPulse,
  Inbox,
  Layers3,
  MessageCircle,
  Radio,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { AdminTopbar } from '@/components/admin/topbar';
import { Card, CardContent } from '@/components/portal/ui/card';
import { Badge } from '@/components/portal/ui/badge';
import {
  buildDiscordCorpusAnswerItem,
  buildDiscordCorpusDraftItem,
  buildDiscordCorpusQueueItem,
  buildDiscordCorpusQuestionItem,
  summarizeDiscordCorpusHealth,
  type DiscordCorpusItem,
} from '@/lib/rag/discord-corpus-health';
import {
  buildRagEvalDrilldownRow,
  summarizeRagCorpusHealth,
  type RagEvalDrilldownRow,
} from '@/lib/rag/admin-health';
import {
  approveDiscordAnswerForRagAction,
  approveDiscordApplication,
  approveDiscordQueueItemForRagAction,
  approveDiscordQuestionForRagAction,
  createRagEvalKnowledgeTaskAction,
  rejectDiscordApplication,
  reviewDiscordChallengeSubmissionAction,
  reviewDiscordContentDraftAction,
  syncDiscordRagSourcesAction,
  updateDiscordContentQueueStatus,
} from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Discord Command Center', robots: { index: false, follow: false } };

type Tone = 'neutral' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet';

type DiscordEventRow = {
  id: string;
  event_type: string;
  command_name: string | null;
  discord_username: string | null;
  discord_user_id: string | null;
  channel_base_name: string | null;
  created_at: string;
};

type DiscordMemberRow = {
  discord_user_id: string;
  username: string | null;
  path_key: string | null;
  level_key: string | null;
  weekly_time_budget: string | null;
  preferred_support: string | null;
  premium_member: boolean;
  premium_status: string | null;
  last_seen_at: string;
};

type DiscordRunRow = {
  run_key: string;
  kind: string;
  status: string;
  message_id: string | null;
  posted_at: string;
};

type DiscordPointsRow = {
  discord_user_id: string;
  discord_username: string | null;
  points: number;
};

type DiscordContentQueueRow = {
  id: string;
  idea: string;
  angle: string | null;
  source: string;
  discord_username: string | null;
  status: string;
  priority: number;
  created_at: string;
};

type DiscordContentDraftRow = {
  id: string;
  draft_type: string;
  target_channel_base_name: string;
  title: string | null;
  body: string;
  status: string;
  quality_score: number;
  prompt_version: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type DiscordApplicationRow = {
  id: string;
  discord_user_id: string;
  discord_username: string | null;
  goal: string;
  experience: string;
  intended_build: string;
  path_key: string | null;
  level_key: string | null;
  timezone: string | null;
  weekly_time_budget: string | null;
  preferred_support: string | null;
  status: string;
  submitted_at: string;
};

type DiscordQuizRow = {
  quiz_key: string;
  prompt: string;
  active: boolean;
  created_at: string;
};

type DiscordChallengeRow = {
  challenge_key: string;
  title: string;
  active: boolean;
  points: number;
  created_at: string;
};

type DiscordChallengeSubmissionRow = {
  id: string;
  challenge_key: string;
  discord_user_id: string;
  discord_username: string | null;
  summary: string;
  link: string | null;
  status: string;
  points_awarded: number;
  created_at: string;
};

type DiscordCalendarRow = {
  calendar_date: string;
  theme: string | null;
  daily_prompt: string | null;
  status: string;
};

type DiscordQuestionRow = {
  id: string;
  question: string;
  context: string | null;
  discord_username: string | null;
  status: string;
  created_at: string;
};

type DiscordAnswerRow = {
  id: string;
  answer: string;
  question_id: string;
  discord_username: string | null;
  helpful: boolean;
  created_at: string;
};

type RagSourceRow = {
  source_key: string;
  source_type: string;
  source_record_id: string | null;
  source_table: string | null;
  updated_at: string;
};

type RagIngestionRunRow = {
  run_key: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  failures: number | null;
};

type RagEvalRunRow = {
  run_key: string;
  status: string;
  total_questions: number;
  passed: number;
  failed: number;
  metrics: Record<string, unknown> | null;
  finished_at: string | null;
};

type DiscordGatewayHeartbeatRow = {
  worker_id: string;
  status: string;
  session_id: string | null;
  sequence: number | null;
  last_seen_at: string;
  last_close_code: number | null;
  last_close_reason: string | null;
};

const statusTone: Record<string, Tone> = {
  approved: 'emerald',
  archived: 'neutral',
  captured: 'cyan',
  draft: 'amber',
  drafted: 'violet',
  failed: 'rose',
  featured: 'emerald',
  heartbeat_ack: 'emerald',
  pending: 'amber',
  pending_approval: 'amber',
  published: 'emerald',
  ready: 'emerald',
  rejected: 'rose',
  resumed: 'emerald',
  skipped: 'amber',
  triaged: 'cyan',
};

export default async function AdminDiscordPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined> }) {
  const { profile } = await requireAdmin();
  const sb = supabaseAdmin();
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const promptDebug = resolvedSearchParams.promptDebug === '1';

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [
    eventsRes,
    membersRes,
    runsRes,
    eventCountRes,
    premiumCountRes,
    pointsRes,
    contentQueueRes,
    contentDraftsRes,
    ragDraftsRes,
    applicationsRes,
    quizzesRes,
    challengesRes,
    challengeSubmissionsRes,
    calendarRes,
    questionsRes,
    answersRes,
    gatewayEventCountRes,
    gatewayMessageCountRes,
    gatewayReactionCountRes,
    gatewayHeartbeatsRes,
    gatewayDeadLetterCountRes,
    ragSourcesRes,
    ragSourceCountRes,
    ragDocumentCountRes,
    ragChunkCountRes,
    ragEmbeddedChunkCountRes,
    newestIngestionRunRes,
    latestEvalRunRes,
    latestEvalResultsRes,
  ] = await Promise.all([
    sb
      .from('discord_events')
      .select('id, event_type, command_name, discord_username, discord_user_id, channel_base_name, created_at')
      .order('created_at', { ascending: false })
      .limit(80),
    sb
      .from('discord_members')
      .select('discord_user_id, username, path_key, level_key, weekly_time_budget, preferred_support, premium_member, premium_status, last_seen_at')
      .order('last_seen_at', { ascending: false })
      .limit(80),
    sb
      .from('discord_scheduled_runs')
      .select('run_key, kind, status, message_id, posted_at')
      .order('posted_at', { ascending: false })
      .limit(20),
    sb
      .from('discord_events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since.toISOString()),
    sb
      .from('discord_members')
      .select('discord_user_id', { count: 'exact', head: true })
      .eq('premium_member', true),
    sb
      .from('discord_points_ledger')
      .select('discord_user_id, discord_username, points')
      .order('created_at', { ascending: false })
      .limit(1000),
    sb
      .from('discord_content_queue')
      .select('id, idea, angle, source, discord_username, status, priority, created_at')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20),
    sb
      .from('discord_content_drafts')
      .select('id, draft_type, target_channel_base_name, title, body, status, quality_score, prompt_version, metadata, created_at')
      .in('status', ['draft', 'pending_approval'])
      .order('quality_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(12),
    sb
      .from('discord_content_drafts')
      .select('id, draft_type, target_channel_base_name, title, body, status, quality_score, prompt_version, metadata, created_at')
      .in('status', ['draft', 'pending_approval', 'approved', 'published', 'rejected'])
      .order('created_at', { ascending: false })
      .limit(30),
    sb
      .from('discord_member_applications')
      .select('id, discord_user_id, discord_username, goal, experience, intended_build, path_key, level_key, timezone, weekly_time_budget, preferred_support, status, submitted_at')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true })
      .limit(20),
    sb
      .from('discord_quizzes')
      .select('quiz_key, prompt, active, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
    sb
      .from('discord_challenges')
      .select('challenge_key, title, active, points, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
    sb
      .from('discord_challenge_submissions')
      .select('id, challenge_key, discord_user_id, discord_username, summary, link, status, points_awarded, created_at')
      .in('status', ['pending', 'approved'])
      .order('created_at', { ascending: false })
      .limit(20),
    sb
      .from('discord_content_calendar')
      .select('calendar_date, theme, daily_prompt, status')
      .order('calendar_date', { ascending: false })
      .limit(7),
    sb
      .from('discord_questions')
      .select('id, question, context, discord_username, status, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
    sb
      .from('discord_answers')
      .select('id, question_id, answer, discord_username, helpful, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
    sb
      .from('discord_gateway_events')
      .select('id', { count: 'exact', head: true }),
    sb
      .from('discord_messages')
      .select('discord_message_id', { count: 'exact', head: true }),
    sb
      .from('discord_reactions')
      .select('id', { count: 'exact', head: true }),
    sb
      .from('discord_gateway_heartbeats')
      .select('worker_id, status, session_id, sequence, last_seen_at, last_close_code, last_close_reason')
      .order('last_seen_at', { ascending: false })
      .limit(5),
    sb
      .from('discord_gateway_dead_letters')
      .select('id', { count: 'exact', head: true })
      .is('resolved_at', null),
    sb
      .from('rag_sources')
      .select('source_key, source_type, source_record_id, source_table, updated_at')
      .in('source_type', ['discord_question', 'discord_answer', 'discord_content_queue', 'lesson', 'resource', 'admin_note'])
      .limit(1000),
    sb.from('rag_sources').select('id', { count: 'exact', head: true }),
    sb.from('rag_documents').select('id', { count: 'exact', head: true }),
    sb.from('rag_chunks').select('id', { count: 'exact', head: true }),
    sb.from('rag_chunks').select('id', { count: 'exact', head: true }).not('embedding_local', 'is', null),
    sb
      .from('rag_ingestion_runs')
      .select('run_key, status, started_at, finished_at, failures')
      .order('started_at', { ascending: false })
      .limit(1),
    sb
      .from('rag_eval_runs')
      .select('run_key, status, total_questions, passed, failed, metrics, finished_at')
      .order('started_at', { ascending: false })
      .limit(1),
    sb
      .from('rag_eval_results')
      .select('id, passed, score, citation_coverage, faithfulness, metadata, answer_id, retrieval_log_id, rag_eval_questions(eval_key, question)')
      .order('passed', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(12),
  ]);

  const events = (eventsRes.data ?? []) as DiscordEventRow[];
  const members = (membersRes.data ?? []) as DiscordMemberRow[];
  const runs = (runsRes.data ?? []) as DiscordRunRow[];
  const pointsRows = (pointsRes.data ?? []) as DiscordPointsRow[];
  const contentQueue = (contentQueueRes.data ?? []) as DiscordContentQueueRow[];
  const contentDrafts = (contentDraftsRes.data ?? []) as DiscordContentDraftRow[];
  const ragDrafts = (ragDraftsRes.data ?? []) as DiscordContentDraftRow[];
  const applications = (applicationsRes.data ?? []) as DiscordApplicationRow[];
  const quizzes = (quizzesRes.data ?? []) as DiscordQuizRow[];
  const challenges = (challengesRes.data ?? []) as DiscordChallengeRow[];
  const challengeSubmissions = (challengeSubmissionsRes.data ?? []) as DiscordChallengeSubmissionRow[];
  const calendar = (calendarRes.data ?? []) as DiscordCalendarRow[];
  const questions = (questionsRes.data ?? []) as DiscordQuestionRow[];
  const answers = (answersRes.data ?? []) as DiscordAnswerRow[];
  const ragSources = (ragSourcesRes.data ?? []) as RagSourceRow[];
  const latestIngestionRun = ((newestIngestionRunRes.data ?? []) as RagIngestionRunRow[])[0] ?? null;
  const latestEvalRun = ((latestEvalRunRes.data ?? []) as RagEvalRunRow[])[0] ?? null;
  const ragEvalDrilldown = ((latestEvalResultsRes.data ?? []) as any[]).map(buildRagEvalDrilldownRow);
  const discordRagSourceKeys = new Set(ragSources.map((source) => source.source_key));
  const corpusItems = [
    ...questions.map((question) => buildDiscordCorpusQuestionItem(question, discordRagSourceKeys)),
    ...answers.map((answer) => buildDiscordCorpusAnswerItem(answer, discordRagSourceKeys)),
    ...contentQueue.map((item) => buildDiscordCorpusQueueItem(item, discordRagSourceKeys)),
    ...ragDrafts.map((draft) => buildDiscordCorpusDraftItem(draft, discordRagSourceKeys)),
  ].sort(sortCorpusItems);
  const corpusHealth = summarizeDiscordCorpusHealth(
    corpusItems,
    ragSources.filter((source) => source.source_type.startsWith('discord_') || source.source_table === 'discord_content_drafts').length,
  );
  const ragOperationalHealth = summarizeRagCorpusHealth({
    sources: ragSourceCountRes.count ?? 0,
    documents: ragDocumentCountRes.count ?? 0,
    chunks: ragChunkCountRes.count ?? 0,
    embeddedChunks: ragEmbeddedChunkCountRes.count ?? 0,
    blockedDiscordCandidates: corpusHealth.blocked,
    newestIngestionRun: latestIngestionRun,
    latestEvalRun,
  });
  const gatewayHeartbeats = (gatewayHeartbeatsRes.data ?? []) as DiscordGatewayHeartbeatRow[];
  const failures = events.filter((event) => event.event_type.includes('failed')).length;
  const openDeadLetters = gatewayDeadLetterCountRes.count ?? 0;
  const activeWorker = gatewayHeartbeats.some((heartbeat) => ['ready', 'resumed', 'heartbeat_ack'].includes(heartbeat.status));
  const pendingDrafts = contentDrafts.filter((draft) => draft.status === 'pending_approval').length;
  const pendingReviews = applications.length + pendingDrafts + challengeSubmissions.filter((item) => item.status === 'pending').length;
  const capturedMessages = gatewayMessageCountRes.count ?? 0;
  const operatingScore = scoreOperatingHealth({
    activeWorker,
    failures,
    openDeadLetters,
    pendingReviews,
    capturedMessages,
  });
  const leaderboard = buildLeaderboard(pointsRows);
  const lastRun = runs[0] ?? null;

  return (
    <>
      <AdminTopbar
        crumbs={[{ label: 'Discord Command Center' }]}
        email={profile.email}
        fullName={profile.full_name}
      />
      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8" data-testid="admin-discord">
        <section className="relative overflow-hidden rounded-lg border border-[#27272a] bg-[#0c0c10]">
          <div className="absolute inset-x-0 top-0 h-px bg-[#22d3ee]" />
          <div className="grid gap-6 p-5 lg:grid-cols-[1.45fr_0.55fr] lg:p-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="cyan" className="uppercase tracking-wider">SageBot OS</Badge>
                <Badge tone={activeWorker ? 'emerald' : 'rose'}>{activeWorker ? 'worker live' : 'worker down'}</Badge>
                <Badge tone={pendingReviews > 0 ? 'amber' : 'neutral'}>{pendingReviews} review items</Badge>
                <a
                  href={promptDebug ? '/admin/discord' : '/admin/discord?promptDebug=1'}
                  className="inline-flex h-6 items-center rounded border border-[#3f3f46] px-2 text-[11px] font-medium text-[#d4d4d8] transition hover:border-[#22d3ee] hover:text-[#fafafa]"
                >
                  Prompt debug {promptDebug ? 'on' : 'off'}
                </a>
              </div>
              <div className="mt-5 max-w-4xl">
                <h1 className="text-2xl font-semibold tracking-tight text-[#fafafa] sm:text-3xl">
                  Discord operating dashboard
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#a1a1aa]">
                  Manage member approvals, content drafts, challenges, points, scheduled posts, captured questions, and worker health from one command surface.
                </p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard icon={ShieldCheck} label="Operating score" value={`${operatingScore}%`} tone={operatingScore >= 85 ? 'emerald' : operatingScore >= 65 ? 'amber' : 'rose'} />
                <MetricCard icon={Users} label="Tracked members" value={members.length} detail={`${premiumCountRes.count ?? 0} premium`} />
                <MetricCard icon={MessageCircle} label="Captured messages" value={capturedMessages} detail={`${gatewayEventCountRes.count ?? 0} events / ${gatewayReactionCountRes.count ?? 0} reactions`} />
                <MetricCard icon={Inbox} label="Open review queue" value={pendingReviews} tone={pendingReviews ? 'amber' : 'emerald'} />
                <MetricCard icon={BookOpenCheck} label="RAG corpus health" value={`${corpusHealth.healthScore}%`} detail={`${corpusHealth.authoritativeSources} authoritative / ${corpusHealth.missing} missing`} tone={corpusHealth.healthScore >= 85 ? 'emerald' : corpusHealth.healthScore >= 65 ? 'amber' : 'rose'} />
                <MetricCard icon={HeartPulse} label="RAG ops health" value={ragOperationalHealth.status} detail={`${Math.round(ragOperationalHealth.embeddingCoverage * 100)}% embedded / ${latestEvalRun ? `${latestEvalRun.passed}/${latestEvalRun.total_questions} eval` : 'no eval'}`} tone={ragOperationalHealth.status === 'healthy' ? 'emerald' : ragOperationalHealth.status === 'watch' ? 'amber' : 'rose'} />
              </div>
            </div>
            <Card className="rounded-lg border-[#2a2a31] bg-[#111116]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-[#71717a]">Next operator move</div>
                    <div className="mt-1 text-base font-semibold text-[#fafafa]">{nextOperatorMove({ applications, contentDrafts, challengeSubmissions })}</div>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-lg border border-[#06b6d4]/30 bg-[#06b6d4]/10 text-[#22d3ee]">
                    <GitPullRequestArrow className="size-5" />
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <HealthLine label="Gateway worker" value={activeWorker ? 'Online' : 'Needs attention'} tone={activeWorker ? 'emerald' : 'rose'} />
                  <HealthLine label="Open dead letters" value={String(openDeadLetters)} tone={openDeadLetters ? 'rose' : 'emerald'} />
                  <HealthLine label="Last scheduled run" value={lastRun ? `${lastRun.kind} / ${lastRun.status}` : 'No run yet'} tone={lastRun?.status === 'failed' ? 'rose' : lastRun ? 'emerald' : 'amber'} />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]" data-testid="rag-health-eval-drilldown">
          <Card className="rounded-lg border-[#27272a] bg-[#0f0f12]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-md border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 text-[#a78bfa]">
                  <HeartPulse className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#fafafa]">RAG operational health</h2>
                  <p className="text-xs text-[#71717a]">Live source, chunk, embedding, ingestion, and eval posture.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <HealthLine label="Sources" value={String(ragOperationalHealth.sources)} tone={ragOperationalHealth.sources ? 'emerald' : 'rose'} />
                <HealthLine label="Documents" value={`${ragOperationalHealth.documents} / ${ragOperationalHealth.missingDocuments} missing`} tone={ragOperationalHealth.missingDocuments ? 'amber' : 'emerald'} />
                <HealthLine label="Chunks" value={`${ragOperationalHealth.chunks} / ${ragOperationalHealth.missingChunks} missing`} tone={ragOperationalHealth.missingChunks ? 'amber' : 'emerald'} />
                <HealthLine label="Embeddings" value={`${ragOperationalHealth.embeddedChunks} / ${ragOperationalHealth.missingEmbeddings} missing`} tone={ragOperationalHealth.missingEmbeddings ? 'rose' : 'emerald'} />
                <HealthLine label="Latest ingestion" value={latestIngestionRun ? `${latestIngestionRun.status} / ${latestIngestionRun.run_key}` : 'none'} tone={latestIngestionRun?.status === 'failed' ? 'rose' : latestIngestionRun ? 'emerald' : 'amber'} />
                <HealthLine label="Latest eval" value={latestEvalRun ? `${latestEvalRun.passed}/${latestEvalRun.total_questions} passed` : 'none'} tone={latestEvalRun?.status === 'failed' ? 'rose' : latestEvalRun ? 'emerald' : 'amber'} />
              </div>
              <div className="mt-4 space-y-2">
                {ragOperationalHealth.issues.length ? ragOperationalHealth.issues.slice(0, 4).map((issue) => (
                  <div key={issue} className="rounded-md border border-[#f59e0b]/25 bg-[#f59e0b]/10 px-3 py-2 text-xs leading-5 text-[#facc15]">
                    {issue}
                  </div>
                )) : (
                  <div className="rounded-md border border-[#10b981]/25 bg-[#10b981]/10 px-3 py-2 text-xs leading-5 text-[#34d399]">
                    RAG source, chunk, embedding, ingestion, and eval posture is currently healthy.
                  </div>
                )}
              </div>
              <form action={syncDiscordRagSourcesAction} className="mt-4">
                <ActionButton data-testid="rag-health-sync-now" tone="emerald" type="submit">Sync approved Discord knowledge</ActionButton>
              </form>
            </CardContent>
          </Card>

          <Panel
            icon={BookOpenCheck}
            title="RAG eval drilldown"
            meta={latestEvalRun ? `${latestEvalRun.run_key} / ${latestEvalRun.failed} failed` : 'No eval run yet'}
            empty="No eval results found yet. Run the RAG smoke or full eval to populate this table."
          >
            {ragEvalDrilldown.map((row) => (
              <RagEvalRow key={row.id} row={row} />
            ))}
          </Panel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]" data-testid="discord-rag-corpus-ops">
          <Card className="rounded-lg border-[#27272a] bg-[#0f0f12]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-md border border-[#10b981]/30 bg-[#10b981]/10 text-[#34d399]">
                  <BookOpenCheck className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#fafafa]">Authoritative RAG corpus health</h2>
                  <p className="text-xs text-[#71717a]">Approval-gated Discord knowledge only. Raw messages are excluded.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <HealthLine label="Synced sources" value={String(corpusHealth.synced)} tone={corpusHealth.synced ? 'emerald' : 'neutral'} />
                <HealthLine label="Eligible to sync" value={String(corpusHealth.eligible)} tone={corpusHealth.eligible ? 'cyan' : 'neutral'} />
                <HealthLine label="Stale eligible" value={String(corpusHealth.stale)} tone={corpusHealth.stale ? 'amber' : 'emerald'} />
                <HealthLine label="Blocked candidates" value={String(corpusHealth.blocked)} tone={corpusHealth.blocked ? 'amber' : 'emerald'} />
              </div>
              <div className="mt-4 rounded-md border border-[#27272a] bg-[#0b0b0e] p-3 text-xs leading-5 text-[#a1a1aa]">
                Approving here changes the source row into the Phase 5 approved state. Syncing creates or updates `rag_sources` and `rag_documents`.
              </div>
              <form action={syncDiscordRagSourcesAction} className="mt-4">
                <ActionButton data-testid="rag-sync-now" tone="emerald" type="submit">Sync RAG now</ActionButton>
              </form>
            </CardContent>
          </Card>

          <Panel
            icon={BookOpenCheck}
            title="RAG knowledge approval desk"
            meta={`${corpusItems.length} candidates / ${corpusHealth.missing} missing from RAG`}
            empty="No Discord knowledge candidates found yet."
          >
            {corpusItems.slice(0, 18).map((item) => (
              <RagCorpusRow key={`${item.kind}:${item.id}`} item={item} />
            ))}
          </Panel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel
            icon={Users}
            title="Member approval queue"
            meta={`${applications.length} pending`}
            empty="No pending SageBot applications. Native Discord application approvals will populate after members enter the bot/onboarding flow."
          >
            {applications.map((application) => (
              <ApplicationRow key={application.id} application={application} />
            ))}
          </Panel>

          <Panel
            icon={Sparkles}
            title="AI content approval"
            meta={`${contentDrafts.length} drafts`}
            empty="No generated drafts waiting for approval."
          >
            {contentDrafts.map((draft) => (
              <DraftRow key={draft.id} draft={draft} promptDebug={promptDebug} />
            ))}
          </Panel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Panel
            icon={Award}
            title="Challenge review desk"
            meta={`Challenge submissions: ${challengeSubmissions.length} active`}
            empty="No challenge submissions waiting for review."
          >
            {challengeSubmissions.map((submission) => (
              <ChallengeSubmissionRow key={submission.id} submission={submission} />
            ))}
          </Panel>

          <Panel
            icon={Trophy}
            title="Leaderboard and rewards"
            meta={`${leaderboard.length} ranked`}
            empty="No points recorded yet."
          >
            {leaderboard.map((row, index) => (
              <div key={row.discord_user_id} className="grid grid-cols-[36px_1fr_auto] items-center gap-3 px-3 py-2.5">
                <div className="flex size-8 items-center justify-center rounded-md border border-[#27272a] bg-[#18181b] text-xs font-semibold text-[#a1a1aa]">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-[#fafafa]">{row.username}</div>
                  <div className="text-xs text-[#71717a]">member score</div>
                </div>
                <div className="text-right text-sm font-semibold tabular-nums text-[#34d399]">{row.points} pts</div>
              </div>
            ))}
          </Panel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          <Panel
            icon={Layers3}
            title="Content queue"
            meta={`${contentQueue.length} ideas`}
            empty="No content ideas captured yet."
          >
            {contentQueue.map((item) => (
              <ContentQueueRow key={item.id} item={item} />
            ))}
          </Panel>

          <Panel
            icon={CalendarDays}
            title="Publishing calendar"
            meta={`${calendar.length} days`}
            empty="No planned content dates yet."
          >
            {calendar.map((item) => (
              <CompactRow
                key={item.calendar_date}
                eyebrow={item.calendar_date}
                title={item.theme ?? item.daily_prompt ?? 'Planned content'}
                meta={<StatusBadge status={item.status} />}
              />
            ))}
          </Panel>

          <Panel
            icon={Radio}
            title="Scheduled automation"
            meta={`${runs.length} runs`}
            empty="No scheduled Discord runs recorded yet."
          >
            {runs.map((run) => (
              <CompactRow
                key={run.run_key}
                eyebrow={run.kind}
                title={run.run_key}
                detail={formatDateTime(run.posted_at)}
                meta={<StatusBadge status={run.status} />}
              />
            ))}
          </Panel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          <Panel icon={Zap} title="Quiz bank" meta={`${quizzes.length} loaded`} empty="No quizzes seeded yet.">
            {quizzes.map((quiz) => (
              <CompactRow
                key={quiz.quiz_key}
                eyebrow={quiz.quiz_key}
                title={quiz.prompt}
                meta={<Badge tone={quiz.active ? 'emerald' : 'neutral'}>{quiz.active ? 'active' : 'off'}</Badge>}
              />
            ))}
          </Panel>

          <Panel icon={Star} title="Challenge bank" meta={`${challenges.length} loaded`} empty="No challenges seeded yet.">
            {challenges.map((challenge) => (
              <CompactRow
                key={challenge.challenge_key}
                eyebrow={`${challenge.points} points`}
                title={challenge.title}
                meta={<Badge tone={challenge.active ? 'emerald' : 'neutral'}>{challenge.active ? 'active' : 'off'}</Badge>}
              />
            ))}
          </Panel>

          <Panel icon={HeartPulse} title="Gateway health" meta={`${gatewayHeartbeats.length} workers`} empty="No gateway worker heartbeat recorded yet.">
            {gatewayHeartbeats.map((heartbeat) => (
              <CompactRow
                key={heartbeat.worker_id}
                eyebrow={`seq ${heartbeat.sequence ?? '-'}`}
                title={heartbeat.worker_id}
                detail={formatDateTime(heartbeat.last_seen_at)}
                meta={<StatusBadge status={heartbeat.status} />}
              />
            ))}
          </Panel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel icon={MessageCircle} title="Question intelligence" meta={`${questions.length} questions`} empty="No tracked questions yet.">
            {questions.map((question) => (
              <CompactRow
                key={question.id}
                eyebrow={question.discord_username ?? 'member'}
                title={question.question}
                detail={formatDateTime(question.created_at)}
                meta={<StatusBadge status={question.status} />}
              />
            ))}
          </Panel>

          <Panel icon={FileCheck2} title="Answer intelligence" meta={`${answers.length} answers`} empty="No tracked answers yet.">
            {answers.map((answer) => (
              <CompactRow
                key={answer.id}
                eyebrow={answer.discord_username ?? 'member'}
                title={answer.answer}
                detail={formatDateTime(answer.created_at)}
                meta={<Badge tone={answer.helpful ? 'emerald' : 'neutral'}>{answer.helpful ? 'helpful' : 'new'}</Badge>}
              />
            ))}
          </Panel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel icon={Users} title="Tracked members" meta={`${members.length} members`} empty="No Discord members tracked yet.">
            {members.slice(0, 14).map((member) => (
              <CompactRow
                key={member.discord_user_id}
                eyebrow={[member.path_key, member.level_key, member.preferred_support].filter(Boolean).join(' / ') || 'not routed'}
                title={member.username ?? member.discord_user_id}
                detail={formatDateTime(member.last_seen_at)}
                meta={<Badge tone={member.premium_member ? 'emerald' : 'neutral'}>{member.premium_status ?? (member.premium_member ? 'premium' : 'free')}</Badge>}
              />
            ))}
          </Panel>

          <Panel icon={Activity} title="Event stream" meta={`${eventCountRes.count ?? 0} events, 30d`} empty="No Discord events recorded yet.">
            {events.slice(0, 18).map((event) => (
              <CompactRow
                key={event.id}
                eyebrow={event.command_name ?? event.channel_base_name ?? 'system'}
                title={event.event_type}
                detail={`${event.discord_username ?? event.discord_user_id ?? '-'} / ${formatDateTime(event.created_at)}`}
                meta={<StatusBadge status={event.event_type.includes('failed') ? 'failed' : 'ok'} />}
              />
            ))}
          </Panel>
        </section>
      </main>
    </>
  );
}

function ApplicationRow({ application }: { application: DiscordApplicationRow }) {
  return (
    <div className="grid gap-3 px-3 py-3 lg:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="truncate text-sm font-semibold text-[#fafafa]">{application.discord_username ?? application.discord_user_id}</div>
          <StatusBadge status={application.status} />
          {application.path_key ? <Badge tone="cyan">{application.path_key}</Badge> : null}
          {application.level_key ? <Badge tone="violet">{application.level_key}</Badge> : null}
        </div>
        <div className="mt-2 grid gap-2 text-xs text-[#a1a1aa] sm:grid-cols-3">
          <Field label="Goal" value={application.goal} />
          <Field label="Experience" value={application.experience} />
          <Field label="Build" value={application.intended_build} />
        </div>
      </div>
      <div className="flex items-center gap-2 lg:justify-end">
        <form action={approveDiscordApplication}>
          <input type="hidden" name="discord_user_id" value={application.discord_user_id} />
          <input type="hidden" name="discord_username" value={application.discord_username ?? ''} />
          <ActionButton tone="emerald" type="submit">Approve</ActionButton>
        </form>
        <form action={rejectDiscordApplication}>
          <input type="hidden" name="discord_user_id" value={application.discord_user_id} />
          <input type="hidden" name="discord_username" value={application.discord_username ?? ''} />
          <ActionButton type="submit">Reject</ActionButton>
        </form>
      </div>
    </div>
  );
}

function DraftRow({ draft, promptDebug }: { draft: DiscordContentDraftRow; promptDebug: boolean }) {
  const policyScore = typeof draft.metadata?.policy_score === 'number' ? draft.metadata.policy_score : null;
  const policyPassed = typeof draft.metadata?.policy_passed === 'boolean' ? draft.metadata.policy_passed : null;
  return (
    <div className="grid gap-3 px-3 py-3 lg:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={draft.status} />
          <Badge tone="cyan">{draft.draft_type}</Badge>
          <Badge tone={draft.quality_score >= 80 ? 'emerald' : draft.quality_score >= 60 ? 'amber' : 'rose'}>{draft.quality_score} quality</Badge>
          <Badge tone="neutral">{draft.target_channel_base_name}</Badge>
        </div>
        <div className="mt-2 truncate text-sm font-medium text-[#fafafa]">{draft.title ?? draft.body}</div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#71717a]">{draft.body}</p>
        {promptDebug ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#a1a1aa]">
            <span>Prompt: {draft.prompt_version ?? 'none'}</span>
            {policyScore !== null ? <span>Policy: {policyScore}</span> : null}
            {policyPassed !== null ? <Badge tone={policyPassed ? 'emerald' : 'rose'}>{policyPassed ? 'policy pass' : 'policy fail'}</Badge> : null}
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-2 lg:justify-end">
        <form action={reviewDiscordContentDraftAction}>
          <input type="hidden" name="id" value={draft.id} />
          <input type="hidden" name="status" value="approved" />
          <ActionButton tone="emerald" type="submit">Approve</ActionButton>
        </form>
        <form action={reviewDiscordContentDraftAction}>
          <input type="hidden" name="id" value={draft.id} />
          <input type="hidden" name="status" value="rejected" />
          <ActionButton type="submit">Reject</ActionButton>
        </form>
      </div>
    </div>
  );
}

function ChallengeSubmissionRow({ submission }: { submission: DiscordChallengeSubmissionRow }) {
  return (
    <div className="grid gap-3 px-3 py-3 lg:grid-cols-[1fr_auto]" data-testid={`discord-challenge-submission-${submission.id}`}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={submission.status} />
          <Badge tone="violet">{submission.challenge_key}</Badge>
          <Badge tone="emerald">{submission.points_awarded} pts</Badge>
          {submission.link ? <Badge tone="cyan">artifact</Badge> : null}
        </div>
        <div className="mt-2 truncate text-sm font-medium text-[#fafafa]">{submission.discord_username ?? submission.discord_user_id}</div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#71717a]">{submission.summary}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        {['approved', 'featured', 'rejected'].map((status) => (
          <form action={reviewDiscordChallengeSubmissionAction} key={status}>
            <input type="hidden" name="id" value={submission.id} />
            <input type="hidden" name="status" value={status} />
            <ActionButton
              data-testid={`discord-challenge-${status}-${submission.id}`}
              tone={status === 'featured' ? 'emerald' : undefined}
              type="submit"
            >
              {status}
            </ActionButton>
          </form>
        ))}
      </div>
    </div>
  );
}

function ContentQueueRow({ item }: { item: DiscordContentQueueRow }) {
  return (
    <div className="space-y-3 px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-[#fafafa]">{item.idea}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#71717a]">
            <span>{item.source}</span>
            <span>{item.discord_username ?? 'system'}</span>
            <span>priority {item.priority}</span>
          </div>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        {['triaged', 'drafted', 'published'].map((status) => (
          <form action={updateDiscordContentQueueStatus} key={status}>
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="status" value={status} />
            <ActionButton type="submit">{status}</ActionButton>
          </form>
        ))}
      </div>
    </div>
  );
}

function RagCorpusRow({ item }: { item: DiscordCorpusItem }) {
  return (
    <div className="grid gap-3 px-3 py-3 lg:grid-cols-[1fr_auto]" data-testid={`rag-corpus-${item.kind}-${item.id}`}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="cyan">{item.kind.replace('_', ' ')}</Badge>
          <Badge tone={corpusStateTone(item.state)}>{item.state}</Badge>
          {item.status ? <StatusBadge status={item.status} /> : null}
          {typeof item.helpful === 'boolean' ? <Badge tone={item.helpful ? 'emerald' : 'neutral'}>{item.helpful ? 'helpful' : 'not helpful'}</Badge> : null}
          {typeof item.qualityScore === 'number' ? <Badge tone={item.qualityScore >= 80 ? 'emerald' : 'amber'}>{item.qualityScore} quality</Badge> : null}
        </div>
        <div className="mt-2 truncate text-sm font-medium text-[#fafafa]">{item.title}</div>
        <div className="mt-1 truncate text-[11px] text-[#71717a]">{item.sourceKey}</div>
        {item.blocker ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#a1a1aa]">{item.blocker}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        {item.state === 'blocked' ? <ApproveForRagForm item={item} /> : null}
        {item.state === 'eligible' || item.state === 'stale' ? <Badge tone="amber">sync ready</Badge> : null}
        {item.state === 'synced' ? <Badge tone="emerald">in RAG</Badge> : null}
      </div>
    </div>
  );
}

function ApproveForRagForm({ item }: { item: DiscordCorpusItem }) {
  if (item.kind === 'question') {
    return (
      <form action={approveDiscordQuestionForRagAction}>
        <input type="hidden" name="id" value={item.id} />
        <ActionButton data-testid={`rag-approve-question-${item.id}`} tone="emerald" type="submit">Approve for RAG</ActionButton>
      </form>
    );
  }
  if (item.kind === 'answer') {
    return (
      <form action={approveDiscordAnswerForRagAction}>
        <input type="hidden" name="id" value={item.id} />
        <ActionButton data-testid={`rag-approve-answer-${item.id}`} tone="emerald" type="submit">Mark helpful</ActionButton>
      </form>
    );
  }
  if (item.kind === 'content_queue') {
    return (
      <form action={approveDiscordQueueItemForRagAction}>
        <input type="hidden" name="id" value={item.id} />
        <ActionButton data-testid={`rag-approve-queue-${item.id}`} tone="emerald" type="submit">Publish for RAG</ActionButton>
      </form>
    );
  }
  if (item.kind === 'content_draft' && Number(item.qualityScore ?? 0) >= 80) {
    return (
      <form action={reviewDiscordContentDraftAction}>
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="status" value="approved" />
        <ActionButton data-testid={`rag-approve-draft-${item.id}`} tone="emerald" type="submit">Approve draft</ActionButton>
      </form>
    );
  }
  return <Badge tone="neutral">not approvable</Badge>;
}

function RagEvalRow({ row }: { row: RagEvalDrilldownRow }) {
  return (
    <div className="grid gap-3 px-3 py-3 lg:grid-cols-[1fr_auto]" data-testid={`rag-eval-row-${row.evalKey}`}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={row.passed ? 'emerald' : row.severity === 'critical' ? 'rose' : 'amber'}>{row.passed ? 'pass' : 'failed'}</Badge>
          <Badge tone="cyan">{row.evalKey}</Badge>
          <Badge tone={row.score >= 0.8 ? 'emerald' : row.score >= 0.6 ? 'amber' : 'rose'}>{Math.round(row.score * 100)} score</Badge>
          <Badge tone={row.retrievalHitRate ? 'emerald' : 'rose'}>{Math.round(row.retrievalHitRate * 100)} retrieval</Badge>
          <Badge tone={row.citationCoverage >= 0.85 ? 'emerald' : 'amber'}>{Math.round(row.citationCoverage * 100)} citations</Badge>
        </div>
        <div className="mt-2 truncate text-sm font-medium text-[#fafafa]">{row.question}</div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#a1a1aa]">{row.suggestedFix}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#71717a]">
          {row.missingSources.length ? <span>Missing sources: {row.missingSources.join(', ')}</span> : null}
          {row.missingRequiredTerms.length ? <span>Missing terms: {row.missingRequiredTerms.join(', ')}</span> : null}
          {row.traceId ? <span>Trace: {row.traceId.slice(0, 10)}</span> : null}
          {row.answerId ? <span>Answer: {row.answerId.slice(0, 8)}</span> : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        {!row.passed ? (
          <form action={createRagEvalKnowledgeTaskAction}>
            <input type="hidden" name="result_id" value={row.id} />
            <input type="hidden" name="eval_key" value={row.evalKey} />
            <input type="hidden" name="question" value={row.question} />
            <input type="hidden" name="suggested_fix" value={row.suggestedFix} />
            <ActionButton data-testid={`rag-eval-create-task-${row.evalKey}`} tone="emerald" type="submit">Create source task</ActionButton>
          </form>
        ) : (
          <Badge tone="emerald">covered</Badge>
        )}
      </div>
    </div>
  );
}

function Panel({
  icon: Icon,
  title,
  meta,
  empty,
  children,
}: {
  icon: typeof Activity;
  title: string;
  meta: string;
  empty: string;
  children: ReactNode[];
}) {
  return (
    <Card className="rounded-lg border-[#27272a] bg-[#0f0f12]">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-4 border-b border-[#27272a] px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-[#27272a] bg-[#18181b] text-[#22d3ee]">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-[#fafafa]">{title}</h2>
              <p className="text-xs text-[#71717a]">{meta}</p>
            </div>
          </div>
          <ChevronRight className="size-4 shrink-0 text-[#3f3f46]" />
        </div>
        <Rows empty={empty}>{children}</Rows>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = 'cyan',
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
  detail?: string;
  tone?: Tone;
}) {
  const toneClass = {
    amber: 'text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/10',
    cyan: 'text-[#22d3ee] border-[#06b6d4]/30 bg-[#06b6d4]/10',
    emerald: 'text-[#34d399] border-[#10b981]/30 bg-[#10b981]/10',
    neutral: 'text-[#a1a1aa] border-[#27272a] bg-[#18181b]',
    rose: 'text-[#fb7185] border-[#f43f5e]/30 bg-[#f43f5e]/10',
    violet: 'text-[#a78bfa] border-[#8b5cf6]/30 bg-[#8b5cf6]/10',
  }[tone];

  return (
    <div className="rounded-lg border border-[#27272a] bg-[#111116] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-xs uppercase tracking-wider text-[#71717a]">{label}</div>
          <div className="mt-2 text-2xl font-semibold tabular-nums text-[#fafafa]">{value}</div>
          {detail ? <div className="mt-1 truncate text-xs text-[#71717a]">{detail}</div> : null}
        </div>
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg border ${toneClass}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function CompactRow({
  eyebrow,
  title,
  detail,
  meta,
}: {
  eyebrow: string;
  title: string;
  detail?: string;
  meta?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-2.5">
      <div className="min-w-0">
        <div className="truncate text-[11px] uppercase tracking-wider text-[#71717a]">{eyebrow}</div>
        <div className="mt-0.5 truncate text-sm font-medium text-[#fafafa]">{title}</div>
        {detail ? <div className="mt-0.5 truncate text-xs text-[#71717a]">{detail}</div> : null}
      </div>
      {meta}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0 rounded-md border border-[#27272a] bg-[#0b0b0e] px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-wider text-[#52525b]">{label}</div>
      <div className="mt-1 truncate text-xs text-[#d4d4d8]">{value || '-'}</div>
    </div>
  );
}

function ActionButton({
  tone = 'neutral',
  className = '',
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'neutral' | 'emerald' }) {
  const classes = tone === 'emerald'
    ? 'border-[#10b981]/30 bg-[#10b981]/15 text-[#34d399] hover:bg-[#10b981]/25'
    : 'border-[#3f3f46] bg-[#18181b] text-[#d4d4d8] hover:border-[#52525b] hover:bg-[#27272a]';
  return (
    <button
      className={`inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium transition-colors ${classes} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function HealthLine({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-[#27272a] bg-[#0b0b0e] px-3 py-2">
      <span className="text-xs text-[#a1a1aa]">{label}</span>
      <Badge tone={tone}>{value}</Badge>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusTone[status] ?? 'neutral'}>{status}</Badge>;
}

function corpusStateTone(state: DiscordCorpusItem['state']): Tone {
  if (state === 'synced') return 'emerald';
  if (state === 'eligible') return 'cyan';
  if (state === 'stale') return 'amber';
  return 'neutral';
}

function Rows({ children, empty }: { children: ReactNode[]; empty: string }) {
  if (children.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-start gap-3 rounded-lg border border-dashed border-[#27272a] bg-[#0b0b0e] p-4">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#71717a]" />
          <p className="text-sm leading-5 text-[#71717a]">{empty}</p>
        </div>
      </div>
    );
  }
  return <div className="divide-y divide-[#1f1f23]">{children}</div>;
}

function buildLeaderboard(rows: DiscordPointsRow[]) {
  return [...rows.reduce((map, row) => {
    const current = map.get(row.discord_user_id) ?? {
      discord_user_id: row.discord_user_id,
      username: row.discord_username ?? row.discord_user_id,
      points: 0,
    };
    current.username = row.discord_username ?? current.username;
    current.points += Number(row.points ?? 0);
    map.set(row.discord_user_id, current);
    return map;
  }, new Map<string, { discord_user_id: string; username: string; points: number }>()).values()]
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);
}

function scoreOperatingHealth(input: {
  activeWorker: boolean;
  failures: number;
  openDeadLetters: number;
  pendingReviews: number;
  capturedMessages: number;
}) {
  let score = 100;
  if (!input.activeWorker) score -= 35;
  score -= Math.min(20, input.failures * 4);
  score -= Math.min(25, input.openDeadLetters * 8);
  if (input.pendingReviews > 12) score -= 8;
  if (input.capturedMessages === 0) score -= 8;
  return Math.max(0, Math.min(100, score));
}

function nextOperatorMove(input: {
  applications: DiscordApplicationRow[];
  contentDrafts: DiscordContentDraftRow[];
  challengeSubmissions: DiscordChallengeSubmissionRow[];
}) {
  if (input.applications.length) return 'Review member applications';
  if (input.contentDrafts.some((draft) => draft.status === 'pending_approval')) return 'Approve daily content drafts';
  if (input.challengeSubmissions.some((submission) => submission.status === 'pending')) return 'Review challenge submissions';
  return 'Seed the next content cycle';
}

function sortCorpusItems(a: DiscordCorpusItem, b: DiscordCorpusItem) {
  const rank = { stale: 0, eligible: 1, blocked: 2, synced: 3 } as Record<DiscordCorpusItem['state'], number>;
  const byRank = rank[a.state] - rank[b.state];
  if (byRank !== 0) return byRank;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}
