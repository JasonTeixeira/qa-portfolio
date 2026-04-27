import type { Metadata } from 'next'
import { BlogContent } from './blog-content'

export const metadata: Metadata = {
  title: 'Blog | Jason Teixeira — Engineering & Architecture',
  description: 'Technical articles on systems architecture, automation, trading systems, cloud infrastructure, and software engineering. 50 in-depth posts with real code examples.',
  openGraph: {
    title: 'Engineering Blog — Jason Teixeira',
    description: 'Technical writing on building fintech platforms, AI bots, testing frameworks, and cloud infrastructure.',
  },
}

export default function BlogPage() {
  return <BlogContent />
}
