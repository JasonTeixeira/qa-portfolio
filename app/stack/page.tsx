import type { Metadata } from 'next'
import { StackContent } from './stack-content'

export const metadata: Metadata = {
  title: 'Tech Stack | Jason Teixeira — 56 Technologies',
  description: 'Full technology stack: TypeScript, Python, C#/.NET, Next.js, React, AWS, Terraform, Docker, Kubernetes, Selenium, Playwright, and 40+ more tools across 9 categories.',
  openGraph: {
    title: 'Tech Stack — Jason Teixeira',
    description: '56 technologies across frontend, backend, cloud, testing, AI, and trading.',
  },
}

export default function StackPage() {
  return <StackContent />
}
