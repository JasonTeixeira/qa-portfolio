import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { EmptyState } from '@/components/academy/interview/EmptyState'
import { FirstRunCockpit } from '@/components/academy/interview/cockpit/FirstRunCockpit'
import {
  CockpitDashboard,
  type CockpitSession,
  type CockpitVerdict,
} from '@/components/academy/interview/cockpit/CockpitDashboard'
import type { ReadinessRow } from '@/components/academy/interview/RubricBars'
import type { RecoScenario } from '@/components/academy/interview/cockpit/RecommendedStrip'

export const metadata: Metadata = {
  title: 'Interview Mastery — Prep cockpit',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/** Fallback placement scenario when no recommended scenario is published. */
const DEFAULT_PLACEMENT_SLUG = 'the-lying-test-suite'

/**
 * The prep Cockpit — the interview home dashboard. Three honest branches, all backed by real
 * server reads (no fabricated numbers, Spec §7):
 *   1. No profile / not onboarded → "Set your target first" (routes to /onboarding).
 *   2. Onboarded, ZERO sessions → the first-run state ("No score. No plan. One mock fixes both.")
 *      whose one action starts a placement mock.
 *   3. Has sessions → the real cockpit: the min-capped readiness dial, the six real dimension
 *      bars, and real session history with real verdicts.
 */
export default async function InterviewCockpitPage() {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()

  // Recommended scenarios are public-read content — load them regardless of onboarding state so
  // the placement mock always has a real target.
  const { data: scenarioRows } = await sb
    .from('interview_scenarios')
    .select('slug, title, track, est_minutes, difficulty, trains')
    .eq('status', 'published')
    .eq('recommended', true)
    .order('sort', { ascending: true })
    .limit(6)
  const recommended: RecoScenario[] = (scenarioRows ?? []).map((s) => ({
    slug: s.slug as string,
    title: s.title as string,
    track: s.track as string,
    estMinutes: (s.est_minutes as number) ?? 30,
    trains: Array.isArray(s.trains) ? (s.trains as string[]) : [],
  }))
  const placementSlug = recommended[0]?.slug ?? DEFAULT_PLACEMENT_SLUG

  // Branch 1 — no session or no onboarded profile.
  if (!user) {
    return (
      <InterviewShell active="prep">
        <EmptyState
          kicker="Interview Mastery · start here"
          title="Set your target first."
          line="Your readiness score, weekly plan, and every mock are shaped by the role, level, and date you're aiming at. Set the target, then one mock builds the rest."
          ctas={[{ href: '/academy/interview/onboarding', label: 'Set my target →' }]}
        />
      </InterviewShell>
    )
  }

  const [{ data: profile }, { data: readinessRows }, { data: sessionRows }, { data: verdictRows }] =
    await Promise.all([
      sb
        .from('interview_profiles')
        .select('target_role, target_level, target_date, timeline, program_week, program_total_weeks, onboarded_at')
        .eq('user_id', user.id)
        .maybeSingle(),
      sb
        .from('interview_readiness')
        .select('dimension_slug, score, trend, bar_status')
        .eq('user_id', user.id),
      sb
        .from('interview_sessions')
        .select('id, track, question_title, status, started_at, is_placement')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(8),
      sb
        .from('interview_verdicts')
        .select('session_id, score, prev_score, verdict')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

  const onboarded = !!profile?.onboarded_at

  if (!onboarded) {
    return (
      <InterviewShell active="prep">
        <EmptyState
          kicker="Interview Mastery · start here"
          title="Set your target first."
          line="Your readiness score, weekly plan, and every mock are shaped by the role, level, and date you're aiming at. Set the target, then one mock builds the rest."
          ctas={[{ href: '/academy/interview/onboarding', label: 'Set my target →' }]}
        />
      </InterviewShell>
    )
  }

  const sessions: CockpitSession[] = (sessionRows ?? []).map((s) => ({
    id: s.id as string,
    track: s.track as string,
    questionTitle: (s.question_title as string | null) ?? null,
    status: s.status as string,
    startedAt: s.started_at as string,
    isPlacement: s.is_placement === true,
  }))

  // Branch 2 — onboarded but no reps yet.
  if (sessions.length === 0) {
    return (
      <InterviewShell active="prep">
        <FirstRunCockpit placementScenarioSlug={placementSlug} />
      </InterviewShell>
    )
  }

  // Branch 3 — the real cockpit.
  const readiness: ReadinessRow[] = (readinessRows ?? []).map((r) => ({
    dimensionSlug: r.dimension_slug as string,
    score: (r.score as number) ?? 0,
    trend: (r.trend as number) ?? 0,
    barStatus: (r.bar_status as string | null) ?? null,
  }))

  const verdictBySession = new Map<string, CockpitVerdict>()
  for (const v of verdictRows ?? []) {
    const sessionId = v.session_id as string
    if (!verdictBySession.has(sessionId)) {
      verdictBySession.set(sessionId, {
        sessionId,
        score: v.score as number,
        prevScore: (v.prev_score as number | null) ?? null,
        verdict: v.verdict as string,
      })
    }
  }

  return (
    <InterviewShell active="prep">
      <CockpitDashboard
        profile={{
          targetRole: (profile?.target_role as string | null) ?? null,
          targetLevel: (profile?.target_level as string | null) ?? null,
          targetDate: (profile?.target_date as string | null) ?? null,
          programWeek: (profile?.program_week as number | null) ?? null,
          programTotalWeeks: (profile?.program_total_weeks as number | null) ?? null,
        }}
        readiness={readiness}
        sessions={sessions}
        verdictBySession={verdictBySession}
        recommended={recommended}
      />
    </InterviewShell>
  )
}
