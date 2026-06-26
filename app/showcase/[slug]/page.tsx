import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, MonitorPlay, Target } from 'lucide-react'
import { PrototypePlayground } from './prototype-playground'
import { getPrototype, prototypes } from '../prototype-catalog'
import styles from './prototype-detail.module.css'
import { JsonLd } from '@/components/json-ld'

const SITE = 'https://www.sageideas.dev'

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
    alternates: { canonical: `${SITE}/showcase/${prototype.slug}` },
    openGraph: {
      title: `${prototype.name} Prototype | Sage Ideas`,
      description: prototype.outcome,
      url: `${SITE}/showcase/${prototype.slug}`,
      images: [`/og?title=${encodeURIComponent(prototype.name)}&subtitle=${encodeURIComponent(prototype.type)}`],
    },
  }
}

export default async function PrototypeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const prototype = getPrototype(slug)

  if (!prototype || prototype.slug === 'revenue-os') {
    notFound()
  }

  return (
    <div className={styles.shell}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: `${prototype.name} prototype`,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          url: `${SITE}/showcase/${prototype.slug}`,
          description: prototype.outcome,
          offers: {
            '@type': 'Offer',
            category: prototype.packageTier,
            availability: 'https://schema.org/InStock',
          },
          provider: {
            '@type': 'Organization',
            name: 'Sage Ideas',
            url: SITE,
          },
        }}
      />
      <section className={styles.hero}>
        <span className={styles.kicker}>{prototype.status}</span>
        <h1>{prototype.headline}</h1>
        <p>{prototype.narrative}</p>
        <div className={styles.actions}>
          <Link href="#live-prototype" className={styles.primary}>
            Open live prototype <ArrowRight size={16} />
          </Link>
          <Link href={`/book?source=${prototype.slug}_showcase`} className={styles.secondary}>
            Build this for my business
          </Link>
        </div>
      </section>

      <section className={styles.storyStrip} aria-label={`${prototype.name} buyer story`}>
        <article>
          <span className={styles.kicker}>The leak</span>
          <strong>{prototype.buyer}</strong>
          <p>{prototype.workflow[0]?.detail}</p>
        </article>
        <article>
          <span className={styles.kicker}>The system</span>
          <strong>{prototype.name}</strong>
          <p>{prototype.workflow[1]?.detail}</p>
        </article>
        <article>
          <span className={styles.kicker}>The outcome</span>
          <strong>{prototype.metrics[0]?.value} signal</strong>
          <p>{prototype.outcome}</p>
        </article>
      </section>

      {prototype.visual ? <VisualStoryDiagram prototype={prototype} /> : null}

      <PrototypePlayground prototype={prototype} />

      <section className={styles.metrics}>
        {prototype.metrics.map((metric) => (
          <div key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <em>{metric.note}</em>
          </div>
        ))}
      </section>

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

      <section className={styles.finalCta} aria-label={`${prototype.name} build call`}>
        <div>
          <span className={styles.kicker}>Build it around your buyers</span>
          <h2>Want this working around your real offer?</h2>
          <p>
            Bring your market, current site, and the leads you want more of. Sage Ideas maps the buyer path,
            proof assets, handoff states, and build scope around the way your customers actually decide.
          </p>
        </div>
        <div className={styles.actions}>
          <Link href={`/book?source=${prototype.slug}_final_cta`} className={styles.primary}>
            Book the build call <ArrowRight size={16} />
          </Link>
          <Link href="/showcase" className={styles.secondary}>
            View all prototypes
          </Link>
        </div>
      </section>
    </div>
  )
}

function VisualStoryDiagram({ prototype }: { prototype: NonNullable<ReturnType<typeof getPrototype>> }) {
  const visual = prototype.visual
  if (!visual) return null

  return (
    <section
      className={`${styles.visualStory} ${styles[`visual-${visual.theme}`]}`}
      aria-labelledby={`${prototype.slug}-visual-heading`}
    >
      <div className={styles.visualHeader}>
        <div>
          <span className={styles.kicker}>{visual.eyebrow}</span>
          <h2 id={`${prototype.slug}-visual-heading`}>{visual.headline}</h2>
        </div>
        <p>{visual.lede}</p>
      </div>

      <div className={styles.visualDiagram}>
        <div className={styles.visualColumn}>
          <span>{visual.inputLabel}</span>
          {visual.inputs.map((item) => (
            <div className={styles.visualNode} key={item}>
              {item}
            </div>
          ))}
        </div>

        <div className={styles.visualCore} aria-label={`${prototype.name} system core`}>
          <div className={styles.visualOrbit} aria-hidden />
          <span>{prototype.name}</span>
          <strong>{visual.core}</strong>
          <em>{prototype.packageTier}</em>
        </div>

        <div className={styles.visualColumn}>
          <span>{visual.outputLabel}</span>
          {visual.outputs.map((item) => (
            <div className={styles.visualNode} key={item}>
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.visualResult}>
        <strong>{visual.result}</strong>
        <Link href="#live-prototype">
          Open the clickable workflow <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}
