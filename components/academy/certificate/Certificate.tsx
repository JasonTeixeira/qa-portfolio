import type { CSSProperties } from 'react'
import { topic } from '@/lib/academy/topics'
import type { CertificateView } from '@/lib/academy/learner'
import styles from './certificate.module.css'

const cap = (s: string) =>
  s.split(/[\s.]+/).map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(' ')

export function Certificate({ cert }: { cert: CertificateView }) {
  const t = topic(cert.topic)
  const date = new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const rootStyle = { '--topic': t.color, '--topic-soft': t.soft } as CSSProperties

  return (
    <div className={styles.page} style={rootStyle}>
      <article className={styles.cert}>
        <span className={styles.seal} aria-hidden="true">✦</span>
        <p className={styles.kicker}>Sage Academy · Certificate of Completion</p>
        <p className={styles.pre}>This certifies that</p>
        <h1 className={styles.name}>{cap(cert.recipientName)}</h1>
        <p className={styles.pre}>has successfully completed</p>
        <h2 className={styles.course}>{cert.courseTitle}</h2>
        <div className={styles.meta}>
          <span>Issued {date}</span>
          <span className={styles.dot} aria-hidden="true">·</span>
          <span className={styles.code}>{cert.code}</span>
        </div>
        <div className={styles.sign}>
          <span className={styles.signName}>Jason Teixeira</span>
          <span className={styles.signRole}>Founder · Sage Ideas</span>
        </div>
      </article>
      <p className={styles.verify}>
        Verify at sageideas.dev/academy/certificate/{cert.code}
      </p>
    </div>
  )
}
