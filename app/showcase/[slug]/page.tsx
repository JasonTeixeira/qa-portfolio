import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, MonitorPlay, Target } from 'lucide-react'
import { PrototypePlayground } from './prototype-playground'
import { getPrototype, prototypes } from '../prototype-catalog'
import styles from './prototype-detail.module.css'

export function generateStaticParams() {
  return prototypes
    .filter((prototype) => prototype.slug !== 'revenue-os')
    .map((prototype) => ({ slug: prototype.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const prototype = getPrototype(slug)

  if (!prototype || prototype.slug === 'revenue-os') {
    return {}
  }

  return {
    title: `${prototype.name} Prototype | Sage Ideas`,
    description: prototype.outcome,
  }
}

export default async function PrototypeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const prototype = getPrototype(slug)

  if (!prototype || prototype.slug === 'revenue-os') {
    notFound()
  }

  return (
    <main className={styles.shell}>
      <section className={styles.hero}>
        <span className={styles.kicker}>{prototype.status}</span>
        <h1>{prototype.headline}</h1>
        <p>{prototype.narrative}</p>
        <div className={styles.actions}>
          <Link href={`/showcase/private/${prototype.slug}`} className={styles.primary}>
            Open personalized packet <ArrowRight size={16} />
          </Link>
          <Link href="/showcase/revenue-os" className={styles.secondary}>
            See the operating system
          </Link>
        </div>
      </section>

      <section className={styles.metrics}>
        {prototype.metrics.map((metric) => (
          <div key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <em>{metric.note}</em>
          </div>
        ))}
      </section>

      <PrototypePlayground prototype={prototype} />

      <section className={styles.workflow}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}>
            <MonitorPlay size={18} />
            <h2>Clickable prototype flow</h2>
          </div>
          <div className={styles.flowGrid}>
            {prototype.workflow.map((item, index) => (
              <article key={item.step}>
                <b>{String(index + 1).padStart(2, '0')}</b>
                <h3>{item.step}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>
            <Target size={18} />
            <h2>Personalization hooks</h2>
          </div>
          <ul className={styles.list}>
            {prototype.personalization.map((item) => (
              <li key={item}><CheckCircle2 size={15} /> {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.screens}>
        <span className={styles.kicker}>Screens included</span>
        <div>
          {prototype.screens.map((screen) => (
            <span key={screen}>{screen}</span>
          ))}
        </div>
      </section>
    </main>
  )
}
