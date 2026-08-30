import Link from 'next/link'
import type { PublicProfile } from '@/lib/academy/profiles'
import { SageMark } from '@/components/academy/brand/SageMark'
import styles from './public-profile.module.css'

/** Initials monogram from a display name (max two letters). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '·'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** "Apr 2026" */
function monthYear(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

/** "Jun 30" — compact evidence-row date. */
function monthDay(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', timeZone: 'UTC' })
}

function pluralize(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

/**
 * Public, shareable proof-of-work ledger. Presentation mirrors the Sage Academy
 * design one-for-one; every value is real learner data. Where the mock showed a
 * value with no honest backing (per-cert gate count, invented artifact filenames,
 * roman-numeral tier sub-ranks), that element is omitted rather than fabricated.
 */
export function PublicProfileView({ profile }: { profile: PublicProfile; shareUrl: string }) {
  const artifactCount = profile.artifacts.length
  const certCount = profile.certificates.length
  const proofsHeld = profile.proofsHeld
  const { tierName, streakDays } = profile.standing

  // Honest mono meta line: only real segments are joined.
  const metaParts = [`member since ${monthYear(profile.joinedAt)}`]
  if (streakDays > 0) metaParts.push(`${pluralize(streakDays, 'day')} streak`)
  if (tierName) metaParts.push(tierName)
  const metaLine = metaParts.join(' · ')

  const statParts: string[] = [pluralize(artifactCount, 'artifact')]
  statParts.push(`${proofsHeld} proofs held`)
  statParts.push(pluralize(certCount, 'certificate'))

  return (
    <div className={styles.root}>
      <header className={styles.topbar}>
        <Link href="/academy" className={styles.brand}>
          <SageMark size={24} radius={7} />
          <span className={styles.brandName}>Sage Academy</span>
        </Link>
        <span className={styles.topPath}>public profile · sageideas.dev/academy/u/{profile.handle}</span>
        <Link href="/academy" className={styles.topCta}>
          build your own ledger →
        </Link>
      </header>

      <main className={styles.main}>
        <section className={styles.head}>
          <span className={styles.avatar} aria-hidden="true">
            {initials(profile.displayName)}
          </span>
          <div className={styles.headText}>
            <h1 className={styles.name}>{profile.displayName}</h1>
            <div className={styles.meta}>{metaLine}</div>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statNum}>{artifactCount}</div>
              <div className={styles.statLabel}>artifacts</div>
            </div>
            <div className={styles.stat}>
              <div className={`${styles.statNum} ${styles.statGreen}`}>{proofsHeld}</div>
              <div className={styles.statLabel}>proofs held</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNum}>{certCount}</div>
              <div className={styles.statLabel}>
                {certCount === 1 ? 'certificate' : 'certificates'}
              </div>
            </div>
          </div>
        </section>

        {profile.certificates.map((c) => {
          const metaBits = [c.code, `issued ${monthYear(c.issuedAt)}`]
          if (c.lessonCount > 0) metaBits.push(pluralize(c.lessonCount, 'lesson'))
          if (c.proofsHeld > 0) metaBits.push(`${c.proofsHeld} proofs held`)
          return (
            <div key={c.code} className={styles.cert}>
              <span className={styles.certMark} aria-hidden="true">
                ◆
              </span>
              <div className={styles.certBody}>
                <div className={styles.certTitle}>{c.courseTitle} — certified</div>
                <div className={styles.certMeta}>{metaBits.join(' · ')}</div>
              </div>
              <Link href={`/academy/certificate/${c.code}`} className={styles.certVerify}>
                ✓ verified · check the code
              </Link>
            </div>
          )
        })}

        <section className={styles.ledger}>
          <div className={styles.ledgerHead}>
            <span className={styles.ledgerTitle}>Public evidence · every row inspectable</span>
            <span className={styles.ledgerCaption}>showing proofs the owner published</span>
          </div>

          {profile.evidence.length === 0 ? (
            <div className={styles.ledgerEmpty}>No proofs published yet.</div>
          ) : (
            profile.evidence.map((row, i) => (
              <div key={`${row.claim}-${i}`} className={styles.row}>
                <div className={styles.rowClaim}>
                  <div className={styles.claimText}>{row.claim}</div>
                  <div className={styles.claimMeta}>
                    {row.courseTitle} · {monthDay(row.at)}
                  </div>
                </div>
                {row.artifactTitle ? (
                  row.artifactUrl ? (
                    <a
                      className={styles.rowArtifact}
                      href={row.artifactUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {row.artifactTitle}
                    </a>
                  ) : (
                    <span className={styles.rowArtifact}>{row.artifactTitle}</span>
                  )
                ) : (
                  <span className={styles.rowArtifactNone}>—</span>
                )}
                <span className={styles.badge}>PASSED</span>
              </div>
            ))
          )}
        </section>

        <footer className={styles.foot}>
          <p className={styles.footQuote}>
            &ldquo;Pick any claim. Follow the artifact. See for yourself.&rdquo;
          </p>
          <div className={styles.footNote}>
            verified by Sage Academy · certificates checkable at /academy/certificate/[code]
          </div>
        </footer>
      </main>
    </div>
  )
}
