import type { Metadata } from 'next'
import { InterviewMasteryLanding } from '@/components/interview-landing/InterviewMasteryLanding'

export const metadata: Metadata = {
  title: 'Interview Mastery — unlimited AI mock interviews, honestly scored | Sage Academy',
  description:
    'Voice-first mock interviews with an AI interviewer that pushes back like a real one — scored against the bar for your target level. Every session ends with a debrief and a drill plan. The interview is a skill. Master it like one.',
  alternates: { canonical: 'https://www.sageideas.dev/interview' },
  openGraph: {
    title: 'Interview Mastery — the interview is a skill. Master it like one.',
    description:
      'Unlimited voice-first mocks, honest six-dimension scoring, debrief + drill plan every session. Free placement mock included.',
    url: 'https://www.sageideas.dev/interview',
    type: 'website',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is talking to an AI interviewer actually like the real thing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For the parts that matter — thinking out loud under follow-up pressure, being interrupted, defending a decision — yes, and you can rehearse them 40 times instead of 4. What it cannot simulate: a specific interviewer’s mood. No prep can.',
      },
    },
    {
      '@type': 'Question',
      name: 'Will it just flatter me so I keep subscribing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No — flattery would kill the product. Scores are capped by your weakest dimension and verdicts use real committee language, including "no hire." The guarantee only works because the scoring is honest.',
      },
    },
    {
      '@type': 'Question',
      name: 'I’m interviewing in two weeks. Is it too late?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Two weeks of daily reps is enough to fix your two costliest habits and run three full loop simulations. Set your date in onboarding and the plan compresses around it.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does it cover non-engineering roles?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Today: software engineering, frontend, data/ML, DevOps/SRE, engineering management, and product management. Behavioral and negotiation tracks work for any role.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens to my recordings?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'They’re yours. Transcripts and audio live in your account, power your debriefs, and can be deleted any time. They’re never used to train models or shown to other members.',
      },
    },
  ],
}

export default function InterviewMasteryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <InterviewMasteryLanding />
    </>
  )
}
