import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicProfile } from '@/lib/academy/profiles'
import { PublicProfileView } from '@/components/academy/profile/PublicProfileView'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sageideas.dev'

function bestGain(gains: { g: number | null }[]): number | null {
  const vals = gains.map((x) => x.g).filter((g): g is number => g !== null)
  return vals.length ? Math.max(...vals) : null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const profile = await getPublicProfile(handle)
  if (!profile) return { title: 'Profile not found — Sage Academy', robots: { index: false } }

  const projects = profile.artifacts.length
  const certs = profile.certificates.length
  const g = bestGain(profile.gains)
  const stat = projects ? `${projects}` : certs ? `${certs}` : g !== null ? `g ${g.toFixed(2)}` : ''
  const subtitle = `${certs} certificate${certs === 1 ? '' : 's'} · ${projects} project${
    projects === 1 ? '' : 's'
  } shipped${g !== null ? ` · learning gain g=${g.toFixed(2)}` : ''}`
  const og = `${SITE}/og/academy?kind=proof&stat=${encodeURIComponent(stat)}&title=${encodeURIComponent(
    profile.displayName,
  )}&subtitle=${encodeURIComponent(subtitle)}`

  return {
    title: `${profile.displayName} — Sage Academy`,
    description: subtitle,
    openGraph: { title: `${profile.displayName} · Sage Academy`, description: subtitle, images: [og] },
    twitter: { card: 'summary_large_image', images: [og] },
  }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const profile = await getPublicProfile(handle)
  if (!profile) notFound()

  return <PublicProfileView profile={profile} shareUrl={`${SITE}/academy/u/${profile.handle}`} />
}
