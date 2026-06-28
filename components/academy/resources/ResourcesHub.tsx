import Link from 'next/link'
import { Course00 } from '@/components/academy/onboarding/Course00'
import { Icon, type IconName } from '@/components/academy/ui/Icon'
import styles from './resources.module.css'

type Tool = { icon: IconName; name: string; body: string; href: string; cta: string; live: boolean }

const TOOLS: Tool[] = [
  { icon: 'bolt', name: 'In-browser code lab', body: 'A real Python runtime in the page. Write, run, and test code with zero setup — the same lab your sprints use.', href: '/academy/engine/lab', cta: 'Open the lab', live: true },
  { icon: 'play', name: 'Sprint walkthrough', body: 'Step through a complete sprint and see the full mastery loop — pretest, build, debug, verify, unlock.', href: '/academy/engine', cta: 'Walk a sprint', live: true },
  { icon: 'compass', name: 'Path builder', body: 'Assemble your own ordered track from the courses and labs you care about.', href: '/academy/build', cta: 'Build a path', live: true },
]

type Resource = { icon: IconName; name: string; body: string; href?: string }

const RESOURCES: Resource[] = [
  { icon: 'refresh', name: 'The 17-step Sprint Loop', body: 'The full Sage Learning Engine loop on one page — print it, pin it, run every sprint by it.', href: '/academy/resources/sprint-loop' },
  { icon: 'target', name: 'Weakness-to-repair map', body: 'Every failure label and its exact repair path. Rolling out.' },
  { icon: 'book', name: 'Calibration bank', body: 'Weak / passing / excellent examples for every key artifact. Rolling out.' },
]

export function ResourcesHub() {
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <span className={styles.kicker}>Tools &amp; resources</span>
        <h1 className={styles.title}>Everything you need, in the page.</h1>
        <p className={styles.sub}>The same tools that power the sprints — plus printable references built from the learning engine itself.</p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.h2}>Tools</h2>
        <div className={styles.grid}>
          {TOOLS.map((t) => (
            <Link key={t.name} href={t.href} className={styles.card}>
              <span className={styles.cardGlyph} aria-hidden="true"><Icon name={t.icon} size={20} /></span>
              <h3 className={styles.cardName}>{t.name}</h3>
              <p className={styles.cardBody}>{t.body}</p>
              <span className={styles.cardCta}>{t.cta} <Icon name="arrow-right" size={14} aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>References &amp; cheat-sheets</h2>
        <div className={styles.grid}>
          {RESOURCES.map((r) =>
            r.href ? (
              <Link key={r.name} href={r.href} className={styles.card} data-resource="true">
                <span className={styles.cardGlyph} aria-hidden="true"><Icon name={r.icon} size={20} /></span>
                <h3 className={styles.cardName}>{r.name}</h3>
                <p className={styles.cardBody}>{r.body}</p>
                <span className={styles.cardCta}>Open · print to PDF <Icon name="arrow-right" size={14} aria-hidden="true" /></span>
              </Link>
            ) : (
              <div key={r.name} className={styles.card} data-soon="true">
                <span className={styles.cardGlyph} aria-hidden="true"><Icon name={r.icon} size={20} /></span>
                <h3 className={styles.cardName}>{r.name}</h3>
                <p className={styles.cardBody}>{r.body}</p>
                <span className={styles.soon}>Rolling out</span>
              </div>
            ),
          )}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>The method</h2>
        <Course00 />
      </section>
    </div>
  )
}
