import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SageHome } from '@/components/academy/landing/SageHome'
import { ReferralCapture } from '@/components/academy/referral/ReferralCapture'
import { buildCourse } from '@/lib/seo/jsonld'
import { ACADEMY_PLANS } from '@/lib/academy/plans'
import { getT } from '@/lib/i18n/t'
import { getLocale } from '@/lib/i18n/server'
import { localizedAlternates } from '@/lib/i18n/alternates'

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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  const locale = await getLocale()
  return {
    title: t('Sage Academy — learn to build with AI, by building'),
    description: t(
      'A project-based academy and build-note library for learning AI by shipping real systems: interactive courses, labs, mastery loops, and founder-grade technical writing for $25/mo.',
    ),
    alternates: localizedAlternates('/academy', locale),
    openGraph: {
      title: t('Sage Academy — learn to build with AI, by building'),
      description: t('A learning engine, not a video library. Interactive courses, proof-based unlock gates, build notes, and real certificates. $25/mo.'),
      images: ['/og?title=Sage+Academy&subtitle=Learn+to+build+with+AI%2C+by+building'],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/og?title=Sage+Academy&subtitle=Learn+to+build+with+AI%2C+by+building'],
    },
  }
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
