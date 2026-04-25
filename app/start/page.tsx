import type { Metadata } from 'next'
import { StartContent } from './start-content'

export const metadata: Metadata = {
  title: 'Start Here | Jason Teixeira — 60-Second Portfolio Tour',
  description: 'Quick guided tour for recruiters and hiring managers. See projects, read case studies, check credentials, and download the resume — all in 60 seconds.',
  openGraph: {
    title: 'Start Here — Jason Teixeira',
    description: '60-second tour: projects, case studies, credentials, tech stack, resume.',
  },
}

export default function StartPage() {
  return <StartContent />
}
