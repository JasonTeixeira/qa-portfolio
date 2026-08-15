import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { MockSessionRunner } from '@/components/academy/interview/session/MockSessionRunner'
import type {
  InitialTurn,
  InterviewTrack,
  ScenarioData,
  SeedTest,
  SessionData,
} from '@/components/academy/interview/session/types'

export const metadata: Metadata = {
  title: 'Mock room — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const TRACKS: readonly InterviewTrack[] = ['coding', 'system_design', 'behavioral', 'negotiation']

/** Coerce the untyped seed_tests jsonb into typed rows (drops malformed entries). */
function parseSeedTests(raw: unknown): SeedTest[] {
  if (!Array.isArray(raw)) return []
  const out: SeedTest[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const r = item as Record<string, unknown>
    if (typeof r.name !== 'string' || typeof r.expr !== 'string') continue
    out.push({
      name: r.name,
      expr: r.expr,
      hidden: r.hidden === true,
      passes_for_wrong_reason: r.passes_for_wrong_reason === true,
    })
  }
  return out
}

/**
 * The live mock room. Loads the caller's own session (own-row RLS) + its coding scenario
 * seed, verifies ownership, and hands the serializable session/scenario/transcript to the
 * client runner. The hidden test EXPRESSION is only ever consumed by the client Pyodide
 * runner — never rendered.
 */
export default async function InterviewSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) redirect(`/login?audience=academy&next=/academy/interview/session/${id}`)

  // Own-row RLS read — a session that isn't the caller's simply won't be returned.
  const { data: session } = await sb
    .from('interview_sessions')
    .select(
      'id, user_id, scenario_id, track, level, interviewer_style, mode, status, question_title, question_body, started_at',
    )
    .eq('id', id)
    .maybeSingle()
  if (!session || session.user_id !== user.id) notFound()

  const track: InterviewTrack = TRACKS.includes(session.track as InterviewTrack)
    ? (session.track as InterviewTrack)
    : 'coding'

  // Coding scenario seed (public-read). seed_tests reaches only the client Pyodide runner.
  let scenario: ScenarioData = null
  if (track === 'coding' && session.scenario_id) {
    const { data: sc } = await sb
      .from('interview_scenarios')
      .select('seed_code, seed_tests')
      .eq('id', session.scenario_id)
      .maybeSingle()
    if (sc) {
      scenario = {
        seedCode: typeof sc.seed_code === 'string' ? sc.seed_code : null,
        seedTests: parseSeedTests(sc.seed_tests),
      }
    }
  }

  // Existing transcript for resume (own-row RLS).
  const { data: turnRows } = await sb
    .from('interview_turns')
    .select('seq, speaker, content, ts_seconds')
    .eq('session_id', id)
    .order('seq', { ascending: true })
  const initialTurns: InitialTurn[] = (turnRows ?? []).map((t) => ({
    seq: t.seq as number,
    speaker: t.speaker as 'interviewer' | 'candidate',
    content: t.content as string,
    tsSeconds: typeof t.ts_seconds === 'number' ? t.ts_seconds : null,
  }))

  const startedAtMs = session.started_at ? new Date(session.started_at).getTime() : Date.now()

  const sessionData: SessionData = {
    id: session.id as string,
    track,
    level: (session.level as string) ?? 'senior',
    interviewerStyle: (session.interviewer_style as string) ?? 'skeptical',
    mode: (session.mode as string) ?? 'typed',
    status: (session.status as string) ?? 'live',
    questionTitle: (session.question_title as string) ?? null,
    questionBody: (session.question_body as string) ?? null,
    startedAtMs: Number.isFinite(startedAtMs) ? startedAtMs : Date.now(),
  }

  return <MockSessionRunner session={sessionData} scenario={scenario} initialTurns={initialTurns} />
}
