import type { Metadata } from 'next'
import { ResumeContent } from './resume-content'

export const metadata: Metadata = {
  title: 'Resume | Jason Teixeira — Full-Stack Developer & Trading Systems Engineer',
  description: 'Interactive resume: 5 years fintech development at HighStrike, 185-table platform built independently, 9 certifications, 20+ projects. Download PDF available.',
  openGraph: {
    title: 'Resume — Jason Teixeira',
    description: 'Full-stack developer with HighStrike and Sage Ideas LLC experience. 20+ projects, 9 certifications.',
  },
}

export default function ResumePage() {
  return <ResumeContent />
}
