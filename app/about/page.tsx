import type { Metadata } from 'next'
import { AboutContent } from './about-content'

export const metadata: Metadata = {
  title: 'About | Jason Teixeira - Full-Stack Developer',
  description: 'Learn about Jason Teixeira - full-stack developer with 5 years of fintech experience, 9 certifications, and expertise in trading systems, web development, and automation.',
  openGraph: {
    title: 'About Jason Teixeira',
    description: 'Full-stack developer with 5 years fintech experience building trading systems and production platforms.',
  },
}

export default function AboutPage() {
  return <AboutContent />
}
