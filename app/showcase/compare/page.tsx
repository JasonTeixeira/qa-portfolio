import Link from 'next/link'
import { ArrowRight, CheckCircle2, Target } from 'lucide-react'
import { prototypes } from '../prototype-catalog'
import styles from '../admin/admin.module.css'

export const metadata = {
  title: 'Prototype Package Comparison | Sage Ideas',
  description: 'Compare Sage Ideas prototype packages by buyer, outcome, workflow, and proof level.',
}

export default function ShowcaseComparePage() {
  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <span className={styles.kicker}>Compare prototype packages</span>
        <h1>Pick the system that matches the buyer outcome.</h1>
        <p>
          This page turns the warehouse into a sales tool. It shows who each prototype is for, what outcome it supports,
          and what a client can ask Sage Ideas to build.
        </p>
      </section>

      <section className={styles.table}>
        {prototypes.map((prototype) => (
          <article key={prototype.slug} className={styles.row}>
            <div>
              <strong>{prototype.name}</strong>
              <span>{prototype.buyer}</span>
            </div>
            <b className={styles.score}>{prototype.proofLevel === 'Verified local' ? 'V' : 'D'}</b>
            <em>{prototype.packageTier}. {prototype.outcome}</em>
            <div className={styles.links}>
              <Link href={prototype.slug === 'revenue-os' ? '/showcase/revenue-os' : `/showcase/${prototype.slug}`}>
                <Target size={14} /> Demo
              </Link>
              <Link href={`/showcase/private/${prototype.slug}`}>
                <CheckCircle2 size={14} /> Packet
              </Link>
              <Link href={`/showcase/admin/${prototype.slug}`}>
                Audit <ArrowRight size={14} />
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
