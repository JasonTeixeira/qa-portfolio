import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  DIMENSION_SLUGS,
  weakestDimension,
  type DimensionScore,
  type DimensionSlug,
} from '@/lib/academy/interview/rubric'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { EmptyState } from '@/components/academy/interview/EmptyState'
import { LibraryBrowser } from '@/components/academy/interview/library/LibraryBrowser'
import { CompanyPresets, type CompanyPreset } from '@/components/academy/interview/library/CompanyPresets'
import { type LibraryScenario } from '@/components/academy/interview/library/ScenarioCard'
import { dimensionLabel } from '@/components/academy/interview/library/format'
import styles from '@/components/academy/interview/library/library.module.css'

export const metadata: Metadata = {
  title: 'Scenario library — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type ScenarioRow = {
  slug: string
  track: string
  title: string
  description: string
  est_minutes: number | null
  difficulty: string
  trains: string[] | null
  recommended: boolean
  sort: number | null
}

/**
 * The scenario library. Real published interview_scenarios + company presets, sorted WEAKEST-FIRST
 * from the caller's real interview_readiness:
 *   - weakest dimension = rubric.weakestDimension over the learner's readiness rows,
 *   - scenarios whose real trains[] include the weakest dim rank first, then recommended, then sort,
 *   - the "attacks your cap" pill/badge appears ONLY on those weakest-training scenarios.
 * With no readiness yet (no graded mock) we fall back to recommended-then-sort and say so honestly —
 * no invented cap, no fabricated ordering.
 */
export default async function InterviewLibraryPage() {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()

  // Scenarios + presets are public-read content — load regardless of auth.
  const [{ data: scenarioRows }, { data: presetRows }, readinessResult] = await Promise.all([
    sb
      .from('interview_scenarios')
      .select('slug, track, title, description, est_minutes, difficulty, trains, recommended, sort')
      .eq('status', 'published')
      .order('sort', { ascending: true }),
    sb
      .from('interview_company_presets')
      .select('slug, name, description, rounds, sim_minutes, sort')
      .eq('status', 'published')
      .order('sort', { ascending: true }),
    user
      ? sb.from('interview_readiness').select('dimension_slug, score').eq('user_id', user.id)
      : Promise.resolve({ data: null }),
  ])

  const rows: ScenarioRow[] = Array.isArray(scenarioRows) ? (scenarioRows as ScenarioRow[]) : []

  // Weakest dimension from REAL readiness (null when there is no graded mock yet).
  const validSlugs = new Set<string>(DIMENSION_SLUGS as readonly string[])
  const scored: DimensionScore[] = (readinessResult.data ?? [])
    .filter((r) => validSlugs.has(r.dimension_slug as string))
    .map((r) => ({ slug: r.dimension_slug as DimensionSlug, score: (r.score as number) ?? 0 }))
  const weakest = scored.length > 0 ? weakestDimension(scored) : null
  const weakestSlug = weakest?.slug ?? null

  // Build the scenarios, tagging the honest "attacks your cap" flag.
  const scenarios: LibraryScenario[] = rows.map((r) => {
    const trains = Array.isArray(r.trains) ? r.trains : []
    return {
      slug: r.slug,
      track: r.track,
      title: r.title,
      description: r.description,
      estMinutes: r.est_minutes ?? 30,
      difficulty: r.difficulty,
      trains,
      recommended: r.recommended === true,
      attacksCap: weakestSlug != null && trains.includes(weakestSlug),
    }
  })

  // Weakest-first stable sort: cap-attacking first (only when readiness exists), then recommended,
  // then the content author's sort order. With no readiness, the cap tier is empty → recommended-first.
  const sorted = scenarios
    .map((s, i) => ({ s, i }))
    .sort((a, b) => {
      if (a.s.attacksCap !== b.s.attacksCap) return a.s.attacksCap ? -1 : 1
      if (a.s.recommended !== b.s.recommended) return a.s.recommended ? -1 : 1
      return a.i - b.i
    })
    .map((x) => x.s)

  const presets: CompanyPreset[] = (presetRows ?? []).map((p) => ({
    slug: p.slug as string,
    name: p.name as string,
    description: (p.description as string) ?? '',
    roundCount: Array.isArray(p.rounds) ? p.rounds.length : 0,
    simMinutes: (p.sim_minutes as number) ?? 0,
  }))

  // Honest first-run when there is no published content at all.
  if (sorted.length === 0) {
    return (
      <InterviewShell active="library">
        <EmptyState
          kicker="Scenario library"
          title="The bank is being stocked."
          line="No scenarios are published yet. Once they land, the library leads with whatever fixes your weakest dimension first."
          ctas={[{ href: '/academy/interview', label: 'Go to the cockpit' }]}
        />
      </InterviewShell>
    )
  }

  const sortNote = weakest ? 'sorted for you · weakest skill first' : 'sorted by recommended · run a mock to personalize'

  return (
    <InterviewShell active="library">
      <div className={styles.head}>
        <div>
          <div className={styles.headKicker}>
            {sorted.length} scenario{sorted.length === 1 ? '' : 's'} · every one interviewer-driven, none multiple-choice
          </div>
          <h1 className={styles.headTitle}>The library</h1>
        </div>
        <div className={styles.headNote}>{sortNote}</div>
      </div>

      <CompanyPresets presets={presets} />

      <LibraryBrowser
        scenarios={sorted}
        weakestLabel={weakest ? dimensionLabel(weakest.slug) : null}
        weakestScore={weakest?.score ?? null}
        totalPublished={sorted.length}
      />
    </InterviewShell>
  )
}
