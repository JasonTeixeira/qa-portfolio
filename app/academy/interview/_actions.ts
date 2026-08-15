'use server'

import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase/server'
import { deepSeekChat } from '@/lib/rag/deepseek'
import {
  buildGraderMessages,
  parseVerdict,
  type GraderArtifact,
  type GraderTranscriptTurn,
} from '@/lib/academy/interview/grader-logic'
import {
  DIMENSION_SLUGS,
  barForLevel,
  barStatus,
} from '@/lib/academy/interview/rubric'

/**
 * Server actions for the Interview Mastery core loop: start a mock, and grade a
 * finished one into a real committee verdict.
 *
 * SECURITY / INTEGRITY (Spec §5.2, §7):
 *   - userId is ALWAYS from the authenticated session — never from arguments.
 *   - The session must belong to the caller.
 *   - The committee verdict is INSERTED via the service role (interview_verdicts
 *     has no client insert path by design), and the overall score is the
 *     deterministic min-cap from rubric.ts — never the model's number.
 *   - Readiness rows + the snapshot are written via the service role, derived
 *     entirely from the verdict. No fabricated numbers.
 *   - Pure prompt-building / parsing / min-cap live in grader-logic.ts; this file
 *     is orchestration + IO only.
 */

const GRADER_MAX_TOKENS = 1200

export type CreateSessionResult =
  | { ok: true; sessionId: string }
  | { ok: false; reason: string }

export type GradeSessionResult =
  | { ok: true; verdictId: string }
  | { ok: false; reason: string }

// ── createSession ────────────────────────────────────────────────────────────

/**
 * Start a mock. Inserts an interview_sessions row FOR THE CALLER via the own-row
 * RLS insert path. Track comes from the scenario; level from the learner's
 * profile (default senior). Typed mode by default.
 */
export async function createSession(input: {
  scenarioSlug: string
  mode?: 'typed' | 'voice'
}): Promise<CreateSessionResult> {
  try {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return { ok: false, reason: 'unauthorized' }

    const scenarioSlug = typeof input.scenarioSlug === 'string' ? input.scenarioSlug.trim() : ''
    if (!scenarioSlug) return { ok: false, reason: 'scenario_required' }

    // Scenario is public-read content; RLS select is fine.
    const { data: scenario } = await sb
      .from('interview_scenarios')
      .select('id, track, title, description')
      .eq('slug', scenarioSlug)
      .eq('status', 'published')
      .maybeSingle()
    if (!scenario) return { ok: false, reason: 'scenario_not_found' }

    // Level from the learner's own profile (own-row RLS), default to senior.
    const { data: profile } = await sb
      .from('interview_profiles')
      .select('target_level')
      .eq('user_id', user.id)
      .maybeSingle()
    const level =
      profile?.target_level && ['intern', 'new_grad', 'mid', 'senior'].includes(profile.target_level)
        ? profile.target_level
        : 'senior'

    const mode = input.mode === 'voice' ? 'voice' : 'typed'

    // Own-row RLS insert: the caller creates their own session row.
    const { data: inserted, error } = await sb
      .from('interview_sessions')
      .insert({
        user_id: user.id,
        scenario_id: scenario.id,
        track: scenario.track,
        level,
        mode,
        status: 'live',
        question_title: scenario.title,
        question_body: scenario.description,
      })
      .select('id')
      .maybeSingle()
    if (error || !inserted) {
      console.error('[academy/interview/_actions] createSession insert failed', error)
      return { ok: false, reason: 'insert_failed' }
    }

    return { ok: true, sessionId: inserted.id as string }
  } catch (err) {
    console.error('[academy/interview/_actions] createSession threw', err)
    return { ok: false, reason: 'server_error' }
  }
}

// ── gradeSession ─────────────────────────────────────────────────────────────

type TurnRow = { seq: number; speaker: 'interviewer' | 'candidate'; content: string; ts_seconds: number | null }
type ArtifactRow = { kind: 'code' | 'whiteboard' | 'negotiation'; payload: Record<string, unknown> | null }

/** Count candidate words across the transcript (authoritative `words`). */
function countCandidateWords(turns: readonly TurnRow[]): number {
  let words = 0
  for (const t of turns) {
    if (t.speaker !== 'candidate') continue
    words += t.content.split(/\s+/).filter(Boolean).length
  }
  return words
}

/**
 * Grade a finished session into a real committee verdict.
 *
 * Flow: verify ownership → refuse if already graded → assemble transcript +
 * artifacts → deepSeekChat (temp 0) → parseVerdict (min-cap disposes the model's
 * numbers) → insert verdict (service role) → upsert 6 readiness rows + 1 snapshot
 * (service role) → mark the session completed.
 */
export async function gradeSession(sessionId: string): Promise<GradeSessionResult> {
  try {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return { ok: false, reason: 'unauthorized' }
    const userId = user.id

    if (typeof sessionId !== 'string' || !sessionId.trim()) {
      return { ok: false, reason: 'session_required' }
    }

    // Ownership via own-row RLS read.
    const { data: session } = await sb
      .from('interview_sessions')
      .select('id, user_id, level, is_placement, started_at')
      .eq('id', sessionId)
      .maybeSingle()
    if (!session || session.user_id !== userId) {
      return { ok: false, reason: 'forbidden' }
    }

    const admin = supabaseAdmin()

    // Refuse to regrade (verdict is unique per session).
    const { data: existing } = await admin
      .from('interview_verdicts')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle()
    if (existing) return { ok: false, reason: 'already_graded' }

    // Honest degrade: no key ⇒ no grade (never a fabricated verdict).
    if (!process.env.DEEPSEEK_API_KEY?.trim()) {
      return { ok: false, reason: 'grader_unavailable' }
    }

    // Assemble the transcript + artifacts (the caller's own rows).
    const [{ data: turnRows }, { data: artifactRows }] = await Promise.all([
      admin
        .from('interview_turns')
        .select('seq, speaker, content, ts_seconds')
        .eq('session_id', sessionId)
        .order('seq', { ascending: true }),
      admin.from('interview_artifacts').select('kind, payload').eq('session_id', sessionId),
    ])
    const turns: TurnRow[] = Array.isArray(turnRows) ? (turnRows as TurnRow[]) : []
    if (turns.length === 0) return { ok: false, reason: 'empty_transcript' }

    const transcript: GraderTranscriptTurn[] = turns.map((t) => ({
      speaker: t.speaker,
      content: t.content,
      ts_seconds: t.ts_seconds,
    }))
    const artifacts: GraderArtifact[] = (Array.isArray(artifactRows) ? (artifactRows as ArtifactRow[]) : []).map(
      (a) => ({ kind: a.kind, payload: a.payload ?? {} }),
    )

    const words = countCandidateWords(turns)

    // Prior overall score for the delta (most recent earlier verdict).
    const { data: priorVerdict } = await admin
      .from('interview_verdicts')
      .select('score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    const prevScore = typeof priorVerdict?.score === 'number' ? priorVerdict.score : null

    // Grade (temp 0, JSON out). parseVerdict THROWS on malformed / out-of-taxonomy.
    let verdict
    try {
      const result = await deepSeekChat({
        messages: buildGraderMessages({ transcript, artifacts, level: session.level }),
        temperature: 0,
        maxTokens: GRADER_MAX_TOKENS,
      })
      verdict = parseVerdict(result.content, { level: session.level, prevScore, words })
    } catch (err) {
      console.error('[academy/interview/_actions] grade parse failed', err)
      return { ok: false, reason: 'grade_failed' }
    }

    // Insert the verdict via the service role (no client insert path by design).
    const { data: insertedVerdict, error: verdictError } = await admin
      .from('interview_verdicts')
      .insert({
        session_id: sessionId,
        user_id: userId,
        score: verdict.score,
        prev_score: verdict.prev_score,
        verdict: verdict.verdict,
        dims: verdict.dims,
        evidence: verdict.evidence,
        speech_analytics: null, // typed session — no speech analytics (honest)
        summary_sentence: verdict.summary_sentence,
        claims_checked: verdict.claims_checked,
        words: verdict.words,
      })
      .select('id')
      .maybeSingle()
    if (verdictError || !insertedVerdict) {
      console.error('[academy/interview/_actions] verdict insert failed', verdictError)
      return { ok: false, reason: 'verdict_insert_failed' }
    }
    const verdictId = insertedVerdict.id as string

    // Update readiness + snapshot (service role), derived entirely from the verdict.
    await updateReadiness(admin, userId, session.level, verdict.dims)
    await insertSnapshot(admin, userId, verdict.score, verdict.dims, session.is_placement === true)

    // Mark the session completed.
    await admin
      .from('interview_sessions')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', sessionId)

    return { ok: true, verdictId }
  } catch (err) {
    console.error('[academy/interview/_actions] gradeSession threw', err)
    return { ok: false, reason: 'server_error' }
  }
}

type AdminClient = ReturnType<typeof supabaseAdmin>
type VerdictDim = { slug: string; score: number; bar_status: string }

/** Upsert the six per-dimension readiness rows (service role), with trend vs prior. */
async function updateReadiness(
  admin: AdminClient,
  userId: string,
  level: string,
  dims: readonly VerdictDim[],
): Promise<void> {
  // Only score dimensions in the fixed taxonomy.
  const scored = dims.filter((d) => (DIMENSION_SLUGS as readonly string[]).includes(d.slug))
  if (scored.length === 0) return

  const { data: priorRows } = await admin
    .from('interview_readiness')
    .select('dimension_slug, score')
    .eq('user_id', userId)
  const prior = new Map<string, number>()
  for (const r of (priorRows ?? []) as Array<{ dimension_slug: string; score: number }>) {
    prior.set(r.dimension_slug, r.score)
  }
  const bar = barForLevel(level)
  const nowIso = new Date().toISOString()

  const rows = scored.map((d) => {
    const previous = prior.get(d.slug)
    const trend = typeof previous === 'number' ? d.score - previous : 0
    return {
      user_id: userId,
      dimension_slug: d.slug,
      score: d.score,
      trend,
      bar_status: d.bar_status ?? barStatus(d.score, bar),
      updated_at: nowIso,
    }
  })

  const { error } = await admin
    .from('interview_readiness')
    .upsert(rows, { onConflict: 'user_id,dimension_slug' })
  if (error) console.error('[academy/interview/_actions] readiness upsert failed', error)
}

/** Insert one readiness snapshot (service role); overall = the min-capped verdict score. */
async function insertSnapshot(
  admin: AdminClient,
  userId: string,
  overall: number,
  dims: readonly VerdictDim[],
  isPlacement: boolean,
): Promise<void> {
  const dimsMap: Record<string, number> = {}
  for (const d of dims) dimsMap[d.slug] = d.score
  const { error } = await admin.from('interview_readiness_snapshots').insert({
    user_id: userId,
    overall,
    dims: dimsMap,
    event: isPlacement ? 'placement' : 'today',
  })
  if (error) console.error('[academy/interview/_actions] snapshot insert failed', error)
}

// ── saveArtifact ─────────────────────────────────────────────────────────────

const ARTIFACT_KINDS = ['code', 'whiteboard', 'negotiation'] as const
type ArtifactKind = (typeof ARTIFACT_KINDS)[number]

export type SaveArtifactResult = { ok: true } | { ok: false; reason: string }

/**
 * Persist one piece of session work product (a code run, whiteboard notes, or a
 * negotiation sheet) for the live mock. The graded transcript weighs these via the
 * grader (grader-logic.describeArtifact) — most importantly `caught_the_lie` on a
 * code artifact, the deterministic verification signal.
 *
 * SECURITY: userId is ALWAYS from the session — never the args. The session must
 * belong to the caller (own-row RLS read), and the insert goes through the caller's
 * own-row RLS insert path (user_id = auth.uid()) — a learner can only ever write an
 * artifact onto their own session. The payload is stored as-is (untrusted content);
 * the grader treats it as untrusted data, never as instructions.
 */
export async function saveArtifact(input: {
  sessionId: string
  kind: ArtifactKind
  payload: Record<string, unknown>
}): Promise<SaveArtifactResult> {
  try {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return { ok: false, reason: 'unauthorized' }

    const sessionId = typeof input?.sessionId === 'string' ? input.sessionId.trim() : ''
    if (!sessionId) return { ok: false, reason: 'session_required' }
    if (!ARTIFACT_KINDS.includes(input?.kind)) return { ok: false, reason: 'invalid_kind' }
    const payload =
      input?.payload && typeof input.payload === 'object' && !Array.isArray(input.payload)
        ? input.payload
        : {}

    // Ownership: own-row RLS read of the caller's own session row.
    const { data: session } = await sb
      .from('interview_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .maybeSingle()
    if (!session || session.user_id !== user.id) return { ok: false, reason: 'forbidden' }

    // Own-row RLS insert: the caller writes an artifact onto their own session.
    const { error } = await sb.from('interview_artifacts').insert({
      session_id: sessionId,
      user_id: user.id,
      kind: input.kind,
      payload,
    })
    if (error) {
      console.error('[academy/interview/_actions] saveArtifact insert failed', error)
      return { ok: false, reason: 'insert_failed' }
    }
    return { ok: true }
  } catch (err) {
    console.error('[academy/interview/_actions] saveArtifact threw', err)
    return { ok: false, reason: 'server_error' }
  }
}
