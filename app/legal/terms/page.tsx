import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { readLegalMdx } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Terms of Service — Sage Ideas',
  description: 'The terms governing access to and use of sageideas.dev and Sage Ideas LLC services.',
  robots: { index: true, follow: true },
}

export default async function TermsPage() {
  const source = await readLegalMdx('terms')
  return <MDXRemote source={source} />
}
