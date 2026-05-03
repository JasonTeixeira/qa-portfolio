import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { readLegalDoc } from '@/lib/legal'
import { legalMdxComponents } from '@/components/studio/mdx-components'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Sage Ideas LLC collects, uses, and protects your information, including GDPR and CCPA rights disclosures.',
  robots: { index: true, follow: true },
}

export default async function LegalDocPage() {
  const { frontmatter, body } = await readLegalDoc('privacy')
  return (
    <>
      <header className="mb-12 pb-8 border-b border-[#27272A]">
        <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#06B6D4] mb-3">
          Legal Document
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#FAFAFA] leading-tight">
          {frontmatter.title ?? 'Privacy Policy'}
        </h1>
        {frontmatter.summary ? (
          <p className="mt-4 text-[#A1A1AA] leading-relaxed">{frontmatter.summary}</p>
        ) : null}
        {frontmatter.lastUpdated ? (
          <p className="mt-4 text-xs font-mono text-[#71717A]">
            Last updated · {frontmatter.lastUpdated}
          </p>
        ) : null}
      </header>
      <MDXRemote source={body} components={legalMdxComponents} />
    </>
  )
}
