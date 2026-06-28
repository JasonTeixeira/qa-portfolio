import type { CSSProperties } from 'react'
import { topic } from '@/lib/academy/topics'
import type { CertificateView } from '@/lib/academy/learner'
import { ShareRow } from '@/components/academy/share/ShareRow'
import { Icon } from '@/components/academy/ui/Icon'
import styles from './certificate.module.css'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sageideas.dev'

const cap = (s: string) =>
  s.split(/[\s.]+/).map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(' ')

export function Certificate({ cert }: { cert: CertificateView }) {
  const t = topic(cert.topic)
  const issued = new Date(cert.issuedAt)
  const date = issued.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const rootStyle = { '--topic': t.color, '--topic-soft': t.soft } as CSSProperties
  const shareUrl = `${SITE}/academy/certificate/${cert.code}`

  return (
    <div className={styles.page} style={rootStyle}>
      <article className={styles.cert}>
        <span className={styles.seal} aria-hidden="true"><Icon name="award" size={32} /></span>
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
      <div className={styles.shareWrap}>
        <ShareRow
          url={shareUrl}
          text={`I earned a ${cert.courseTitle} certificate at Sage Academy.`}
          cert={{
            name: `${cert.courseTitle} — Sage Academy`,
            issuedYear: issued.getFullYear(),
            issuedMonth: issued.getMonth() + 1,
            certId: cert.code,
          }}
        />
      </div>
    </div>
  )
}
