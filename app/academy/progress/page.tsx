import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getProgressData } from '@/lib/academy/progress-data'
import { ProgressView } from '@/components/academy/progress/ProgressView'
import { AcademyShell } from '@/components/academy/academy-shell'

export const metadata: Metadata = {
  title: 'Progress — Sage Academy',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Progress (/academy/progress) — "The honest picture": the mastery-over-time
 * analytics surface. Gated to signed-in learners (signed-out → login), rendered
 * inside the AcademyShell with the "path" destination active. Every panel is a
 * pure function of the learner's REAL evidence — a fresh learner sees an honest
 * empty state, never a fabricated bar.
 */
export default async function ProgressPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?audience=academy&next=/academy/progress')

  const data = await getProgressData()

  return (
    <AcademyShell active="path">
      <ProgressView data={data} />
    </AcademyShell>
  )
}
