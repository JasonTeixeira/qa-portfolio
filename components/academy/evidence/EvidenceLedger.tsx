import Link from 'next/link'
import { topic } from '@/lib/academy/topics'
import type { EvidenceLedger as Ledger } from '@/lib/academy/evidence'
import styles from './evidence.module.css'

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

export function EvidenceLedger({ data }: { data: Ledger }) {
  if (!data.signedIn) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <span className={styles.emptyGlyph} aria-hidden="true">⬡</span>
          <h1 className={styles.emptyTitle}>Your proof of work</h1>
          <p className={styles.emptyBody}>Sign in to see every sprint you&rsquo;ve proven, course you&rsquo;ve finished, and certificate you&rsquo;ve earned — a record you can show an employer.</p>
          <Link href="/login?next=/academy/evidence" className={styles.primary}>Sign in →</Link>
        </div>
      </div>
    )
  }

  const stats = [
    { n: data.sprintsProven, label: 'Sprints proven' },
    { n: data.coursesCompleted, label: 'Courses completed' },
    { n: data.certificatesEarned, label: 'Certificates' },
    { n: data.hoursInvested, label: 'Hours invested' },
  ]

  const hasWork = data.timeline.length > 0

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <span className={styles.kicker}>⬡ Proof of work</span>
        <h1 className={styles.title}>{data.name}&rsquo;s evidence ledger</h1>
        <p className={styles.sub}>
          Not a list of videos watched — a record of work <em>proven</em>. Every entry passed a real
          checkpoint or unlock gate.
        </p>
      </header>

      <div className={styles.stats}>
        {stats.map((s) => (
          <div key={s.label} className={styles.stat}>
            <span className={styles.statN}>{s.n}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {data.certificates.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.h2}>Certificates</h2>
          <div className={styles.certGrid}>
            {data.certificates.map((c) => (
              <Link key={c.code} href={`/academy/certificate/${c.code}`} className={styles.certCard} style={{ ['--c' as string]: topic(c.topic).color }}>
                <span className={styles.certSeal} aria-hidden="true">◆</span>
                <span className={styles.certTitle}>{c.courseTitle}</span>
                <span className={styles.certMeta}>{c.code} · {fmtDate(c.issuedAt)}</span>
                <span className={styles.certView}>View certificate →</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.section}>
        <h2 className={styles.h2}>Timeline</h2>
        {hasWork ? (
          <ol className={styles.timeline}>
            {data.timeline.map((it, i) => (
              <li key={`${it.lessonSlug}-${i}`} className={styles.entry} style={{ ['--c' as string]: topic(it.topic).color }}>
                <span className={styles.dot} aria-hidden="true" />
                <div className={styles.entryBody}>
                  <Link href={`/academy/learn/${it.courseSlug}/${it.lessonSlug}`} className={styles.entryTitle}>{it.lessonTitle}</Link>
                  <span className={styles.entryMeta}>{it.courseTitle} · proven {fmtDate(it.at)}</span>
                </div>
                <span className={styles.entryTag}>✓ proven</span>
              </li>
            ))}
          </ol>
        ) : (
          <div className={styles.empty}>
            <span className={styles.emptyGlyph} aria-hidden="true">◇</span>
            <p className={styles.emptyBody}>No proof yet — finish a sprint and clear its unlock gate to start your ledger.</p>
            <Link href="/academy/catalog" className={styles.primary}>Start a sprint →</Link>
          </div>
        )}
      </section>
    </div>
  )
}
