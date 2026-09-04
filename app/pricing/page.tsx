import type { Metadata } from 'next'
import { ACADEMY_PLANS } from '@/lib/academy/plans'
import { PricingEl } from './pricing-el'
import { JsonLd } from '@/components/json-ld'
import { PageViewTracker } from '@/components/analytics/page-view-tracker'

const SITE = 'https://www.sageideas.dev'

/**
 * FAQ shown on the reskinned Academy pricing page. Kept in sync with the
 * operator-authored "Honest answers" list rendered in pricing-el.tsx so the
 * structured data matches the visible copy.
 */
const academyPricingFaq = [
  {
    q: 'Is this for beginners?',
    a: 'Course 00 assumes you can code a little and think a lot. Career-switchers start there plus Programming Fundamentals; working engineers can enter any live track. Nothing here is watch-and-nod content — expect to be wrong in public and fix it.',
  },
  {
    q: 'Monthly or annual?',
    a: 'Monthly is for trying the water — same access, cancel any month. Annual is two months cheaper and adds a yearly portfolio review. Most members switch to annual after their first shipped proof; the upgrade is prorated.',
  },
  {
    q: 'Why is the score capped instead of averaged?',
    a: "Because that's how a reviewer reads your work. They don't average your strong claims against your broken one — they stop at the broken one. The cap shows the exact repair that lifts it, so the honest number is also an actionable one.",
  },
  {
    q: 'How much time does it take?',
    a: 'A lesson is 20–40 minutes and ends in a proof. Recall is about six minutes a day. One sprint a week is the intended cadence — this is designed around a job, not instead of one.',
  },
  {
    q: 'Can I cancel?',
    a: 'Anytime, no lock-in — your access runs to the end of the period you paid for, and you keep every artifact and proof you shipped. Try a full lesson free first, no card required.',
  },
] as const

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: academyPricingFaq.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
    { '@type': 'ListItem', position: 2, name: 'Pricing', item: `${SITE}/pricing` },
  ],
}

export const metadata: Metadata = {
  title: 'Pricing — Sage Academy | Sage Ideas',
  description:
    'Simple, honest pricing for Sage Academy. Every plan includes everything — all 23 courses as they ship, every lab and proof, spaced recall, leagues, and verifiable certificates. $25/month or $250/year.',
  alternates: { canonical: `${SITE}/pricing` },
  openGraph: {
    title: 'Pricing — Sage Academy',
    description: "You're not buying hours of video. You're buying a body of work.",
    images: [{ url: '/og?title=Pricing&subtitle=You%27re%20buying%20a%20body%20of%20work.' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og?title=Pricing&subtitle=You%27re%20buying%20a%20body%20of%20work.'],
  },
}

export default function PricingPage() {
  return (
    <>
      <JsonLd data={[faqSchema, breadcrumbSchema]} />
      <PageViewTracker event="pricing_view" />
      <PricingEl monthly={ACADEMY_PLANS.monthly} yearly={ACADEMY_PLANS.yearly} />
    </>
  )
}
