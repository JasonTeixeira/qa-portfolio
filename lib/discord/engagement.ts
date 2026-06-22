import { supabaseAdmin } from '@/lib/supabase/server';
import { pickDaily, sageLevelOptions, sagePathOptions } from './sage-content';

type Json = Record<string, unknown>;

export const onboardingSteps = [
  { key: 'intro', label: 'Post your intro and first build context', command: '/ask or questions' },
  { key: 'path', label: 'Choose your path and level', command: '/onboard' },
  { key: 'daily', label: 'Complete one daily signal', command: '/daily' },
  { key: 'challenge', label: 'Submit one build challenge', command: '/submit-challenge' },
  { key: 'project', label: 'Submit your first project/spec', command: '/submit-project' },
  { key: 'review', label: 'Request one focused review', command: '/request-review' },
  { key: 'capture', label: 'Capture one reusable question/lesson', command: '/capture-content' },
  { key: 'win', label: 'Post one win or next milestone', command: 'wins' },
] as const;

export type OnboardingStepKey = typeof onboardingSteps[number]['key'];

export type DailyQuiz = {
  key: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type DailyChallenge = {
  key: string;
  title: string;
  prompt: string;
  deliverable: string;
  points: number;
};

export type DiscordQuestion = {
  id: string;
  question: string;
  context: string | null;
  username: string | null;
  status: string;
  createdAt: string;
};

export type DiscordAnswer = {
  id: string;
  questionId: string;
  answer: string;
  username: string | null;
  helpful: boolean;
  createdAt: string;
};

export type MemberApplicationProfile = {
  discordUserId: string;
  username: string | null;
  goal: string;
  experience: string;
  intendedBuild: string;
  pathKey: string | null;
  levelKey: string | null;
  timezone: string | null;
  weeklyTimeBudget: string | null;
  primaryGoal: string | null;
  preferredSupport: string | null;
  portfolioUrl: string | null;
  referralSource: string | null;
  submittedAt: string;
};

const allowedSupportNeeds = new Set(['questions', 'review', 'accountability', 'premium_curious']);

function cleanText(value?: string | null): string | null {
  const cleaned = String(value ?? '').trim();
  return cleaned.length ? cleaned.slice(0, 500) : null;
}

export function normalizeMemberApplicationProfile(input: {
  goal: string;
  experience: string;
  intendedBuild: string;
  pathKey?: string | null;
  levelKey?: string | null;
  timezone?: string | null;
  weeklyTimeBudget?: string | null;
  primaryGoal?: string | null;
  preferredSupport?: string | null;
  portfolioUrl?: string | null;
  referralSource?: string | null;
}) {
  const pathKey = sagePathOptions.some((option) => option.key === input.pathKey) ? input.pathKey : null;
  const levelKey = sageLevelOptions.some((option) => option.key === input.levelKey) ? input.levelKey : null;
  const preferredSupport = allowedSupportNeeds.has(String(input.preferredSupport ?? '')) ? input.preferredSupport : null;
  const portfolioUrl = cleanText(input.portfolioUrl);
  return {
    goal: cleanText(input.goal) ?? '',
    experience: cleanText(input.experience) ?? '',
    intendedBuild: cleanText(input.intendedBuild) ?? '',
    pathKey,
    levelKey,
    timezone: cleanText(input.timezone),
    weeklyTimeBudget: cleanText(input.weeklyTimeBudget),
    primaryGoal: cleanText(input.primaryGoal) ?? cleanText(input.goal),
    preferredSupport,
    portfolioUrl: portfolioUrl && /^https?:\/\//i.test(portfolioUrl) ? portfolioUrl : portfolioUrl,
    referralSource: cleanText(input.referralSource),
  };
}

export const dailyQuizzes: DailyQuiz[] = [
  {
    key: 'structured-output-v1',
    prompt: 'What makes an AI feature easier to trust in production?',
    options: ['Longer prompts', 'Validated structured output', 'More temperature', 'No logs'],
    correctAnswer: 'validated structured output',
    explanation: 'Schemas, validation, and clear failure states make AI output usable inside real product workflows.',
  },
  {
    key: 'landing-page-proof-v1',
    prompt: 'Which section most directly reduces buyer doubt on a premium service page?',
    options: ['Generic hero copy', 'Proof with concrete outcomes', 'More gradients', 'A longer nav'],
    correctAnswer: 'proof with concrete outcomes',
    explanation: 'Specific proof beats claims because it gives the reader evidence to evaluate.',
  },
  {
    key: 'automation-boundary-v1',
    prompt: 'What should require human approval in an automation?',
    options: ['Reading public data', 'Formatting text', 'Sending or charging', 'Counting rows'],
    correctAnswer: 'sending or charging',
    explanation: 'External, irreversible, paid, or reputation-affecting actions need approval gates.',
  },
  {
    key: 'project-scope-v1',
    prompt: 'What belongs in a first project spec before code?',
    options: ['User, goal, acceptance criteria', 'Logo ideas only', 'A vague feature list', 'A launch tweet'],
    correctAnswer: 'user, goal, acceptance criteria',
    explanation: 'A useful spec defines the user, outcome, scope, and testable acceptance criteria.',
  },
  {
    key: 'content-engine-v1',
    prompt: 'What is the best source for useful daily content?',
    options: ['Random trends', 'Real questions and shipped work', 'Generic quotes', 'Engagement bait'],
    correctAnswer: 'real questions and shipped work',
    explanation: 'Community questions, decisions, wins, and critique create content with proof behind it.',
  },
];

export const dailyChallenges: DailyChallenge[] = [
  {
    key: 'one-screen-ai-tool',
    title: 'One-screen AI tool',
    prompt: 'Build or spec one AI tool that turns messy input into structured output.',
    deliverable: 'Post the input, output schema, screenshot/link, and one failure case.',
    points: 25,
  },
  {
    key: 'premium-section-redesign',
    title: 'Premium section redesign',
    prompt: 'Pick one weak page section and redesign it around hierarchy, proof, and one clear action.',
    deliverable: 'Post before/after screenshots and explain the tradeoff.',
    points: 25,
  },
  {
    key: 'automation-map',
    title: 'Automation map',
    prompt: 'Map a repeated workflow with trigger, inputs, tools, approval gate, and failure path.',
    deliverable: 'Post the workflow map and name the riskiest step.',
    points: 20,
  },
  {
    key: 'content-repurpose',
    title: 'Question to content',
    prompt: 'Turn one useful question into a short answer, one post idea, and one resource gap.',
    deliverable: 'Post the question, answer, post angle, and resource needed.',
    points: 20,
  },
  {
    key: 'project-acceptance',
    title: 'Acceptance criteria pass',
    prompt: 'Write acceptance criteria for a project you are building this week.',
    deliverable: 'Post the project, three acceptance criteria, and what is out of scope.',
    points: 15,
  },
];

function todayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function getDailyQuiz(now = new Date()): DailyQuiz {
  return pickDaily(dailyQuizzes, now);
}

export function getDailyChallenge(now = new Date()): DailyChallenge {
  return pickDaily(dailyChallenges, now);
}

function parseOptions(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item));
  return [];
}

export async function getDailyQuizFromStore(now = new Date()): Promise<DailyQuiz> {
  try {
    const { data, error } = await supabaseAdmin()
      .from('discord_quizzes')
      .select('quiz_key, prompt, options, correct_answer, explanation')
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (error || !data?.length) return getDailyQuiz(now);
    const row = pickDaily(data, now);
    return {
      key: String(row.quiz_key),
      prompt: String(row.prompt),
      options: parseOptions(row.options),
      correctAnswer: String(row.correct_answer),
      explanation: String(row.explanation ?? ''),
    };
  } catch (err) {
    console.warn('[discord/engagement] quiz store read failed', err instanceof Error ? err.message : err);
    return getDailyQuiz(now);
  }
}

export async function getDailyChallengeFromStore(now = new Date()): Promise<DailyChallenge> {
  try {
    const { data, error } = await supabaseAdmin()
      .from('discord_challenges')
      .select('challenge_key, title, prompt, deliverable, points')
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (error || !data?.length) return getDailyChallenge(now);
    const row = pickDaily(data, now);
    return {
      key: String(row.challenge_key),
      title: String(row.title),
      prompt: String(row.prompt),
      deliverable: String(row.deliverable),
      points: Number(row.points ?? 25),
    };
  } catch (err) {
    console.warn('[discord/engagement] challenge store read failed', err instanceof Error ? err.message : err);
    return getDailyChallenge(now);
  }
}

export async function getDailyContentPlan(now = new Date()): Promise<{ theme?: string; prompt?: string } | null> {
  try {
    const { data } = await supabaseAdmin()
      .from('discord_content_calendar')
      .select('theme, daily_prompt')
      .eq('calendar_date', todayKey(now))
      .maybeSingle();
    if (!data) return null;
    return {
      theme: data.theme ? String(data.theme) : undefined,
      prompt: data.daily_prompt ? String(data.daily_prompt) : undefined,
    };
  } catch (err) {
    console.warn('[discord/engagement] content calendar read failed', err instanceof Error ? err.message : err);
    return null;
  }
}

function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function quizAttemptActionKey(quizKey: string, discordUserId: string): string {
  return `quiz:${quizKey}:${discordUserId}`;
}

export function challengeSubmissionActionKey(challengeKey: string, discordUserId: string): string {
  return `challenge:${challengeKey}:${discordUserId}`;
}

export async function awardDiscordPoints(input: {
  discordUserId: string;
  username?: string | null;
  points: number;
  reason: string;
  source: string;
  actionKey?: string | null;
  metadata?: Json;
}): Promise<{ awarded: boolean }> {
  const sb = supabaseAdmin();
  const now = new Date();
  const activityDate = todayKey(now);

  try {
    const { error: ledgerError } = await sb.from('discord_points_ledger').insert({
      discord_user_id: input.discordUserId,
      discord_username: input.username ?? null,
      points: input.points,
      reason: input.reason,
      source: input.source,
      action_key: input.actionKey ?? null,
      metadata: input.metadata ?? {},
    });
    if (ledgerError) {
      if (isUniqueViolation(ledgerError)) return { awarded: false };
      throw ledgerError;
    }

    const { data: streak } = await sb
      .from('discord_member_streaks')
      .select('current_streak, longest_streak, last_activity_date')
      .eq('discord_user_id', input.discordUserId)
      .maybeSingle();

    const previous = streak?.last_activity_date ? new Date(`${streak.last_activity_date}T00:00:00.000Z`) : null;
    const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
    const current = previous?.toISOString().slice(0, 10) === activityDate
      ? Number(streak?.current_streak ?? 0)
      : previous?.toISOString().slice(0, 10) === yesterday.toISOString().slice(0, 10)
        ? Number(streak?.current_streak ?? 0) + 1
        : 1;

    await sb.from('discord_member_streaks').upsert({
      discord_user_id: input.discordUserId,
      discord_username: input.username ?? null,
      current_streak: current,
      longest_streak: Math.max(current, Number(streak?.longest_streak ?? 0)),
      last_activity_date: activityDate,
      updated_at: now.toISOString(),
    }, { onConflict: 'discord_user_id' });
    return { awarded: true };
  } catch (err) {
    console.warn('[discord/engagement] points award failed', err instanceof Error ? err.message : err);
    return { awarded: false };
  }
}

export async function completeOnboardingStep(input: {
  discordUserId: string;
  username?: string | null;
  stepKey: OnboardingStepKey;
  metadata?: Json;
}): Promise<void> {
  try {
    await supabaseAdmin().from('discord_member_onboarding_steps').upsert(
      {
        discord_user_id: input.discordUserId,
        discord_username: input.username ?? null,
        step_key: input.stepKey,
        completed_at: new Date().toISOString(),
        metadata: input.metadata ?? {},
      },
      { onConflict: 'discord_user_id,step_key' },
    );
  } catch (err) {
    console.warn('[discord/engagement] onboarding step failed', err instanceof Error ? err.message : err);
  }
}

export async function getOnboardingChecklist(discordUserId: string): Promise<Array<{
  key: OnboardingStepKey;
  label: string;
  command: string;
  completed: boolean;
  completedAt: string | null;
}>> {
  const { data } = await supabaseAdmin()
    .from('discord_member_onboarding_steps')
    .select('step_key, completed_at')
    .eq('discord_user_id', discordUserId);

  const completed = new Map((data ?? []).map((row) => [String(row.step_key), String(row.completed_at)]));
  return onboardingSteps.map((step) => ({
    ...step,
    completed: completed.has(step.key),
    completedAt: completed.get(step.key) ?? null,
  }));
}

export async function answerDailyQuiz(input: {
  discordUserId: string;
  username?: string | null;
  answer: string;
  now?: Date;
}): Promise<{ quiz: DailyQuiz; correct: boolean; points: number; alreadyAttempted: boolean }> {
  const quiz = await getDailyQuizFromStore(input.now);
  const correct = normalizeAnswer(input.answer) === normalizeAnswer(quiz.correctAnswer);
  const points = correct ? 10 : 2;
  const sb = supabaseAdmin();

  const { data: existingAttempt, error: existingError } = await sb
    .from('discord_quiz_attempts')
    .select('correct, points_awarded')
    .eq('quiz_key', quiz.key)
    .eq('discord_user_id', input.discordUserId)
    .maybeSingle();
  if (existingError) console.warn('[discord/engagement] quiz attempt read failed', existingError.message);
  if (existingAttempt) {
    return {
      quiz,
      correct: Boolean(existingAttempt.correct),
      points: 0,
      alreadyAttempted: true,
    };
  }

  let insertedAttempt = true;
  try {
    const { error } = await sb.from('discord_quiz_attempts').insert({
      quiz_key: quiz.key,
      discord_user_id: input.discordUserId,
      discord_username: input.username ?? null,
      answer: input.answer,
      correct,
      points_awarded: points,
    });
    if (error) {
      if (isUniqueViolation(error)) insertedAttempt = false;
      else throw error;
    }
  } catch (err) {
    console.warn('[discord/engagement] quiz attempt insert failed', err instanceof Error ? err.message : err);
    insertedAttempt = false;
  }

  if (!insertedAttempt) {
    return {
      quiz,
      correct,
      points: 0,
      alreadyAttempted: true,
    };
  }

  const award = await awardDiscordPoints({
    discordUserId: input.discordUserId,
    username: input.username,
    points,
    reason: correct ? 'daily_quiz_correct' : 'daily_quiz_attempt',
    source: 'quiz',
    actionKey: quizAttemptActionKey(quiz.key, input.discordUserId),
    metadata: { quiz_key: quiz.key, correct },
  });
  if (award.awarded) {
    await completeOnboardingStep({
      discordUserId: input.discordUserId,
      username: input.username,
      stepKey: 'daily',
      metadata: { quiz_key: quiz.key, correct },
    });
  }

  return { quiz, correct, points: award.awarded ? points : 0, alreadyAttempted: !award.awarded };
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && String((error as { code?: unknown }).code) === '23505';
}

export async function submitDailyChallenge(input: {
  discordUserId: string;
  username?: string | null;
  summary: string;
  link?: string | null;
  now?: Date;
}): Promise<{ id: string | null; challenge: DailyChallenge; points: number; status: 'pending' | 'duplicate'; alreadySubmitted: boolean }> {
  const challenge = await getDailyChallengeFromStore(input.now);
  const sb = supabaseAdmin();
  const summary = cleanText(input.summary);
  if (!summary || summary.length < 20) {
    throw new Error('Challenge summary must describe the artifact, what changed, and the proof link/context.');
  }

  const { data: existing, error: existingError } = await sb
    .from('discord_challenge_submissions')
    .select('id, status')
    .eq('challenge_key', challenge.key)
    .eq('discord_user_id', input.discordUserId)
    .maybeSingle();
  if (existingError) console.warn('[discord/engagement] challenge submission read failed', existingError.message);
  if (existing) {
    return {
      id: String(existing.id),
      challenge,
      points: 0,
      status: 'duplicate',
      alreadySubmitted: true,
    };
  }

  let submissionId: string | null = null;
  try {
    const { data, error } = await sb.from('discord_challenge_submissions').insert({
      challenge_key: challenge.key,
      discord_user_id: input.discordUserId,
      discord_username: input.username ?? null,
      summary,
      link: input.link ?? null,
      status: 'pending',
      points_awarded: 0,
    }).select('id').single();
    if (error) {
      if (isUniqueViolation(error)) {
        return {
          id: null,
          challenge,
          points: 0,
          status: 'duplicate',
          alreadySubmitted: true,
        };
      }
      throw error;
    }
    submissionId = String(data.id);
  } catch (err) {
    console.warn('[discord/engagement] challenge submission insert failed', err instanceof Error ? err.message : err);
    throw err;
  }

  await completeOnboardingStep({
    discordUserId: input.discordUserId,
    username: input.username,
    stepKey: 'challenge',
    metadata: { challenge_key: challenge.key, submission_id: submissionId, status: 'pending_review' },
  });

  return { id: submissionId, challenge, points: 0, status: 'pending', alreadySubmitted: false };
}

export async function reviewChallengeSubmission(input: {
  submissionId: string;
  status: 'approved' | 'featured' | 'rejected';
  reviewerDiscordUserId: string;
  reviewerUsername?: string | null;
  note?: string | null;
  featuredMessageId?: string | null;
}): Promise<{
  ok: boolean;
  reason?: string;
  submission?: {
    id: string;
    challengeKey: string;
    discordUserId: string;
    username: string | null;
    summary: string;
    link: string | null;
    status: string;
    pointsAwarded: number;
  };
  pointsAwarded: number;
}> {
  const sb = supabaseAdmin();
  const { data: current, error } = await sb
    .from('discord_challenge_submissions')
    .select('id, challenge_key, discord_user_id, discord_username, summary, link, status, points_awarded')
    .eq('id', input.submissionId)
    .maybeSingle();
  if (error) return { ok: false, reason: error.message, pointsAwarded: 0 };
  if (!current) return { ok: false, reason: 'submission_not_found', pointsAwarded: 0 };
  if (current.status === 'rejected') return { ok: false, reason: 'already_rejected', pointsAwarded: 0 };
  if (current.status === 'featured' && input.status === 'featured') return { ok: false, reason: 'already_featured', pointsAwarded: 0 };

  const challenge = await getChallengeByKey(String(current.challenge_key));
  const shouldAward = input.status === 'approved' || input.status === 'featured';
  let pointsAwarded = Number(current.points_awarded ?? 0);
  if (shouldAward && pointsAwarded <= 0) {
    const award = await awardDiscordPoints({
      discordUserId: String(current.discord_user_id),
      username: current.discord_username ? String(current.discord_username) : null,
      points: challenge.points,
      reason: input.status === 'featured' ? 'challenge_featured' : 'challenge_approved',
      source: 'challenge',
      actionKey: challengeSubmissionActionKey(String(current.challenge_key), String(current.discord_user_id)),
      metadata: {
        challenge_key: current.challenge_key,
        submission_id: current.id,
        reviewed_by: input.reviewerUsername ?? null,
      },
    });
    pointsAwarded = award.awarded ? challenge.points : pointsAwarded;
  }

  const nextStatus = input.status;
  const { error: updateError } = await sb
    .from('discord_challenge_submissions')
    .update({
      status: nextStatus,
      points_awarded: pointsAwarded,
      reviewed_at: new Date().toISOString(),
      reviewed_by_discord_user_id: input.reviewerDiscordUserId,
      reviewed_by_discord_username: input.reviewerUsername ?? null,
      review_note: input.note ?? null,
      featured_message_id: input.featuredMessageId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.submissionId);
  if (updateError) return { ok: false, reason: updateError.message, pointsAwarded: 0 };

  return {
    ok: true,
    pointsAwarded,
    submission: {
      id: String(current.id),
      challengeKey: String(current.challenge_key),
      discordUserId: String(current.discord_user_id),
      username: current.discord_username ? String(current.discord_username) : null,
      summary: String(current.summary),
      link: current.link ? String(current.link) : null,
      status: nextStatus,
      pointsAwarded,
    },
  };
}

async function getChallengeByKey(challengeKey: string): Promise<DailyChallenge> {
  try {
    const { data, error } = await supabaseAdmin()
      .from('discord_challenges')
      .select('challenge_key, title, prompt, deliverable, points')
      .eq('challenge_key', challengeKey)
      .maybeSingle();
    if (!error && data) {
      return {
        key: String(data.challenge_key),
        title: String(data.title),
        prompt: String(data.prompt),
        deliverable: String(data.deliverable),
        points: Number(data.points ?? 25),
      };
    }
  } catch {
    // fall through to seed lookup
  }
  return dailyChallenges.find((challenge) => challenge.key === challengeKey) ?? getDailyChallenge();
}

export async function getMemberPoints(discordUserId: string): Promise<{ total: number; streak: number; longestStreak: number; rank: number | null }> {
  const sb = supabaseAdmin();
  const [{ data: ledger }, { data: streak }, leaderboard] = await Promise.all([
    sb.from('discord_points_ledger').select('points').eq('discord_user_id', discordUserId).limit(1000),
    sb.from('discord_member_streaks').select('current_streak, longest_streak').eq('discord_user_id', discordUserId).maybeSingle(),
    getLeaderboard(100),
  ]);
  const total = (ledger ?? []).reduce((sum, row) => sum + Number(row.points ?? 0), 0);
  const rankIndex = leaderboard.findIndex((row) => row.discordUserId === discordUserId);
  return {
    total,
    streak: Number(streak?.current_streak ?? 0),
    longestStreak: Number(streak?.longest_streak ?? 0),
    rank: rankIndex >= 0 ? rankIndex + 1 : null,
  };
}

export async function getLeaderboard(limit = 10): Promise<Array<{ discordUserId: string; username: string; points: number }>> {
  const { data } = await supabaseAdmin()
    .from('discord_points_ledger')
    .select('discord_user_id, discord_username, points')
    .order('created_at', { ascending: false })
    .limit(2000);

  const totals = new Map<string, { discordUserId: string; username: string; points: number }>();
  for (const row of data ?? []) {
    const id = String(row.discord_user_id);
    const current = totals.get(id) ?? { discordUserId: id, username: String(row.discord_username ?? id), points: 0 };
    current.username = String(row.discord_username ?? current.username);
    current.points += Number(row.points ?? 0);
    totals.set(id, current);
  }
  return [...totals.values()].sort((a, b) => b.points - a.points).slice(0, limit);
}

export async function askDiscordQuestion(input: {
  discordUserId: string;
  username?: string | null;
  question: string;
  context?: string | null;
  messageId?: string | null;
}): Promise<{ id: string }> {
  const { data, error } = await supabaseAdmin()
    .from('discord_questions')
    .insert({
      discord_user_id: input.discordUserId,
      discord_username: input.username ?? null,
      question: input.question,
      context: input.context ?? null,
      channel_base_name: 'questions',
      message_id: input.messageId ?? null,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);

  await awardDiscordPoints({
    discordUserId: input.discordUserId,
    username: input.username,
    points: 5,
    reason: 'question_asked',
    source: 'question',
    metadata: { question_id: data.id },
  });

  return { id: String(data.id) };
}

export async function answerDiscordQuestion(input: {
  questionId: string;
  discordUserId: string;
  username?: string | null;
  answer: string;
  messageId?: string | null;
}): Promise<{ id: string }> {
  const { data, error } = await supabaseAdmin()
    .from('discord_answers')
    .insert({
      question_id: input.questionId,
      discord_user_id: input.discordUserId,
      discord_username: input.username ?? null,
      answer: input.answer,
      points_awarded: 10,
      message_id: input.messageId ?? null,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);

  await awardDiscordPoints({
    discordUserId: input.discordUserId,
    username: input.username,
    points: 10,
    reason: 'question_answered',
    source: 'answer',
    metadata: { question_id: input.questionId, answer_id: data.id },
  });

  return { id: String(data.id) };
}

export async function markDiscordAnswerHelpful(input: {
  answerId: string;
  reviewerDiscordUserId: string;
  reviewerUsername?: string | null;
}): Promise<{ ok: boolean; reason?: string; answererDiscordUserId?: string; answererUsername?: string | null; questionId?: string }> {
  const sb = supabaseAdmin();
  const { data: answer, error } = await sb
    .from('discord_answers')
    .select('id, question_id, discord_user_id, discord_username, helpful')
    .eq('id', input.answerId)
    .maybeSingle();
  if (error) return { ok: false, reason: error.message };
  if (!answer) return { ok: false, reason: 'answer_not_found' };
  if (answer.helpful) return { ok: false, reason: 'already_helpful' };

  const { error: updateError } = await sb
    .from('discord_answers')
    .update({
      helpful: true,
      helpful_by_discord_user_id: input.reviewerDiscordUserId,
      helpful_by_discord_username: input.reviewerUsername ?? null,
      points_awarded: 25,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.answerId);
  if (updateError) return { ok: false, reason: updateError.message };

  await sb
    .from('discord_questions')
    .update({ status: 'answered', updated_at: new Date().toISOString() })
    .eq('id', answer.question_id);

  await awardDiscordPoints({
    discordUserId: String(answer.discord_user_id),
    username: answer.discord_username ? String(answer.discord_username) : null,
    points: 15,
    reason: 'answer_marked_helpful',
    source: 'helpful_answer',
    metadata: { question_id: answer.question_id, answer_id: input.answerId, reviewer: input.reviewerUsername ?? null },
  });

  return {
    ok: true,
    answererDiscordUserId: String(answer.discord_user_id),
    answererUsername: answer.discord_username ? String(answer.discord_username) : null,
    questionId: String(answer.question_id),
  };
}

export async function manuallyAwardDiscordPoints(input: {
  discordUserId: string;
  username?: string | null;
  points: number;
  reason: string;
  awardedByDiscordUserId: string;
  awardedByUsername?: string | null;
}): Promise<void> {
  try {
    await supabaseAdmin().from('discord_reputation_adjustments').insert({
      discord_user_id: input.discordUserId,
      discord_username: input.username ?? null,
      points: input.points,
      reason: input.reason,
      awarded_by_discord_user_id: input.awardedByDiscordUserId,
      awarded_by_discord_username: input.awardedByUsername ?? null,
    });
  } catch (err) {
    console.warn('[discord/engagement] reputation adjustment insert failed', err instanceof Error ? err.message : err);
  }
  await awardDiscordPoints({
    discordUserId: input.discordUserId,
    username: input.username,
    points: input.points,
    reason: 'manual_award',
    source: 'admin_award',
    metadata: { reason: input.reason, awarded_by: input.awardedByUsername ?? null },
  });
}

export async function getOpenQuestions(limit = 5): Promise<DiscordQuestion[]> {
  try {
    const { data, error } = await supabaseAdmin()
      .from('discord_questions')
      .select('id, question, context, discord_username, status, created_at')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data ?? []).map((row) => ({
      id: String(row.id),
      question: String(row.question),
      context: row.context ? String(row.context) : null,
      username: row.discord_username ? String(row.discord_username) : null,
      status: String(row.status),
      createdAt: String(row.created_at),
    }));
  } catch {
    return [];
  }
}

export async function getRecentAnswers(limit = 5): Promise<DiscordAnswer[]> {
  try {
    const { data, error } = await supabaseAdmin()
      .from('discord_answers')
      .select('id, question_id, answer, discord_username, helpful, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data ?? []).map((row) => ({
      id: String(row.id),
      questionId: String(row.question_id),
      answer: String(row.answer),
      username: row.discord_username ? String(row.discord_username) : null,
      helpful: Boolean(row.helpful),
      createdAt: String(row.created_at),
    }));
  } catch {
    return [];
  }
}

export async function captureContentQueueItem(input: {
  source: string;
  idea: string;
  discordUserId?: string | null;
  username?: string | null;
  channelBaseName?: string | null;
  angle?: string | null;
  priority?: number;
  metadata?: Json;
}): Promise<{ id: string } | null> {
  try {
    const { data, error } = await supabaseAdmin().from('discord_content_queue').insert({
      source: input.source,
      discord_user_id: input.discordUserId ?? null,
      discord_username: input.username ?? null,
      channel_base_name: input.channelBaseName ?? null,
      idea: input.idea,
      angle: input.angle ?? null,
      priority: input.priority ?? 50,
      metadata: input.metadata ?? {},
    }).select('id').single();
    if (error) throw error;
    return { id: String(data.id) };
  } catch (err) {
    console.warn('[discord/engagement] content queue insert failed', err instanceof Error ? err.message : err);
    return null;
  }
}

export async function submitProjectToBuildLab(input: {
  discordUserId: string;
  username?: string | null;
  title: string;
  pathKey?: string | null;
  goal: string;
  link?: string | null;
}): Promise<{ id: string; contentQueueId: string | null }> {
  const title = cleanText(input.title);
  const goal = cleanText(input.goal);
  if (!title || title.length < 4) throw new Error('Project title is required.');
  if (!goal || goal.length < 20) throw new Error('Project goal must include the outcome, user, and useful proof target.');
  const queue = await captureContentQueueItem({
    source: 'project_submission',
    idea: `${title}: ${goal}`,
    discordUserId: input.discordUserId,
    username: input.username,
    channelBaseName: 'build-lab',
    angle: input.pathKey ?? null,
    priority: 68,
    metadata: { title, path_key: input.pathKey ?? null, link: input.link ?? null },
  });
  const { data, error } = await supabaseAdmin()
    .from('discord_project_submissions')
    .insert({
      discord_user_id: input.discordUserId,
      discord_username: input.username ?? null,
      title,
      path_key: input.pathKey ?? null,
      goal,
      link: input.link ?? null,
      status: 'queued',
      content_queue_id: queue?.id ?? null,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  await completeOnboardingStep({
    discordUserId: input.discordUserId,
    username: input.username,
    stepKey: 'project',
    metadata: { project_id: data.id, content_queue_id: queue?.id ?? null, title, path_key: input.pathKey ?? null },
  });
  return { id: String(data.id), contentQueueId: queue?.id ?? null };
}

export async function getContentQueue(limit = 5): Promise<Array<{ idea: string; source: string; username: string | null; createdAt: string }>> {
  const { data } = await supabaseAdmin()
    .from('discord_content_queue')
    .select('idea, source, discord_username, created_at')
    .eq('status', 'captured')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    idea: String(row.idea),
    source: String(row.source),
    username: row.discord_username ? String(row.discord_username) : null,
    createdAt: String(row.created_at),
  }));
}

export async function getWeeklyChallengeRecap(limit = 5): Promise<{
  count: number;
  submissions: Array<{ username: string; summary: string; challengeKey: string; link: string | null; createdAt: string }>;
}> {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const { data } = await supabaseAdmin()
    .from('discord_challenge_submissions')
    .select('challenge_key, discord_username, summary, link, created_at')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
    .limit(limit);

  return {
    count: data?.length ?? 0,
    submissions: (data ?? []).map((row) => ({
      username: String(row.discord_username ?? 'member'),
      summary: String(row.summary),
      challengeKey: String(row.challenge_key),
      link: row.link ? String(row.link) : null,
      createdAt: String(row.created_at),
    })),
  };
}

export async function isApprovedDiscordMember(discordUserId: string): Promise<boolean> {
  const { data } = await supabaseAdmin()
    .from('discord_members')
    .select('academy_member')
    .eq('discord_user_id', discordUserId)
    .maybeSingle();
  return Boolean(data?.academy_member);
}

export async function submitMemberApplication(input: {
  discordUserId: string;
  username?: string | null;
  goal: string;
  experience: string;
  intendedBuild: string;
  pathKey?: string | null;
  levelKey?: string | null;
  timezone?: string | null;
  weeklyTimeBudget?: string | null;
  primaryGoal?: string | null;
  preferredSupport?: string | null;
  portfolioUrl?: string | null;
  referralSource?: string | null;
  rulesAccepted: boolean;
}): Promise<{ ok: boolean; reason?: string }> {
  if (!input.rulesAccepted) return { ok: false, reason: 'rules_not_accepted' };
  const normalized = normalizeMemberApplicationProfile(input);
  if (!normalized.goal || !normalized.experience || !normalized.intendedBuild) {
    return { ok: false, reason: 'missing_required_profile_fields' };
  }
  try {
    const { error } = await supabaseAdmin().from('discord_member_applications').insert({
      discord_user_id: input.discordUserId,
      discord_username: input.username ?? null,
      goal: normalized.goal,
      experience: normalized.experience,
      intended_build: normalized.intendedBuild,
      path_key: normalized.pathKey,
      level_key: normalized.levelKey,
      timezone: normalized.timezone,
      weekly_time_budget: normalized.weeklyTimeBudget,
      primary_goal: normalized.primaryGoal,
      preferred_support: normalized.preferredSupport,
      portfolio_url: normalized.portfolioUrl,
      referral_source: normalized.referralSource,
      rules_accepted: input.rulesAccepted,
      status: 'pending',
    });
    if (error) {
      if (error.code === '23505') return { ok: false, reason: 'already_pending' };
      return { ok: false, reason: error.message };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

export async function reviewMemberApplication(input: {
  discordUserId: string;
  status: 'approved' | 'rejected';
  reviewerDiscordUserId: string;
  reviewerUsername?: string | null;
  note?: string | null;
}): Promise<{ ok: boolean; reason?: string; application?: MemberApplicationProfile }> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from('discord_member_applications')
    .select('id, discord_user_id, discord_username, goal, experience, intended_build, path_key, level_key, timezone, weekly_time_budget, primary_goal, preferred_support, portfolio_url, referral_source, submitted_at')
    .eq('discord_user_id', input.discordUserId)
    .eq('status', 'pending')
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { ok: false, reason: error.message };
  if (!data?.id) return { ok: false, reason: 'no_pending_application' };

  const { error: updateError } = await sb
    .from('discord_member_applications')
    .update({
      status: input.status,
      reviewer_discord_user_id: input.reviewerDiscordUserId,
      reviewer_discord_username: input.reviewerUsername ?? null,
      review_note: input.note ?? null,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.id);

  if (updateError) return { ok: false, reason: updateError.message };
  return { ok: true, application: mapMemberApplication(data) };
}

export async function getPendingApplications(limit = 10): Promise<Array<{
  discordUserId: string;
  username: string | null;
  goal: string;
  experience: string;
  intendedBuild: string;
  pathKey: string | null;
  levelKey: string | null;
  timezone: string | null;
  weeklyTimeBudget: string | null;
  preferredSupport: string | null;
  submittedAt: string;
}>> {
  const { data } = await supabaseAdmin()
    .from('discord_member_applications')
    .select('discord_user_id, discord_username, goal, experience, intended_build, path_key, level_key, timezone, weekly_time_budget, preferred_support, submitted_at')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true })
    .limit(limit);

  return (data ?? []).map((row) => ({
    discordUserId: String(row.discord_user_id),
    username: row.discord_username ? String(row.discord_username) : null,
    goal: String(row.goal),
    experience: String(row.experience),
    intendedBuild: String(row.intended_build),
    pathKey: row.path_key ? String(row.path_key) : null,
    levelKey: row.level_key ? String(row.level_key) : null,
    timezone: row.timezone ? String(row.timezone) : null,
    weeklyTimeBudget: row.weekly_time_budget ? String(row.weekly_time_budget) : null,
    preferredSupport: row.preferred_support ? String(row.preferred_support) : null,
    submittedAt: String(row.submitted_at),
  }));
}

function mapMemberApplication(row: Record<string, unknown>): MemberApplicationProfile {
  return {
    discordUserId: String(row.discord_user_id),
    username: row.discord_username ? String(row.discord_username) : null,
    goal: String(row.goal),
    experience: String(row.experience),
    intendedBuild: String(row.intended_build),
    pathKey: row.path_key ? String(row.path_key) : null,
    levelKey: row.level_key ? String(row.level_key) : null,
    timezone: row.timezone ? String(row.timezone) : null,
    weeklyTimeBudget: row.weekly_time_budget ? String(row.weekly_time_budget) : null,
    primaryGoal: row.primary_goal ? String(row.primary_goal) : null,
    preferredSupport: row.preferred_support ? String(row.preferred_support) : null,
    portfolioUrl: row.portfolio_url ? String(row.portfolio_url) : null,
    referralSource: row.referral_source ? String(row.referral_source) : null,
    submittedAt: String(row.submitted_at),
  };
}
