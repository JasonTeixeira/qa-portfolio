'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { ArrowRight, Home, RotateCcw } from 'lucide-react'
import { reportError } from '@/components/client-error-reporter'

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
    <div className="min-h-[80vh] bg-[#09090B] flex items-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E85D3A]/10 border border-[#E85D3A]/30 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E85D3A] animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#E85D3A]">
            exit 1 · unhandled exception
          </span>
        </div>
        <div className="font-mono text-[11px] leading-relaxed text-[#78716C] mb-6 space-y-0.5">
          <div><span className="text-[#0ED3CF]">$</span> render(page)</div>
          <div className="text-[#E85D3A]">Error: runtime exception</div>
          <div>at server.tsx:?:?</div>
          <div>x-sage-status: logged · alert sent</div>
        </div>
        <h1 className="text-6xl sm:text-7xl font-normal text-[#FAFAFA] leading-none tracking-tight">
          Something broke.
        </h1>
        <p className="mt-6 text-lg text-[#A8A29E] leading-relaxed max-w-xl">
          The server threw. We were paged. If you hit retry and it still fails, send the digest below to
          {' '}<a href="mailto:sage@sageideas.dev" className="text-[#0ED3CF] hover:text-[#33EBE8] underline underline-offset-2">sage@sageideas.dev</a>
          {' '}— we read every report.
        </p>

        {error.digest && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#2A2826] bg-[#12110F] px-3 py-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]">Digest</span>
            <span className="text-xs font-mono text-[#A8A29E]">{error.digest}</span>
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            onClick={reset}
            className="sage-neon-cta sage-bloom-cyan inline-flex items-center gap-2 bg-[#0ED3CF] hover:bg-[#0AA8A5] text-[#09090B] font-semibold px-5 py-2.5 rounded-md transition-colors [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-wide text-sm"
          >
            <RotateCcw className="h-4 w-4" />
            retry
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-[#2A2826] hover:border-[#3D3A37] text-[#FAFAFA] font-medium px-5 py-2.5 rounded-md transition-colors [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-wide text-sm"
          >
            <Home className="h-4 w-4" />
            cd ~
          </Link>
          <Link
            href="/contact?subject=error-report"
            className="inline-flex items-center gap-2 border border-[#2A2826] hover:border-[#3D3A37] text-[#FAFAFA] font-medium px-5 py-2.5 rounded-md transition-colors [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-wide text-sm"
          >
            report --bug
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
