import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, LockKeyhole, Mail } from 'lucide-react'
import { getPrototype, prototypes } from '../../prototype-catalog'
import styles from './private-demo.module.css'

export function generateStaticParams() {
  return prototypes.map((prototype) => ({ slug: prototype.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const prototype = getPrototype(slug)

  return {
    title: prototype ? `Private Demo Packet | ${prototype.name}` : 'Private Demo Packet',
    robots: { index: false, follow: false },
  }
}

export default async function PrivateDemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const prototype = getPrototype(slug)

  if (!prototype) {
    notFound()
  }

  return (
    <div className={styles.shell}>
      <section className={styles.packet}>
        <div className={styles.badge}><LockKeyhole size={15} /> Private demo packet</div>
        <h1>{prototype.name} customized for a high-fit prospect.</h1>
        <p>
          This route is the outbound-ready version of the prototype: business diagnosis, matched system, proof angle,
          short email, and the next action a prospect can take.
        </p>

        <div className={styles.grid}>
          <article>
            <span>Observed gap</span>
            <strong>{prototype.outcome}</strong>
          </article>
          <article>
            <span>Matched system</span>
            <strong>{prototype.headline}</strong>
          </article>
          <article>
            <span>Personalization slots</span>
            <ul>
              {prototype.personalization.slice(0, 5).map((item) => (
                <li key={item}><CheckCircle2 size={14} /> {item}</li>
              ))}
            </ul>
          </article>
          <article>
            <span>Email opener</span>
            <strong>
              I mocked up a quick concept showing how your business could turn more visitors into qualified
              conversations using this {prototype.type.toLowerCase()}.
            </strong>
          </article>
        </div>

        <div className={styles.actions}>
          <Link href={prototype.slug === 'revenue-os' ? '/showcase/revenue-os' : `/showcase/${prototype.slug}`} className={styles.primary}>
            Open public prototype <ArrowRight size={16} />
          </Link>
          <Link href="/book?source=private_demo_packet" className={styles.secondary}>
            <Mail size={16} /> Request this build
          </Link>
        </div>
      </section>
    </div>
  )
}
