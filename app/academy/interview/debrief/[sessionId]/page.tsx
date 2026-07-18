import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import {
  barForLevel,
  committeeVerdict,
  verdictLabel,
  type CommitteeVerdict,
} from '@/lib/academy/interview/rubric'
import { DebriefBoard, type SpeechTile } from '@/components/academy/interview/debrief/DebriefBoard'
import type { DebriefMoment, DebriefTurn } from '@/components/academy/interview/debrief/DebriefTimeline'
import type { MovementDim } from '@/components/academy/interview/debrief/RubricMovement'
import type { DebriefDrill } from '@/components/academy/interview/debrief/DrillPlanner'
import styles from '@/components/academy/interview/debrief/debrief.module.css'

export const metadata: Metadata = {
  title: 'Debrief — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const TRACK_LABELS: Record<string, string> = {
  coding: 'Coding',
  system_design: 'System design',
  behavioral: 'Behavioral',
  negotiation: 'Negotiation',
}
const LEVEL_LABELS: Record<string, string> = {
  intern: 'intern',
  new_grad: 'new-grad',
  mid: 'mid',
  senior: 'senior',
}

function asDims(raw: unknown): MovementDim[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((d): d is Record<string, unknown> => Boolean(d) && typeof d === 'object')
    .map((d) => ({
      slug: String(d.slug ?? ''),
      score: Number(d.score) || 0,
      delta: Number(d.delta) || 0,
      barStatus: String(d.bar_status ?? 'below_bar'),
    }))
    .filter((d) => d.slug)
}

function asMoments(raw: unknown): DebriefMoment[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((e): e is Record<string, unknown> => Boolean(e) && typeof e === 'object')
    .map((e) => ({
      tsSeconds: Number(e.ts_seconds) || 0,
      mark: String(e.mark ?? ''),
      title: String(e.title ?? ''),
      note: String(e.note ?? ''),
    }))
    .sort((a, b) => a.tsSeconds - b.tsSeconds)
}

/** Parse the optional speech_analytics blob into honest tiles. Null → no card. */
function asSpeech(raw: unknown): SpeechTile[] | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Record<string, unknown>
  const tiles: SpeechTile[] = []
  const gold = 'var(--iv-gold-bright, #f0c36a)'
  const ink = 'var(--sa-ink)'
  if (typeof s.wpm === 'number') tiles.push({ value: String(s.wpm), label: 'words/min · ideal 120–150', color: ink })
  if (typeof s.fillers_per_min === 'number')
    tiles.push({ value: String(s.fillers_per_min), label: 'fillers/min · target < 6', color: gold })
  if (typeof s.talk_ratio === 'string' || typeof s.talk_ratio === 'number')
    tiles.push({ value: String(s.talk_ratio), label: 'talk ratio · you/interviewer', color: ink })
  if (typeof s.avg_pause === 'string' || typeof s.avg_pause === 'number')
    tiles.push({ value: String(s.avg_pause), label: 'avg pause before answering', color: ink })
  return tiles.length > 0 ? tiles : null
}

function verdictColor(v: string): string {
  if (v === 'strong_hire' || v === 'hire') return 'var(--sa-success)'
  if (v === 'lean_hire') return 'var(--iv-gold-bright, #f0c36a)'
  return 'var(--sa-danger)'
}

function shortDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * The timestamped debrief for one graded session. Loads the caller's own verdict (own-row RLS,
 * verifying session ownership); when the grade is absent it shows an honest "not graded yet" panel
 * rather than a fabricated debrief. Everything on the board — the timeline, the tap-to-replay
 * transcript, the rubric movement, and the drill plan — comes from real rows (Spec §7).
 */
export default async function InterviewDebriefPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params

  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) redirect(`/login?audience=academy&next=/academy/interview/debrief/${sessionId}`)

  // Ownership via own-row RLS.
  const { data: session } = await sb
    .from('interview_sessions')
    .select('id, user_id, level, track, question_title, started_at')
    .eq('id', sessionId)
    .maybeSingle()
  if (!session || session.user_id !== user.id) notFound()

  const level = (session.level as string) ?? 'senior'
  const bar = barForLevel(level)

  // The verdict (own-row read; committee-authored). Absent ⇒ honest ungraded state.
  const { data: row } = await sb
    .from('interview_verdicts')
    .select('id, score, prev_score, verdict, dims, evidence, speech_analytics, summary_sentence, words, claims_checked')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (!row) {
    return (
      <InterviewShell active={null} backHref="/academy/interview">
        <div className={styles.ungraded}>
          <div className={`${styles.cardKicker} ${styles.cardKickerGold}`}>Debrief</div>
          <h1 className={styles.headTitle} style={{ maxWidth: 'none', marginTop: 14 }}>
            This mock hasn&rsquo;t been graded yet.
          </h1>
          <p className={styles.planEmptyLine} style={{ margin: '14px auto 0', maxWidth: '48ch' }}>
            The debrief is built from a real committee grade — the timestamped moments, the rubric
            movement, and your drill plan all come from the verdict. Nothing here is invented before
            that grade lands.
          </p>
          <div className={styles.footRow} style={{ justifyContent: 'center' }}>
            <Link href={`/academy/interview/verdict/${sessionId}`} className={styles.ctaPrimary}>
              Check the verdict →
            </Link>
            <Link href="/academy/interview" className={styles.ctaGhost}>
              back to cockpit
            </Link>
          </div>
        </div>
      </InterviewShell>
    )
  }

  const verdictId = row.id as string
  const score = Number(row.score) || 0
  const dims = asDims(row.dims)
  const moments = asMoments(row.evidence)
  const speech = asSpeech(row.speech_analytics)
  const verdict = String(row.verdict ?? committeeVerdict(score, bar))

  // Weakest dimension = the cap.
  const weakest = dims.length > 0 ? dims.reduce((a, b) => (b.score < a.score ? b : a)) : null

  // Transcript turns for tap-to-replay (own-row read; passed in — no client fetch).
  const { data: turnRows } = await sb
    .from('interview_turns')
    .select('seq, speaker, content, ts_seconds, is_hint')
    .eq('session_id', sessionId)
    .order('seq', { ascending: true })
  const turns: DebriefTurn[] = (turnRows ?? []).map((t) => ({
    seq: Number(t.seq) || 0,
    speaker: String(t.speaker ?? 'candidate'),
    content: String(t.content ?? ''),
    tsSeconds: typeof t.ts_seconds === 'number' ? t.ts_seconds : null,
    isHint: t.is_hint === true,
  }))

  // Existing drills for this verdict (own-row); join to real scenario slugs.
  const { data: drillRows } = await sb
    .from('interview_drills')
    .select('id, tag, title, meta, status, scenario_id')
    .eq('verdict_id', verdictId)
    .order('created_at', { ascending: true })
  const scenarioIds = Array.from(
    new Set((drillRows ?? []).map((d) => d.scenario_id as string | null).filter(Boolean) as string[]),
  )
  const slugById = new Map<string, string>()
  if (scenarioIds.length > 0) {
    const { data: scRows } = await sb
      .from('interview_scenarios')
      .select('id, slug')
      .in('id', scenarioIds)
    for (const s of scRows ?? []) slugById.set(s.id as string, s.slug as string)
  }
  const drills: DebriefDrill[] = (drillRows ?? []).map((d) => ({
    id: d.id as string,
    tag: (d.tag as string | null) ?? null,
    title: String(d.title ?? ''),
    meta: (d.meta as string | null) ?? null,
    status: String(d.status ?? 'queued'),
    scenarioSlug: d.scenario_id ? slugById.get(d.scenario_id as string) ?? null : null,
  }))

  // Movement line — honest: real prev→now from snapshots, else a first-mock line.
  const { data: snapRows } = await sb
    .from('interview_readiness_snapshots')
    .select('overall, captured_at')
    .eq('user_id', user.id)
    .order('captured_at', { ascending: true })
  const overalls = (snapRows ?? []).map((s) => Number(s.overall) || 0)
  const capLabel = weakest
    ? ` ${LEVEL_LABELS[level] ?? level} bar caps on your weakest — clear it and your score can express the rest.`
    : ''
  const movementLine =
    overalls.length >= 2
      ? `Readiness ${overalls[overalls.length - 2]} → ${overalls[overalls.length - 1]} since your last mock.${capLabel}`
      : `First graded mock — no movement to compare yet.${capLabel}`

  // Header meta from real session fields.
  const metaParts = [
    shortDate(session.started_at as string | null),
    `${TRACK_LABELS[session.track as string] ?? (session.track as string) ?? 'Mock'} mock`,
    `${LEVEL_LABELS[level] ?? level} bar`,
    typeof row.words === 'number' ? `${row.words.toLocaleString()} words` : null,
    typeof row.claims_checked === 'number' ? `${row.claims_checked} claims checked` : null,
  ].filter(Boolean)
  const headMeta = metaParts.join(' · ')

  const headTitle =
    (typeof row.summary_sentence === 'string' && row.summary_sentence.trim()) ||
    (session.question_title as string | null) ||
    `${verdictLabel(committeeVerdict(score, bar))} · ${score} / bar ${bar}`

  return (
    <InterviewShell active={null} backHref="/academy/interview">
      <DebriefBoard
        sessionId={sessionId}
        headMeta={headMeta}
        headTitle={headTitle}
        verdictLabel={verdictLabel(verdict as CommitteeVerdict)}
        verdictColor={verdictColor(verdict)}
        score={score}
        bar={bar}
        moments={moments}
        turns={turns}
        dims={dims}
        weakestSlug={weakest?.slug ?? null}
        movementLine={movementLine}
        speech={speech}
        drills={drills}
      />
    </InterviewShell>
  )
}
