import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase/server'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { EmptyState } from '@/components/academy/interview/EmptyState'
import { barForLevel } from '@/lib/academy/interview/rubric'
import { ProgressBoard } from '@/components/academy/interview/progress/ProgressBoard'
import type { ChartPoint } from '@/components/academy/interview/progress/ReadinessChart'
import type { CohortResult } from '@/components/academy/interview/progress/CohortStanding'

export const metadata: Metadata = {
  title: 'Progress — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/** Minimum graded members before a cohort percentile is honest to show. */
const COHORT_THRESHOLD = 20

const LEVEL_LABELS: Record<string, string> = {
  intern: 'Intern',
  new_grad: 'New-grad',
  mid: 'Mid',
  senior: 'Senior',
}

function shortDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function asDimsMap(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === 'number') out[k] = v
  }
  return out
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const s = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 === 0 ? Math.round((s[mid - 1] + s[mid]) / 2) : s[mid]
}

/**
 * Compute the cohort percentile STRICTLY from interview_verdicts (service-authored, un-fakeable) —
 * never from the client-writable readiness/snapshots. Uses each member's latest committee score.
 * Honest-gated: below COHORT_THRESHOLD graded members it returns `ready: false` so the UI shows a
 * placeholder rather than an invented percentile. Only derived aggregates leave this function.
 */
async function computeCohort(userId: string): Promise<CohortResult> {
  try {
    const admin = supabaseAdmin()
    const { data, error } = await admin
      .from('interview_verdicts')
      .select('user_id, score, created_at')
      .order('created_at', { ascending: false })
    if (error || !Array.isArray(data)) {
      return { ready: false, gradedMembers: 0, threshold: COHORT_THRESHOLD }
    }
    // Latest score per member (rows are newest-first, so first seen wins).
    const latest = new Map<string, number>()
    for (const r of data) {
      const uid = r.user_id as string
      if (!latest.has(uid)) latest.set(uid, Number(r.score) || 0)
    }
    const gradedMembers = latest.size
    if (gradedMembers < COHORT_THRESHOLD || !latest.has(userId)) {
      return { ready: false, gradedMembers, threshold: COHORT_THRESHOLD }
    }
    const you = latest.get(userId) as number
    const scores = Array.from(latest.values())
    const below = scores.filter((s) => s < you).length
    const percentile = Math.max(1, Math.min(99, Math.round((below / gradedMembers) * 100)))
    return { ready: true, percentile, you, median: median(scores), cohortSize: gradedMembers }
  } catch (err) {
    console.error('[academy/interview/progress] computeCohort threw', err)
    return { ready: false, gradedMembers: 0, threshold: COHORT_THRESHOLD }
  }
}

/**
 * Progress — readiness-over-time, six-dimension trajectories, the activity ledger, and cohort
 * standing. Zero snapshots → an honest "no trend yet" empty state. Everything drawn is a real row:
 * the chart from interview_readiness_snapshots, the cohort from interview_verdicts (honest-gated),
 * the ledger from counts. No fabricated numbers (Spec §7).
 */
export default async function InterviewProgressPage() {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) redirect('/login?audience=academy&next=/academy/interview/progress')

  const [{ data: snapRows }, { data: profile }, { count: verdictCount }, { data: drillRows }] =
    await Promise.all([
      sb
        .from('interview_readiness_snapshots')
        .select('overall, dims, event, captured_at')
        .eq('user_id', user.id)
        .order('captured_at', { ascending: true }),
      sb
        .from('interview_profiles')
        .select('target_role, target_level, target_date')
        .eq('user_id', user.id)
        .maybeSingle(),
      sb
        .from('interview_verdicts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      sb.from('interview_drills').select('status').eq('user_id', user.id),
    ])

  const snapshots = snapRows ?? []
  const level = (profile?.target_level as string | null) ?? 'senior'
  const bar = barForLevel(level)

  // Branch: no graded snapshots yet — the honest empty state.
  if (snapshots.length === 0) {
    return (
      <InterviewShell active="progress">
        <EmptyState
          kicker="Progress · readiness over time"
          title="The curve starts at your first placement mock."
          line="Every graded mock drops a real snapshot here, so you can watch readiness climb toward the bar. There are no snapshots yet — and we won't draw a line that isn't real."
          ctas={[{ href: '/academy/interview', label: 'Go to the cockpit' }]}
        />
      </InterviewShell>
    )
  }

  // Chart series from real snapshots.
  const series: ChartPoint[] = snapshots.map((s) => {
    const event = (s.event as string | null) ?? null
    const label = event && event !== 'today' ? event : shortDate(s.captured_at as string) ?? '—'
    return { overall: Number(s.overall) || 0, label, event }
  })

  const dimsFirst = asDimsMap(snapshots[0].dims)
  const dimsNow = asDimsMap(snapshots[snapshots.length - 1].dims)
  const hasBaseline = snapshots.length >= 2

  // Ledger counts — all real.
  const mocksGraded = verdictCount ?? snapshots.length
  const drills = drillRows ?? []
  const drillsTotal = drills.length
  const drillsDone = drills.filter((d) => d.status === 'done').length
  const activeDays = new Set(
    snapshots.map((s) => String(s.captured_at ?? '').slice(0, 10)).filter(Boolean),
  ).size
  const clearedBar = snapshots.filter((s) => (Number(s.overall) || 0) >= bar).length
  const sinceLabel = shortDate(snapshots[0].captured_at as string)

  const cohort = await computeCohort(user.id)

  // Header — honest headline keyed off the real trend.
  const now = series[series.length - 1].overall
  const first = series[0].overall
  const gain = now - first
  const headTitle = !hasBaseline
    ? 'Your first mark is on the board.'
    : gain > 0
      ? 'The line is bending the right way.'
      : gain < 0
        ? 'A dip to work back from.'
        : 'Your record, so far.'
  const headMeta = [
    `${mocksGraded} graded mock${mocksGraded === 1 ? '' : 's'}`,
    `${drillsDone} of ${drillsTotal} drills done`,
    sinceLabel ? `since ${sinceLabel}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  // Target chip from the real profile.
  const targetDate = profile?.target_date as string | null
  const dateLabel = shortDate(targetDate)
  let daysLabel: string | null = null
  if (targetDate) {
    const days = Math.ceil((new Date(`${targetDate}T00:00:00Z`).getTime() - Date.now()) / 86_400_000)
    if (days > 0) daysLabel = `${days} days`
    else if (days === 0) daysLabel = 'today'
  }
  const targetChip = profile
    ? [
        (profile.target_role as string | null) ?? (LEVEL_LABELS[level] ?? level),
        dateLabel,
        daysLabel,
      ]
        .filter(Boolean)
        .join(' · ') || null
    : null

  return (
    <InterviewShell active="progress">
      <ProgressBoard
        headMeta={headMeta}
        headTitle={headTitle}
        targetChip={targetChip}
        bar={bar}
        series={series}
        cohort={cohort}
        dimsFirst={dimsFirst}
        dimsNow={dimsNow}
        hasBaseline={hasBaseline}
        mocksGraded={mocksGraded}
        drillsDone={drillsDone}
        drillsTotal={drillsTotal}
        activeDays={activeDays}
        clearedBar={clearedBar}
        sinceLabel={sinceLabel}
      />
    </InterviewShell>
  )
}
