import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SageHome } from '@/components/academy/landing/SageHome'
import { ReferralCapture } from '@/components/academy/referral/ReferralCapture'
import { JsonLd } from '@/components/json-ld'
import { buildWebSite } from '@/lib/seo/jsonld'

/**
 * Front page = the Sage Academy home (canonical dark proof-first design from
 * "Sage Academy Download/Sage Home.dc.html"). The academy IS the site's front
 * door; the studio keeps its own routes (/work, /pricing, /book).
 */

const DESCRIPTION =
  'Sage Academy: learn to think like a senior engineer — and prove it. Real labs, scored evidence, verifiable certificates. Proof, not vibes.'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.sageideas.dev' },
  title: 'Sage Academy — Learn to think like a senior engineer, and prove it',
  description: DESCRIPTION,
  openGraph: {
    title: 'Sage Academy — Learn to think like a senior engineer, and prove it',
    description: DESCRIPTION,
    url: 'https://www.sageideas.dev',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sage Academy — Learn to think like a senior engineer, and prove it',
    description: DESCRIPTION,
  },
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={[buildWebSite()]} />
      <Suspense fallback={null}>
        <ReferralCapture />
      </Suspense>
      <SageHome />
    </>
  )
}
