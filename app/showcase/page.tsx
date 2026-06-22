import Link from 'next/link'
import { ArrowRight, Boxes, MousePointer2, Target } from 'lucide-react'
import { prototypes } from './prototype-catalog'
import styles from './showcase.module.css'

export const metadata = {
  title: 'Interactive Prototype Warehouse | Sage Ideas',
  description: 'A portfolio of interactive AI systems, websites, dashboards, and application prototypes built for business outcomes.',
}

export default function ShowcasePage() {
  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <span className={styles.kicker}>Sage Ideas Prototype Warehouse</span>
        <h1>Interactive systems people can click, understand, and buy.</h1>
        <p>
          A growing library of high-end websites, AI dashboards, mobile app concepts, and business operating systems
          built as reusable portfolio proof and personalized outbound assets.
        </p>
      </section>

      <section className={styles.grid}>
        {prototypes.map((prototype) => (
          <Link
            key={prototype.name}
            href={prototype.slug === 'revenue-os' ? '/showcase/revenue-os' : `/showcase/${prototype.slug}`}
            className={styles.card}
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
        ))}
      </section>
    </div>
  )
}
