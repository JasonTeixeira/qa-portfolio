import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getLearnerPath } from '@/lib/academy/path'
import { PathView } from '@/components/academy/path/PathView'
import { AcademyShell } from '@/components/academy/academy-shell'

export const metadata: Metadata = {
  title: 'My Path — Sage Academy',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * My Path (/academy/progress) — the first-class "where am I across the
 * curriculum" map. Gated to signed-in learners (signed-out → login), rendered
 * inside the AcademyShell with the "path" destination active. All progress is
 * real and RLS-scoped; a fresh learner sees zeros and a clear gate-first route.
 */
export default async function ProgressPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?audience=academy&next=/academy/progress')

  const path = await getLearnerPath()

  return (
    <AcademyShell active="path">
      <PathView path={path} />
    </AcademyShell>
  )
}
