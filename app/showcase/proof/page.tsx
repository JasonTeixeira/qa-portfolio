import Link from 'next/link'
import { ArrowRight, CheckCircle2, ClipboardCheck, ShieldCheck, TriangleAlert } from 'lucide-react'
import { prototypeProof, verificationSnapshot } from '../proof-data'
import styles from '../admin/admin.module.css'

export const metadata = {
  title: 'Prototype Proof Wall | Sage Ideas',
  description: 'Verification record for the Sage Ideas interactive prototype warehouse.',
}

export default function ShowcaseProofPage() {
  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <span className={styles.kicker}>Public proof wall</span>
        <h1>What is verified, what is not, and what still needs work.</h1>
        <p>
          This page is the source of truth for prototype readiness. It records local checks that passed and the gaps that
          still prevent inflated 95-99 claims.
        </p>
      </section>

      <section className={styles.grid}>
        {verificationSnapshot.results.map((result) => (
          <div key={result.label} className={styles.card}>
            <span>{result.label}</span>
            <strong>{result.value}</strong>
          </div>
        ))}
      </section>

      <section className={styles.panel}>
        <strong><ClipboardCheck size={16} /> Commands used for the current proof snapshot</strong>
        <ul>
          {verificationSnapshot.commands.map((command) => (
            <li key={command}><CheckCircle2 size={14} /> {command}</li>
          ))}
        </ul>
      </section>

      <section className={styles.table}>
        {prototypeProof.map((item) => (
          <article key={item.slug} className={styles.row}>
            <div>
              <strong>{item.name}</strong>
              <span>{item.route}</span>
            </div>
            <b className={styles.score}>{item.score}</b>
            <em>{item.verified ? 'Local route and interaction proof exists.' : 'Proof incomplete.'}</em>
            <div className={styles.links}>
              <Link href={item.route}><ShieldCheck size={14} /> Demo</Link>
              <Link href={item.auditRoute}>Audit <ArrowRight size={14} /></Link>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.panel}>
        <strong><TriangleAlert size={16} /> What is not proven yet</strong>
        <ul>
          <li><TriangleAlert size={14} /> Deployed preview QA is not captured in this snapshot.</li>
          <li><TriangleAlert size={14} /> Non-Revenue prototypes need deeper bespoke design passes.</li>
          <li><TriangleAlert size={14} /> Figma Make is linked as a source artifact, not reliably embedded inline.</li>
        </ul>
      </section>
    </div>
  )
}
