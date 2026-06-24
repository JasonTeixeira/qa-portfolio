import { supabaseAdmin } from '@/lib/supabase/server';

export type DiscordMemberSegment =
  | 'new'
  | 'stuck_onboarding'
  | 'active_builder'
  | 'helper'
  | 'quiet_learner'
  | 'at_risk_inactive'
  | 'premium_lead'
  | 'premium_member'
  | 'mentor_candidate'
  | 'needs_activation'
  | 'consistent_builder'
  | 'premium_candidate'
  | 'premium';

export type DiscordMemberIntelligenceSource = {
  discordUserId: string;
  username?: string | null;
  academyMember?: boolean;
  premiumMember?: boolean;
  premiumStatus?: string | null;
  pathKey?: string | null;
  levelKey?: string | null;
  primaryGoal?: string | null;
  preferredSupport?: string | null;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  questionCount: number;
  openQuestionCount: number;
  answerCount: number;
  helpfulAnswerCount: number;
  challengeSubmissionCount: number;
  pendingChallengeSubmissionCount: number;
  projectSubmissionCount: number;
  pendingProjectSubmissionCount: number;
  contentCaptureCount: number;
  onboardingStepsCompleted: number;
  premiumReviewRequestCount: number;
  officeHoursRequestCount: number;
  lastActivityAt?: string | null;
  lastSeenAt?: string | null;
};

export type DiscordMemberIntelligenceProfile = {
  segment: DiscordMemberSegment;
  nextBestAction: string;
  strengths: string[];
  riskFlags: string[];
  confidence: number;
  reasons: string[];
  nextNudge: DiscordMemberNudgeRecommendation | null;
  timeline: Array<{ key: string; label: string; at: string | null }>;
};

export type DiscordMemberNudgeRecommendation = {
  key:
    | 'complete_onboarding'
    | 'first_action'
    | 'answer_open_question'
    | 'review_pending_project'
    | 'streak_at_risk'
    | 'premium_review_followup';
  reason: string;
  priority: number;
  eligibleAt: string;
};

const NUDGE_RATE_LIMIT_HOURS = 48;
const DAY_MS = 86_400_000;

function daysSince(value?: string | null, now = new Date()): number | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((now.getTime() - date.getTime()) / DAY_MS);
}

function isoInHours(hours: number, now = new Date()): string {
  return new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
}

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function addUnique(target: string[], value: string) {
  if (!target.includes(value)) target.push(value);
}

export function classifyDiscordMemberProfile(
  input: DiscordMemberIntelligenceSource,
  now = new Date(),
): DiscordMemberIntelligenceProfile {
  const strengths: string[] = [];
  const riskFlags: string[] = [];
  const reasons: string[] = [];
  const lastActiveDays = daysSince(input.lastActivityAt ?? input.lastSeenAt, now);
  const approved = input.academyMember === true;
  const routed = Boolean(input.pathKey) && Boolean(input.levelKey);

  if (input.answerCount >= 3 || input.helpfulAnswerCount > 0) addUnique(strengths, 'helps_members');
  if (input.helpfulAnswerCount >= 3) addUnique(strengths, 'trusted_helper');
  if (input.challengeSubmissionCount > 0) addUnique(strengths, 'ships_challenges');
  if (input.projectSubmissionCount > 0) addUnique(strengths, 'ships_projects');
  if (input.contentCaptureCount > 0) addUnique(strengths, 'creates_content_signals');
  if (input.currentStreak >= 3) addUnique(strengths, 'active_streak');
  if (input.totalPoints >= 100) addUnique(strengths, 'high_reputation');

  if (!approved) addUnique(riskFlags, 'not_approved');
  if (approved && !routed) addUnique(riskFlags, 'routing_missing');
  if (input.onboardingStepsCompleted < 3) addUnique(riskFlags, 'onboarding_incomplete');
  if (input.totalPoints <= 0) addUnique(riskFlags, 'no_reputation_yet');
  if (lastActiveDays !== null && lastActiveDays >= 14) addUnique(riskFlags, 'inactive_14d');
  if (input.openQuestionCount > 0) addUnique(riskFlags, 'has_open_question');
  if (input.pendingChallengeSubmissionCount > 0 || input.pendingProjectSubmissionCount > 0) addUnique(riskFlags, 'pending_review');

  let segment: DiscordMemberSegment = 'new';
  let nextBestAction = 'complete_onboarding';
  let confidence = 62;

  if (input.premiumMember) {
    segment = 'premium_member';
    nextBestAction = 'route_to_premium_review_or_office_hours';
    confidence = 96;
    reasons.push('premium_member=true');
  } else if (input.helpfulAnswerCount >= 5 || input.totalPoints >= 150) {
    segment = 'mentor_candidate';
    nextBestAction = 'invite_to_help_answer_open_questions_or_review_work';
    confidence = 90;
    reasons.push('high helpful-answer or point total indicates mentor potential');
  } else if (input.totalPoints >= 75 || input.helpfulAnswerCount >= 2 || input.preferredSupport === 'premium_curious' || input.premiumReviewRequestCount > 0) {
    segment = 'premium_lead';
    nextBestAction = 'offer_contextual_premium_review_or_member_spotlight';
    confidence = 86;
    reasons.push('strong participation or premium intent without premium role');
  } else if (lastActiveDays !== null && lastActiveDays >= 14 && approved) {
    segment = 'at_risk_inactive';
    nextBestAction = 'queue_low_pressure_reactivation_prompt';
    confidence = 84;
    reasons.push(`last activity ${lastActiveDays} days ago`);
  } else if (input.answerCount >= 3 || input.helpfulAnswerCount > 0) {
    segment = 'helper';
    nextBestAction = 'invite_to_answer_open_questions';
    confidence = 82;
    reasons.push('member has answered or helped other members');
  } else if (input.challengeSubmissionCount > 0 || input.projectSubmissionCount > 0 || input.currentStreak >= 3 || input.totalPoints >= 25) {
    segment = 'active_builder';
    nextBestAction = 'push_next_build_challenge_or_showcase';
    confidence = 80;
    reasons.push('member has build, challenge, streak, or point activity');
  } else if (approved && (!routed || input.onboardingStepsCompleted < 3)) {
    segment = 'stuck_onboarding';
    nextBestAction = 'nudge_onboard_and_first_action';
    confidence = 88;
    reasons.push('approved member has incomplete routing or onboarding');
  } else if (approved && input.totalPoints === 0) {
    segment = 'quiet_learner';
    nextBestAction = 'nudge_first_question_or_daily_challenge';
    confidence = 76;
    reasons.push('approved member has no points yet');
  } else {
    reasons.push('new or low-signal member profile');
  }

  const nextNudge = chooseMemberNudge(input, {
    segment,
    riskFlags,
    lastActiveDays,
    now,
  });

  return {
    segment,
    nextBestAction,
    strengths,
    riskFlags,
    confidence: clampConfidence(confidence - Math.max(0, riskFlags.length - 2) * 3),
    reasons,
    nextNudge,
    timeline: buildTimeline(input),
  };
}

function chooseMemberNudge(
  input: DiscordMemberIntelligenceSource,
  context: {
    segment: DiscordMemberSegment;
    riskFlags: string[];
    lastActiveDays: number | null;
    now: Date;
  },
): DiscordMemberNudgeRecommendation | null {
  const eligibleAt = context.now.toISOString();
  if (input.pendingProjectSubmissionCount > 0 || input.pendingChallengeSubmissionCount > 0) {
    return {
      key: 'review_pending_project',
      reason: 'Member has submitted work waiting for admin or mentor review.',
      priority: 90,
      eligibleAt,
    };
  }
  if (input.premiumMember && (input.premiumReviewRequestCount > 0 || input.officeHoursRequestCount > 0)) {
    return {
      key: 'premium_review_followup',
      reason: 'Premium member has an active premium review or office-hours request.',
      priority: 86,
      eligibleAt,
    };
  }
  if (context.riskFlags.includes('routing_missing') || context.riskFlags.includes('onboarding_incomplete')) {
    return {
      key: 'complete_onboarding',
      reason: 'Approved member has not completed routing/onboarding.',
      priority: 82,
      eligibleAt,
    };
  }
  if (input.totalPoints <= 0 && input.academyMember) {
    return {
      key: 'first_action',
      reason: 'Approved member has not completed a first scored action.',
      priority: 74,
      eligibleAt,
    };
  }
  if (input.openQuestionCount > 0) {
    return {
      key: 'answer_open_question',
      reason: 'Member has an open question that should be answered or routed.',
      priority: 72,
      eligibleAt,
    };
  }
  if (input.currentStreak > 0 && context.lastActiveDays === 1) {
    return {
      key: 'streak_at_risk',
      reason: 'Member has a current streak and may lose momentum today.',
      priority: 60,
      eligibleAt,
    };
  }
  if (context.segment === 'at_risk_inactive') {
    return {
      key: 'first_action',
      reason: 'Member has been inactive for 14+ days and needs a low-pressure restart.',
      priority: 58,
      eligibleAt,
    };
  }
  return null;
}

function buildTimeline(input: DiscordMemberIntelligenceSource): Array<{ key: string; label: string; at: string | null }> {
  return [
    { key: 'last_activity', label: 'Last activity', at: input.lastActivityAt ?? null },
    { key: 'last_seen', label: 'Last seen', at: input.lastSeenAt ?? null },
    { key: 'streak', label: `${input.currentStreak} day streak`, at: input.lastActivityAt ?? null },
  ].filter((item) => item.at || item.key === 'streak');
}

export function shouldQueueMemberNudge(input: {
  recommendation: DiscordMemberNudgeRecommendation | null;
  recentNudgeKeys: Set<string>;
}): boolean {
  return Boolean(input.recommendation && !input.recentNudgeKeys.has(input.recommendation.key));
}

export async function rebuildDiscordMemberIntelligenceProfiles(): Promise<{ processed: number; nudgesQueued: number }> {
  const sb = supabaseAdmin();
  const { data: members, error } = await sb
    .from('discord_members')
    .select('discord_user_id, username, academy_member, premium_member, premium_status, path_key, level_key, primary_goal, preferred_support, last_seen_at')
    .order('last_seen_at', { ascending: false })
    .limit(5000);
  if (error) throw new Error(error.message);

  const rows = [];
  const nudgeRows = [];
  const now = new Date();
  for (const member of members ?? []) {
    const source = await loadMemberIntelligenceSource(String(member.discord_user_id), {
      username: member.username ? String(member.username) : null,
      academyMember: Boolean(member.academy_member),
      premiumMember: Boolean(member.premium_member),
      premiumStatus: member.premium_status ? String(member.premium_status) : null,
      pathKey: member.path_key ? String(member.path_key) : null,
      levelKey: member.level_key ? String(member.level_key) : null,
      primaryGoal: member.primary_goal ? String(member.primary_goal) : null,
      preferredSupport: member.preferred_support ? String(member.preferred_support) : null,
      lastSeenAt: member.last_seen_at ? String(member.last_seen_at) : null,
    });
    const profile = classifyDiscordMemberProfile(source, now);
    rows.push({
      discord_user_id: source.discordUserId,
      username: source.username ?? null,
      academy_member: source.academyMember ?? false,
      premium_member: source.premiumMember ?? false,
      total_points: source.totalPoints,
      current_streak: source.currentStreak,
      longest_streak: source.longestStreak,
      question_count: source.questionCount,
      answer_count: source.answerCount,
      helpful_answer_count: source.helpfulAnswerCount,
      challenge_submission_count: source.challengeSubmissionCount,
      content_capture_count: source.contentCaptureCount,
      onboarding_steps_completed: source.onboardingStepsCompleted,
      segment: profile.segment,
      next_best_action: profile.nextBestAction,
      strengths: profile.strengths,
      risk_flags: profile.riskFlags,
      last_activity_at: source.lastActivityAt,
      calculated_at: now.toISOString(),
      segment_confidence: profile.confidence,
      segment_reasons: profile.reasons,
      next_nudge_key: profile.nextNudge?.key ?? null,
      next_nudge_reason: profile.nextNudge?.reason ?? null,
      nudge_eligible_at: profile.nextNudge?.eligibleAt ?? null,
      timeline: profile.timeline,
      metadata: {
        source: 'member_intelligence_v2',
        premium_status: source.premiumStatus ?? null,
        path_key: source.pathKey ?? null,
        level_key: source.levelKey ?? null,
        primary_goal: source.primaryGoal ?? null,
        preferred_support: source.preferredSupport ?? null,
        open_question_count: source.openQuestionCount,
        pending_challenge_submission_count: source.pendingChallengeSubmissionCount,
        project_submission_count: source.projectSubmissionCount,
        pending_project_submission_count: source.pendingProjectSubmissionCount,
        premium_review_request_count: source.premiumReviewRequestCount,
        office_hours_request_count: source.officeHoursRequestCount,
      },
    });

    const recentNudgeKeys = await loadRecentNudgeKeys(source.discordUserId, NUDGE_RATE_LIMIT_HOURS);
    if (shouldQueueMemberNudge({ recommendation: profile.nextNudge, recentNudgeKeys }) && profile.nextNudge) {
      nudgeRows.push({
        discord_user_id: source.discordUserId,
        discord_username: source.username ?? null,
        nudge_key: profile.nextNudge.key,
        reason: profile.nextNudge.reason,
        status: 'queued',
        priority: profile.nextNudge.priority,
        rate_limit_until: isoInHours(NUDGE_RATE_LIMIT_HOURS, now),
        metadata: {
          source: 'member_intelligence_v2',
          segment: profile.segment,
          confidence: profile.confidence,
          reasons: profile.reasons,
          risk_flags: profile.riskFlags,
        },
      });
    }
  }

  if (rows.length) {
    const { error: upsertError } = await sb.from('discord_member_intelligence_profiles').upsert(rows, { onConflict: 'discord_user_id' });
    if (upsertError) throw new Error(upsertError.message);
  }
  let nudgesQueued = 0;
  for (const nudgeRow of nudgeRows) {
    const { error: nudgeError } = await sb.from('discord_member_nudge_queue').insert(nudgeRow);
    if (nudgeError) {
      if (nudgeError.code === '23505') continue;
      throw new Error(nudgeError.message);
    }
    nudgesQueued += 1;
  }
  return { processed: rows.length, nudgesQueued };
}

async function loadRecentNudgeKeys(discordUserId: string, sinceHours: number): Promise<Set<string>> {
  const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabaseAdmin()
    .from('discord_member_nudge_queue')
    .select('nudge_key')
    .eq('discord_user_id', discordUserId)
    .gte('created_at', since)
    .in('status', ['queued', 'approved', 'sent']);
  if (error) {
    if (/does not exist/i.test(error.message)) return new Set();
    throw new Error(error.message);
  }
  return new Set((data ?? []).map((row) => String(row.nudge_key)));
}

async function countRows(table: string, discordUserId: string, extra?: (query: any) => any): Promise<number> {
  let query = supabaseAdmin().from(table).select('*', { count: 'exact', head: true }).eq('discord_user_id', discordUserId);
  if (extra) query = extra(query);
  const { count, error } = await query;
  if (error) {
    if (/does not exist/i.test(error.message)) return 0;
    throw new Error(error.message);
  }
  return count ?? 0;
}

async function loadMemberIntelligenceSource(
  discordUserId: string,
  member: {
    username?: string | null;
    academyMember: boolean;
    premiumMember: boolean;
    premiumStatus?: string | null;
    pathKey?: string | null;
    levelKey?: string | null;
    primaryGoal?: string | null;
    preferredSupport?: string | null;
    lastSeenAt?: string | null;
  },
): Promise<DiscordMemberIntelligenceSource> {
  const sb = supabaseAdmin();
  const [
    points,
    streak,
    questions,
    openQuestions,
    answers,
    helpful,
    challenges,
    pendingChallenges,
    projects,
    pendingProjects,
    captures,
    onboarding,
    premiumReviews,
    officeHours,
  ] = await Promise.all([
    sb.from('discord_points_ledger').select('points, created_at').eq('discord_user_id', discordUserId).limit(1000),
    sb.from('discord_member_streaks').select('current_streak, longest_streak, updated_at').eq('discord_user_id', discordUserId).maybeSingle(),
    countRows('discord_questions', discordUserId),
    countRows('discord_questions', discordUserId, (query) => query.in('status', ['open', 'captured'])),
    countRows('discord_answers', discordUserId),
    countRows('discord_answers', discordUserId, (query) => query.eq('helpful', true)),
    countRows('discord_challenge_submissions', discordUserId),
    countRows('discord_challenge_submissions', discordUserId, (query) => query.eq('status', 'pending')),
    countRows('discord_project_submissions', discordUserId),
    countRows('discord_project_submissions', discordUserId, (query) => query.eq('status', 'submitted')),
    countRows('discord_content_queue', discordUserId),
    countRows('discord_member_onboarding_steps', discordUserId),
    countRows('discord_premium_review_requests', discordUserId, (query) => query.in('status', ['queued', 'in_review'])),
    countRows('discord_office_hours_queue', discordUserId, (query) => query.in('status', ['queued', 'scheduled'])),
  ]);
  if (points.error) throw new Error(points.error.message);
  const pointRows = points.data ?? [];
  const lastPointAt = pointRows.map((row) => String(row.created_at)).sort().at(-1) ?? null;
  const lastActivityAt = [member.lastSeenAt, lastPointAt, streak.data?.updated_at ? String(streak.data.updated_at) : null]
    .filter(Boolean)
    .sort()
    .at(-1) ?? null;

  return {
    discordUserId,
    username: member.username,
    academyMember: member.academyMember,
    premiumMember: member.premiumMember,
    premiumStatus: member.premiumStatus,
    pathKey: member.pathKey,
    levelKey: member.levelKey,
    primaryGoal: member.primaryGoal,
    preferredSupport: member.preferredSupport,
    totalPoints: pointRows.reduce((total, row) => total + Number(row.points ?? 0), 0),
    currentStreak: Number(streak.data?.current_streak ?? 0),
    longestStreak: Number(streak.data?.longest_streak ?? 0),
    questionCount: questions,
    openQuestionCount: openQuestions,
    answerCount: answers,
    helpfulAnswerCount: helpful,
    challengeSubmissionCount: challenges,
    pendingChallengeSubmissionCount: pendingChallenges,
    projectSubmissionCount: projects,
    pendingProjectSubmissionCount: pendingProjects,
    contentCaptureCount: captures,
    onboardingStepsCompleted: onboarding,
    premiumReviewRequestCount: premiumReviews,
    officeHoursRequestCount: officeHours,
    lastActivityAt,
    lastSeenAt: member.lastSeenAt,
  };
}
