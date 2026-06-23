import Link from 'next/link'
import type { CSSProperties } from 'react'
import { topic, TOPICS } from '@/lib/academy/topics'
import type { LearnerDashboard } from '@/lib/academy/learner'
import styles from './dashboard.module.css'

const ACCENT = '#3D6BFF'

function tvars(t: ReturnType<typeof topic>): CSSProperties {
  return { ['--topic']: t.color, ['--topic-soft']: t.soft } as CSSProperties
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const titleCase = (s: string) =>
  s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

/** Honest progress ring (real %). Part of the design system, not decoration. */
function Ring({
  pct,
  size = 60,
  stroke = 5,
  color = ACCENT,
}: {
  pct: number
  size?: number
  stroke?: number
  color?: string
}) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, pct))
  const offset = circ * (1 - clamped / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={styles.ring} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className={styles.ringText}>
        {clamped}%
      </text>
    </svg>
  )
}

export function Dashboard({ dash }: { dash: LearnerDashboard }) {
  if (!dash.signedIn) {
    return (
      <div className={styles.page}>
        <div className={styles.atmosphere} aria-hidden="true" />
        <div className={styles.gate}>
          <p className={styles.kicker}>My Learning</p>
          <h1 className={styles.gateTitle}>Sign in to track your learning.</h1>
          <p className={styles.gateBody}>Your progress, courses, and certificates live here once you’re in.</p>
          <Link href="/login?audience=academy&next=/academy/dashboard" className={styles.gateBtn}>
            Sign in →
          </Link>
          <Link href="/academy" className={styles.gateAlt}>
            Back to the Academy
          </Link>
        </div>
      </div>
    )
  }

  const inProgress = dash.courses.find((c) => c.total > 0 && c.done > 0 && c.done < c.total)
  const continueCourse = dash.continueTo
    ? dash.courses.find((c) => c.slug === dash.continueTo!.courseSlug)
    : undefined
  const subtitle = inProgress
    ? `You’re ${inProgress.pct}% through ${inProgress.title}. Keep the momentum.`
    : dash.courses.length
      ? 'Pick a course back up and keep building.'
      : 'Your first build is one click away — browse the catalog below.'

  return (
    <div className={styles.page}>
      <div className={styles.atmosphere} aria-hidden="true" />

      <header className={styles.head}>
        <p className={styles.kicker}>My Learning</p>
        <h1 className={styles.title}>Welcome back, {cap(dash.name)}.</h1>
        <p className={styles.sub}>{subtitle}</p>
        <nav className={styles.quickNav} aria-label="Learner areas">
          <Link href="/academy/evidence">⬡ Proof of work</Link>
          <Link href="/academy/resources">◍ Tools &amp; resources</Link>
          <Link href="/academy/catalog">Browse catalog →</Link>
        </nav>
      </header>

      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt>{dash.lessonsCompleted}</dt>
          <dd>Lessons completed</dd>
        </div>
        <div className={`${styles.stat} ${dash.coursesInProgress ? styles.statLive : ''}`}>
          <dt>{dash.coursesInProgress}</dt>
          <dd>In progress</dd>
        </div>
        <div className={styles.stat}>
          <dt>{dash.coursesCompleted}</dt>
          <dd>Courses finished</dd>
        </div>
        <div className={styles.stat}>
          <dt>{dash.certificates.length}</dt>
          <dd>Certificates</dd>
        </div>
      </dl>

      {dash.continueTo ? (
        <Link
          href={`/academy/learn/${dash.continueTo.courseSlug}/${dash.continueTo.lessonSlug}`}
          className={styles.resume}
        >
          <span className={styles.resumeGlow} aria-hidden="true" />
          <div className={styles.resumeBody}>
            <span className={styles.resumeKicker}>▸ Pick up where you left off</span>
            <span className={styles.resumeTitle}>{titleCase(dash.continueTo.lessonSlug)}</span>
            {continueCourse ? (
              <span className={styles.resumeCourse}>
                {continueCourse.title} · {continueCourse.done}/{continueCourse.total} lessons
              </span>
            ) : null}
          </div>
          {continueCourse ? <Ring pct={continueCourse.pct} /> : null}
          <span className={styles.resumeBtn}>Resume →</span>
        </Link>
      ) : null}

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.h2}>Your courses</h2>
          {dash.courses.length > 0 ? (
            <Link href="/academy/catalog" className={styles.sectionLink}>
              Find more →
            </Link>
          ) : null}
        </div>
        {dash.courses.length === 0 ? (
          <p className={styles.empty}>
            You haven’t started a course yet. <Link href="/academy/catalog">Browse the catalog →</Link>
          </p>
        ) : (
          <div className={styles.courseGrid}>
            {dash.courses.map((c) => {
              const t = topic(c.topic)
              const finished = c.total > 0 && c.done >= c.total
              return (
                <Link
                  key={c.slug}
                  href={`/academy/course/${c.slug}`}
                  className={styles.courseCard}
                  style={tvars(t)}
                >
                  <div className={styles.courseTop}>
                    <span className={styles.courseTag}>{TOPICS[c.topic].label}</span>
                    <Ring pct={c.pct} size={44} stroke={4} color={t.color} />
                  </div>
                  <h3 className={styles.courseTitle}>{c.title}</h3>
                  <span className={styles.courseMeta}>
                    {c.done} / {c.total} lessons
                  </span>
                  <span className={styles.courseCta}>{finished ? '✓ Finished · review →' : 'Continue →'}</span>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {dash.certificates.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.h2}>Certificates</h2>
          <div className={styles.certGrid}>
            {dash.certificates.map((cert) => {
              const t = topic(cert.topic)
              return (
                <Link
                  key={cert.code}
                  href={`/academy/certificate/${cert.code}`}
                  className={styles.certCard}
                  style={tvars(t)}
                >
                  <span className={styles.certSeal} aria-hidden="true">
                    ✦
                  </span>
                  <span className={styles.certKicker}>Certificate of completion</span>
                  <h3 className={styles.certTitle}>{cert.courseTitle}</h3>
                  <span className={styles.certCta}>View certificate →</span>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      {dash.paths.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.h2}>Saved paths</h2>
          <ul className={styles.pathList}>
            {dash.paths.map((p) => (
              <li key={p.id} className={styles.pathRow}>
                <span className={styles.pathName}>{p.name}</span>
                <span className={styles.pathMeta}>{p.courseSlugs.length} courses</span>
                <Link href="/academy/build" className={styles.pathEdit}>
                  Edit →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
