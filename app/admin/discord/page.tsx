import type { ReactNode } from 'react';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  Activity,
  AlertTriangle,
  Award,
  BookOpenCheck,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
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
import { loadDiscordObservabilityQualityRollup } from '@/lib/discord/observability-quality';
import {
  buildDiscordProofBacklogReport,
  type DiscordProofChecklistStep,
  type DiscordProofBacklogLane,
} from '@/lib/discord/proof-backlog';
import {
  buildDiscordFinalScorecard,
  buildDiscordFinalScorecardSummary,
} from '@/lib/discord/final-scorecard';
import {
  buildWorldClassReadinessReport,
  type WorldClassReadinessCategory,
} from '@/lib/discord/world-class-readiness';
import {
  approveDiscordAnswerForRagAction,
  approveDiscordApplication,
  approveDiscordQueueItemForRagAction,
  approveDiscordQuestionForRagAction,
  assignDiscordPremiumReviewAction,
  cancelDiscordJobRunAction,
  completeDiscordPremiumReviewAction,
  createRagEvalKnowledgeTaskAction,
  publishDiscordContentDraftAction,
  rejectDiscordApplication,
  resolveDiscordJobDeadLetterAction,
  retryDiscordJobDeadLetterAction,
  reviewDiscordMemberNudgeAction,
  reviewDiscordKnowledgeCandidateAction,
  reviewDiscordChallengeSubmissionAction,
  reviewDiscordContentDraftAction,
  reviewDiscordPublicGrowthDraftAction,
  reviewDiscordPublicProofSourceAction,
  syncDiscordRagSourcesAction,
  updateDiscordContentQueueStatus,
} from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Discord Command Center', robots: { index: false, follow: false } };

type Tone = 'neutral' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet';

const PROOF_LANE_OPERATING_BLOCKERS: Record<string, string> = {
  approved_discord_knowledge: 'approved_discord_knowledge_sources_empty',
  rag_discord_sources: 'rag_discord_sources_empty',
  public_proof_assets: 'public_proof_drafts_empty',
  premium_workflow_proof: 'premium_workflow_live_proof_empty',
};

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

type DiscordMemberIntelligenceProfileRow = {
  discord_user_id: string;
  username: string | null;
  segment: string;
  segment_confidence: number;
  segment_reasons: string[] | null;
  next_best_action: string;
  next_nudge_key: string | null;
  next_nudge_reason: string | null;
  risk_flags: string[] | null;
  strengths: string[] | null;
  total_points: number;
  current_streak: number;
  onboarding_steps_completed: number;
  last_activity_at: string | null;
  calculated_at: string;
};

type DiscordMemberNudgeQueueRow = {
  id: string;
  discord_user_id: string;
  discord_username: string | null;
  nudge_key: string;
  reason: string;
  status: string;
  priority: number;
  rate_limit_until: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
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
  source_message_id: string | null;
  source_classification_action: string | null;
  source_classification_category: string | null;
  discord_username: string | null;
  status: string;
  priority: number;
  metadata: Record<string, unknown> | null;
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

type DiscordPublicGrowthDraftRow = {
  id: string;
  draft_type: string;
  title: string;
  body: string;
  status: string;
  privacy_score: number;
  quality_score: number;
  utm_campaign: string;
  reviewer_email: string | null;
  reviewed_at: string | null;
  published_at: string | null;
  created_at: string;
  discord_public_proof_sources?: Array<{
    title: string | null;
    source_type: string | null;
    permission_status: string | null;
    privacy_score: number | null;
  }> | null;
};

type DiscordPublicProofSourceRow = {
  id: string;
  source_type: string;
  source_table: string | null;
  source_record_id: string | null;
  title: string;
  summary: string;
  permission_status: string;
  privacy_score: number;
  created_at: string;
  updated_at: string;
};

type DiscordGrowthEventRow = {
  id: string;
  event_type: string;
  source: string | null;
  utm_campaign: string | null;
  path: string | null;
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

type DiscordJobRegistryRow = {
  job_key: string;
  job_name: string;
  schedule: string | null;
  owner: string;
  idempotency_scope: string;
  max_retries: number;
  retryable: boolean;
  enabled: boolean;
  side_effects: string[] | null;
  updated_at: string;
};

type DiscordJobRunRow = {
  run_key: string;
  job_key: string;
  status: string;
  idempotency_key: string;
  attempt: number;
  max_retries: number;
  next_retry_at: string | null;
  error_code: string | null;
  error_message: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
};

type DiscordJobDeadLetterRow = {
  id: string;
  run_key: string;
  job_key: string;
  reason: string;
  retryable: boolean;
  resolved_at: string | null;
  retry_run_key: string | null;
  created_at: string;
};

type DiscordPremiumReviewRow = {
  id: string;
  discord_user_id: string;
  discord_username: string | null;
  review_type: string;
  status: string;
  priority: number;
  summary: string;
  assigned_to: string | null;
  sla_due_at: string | null;
  completed_at: string | null;
  follow_up_due_at?: string | null;
  response_quality_score: number | null;
  created_at: string;
};

type DiscordPremiumWorkflowEventRow = {
  id: string;
  request_id: string | null;
  event_type: string;
  actor: string | null;
  status: string | null;
  note: string | null;
  created_at: string;
};

type DiscordOfficeHoursRow = {
  id: string;
  discord_user_id: string;
  discord_username: string | null;
  status: string;
  priority: number;
  question: string;
  premium_member: boolean;
  created_at: string;
};

type DiscordFinalScorecardRunRow = {
  run_key: string;
  status: string;
  average_score: number;
  blocked_below_95: string[] | null;
  created_at: string;
};

type ProofRehearsalLaneRow = {
  key: string;
  title: string;
  command: string;
  evidencePath: string;
  mutationMode: string;
  requiredContracts: string[];
  checks: Record<string, boolean>;
  ok: boolean;
  latestEvidence: {
    path: string;
    ok: boolean;
    timestamp: string | null;
    ageHours: number | null;
  } | null;
  note: string;
};

type ProofRehearsalReadiness = {
  ok: boolean;
  generatedAt: string;
  mutationMode: string;
  releaseMeaning: string;
  lanes: ProofRehearsalLaneRow[];
  missingOrStale: Array<{ key: string; failedChecks: string[] }>;
};

type ContentFactoryReadiness = {
  ok: boolean;
  generatedAt: string;
  mutationMode: string;
  sourceEvidence: string;
  dryRun: boolean;
  planned: number;
  created: number;
  skipped: number;
  failed: number;
  draftCount: number;
  minQualityScore: number | null;
  channelCoverage: string[];
  draftTypeCoverage: string[];
  topicCoverageCount: number;
  approvalGate: {
    noPublicPublish: boolean;
    adminApprovalRequired: boolean;
    readOnly: boolean;
  };
  failures: string[];
  releaseMeaning: string;
};

type ProofIntakeField = {
  key: string;
  label: string;
  description: string;
  required: boolean;
};

type ProofIntakeLane = {
  key: string;
  title: string;
  targetCount: number;
  adminSurface: string;
  sourceTables: string[];
  requiredFields: ProofIntakeField[];
  acceptanceChecks: string[];
  rejectionChecks: string[];
  privacyChecks: string[];
  verificationCommands: string[];
  evidencePaths: string[];
};

type ProofIntakeReadiness = {
  ok: boolean;
  generatedAt: string;
  mutationMode: string;
  releaseMeaning: string;
  lanes: ProofIntakeLane[];
  requiredLaneCount: number;
  requiredFieldCount: number;
  failures: string[];
  weeklyIntakeOrder: string[];
};

type DiscordOperatorBriefEvidence = {
  ok: boolean;
  generatedAt: string;
  mutationMode: string;
  releaseDecision: string;
  averageScore: number | null;
  worldClassEligible: boolean;
  currentReality: string;
  blockedLaneCount: number;
  commandOrder: string[];
  nonClaimRule: string;
};

const cockpitTabs = [
  ['overview', 'Overview'],
  ['members', 'Members'],
  ['knowledge', 'Knowledge/RAG'],
  ['content', 'Content'],
  ['learning', 'Learning'],
  ['jobs', 'Jobs'],
  ['premium', 'Premium'],
  ['quality', 'Quality'],
  ['audit', 'Audit'],
] as const;

const statusTone: Record<string, Tone> = {
  approved: 'emerald',
  archived: 'neutral',
  anonymized: 'emerald',
  blocked: 'rose',
  captured: 'cyan',
  canceled: 'neutral',
  dead_lettered: 'rose',
  draft: 'amber',
  drafted: 'violet',
  explicit: 'emerald',
  failed: 'rose',
  featured: 'emerald',
  heartbeat_ack: 'emerald',
  pending: 'amber',
  pending_approval: 'amber',
  published: 'emerald',
  ready: 'emerald',
  rejected: 'rose',
  requeued: 'cyan',
  resumed: 'emerald',
  running: 'cyan',
  succeeded: 'emerald',
  queued: 'amber',
  skipped: 'amber',
  suppressed: 'neutral',
  triaged: 'cyan',
};

export default async function AdminDiscordPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined> }) {
  const { profile } = await requireAdmin();
  const sb = supabaseAdmin();
  const proofRehearsalReadiness = await loadProofRehearsalReadiness();
  const contentFactoryReadiness = await loadContentFactoryReadiness();
  const operatorBrief = await loadDiscordOperatorBrief();
  const proofIntakeReadiness = await loadProofIntakeReadiness();
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const promptDebug = resolvedSearchParams.promptDebug === '1';
  const requestedTab = typeof resolvedSearchParams.tab === 'string' ? resolvedSearchParams.tab : 'overview';
  const activeTab = cockpitTabs.some(([key]) => key === requestedTab) ? requestedTab : 'overview';

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const since7d = new Date();
  since7d.setDate(since7d.getDate() - 7);

  const [
    eventsRes,
    membersRes,
    memberIntelligenceRes,
    memberNudgesRes,
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
    jobRegistryRes,
    jobRunsRes,
    jobDeadLettersRes,
    premiumReviewsRes,
    premiumProofReviewsRes,
    premiumWorkflowEventsRes,
    officeHoursRes,
    publicGrowthDraftsRes,
    publicProofSourcesRes,
    growthEventsRes,
    latestFinalScorecardRes,
    questionsApprovedCountRes,
    answersHelpfulCountRes,
    contentQueuePublishedCountRes,
    draftsApprovedCountRes,
    discordRagSourceCountRes,
    pendingKnowledgeCandidatesCountRes,
    pendingPublicDraftsCountRes,
    publishedPublicDraftsCountRes,
    approvedMemberCountRes,
    onboardedMemberCountRes,
    activeMember7dCountRes,
    applicationsSubmittedCountRes,
    applicationsApprovedCountRes,
    premiumReviewProofCountRes,
    officeHoursProofCountRes,
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
      .from('discord_member_intelligence_profiles')
      .select('discord_user_id, username, segment, segment_confidence, segment_reasons, next_best_action, next_nudge_key, next_nudge_reason, risk_flags, strengths, total_points, current_streak, onboarding_steps_completed, last_activity_at, calculated_at')
      .order('segment_confidence', { ascending: false })
      .order('calculated_at', { ascending: false })
      .limit(24),
    sb
      .from('discord_member_nudge_queue')
      .select('id, discord_user_id, discord_username, nudge_key, reason, status, priority, rate_limit_until, created_at, metadata')
      .in('status', ['queued', 'approved'])
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(24),
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
      .select('id, idea, angle, source, source_message_id, source_classification_action, source_classification_category, discord_username, status, priority, metadata, created_at')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20),
    sb
      .from('discord_content_drafts')
      .select('id, draft_type, target_channel_base_name, title, body, status, quality_score, prompt_version, metadata, created_at')
      .in('status', ['draft', 'pending_approval', 'approved'])
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
    sb
      .from('discord_job_registry')
      .select('job_key, job_name, schedule, owner, idempotency_scope, max_retries, retryable, enabled, side_effects, updated_at')
      .order('owner', { ascending: true })
      .order('job_key', { ascending: true })
      .limit(40),
    sb
      .from('discord_job_runs')
      .select('run_key, job_key, status, idempotency_key, attempt, max_retries, next_retry_at, error_code, error_message, started_at, finished_at, created_at')
      .order('created_at', { ascending: false })
      .limit(30),
    sb
      .from('discord_job_dead_letters')
      .select('id, run_key, job_key, reason, retryable, resolved_at, retry_run_key, created_at')
      .is('resolved_at', null)
      .order('created_at', { ascending: false })
      .limit(20),
    sb
      .from('discord_premium_review_requests')
      .select('id, discord_user_id, discord_username, review_type, status, priority, summary, assigned_to, sla_due_at, completed_at, response_quality_score, created_at')
      .in('status', ['queued', 'in_review'])
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(20),
    sb
      .from('discord_premium_review_requests')
      .select('id, discord_user_id, discord_username, review_type, status, priority, summary, assigned_to, sla_due_at, completed_at, follow_up_due_at, response_quality_score, created_at')
      .in('status', ['answered', 'closed'])
      .order('completed_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(12),
    sb
      .from('discord_premium_workflow_events')
      .select('id, request_id, event_type, actor, status, note, created_at')
      .order('created_at', { ascending: false })
      .limit(16),
    sb
      .from('discord_office_hours_queue')
      .select('id, discord_user_id, discord_username, status, priority, question, premium_member, created_at')
      .in('status', ['queued', 'selected'])
      .order('premium_member', { ascending: false })
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(20),
    sb
      .from('discord_public_growth_drafts')
      .select('id, draft_type, title, body, status, privacy_score, quality_score, utm_campaign, reviewer_email, reviewed_at, published_at, created_at, discord_public_proof_sources(title, source_type, permission_status, privacy_score)')
      .in('status', ['draft', 'pending_approval', 'approved'])
      .order('quality_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(16),
    sb
      .from('discord_public_proof_sources')
      .select('id, source_type, source_table, source_record_id, title, summary, permission_status, privacy_score, created_at, updated_at')
      .order('privacy_score', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(16),
    sb
      .from('discord_growth_events')
      .select('id, event_type, source, utm_campaign, path, created_at')
      .order('created_at', { ascending: false })
      .limit(16),
    sb
      .from('discord_final_scorecard_runs')
      .select('run_key, status, average_score, blocked_below_95, created_at')
      .order('created_at', { ascending: false })
      .limit(1),
    sb
      .from('discord_questions')
      .select('id', { count: 'exact', head: true })
      .in('status', ['answered', 'closed']),
    sb
      .from('discord_answers')
      .select('id', { count: 'exact', head: true })
      .eq('helpful', true),
    sb
      .from('discord_content_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
    sb
      .from('discord_content_drafts')
      .select('id', { count: 'exact', head: true })
      .in('status', ['approved', 'published']),
    sb
      .from('rag_sources')
      .select('id', { count: 'exact', head: true })
      .or('source_type.in.(discord_question,discord_answer,discord_content_queue),source_table.eq.discord_content_drafts'),
    sb
      .from('discord_content_queue')
      .select('id', { count: 'exact', head: true })
      .in('status', ['captured', 'candidate', 'pending_review']),
    sb
      .from('discord_public_growth_drafts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending_approval'),
    sb
      .from('discord_public_growth_drafts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
    sb
      .from('discord_members')
      .select('discord_user_id', { count: 'exact', head: true })
      .eq('academy_member', true),
    sb
      .from('discord_members')
      .select('discord_user_id', { count: 'exact', head: true })
      .not('onboarding_completed_at', 'is', null),
    sb
      .from('discord_members')
      .select('discord_user_id', { count: 'exact', head: true })
      .gte('last_seen_at', since7d.toISOString()),
    sb
      .from('discord_member_applications')
      .select('id', { count: 'exact', head: true }),
    sb
      .from('discord_member_applications')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved'),
    sb
      .from('discord_premium_review_requests')
      .select('id', { count: 'exact', head: true })
      .in('status', ['queued', 'in_review', 'answered', 'completed']),
    sb
      .from('discord_office_hours_queue')
      .select('id', { count: 'exact', head: true })
      .in('status', ['queued', 'selected', 'scheduled', 'completed']),
  ]);

  const events = (eventsRes.data ?? []) as DiscordEventRow[];
  const members = (membersRes.data ?? []) as DiscordMemberRow[];
  const memberIntelligence = (memberIntelligenceRes.data ?? []) as DiscordMemberIntelligenceProfileRow[];
  const memberNudges = (memberNudgesRes.data ?? []) as DiscordMemberNudgeQueueRow[];
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
  const jobRegistry = (jobRegistryRes.data ?? []) as DiscordJobRegistryRow[];
  const jobRuns = (jobRunsRes.data ?? []) as DiscordJobRunRow[];
  const jobDeadLetters = (jobDeadLettersRes.data ?? []) as DiscordJobDeadLetterRow[];
  const premiumReviews = (premiumReviewsRes.data ?? []) as DiscordPremiumReviewRow[];
  const premiumProofReviews = (premiumProofReviewsRes.data ?? []) as DiscordPremiumReviewRow[];
  const premiumWorkflowEvents = (premiumWorkflowEventsRes.data ?? []) as DiscordPremiumWorkflowEventRow[];
  const officeHours = (officeHoursRes.data ?? []) as DiscordOfficeHoursRow[];
  const publicGrowthDrafts = (publicGrowthDraftsRes.data ?? []) as DiscordPublicGrowthDraftRow[];
  const publicProofSources = (publicProofSourcesRes.data ?? []) as DiscordPublicProofSourceRow[];
  const growthEvents = (growthEventsRes.data ?? []) as DiscordGrowthEventRow[];
  const latestFinalScorecard = ((latestFinalScorecardRes.data ?? []) as DiscordFinalScorecardRunRow[])[0] ?? null;
  const approvedDiscordKnowledgeSources = (questionsApprovedCountRes.count ?? 0)
    + (answersHelpfulCountRes.count ?? 0)
    + (contentQueuePublishedCountRes.count ?? 0)
    + (draftsApprovedCountRes.count ?? 0);
  const proofBacklog = buildDiscordProofBacklogReport({
    generatedAt: new Date().toISOString(),
    metrics: {
      approvedDiscordKnowledgeSources,
      ragDiscordSources: discordRagSourceCountRes.count ?? 0,
      pendingKnowledgeCandidates: pendingKnowledgeCandidatesCountRes.count ?? 0,
      pendingPublicDrafts: pendingPublicDraftsCountRes.count ?? 0,
      publishedPublicDrafts: publishedPublicDraftsCountRes.count ?? 0,
      approvedMembers: approvedMemberCountRes.count ?? 0,
      onboardedMembers: onboardedMemberCountRes.count ?? 0,
      activeMembers7d: activeMember7dCountRes.count ?? 0,
      premiumMembers: premiumCountRes.count ?? 0,
      premiumWorkflowProofs: (premiumCountRes.count ?? 0)
        + (premiumReviewProofCountRes.count ?? 0)
        + (officeHoursProofCountRes.count ?? 0),
      applicationsSubmitted: applicationsSubmittedCountRes.count ?? 0,
      applicationsApproved: applicationsApprovedCountRes.count ?? 0,
    },
  });
  const localScorecard = buildDiscordFinalScorecard();
  const localScorecardSummary = buildDiscordFinalScorecardSummary(localScorecard);
  const worldClassReadiness = buildWorldClassReadinessReport({
    generatedAt: new Date().toISOString(),
    averageScore: localScorecardSummary.averageScore,
    worldClassThreshold: localScorecardSummary.worldClassThreshold,
    worldClassEligible: localScorecardSummary.worldClassEligible,
    scorecard: localScorecard,
    operatingBlockers: proofBacklog.lanes
      .filter((lane) => lane.status === 'blocked')
      .map((lane) => PROOF_LANE_OPERATING_BLOCKERS[lane.key])
      .filter((blocker): blocker is string => Boolean(blocker)),
    requiredOperatingProof: localScorecardSummary.requiredOperatingProof,
  });
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
  const observabilityQuality = await loadDiscordObservabilityQualityRollup({ windowHours: 24, persist: false });
  const gatewayHeartbeats = (gatewayHeartbeatsRes.data ?? []) as DiscordGatewayHeartbeatRow[];
  const failures = events.filter((event) => event.event_type.includes('failed')).length;
  const openDeadLetters = gatewayDeadLetterCountRes.count ?? 0;
  const activeWorker = gatewayHeartbeats.some((heartbeat) => ['ready', 'resumed', 'heartbeat_ack'].includes(heartbeat.status));
  const pendingDrafts = contentDrafts.filter((draft) => draft.status === 'pending_approval').length;
  const pendingReviews = applications.length
    + pendingDrafts
    + challengeSubmissions.filter((item) => item.status === 'pending').length
    + memberNudges.filter((item) => item.status === 'queued').length
    + premiumReviews.length
    + officeHours.length
    + jobDeadLetters.length;
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
        <nav className="mb-4 flex flex-wrap gap-2" aria-label="Discord cockpit sections">
          {cockpitTabs.map(([key, label]) => (
            <a
              key={key}
              href={`/admin/discord?tab=${key}${promptDebug ? '&promptDebug=1' : ''}`}
              className={`inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium transition ${
                activeTab === key
                  ? 'border-[#22d3ee]/50 bg-[#06b6d4]/15 text-[#67e8f9]'
                  : 'border-[#27272a] bg-[#111116] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-[#fafafa]'
              }`}
            >
              {label}
            </a>
          ))}
        </nav>
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
                <MetricCard icon={Radio} label="Durable jobs" value={jobRegistry.length} detail={`${jobDeadLetters.length} open dead letters`} tone={jobDeadLetters.length ? 'rose' : 'emerald'} />
                <MetricCard icon={BookOpenCheck} label="RAG corpus health" value={`${corpusHealth.healthScore}%`} detail={`${corpusHealth.authoritativeSources} authoritative / ${corpusHealth.missing} missing`} tone={corpusHealth.healthScore >= 85 ? 'emerald' : corpusHealth.healthScore >= 65 ? 'amber' : 'rose'} />
                <MetricCard icon={HeartPulse} label="RAG ops health" value={ragOperationalHealth.status} detail={`${Math.round(ragOperationalHealth.embeddingCoverage * 100)}% embedded / ${latestEvalRun ? `${latestEvalRun.passed}/${latestEvalRun.total_questions} eval` : 'no eval'}`} tone={ragOperationalHealth.status === 'healthy' ? 'emerald' : ragOperationalHealth.status === 'watch' ? 'amber' : 'rose'} />
                <MetricCard icon={Activity} label="Quality intelligence" value={`${observabilityQuality.healthScore}%`} detail={`${Math.round(observabilityQuality.traceCoverage * 100)}% traced / $${observabilityQuality.cost.estimatedUsd.toFixed(4)}`} tone={observabilityQuality.status === 'healthy' ? 'emerald' : observabilityQuality.status === 'watch' ? 'amber' : 'rose'} />
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
                  <HealthLine label="Gateway dead letters" value={String(openDeadLetters)} tone={openDeadLetters ? 'rose' : 'emerald'} />
                  <HealthLine label="Job dead letters" value={String(jobDeadLetters.length)} tone={jobDeadLetters.length ? 'rose' : 'emerald'} />
                  <HealthLine label="Last scheduled run" value={lastRun ? `${lastRun.kind} / ${lastRun.status}` : 'No run yet'} tone={lastRun?.status === 'failed' ? 'rose' : lastRun ? 'emerald' : 'amber'} />
                  <HealthLine
                    label="Final scorecard"
                    value={latestFinalScorecard ? `${latestFinalScorecard.average_score}/100` : 'No run'}
                    tone={!latestFinalScorecard ? 'amber' : latestFinalScorecard.average_score >= 95 ? 'emerald' : latestFinalScorecard.average_score >= 85 ? 'amber' : 'rose'}
                  />
                  <HealthLine
                    label="95+ blockers"
                    value={latestFinalScorecard ? String(latestFinalScorecard.blocked_below_95?.length ?? 0) : 'unknown'}
                    tone={!latestFinalScorecard ? 'amber' : (latestFinalScorecard.blocked_below_95?.length ?? 0) === 0 ? 'emerald' : 'rose'}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]" data-testid="discord-proof-backlog">
          <Card className="rounded-lg border-[#27272a] bg-[#0f0f12]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-md border border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#fbbf24]">
                  <AlertTriangle className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#fafafa]">World-class proof backlog</h2>
                  <p className="text-xs text-[#71717a]">The exact proof lanes blocking a 95+ claim.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2">
                <HealthLine
                  label="Release claim"
                  value={proofBacklog.status === 'passed' ? 'eligible' : 'blocked'}
                  tone={proofBacklog.status === 'passed' ? 'emerald' : 'rose'}
                />
                <HealthLine
                  label="Blocked lanes"
                  value={String(proofBacklog.lanes.filter((lane) => lane.status === 'blocked').length)}
                  tone={proofBacklog.status === 'passed' ? 'emerald' : 'amber'}
                />
                <HealthLine
                  label="Source of truth"
                  value="live counts"
                  tone="cyan"
                />
              </div>
              <div className="mt-4 rounded-md border border-[#27272a] bg-[#0b0b0e] p-3 text-xs leading-5 text-[#a1a1aa]">
                This panel reads current database counts. It does not count dry-run content, raw unapproved Discord chatter, or synthetic smoke rows as world-class proof.
              </div>
            </CardContent>
          </Card>

          <Panel
            icon={AlertTriangle}
            title="Proof lanes"
            meta={`${proofBacklog.lanes.filter((lane) => lane.status === 'blocked').length} blocked / ${proofBacklog.lanes.length} total`}
            empty="All proof lanes have met their current target."
          >
            {proofBacklog.lanes.map((lane) => (
              <ProofBacklogLaneRow key={lane.key} lane={lane} />
            ))}
          </Panel>

          <Panel
            icon={FileCheck2}
            title="Weekly proof checklist"
            meta={`${proofBacklog.weeklyChecklist.length} operator steps`}
            empty="No blocked proof lanes. Keep running weekly scorecard verification."
          >
            {proofBacklog.weeklyChecklist.map((step) => (
              <ProofChecklistStepRow key={step.laneKey} step={step} />
            ))}
          </Panel>
        </section>

        <section className="mt-6" data-testid="discord-operator-brief">
          <Panel
            icon={ClipboardCheck}
            title="Operator brief"
            meta={operatorBrief.ok
              ? `${operatorBrief.averageScore ?? 'n/a'}/100 / ${operatorBrief.blockedLaneCount} blocked`
              : 'missing evidence'}
            empty="Operator brief evidence has not been generated. Run npm run discord:operator-brief."
          >
            <div className="grid gap-3 px-3 py-3 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-md border border-[#27272a] bg-[#09090b] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={operatorBrief.worldClassEligible ? 'emerald' : 'rose'}>
                    {operatorBrief.releaseDecision.replaceAll('_', ' ')}
                  </Badge>
                  <Badge tone="neutral">{operatorBrief.mutationMode}</Badge>
                </div>
                <p className="mt-3 text-xs leading-5 text-[#a1a1aa]">{operatorBrief.currentReality}</p>
                <div className="mt-3 rounded-md border border-[#f59e0b]/25 bg-[#f59e0b]/10 px-3 py-2 text-xs leading-5 text-[#facc15]">
                  {operatorBrief.nonClaimRule}
                </div>
              </div>
              <div className="rounded-md border border-[#27272a] bg-[#09090b] p-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#fafafa]">Command order</div>
                <ol className="mt-3 space-y-1.5 text-[11px] leading-4 text-[#a1a1aa]">
                  {operatorBrief.commandOrder.slice(0, 8).map((command, index) => (
                    <li key={command} className="grid grid-cols-[18px_1fr] gap-2">
                      <span className="text-[#71717a]">{index + 1}.</span>
                      <code className="break-words rounded border border-[#27272a] bg-[#0f0f12] px-1.5 py-0.5 text-[#d4d4d8]">{command}</code>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Panel>
        </section>

        <section className="mt-6" data-testid="discord-proof-intake-readiness">
          <Panel
            icon={FileCheck2}
            title="Proof intake readiness"
            meta={proofIntakeReadiness.ok
              ? `${proofIntakeReadiness.requiredLaneCount} lanes / ${proofIntakeReadiness.requiredFieldCount} fields`
              : `${proofIntakeReadiness.failures.length} failures`}
            empty="Proof intake readiness has not been generated. Run npm run discord:proof-intake-readiness."
          >
            <div className="grid gap-3 px-3 py-3 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-md border border-[#27272a] bg-[#09090b] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={proofIntakeReadiness.ok ? 'emerald' : 'rose'}>{proofIntakeReadiness.ok ? 'contract ready' : 'missing contract'}</Badge>
                  <Badge tone="neutral">{proofIntakeReadiness.mutationMode}</Badge>
                </div>
                <p className="mt-3 text-xs leading-5 text-[#a1a1aa]">{proofIntakeReadiness.releaseMeaning}</p>
              </div>
              <div className="rounded-md border border-[#27272a] bg-[#09090b] p-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#fafafa]">Weekly intake order</div>
                <ol className="mt-3 space-y-1.5 text-[11px] leading-4 text-[#a1a1aa]">
                  {proofIntakeReadiness.weeklyIntakeOrder.slice(0, 6).map((step, index) => (
                    <li key={step} className="grid grid-cols-[18px_1fr] gap-2">
                      <span className="text-[#71717a]">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            {proofIntakeReadiness.lanes.map((lane) => (
              <ProofIntakeLaneRow key={lane.key} lane={lane} />
            ))}
            {proofIntakeReadiness.failures.map((failure) => (
              <div key={failure} className="px-3 py-3 text-xs text-[#fca5a5]">
                {failure}
              </div>
            ))}
          </Panel>
        </section>

        <section className="mt-6" data-testid="discord-proof-rehearsal-readiness">
          <Panel
            icon={ShieldCheck}
            title="Proof rehearsal readiness"
            meta={`${proofRehearsalReadiness.lanes.filter((lane) => lane.ok).length}/${proofRehearsalReadiness.lanes.length} rehearsal lanes ready`}
            empty="Proof rehearsal readiness has not been generated. Run npm run discord:proof-rehearsal-readiness."
          >
            <div className="border-b border-[#27272a] px-3 py-3 text-xs leading-5 text-[#a1a1aa]">
              {proofRehearsalReadiness.releaseMeaning}
            </div>
            {proofRehearsalReadiness.lanes.map((lane) => (
              <ProofRehearsalLaneRow key={lane.key} lane={lane} />
            ))}
            {proofRehearsalReadiness.missingOrStale.map((item) => (
              <div key={item.key} className="px-3 py-3 text-xs text-[#fca5a5]">
                {item.key}: {item.failedChecks.join(', ')}
              </div>
            ))}
          </Panel>
        </section>

        <section className="mt-6" data-testid="discord-content-factory-readiness">
          <Panel
            icon={CalendarDays}
            title="Content factory readiness"
            meta={contentFactoryReadiness.ok
              ? `${contentFactoryReadiness.planned} planned / min quality ${contentFactoryReadiness.minQualityScore ?? 'n/a'}`
              : `${contentFactoryReadiness.failures.length} readiness failures`}
            empty="Content factory readiness has not been generated. Run npm run discord:content-factory-readiness."
          >
            <div className="border-b border-[#27272a] px-3 py-3 text-xs leading-5 text-[#a1a1aa]">
              {contentFactoryReadiness.releaseMeaning}
            </div>
            <div className="grid gap-3 px-3 py-3 lg:grid-cols-4">
              <HealthLine
                label="Dry run"
                value={contentFactoryReadiness.dryRun ? 'yes' : 'no'}
                tone={contentFactoryReadiness.dryRun ? 'emerald' : 'rose'}
              />
              <HealthLine
                label="Drafts"
                value={`${contentFactoryReadiness.planned} planned / ${contentFactoryReadiness.created} created`}
                tone={contentFactoryReadiness.created === 0 ? 'emerald' : 'rose'}
              />
              <HealthLine
                label="Quality"
                value={contentFactoryReadiness.minQualityScore === null ? 'missing' : `${contentFactoryReadiness.minQualityScore}/100`}
                tone={(contentFactoryReadiness.minQualityScore ?? 0) >= 90 ? 'emerald' : 'amber'}
              />
              <HealthLine
                label="Approval gate"
                value={contentFactoryReadiness.approvalGate.adminApprovalRequired ? 'required' : 'missing'}
                tone={contentFactoryReadiness.approvalGate.adminApprovalRequired ? 'emerald' : 'rose'}
              />
            </div>
            <div className="grid gap-3 border-t border-[#27272a] px-3 py-3 text-xs leading-5 text-[#a1a1aa] lg:grid-cols-[1fr_1fr_auto]">
              <div>
                <div className="font-semibold text-[#fafafa]">Channels</div>
                <div className="mt-1">{contentFactoryReadiness.channelCoverage.join(', ') || 'none'}</div>
              </div>
              <div>
                <div className="font-semibold text-[#fafafa]">Draft types</div>
                <div className="mt-1">{contentFactoryReadiness.draftTypeCoverage.join(', ') || 'none'}</div>
              </div>
              <div className="lg:text-right">
                <div className="font-semibold text-[#fafafa]">Refresh</div>
                <div className="mt-1">npm run discord:content-factory-readiness</div>
              </div>
            </div>
            {contentFactoryReadiness.failures.map((failure) => (
              <div key={failure} className="px-3 py-3 text-xs text-[#fca5a5]">
                {failure}
              </div>
            ))}
          </Panel>
        </section>

        <section className="mt-6" data-testid="discord-world-class-readiness-triage">
          <Panel
            icon={Trophy}
            title="World-class readiness triage"
            meta={`${worldClassReadiness.summary.categoriesBelow95} below 95 / ${worldClassReadiness.summary.categoriesBelow85} below 85`}
            empty="All scorecard categories are at or above the current world-class threshold."
          >
            {worldClassReadiness.categories.slice(0, 8).map((category) => (
              <WorldClassReadinessCategoryRow key={category.category} category={category} />
            ))}
          </Panel>
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

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]" id="quality" data-testid="discord-observability-quality">
          <Card className="rounded-lg border-[#27272a] bg-[#0f0f12]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-md border border-[#22d3ee]/30 bg-[#06b6d4]/10 text-[#67e8f9]">
                  <Activity className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#fafafa]">Observability, cost, and quality</h2>
                  <p className="text-xs text-[#71717a]">Last {observabilityQuality.window.hours}h trace, DeepSeek usage, eval, content, premium, and job posture.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <HealthLine label="Trace coverage" value={`${Math.round(observabilityQuality.traceCoverage * 100)}%`} tone={observabilityQuality.traceCoverage >= 0.8 ? 'emerald' : 'amber'} />
                <HealthLine label="DeepSeek estimated cost" value={`$${observabilityQuality.cost.estimatedUsd.toFixed(4)}`} tone={observabilityQuality.cost.estimatedUsd <= 5 ? 'emerald' : 'amber'} />
                <HealthLine label="RAG eval pass rate" value={`${Math.round(observabilityQuality.quality.ragEvalPassRate * 100)}%`} tone={observabilityQuality.quality.ragEvalPassRate >= 0.8 ? 'emerald' : 'amber'} />
                <HealthLine label="Content quality" value={`${Math.round(observabilityQuality.quality.avgContentQuality)} / 100`} tone={observabilityQuality.quality.avgContentQuality >= 80 ? 'emerald' : observabilityQuality.quality.avgContentQuality > 0 ? 'amber' : 'neutral'} />
                <HealthLine label="Premium quality" value={`${Math.round(observabilityQuality.quality.avgPremiumQuality)} / 100`} tone={observabilityQuality.quality.avgPremiumQuality >= 80 ? 'emerald' : observabilityQuality.quality.avgPremiumQuality > 0 ? 'amber' : 'neutral'} />
                <HealthLine label="Job success" value={`${Math.round(observabilityQuality.jobs.successRate * 100)}%`} tone={observabilityQuality.jobs.successRate >= 0.9 ? 'emerald' : 'rose'} />
              </div>
              <div className="mt-4 rounded-md border border-[#27272a] bg-[#0b0b0e] p-3 text-xs leading-5 text-[#a1a1aa]">
                Cost is estimated from persisted DeepSeek usage tokens in `rag_answers.metadata.usage`. Trace coverage counts recent RAG answers, retrieval logs, durable job runs, and content drafts with `ai_trace_id` or Langfuse trace metadata.
              </div>
            </CardContent>
          </Card>

          <Panel
            icon={AlertTriangle}
            title="Quality alerts"
            meta={`${observabilityQuality.alerts.length} active / ${observabilityQuality.status}`}
            empty="No Phase 17 quality, cost, trace, or job alerts in the current window."
          >
            {observabilityQuality.alerts.map((alert) => (
              <CompactRow
                key={alert}
                eyebrow="phase 17 alert"
                title={alert}
                detail={`${observabilityQuality.trace.tracedArtifacts}/${observabilityQuality.trace.totalTraceableArtifacts} traced / ${observabilityQuality.cost.totalTokens} tokens / ${observabilityQuality.jobs.openDeadLetters} dead letters`}
                meta={<Badge tone={observabilityQuality.status === 'critical' ? 'rose' : 'amber'}>{observabilityQuality.status}</Badge>}
              />
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
            icon={HeartPulse}
            title="Member intelligence"
            meta={`${memberIntelligence.length} profiles`}
            empty="No member intelligence profiles yet. Run the rebuild job after members have activity."
          >
            {memberIntelligence.map((member) => (
              <MemberIntelligenceRow key={member.discord_user_id} member={member} />
            ))}
          </Panel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel
            icon={Inbox}
            title="Member nudge queue"
            meta={`${memberNudges.length} active nudges`}
            empty="No queued member nudges. Stuck, inactive, or pending-review members will appear here after the rebuild job runs."
          >
            {memberNudges.map((nudge) => (
              <MemberNudgeRow key={nudge.id} nudge={nudge} />
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

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]" data-testid="discord-public-proof-growth-lane">
          <Panel
            icon={FileCheck2}
            title="Public proof source permissions"
            meta={`${publicProofSources.length} recent sources`}
            empty="No public proof sources yet. Approve community knowledge first, then run the operating cycle."
          >
            {publicProofSources.map((source) => (
              <PublicProofSourceRow key={source.id} source={source} />
            ))}
          </Panel>

          <Panel
            icon={GitPullRequestArrow}
            title="Public proof growth drafts"
            meta={`${publicGrowthDrafts.length} approval-gated drafts`}
            empty="No public proof drafts waiting for review. Run the operating cycle after approving source material."
          >
            {publicGrowthDrafts.map((draft) => (
              <PublicGrowthDraftRow key={draft.id} draft={draft} />
            ))}
          </Panel>
        </section>

        <section className="mt-6" data-testid="discord-public-proof-growth-events">
          <Panel
            icon={Activity}
            title="Public proof growth event ledger"
            meta={`${growthEvents.length} recent events`}
            empty="No tracked public proof growth events yet."
          >
            {growthEvents.map((event) => (
              <GrowthEventRow key={event.id} event={event} />
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

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]" id="jobs" data-testid="discord-durable-jobs">
          <Panel
            icon={Radio}
            title="Durable job control"
            meta={`${jobRegistry.length} registered / ${jobRuns.length} recent runs`}
            empty="No durable Discord jobs registered yet. Run the Phase 14 registry sync or durable job smoke."
          >
            {jobRegistry.map((job) => (
              <DurableJobRegistryRow
                key={job.job_key}
                job={job}
                latestRun={jobRuns.find((run) => run.job_key === job.job_key) ?? null}
              />
            ))}
          </Panel>

          <Panel
            icon={AlertTriangle}
            title="Job dead letters"
            meta={`${jobDeadLetters.length} open`}
            empty="No unresolved durable job dead letters."
          >
            {jobDeadLetters.map((deadLetter) => (
              <JobDeadLetterRow key={deadLetter.id} deadLetter={deadLetter} />
            ))}
          </Panel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]" id="premium">
          <Panel
            icon={Sparkles}
            title="Premium operations"
            meta={`${premiumReviews.length} reviews / ${officeHours.length} office-hours`}
            empty="No active premium review or office-hours queue items."
          >
            {[
              ...premiumReviews.map((review) => ({ kind: 'review' as const, item: review })),
              ...officeHours.map((slot) => ({ kind: 'office-hours' as const, item: slot })),
            ].map((entry) => (
              <PremiumOpsRow key={`${entry.kind}:${entry.item.id}`} entry={entry} />
            ))}
          </Panel>

          <Panel
            icon={FileCheck2}
            title="Premium proof ledger"
            meta={`${premiumProofReviews.length} fulfilled reviews / ${premiumWorkflowEvents.length} events`}
            empty="No fulfilled premium review proof yet. Complete one premium review or seeded premium scenario to create proof."
          >
            {premiumProofReviews.map((review) => (
              <PremiumProofReviewRow key={review.id} review={review} />
            ))}
            {premiumWorkflowEvents.slice(0, Math.max(0, 8 - premiumProofReviews.length)).map((event) => (
              <PremiumWorkflowEventRow key={event.id} event={event} />
            ))}
          </Panel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel
            icon={Users}
            title="Premium leads"
            meta={`${memberIntelligence.filter((member) => member.segment === 'premium_lead').length} leads`}
            empty="No premium leads identified yet."
          >
            {memberIntelligence.filter((member) => ['premium_lead', 'premium_member'].includes(member.segment)).slice(0, 12).map((member) => (
              <MemberIntelligenceRow key={`premium:${member.discord_user_id}`} member={member} />
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

          <Panel icon={Activity} title="Audit stream" meta={`${eventCountRes.count ?? 0} events, 30d`} empty="No Discord audit events recorded yet.">
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

async function loadProofRehearsalReadiness(): Promise<ProofRehearsalReadiness> {
  try {
    const raw = await readFile(
      path.join(process.cwd(), 'docs', 'evidence', 'engineering-loop', 'proof-rehearsal-readiness-latest.json'),
      'utf8',
    );
    return JSON.parse(raw) as ProofRehearsalReadiness;
  } catch {
    return {
      ok: false,
      generatedAt: new Date(0).toISOString(),
      mutationMode: 'missing_evidence',
      releaseMeaning: 'Proof rehearsal readiness evidence is missing. Run npm run discord:proof-rehearsal-readiness.',
      lanes: [],
      missingOrStale: [{ key: 'proof_rehearsal_readiness_missing', failedChecks: ['evidence_present'] }],
    };
  }
}

async function loadContentFactoryReadiness(): Promise<ContentFactoryReadiness> {
  try {
    const raw = await readFile(
      path.join(process.cwd(), 'docs', 'evidence', 'engineering-loop', 'content-factory-readiness-latest.json'),
      'utf8',
    );
    return JSON.parse(raw) as ContentFactoryReadiness;
  } catch {
    return {
      ok: false,
      generatedAt: new Date(0).toISOString(),
      mutationMode: 'missing_evidence',
      sourceEvidence: 'docs/evidence/discord-ai-os/phase-22-content-factory-dry-run.json',
      dryRun: false,
      planned: 0,
      created: 0,
      skipped: 0,
      failed: 0,
      draftCount: 0,
      minQualityScore: null,
      channelCoverage: [],
      draftTypeCoverage: [],
      topicCoverageCount: 0,
      approvalGate: {
        noPublicPublish: false,
        adminApprovalRequired: false,
        readOnly: false,
      },
      failures: ['content_factory_readiness_missing'],
      releaseMeaning: 'Content factory readiness evidence is missing. Run npm run discord:content-factory-readiness.',
    };
  }
}

async function loadDiscordOperatorBrief(): Promise<DiscordOperatorBriefEvidence> {
  try {
    const raw = await readFile(
      path.join(process.cwd(), 'docs', 'evidence', 'engineering-loop', 'discord-operator-brief-latest.json'),
      'utf8',
    );
    return JSON.parse(raw) as DiscordOperatorBriefEvidence;
  } catch {
    return {
      ok: false,
      generatedAt: new Date(0).toISOString(),
      mutationMode: 'missing_evidence',
      releaseDecision: 'do_not_claim_world_class',
      averageScore: null,
      worldClassEligible: false,
      currentReality: 'Operator brief evidence is missing. Run npm run discord:operator-brief before making release or quality claims.',
      blockedLaneCount: 0,
      commandOrder: ['npm run discord:operator-brief'],
      nonClaimRule: 'Do not claim world-class, 95+, production-complete, or operating-proof complete until the operator brief is regenerated from current evidence.',
    };
  }
}

async function loadProofIntakeReadiness(): Promise<ProofIntakeReadiness> {
  try {
    const raw = await readFile(
      path.join(process.cwd(), 'docs', 'evidence', 'engineering-loop', 'discord-proof-intake-readiness-latest.json'),
      'utf8',
    );
    return JSON.parse(raw) as ProofIntakeReadiness;
  } catch {
    return {
      ok: false,
      generatedAt: new Date(0).toISOString(),
      mutationMode: 'missing_evidence',
      releaseMeaning: 'Proof intake readiness evidence is missing. Run npm run discord:proof-intake-readiness. This does not satisfy real operating proof lanes.',
      lanes: [],
      requiredLaneCount: 0,
      requiredFieldCount: 0,
      failures: ['proof_intake_readiness_missing'],
      weeklyIntakeOrder: ['Run npm run discord:proof-intake-readiness before operating proof intake.'],
    };
  }
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

function MemberIntelligenceRow({ member }: { member: DiscordMemberIntelligenceProfileRow }) {
  const riskFlags = member.risk_flags ?? [];
  const strengths = member.strengths ?? [];
  const reasons = member.segment_reasons ?? [];
  return (
    <div className="grid gap-3 px-3 py-3 lg:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="truncate text-sm font-semibold text-[#fafafa]">{member.username ?? member.discord_user_id}</div>
          <Badge tone={segmentTone(member.segment)}>{member.segment}</Badge>
          <Badge tone={member.segment_confidence >= 85 ? 'emerald' : member.segment_confidence >= 70 ? 'amber' : 'neutral'}>{member.segment_confidence}% confidence</Badge>
          {member.next_nudge_key ? <Badge tone="cyan">{member.next_nudge_key}</Badge> : null}
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#a1a1aa]">{member.next_best_action}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#71717a]">
          <span>{member.total_points} pts</span>
          <span>{member.current_streak} day streak</span>
          <span>{member.onboarding_steps_completed} onboarding steps</span>
          {member.last_activity_at ? <span>Last: {formatDateTime(member.last_activity_at)}</span> : null}
        </div>
        {reasons.length ? (
          <div className="mt-2 text-[11px] leading-5 text-[#a1a1aa]">Why: {reasons.slice(0, 2).join(' / ')}</div>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {riskFlags.slice(0, 4).map((risk) => <Badge key={risk} tone="amber">{risk}</Badge>)}
          {strengths.slice(0, 4).map((strength) => <Badge key={strength} tone="emerald">{strength}</Badge>)}
        </div>
      </div>
      <div className="flex items-center gap-2 lg:justify-end">
        {member.next_nudge_reason ? <div className="max-w-[220px] text-right text-xs leading-5 text-[#71717a]">{member.next_nudge_reason}</div> : null}
      </div>
    </div>
  );
}

function MemberNudgeRow({ nudge }: { nudge: DiscordMemberNudgeQueueRow }) {
  return (
    <div className="grid gap-3 px-3 py-3 lg:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="truncate text-sm font-semibold text-[#fafafa]">{nudge.discord_username ?? nudge.discord_user_id}</div>
          <StatusBadge status={nudge.status} />
          <Badge tone="cyan">{nudge.nudge_key}</Badge>
          <Badge tone={nudge.priority >= 85 ? 'rose' : nudge.priority >= 70 ? 'amber' : 'neutral'}>{nudge.priority} priority</Badge>
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#a1a1aa]">{nudge.reason}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#71717a]">
          <span>Queued {formatDateTime(nudge.created_at)}</span>
          {nudge.rate_limit_until ? <span>Rate limited until {formatDateTime(nudge.rate_limit_until)}</span> : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        {nudge.status === 'queued' ? (
          <form action={reviewDiscordMemberNudgeAction}>
            <input type="hidden" name="id" value={nudge.id} />
            <input type="hidden" name="status" value="approved" />
            <ActionButton tone="emerald" type="submit">Approve nudge</ActionButton>
          </form>
        ) : null}
        <form action={reviewDiscordMemberNudgeAction}>
          <input type="hidden" name="id" value={nudge.id} />
          <input type="hidden" name="status" value="suppressed" />
          <ActionButton type="submit">Suppress</ActionButton>
        </form>
      </div>
    </div>
  );
}

function ProofBacklogLaneRow({ lane }: { lane: DiscordProofBacklogLane }) {
  return (
    <div className="grid gap-3 px-3 py-3 lg:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="truncate text-sm font-semibold text-[#fafafa]">{lane.title}</div>
          <Badge tone={lane.status === 'passed' ? 'emerald' : 'rose'}>{lane.status}</Badge>
          <Badge tone={lane.currentCount >= lane.targetCount ? 'emerald' : 'amber'}>
            {lane.currentCount}/{lane.targetCount}
          </Badge>
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#a1a1aa]">{lane.liveActionRequired}</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <ProofRuleGroup title="Qualifies" items={lane.qualifyingEvidence} tone="emerald" />
          <ProofRuleGroup title="Reject" items={lane.rejectionRules} tone="rose" />
          <ProofRuleGroup title="Weekly steps" items={lane.weeklyOperatorSteps} tone="cyan" />
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#71717a]">
          {lane.sourceTables.slice(0, 4).map((table) => <span key={table}>{table}</span>)}
          {lane.safeLocalCommand ? <span>{lane.safeLocalCommand}</span> : null}
        </div>
        <div className="mt-2 grid gap-2 text-[11px] leading-4 text-[#a1a1aa] md:grid-cols-2">
          <div className="rounded-md border border-[#27272a] bg-[#09090b] px-2 py-1.5">
            <span className="text-[#71717a]">Admin: </span>{lane.adminSurface}
          </div>
          <div className="rounded-md border border-[#27272a] bg-[#09090b] px-2 py-1.5">
            <span className="text-[#71717a]">Verify: </span>{lane.verificationCommand}
          </div>
        </div>
      </div>
      <div className="max-w-[260px] text-xs leading-5 text-[#71717a] lg:text-right">
        {lane.evidenceRequired}
      </div>
    </div>
  );
}

function ProofRuleGroup({ title, items, tone }: { title: string; items: string[]; tone: Tone }) {
  return (
    <div className="rounded-md border border-[#27272a] bg-[#09090b] p-3">
      <Badge tone={tone}>{title}</Badge>
      <ul className="mt-2 space-y-1.5 text-[11px] leading-4 text-[#a1a1aa]">
        {items.slice(0, 3).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ProofChecklistStepRow({ step }: { step: DiscordProofChecklistStep }) {
  return (
    <div className="grid gap-3 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="cyan">Step {step.order}</Badge>
          <div className="truncate text-sm font-semibold text-[#fafafa]">{step.title}</div>
        </div>
        <p className="mt-2 text-xs leading-5 text-[#a1a1aa]">{step.operatorAction}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#71717a]">
          {step.safeLocalCommand ? <span>check: {step.safeLocalCommand}</span> : null}
          {step.liveCommand ? <span>live: {step.liveCommand}</span> : null}
          <span>evidence: {step.evidencePath}</span>
        </div>
        <div className="mt-2 grid gap-2 text-[11px] leading-4 text-[#a1a1aa] md:grid-cols-2">
          <div className="rounded-md border border-[#27272a] bg-[#09090b] px-2 py-1.5">
            <span className="text-[#71717a]">Admin: </span>{step.adminSurface}
          </div>
          <div className="rounded-md border border-[#27272a] bg-[#09090b] px-2 py-1.5">
            <span className="text-[#71717a]">Verify: </span>{step.verificationCommand}
          </div>
        </div>
      </div>
      <div className="max-w-[300px] text-xs leading-5 text-[#71717a] lg:text-right">
        {step.acceptanceCriteria}
      </div>
    </div>
  );
}

function ProofRehearsalLaneRow({ lane }: { lane: ProofRehearsalLaneRow }) {
  const failedChecks = Object.entries(lane.checks).filter(([, passed]) => !passed).map(([key]) => key);
  return (
    <div className="grid gap-3 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="truncate text-sm font-semibold text-[#fafafa]">{lane.title}</div>
          <Badge tone={lane.ok ? 'emerald' : 'rose'}>{lane.ok ? 'ready' : 'attention'}</Badge>
          <Badge tone="neutral">{lane.mutationMode}</Badge>
          {lane.latestEvidence ? <Badge tone={lane.latestEvidence.ok ? 'emerald' : 'rose'}>{lane.latestEvidence.ageHours ?? '?'}h old</Badge> : null}
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#a1a1aa]">{lane.note}</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <ProofRuleGroup title="Contracts" items={lane.requiredContracts} tone="cyan" />
          <ProofRuleGroup title={failedChecks.length ? 'Failed checks' : 'Checks'} items={failedChecks.length ? failedChecks : Object.keys(lane.checks)} tone={failedChecks.length ? 'rose' : 'emerald'} />
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#71717a]">
          <span>{lane.command}</span>
          <span>evidence: {lane.evidencePath}</span>
        </div>
      </div>
      <div className="max-w-[260px] text-xs leading-5 text-[#71717a] lg:text-right">
        {lane.latestEvidence?.timestamp ? `last proof: ${formatDateTime(lane.latestEvidence.timestamp)}` : 'no proof evidence yet'}
      </div>
    </div>
  );
}

function ProofIntakeLaneRow({ lane }: { lane: ProofIntakeLane }) {
  const requiredFields = lane.requiredFields.filter((field) => field.required);
  return (
    <div className="grid gap-3 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="truncate text-sm font-semibold text-[#fafafa]">{lane.title}</div>
          <Badge tone="cyan">target {lane.targetCount}</Badge>
          <Badge tone="neutral">{requiredFields.length} required fields</Badge>
        </div>
        <p className="mt-2 text-xs leading-5 text-[#a1a1aa]">{lane.adminSurface}</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <ProofRuleGroup title="Required fields" items={requiredFields.slice(0, 6).map((field) => field.label)} tone="cyan" />
          <ProofRuleGroup title="Acceptance checks" items={lane.acceptanceChecks.slice(0, 5)} tone="emerald" />
          <ProofRuleGroup title="Privacy checks" items={lane.privacyChecks.slice(0, 5)} tone="amber" />
        </div>
        <div className="mt-2 grid gap-2 text-[11px] leading-4 text-[#71717a] md:grid-cols-2">
          <div className="rounded-md border border-[#27272a] bg-[#09090b] px-2 py-1.5">
            <span className="text-[#a1a1aa]">Sources: </span>{lane.sourceTables.join(', ')}
          </div>
          <div className="rounded-md border border-[#27272a] bg-[#09090b] px-2 py-1.5">
            <span className="text-[#a1a1aa]">Verify: </span>{lane.verificationCommands[0] ?? 'no verification command'}
          </div>
        </div>
      </div>
      <div className="max-w-[300px] text-xs leading-5 text-[#71717a] lg:text-right">
        <div className="text-[#a1a1aa]">Evidence</div>
        {lane.evidencePaths.slice(0, 3).map((evidencePath) => (
          <div key={evidencePath} className="break-words">{evidencePath}</div>
        ))}
      </div>
    </div>
  );
}

function WorldClassReadinessCategoryRow({ category }: { category: WorldClassReadinessCategory }) {
  return (
    <div className="grid gap-3 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="truncate text-sm font-semibold text-[#fafafa]">{category.category.replaceAll('_', ' ')}</div>
          <Badge tone={category.score >= 95 ? 'emerald' : category.score >= 85 ? 'amber' : 'rose'}>{category.score}/100</Badge>
          <Badge tone={readinessStatusTone(category.status)}>{category.status.replaceAll('_', ' ')}</Badge>
          {category.scoreGapTo95 ? <Badge tone="amber">gap {category.scoreGapTo95}</Badge> : null}
        </div>
        {category.blockerReason ? (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#a1a1aa]">{category.blockerReason}</p>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#71717a]">
          <span>{category.evidenceCount} evidence items</span>
          <span>threshold 95</span>
        </div>
      </div>
      <div className="max-w-[320px] text-xs leading-5 text-[#71717a] lg:text-right">
        {category.nextAction}
      </div>
    </div>
  );
}

function readinessStatusTone(status: WorldClassReadinessCategory['status']): Tone {
  if (status === 'earned_95_plus') return 'emerald';
  if (status === 'needs_operating_proof') return 'amber';
  if (status === 'strong_but_not_world_class') return 'cyan';
  return 'rose';
}

function DurableJobRegistryRow({ job, latestRun }: { job: DiscordJobRegistryRow; latestRun: DiscordJobRunRow | null }) {
  return (
    <div className="grid gap-3 px-3 py-3 lg:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="truncate text-sm font-semibold text-[#fafafa]">{job.job_name}</div>
          <Badge tone={job.enabled ? 'emerald' : 'neutral'}>{job.enabled ? 'enabled' : 'disabled'}</Badge>
          <Badge tone={job.retryable ? 'cyan' : 'amber'}>{job.retryable ? 'retryable' : 'manual recovery'}</Badge>
          {latestRun ? <StatusBadge status={latestRun.status} /> : null}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#71717a]">
          <span>{job.job_key}</span>
          <span>{job.owner}</span>
          <span>{job.schedule ?? 'manual'}</span>
          <span>idempotency: {job.idempotency_scope}</span>
          <span>{job.max_retries} retries</span>
        </div>
        {latestRun?.error_message ? (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#fb7185]">{latestRun.error_code}: {latestRun.error_message}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        {latestRun && ['queued', 'failed'].includes(latestRun.status) ? (
          <form action={cancelDiscordJobRunAction}>
            <input type="hidden" name="run_key" value={latestRun.run_key} />
            <input type="hidden" name="reason" value="Canceled from Discord admin cockpit." />
            <ActionButton type="submit">Cancel</ActionButton>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function JobDeadLetterRow({ deadLetter }: { deadLetter: DiscordJobDeadLetterRow }) {
  return (
    <div className="grid gap-3 px-3 py-3 lg:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="truncate text-sm font-semibold text-[#fafafa]">{deadLetter.job_key}</div>
          <Badge tone={deadLetter.retryable ? 'amber' : 'rose'}>{deadLetter.retryable ? 'retryable' : 'inspect only'}</Badge>
          <Badge tone="rose">dead letter</Badge>
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#a1a1aa]">{deadLetter.reason}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#71717a]">
          <span>{deadLetter.run_key}</span>
          <span>{formatDateTime(deadLetter.created_at)}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        {deadLetter.retryable ? (
          <form action={retryDiscordJobDeadLetterAction}>
            <input type="hidden" name="id" value={deadLetter.id} />
            <ActionButton tone="emerald" type="submit">Retry</ActionButton>
          </form>
        ) : null}
        <form action={resolveDiscordJobDeadLetterAction}>
          <input type="hidden" name="id" value={deadLetter.id} />
          <input type="hidden" name="notes" value="Resolved from Discord admin cockpit." />
          <ActionButton type="submit">Resolve</ActionButton>
        </form>
      </div>
    </div>
  );
}

function PremiumOpsRow({ entry }: {
  entry:
    | { kind: 'review'; item: DiscordPremiumReviewRow }
    | { kind: 'office-hours'; item: DiscordOfficeHoursRow };
}) {
  const title = entry.kind === 'review' ? entry.item.summary : entry.item.question;
  const eyebrow = entry.kind === 'review'
    ? `${entry.item.review_type} review`
    : `${entry.item.premium_member ? 'premium' : 'community'} office-hours`;
  if (entry.kind === 'office-hours') {
    return (
      <CompactRow
        eyebrow={eyebrow}
        title={title}
        detail={`${entry.item.discord_username ?? entry.item.discord_user_id} / ${formatDateTime(entry.item.created_at)}`}
        meta={<StatusBadge status={entry.item.status} />}
      />
    );
  }
  const overdue = Boolean(entry.item.sla_due_at && new Date(entry.item.sla_due_at).getTime() < Date.now() && !entry.item.completed_at);
  return (
    <div className="grid gap-3 px-3 py-3 lg:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="truncate text-sm font-semibold text-[#fafafa]">{title}</div>
          <StatusBadge status={entry.item.status} />
          <Badge tone={overdue ? 'rose' : 'emerald'}>{overdue ? 'SLA overdue' : 'SLA active'}</Badge>
          {entry.item.response_quality_score !== null ? <Badge tone="emerald">{entry.item.response_quality_score} quality</Badge> : null}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#71717a]">
          <span>{eyebrow}</span>
          <span>{entry.item.discord_username ?? entry.item.discord_user_id}</span>
          {entry.item.assigned_to ? <span>assigned: {entry.item.assigned_to}</span> : null}
          {entry.item.sla_due_at ? <span>SLA: {formatDateTime(entry.item.sla_due_at)}</span> : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        {entry.item.status === 'queued' ? (
          <form action={assignDiscordPremiumReviewAction}>
            <input type="hidden" name="id" value={entry.item.id} />
            <ActionButton tone="emerald" type="submit">Assign</ActionButton>
          </form>
        ) : null}
        {entry.item.status === 'in_review' ? (
          <form action={completeDiscordPremiumReviewAction} className="grid w-full min-w-[280px] gap-2 lg:w-[360px]">
            <input type="hidden" name="id" value={entry.item.id} />
            <textarea
              name="response"
              required
              minLength={180}
              rows={4}
              placeholder="Write the premium review response. Include the recommendation, next step, and key risk or tradeoff."
              className="min-h-[96px] resize-y rounded-md border border-[#27272a] bg-[#09090b] px-3 py-2 text-xs leading-5 text-[#fafafa] outline-none placeholder:text-[#52525b] focus:border-[#10b981]"
            />
            <textarea
              name="judgment_basis"
              required
              minLength={40}
              rows={2}
              placeholder="Explain what artifact, source, or member context this judgment is based on."
              className="min-h-[56px] resize-y rounded-md border border-[#27272a] bg-[#09090b] px-3 py-2 text-xs leading-5 text-[#fafafa] outline-none placeholder:text-[#52525b] focus:border-[#10b981]"
            />
            <div className="flex justify-end">
              <ActionButton tone="emerald" type="submit">Complete</ActionButton>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function PremiumProofReviewRow({ review }: { review: DiscordPremiumReviewRow }) {
  const title = review.summary || `${review.review_type} premium review`;
  const completed = review.completed_at ? formatDateTime(review.completed_at) : 'not completed';
  return (
    <div className="grid gap-3 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_auto]" data-testid={`premium-proof-review-${review.id}`}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={review.status} />
          <Badge tone="violet">{review.review_type}</Badge>
          {review.response_quality_score !== null ? (
            <Badge tone={review.response_quality_score >= 80 ? 'emerald' : 'amber'}>{review.response_quality_score} quality</Badge>
          ) : null}
          {review.assigned_to ? <Badge tone="neutral">assigned</Badge> : null}
        </div>
        <div className="mt-2 truncate text-sm font-medium text-[#fafafa]">{title}</div>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#71717a]">
          <span>{review.discord_username ?? review.discord_user_id}</span>
          <span>completed: {completed}</span>
          {review.follow_up_due_at ? <span>follow-up: {formatDateTime(review.follow_up_due_at)}</span> : null}
          {review.sla_due_at ? <span>SLA: {formatDateTime(review.sla_due_at)}</span> : null}
        </div>
      </div>
      <div className="text-xs text-[#71717a] lg:text-right">{formatDateTime(review.created_at)}</div>
    </div>
  );
}

function PremiumWorkflowEventRow({ event }: { event: DiscordPremiumWorkflowEventRow }) {
  return (
    <div className="grid gap-2 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto]" data-testid={`premium-workflow-event-${event.id}`}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="cyan">{event.event_type}</Badge>
          {event.status ? <StatusBadge status={event.status} /> : null}
          {event.actor ? <Badge tone="neutral">{event.actor}</Badge> : null}
        </div>
        <div className="mt-2 line-clamp-2 text-xs leading-5 text-[#a1a1aa]">{event.note ?? event.request_id ?? 'premium workflow event'}</div>
      </div>
      <div className="text-xs text-[#71717a] sm:text-right">{formatDateTime(event.created_at)}</div>
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
        {draft.status === 'approved' ? (
          <form action={publishDiscordContentDraftAction}>
            <input type="hidden" name="id" value={draft.id} />
            <ActionButton data-testid={`content-draft-publish-${draft.id}`} tone="emerald" type="submit">Publish</ActionButton>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function PublicProofSourceRow({ source }: { source: DiscordPublicProofSourceRow }) {
  const isBlocked = source.permission_status === 'blocked';
  return (
    <div className="grid gap-3 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_auto]" data-testid={`public-proof-source-${source.id}`}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={source.permission_status} />
          <Badge tone="cyan">{source.source_type}</Badge>
          <Badge tone={source.privacy_score >= 90 ? 'emerald' : 'rose'}>{source.privacy_score} privacy</Badge>
          {source.source_table ? <Badge tone="neutral">{source.source_table}</Badge> : null}
        </div>
        <div className="mt-2 truncate text-sm font-medium text-[#fafafa]">{source.title}</div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#71717a]">{source.summary}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#71717a]">
          {source.source_record_id ? <span>record: {source.source_record_id}</span> : null}
          <span>updated: {formatDateTime(source.updated_at)}</span>
          <span>created: {formatDateTime(source.created_at)}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <form action={reviewDiscordPublicProofSourceAction}>
          <input type="hidden" name="id" value={source.id} />
          <input type="hidden" name="permission_status" value="anonymized" />
          <ActionButton data-testid={`public-proof-source-anonymized-${source.id}`} tone="emerald" type="submit">Anonymized</ActionButton>
        </form>
        <form action={reviewDiscordPublicProofSourceAction}>
          <input type="hidden" name="id" value={source.id} />
          <input type="hidden" name="permission_status" value="explicit" />
          <ActionButton data-testid={`public-proof-source-explicit-${source.id}`} type="submit">Explicit</ActionButton>
        </form>
        {!isBlocked ? (
          <form action={reviewDiscordPublicProofSourceAction}>
            <input type="hidden" name="id" value={source.id} />
            <input type="hidden" name="permission_status" value="blocked" />
            <ActionButton data-testid={`public-proof-source-block-${source.id}`} type="submit">Block</ActionButton>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function PublicGrowthDraftRow({ draft }: { draft: DiscordPublicGrowthDraftRow }) {
  const source = draft.discord_public_proof_sources?.[0] ?? null;
  const canMarkPublished = draft.status === 'approved';
  return (
    <div className="grid gap-3 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_auto]" data-testid={`public-growth-draft-${draft.id}`}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={draft.status} />
          <Badge tone="cyan">{draft.draft_type}</Badge>
          <Badge tone={draft.privacy_score >= 90 ? 'emerald' : 'rose'}>{draft.privacy_score} privacy</Badge>
          <Badge tone={draft.quality_score >= 80 ? 'emerald' : 'amber'}>{draft.quality_score} quality</Badge>
          <Badge tone="neutral">{draft.utm_campaign}</Badge>
        </div>
        <div className="mt-2 truncate text-sm font-medium text-[#fafafa]">{draft.title}</div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#71717a]">{draft.body}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#71717a]">
          <span>source: {source?.title ?? 'unknown'}</span>
          {source?.source_type ? <span>type: {source.source_type}</span> : null}
          {source?.permission_status ? <span>permission: {source.permission_status}</span> : null}
          {draft.reviewed_at ? <span>reviewed: {formatDateTime(draft.reviewed_at)}</span> : null}
          {draft.published_at ? <span>published: {formatDateTime(draft.published_at)}</span> : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <form action={reviewDiscordPublicGrowthDraftAction}>
          <input type="hidden" name="id" value={draft.id} />
          <input type="hidden" name="status" value="approved" />
          <ActionButton data-testid={`public-growth-approve-${draft.id}`} tone="emerald" type="submit">Approve</ActionButton>
        </form>
        <form action={reviewDiscordPublicGrowthDraftAction}>
          <input type="hidden" name="id" value={draft.id} />
          <input type="hidden" name="status" value="rejected" />
          <ActionButton data-testid={`public-growth-reject-${draft.id}`} type="submit">Reject</ActionButton>
        </form>
        <form action={reviewDiscordPublicGrowthDraftAction}>
          <input type="hidden" name="id" value={draft.id} />
          <input type="hidden" name="status" value="archived" />
          <ActionButton type="submit">Archive</ActionButton>
        </form>
        {canMarkPublished ? (
          <form action={reviewDiscordPublicGrowthDraftAction}>
            <input type="hidden" name="id" value={draft.id} />
            <input type="hidden" name="status" value="published" />
            <ActionButton data-testid={`public-growth-published-${draft.id}`} tone="emerald" type="submit">Mark published</ActionButton>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function GrowthEventRow({ event }: { event: DiscordGrowthEventRow }) {
  return (
    <div className="grid gap-2 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto]" data-testid={`public-proof-growth-event-${event.id}`}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="violet">{event.event_type}</Badge>
          {event.source ? <Badge tone="neutral">{event.source}</Badge> : null}
          {event.utm_campaign ? <Badge tone="cyan">{event.utm_campaign}</Badge> : null}
        </div>
        <div className="mt-2 truncate text-xs text-[#a1a1aa]">{event.path ?? 'internal event'}</div>
      </div>
      <div className="text-xs text-[#71717a] sm:text-right">{formatDateTime(event.created_at)}</div>
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
  const isClassifierCandidate = item.source === 'discord_message_classifier' && Boolean(item.source_message_id) && item.status === 'captured';
  return (
    <div className="space-y-3 px-3 py-3" data-testid={`content-queue-row-${item.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-[#fafafa]">{item.idea}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#71717a]">
            <span>{item.source}</span>
            <span>{item.discord_username ?? 'system'}</span>
            <span>priority {item.priority}</span>
            {item.source_classification_category ? <span>{item.source_classification_category}</span> : null}
            {item.source_classification_action ? <span>{item.source_classification_action}</span> : null}
          </div>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        {isClassifierCandidate ? (
          <>
            {(['question', 'answer', 'resource', 'content', 'review', 'win'] as const).map((decision) => (
              <form action={reviewDiscordKnowledgeCandidateAction} key={decision}>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="decision" value={decision} />
                <ActionButton
                  data-testid={`knowledge-candidate-${decision}-${item.id}`}
                  tone={decision === 'content' || decision === 'resource' ? 'emerald' : undefined}
                  type="submit"
                >
                  {decision}
                </ActionButton>
              </form>
            ))}
            <form action={reviewDiscordKnowledgeCandidateAction}>
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="decision" value="reject" />
              <ActionButton data-testid={`knowledge-candidate-reject-${item.id}`} type="submit">reject</ActionButton>
            </form>
          </>
        ) : null}
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
  children: ReactNode | ReactNode[];
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
        <Rows empty={empty}>{Array.isArray(children) ? children : [children]}</Rows>
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

function segmentTone(segment: string): Tone {
  if (segment === 'premium_member' || segment === 'mentor_candidate') return 'emerald';
  if (segment === 'premium_lead' || segment === 'active_builder' || segment === 'helper') return 'cyan';
  if (segment === 'stuck_onboarding' || segment === 'at_risk_inactive') return 'amber';
  return 'neutral';
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
