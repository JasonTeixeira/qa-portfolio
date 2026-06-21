import { supabaseAdmin } from '@/lib/supabase/server';

export type DiscordMemberIntelligenceSource = {
  discordUserId: string;
  username?: string | null;
  academyMember?: boolean;
  premiumMember?: boolean;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  questionCount: number;
  answerCount: number;
  helpfulAnswerCount: number;
  challengeSubmissionCount: number;
  contentCaptureCount: number;
  onboardingStepsCompleted: number;
  lastActivityAt?: string | null;
};

export type DiscordMemberSegment = 'new' | 'needs_activation' | 'consistent_builder' | 'helper' | 'premium_candidate' | 'premium';

export function classifyDiscordMemberProfile(input: DiscordMemberIntelligenceSource): {
  segment: DiscordMemberSegment;
  nextBestAction: string;
  strengths: string[];
  riskFlags: string[];
} {
  const strengths: string[] = [];
  const riskFlags: string[] = [];
  if (input.answerCount >= 3 || input.helpfulAnswerCount > 0) strengths.push('helps_members');
  if (input.challengeSubmissionCount > 0) strengths.push('ships_challenges');
  if (input.contentCaptureCount > 0) strengths.push('creates_content_signals');
  if (input.currentStreak >= 3) strengths.push('active_streak');
  if (input.onboardingStepsCompleted < 3) riskFlags.push('onboarding_incomplete');
  if (input.totalPoints <= 0) riskFlags.push('no_reputation_yet');

  if (input.premiumMember) return { segment: 'premium', nextBestAction: 'route_to_premium_review_or_office_hours', strengths, riskFlags };
  if (input.totalPoints >= 75 || input.helpfulAnswerCount >= 2) {
    return { segment: 'premium_candidate', nextBestAction: 'offer_premium_review_or_member_spotlight', strengths, riskFlags };
  }
  if (input.answerCount >= 3 || input.helpfulAnswerCount > 0) {
    return { segment: 'helper', nextBestAction: 'invite_to_answer_open_questions', strengths, riskFlags };
  }
  if (input.challengeSubmissionCount > 0 || input.currentStreak >= 3 || input.totalPoints >= 25) {
    return { segment: 'consistent_builder', nextBestAction: 'push_next_build_challenge_or_showcase', strengths, riskFlags };
  }
  if (input.academyMember && input.totalPoints === 0) {
    return { segment: 'needs_activation', nextBestAction: 'nudge_first_question_or_daily_challenge', strengths, riskFlags };
  }
  return { segment: 'new', nextBestAction: 'complete_onboarding', strengths, riskFlags };
}

export async function rebuildDiscordMemberIntelligenceProfiles(): Promise<{ processed: number }> {
  const sb = supabaseAdmin();
  const { data: members, error } = await sb
    .from('discord_members')
    .select('discord_user_id, username, academy_member, premium_member, last_seen_at')
    .order('last_seen_at', { ascending: false })
    .limit(5000);
  if (error) throw new Error(error.message);

  const rows = [];
  for (const member of members ?? []) {
    const source = await loadMemberIntelligenceSource(String(member.discord_user_id), {
      username: member.username ? String(member.username) : null,
      academyMember: Boolean(member.academy_member),
      premiumMember: Boolean(member.premium_member),
      lastSeenAt: member.last_seen_at ? String(member.last_seen_at) : null,
    });
    const profile = classifyDiscordMemberProfile(source);
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
      calculated_at: new Date().toISOString(),
      metadata: {},
    });
  }

  if (rows.length) {
    const { error: upsertError } = await sb.from('discord_member_intelligence_profiles').upsert(rows, { onConflict: 'discord_user_id' });
    if (upsertError) throw new Error(upsertError.message);
  }
  return { processed: rows.length };
}

async function loadMemberIntelligenceSource(
  discordUserId: string,
  member: { username?: string | null; academyMember: boolean; premiumMember: boolean; lastSeenAt?: string | null },
): Promise<DiscordMemberIntelligenceSource> {
  const sb = supabaseAdmin();
  const [
    points,
    streak,
    questions,
    answers,
    helpful,
    challenges,
    captures,
    onboarding,
  ] = await Promise.all([
    sb.from('discord_points_ledger').select('points, created_at').eq('discord_user_id', discordUserId).limit(1000),
    sb.from('discord_member_streaks').select('current_streak, longest_streak, updated_at').eq('discord_user_id', discordUserId).maybeSingle(),
    sb.from('discord_questions').select('*', { count: 'exact', head: true }).eq('discord_user_id', discordUserId),
    sb.from('discord_answers').select('*', { count: 'exact', head: true }).eq('discord_user_id', discordUserId),
    sb.from('discord_answers').select('*', { count: 'exact', head: true }).eq('discord_user_id', discordUserId).eq('helpful', true),
    sb.from('discord_challenge_submissions').select('*', { count: 'exact', head: true }).eq('discord_user_id', discordUserId),
    sb.from('discord_content_queue').select('*', { count: 'exact', head: true }).eq('discord_user_id', discordUserId),
    sb.from('discord_member_onboarding_steps').select('*', { count: 'exact', head: true }).eq('discord_user_id', discordUserId),
  ]);
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
    totalPoints: pointRows.reduce((total, row) => total + Number(row.points ?? 0), 0),
    currentStreak: Number(streak.data?.current_streak ?? 0),
    longestStreak: Number(streak.data?.longest_streak ?? 0),
    questionCount: questions.count ?? 0,
    answerCount: answers.count ?? 0,
    helpfulAnswerCount: helpful.count ?? 0,
    challengeSubmissionCount: challenges.count ?? 0,
    contentCaptureCount: captures.count ?? 0,
    onboardingStepsCompleted: onboarding.count ?? 0,
    lastActivityAt,
  };
}
