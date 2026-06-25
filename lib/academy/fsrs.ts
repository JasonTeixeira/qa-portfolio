import 'server-only'
import { fsrs, generatorParameters, createEmptyCard, Rating, type Card, type Grade } from 'ts-fsrs'
import { supabaseAdmin } from '@/lib/supabase/server'
import { recordActivityAndAward } from '@/lib/academy/gamification'

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
    .select('id, concept_key, course_slug, lesson_slug, prompt')
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
  }))
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
export async function gradeReview(userId: string, cardId: string, grade: ReviewGrade): Promise<{ ok: boolean }> {
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
  try {
    await recordActivityAndAward(userId, 'review', now)
  } catch (err) {
    console.error('[academy/fsrs] review award failed', err)
  }
  return { ok: true }
}
