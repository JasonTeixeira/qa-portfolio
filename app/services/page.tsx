import type { Metadata } from 'next'
import { ServicesContent } from './services-content'

export const metadata: Metadata = {
  title: 'Services | Jason Teixeira — Custom Software, Automation, Cloud, Trading',
  description: 'Custom software development, test automation architecture, cloud infrastructure (AWS/Terraform), and trading systems. $150/hr consulting, $5K-$50K projects. Orlando, FL — available remotely.',
  openGraph: {
    title: 'Services — Custom Software, Automation & Trading Systems',
    description: 'Full-stack development, test automation, cloud infrastructure, and trading systems from a developer with 5 years of fintech experience.',
  },
}

// FAQPage structured data for Google rich snippets
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What are your rates for software development?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Fixed-price projects start at $5K for small projects, $15K-50K for full applications. Hourly consulting is $150/hr. The model depends on the project scope.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long do software projects typically take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Small tools (landing pages, simple APIs): 1-2 weeks. Medium applications (dashboards, CRUD apps): 4-8 weeks. Complex systems (trading platforms, multi-service architectures): 2-4 months.',
      },
    },
    {
      '@type': 'Question',
      name: 'What tech stack do you work with?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Primary: Next.js, React, TypeScript, Python, .NET Core, PostgreSQL, AWS. Also: Node.js, FastAPI, Docker, Terraform, NinjaTrader (C#), Discord.js, and various AI/ML tools.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you work with early-stage startups?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, but selectively. I look for founders who know what they want to build and have budget allocated. I don\'t do equity-only deals or vague "build me an app" engagements.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is your communication style for projects?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Weekly async updates (Loom videos, written summaries) plus real-time access via Slack/Discord for questions. I don\'t disappear — you always know project status.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you provide ongoing maintenance after project completion?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. After project completion, I offer monthly maintenance packages: monitoring, bug fixes, small feature additions. Rates depend on system complexity.',
      },
    },
  ],
}

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ServicesContent />
    </>
  )
}
