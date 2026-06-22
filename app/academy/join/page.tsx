import type { Metadata } from 'next'
import { ACADEMY_PLANS } from '@/lib/academy/plans'
import { getAcademyAccess } from '@/lib/academy/access'
import { JoinClient } from '@/components/academy/join/JoinClient'

export const metadata: Metadata = {
  title: 'Join — Sage Academy',
  description: 'All-access membership: every course, lab, and certificate. $20/month or $200/year.',
  robots: { index: false, follow: false },
}

export default async function JoinPage() {
  const access = await getAcademyAccess()
  return (
    <JoinClient
      plans={ACADEMY_PLANS}
      alreadyMember={!!access.membership}
      signedIn={access.signedIn}
    />
  )
}
