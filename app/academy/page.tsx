import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SageHome } from '@/components/academy/landing/SageHome'
import { ReferralCapture } from '@/components/academy/referral/ReferralCapture'
import { buildCourse } from '@/lib/seo/jsonld'
import { ACADEMY_PLANS } from '@/lib/academy/plans'

const SITE = 'https://www.sageideas.dev'

const COURSE_LD = buildCourse({
  name: 'Sage Academy — learn AI engineering by building',
  description:
    'A project-based academy for learning AI engineering by shipping real systems: interactive courses, in-browser labs, spaced-recall mastery loops, and certificates verifiable by code.',
  url: `${SITE}/academy`,
  priceCents: ACADEMY_PLANS.monthly.amountCents,
  cadence: 'monthly',
  workload: 'PT30M',
})

export const metadata: Metadata = {
  title: 'Sage Academy — learn to build with AI, by building',
  description:
    'A project-based academy and build-note library for learning AI by shipping real systems: interactive courses, labs, mastery loops, and founder-grade technical writing for $25/mo.',
  alternates: { canonical: `${SITE}/academy` },
  openGraph: {
    title: 'Sage Academy — learn to build with AI, by building',
    description: 'A learning engine, not a video library. Interactive courses, proof-based unlock gates, build notes, and real certificates. $25/mo.',
    images: ['/og?title=Sage+Academy&subtitle=Learn+to+build+with+AI%2C+by+building'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og?title=Sage+Academy&subtitle=Learn+to+build+with+AI%2C+by+building'],
  },
}

export default function AcademyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(COURSE_LD) }} />
      <Suspense fallback={null}>
        <ReferralCapture />
      </Suspense>
      <SageHome />
    </>
  )
}
