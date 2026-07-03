import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getLeagueStandings } from '@/lib/academy/leagues'
import { getNextRewards } from '@/lib/academy/rewards'
import { ensureReferralCode } from '@/lib/academy/referrals'
import { AcademyShell } from '@/components/academy/academy-shell'
import { GroupSubNav } from '@/components/academy/shell/GroupSubNav'
import { Leagues } from '@/components/academy/leagues/Leagues'

export const metadata: Metadata = {
  title: 'Leagues — Sage Academy',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

// Same env + default host + `?ref=` format as the canonical referral page
// (app/academy/refer/page.tsx) — one real, working invite link, not a new format.
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sageideas.dev'

export default async function LeaguesPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null // middleware gates this; defensive

  // Real referral code (create-on-first-use) → the honest, working invite link.
  // Best-effort: the cohort card degrades to a no-link CTA if this fails.
  let inviteLink: string | null = null
  const [standings, rewards] = await Promise.all([getLeagueStandings(user.id), getNextRewards(user.id)])
  try {
    const code = await ensureReferralCode(user.id)
    inviteLink = `${SITE}/academy?ref=${code}`
  } catch {
    inviteLink = null
  }

  return (
    <AcademyShell active="profile">
      <GroupSubNav group="compete" tab="leagues" />
      <Leagues standings={standings} nextRank={rewards.nextRank} inviteLink={inviteLink} />
    </AcademyShell>
  )
}
