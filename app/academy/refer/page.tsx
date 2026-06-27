import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getReferralSummary } from '@/lib/academy/referrals'
import { REFERRAL_REWARDS } from '@/lib/academy/referral-logic'
import { AcademyShell } from '@/components/academy/academy-shell'
import { GroupSubNav } from '@/components/academy/shell/GroupSubNav'
import { ReferralHub } from '@/components/academy/referral/ReferralHub'

export const metadata: Metadata = {
  title: 'Invite & earn — Sage Academy',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sageideas.dev'

export default async function ReferPage() {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return null

  const { code, summary } = await getReferralSummary(user.id)

  return (
    <AcademyShell active="progress">
      <GroupSubNav group="progress" tab="refer" />
      <ReferralHub code={code} link={`${SITE}/academy?ref=${code}`} summary={summary} rewards={REFERRAL_REWARDS} />
    </AcademyShell>
  )
}
