import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { readLegalMdx } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Statement of Work Template — Sage Ideas',
  description: 'The standard SOW structure used for all Sage Ideas LLC engagements — scope, deliverables, timeline, and acceptance criteria.',
  robots: { index: true, follow: true },
}

export default async function SowTemplatePage() {
  const source = await readLegalMdx('sow-template')
  return <MDXRemote source={source} />
}
