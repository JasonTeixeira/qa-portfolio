import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getFieldNoteBySlug, getAllFieldNotes } from '@/lib/field-notes'
import { ChallengeView } from '@/components/academy/challenge/ChallengeView'
import { AcademyShell } from '@/components/academy/academy-shell'

export const metadata: Metadata = {
  title: "This Week's Map-Along — Sage Academy",
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Weekly Challenge (/academy/challenge) — "one map, all of us." A learner page
 * whose brief is a REAL field note (not an invented problem). Gated to signed-in
 * learners (signed-out → login) and rendered inside the AcademyShell.
 *
 * HONESTY (hard): there is no submissions/voting backend, so the page renders
 * NO fabricated usernames, ranks, vote counts, or participant totals. The submit
 * area routes to real actions; standings show an honest empty state.
 */
export default async function ChallengePage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?audience=academy&next=/academy/challenge')

  const note =
    getFieldNoteBySlug('the-invoice-that-emailed-itself-twice') ?? getAllFieldNotes()[0]

  if (!note) redirect('/academy/dashboard')

  return (
    <AcademyShell>
      <ChallengeView note={note} />
    </AcademyShell>
  )
}
