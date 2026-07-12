import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, Eye, Mail, ShieldCheck } from 'lucide-react'
import { getPrototype, prototypes } from '../../../prototype-catalog'
import styles from '../private-demo.module.css'

export function generateStaticParams() {
  return prototypes.map((prototype) => ({ slug: prototype.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const prototype = getPrototype(slug)

  return {
    title: prototype ? `Packet Preview | ${prototype.name}` : 'Packet Preview',
    robots: { index: false, follow: false },
  }
}

export default async function PrivateDemoPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const prototype = getPrototype(slug)

  if (!prototype) {
    notFound()
  }

  return (
    <div className={styles.shell}>
      <section className={styles.packet}>
        <div className={styles.badge}><Eye size={15} /> Internal packet preview</div>
        <h1>Review the buyer packet before it is sent.</h1>
        <p>
          This is the QA view for inbound and outbound. It checks the message, proof angle, personalization slots, and
          destination links before a prospect sees the private packet.
        </p>

        <div className={styles.grid}>
          <article>
            <span>Prospect promise</span>
            <strong>{prototype.outcome}</strong>
          </article>
          <article>
            <span>Send readiness</span>
            <strong>Draft approved only after demo, proof, and CTA are checked.</strong>
          </article>
          <article>
            <span>QA checklist</span>
            <ul>
              <li><CheckCircle2 size={14} /> Public prototype route opens</li>
              <li><CheckCircle2 size={14} /> Private packet route opens</li>
              <li><CheckCircle2 size={14} /> Personalization slots are visible</li>
              <li><ShieldCheck size={14} /> Claims stay within safe language</li>
            </ul>
          </article>
          <article>
            <span>Outbound email draft</span>
            <strong>
              I made a quick private concept for your business showing how this {prototype.type.toLowerCase()} could
              turn more attention into qualified conversations.
            </strong>
          </article>
        </div>

        <div className={styles.actions}>
          <Link href={`/showcase/private/${prototype.slug}`} className={styles.primary}>
            Open prospect packet <ArrowRight size={16} />
          </Link>
          <Link href={prototype.slug === 'revenue-os' ? '/showcase/revenue-os' : `/showcase/${prototype.slug}`} className={styles.secondary}>
            <Mail size={16} /> Inspect public demo
          </Link>
        </div>
      </section>
    </div>
  )
}
