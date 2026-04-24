import type { Metadata } from 'next'
import { AboutContent } from './about-content'

export const metadata: Metadata = {
  title: 'About | Jason Teixeira - Systems Architect',
  description: 'Learn about Jason Teixeira - systems architect with Fortune 50 experience, 9 certifications, and expertise in full-stack development, test automation, and trading systems.',
  openGraph: {
    title: 'About Jason Teixeira',
    description: 'Systems architect with Fortune 50 experience building production platforms and trading systems.',
  },
}

export default function AboutPage() {
  return <AboutContent />
}
