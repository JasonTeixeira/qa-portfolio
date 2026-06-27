import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ensureProfile, listMyArtifacts } from '@/lib/academy/profiles'
import { getLearnerGains } from '@/lib/academy/efficacy'
import { getMasteryMap } from '@/lib/academy/mastery'
import { AcademyShell } from '@/components/academy/academy-shell'
import { GroupSubNav } from '@/components/academy/shell/GroupSubNav'
import { ProfileEditor } from '@/components/academy/profile/ProfileEditor'
import { MasteryMap } from '@/components/academy/profile/MasteryMap'
import styles from './profile-page.module.css'

export const metadata: Metadata = {
  title: 'Your profile — Sage Academy',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sageideas.dev'

export default async function ProfilePage() {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return null

  const profile = await ensureProfile(user.id, user.email ?? user.id)
  const [artifacts, gains, masteryMap] = await Promise.all([
    listMyArtifacts(user.id),
    getLearnerGains(user.id),
    getMasteryMap(user.id),
  ])

  return (
    <AcademyShell active="progress">
      <GroupSubNav group="progress" tab="mastery" />
      <div className={styles.stack}>
        <MasteryMap map={masteryMap} />
        <ProfileEditor
          profile={profile}
          artifacts={artifacts}
          gains={gains}
          publicUrl={`${SITE}/academy/u/${profile.handle}`}
        />
      </div>
    </AcademyShell>
  )
}
