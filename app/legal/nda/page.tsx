import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { readLegalMdx } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Non-Disclosure Agreement — Sage Ideas',
  description: 'Mutual NDA template used for discovery calls and sensitive project discussions with Sage Ideas LLC.',
  robots: { index: true, follow: true },
}

export default async function NdaPage() {
  const source = await readLegalMdx('nda')
  return <MDXRemote source={source} />
}
