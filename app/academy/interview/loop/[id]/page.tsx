import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { aggregateLoopVerdict, type LoopRoundVerdict } from '@/lib/academy/interview/loop-logic'
import type { CommitteeVerdict } from '@/lib/academy/interview/rubric'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { EmptyState } from '@/components/academy/interview/EmptyState'
import {
  LoopRunner,
  type LoopRoundView,
  type LoopAggregateView,
} from '@/components/academy/interview/loop/LoopRunner'

export const metadata: Metadata = {
  title: 'Loop simulation — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type PlannedRound = { name: string; track: string; focus: string | null }
type SessionRow = { id: string; track: string; level: string; created_at: string }
type VerdictRow = { session_id: string; score: number; verdict: string }

/** Coerce the untyped preset.rounds jsonb into typed planned rounds (drops malformed entries). */
function parsePlannedRounds(raw: unknown): PlannedRound[] {
  if (!Array.isArray(raw)) return []
  const out: PlannedRound[] = []
  for (const [i, item] of raw.entries()) {
    if (!item || typeof item !== 'object') continue
    const r = item as Record<string, unknown>
    const track = typeof r.track === 'string' ? r.track : null
    if (!track) continue
    out.push({
      name: typeof r.name === 'string' && r.name.trim() ? r.name : `Round ${i + 1}`,
      track,
      focus: typeof r.focus === 'string' && r.focus.trim() ? r.focus : null,
    })
  }
  return out
}

/**
 * The loop-simulation runner. Loads the caller's own loop (own-row RLS + explicit ownership
 * check), its company preset (the PLANNED rounds), and the loop's real round sessions with their
 * verdicts. Each planned round is resolved to its real state — planned / live / graded — and the
 * deterministic aggregate is passed ONLY once the loop has been finalized (overall_verdict set),
 * so an aggregate is never shown before every round is graded. No round score is fabricated.
 */
export default async function InterviewLoopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) redirect(`/login?audience=academy&next=/academy/interview/loop/${id}`)

  // Own-row RLS read + explicit ownership check.
  const { data: loop } = await sb
    .from('interview_loops')
    .select('id, user_id, company_preset_id, status, overall_verdict')
    .eq('id', id)
    .maybeSingle()
  if (!loop || loop.user_id !== user.id) notFound()

  // The preset defines the planned running order.
  const { data: preset } = loop.company_preset_id
    ? await sb
        .from('interview_company_presets')
        .select('name, description, rounds')
        .eq('id', loop.company_preset_id)
        .maybeSingle()
    : { data: null }

  const plannedRounds = parsePlannedRounds(preset?.rounds)

  // The loop's real round sessions (own-row), oldest first so order === round index.
  const { data: sessionRows } = await sb
    .from('interview_sessions')
    .select('id, track, level, created_at')
    .eq('loop_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
  const sessions: SessionRow[] = Array.isArray(sessionRows) ? (sessionRows as SessionRow[]) : []

  // Real verdicts for those sessions (own-row).
  const sessionIds = sessions.map((s) => s.id)
  const { data: verdictRows } =
    sessionIds.length > 0
      ? await sb.from('interview_verdicts').select('session_id, score, verdict').in('session_id', sessionIds)
      : { data: [] }
  const verdicts: VerdictRow[] = Array.isArray(verdictRows) ? (verdictRows as VerdictRow[]) : []
  const verdictBySession = new Map(verdicts.map((v) => [v.session_id, v]))

  // Honest degrade: a preset with no configured rounds cannot run a loop.
  if (plannedRounds.length === 0) {
    return (
      <InterviewShell active="library">
        <EmptyState
          kicker="Loop simulation"
          title="This loop has no rounds yet."
          line="Its company preset has no rounds configured, so there is nothing to run. Pick another preset from the library."
          ctas={[{ href: '/academy/interview/library', label: 'Back to the library' }]}
        />
      </InterviewShell>
    )
  }

  // Resolve each planned round to its real state via the ordered sessions.
  const rounds: LoopRoundView[] = plannedRounds.map((planned, index) => {
    const session = sessions[index] ?? null
    const verdict = session ? verdictBySession.get(session.id) ?? null : null
    const state: LoopRoundView['state'] = verdict ? 'graded' : session ? 'live' : 'planned'
    return {
      index,
      name: planned.name,
      track: planned.track,
      focus: planned.focus,
      state,
      sessionId: session?.id ?? null,
      score: verdict ? verdict.score : null,
      verdict: verdict ? (verdict.verdict as CommitteeVerdict) : null,
    }
  })

  // The deterministic aggregate is shown ONLY once the loop has been finalized (overall_verdict
  // persisted). We recompute it here from the same pure function the finalize action uses.
  let initialAggregate: LoopAggregateView | null = null
  if (loop.overall_verdict) {
    const level = sessions[0]?.level ?? 'senior'
    const roundVerdicts: LoopRoundVerdict[] = rounds
      .filter((r) => r.state === 'graded' && r.score != null)
      .map((r) => ({ score: r.score as number, verdict: r.verdict, track: r.track }))
    const agg = aggregateLoopVerdict(roundVerdicts, { level })
    if (agg) {
      initialAggregate = {
        overall: agg.overall,
        verdict: agg.verdict,
        gradedRounds: agg.gradedRounds,
        totalRounds: rounds.length,
        perRound: rounds
          .filter((r) => r.state === 'graded' && r.score != null)
          .map((r) => ({
            index: r.index,
            label: `R${r.index + 1} · ${r.track.replace('_', ' ')}`,
            score: r.score as number,
          })),
      }
    }
  }

  return (
    <InterviewShell active="library">
      <LoopRunner
        loopId={loop.id as string}
        presetName={(preset?.name as string | null) ?? 'Loop simulation'}
        presetDescription={(preset?.description as string | null) ?? null}
        rounds={rounds}
        initialAggregate={initialAggregate}
      />
    </InterviewShell>
  )
}
