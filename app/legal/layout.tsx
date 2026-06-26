import type { ReactNode } from 'react'
import Link from 'next/link'
import { headers } from 'next/headers'
import { ChevronRight, FileText } from 'lucide-react'

export default async function LegalLayout({ children }: { children: ReactNode }) {
  const h = await headers()
  const pathname = (h.get('x-pathname') ?? '').split('?')[0]
  if (pathname === '/legal') return <>{children}</>

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--sage-bg)] text-[var(--sage-ink)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'linear-gradient(rgba(242,239,233,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,233,0.028) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(61,90,254,0.82),rgba(124,58,237,0.44),transparent)]"
      />

      <div className="relative mx-auto max-w-3xl px-4 py-28 sm:px-6 lg:px-8">
        <nav
          className="mb-8 flex items-center gap-2 text-sm text-[var(--sage-ink-faint)]"
          aria-label="Legal document breadcrumb"
        >
          <FileText className="h-4 w-4 text-[var(--sage-accent-readable)]" />
          <Link href="/" className="inline-flex min-h-11 items-center transition-colors hover:text-[var(--sage-ink-muted)]">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/legal" className="inline-flex min-h-11 items-center transition-colors hover:text-[var(--sage-ink-muted)]">
            Legal
          </Link>
        </nav>

        <article className="prose-sage rounded-[8px] border border-[var(--sage-border)] bg-[rgba(20,20,24,0.58)] p-6 sm:p-8">
          {children}
        </article>

        <div className="mt-10 border-t border-[var(--sage-border)] pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/legal"
              className="inline-flex min-h-11 items-center [font-family:var(--font-mono),ui-monospace,monospace] text-[12px] uppercase tracking-[0.12em] text-[var(--sage-accent-readable)] transition-colors hover:text-[var(--sage-ink)]"
            >
              &larr; Back to legal documents
            </Link>
            <span className="[font-family:var(--font-mono),ui-monospace,monospace] text-xs text-[var(--sage-ink-faint)]">
              sage@sageideas.dev
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
