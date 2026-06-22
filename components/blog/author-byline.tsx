import Image from 'next/image'
import Link from 'next/link'
import { MonoLabel, Hairline } from '@/components/el'

export function AuthorByline() {
  return (
    <div className="border border-[var(--sage-border)] rounded-[3px] bg-[var(--sage-surface-1)] p-6 sm:p-8">
      <div className="flex items-start gap-5 sm:gap-6">
        <Image
          src="/images/headshot.jpg"
          alt="Jason Teixeira"
          width={56}
          height={56}
          className="h-14 w-14 rounded-full border border-[var(--sage-border-strong)] shrink-0"
        />
        <div className="flex-1 min-w-0">
          <MonoLabel tone="faint" as="div" className="mb-1.5">Written by</MonoLabel>
          <div
            className="text-[var(--sage-ink)] font-normal text-[1.125rem]"
            style={{
              fontFamily: 'var(--font-serif)',
              fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
              letterSpacing: '-0.018em',
            }}
          >
            Jason Teixeira
          </div>
          <div className="text-[13px] text-[var(--sage-ink-muted)] mt-0.5">
            Founder, Sage Ideas Studio · Principal Engineer
          </div>
          <div className="mt-4">
            <Hairline className="mb-4" />
            <Link
              href="/founder"
              className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[var(--sage-ink-faint)] transition-colors hover:text-[var(--sage-accent-readable)] [font-family:var(--font-mono),ui-monospace,monospace]"
            >
              <span>More about Jason</span>
              <span aria-hidden className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
