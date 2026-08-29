import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ensureCommunityProfile, listFriends, listIncomingRequests, listCohorts } from '@/lib/academy/community'
import { AcademyShell } from '@/components/academy/academy-shell'
import { GroupSubNav } from '@/components/academy/shell/GroupSubNav'
import { CommunityHub } from '@/components/academy/community/CommunityHub'
import { getT } from '@/lib/i18n/t'
import { getLocale } from '@/lib/i18n/server'
import { localizedAlternates } from '@/lib/i18n/alternates'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  const locale = await getLocale()
  return {
    title: t('Community — Sage Academy'),
    alternates: localizedAlternates('/academy/community', locale),
    robots: { index: false, follow: false },
  }
}

export const dynamic = 'force-dynamic'

export default async function CommunityPage() {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return null

  const handle = await ensureCommunityProfile(user.id, user.email ?? null)
  const [friends, requests, cohorts] = await Promise.all([
    listFriends(user.id),
    listIncomingRequests(user.id),
    listCohorts(user.id),
  ])

  return (
    <AcademyShell active="profile">
      <GroupSubNav group="compete" tab="community" />
      <CommunityHub
        myHandle={handle}
        friends={friends}
        requests={requests}
        cohorts={cohorts}
        discordUrl={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ?? null}
      />
    </AcademyShell>
  )
}
