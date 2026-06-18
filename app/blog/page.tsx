import type { Metadata } from 'next'
import { BlogContent } from './blog-content'
import { getAllBlogPosts } from '@/lib/blog-server'

export const metadata: Metadata = {
  title: 'Blog | Sage Ideas — Build Notes, AI Systems & Product Architecture',
  description:
    'Sage Ideas build notes on AI systems, product architecture, automation, trading platforms, cloud infrastructure, QA, and the solo studio operating model.',
  alternates: { canonical: 'https://www.sageideas.dev/blog' },
  openGraph: {
    title: 'Sage Ideas Journal',
    description:
      'A content engine for builders, buyers, and future academy students: real notes from products, AI systems, infrastructure, and studio operations.',
  },
}

export default function BlogPage() {
  return <BlogContent posts={getAllBlogPosts()} />
}
