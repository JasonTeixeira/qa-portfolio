'use server'

import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase/server'
import { deepSeekChat } from '@/lib/rag/deepseek'
import {
  buildBriefMessages,
  parseBrief,
  type BriefMemberHistory,
  type BriefHistoryDimension,
  type BriefScenario,
} from '@/lib/academy/interview/brief-logic'
import { aggregateLoopVerdict, type LoopRoundVerdict } from '@/lib/academy/interview/loop-logic'
import { looksLikeInjection } from '@/lib/academy/interview/interviewer-logic'
import { DIMENSION_SLUGS } from '@/lib/academy/interview/rubric'

/**
 * Phase-3 write actions for the Interview Academy network layer: the AI company
 * brief, loop simulation (header → rounds → aggregate verdict), and the async
 * peer-match request. Kept out of the core-loop files so each surface stays
 * focused.
 *
 * SECURITY / INTEGRITY (Spec §5.4, §7):
 *   - userId is ALWAYS from the authenticated session — never from arguments.
 *   - generateBrief is grounded ONLY in the JD text + the member's OWN history
 *     (own-row reads); the prompt forbids fabricating private company data and
 *     brief-logic.parseBrief keeps only the structured fields + drops any queue
 *     slug that is not a REAL published scenario.
 *   - jdText feeds a prompt, so it is length-bounded and injection-guarded before
 *     any model call.
 *   - The loop's overall_verdict is DERIVED (loop-logic.aggregateLoopVerdict, a
 *     deterministic mean→band over the round verdicts) and written via the
 *     service role — never a self-asserted grade. Honest when rounds are ungraded.
 *   - Pairs is an ASYNC request only: requestPeerMatch writes status 'requested'
 *     with peer_user_id null. NO live room / presence is created or claimed (§7).
 *   - Every enum is validated against the 0115 migration CHECK constraints.
 */

const BRIEF_MAX_TOKENS = 1100
const MAX_JD_CHARS = 20000
const MIN_JD_CHARS = 40
const MAX_TEXT = 2000

// ── Result types (discriminated) ─────────────────────────────────────────────

export type GenerateBriefResult = { ok: true; briefId: string } | { ok: false; reason: string }
export type CreateLoopResult = { ok: true; loopId: string } | { ok: false; reason: string }
export type StartRoundResult =
  | { ok: true; sessionId: string; roundIndex: number }
  | { ok: false; reason: string }
export type FinalizeLoopResult =
  | { ok: true; overall: number; verdict: string; gradedRounds: number; totalRounds: number }
  | { ok: false; reason: string }
export type PeerMatchResult = { ok: true; id: string } | { ok: false; reason: string }

// ── Enums (mirror the 0115 migration CHECK constraints) ──────────────────────

const TRACKS = ['coding', 'system_design', 'behavioral', 'negotiation'] as const
type Track = (typeof TRACKS)[number]
const INTERVIEWER_STYLES = ['warm', 'neutral', 'skeptical', 'adversarial'] as const
const LEVELS = ['intern', 'new_grad', 'mid', 'senior'] as const

function isTrack(v: unknown): v is Track {
  return typeof v === 'string' && (TRACKS as readonly string[]).includes(v)
}
function cleanStr(v: unknown, max = MAX_TEXT): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t ? t.slice(0, max) : null
}

// ── generateBrief ────────────────────────────────────────────────────────────

type VerdictHistoryRow = { score: number; verdict: string; created_at: string }
type ReadinessRow = { dimension_slug: string; score: number; bar_status: string | null }
type ScenarioRow = { slug: string; title: string; track: string; trains: string[] | null }

/**
 * Generate a target-company brief from a pasted JD, grounded ONLY in the JD text
 * + the member's own history. Writes interview_company_briefs (own-row).
 *
 * Flow: auth → validate + injection-guard the JD → resolve the company (input or
 * profile — the column is NOT NULL) → assemble the member's OWN readiness /
 * verdict history → load published scenarios (the ONLY slugs the queue may use) →
 * deepSeekChat + parseBrief (drops hallucinated queue slugs, caps sizes, clamps
 * confidence) → insert.
 */
export async function generateBrief(input: {
  jdText: string
  company?: string
  role?: string
}): Promise<GenerateBriefResult> {
  try {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return { ok: false, reason: 'unauthorized' }
    const userId = user.id

    // JD feeds a prompt: bound it and injection-guard it before any model spend.
    const jdText = typeof input?.jdText === 'string' ? input.jdText.trim() : ''
    if (jdText.length < MIN_JD_CHARS) return { ok: false, reason: 'jd_too_short' }
    if (jdText.length > MAX_JD_CHARS) return { ok: false, reason: 'jd_too_long' }
    if (looksLikeInjection(jdText)) return { ok: false, reason: 'jd_rejected' }

    // company is NOT NULL in interview_company_briefs — take it from the input or
    // the member's own profile; refuse rather than fabricate a target.
    let company = cleanStr(input?.company, 160)
    const role = cleanStr(input?.role, 160)

    // Member's OWN profile (own-row) — for company fallback + target level.
    const { data: profile } = await sb
      .from('interview_profiles')
      .select('target_level, target_company')
      .eq('user_id', userId)
      .maybeSingle()
    if (!company) company = cleanStr(profile?.target_company, 160)
    if (!company) return { ok: false, reason: 'company_required' }

    // Honest degrade: no key ⇒ no brief (never a fabricated one).
    if (!process.env.DEEPSEEK_API_KEY?.trim()) {
      return { ok: false, reason: 'brief_unavailable' }
    }

    // Member's OWN readiness + verdict history — the only personal grounding.
    const [{ data: readinessRows }, { data: verdictRows }] = await Promise.all([
      sb.from('interview_readiness').select('dimension_slug, score, bar_status').eq('user_id', userId),
      sb
        .from('interview_verdicts')
        .select('score, verdict, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    const memberHistory = buildMemberHistory(
      profile?.target_level ?? null,
      readinessRows as ReadinessRow[] | null,
      verdictRows as VerdictHistoryRow[] | null,
    )

    // Real, published scenarios — the ONLY slugs the tuned queue may map to.
    const { data: scenarioRows } = await sb
      .from('interview_scenarios')
      .select('slug, title, track, trains')
      .eq('status', 'published')
    const scenarios: ScenarioRow[] = Array.isArray(scenarioRows) ? (scenarioRows as ScenarioRow[]) : []
    if (scenarios.length === 0) return { ok: false, reason: 'no_scenarios' }
    const availableScenarios: BriefScenario[] = scenarios.map((s) => ({
      slug: s.slug,
      title: s.title,
      track: s.track,
      trains: Array.isArray(s.trains) ? s.trains : [],
    }))
    const availableSlugs = availableScenarios.map((s) => s.slug)

    // Generate (temp 0, JSON). parseBrief disposes the model's proposal.
    let brief
    try {
      const result = await deepSeekChat({
        messages: buildBriefMessages({ jdText, memberHistory, availableScenarios, company, role }),
        temperature: 0,
        maxTokens: BRIEF_MAX_TOKENS,
      })
      brief = parseBrief(result.content, { availableSlugs })
    } catch (err) {
      console.error('[academy/interview/_actions-network] brief generation failed', err)
      return { ok: false, reason: 'brief_failed' }
    }

    // Own-row insert (the member's own brief; no self-scoring integrity concern).
    const { data: inserted, error } = await sb
      .from('interview_company_briefs')
      .insert({
        user_id: userId,
        company,
        role,
        source_jd_filename: null,
        decoded: brief.decoded,
        rounds: brief.rounds,
        edge: brief.edge || null,
        risk: brief.risk || null,
        queue: brief.queue,
        confidence: brief.confidence,
      })
      .select('id')
      .maybeSingle()
    if (error || !inserted) {
      console.error('[academy/interview/_actions-network] brief insert failed', error)
      return { ok: false, reason: 'insert_failed' }
    }

    return { ok: true, briefId: inserted.id as string }
  } catch (err) {
    console.error('[academy/interview/_actions-network] generateBrief threw', err)
    return { ok: false, reason: 'server_error' }
  }
}

/** Build the member-history digest from their OWN readiness + verdict rows. */
function buildMemberHistory(
  targetLevel: string | null,
  readiness: ReadinessRow[] | null,
  verdicts: VerdictHistoryRow[] | null,
): BriefMemberHistory {
  const valid = new Set<string>(DIMENSION_SLUGS as readonly string[])
  const dims: BriefHistoryDimension[] = Array.isArray(readiness)
    ? readiness
        .filter((r) => valid.has(r.dimension_slug))
        .map((r) => ({ slug: r.dimension_slug, score: r.score, bar_status: r.bar_status }))
        .sort((a, b) => a.score - b.score) // weakest-first
    : []
  const latest = Array.isArray(verdicts) && verdicts.length > 0 ? verdicts[0] : null
  return {
    targetLevel: targetLevel && (LEVELS as readonly string[]).includes(targetLevel) ? targetLevel : null,
    sessionsCount: Array.isArray(verdicts) ? verdicts.length : 0,
    latestVerdict: latest?.verdict ?? null,
    latestScore: typeof latest?.score === 'number' ? latest.score : null,
    readiness: dims,
  }
}

// ── createLoop ─────────────────────────────────────────────────────────────

type PresetRow = { id: string; slug: string; rounds: unknown; style: string | null }

/**
 * Create a loop-simulation header from a REAL company preset. Inserts an
 * interview_loops row (own-row) in the 'planned' state; rounds are started
 * separately via startLoopRound. Refuses an unknown/unpublished preset.
 */
export async function createLoop(input: { companyPresetSlug: string }): Promise<CreateLoopResult> {
  try {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return { ok: false, reason: 'unauthorized' }

    const slug = cleanStr(input?.companyPresetSlug, 200)
    if (!slug) return { ok: false, reason: 'preset_required' }

    // Preset is public-read published content.
    const { data: preset } = await sb
      .from('interview_company_presets')
      .select('id, slug')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    if (!preset) return { ok: false, reason: 'preset_not_found' }

    const { data: inserted, error } = await sb
      .from('interview_loops')
      .insert({ user_id: user.id, company_preset_id: preset.id, status: 'planned' })
      .select('id')
      .maybeSingle()
    if (error || !inserted) {
      console.error('[academy/interview/_actions-network] createLoop insert failed', error)
      return { ok: false, reason: 'insert_failed' }
    }
    return { ok: true, loopId: inserted.id as string }
  } catch (err) {
    console.error('[academy/interview/_actions-network] createLoop threw', err)
    return { ok: false, reason: 'server_error' }
  }
}

// ── startLoopRound ───────────────────────────────────────────────────────────

/**
 * Start the NEXT round of a loop as an interview_sessions row with loop_id set
 * (own-row). The round index is the count of existing sessions for the loop; its
 * track/name come from the preset's `rounds` jsonb. Refuses when the loop is
 * already complete (all preset rounds started) or the preset round is malformed.
 */
export async function startLoopRound(loopId: string): Promise<StartRoundResult> {
  try {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return { ok: false, reason: 'unauthorized' }
    if (typeof loopId !== 'string' || !loopId.trim()) return { ok: false, reason: 'loop_required' }

    // Ownership via own-row RLS read.
    const { data: loop } = await sb
      .from('interview_loops')
      .select('id, user_id, company_preset_id')
      .eq('id', loopId)
      .maybeSingle()
    if (!loop || loop.user_id !== user.id) return { ok: false, reason: 'forbidden' }
    if (!loop.company_preset_id) return { ok: false, reason: 'preset_missing' }

    // The preset's rounds define the running order.
    const { data: preset } = await sb
      .from('interview_company_presets')
      .select('id, slug, rounds, style')
      .eq('id', loop.company_preset_id)
      .maybeSingle<PresetRow>()
    const rounds = Array.isArray(preset?.rounds) ? (preset!.rounds as Array<Record<string, unknown>>) : []
    if (rounds.length === 0) return { ok: false, reason: 'no_rounds' }

    // roundIndex = how many rounds already started for this loop.
    const { data: existing } = await sb
      .from('interview_sessions')
      .select('id')
      .eq('loop_id', loopId)
      .eq('user_id', user.id)
    const roundIndex = Array.isArray(existing) ? existing.length : 0
    if (roundIndex >= rounds.length) return { ok: false, reason: 'loop_complete' }

    const round = rounds[roundIndex] ?? {}
    const track = round.track
    if (!isTrack(track)) return { ok: false, reason: 'invalid_preset_round' }
    const roundName = cleanStr(round.name, 200)
    const roundFocus = cleanStr(round.focus, 2000)

    // Level from the member's own profile; default senior.
    const { data: profile } = await sb
      .from('interview_profiles')
      .select('target_level')
      .eq('user_id', user.id)
      .maybeSingle()
    const level =
      profile?.target_level && (LEVELS as readonly string[]).includes(profile.target_level)
        ? profile.target_level
        : 'senior'

    // Interviewer style: use the preset's temperament only if it is a valid enum.
    const style =
      typeof preset?.style === 'string' && (INTERVIEWER_STYLES as readonly string[]).includes(preset.style)
        ? preset.style
        : 'skeptical'

    // Own-row insert: a round is an interview_sessions row with loop_id set.
    const { data: inserted, error } = await sb
      .from('interview_sessions')
      .insert({
        user_id: user.id,
        loop_id: loopId,
        track,
        level,
        interviewer_style: style,
        mode: 'typed',
        status: 'live',
        question_title: roundName,
        question_body: roundFocus,
      })
      .select('id')
      .maybeSingle()
    if (error || !inserted) {
      console.error('[academy/interview/_actions-network] startLoopRound insert failed', error)
      return { ok: false, reason: 'insert_failed' }
    }

    // Flip the loop to live on its first round (best-effort; own-row update).
    if (roundIndex === 0) {
      await sb.from('interview_loops').update({ status: 'live' }).eq('id', loopId).eq('user_id', user.id)
    }

    return { ok: true, sessionId: inserted.id as string, roundIndex }
  } catch (err) {
    console.error('[academy/interview/_actions-network] startLoopRound threw', err)
    return { ok: false, reason: 'server_error' }
  }
}

// ── finalizeLoop ─────────────────────────────────────────────────────────────

type LoopSessionRow = { id: string; track: string; level: string }
type LoopVerdictRow = { session_id: string; score: number; verdict: string }

/**
 * Finalize a loop: read its round sessions' verdicts, compute the DETERMINISTIC
 * aggregate (loop-logic.aggregateLoopVerdict — mean→band, never a model call),
 * and write interview_loops.overall_verdict via the service role. Honest when
 * rounds are ungraded: the aggregate covers only graded rounds, and it refuses
 * when nothing is graded yet (no fabricated loop verdict).
 */
export async function finalizeLoop(loopId: string): Promise<FinalizeLoopResult> {
  try {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return { ok: false, reason: 'unauthorized' }
    if (typeof loopId !== 'string' || !loopId.trim()) return { ok: false, reason: 'loop_required' }

    // Ownership via own-row RLS read.
    const { data: loop } = await sb
      .from('interview_loops')
      .select('id, user_id')
      .eq('id', loopId)
      .maybeSingle()
    if (!loop || loop.user_id !== user.id) return { ok: false, reason: 'forbidden' }

    // The loop's round sessions (own-row).
    const { data: sessionRows } = await sb
      .from('interview_sessions')
      .select('id, track, level')
      .eq('loop_id', loopId)
      .eq('user_id', user.id)
    const sessions: LoopSessionRow[] = Array.isArray(sessionRows) ? (sessionRows as LoopSessionRow[]) : []
    const totalRounds = sessions.length
    if (totalRounds === 0) return { ok: false, reason: 'no_rounds' }

    const admin = supabaseAdmin()
    const sessionIds = sessions.map((s) => s.id)
    const { data: verdictRows } = await admin
      .from('interview_verdicts')
      .select('session_id, score, verdict')
      .in('session_id', sessionIds)
    const verdicts: LoopVerdictRow[] = Array.isArray(verdictRows) ? (verdictRows as LoopVerdictRow[]) : []

    // Map each graded round's score to its session's track for the aggregate.
    const trackBySession = new Map(sessions.map((s) => [s.id, s.track]))
    const roundVerdicts: LoopRoundVerdict[] = verdicts.map((v) => ({
      score: v.score,
      verdict: v.verdict,
      track: trackBySession.get(v.session_id) ?? null,
    }))

    // Level for the bar: the loop's rounds share the member's target level.
    const level = sessions[0]?.level ?? 'senior'
    const aggregate = aggregateLoopVerdict(roundVerdicts, { level })
    if (!aggregate) return { ok: false, reason: 'no_graded_rounds' }

    // Derived verdict → service-role write (never a self-asserted grade). Mark the
    // loop completed only once every round has a real grade.
    const complete = aggregate.gradedRounds >= totalRounds
    const { error } = await admin
      .from('interview_loops')
      .update({
        overall_verdict: aggregate.verdict,
        ...(complete ? { status: 'completed' } : {}),
      })
      .eq('id', loopId)
    if (error) {
      console.error('[academy/interview/_actions-network] finalizeLoop update failed', error)
      return { ok: false, reason: 'update_failed' }
    }

    return {
      ok: true,
      overall: aggregate.overall,
      verdict: aggregate.verdict,
      gradedRounds: aggregate.gradedRounds,
      totalRounds,
    }
  } catch (err) {
    console.error('[academy/interview/_actions-network] finalizeLoop threw', err)
    return { ok: false, reason: 'server_error' }
  }
}

// ── requestPeerMatch (async stub only — Spec §7) ─────────────────────────────

/**
 * Request an async peer loop. Inserts interview_peer_matches (own-row) in the
 * 'requested' state with peer_user_id null. This is deliberately ASYNC ONLY — no
 * live room, presence, or A/V is created or implied (Spec §7 dependency flag).
 */
export async function requestPeerMatch(input: {
  track?: string
  note?: string
  slot_text?: string
}): Promise<PeerMatchResult> {
  try {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return { ok: false, reason: 'unauthorized' }

    if (input?.track != null && !isTrack(input.track)) return { ok: false, reason: 'invalid_track' }

    const { data: inserted, error } = await sb
      .from('interview_peer_matches')
      .insert({
        user_id: user.id,
        peer_user_id: null,
        status: 'requested',
        track: isTrack(input?.track) ? input.track : null,
        note: cleanStr(input?.note),
        slot_text: cleanStr(input?.slot_text, 200),
      })
      .select('id')
      .maybeSingle()
    if (error || !inserted) {
      console.error('[academy/interview/_actions-network] requestPeerMatch failed', error)
      return { ok: false, reason: 'insert_failed' }
    }
    return { ok: true, id: inserted.id as string }
  } catch (err) {
    console.error('[academy/interview/_actions-network] requestPeerMatch threw', err)
    return { ok: false, reason: 'server_error' }
  }
}
