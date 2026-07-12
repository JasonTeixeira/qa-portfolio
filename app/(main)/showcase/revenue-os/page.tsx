import { RevenueOsShowcase } from './revenue-os-showcase'

export const metadata = {
  title: 'Revenue OS Interactive Demo | AI Client Acquisition System | Sage Ideas',
  description:
    'Click through a Revenue OS prototype for client acquisition: lead capture, daily priority queue, approved outreach, reply tracking, and pipeline visibility.',
  alternates: { canonical: 'https://www.sageideas.dev/showcase/revenue-os' },
  openGraph: {
    title: 'Revenue OS Interactive Demo | Sage Ideas',
    description:
      'A playable client acquisition command center that turns scattered leads, replies, and follow-ups into one ranked daily queue.',
    images: [
      {
        url: '/og?title=Revenue%20OS%20Demo&subtitle=Turn%20leaking%20demand%20into%20booked%20calls.',
        width: 1200,
        height: 630,
        alt: 'Revenue OS interactive demo by Sage Ideas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revenue OS Interactive Demo | Sage Ideas',
    description: 'Click through the working client acquisition prototype before booking a build call.',
    images: ['/og?title=Revenue%20OS%20Demo&subtitle=Turn%20leaking%20demand%20into%20booked%20calls.'],
  },
}

export default function RevenueOsShowcasePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is a Revenue OS?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A Revenue OS is a client acquisition operating system that collects leads, replies, missed calls, and follow-ups into one prioritized workflow with clear next actions.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can the Revenue OS demo be customized for my business?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Sage Ideas can adapt the workflow around your lead sources, tools, sales motion, approval process, and reporting needs.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is the prototype clickable?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The showcase includes a native React prototype that lets visitors inspect the queue, account detail, outreach, replies, analytics, and build flow.',
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
      <RevenueOsShowcase />
    </>
  )
}
