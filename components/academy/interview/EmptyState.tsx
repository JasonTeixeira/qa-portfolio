import Link from 'next/link'
import styles from './interview.module.css'

type Cta = { href: string; label: string; kind?: 'primary' | 'ghost' }

type Props = {
  /** Mono kicker above the headline (e.g. "Debrief"). */
  kicker: string
  /** Fraunces display headline — the honest first-run line for this surface. */
  title: string
  /** One supporting line. Keep it truthful: what appears here once real data exists. */
  line: string
  ctas?: readonly Cta[]
}

/**
 * The honest first-run placeholder for interview surfaces that have no data yet. NEVER renders
 * fabricated scores, streaks, or history — just a kicker + Fraunces headline + one line telling
 * the learner what will appear here after their first mock. On-brand, not lorem.
 */
export function EmptyState({ kicker, title, line, ctas }: Props) {
  return (
    <div className={styles.placeholder}>
      <span className={styles.kicker}>{kicker}</span>
      <h1 className={styles.placeholderTitle}>{title}</h1>
      <p className={styles.placeholderLine}>{line}</p>
      {ctas && ctas.length > 0 ? (
        <div className={styles.placeholderCtaRow}>
          {ctas.map((cta) => (
            <Link
              key={cta.href + cta.label}
              href={cta.href}
              className={cta.kind === 'ghost' ? styles.ctaGhost : styles.ctaPrimary}
            >
              {cta.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}
