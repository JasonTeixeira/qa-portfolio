import 'server-only'
import { fsrs, generatorParameters, createEmptyCard, Rating, type Card, type Grade } from 'ts-fsrs'
import { supabaseAdmin } from '@/lib/supabase/server'
import { recordActivityAndAward, pickCelebration, type Celebration } from '@/lib/academy/gamification'
import { awardDailyBonusIfEarned } from '@/lib/academy/quests'
import { emitAcademyEvent } from '@/lib/academy/events'

/**
 * FSRS spaced-repetition engine (Phase 1, dim 5). Content-agnostic scaffold: a
 * review card is seeded per completed lesson with a prompt derived from the lesson
 * title. Real recall prompts (a `review` block in lesson content) replace the
 * placeholder later without changing any of this machinery.
 * 0.90 target retention — the research sweet spot.
 */
const scheduler = fsrs(generatorParameters({ request_retention: 0.9, enable_fuzz: true }))

export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy'
const RATING: Record<ReviewGrade, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
}

export interface DueReview {
  id: string
  conceptKey: string
  courseSlug: string | null
  lessonSlug: string | null
  prompt: string
  /** Human "N-day window" the card is scheduled on (real, from FSRS stability). */
  intervalLabel: string
}

/** Round a stability (days) into an honest human recall window ("7-day window"). */
function intervalLabelFromStability(stability: number | null): string {
  const s = Number(stability ?? 0)
  if (!(s > 0)) return 'first pass'
  if (s < 1.5) return 'same-day window'
  const days = Math.round(s)
  if (days < 45) return `${days}-day window`
  const weeks = Math.round(days / 7)
  if (weeks < 12) return `${weeks}-week window`
  return `${Math.round(days / 30)}-month window`
}

type ReviewRow = {
  fsrs_due_at: string
  fsrs_stability: number | null
  fsrs_difficulty: number | null
  fsrs_state: number | null
  reps: number | null
  lapses: number | null
  last_reviewed_at: string | null
}

function rowToCard(row: ReviewRow): Card {
  return {
    due: new Date(row.fsrs_due_at),
    stability: Number(row.fsrs_stability ?? 0),
    difficulty: Number(row.fsrs_difficulty ?? 0),
    elapsed_days: 0,
    scheduled_days: 0,
    learning_steps: 0,
    reps: row.reps ?? 0,
    lapses: row.lapses ?? 0,
    state: (row.fsrs_state ?? 0) as Card['state'],
    last_review: row.last_reviewed_at ? new Date(row.last_reviewed_at) : undefined,
  }
}

/** Seed/backfill a review card for every completed lesson lacking one. */
export async function ensureReviewCardsForCompleted(userId: string): Promise<void> {
  const sb = supabaseAdmin()
  const [{ data: completed }, { data: existing }] = await Promise.all([
    sb.from('academy_progress').select('course_slug, lesson_slug').eq('user_id', userId).eq('status', 'completed'),
    sb.from('academy_reviews').select('concept_key').eq('user_id', userId),
  ])
  const have = new Set((existing ?? []).map((r) => r.concept_key))
  const missing = (completed ?? []).filter((c) => c.lesson_slug && !have.has(c.lesson_slug))
  if (!missing.length) return

  const slugs = missing.map((m) => m.lesson_slug as string)
  const { data: lessons } = await sb.from('academy_lessons').select('slug, title').in('slug', slugs)
  const titleBy = new Map((lessons ?? []).map((l) => [l.slug, l.title as string]))
  const now = new Date()
  const rows = missing.map((m) => {
    const card = createEmptyCard(now)
    const title = titleBy.get(m.lesson_slug as string) ?? (m.lesson_slug as string)
    return {
      user_id: userId,
      concept_key: m.lesson_slug,
      course_slug: m.course_slug,
      lesson_slug: m.lesson_slug,
      prompt: `Recall the key idea from "${title}" — explain it as if teaching someone.`,
      fsrs_difficulty: card.difficulty,
      fsrs_stability: card.stability,
      fsrs_state: card.state,
      fsrs_due_at: card.due.toISOString(),
      reps: card.reps,
      lapses: card.lapses,
    }
  })
  await sb.from('academy_reviews').upsert(rows, { onConflict: 'user_id,concept_key', ignoreDuplicates: true })
}

export async function getDueReviews(userId: string, limit = 20): Promise<DueReview[]> {
  const sb = supabaseAdmin()
  const { data } = await sb
    .from('academy_reviews')
    .select('id, concept_key, course_slug, lesson_slug, prompt, fsrs_stability')
    .eq('user_id', userId)
    .lte('fsrs_due_at', new Date().toISOString())
    .order('fsrs_due_at', { ascending: true })
    .limit(limit)
  return (data ?? []).map((r) => ({
    id: r.id,
    conceptKey: r.concept_key,
    courseSlug: r.course_slug,
    lessonSlug: r.lesson_slug,
    prompt: r.prompt ?? r.concept_key,
    intervalLabel: intervalLabelFromStability(r.fsrs_stability as number | null),
  }))
}

/**
 * Real mean retrievability across the learner's reviewed cards — the FSRS
 * forgetting curve R(t) = (1 + t/(9·S))^(-1) evaluated per card at elapsed time,
 * averaged and expressed as a percent. Returns null when no card has been
 * reviewed yet (nothing real to average) so the UI can honestly omit the stat.
 */
export async function getRetentionRate(userId: string): Promise<number | null> {
  const sb = supabaseAdmin()
  const { data } = await sb
    .from('academy_reviews')
    .select('fsrs_stability, last_reviewed_at')
    .eq('user_id', userId)
    .gt('reps', 0)
  const rows = data ?? []
  if (!rows.length) return null
  const now = Date.now()
  const DAY_MS = 24 * 60 * 60 * 1000
  let sum = 0
  let n = 0
  for (const r of rows) {
    const stability = Number(r.fsrs_stability ?? 0)
    if (!(stability > 0)) continue
    const last = r.last_reviewed_at ? new Date(r.last_reviewed_at).getTime() : now
    const elapsedDays = Math.max(0, (now - last) / DAY_MS)
    sum += scheduler.forgetting_curve(elapsedDays, stability)
    n += 1
  }
  if (n === 0) return null
  return Math.round((sum / n) * 100)
}

export async function getDueCount(userId: string): Promise<number> {
  const sb = supabaseAdmin()
  const { count } = await sb
    .from('academy_reviews')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lte('fsrs_due_at', new Date().toISOString())
  return count ?? 0
}

/** Grade a review → FSRS schedules next due; awards review XP + advances streak. */
export async function gradeReview(
  userId: string,
  cardId: string,
  grade: ReviewGrade,
): Promise<{ ok: boolean; celebration?: Celebration | null; nextDueAt?: string; streak?: number }> {
  const sb = supabaseAdmin()
  const { data: row } = await sb.from('academy_reviews').select('*').eq('id', cardId).eq('user_id', userId).maybeSingle()
  if (!row) return { ok: false }
  const now = new Date()
  const { card } = scheduler.next(rowToCard(row as ReviewRow), now, RATING[grade])
  await sb
    .from('academy_reviews')
    .update({
      fsrs_difficulty: card.difficulty,
      fsrs_stability: card.stability,
      fsrs_state: card.state,
      fsrs_due_at: card.due.toISOString(),
      reps: card.reps,
      lapses: card.lapses,
      last_grade: RATING[grade],
      last_reviewed_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', cardId)
  let celebration: Celebration | null = null
  let streak: number | undefined
  try {
    const state = await recordActivityAndAward(userId, 'review', now)
    celebration = pickCelebration(state)
    streak = state.streak.current
    await awardDailyBonusIfEarned(userId) // credit the variable daily bonus if this review earned it (idempotent)
  } catch (err) {
    console.error('[academy/fsrs] review award failed', err)
  }
  // STAGE 2 instrumentation (best-effort): one review_completed per real graded review.
  await emitAcademyEvent(userId, 'review_completed', { grade })
  return { ok: true, celebration, nextDueAt: card.due.toISOString(), streak }
}
