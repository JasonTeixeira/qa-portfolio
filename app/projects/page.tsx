import type { Metadata } from 'next'
import { ProjectsContent } from './projects-content'

export const metadata: Metadata = {
  title: 'Projects | Jason Teixeira - 27+ Production Systems',
  description: 'Browse 27+ projects: full-stack applications, trading systems, test automation frameworks, cloud infrastructure, AI tools, and more.',
  openGraph: {
    title: 'Projects - 27+ Production Systems',
    description: 'Full-stack applications, trading systems, test automation, cloud infrastructure, and AI tools.',
  },
}

export default function ProjectsPage() {
  return <ProjectsContent />
}
