import Link from 'next/link'
import { SystemFlowOverlay } from './SystemFlowLayer'

type RouteConversionCtaProps = {
  eyebrow?: string
  title: string
  body: string
  primary: { label: string; href: string }
  secondary?: { label: string; href: string }
  proof?: Array<{ label: string; value: string }>
  variant?: 'studio' | 'academy' | 'growth' | 'systems'
}

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
  variant = 'systems',
}: RouteConversionCtaProps) {
  return (
    <section className="border-t border-[var(--sage-border)] px-5 py-16 sm:px-8 lg:px-12">
      <div className="relative mx-auto grid max-w-7xl overflow-hidden border border-[var(--sage-border)] bg-[rgba(20,20,24,0.62)] lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.62fr)]">
        <SystemFlowOverlay variant={variant} intensity="quiet" />
        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
            {eyebrow}
          </p>
          <h2
            className="max-w-[12ch] text-[clamp(2.45rem,_1.2rem_+_4.2vw,_5.6rem)] font-extrabold text-[var(--sage-ink)]"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 0.98 }}
          >
            {title}
          </h2>
          <p className="mt-6 max-w-[62ch] text-base leading-7 text-[var(--sage-ink-muted)] sm:text-lg">
            {body}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primary.href}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--sage-accent)] px-6 text-sm font-semibold text-white transition hover:bg-[#5670ff]"
            >
              {primary.label}
              <span aria-hidden className="ml-1">
                -&gt;
              </span>
            </Link>
            {secondary ? (
              <Link
                href={secondary.href}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--sage-border-strong)] bg-[rgba(11,11,14,0.38)] px-6 text-sm font-semibold text-[var(--sage-ink)] transition hover:border-[var(--sage-accent)]"
              >
                {secondary.label}
                <span aria-hidden className="ml-1">
                  -&gt;
                </span>
              </Link>
            ) : null}
          </div>
        </div>
        <dl className="relative z-10 grid gap-px border-t border-[var(--sage-border)] bg-[var(--sage-border)] lg:border-l lg:border-t-0">
          {proof.map((item) => (
            <div className="bg-[rgba(11,11,14,0.78)] p-6" key={item.label}>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
                {item.label}
              </dt>
              <dd className="mt-4 text-2xl font-semibold text-[var(--sage-ink)]">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
