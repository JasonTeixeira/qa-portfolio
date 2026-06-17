import Link from 'next/link'
import type { ReactNode } from 'react'
import styles from './LivingPageSystem.module.css'

type Stat = {
  label: string
  value: string
}

type Step = {
  label: string
  detail: string
}

type LivingPageShellProps = {
  children: ReactNode
  className?: string
}

type LivingHeroProps = {
  eyebrow: string
  title: ReactNode
  lede: ReactNode
  panel?: ReactNode
  proof?: Stat[]
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  actions?: ReactNode
}

type LivingSectionProps = {
  eyebrow?: string
  title?: ReactNode
  lede?: ReactNode
  children: ReactNode
  className?: string
  id?: string
}

type SystemHeroPanelProps = {
  eyebrow: string
  title: string
  nodes?: string[]
  stats?: Stat[]
}

const defaultNodes = ['Surface', 'Data', 'AI', 'Ops']

export function LivingPageShell({ children, className = '' }: LivingPageShellProps) {
  return (
    <main className={`min-h-screen overflow-hidden bg-[var(--sage-bg)] text-[var(--sage-ink)] ${className}`}>
      {children}
    </main>
  )
}

export function LivingCTA({
  href,
  children,
  variant = 'primary',
  className = '',
}: {
  href: string
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'text'
  className?: string
}) {
  const base =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage-accent)]'
  const variants = {
    primary: 'bg-[var(--sage-accent)] text-white hover:bg-[#5670ff]',
    secondary:
      'border border-[var(--sage-border-strong)] bg-[rgba(20,20,24,0.58)] text-[var(--sage-ink)] hover:border-[var(--sage-accent)]',
    text:
      'min-h-0 rounded-none px-0 font-mono text-xs uppercase tracking-[0.12em] text-[var(--sage-accent-readable)] hover:text-[var(--sage-ink)]',
  }

  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
      <span aria-hidden>-&gt;</span>
    </Link>
  )
}

export function LivingHero({
  eyebrow,
  title,
  lede,
  panel,
  proof,
  primaryCta,
  secondaryCta,
  actions,
}: LivingHeroProps) {
  return (
    <section className="border-b border-[var(--sage-border)] px-5 pb-16 pt-28 sm:px-8 lg:px-12 lg:pb-24 lg:pt-36">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-end">
          <div>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              {eyebrow}
            </p>
            <h1
              className="max-w-[11ch] text-[clamp(3.2rem,_1.2rem_+_8vw,_7.6rem)] font-extrabold"
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.03em',
                lineHeight: 0.98,
              }}
            >
              {title}
            </h1>
            <p className="mt-8 max-w-[62ch] text-lg leading-[1.6] text-[var(--sage-ink-muted)] sm:text-xl">
              {lede}
            </p>
            {actions ? (
              <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
            ) : primaryCta || secondaryCta ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {primaryCta ? <LivingCTA href={primaryCta.href}>{primaryCta.label}</LivingCTA> : null}
                {secondaryCta ? (
                  <LivingCTA href={secondaryCta.href} variant="secondary">
                    {secondaryCta.label}
                  </LivingCTA>
                ) : null}
              </div>
            ) : null}
          </div>
          {panel ?? null}
        </div>

        {proof ? (
          <div className="mt-12">
            <LivingProofStrip items={proof} />
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function LivingSection({
  eyebrow,
  title,
  lede,
  children,
  className = '',
  id,
}: LivingSectionProps) {
  return (
    <section id={id} className={`border-b border-[var(--sage-border)] px-5 py-16 sm:px-8 lg:px-12 ${className}`}>
      <div className="mx-auto max-w-7xl">
        {eyebrow || title || lede ? (
          <div className="mb-10 max-w-3xl">
            {eyebrow ? (
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2
                className="text-[clamp(2.3rem,_1.2rem_+_4vw,_5rem)] font-extrabold text-[var(--sage-ink)]"
                style={{
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.03em',
                  lineHeight: 0.98,
                }}
              >
                {title}
              </h2>
            ) : null}
            {lede ? (
              <p className="mt-5 text-base leading-7 text-[var(--sage-ink-muted)] sm:text-lg">
                {lede}
              </p>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  )
}

export function SystemHeroPanel({
  eyebrow,
  title,
  nodes = defaultNodes,
  stats = [
    { label: 'visible by default', value: 'PE' },
    { label: 'native scroll', value: '0 hijack' },
    { label: 'proof first', value: 'real' },
  ],
}: SystemHeroPanelProps) {
  const paddedNodes = [...nodes, ...defaultNodes].slice(0, 4)

  return (
    <aside className={`${styles.systemPanel} min-h-[360px] p-5 sm:p-6`} aria-label={title}>
      <div className={styles.scan} aria-hidden />
      <div className="relative z-10 flex h-full min-h-[320px] flex-col justify-between">
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--sage-accent-readable)]">
            {eyebrow}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
            Surface ⇄ System
          </p>
        </div>

        <svg
          className="my-8 h-[190px] w-full overflow-visible"
          viewBox="0 0 650 300"
          role="img"
          aria-label="Animated system architecture diagram"
        >
          <defs>
            <linearGradient id="living-line" x1="0" x2="1" y1="0" y2="0">
              <stop stopColor="#3D5AFE" offset="0%" />
              <stop stopColor="#7C3AED" offset="52%" />
              <stop stopColor="#FF2D9B" offset="100%" />
            </linearGradient>
          </defs>
          <path
            className={styles.draw}
            d="M 70 180 C 146 76, 236 76, 318 148 S 468 252, 584 118"
            fill="none"
            stroke="url(#living-line)"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <path
            className={`${styles.draw} ${styles.drawTwo}`}
            d="M 90 230 C 210 160, 316 196, 408 116 S 530 84, 596 164"
            fill="none"
            stroke="rgba(242,239,233,0.18)"
            strokeLinecap="round"
            strokeWidth="1"
          />
          <path
            className={`${styles.draw} ${styles.drawThree}`}
            d="M 84 94 C 194 144, 258 224, 390 210 S 528 178, 596 216"
            fill="none"
            stroke="rgba(242,239,233,0.14)"
            strokeLinecap="round"
            strokeWidth="1"
          />
          <circle className={styles.packet} r="5" fill="#FF2D9B" />
          <circle className={`${styles.packet} ${styles.packetTwo}`} r="4" fill="#3D5AFE" />
          {[
            [70, 180],
            [246, 94],
            [404, 204],
            [584, 118],
          ].map(([x, y], index) => (
            <g key={`${x}-${y}`} className={index % 2 ? styles.floatTwo : styles.float}>
              <circle cx={x} cy={y} r="24" fill="rgba(61,90,254,0.04)" />
              <circle cx={x} cy={y} r="8" fill="#0B0B0E" stroke="url(#living-line)" strokeWidth="2" />
              <text
                x={x}
                y={y + 48}
                fill="#8A8A94"
                fontFamily="var(--font-mono)"
                fontSize="11"
                textAnchor="middle"
                letterSpacing="1.6"
              >
                {paddedNodes[index]}
              </text>
            </g>
          ))}
        </svg>

        <dl className="grid grid-cols-3 gap-px bg-[var(--sage-border)]">
          {stats.map((stat) => (
            <div className="bg-[rgba(11,11,14,0.72)] p-3" key={stat.label}>
              <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
                {stat.label}
              </dt>
              <dd className="mt-2 font-mono text-sm text-[var(--sage-ink)]">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  )
}

export function MotionProofStrip({ items }: { items: Stat[] }) {
  return (
    <div className="grid gap-px bg-[var(--sage-border)] sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div className={`${styles.proofCard} p-5`} key={item.label}>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
            {item.label}
          </p>
          <p className="mt-4 text-2xl font-semibold leading-none text-[var(--sage-ink)] sm:text-3xl">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}

export const LivingProofStrip = MotionProofStrip

export function LivingDiagram(props: SystemHeroPanelProps) {
  return <SystemHeroPanel {...props} />
}

export function SurfaceSystemPanel({
  title,
  body,
  steps,
  cta,
}: {
  title: string
  body: string
  steps: Step[]
  cta?: { label: string; href: string }
}) {
  return (
    <section className="grid gap-px bg-[var(--sage-border)] lg:grid-cols-[0.9fr_1.1fr]">
      <div className={`${styles.systemPanel} min-h-[360px] p-6`}>
        <div className={styles.scan} aria-hidden />
        <div className="relative z-10">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
            Living architecture
          </p>
          <h2
            className="mt-8 max-w-[11ch] text-[clamp(2.4rem,_1.2rem_+_4vw,_5rem)] font-extrabold text-[var(--sage-ink)]"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 0.98 }}
          >
            {title}
          </h2>
          <p className="mt-6 max-w-[46ch] text-sm leading-7 text-[var(--sage-ink-muted)]">
            {body}
          </p>
          {cta ? (
            <Link
              className="mt-8 inline-flex min-h-11 items-center rounded-full bg-[var(--sage-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[#5670ff]"
              href={cta.href}
            >
              {cta.label}<span aria-hidden className="ml-1">→</span>
            </Link>
          ) : null}
        </div>
      </div>
      <ol className="grid gap-px bg-[var(--sage-border)]">
        {steps.map((step, index) => (
          <li className="grid gap-4 bg-[var(--sage-surface-1)] p-5 sm:grid-cols-[auto_1fr]" key={step.label}>
            <span className="font-mono text-xs text-[var(--sage-accent-readable)]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>
              <span className="block text-lg font-semibold text-[var(--sage-ink)]">{step.label}</span>
              <span className="mt-2 block text-sm leading-6 text-[var(--sage-ink-muted)]">{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function ConversionMap({ steps }: { steps: Step[] }) {
  return (
    <ol className="grid gap-px bg-[var(--sage-border)] md:grid-cols-2 xl:grid-cols-4">
      {steps.map((step, index) => (
        <li className={`${styles.proofCard} min-h-[210px] p-5`} key={step.label}>
          <p className="font-mono text-xs text-[var(--sage-accent-readable)]">
            {String(index + 1).padStart(2, '0')}
          </p>
          <h3 className="mt-8 text-xl font-semibold text-[var(--sage-ink)]">{step.label}</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--sage-ink-muted)]">{step.detail}</p>
        </li>
      ))}
    </ol>
  )
}
