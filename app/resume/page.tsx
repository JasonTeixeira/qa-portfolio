import type { Metadata } from 'next'
import { ResumeContent } from './resume-content'

export const metadata: Metadata = {
  title: 'Resume | Jason Teixeira — Systems Architect & Full-Stack Engineer',
  description: 'Interactive resume: Fortune 50 enterprise experience, fintech trading platforms, 9 certifications, 20+ production projects. Download PDF available.',
  openGraph: {
    title: 'Resume — Jason Teixeira',
    description: 'Systems architect with Home Depot, HighStrike, and Sage Ideas LLC experience. 20+ projects, 9 certifications.',
  },
}

export default function ResumePage() {
  return <ResumeContent />
}
