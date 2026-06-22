import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, ClipboardCheck, TriangleAlert } from 'lucide-react'
import { prototypes } from '../../prototype-catalog'
import { prototypeProof, verificationSnapshot } from '../../proof-data'
import styles from '../admin.module.css'

export function generateStaticParams() {
  return prototypes.map((prototype) => ({ slug: prototype.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const proof = prototypeProof.find((item) => item.slug === slug)

  return {
    title: proof ? `${proof.name} Audit | Sage Ideas` : 'Prototype Audit',
    robots: { index: false, follow: false },
  }
}

export default async function PrototypeAuditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const proof = prototypeProof.find((item) => item.slug === slug)

  if (!proof) {
    notFound()
  }

  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <span className={styles.kicker}>Per-prototype audit</span>
        <h1>{proof.name} proof and gap report.</h1>
        <p>
          This page exists to prevent inflated scores. It lists what is implemented, what was verified locally, and what
          still blocks a true 95-99 score.
        </p>
        <div className={styles.links}>
          <Link href={proof.route}>Open public demo <ArrowRight size={14} /></Link>
          <Link href={proof.previewRoute}>Open packet preview <ArrowRight size={14} /></Link>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}><span>Current score</span><strong>{proof.score}</strong></div>
        <div className={styles.card}><span>Route proof</span><strong>{proof.verified ? 'Yes' : 'No'}</strong></div>
        <div className={styles.card}><span>Last verified</span><strong>{verificationSnapshot.lastVerified}</strong></div>
        <div className={styles.card}><span>Blocking gaps</span><strong>{proof.gaps.length}</strong></div>
      </section>

      <section className={styles.panel}>
        <strong><ClipboardCheck size={16} /> Verification checklist</strong>
        <ul>
          {proof.checks.map((check) => (
            <li key={check.label}><CheckCircle2 size={14} /> {check.label}: {check.status}</li>
          ))}
        </ul>
      </section>

      <section className={styles.panel}>
        <strong><TriangleAlert size={16} /> Gaps to close before 95-99</strong>
        <ul>
          {proof.gaps.map((gap) => (
            <li key={gap}><TriangleAlert size={14} /> {gap}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
