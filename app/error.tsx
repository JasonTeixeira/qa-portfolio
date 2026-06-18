'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { RotateCcw, Home, ArrowRight } from 'lucide-react'
import { reportError } from '@/components/client-error-reporter'
import { Hairline, MonoLabel, Surface } from '@/components/el'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surfaces in Vercel logs; client-side console for local dev.
    console.error('[app/error]', error)
    reportError({
      message: error.message,
      stack: error.stack ?? null,
      digest: error.digest ?? null,
      severity: 'error',
    })
  }, [error])

  return (
    <div className="flex min-h-[80vh] items-center bg-[var(--sage-bg)]">
      <div className="mx-auto w-full max-w-3xl px-5 py-24 sm:px-8">

        {/* Eyebrow */}
        <div className="mb-8 flex items-center gap-4 [font-family:var(--font-mono),ui-monospace,monospace]">
          <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[var(--sage-coral)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--sage-coral)]" aria-hidden />
            exit 1 · unhandled exception
          </span>
          <Hairline className="flex-1" />
        </div>

        {/* Stack trace surface */}
        <Surface level={1} className="mb-8 [font-family:var(--font-mono),ui-monospace,monospace]">
          <div className="border-b border-[var(--sage-border)] px-5 py-3">
            <MonoLabel tone="faint">{'// runtime log'}</MonoLabel>
          </div>
          <div className="space-y-0.5 px-5 py-4 text-[11px] leading-relaxed">
            <div><span className="text-[#3D5AFE]">$</span> <span className="text-[var(--sage-ink-muted)]">render(page)</span></div>
            <div className="text-[var(--sage-coral)]">Error: runtime exception</div>
            <div className="text-[var(--sage-ink-faint)]">at server.tsx:?:?</div>
            <div className="text-[var(--sage-ink-faint)]">x-sage-status: logged · alert sent</div>
          </div>
        </Surface>

        {/* Heading */}
        <h1
          className="font-normal text-[var(--sage-ink)]"
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
            fontSize: 'clamp(2.5rem, 1.5rem + 4vw, 4.5rem)',
            lineHeight: 1.0,
            letterSpacing: '-0.024em',
          }}
        >
          Something broke.
        </h1>

        <Hairline accentLead className="mt-7 max-w-xs" />

        <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-[var(--sage-ink-muted)]">
          The server threw. We were paged. If you hit retry and it still fails, send the digest below to{' '}
          <a
            href="mailto:sage@sageideas.dev"
            className="text-[#3D5AFE] underline underline-offset-2 hover:text-[#5670ff]"
          >
            sage@sageideas.dev
          </a>
          {' '}— we read every report.
        </p>

        {error.digest ? (
          <div className="mt-6 inline-flex items-center gap-3 rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] px-4 py-2.5 [font-family:var(--font-mono),ui-monospace,monospace]">
            <MonoLabel tone="faint" as="span">digest</MonoLabel>
            <span className="text-[11px] text-[var(--sage-ink-muted)]">{error.digest}</span>
          </div>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            onClick={reset}
            className="group relative inline-flex h-12 items-center gap-2.5 rounded-[3px] bg-[#3D5AFE] px-6 text-[13px] font-medium uppercase tracking-[0.08em] text-[#08110F] transition-[background-color,transform] duration-200 ease-out [font-family:var(--font-mono),ui-monospace,monospace] hover:bg-[#5670ff] focus-visible:outline-none active:translate-y-px"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            retry
          </button>
          <Link
            href="/"
            className="group inline-flex h-12 items-center gap-2.5 rounded-[3px] border border-[var(--sage-border-strong)] px-6 text-[13px] uppercase tracking-[0.08em] text-[var(--sage-ink-muted)] transition-colors duration-200 [font-family:var(--font-mono),ui-monospace,monospace] hover:border-[var(--sage-border-hover)] hover:text-[var(--sage-ink)]"
          >
            <Home className="h-3.5 w-3.5" aria-hidden />
            cd ~
          </Link>
          <Link
            href="/contact?subject=error-report"
            className="group inline-flex h-12 items-center gap-2.5 rounded-[3px] border border-[var(--sage-border-strong)] px-6 text-[13px] uppercase tracking-[0.08em] text-[var(--sage-ink-muted)] transition-colors duration-200 [font-family:var(--font-mono),ui-monospace,monospace] hover:border-[var(--sage-border-hover)] hover:text-[var(--sage-ink)]"
          >
            report --bug
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  )
}
