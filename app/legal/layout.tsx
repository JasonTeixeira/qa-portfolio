import type { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const docTitles: Record<string, string> = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  cookies: 'Cookie Policy',
  msa: 'Master Services Agreement',
  nda: 'Non-Disclosure Agreement',
  'sow-template': 'Statement of Work Template',
}

function getDocTitle(pathname: string): string {
  const slug = pathname.split('/').pop() ?? ''
  return docTitles[slug] ?? 'Legal Document'
}

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090B]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#71717A] mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#A1A1AA] transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/legal" className="hover:text-[#A1A1AA] transition-colors">
            Legal
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-[#A1A1AA]">Document</span>
        </nav>

        {/* Content */}
        <article
          className="
            prose prose-invert max-w-none
            prose-headings:text-[#FAFAFA]
            prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-6
            prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-[#FAFAFA]
            prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-[#FAFAFA]
            prose-p:text-[#A1A1AA] prose-p:leading-relaxed prose-p:my-4
            prose-strong:text-[#FAFAFA] prose-strong:font-semibold
            prose-a:text-[#06B6D4] prose-a:no-underline hover:prose-a:text-[#22D3EE] prose-a:transition-colors
            prose-li:text-[#A1A1AA] prose-li:leading-relaxed
            prose-ul:my-4 prose-ol:my-4
            prose-hr:border-[#27272A] prose-hr:my-10
            prose-code:text-[#06B6D4] prose-code:bg-[#0F0F12] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-blockquote:border-l-[#06B6D4] prose-blockquote:text-[#A1A1AA]
            prose-table:text-sm
            prose-thead:text-[#FAFAFA]
            prose-td:text-[#A1A1AA] prose-td:border-[#27272A]
            prose-th:border-[#27272A]
          "
        >
          {children}
        </article>

        {/* Back link */}
        <div className="mt-16 pt-8 border-t border-[#27272A]">
          <Link
            href="/legal"
            className="text-sm text-[#06B6D4] hover:text-[#22D3EE] transition-colors"
          >
            ← Back to Legal Documents
          </Link>
        </div>
      </div>
    </div>
  )
}
