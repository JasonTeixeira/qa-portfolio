import { ContractorQuoteShowcase } from './contractor-quote-showcase'

export const metadata = {
  title: 'Contractor Quote Engine Demo | Sage Ideas',
  description:
    'A clickable contractor quote engine prototype that qualifies service requests, scores urgency, estimates job value, and books walkthroughs.',
  alternates: { canonical: 'https://www.sageideas.dev/showcase/contractor-quote-engine' },
  openGraph: {
    title: 'Contractor Quote Engine Demo | Sage Ideas',
    description:
      'See how a contractor website can turn service visitors into qualified quote requests and booked walkthroughs.',
    images: [
      {
        url: '/og?title=Contractor%20Quote%20Engine&subtitle=Turn%20website%20visitors%20into%20qualified%20walkthroughs.',
        width: 1200,
        height: 630,
        alt: 'Contractor Quote Engine interactive demo by Sage Ideas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contractor Quote Engine Demo | Sage Ideas',
    description: 'Click through a contractor quote workflow built for service businesses.',
    images: ['/og?title=Contractor%20Quote%20Engine&subtitle=Qualified%20quote%20requests%20and%20booked%20walkthroughs.'],
  },
}

export default function ContractorQuoteEnginePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is a Contractor Quote Engine?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A Contractor Quote Engine is a website and workflow that routes service visitors by job type, urgency, location, and proof needs so the business can prioritize and book qualified estimates faster.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can Sage Ideas customize this for my trade?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The workflow can be adapted for roofing, HVAC, plumbing, electrical, landscaping, remodeling, and other local service businesses.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is this a real clickable prototype?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The page includes a native interactive prototype with quote routing, urgency scoring, value estimation, proof blocks, and a booking handoff simulation.',
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ContractorQuoteShowcase />
    </>
  )
}
