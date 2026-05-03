import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { readLegalMdx } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Master Services Agreement — Sage Ideas',
  description: 'The standard contract governing all client engagements with Sage Ideas LLC — scope, payment terms, IP ownership, and liability.',
  robots: { index: true, follow: true },
}

export default async function MsaPage() {
  const source = await readLegalMdx('msa')
  return <MDXRemote source={source} />
}
