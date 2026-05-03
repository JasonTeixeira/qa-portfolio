import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { readLegalDoc } from '@/lib/legal'
import { legalMdxComponents } from '@/components/studio/mdx-components'

export const metadata: Metadata = {
  title: 'SOW Template',
  description: 'Statement of Work template for Sage Ideas client engagements.',
  robots: { index: true, follow: true },
}

export default async function LegalDocPage() {
  const { frontmatter, body } = await readLegalDoc('sow-template')
  return (
    <>
      <header className="mb-12 pb-8 border-b border-[#27272A]">
        <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#06B6D4] mb-3">
          Legal Document
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#FAFAFA] leading-tight">
          {frontmatter.title ?? 'SOW Template'}
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
