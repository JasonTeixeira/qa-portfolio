'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Boxes, CheckCircle2, ClipboardCheck, Eye, Filter, LockKeyhole, MousePointer2, Target } from 'lucide-react'
import { prototypes } from './prototype-catalog'
import styles from './showcase.module.css'

const filters = ['All', 'Acquisition', 'Local Services', 'Healthcare', 'Professional Services', 'AI Operations'] as const

export function ShowcaseIndex() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('All')

  const visiblePrototypes = useMemo(
    () => prototypes.filter((prototype) => activeFilter === 'All' || prototype.category === activeFilter),
    [activeFilter],
  )

  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <span className={styles.kicker}>Sage Ideas Prototype Warehouse</span>
        <h1>Open the system before you buy the build.</h1>
        <p>
          Each demo shows a business problem, the future workflow, and the kind of system Sage Ideas can build around your market.
        </p>
        <div className={styles.heroLinks}>
          <Link href="/showcase/revenue-os"><MousePointer2 size={16} /> Open Revenue OS</Link>
          <Link href="/showcase/proof"><ClipboardCheck size={16} /> View proof wall</Link>
          <Link href="/book?source=showcase_index"><Target size={16} /> Book the build call</Link>
        </div>
      </section>

      <section className={styles.filterBar} aria-label="Prototype category filters">
        <span><Filter size={15} /> Filter</span>
        <div>
          {filters.map((filter) => (
            <button
              key={filter}
              className={activeFilter === filter ? styles.filterActive : ''}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.grid}>
        {visiblePrototypes.map((prototype) => (
          <article key={prototype.name} className={styles.card}>
            <Link
              href={prototype.slug === 'revenue-os' ? '/showcase/revenue-os' : `/showcase/${prototype.slug}`}
              className={styles.cardMain}
            >
              <div className={styles.cardTop}>
                <Boxes size={19} />
                <span>{prototype.status}</span>
              </div>
              <h2>{prototype.name}</h2>
              <p>{prototype.outcome}</p>
              <div className={styles.cardMeta}>
                <span><Target size={14} /> {prototype.type}</span>
                <strong><MousePointer2 size={14} /> Open demo <ArrowRight size={14} /></strong>
              </div>
            </Link>
            <div className={styles.cardActions}>
              <span><CheckCircle2 size={14} /> {prototype.proofLevel}</span>
              <Link href={`/showcase/private/${prototype.slug}`}><LockKeyhole size={14} /> Packet</Link>
              <Link href={`/showcase/private/${prototype.slug}/preview`}><Eye size={14} /> Preview</Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
