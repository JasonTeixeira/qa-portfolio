import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ensureProfile } from '@/lib/academy/profiles'
import { getAcademyBilling } from '@/lib/academy/billing'
import { SettingsClient, type SettingsData } from './settings-client'

export const metadata: Metadata = {
  title: 'Settings — Sage Academy',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sageideas.dev'
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'hello@sageideas.dev'

function monogramFrom(displayName: string | null, handle: string, email: string | null): string {
  const source = (displayName || handle || email || 'you').trim()
  const parts = source.split(/[\s._-]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

export default async function SettingsPage() {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return null

  const profile = await ensureProfile(user.id, user.email ?? user.id)
  const billing = await getAcademyBilling(user.id)

  // Real linked-provider status from Supabase auth identities.
  const identities = user.identities ?? []
  const providerOf = (name: 'github' | 'google') => {
    const id = identities.find((i) => i.provider === name)
    if (!id) return { provider: name, connected: false, handle: null }
    const identityData = (id.identity_data ?? {}) as Record<string, unknown>
    const rawHandle =
      (identityData.user_name as string | undefined) ||
      (identityData.preferred_username as string | undefined) ||
      (identityData.name as string | undefined) ||
      (identityData.email as string | undefined) ||
      null
    return {
      provider: name,
      connected: true,
      handle: rawHandle ? (name === 'github' ? `@${rawHandle}` : rawHandle) : null,
    }
  }

  const deletionSubject = encodeURIComponent('Account deletion request — Sage Academy')
  const deletionBody = encodeURIComponent(
    `Please delete my Sage Academy account.\n\nAccount email: ${user.email ?? '(unknown)'}\nAccount id: ${user.id}\n\nI understand this is permanent.`,
  )

  const data: SettingsData = {
    displayName: profile.displayName ?? '',
    handle: profile.handle,
    publicUrl: `${SITE}/academy/u/${profile.handle}`,
    publicProfilePath: `/academy/u/${profile.handle}`,
    monogram: monogramFrom(profile.displayName, profile.handle, user.email ?? null),
    billing,
    providers: [providerOf('github'), providerOf('google')],
    supportMailto: `mailto:${SUPPORT_EMAIL}?subject=${deletionSubject}&body=${deletionBody}`,
  }

  return <SettingsClient data={data} />
}
