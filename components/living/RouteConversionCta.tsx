import Link from 'next/link'

type RouteConversionCtaProps = {
  eyebrow?: string
  title: string
  body: string
  primary: { label: string; href: string }
  secondary?: { label: string; href: string }
  proof?: Array<{ label: string; value: string }>
  /** Kept for caller compatibility; the rainbow overlay was removed (reserved-electric only). */
  variant?: 'studio' | 'academy' | 'growth' | 'systems'
}

const displayStyle = {
  fontFamily: 'var(--font-display)',
  letterSpacing: '-0.03em',
  lineHeight: 0.96,
} as const

export function RouteConversionCta({
  eyebrow = 'next route',
  title,
  body,
  primary,
  secondary,
  proof = [
    { label: 'diagnostic', value: '04 questions' },
    { label: 'route', value: 'studio / academy' },
    { label: 'claim', value: 'honest' },
  ],
}: RouteConversionCtaProps) {
  return (
    <section className="border-t border-[var(--sage-border)] px-5 py-16 sm:px-8 lg:px-12">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[18px] border border-[var(--sage-border)] bg-[rgba(20,20,24,0.62)] p-6 sm:p-10 lg:p-12">
        {/* reserved electric glow — replaces the old off-palette overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-1/4 h-[460px] w-[600px] rounded-full opacity-70"
          style={{ background: 'radial-gradient(circle, rgba(61,90,254,0.15), transparent 70%)' }}
        />
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.52fr)] lg:items-center">
          {/* left — message + routes */}
          <div>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              {eyebrow}
            </p>
            <h2
              className="max-w-[14ch] text-[clamp(2.4rem,_1.2rem_+_4.2vw,_5rem)] font-extrabold text-[var(--sage-ink)]"
              style={displayStyle}
            >
              {title}
            </h2>
            <p className="mt-7 max-w-[54ch] text-base leading-7 text-[var(--sage-ink-muted)] sm:text-lg">
              {body}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={primary.href}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--sage-accent)] px-6 text-sm font-semibold text-white transition hover:bg-[#5670ff]"
              >
                {primary.label}
                <span aria-hidden className="ml-1.5">→</span>
              </Link>
              {secondary ? (
                <Link
                  href={secondary.href}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--sage-border-strong)] bg-[rgba(11,11,14,0.38)] px-6 text-sm font-semibold text-[var(--sage-ink)] transition hover:border-[var(--sage-accent)]"
                >
                  {secondary.label}
                  <span aria-hidden className="ml-1.5">→</span>
                </Link>
              ) : null}
            </div>
          </div>

          {/* right — console-style proof readout */}
          <div className="relative overflow-hidden rounded-[14px] border border-[var(--sage-border)] bg-[rgba(11,11,14,0.5)]">
            <span aria-hidden className="absolute left-0 top-0 h-full w-[3px] bg-[var(--sage-accent)]" />
            <p className="px-6 pt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
              // the honest version
            </p>
            <dl className="px-6 pb-6">
              {proof.map((item, i) => (
                <div
                  key={item.label}
                  className={i > 0 ? 'mt-4 border-t border-[var(--sage-border)] pt-4' : 'pt-4'}
                >
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
                    {item.label}
                  </dt>
                  <dd
                    className="mt-1.5 text-[1.7rem] font-bold text-[var(--sage-ink)]"
                    style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
                  >
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
