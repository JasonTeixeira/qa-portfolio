import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ensureProfile, listMyArtifacts } from '@/lib/academy/profiles'
import { getLearnerGains } from '@/lib/academy/efficacy'
import { getMasteryMap } from '@/lib/academy/mastery'
import { getEarnedBadges } from '@/lib/academy/badges'
import { getNextRewards } from '@/lib/academy/rewards'
import { AcademyShell } from '@/components/academy/academy-shell'
import { GroupSubNav } from '@/components/academy/shell/GroupSubNav'
import { ProfileEditor } from '@/components/academy/profile/ProfileEditor'
import { MasteryMap } from '@/components/academy/profile/MasteryMap'
import { BadgeShelf } from '@/components/academy/badges/BadgeShelf'
import { BadgeCelebration } from '@/components/academy/badges/BadgeCelebration'
import styles from './profile-page.module.css'

export const metadata: Metadata = {
  title: 'Your profile — Sage Academy',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sageideas.dev'

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ badge?: string }>
}) {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return null

  const { badge: badgeParam } = await searchParams

  const profile = await ensureProfile(user.id, user.email ?? user.id)
  const [artifacts, gains, masteryMap, earnedBadges, rewards] = await Promise.all([
    listMyArtifacts(user.id),
    getLearnerGains(user.id),
    getMasteryMap(user.id),
    getEarnedBadges(user.id),
    getNextRewards(user.id),
  ])

  // Only celebrate a badge the learner has GENUINELY earned (anti-spoof: the param
  // is matched against server-verified rows, never trusted on its own).
  const celebrated = badgeParam ? earnedBadges.find((b) => b.key === badgeParam) ?? null : null

  return (
    <AcademyShell active="progress">
      <GroupSubNav group="progress" tab="mastery" />
      <div className={styles.stack}>
        <MasteryMap map={masteryMap} />
        <BadgeShelf earned={earnedBadges} nextBadge={rewards.nextBadge} />
        <ProfileEditor
          profile={profile}
          artifacts={artifacts}
          gains={gains}
          publicUrl={`${SITE}/academy/u/${profile.handle}`}
        />
      </div>
      <BadgeCelebration
        badge={
          celebrated
            ? {
                key: celebrated.key,
                label: celebrated.label,
                blurb: celebrated.blurb,
                icon: celebrated.icon,
              }
            : null
        }
      />
    </AcademyShell>
  )
}
