import type { Metadata } from 'next'
import Link from 'next/link'
import { LOOP, INTENSITIES } from '@/lib/academy/engine'
import { Icon } from '@/components/academy/ui/Icon'
import { PrintButton } from './PrintButton'
import styles from './reference.module.css'

export const metadata: Metadata = {
  title: 'The Sprint Loop — Sage Academy reference',
  robots: { index: false, follow: false },
}

export default function SprintLoopReference() {
  return (
    <div className={styles.sheet}>
      <div className={styles.toolbar}>
        <Link href="/academy/resources" className={styles.back}>
          <Icon name="arrow-left" size={15} aria-hidden="true" /> Resources
        </Link>
        <PrintButton />
      </div>

      <article className={styles.doc}>
        <header className={styles.docHead}>
          <span className={styles.brand}>SAGE ACADEMY · REFERENCE</span>
          <h1 className={styles.docTitle}>The Sprint Loop</h1>
          <p className={styles.docSub}>
            The Sage Learning Engine V2 mastery loop. No sprint is complete because it was read — only when
            every step below has been worked, proven, and unlocked.
          </p>
        </header>

        <ol className={styles.loop}>
          {LOOP.map((s) => (
            <li key={s.key} className={styles.step}>
              <span className={styles.stepN} aria-hidden="true">
                {s.step === 0 ? <Icon name="star" size={14} /> : String(s.step).padStart(2, '0')}
              </span>
              <div>
                <span className={styles.stepLabel}>
                  <Icon name={s.glyph} size={15} aria-hidden="true" /> {s.label}
                </span>
                <span className={styles.stepWhy}>{s.why}</span>
              </div>
            </li>
          ))}
        </ol>

        <section className={styles.intensities}>
          <h2 className={styles.h2}>Sprint intensities</h2>
          <table className={styles.table}>
            <tbody>
              {Object.values(INTENSITIES).map((i) => (
                <tr key={i.key}>
                  <td className={styles.iName}>{i.label}</td>
                  <td className={styles.iTime}>{i.time}</td>
                  <td className={styles.iBlurb}>{i.blurb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer className={styles.docFoot}>sageideas.dev/academy · the learning operating system</footer>
      </article>
    </div>
  )
}
