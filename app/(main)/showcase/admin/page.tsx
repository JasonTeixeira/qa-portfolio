import Link from 'next/link'
import { ArrowRight, CheckCircle2, Eye, Gauge, ShieldCheck } from 'lucide-react'
import { prototypeProof, verificationSnapshot } from '../proof-data'
import styles from './admin.module.css'

export const metadata = {
  title: 'Prototype Warehouse Admin | Sage Ideas',
  robots: { index: false, follow: false },
}

export default function ShowcaseAdminPage() {
  const averageScore = Math.round(prototypeProof.reduce((sum, item) => sum + item.score, 0) / prototypeProof.length)

  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <span className={styles.kicker}>Prototype warehouse control</span>
        <h1>Admin proof board for every showcase asset.</h1>
        <p>
          This is the internal operating view for inbound packets, public prototypes, proof status, and known gaps.
          Scores here are conservative and tied to local verification.
        </p>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}><span>Average score</span><strong>{averageScore}</strong></div>
        <div className={styles.card}><span>Prototype routes</span><strong>{prototypeProof.length}</strong></div>
        <div className={styles.card}><span>E2E proof</span><strong>3</strong></div>
        <div className={styles.card}><span>Axe violations</span><strong>0</strong></div>
      </section>

      <section className={styles.table}>
        {prototypeProof.map((item) => (
          <article key={item.slug} className={styles.row}>
            <div>
              <strong>{item.name}</strong>
              <span>{item.route}</span>
            </div>
            <b className={styles.score}>{item.score}</b>
            <em>{item.gaps[0]}</em>
            <div className={styles.links}>
              <Link href={item.route}><Eye size={14} /> Demo</Link>
              <Link href={item.previewRoute}><ShieldCheck size={14} /> Preview</Link>
              <Link href={item.auditRoute}><Gauge size={14} /> Audit <ArrowRight size={14} /></Link>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.panel}>
        <strong>Last verification snapshot: {verificationSnapshot.lastVerified}</strong>
        <ul>
          {verificationSnapshot.results.map((result) => (
            <li key={result.label}><CheckCircle2 size={14} /> {result.label}: {result.value}. {result.detail}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
