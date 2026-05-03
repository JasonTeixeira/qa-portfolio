import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { readLegalMdx } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Privacy Policy — Sage Ideas',
  description: 'How Sage Ideas LLC collects, uses, and protects your information, including GDPR and CCPA rights disclosures.',
  robots: { index: true, follow: true },
}

export default async function PrivacyPage() {
  const source = await readLegalMdx('privacy')
  return <MDXRemote source={source} />
}
