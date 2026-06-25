import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AcademyLanding } from '@/components/academy/landing/AcademyLanding'
import { ReferralCapture } from '@/components/academy/referral/ReferralCapture'

const SITE = 'https://www.sageideas.dev'

export const metadata: Metadata = {
  title: 'Sage Academy — learn to build with AI, by building',
  description:
    'A project-based academy with a learning engine that won’t let you fake it: in-browser labs, adversarial checkpoints, and unlock gates that demand proof. Every course, lab, and certificate for $20/mo or $200/yr.',
  alternates: { canonical: `${SITE}/academy` },
  openGraph: {
    title: 'Sage Academy — learn to build with AI, by building',
    description: 'A learning engine, not a video library. In-browser labs, proof-based unlock gates, real certificates. $20/mo · $200/yr.',
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
      <Suspense fallback={null}>
        <ReferralCapture />
      </Suspense>
      <AcademyLanding />
    </>
  )
}
