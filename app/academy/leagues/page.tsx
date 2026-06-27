import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getLeagueStandings } from '@/lib/academy/leagues'
import { getNextRewards } from '@/lib/academy/rewards'
import { AcademyShell } from '@/components/academy/academy-shell'
import { GroupSubNav } from '@/components/academy/shell/GroupSubNav'
import { Leagues } from '@/components/academy/leagues/Leagues'

export const metadata: Metadata = {
  title: 'Leagues — Sage Academy',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function LeaguesPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null // middleware gates this; defensive

  const [standings, rewards] = await Promise.all([getLeagueStandings(user.id), getNextRewards(user.id)])

  return (
    <AcademyShell active="compete">
      <GroupSubNav group="compete" tab="leagues" />
      <Leagues standings={standings} nextRank={rewards.nextRank} />
    </AcademyShell>
  )
}
