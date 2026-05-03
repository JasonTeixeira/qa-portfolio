import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { readLegalMdx } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Cookie Policy — Sage Ideas',
  description: 'What cookies and tracking technologies Sage Ideas uses, why, and how to control them.',
  robots: { index: true, follow: true },
}

export default async function CookiesPage() {
  const source = await readLegalMdx('cookies')
  return <MDXRemote source={source} />
}
