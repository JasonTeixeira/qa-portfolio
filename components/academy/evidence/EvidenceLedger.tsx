import Link from 'next/link'
import { topic } from '@/lib/academy/topics'
import type { EvidenceLedger as Ledger, EvidenceItem } from '@/lib/academy/evidence'
import { Icon } from '@/components/academy/ui/Icon'
import styles from './evidence.module.css'

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

/** Short "Jun 30" form used in the table's claim sub-line. */
function fmtShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

/**
 * Plain-language capability claim from a lesson title. The lesson title already
 * reads as a proven skill ("Bound a change before shipping it"); we surface it
 * verbatim rather than inventing marketing copy.
 */
function claimOf(it: EvidenceItem): string {
  return it.lessonTitle
}

const VERDICT_LABEL: Record<EvidenceItem['verdict'], string> = {
  proven: 'PROVEN',
  'needs-repair': 'NEEDS REPAIR',
}

export function EvidenceLedger({ data }: { data: Ledger }) {
  if (!data.signedIn) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <span className={styles.emptyGlyph} aria-hidden="true"><Icon name="book" size={24} /></span>
          <h1 className={styles.emptyTitle}>Your proof of work</h1>
          <p className={styles.emptyBody}>Sign in to see every sprint you&rsquo;ve proven, course you&rsquo;ve finished, and certificate you&rsquo;ve earned — a record you can show an employer.</p>
          <Link href="/login?next=/academy/evidence" className={styles.primary}>
            Sign in
            <Icon name="arrow-right" size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    )
  }

  const claimCount = data.timeline.length
  const artifactCount = data.timeline.filter((it) => it.artifactTitle).length
  const hasWork = claimCount > 0

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div className={styles.headText}>
          <h1 className={styles.title}>
            {claimCount} {claimCount === 1 ? 'claim' : 'claims'}.{' '}
            <em className={styles.titleAccent}>
              {artifactCount} {artifactCount === 1 ? 'artifact' : 'artifacts'}.
            </em>
          </h1>
          <p className={styles.sub}>Pick any claim, follow the artifact, see for yourself. This is what leaves with you.</p>
        </div>
        <div className={styles.headSide}>
          {data.shareUrl ? (
            <a href={data.shareUrl} className={styles.share}>
              Share portfolio
              <Icon name="arrow-right" size={14} aria-hidden="true" />
            </a>
          ) : (
            <Link href="/academy/profile" className={styles.shareGhost}>
              Make portfolio public
              <Icon name="arrow-right" size={14} aria-hidden="true" />
            </Link>
          )}
          {hasWork ? (
            <div className={styles.tally}>
              <span className={styles.tallyProven}>{data.provenCount} proven</span>
              {data.needsRepairCount > 0 ? (
                <span className={styles.tallyRepair}>{data.needsRepairCount} needs repair</span>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      {hasWork ? (
        <div className={styles.table} role="table" aria-label="Evidence">
          <div className={styles.thead} role="row">
            <span role="columnheader">Claim</span>
            <span role="columnheader">Artifact</span>
            <span role="columnheader">Course</span>
            <span role="columnheader">Verdict</span>
          </div>
          {data.timeline.map((it, i) => {
            const t = topic(it.topic)
            const isRepair = it.verdict === 'needs-repair'
            return (
              <Link
                key={`${it.lessonSlug}-${i}`}
                href={`/academy/learn/${it.courseSlug}/${it.lessonSlug}`}
                className={styles.row}
                role="row"
              >
                <div className={styles.cellClaim} role="cell">
                  <span className={styles.claim}>{claimOf(it)}</span>
                  <span className={styles.claimDate}>{fmtShort(it.at)}</span>
                </div>
                <span className={styles.cellArtifact} role="cell">
                  {it.artifactTitle ? (
                    <span className={styles.artifact}>{it.artifactTitle}</span>
                  ) : (
                    <span className={styles.artifactNone}>—</span>
                  )}
                </span>
                <span className={styles.cellCourse} role="cell" style={{ ['--c' as string]: t.color }}>
                  {t.label}
                </span>
                <span
                  role="cell"
                  className={isRepair ? styles.badgeRepair : styles.badgeProven}
                >
                  {VERDICT_LABEL[it.verdict]}
                </span>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className={styles.empty}>
          <span className={styles.emptyGlyph} aria-hidden="true"><Icon name="compass" size={24} /></span>
          <p className={styles.emptyBody}>No proof yet — finish a sprint and clear its unlock gate to start your evidence.</p>
          <Link href="/academy/catalog" className={styles.primary}>
            Start a sprint
            <Icon name="arrow-right" size={15} aria-hidden="true" />
          </Link>
        </div>
      )}

      {(data.certificates.length > 0 || data.inProgress) ? (
        <div className={styles.certGrid}>
          {data.certificates.map((c) => (
            <Link
              key={c.code}
              href={`/academy/certificate/${c.code}`}
              className={styles.certEarned}
            >
              <span className={styles.certSeal} aria-hidden="true">◆</span>
              <span className={styles.certKicker}>Certificate · earned</span>
              <span className={styles.certTitle}>{c.courseTitle}</span>
              <span className={styles.certBody}>Issued on genuine completion — {fmtDate(c.issuedAt)}.</span>
              <span className={styles.certFootEarned}>
                <span className={styles.certCode}>{c.code}</span>
                <span className={styles.certVerify}>verify by code →</span>
              </span>
            </Link>
          ))}

          {data.inProgress ? (
            <Link
              href={`/academy/course/${data.inProgress.courseSlug}`}
              className={styles.certProgress}
            >
              <span className={styles.certSealDim} aria-hidden="true">◇</span>
              <span className={styles.certKickerDim}>Certificate · in progress</span>
              <span className={styles.certTitle}>{data.inProgress.courseTitle}</span>
              <span className={styles.certBody}>
                Exactly what remains:{' '}
                {data.inProgress.openRepairs > 0
                  ? `repair ${data.inProgress.openRepairs} proof${data.inProgress.openRepairs === 1 ? '' : 's'} + `
                  : ''}
                {data.inProgress.lessonsTotal - data.inProgress.lessonsDone} lesson
                {data.inProgress.lessonsTotal - data.inProgress.lessonsDone === 1 ? '' : 's'}.
              </span>
              <span className={styles.certFootProgress}>
                <span className={styles.certRemain}>
                  {data.inProgress.lessonsDone} / {data.inProgress.lessonsTotal} lessons done
                </span>
                <span className={styles.certContinue}>continue →</span>
              </span>
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
