import Link from 'next/link'
import styles from './resources.module.css'

type Tool = { glyph: string; name: string; body: string; href: string; cta: string; live: boolean }

const TOOLS: Tool[] = [
  { glyph: '⬢', name: 'In-browser code lab', body: 'A real Python runtime in the page. Write, run, and test code with zero setup — the same lab your sprints use.', href: '/academy/engine/lab', cta: 'Open the lab', live: true },
  { glyph: '◍', name: 'Sprint walkthrough', body: 'Step through a complete sprint and see the full mastery loop — pretest, build, debug, verify, unlock.', href: '/academy/engine', cta: 'Walk a sprint', live: true },
  { glyph: '⬡', name: 'Path builder', body: 'Assemble your own ordered track from the courses and labs you care about.', href: '/academy/build', cta: 'Build a path', live: true },
]

type Resource = { glyph: string; name: string; body: string; href?: string }

const RESOURCES: Resource[] = [
  { glyph: '↻', name: 'The 17-step Sprint Loop', body: 'The full Sage Learning Engine loop on one page — print it, pin it, run every sprint by it.', href: '/academy/resources/sprint-loop' },
  { glyph: '◆', name: 'Weakness → repair map', body: 'Every failure label and its exact repair path. Rolling out.' },
  { glyph: '▥', name: 'Calibration bank', body: 'Weak / passing / excellent examples for every key artifact. Rolling out.' },
]

export function ResourcesHub() {
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <span className={styles.kicker}>⬡ Tools &amp; resources</span>
        <h1 className={styles.title}>Everything you need, in the page.</h1>
        <p className={styles.sub}>The same tools that power the sprints — plus printable references built from the learning engine itself.</p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.h2}>Tools</h2>
        <div className={styles.grid}>
          {TOOLS.map((t) => (
            <Link key={t.name} href={t.href} className={styles.card}>
              <span className={styles.cardGlyph} aria-hidden="true">{t.glyph}</span>
              <h3 className={styles.cardName}>{t.name}</h3>
              <p className={styles.cardBody}>{t.body}</p>
              <span className={styles.cardCta}>{t.cta} →</span>
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
                <span className={styles.cardGlyph} aria-hidden="true">{r.glyph}</span>
                <h3 className={styles.cardName}>{r.name}</h3>
                <p className={styles.cardBody}>{r.body}</p>
                <span className={styles.cardCta}>Open · print to PDF →</span>
              </Link>
            ) : (
              <div key={r.name} className={styles.card} data-soon="true">
                <span className={styles.cardGlyph} aria-hidden="true">{r.glyph}</span>
                <h3 className={styles.cardName}>{r.name}</h3>
                <p className={styles.cardBody}>{r.body}</p>
                <span className={styles.soon}>Rolling out</span>
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  )
}
