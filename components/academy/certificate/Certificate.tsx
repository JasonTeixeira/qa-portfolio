import type { CertificateView } from '@/lib/academy/learner'
import { ShareRow } from '@/components/academy/share/ShareRow'
import styles from './certificate.module.css'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sageideas.dev'

const cap = (s: string) =>
  s.split(/[\s.]+/).map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(' ')

/**
 * Public, shareable Certificate of Genuine Completion (GREEN proof theme).
 *
 * PRESENTATION ONLY. Every value shown is real cert data from getCertificate():
 * - course title, recipient name, issue date, cert code, lesson count — real DB fields.
 * - "proofs held" = the learner's real academy_artifacts count for this course.
 * - The "what this certifies" rows are REAL: shipped artifacts (title + link, badge
 *   SHIPPED) followed by the course's real module titles (badge COVERED). No fabricated
 *   capability claims and no fake artifact filenames — if the cert carries neither
 *   artifacts nor modules, the whole panel is omitted.
 * - The verify block shows the REAL verifiable URL (the public certificate page — there
 *   is no separate /verify endpoint) and a JSON shape built from real fields.
 */
export function Certificate({ cert }: { cert: CertificateView }) {
  const issued = new Date(cert.issuedAt)
  const dateLong = issued.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const dateIso = Number.isNaN(issued.getTime()) ? '' : issued.toISOString().slice(0, 10)

  const shareUrl = `${SITE}/academy/certificate/${cert.code}`
  const verifyPath = `sageideas.dev/academy/certificate/${cert.code}`
  const proofs = cert.artifacts.length

  // Meta clauses — only include what's actually backed by real data.
  const metaParts = [dateLong, cert.code]
  if (cert.lessonCount > 0) metaParts.push(`${cert.lessonCount} lesson${cert.lessonCount === 1 ? '' : 's'}`)
  if (proofs > 0) metaParts.push(`${proofs} proof${proofs === 1 ? '' : 's'} held`)

  // Real competency rows: shipped artifacts first, then the course's real modules.
  const hasPanel = cert.artifacts.length > 0 || cert.modules.length > 0

  // Verify JSON — real fields only.
  const verifyJson =
    `{ "status": "${cert.revoked ? 'REVOKED' : 'VALID'}", "issued": "${dateIso}", ` +
    `"lessons": ${cert.lessonCount}, "proofs_held": ${proofs}, "revoked": ${cert.revoked} }`

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <span className={styles.topKicker}>issued by code · revocable by code</span>
      </div>

      <main className={styles.main}>
        <span className={styles.emblem} aria-hidden="true"><span>◆</span></span>
        <p className={styles.kicker}>Certificate of genuine completion</p>
        <h1 className={styles.course}>{cert.courseTitle}</h1>
        <p className={styles.awarded}>
          awarded to <span className={styles.name}>{cap(cert.recipientName)}</span>
        </p>
        <p className={styles.metaLine}>{metaParts.join(' · ')}</p>

        {hasPanel && (
          <section className={styles.panel} aria-label="What this certificate certifies">
            <div className={styles.panelHead}>What this certifies — pick any row, follow the artifact</div>

            {cert.artifacts.map((a) => (
              <div className={styles.row} key={`artifact-${a.title}`}>
                <span className={styles.rowLabel}>Shipped a working artifact</span>
                <span className={a.url ? styles.rowArtifact : styles.rowArtifactMuted}>
                  {a.url ? (
                    <a href={a.url} target="_blank" rel="noopener noreferrer">{a.title}</a>
                  ) : (
                    a.title
                  )}
                </span>
                <span className={styles.badge}>SHIPPED</span>
              </div>
            ))}

            {cert.modules.map((m) => (
              <div className={styles.row} key={`module-${m}`}>
                <span className={styles.rowLabel}>{m}</span>
                <span className={styles.rowArtifactMuted}>completed in course</span>
                <span className={styles.badge}>COVERED</span>
              </div>
            ))}
          </section>
        )}

        <div className={styles.terminal}>
          <div className={styles.termCmd}>$ curl {verifyPath}</div>
          <div className={styles.termOut}>{verifyJson}</div>
          <div className={styles.termNote}># anyone can open this — no login, no screenshot to fake</div>
        </div>

        <div className={styles.ctas}>
          <a className={styles.ctaPrimary} href={`${SITE}/academy/profile`}>Show on public profile →</a>
          <a className={styles.ctaGhost} href={`${SITE}/academy/catalog`}>Next course →</a>
          <span className={styles.shareWrap}>
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
          </span>
        </div>

        <p className={styles.footNote}>
          If a proof stops holding, the certificate says so. That&apos;s why it&apos;s worth something.
        </p>
      </main>
    </div>
  )
}
