import Link from 'next/link'
import type { PublicProfile } from '@/lib/academy/profiles'
import type { GainBand } from '@/lib/academy/efficacy-logic'
import { ShareRow } from '@/components/academy/share/ShareRow'
import styles from './public-profile.module.css'

const titleCase = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

const BAND_LABEL: Record<GainBand, string> = {
  high: 'High gain',
  medium: 'Medium gain',
  low: 'Low gain',
  negative: 'No gain',
}

function bestGain(gains: PublicProfile['gains']): number | null {
  const vals = gains.map((g) => g.g).filter((g): g is number => g !== null)
  return vals.length ? Math.max(...vals) : null
}

export function PublicProfileView({ profile, shareUrl }: { profile: PublicProfile; shareUrl: string }) {
  const projects = profile.artifacts.length
  const certs = profile.certificates.length
  const top = bestGain(profile.gains)
  const shareText = `${profile.displayName} is learning to build with AI at Sage Academy — ${certs} certificate${
    certs === 1 ? '' : 's'
  }, ${projects} shipped project${projects === 1 ? '' : 's'}.`

  return (
    <div className={styles.page}>
      <div className={styles.atmosphere} aria-hidden="true" />

      <header className={styles.head}>
        <span className={styles.avatar} aria-hidden="true">
          {profile.displayName.slice(0, 1).toUpperCase()}
        </span>
        <h1 className={styles.name}>{profile.displayName}</h1>
        <p className={styles.handle}>@{profile.handle}</p>
        {profile.bio ? <p className={styles.bio}>{profile.bio}</p> : null}
        <div className={styles.share}>
          <ShareRow url={shareUrl} text={shareText} />
        </div>
      </header>

      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt>{certs}</dt>
          <dd>Certificates</dd>
        </div>
        <div className={styles.stat}>
          <dt>{projects}</dt>
          <dd>Projects shipped</dd>
        </div>
        <div className={`${styles.stat} ${top !== null ? styles.statLive : ''}`}>
          <dt>{top !== null ? top.toFixed(2) : '—'}</dt>
          <dd>Best learning gain (g)</dd>
        </div>
      </dl>

      {profile.gains.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.h2}>Verified learning gain</h2>
          <p className={styles.note}>
            Normalized gain <em>g = (post − pre) / (100 − pre)</em> — the share of available improvement actually
            captured, measured by pre/post assessment.
          </p>
          <ul className={styles.gainList}>
            {profile.gains.map((gn) => (
              <li key={gn.courseSlug} className={styles.gainRow} data-band={gn.band ?? 'none'}>
                <span className={styles.gainCourse}>{titleCase(gn.courseSlug)}</span>
                <span className={styles.gainScores}>
                  {gn.pre} → {gn.post}
                </span>
                <span className={styles.gainBadge}>
                  {gn.g !== null ? `g ${gn.g.toFixed(2)}` : '—'} · {gn.band ? BAND_LABEL[gn.band] : '—'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {profile.certificates.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.h2}>Certificates</h2>
          <div className={styles.cardGrid}>
            {profile.certificates.map((c) => (
              <Link key={c.code} href={`/academy/certificate/${c.code}`} className={styles.cert}>
                <span className={styles.certSeal} aria-hidden="true">
                  ✦
                </span>
                <span className={styles.certTitle}>{titleCase(c.courseSlug)}</span>
                <span className={styles.certCta}>View certificate →</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {profile.artifacts.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.h2}>Proof of work</h2>
          <div className={styles.cardGrid}>
            {profile.artifacts.map((a) => (
              <div key={a.id} className={styles.artifact}>
                <span className={styles.artifactTitle}>{a.title}</span>
                {a.courseSlug ? <span className={styles.artifactCourse}>{titleCase(a.courseSlug)}</span> : null}
                <div className={styles.artifactLinks}>
                  {a.repoUrl ? (
                    <a href={a.repoUrl} target="_blank" rel="noopener noreferrer">
                      Code →
                    </a>
                  ) : null}
                  {a.demoUrl ? (
                    <a href={a.demoUrl} target="_blank" rel="noopener noreferrer">
                      Demo →
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <footer className={styles.cta}>
        <p>Build your own proof-of-work portfolio.</p>
        <Link href="/academy" className={styles.ctaBtn}>
          Start at Sage Academy →
        </Link>
      </footer>
    </div>
  )
}
