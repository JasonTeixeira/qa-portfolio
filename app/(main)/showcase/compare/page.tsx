import Link from 'next/link'
import { ArrowRight, CheckCircle2, ClipboardList, MousePointer2, Target } from 'lucide-react'
import { prototypes } from '../prototype-catalog'
import styles from '../showcase-decision.module.css'

export const metadata = {
  title: 'Compare Interactive Business Systems | Sage Ideas',
  description: 'Compare Sage Ideas prototype systems by buyer problem, business outcome, proof level, and the build path that fits your market.',
}

const buyerRoutes = [
  {
    label: 'I need more qualified leads',
    system: 'Revenue OS',
    href: '/showcase/revenue-os',
    detail: 'Best when leads, replies, follow-ups, and outbound work are scattered.',
  },
  {
    label: 'I need better quote requests',
    system: 'Contractor Quote Engine',
    href: '/showcase/contractor-quote-engine',
    detail: 'Best when service visitors need a clearer quote path and faster handoff.',
  },
  {
    label: 'I need cleaner intake',
    system: 'Law Firm Intake System',
    href: '/showcase/law-firm-intake-system',
    detail: 'Best when trust, qualification, urgency, and next steps need structure.',
  },
  {
    label: 'I need support under control',
    system: 'AI Support Agent Dashboard',
    href: '/showcase/ai-support-agent-dashboard',
    detail: 'Best when automation needs visibility, escalation, and quality control.',
  },
]

export default function ShowcaseComparePage() {
  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>Compare prototype packages</span>
          <h1>Find the system your business needs first.</h1>
          <p>
            Start with the leak you recognize. Then open the closest working demo, inspect the flow, and book the build
            call only when the next step is clear.
          </p>
          <div className={styles.heroActions}>
            <Link href="/showcase/revenue-os" className={styles.primary}>
              Open flagship demo <MousePointer2 size={16} />
            </Link>
            <Link href="/book?source=showcase_compare" className={styles.secondary}>
              Map my system <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <aside className={styles.heroPanel} aria-label="Comparison summary">
          <div className={styles.heroPanelInner}>
            <span className={styles.microLabel}>Decision shortcut</span>
            <div className={styles.metricStack}>
              <div>
                <span>Systems to inspect</span>
                <strong>{prototypes.length}</strong>
              </div>
              <div>
                <span>Flagship demos</span>
                <strong>2</strong>
              </div>
              <div>
                <span>Next action</span>
                <strong>open</strong>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className={styles.decisionGrid} aria-label="Buyer decision paths">
        {buyerRoutes.map((route) => (
          <article key={route.label} className={styles.decisionCard}>
            <span className={styles.microLabel}>{route.label}</span>
            <h2>{route.system}</h2>
            <p>{route.detail}</p>
            <Link href={route.href} className={styles.smallLink}>
              Open this system <ArrowRight size={15} />
            </Link>
          </article>
        ))}
      </section>

      <section className={styles.systemRail} aria-label="All prototype systems compared">
        {prototypes.map((prototype) => (
          <article key={prototype.slug} className={styles.systemCard}>
            <div>
              <div className={styles.systemTop}>
                <span className={styles.microLabel}>{prototype.category}</span>
                <b className={styles.statusBadge} data-tone={prototype.proofLevel === 'Verified local' ? 'green' : 'blue'}>
                  {prototype.proofLevel === 'Verified local' ? 'Live' : 'Build'}
                </b>
              </div>
              <h2>{prototype.name}</h2>
              <div className={styles.fitList}>
                <span>{prototype.packageTier}</span>
                <span>{prototype.type}</span>
              </div>
            </div>
            <div>
              <span className={styles.microLabel}>Best fit</span>
              <p>{prototype.buyer}</p>
              <span className={styles.microLabel}>Business outcome</span>
              <p>{prototype.outcome}</p>
            </div>
            <div>
              <ul className={styles.proofList}>
                <li><CheckCircle2 size={15} /><span>{prototype.proofLevel}</span></li>
                <li><ClipboardList size={15} /><span>{prototype.workflow.length} workflow states</span></li>
                <li><Target size={15} /><span>{prototype.metrics[0]?.value} {prototype.metrics[0]?.label.toLowerCase()}</span></li>
              </ul>
              <div className={styles.rowActions}>
                <Link
                  href={prototype.slug === 'revenue-os' ? '/showcase/revenue-os' : `/showcase/${prototype.slug}`}
                  className={styles.smallLink}
                >
                  Open demo
                </Link>
                <Link href={`/book?source=compare_${prototype.slug}`} className={styles.smallLink}>
                  Build this <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.finalCta} aria-label="Comparison call to action">
        <div className={styles.finalInner}>
          <div>
            <span className={styles.microLabel}>Still not sure</span>
            <h2>Bring the problem. We will choose the system on the call.</h2>
            <p>
              You do not need to know the technical shape yet. Bring the business leak, the current page, and the buyer
              action you want more of.
            </p>
          </div>
          <div className={styles.finalActions}>
            <Link href="/showcase/proof" className={styles.secondary}>
              View proof wall
            </Link>
            <Link href="/book?source=showcase_compare_final" className={styles.primary}>
              Book the build call <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
