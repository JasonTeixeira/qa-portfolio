import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { OnboardingWizard, type LevelOption } from '@/components/academy/interview/onboarding/OnboardingWizard'
import { LEVEL_BARS } from '@/lib/academy/interview/rubric'

export const metadata: Metadata = {
  title: 'Set your target — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

// Honest fallback if the reference table read fails — the bars match rubric.LEVEL_BARS exactly.
const FALLBACK_LEVELS: readonly LevelOption[] = [
  { slug: 'intern', name: 'Intern', bar: LEVEL_BARS.intern, blurb: 'Coachable, curious, can code a clean solution with guidance.' },
  { slug: 'new_grad', name: 'New Grad', bar: LEVEL_BARS.new_grad, blurb: 'Solid fundamentals, communicates a plan, verifies before claiming done.' },
  { slug: 'mid', name: 'Mid-Level', bar: LEVEL_BARS.mid, blurb: 'Owns ambiguity, reasons about tradeoffs, proves correctness independently.' },
  { slug: 'senior', name: 'Senior', bar: LEVEL_BARS.senior, blurb: 'Sets direction, defends decisions under pressure, and raises the bar for the room.' },
]

/**
 * Onboarding — the 5-step target wizard (role, level, timeline, JD, evidence) that writes
 * interview_profiles. The level bars come from the real interview_levels reference table (public
 * read); the wizard state is client-side and the profile write is a server action.
 */
export default async function InterviewOnboardingPage() {
  const sb = await createSupabaseServerClient()
  const { data: levelRows } = await sb
    .from('interview_levels')
    .select('slug, name, bar, blurb')
    .order('sort', { ascending: true })

  const levels: LevelOption[] =
    levelRows && levelRows.length > 0
      ? levelRows.map((l) => ({
          slug: l.slug as string,
          name: l.name as string,
          bar: (l.bar as number) ?? LEVEL_BARS.senior,
          blurb: (l.blurb as string) ?? '',
        }))
      : [...FALLBACK_LEVELS]

  return (
    <InterviewShell active={null} backHref="/academy/interview">
      <OnboardingWizard levels={levels} />
    </InterviewShell>
  )
}
