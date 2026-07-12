import Link from 'next/link'
import type {
  ProgressData,
  MasteryTimeline,
  CourseRow,
  Velocity,
  RecallConcept,
} from '@/lib/academy/progress-data'
import styles from './progress.module.css'

/**
 * "The honest picture" — the Progress analytics surface (/academy/progress),
 * reskinned one-for-one to the Sage Academy design. Purely presentational: it
 * renders whatever REAL data the reader assembled and gracefully omits any panel
 * with no data (no fabricated numbers, no placeholder bars). The per-dimension
 * panel from the design is intentionally absent — the platform has no
 * per-dimension score decomposition, so it cannot be shown honestly.
 */

const PAL = {
  green: '#18B663',
  gold: '#E0A93E',
  red: '#E5484D',
  accent: '#3D5AFE',
  accentText: '#8FA0FF',
  muted: '#9598A2',
  faint: '#4A4A54',
} as const

// ── Mastery line chart (SVG) ─────────────────────────────────────────────────

const CHART = { w: 900, h: 220, left: 40, top: 12, bottom: 190, right: 890 } as const

function scoreY(score: number): number {
  const t = Math.max(0, Math.min(100, score)) / 100
  return CHART.bottom - t * (CHART.bottom - CHART.top)
}

function weekX(week: number, weeks: number): number {
  if (weeks <= 1) return CHART.left
  const t = week / (weeks - 1)
  return CHART.left + t * (CHART.right - CHART.left)
}

function MasteryChart({ timeline }: { timeline: MasteryTimeline }) {
  const weeks = 12
  const pts = timeline.points
  const line = pts.map((p) => `${weekX(p.week, weeks).toFixed(0)},${scoreY(p.score).toFixed(0)}`).join(' ')
  const capY = timeline.cap !== null ? scoreY(timeline.cap) : null

  return (
    <section className={styles.card} aria-labelledby="mastery-eyebrow">
      <div className={styles.chartHead}>
        <span id="mastery-eyebrow" className={styles.eyebrow}>
          Mastery · 12 weeks · {timeline.courseTitle}
        </span>
        <div className={styles.legend}>
          <span>
            <span style={{ color: PAL.accentText }}>—</span> mastery
          </span>
          {capY !== null && (
            <span>
              <span style={{ color: PAL.gold }}>--</span> cap ceiling
            </span>
          )}
          {timeline.markers.length > 0 && (
            <span>
              <span style={{ color: PAL.red }}>●</span> failed proof
            </span>
          )}
        </div>
      </div>
      <svg viewBox={`0 0 ${CHART.w} ${CHART.h}`} className={styles.chartSvg} role="img" aria-label="Mastery over 12 weeks">
        {/* axes */}
        <line x1={CHART.left} y1={CHART.top} x2={CHART.left} y2={CHART.bottom} stroke="#1E1E24" strokeWidth={1} />
        <line x1={CHART.left} y1={CHART.bottom} x2={CHART.right} y2={CHART.bottom} stroke="#1E1E24" strokeWidth={1} />
        <text x={34} y={18} fill={PAL.muted} fontSize={10} fontFamily="var(--ac-font-mono)" textAnchor="end">
          100
        </text>
        <text x={34} y={106} fill={PAL.muted} fontSize={10} fontFamily="var(--ac-font-mono)" textAnchor="end">
          50
        </text>
        <text x={34} y={192} fill={PAL.muted} fontSize={10} fontFamily="var(--ac-font-mono)" textAnchor="end">
          0
        </text>
        {/* cap ceiling — dashed gold at the current binding cap */}
        {capY !== null && (
          <>
            <line
              x1={CHART.left}
              y1={capY}
              x2={CHART.right}
              y2={capY}
              stroke={PAL.gold}
              strokeWidth={1.5}
              strokeDasharray="5 5"
            />
            <text x={CHART.right} y={capY - 6} fill={PAL.gold} fontSize={9.5} fontFamily="var(--ac-font-mono)" textAnchor="end">
              capped at {timeline.cap} — {timeline.capLabel}
            </text>
          </>
        )}
        {/* mastery line */}
        <polyline points={line} fill="none" stroke={PAL.accent} strokeWidth={2.5} />
        {/* failed-proof markers */}
        {timeline.markers.map((m, i) => {
          const cx = weekX(m.week, weeks)
          const cy = scoreY(m.score)
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={5} fill="#0B0B0E" stroke={PAL.red} strokeWidth={2.5} />
              <text x={cx} y={cy + 22} fill={PAL.red} fontSize={9.5} fontFamily="var(--ac-font-mono)" textAnchor="middle">
                {m.label}
              </text>
            </g>
          )
        })}
      </svg>
    </section>
  )
}

// ── Per-course panel ─────────────────────────────────────────────────────────

function courseScoreColor(row: CourseRow): string {
  if (row.state === 'capped') return PAL.gold
  if (row.state === 'certified') return PAL.accentText
  return PAL.green
}

function courseBar(row: CourseRow): string {
  if (row.state === 'capped') return 'linear-gradient(90deg, #3D5AFE, #6E83FF)'
  return 'linear-gradient(90deg, #18B663, #3ACD85)'
}

function courseActionColor(row: CourseRow): string {
  if (row.state === 'capped') return PAL.green
  if (row.state === 'certified') return PAL.accentText
  return PAL.muted
}

function CoursePanel({ courses }: { courses: CourseRow[] }) {
  return (
    <section className={`${styles.card} ${styles.coursePanel}`} aria-labelledby="courses-eyebrow">
      <span id="courses-eyebrow" className={styles.eyebrow}>
        Per course
      </span>
      {courses.map((row) => {
        const scoreText =
          row.state === 'capped' ? `${row.score} · capped` : `${row.score}`
        const metaText = row.certCode
          ? `${row.lessonsDone}/${row.lessonsTotal} · certified`
          : row.lessonsTotal > 0 && row.lessonsDone >= row.lessonsTotal
            ? `${row.lessonsDone}/${row.lessonsTotal} · complete`
            : `${row.lessonsDone}/${row.lessonsTotal} lessons`
        return (
          <div key={row.slug} className={styles.courseRow}>
            <div className={styles.courseTop}>
              <span className={styles.courseName}>{row.title}</span>
              <span className={styles.courseScore} style={{ color: courseScoreColor(row) }}>
                {scoreText}
              </span>
            </div>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${Math.max(2, Math.min(100, row.score))}%`, background: courseBar(row) }}
              />
            </div>
            <div className={styles.courseFoot}>
              <span className={styles.courseMeta}>{metaText}</span>
              <Link href={row.href} className={styles.courseAction} style={{ color: courseActionColor(row) }}>
                {row.actionLabel}
              </Link>
            </div>
          </div>
        )
      })}
    </section>
  )
}

// ── Evidence velocity panel ──────────────────────────────────────────────────

function VelocityPanel({ velocity }: { velocity: Velocity }) {
  const max = Math.max(1, ...velocity.bars.map((b) => b.count))
  return (
    <section className={styles.card} aria-labelledby="velocity-eyebrow">
      <span id="velocity-eyebrow" className={styles.eyebrow}>
        Evidence velocity
      </span>
      <div className={styles.velocityBars}>
        {velocity.bars.map((b, i) => {
          const isNow = i === velocity.bars.length - 1
          const pct = Math.round((b.count / max) * 100)
          return (
            <div key={i} className={styles.velCol}>
              <div
                className={styles.velBar}
                style={{
                  height: `${Math.max(6, pct)}%`,
                  background: isNow && b.count > 0 ? PAL.green : '#26262E',
                }}
                aria-hidden
              />
              <div className={styles.velLabel}>{b.label}</div>
            </div>
          )
        })}
      </div>
      <p className={styles.velCaption}>
        {velocity.total} artifact{velocity.total === 1 ? '' : 's'} logged ·{' '}
        <span style={{ color: PAL.green }}>
          {velocity.thisWeek} this week
        </span>{' '}
        — the portfolio compounds.
      </p>
    </section>
  )
}

// ── Skill graph · recall panel ───────────────────────────────────────────────

function recallBar(state: RecallConcept['state']): string {
  if (state === 'solid') return 'linear-gradient(90deg, #18B663, #3ACD85)'
  if (state === 'decaying') return 'linear-gradient(90deg, #E0A93E, #EBC06A)'
  return 'linear-gradient(90deg, #E5484D, #F0705F)'
}

function recallColor(state: RecallConcept['state']): string {
  if (state === 'solid') return PAL.green
  if (state === 'decaying') return PAL.gold
  return PAL.red
}

function decayHatch(state: RecallConcept['state']): string {
  const rgb = state === 'fading' ? '229, 72, 77' : '224, 169, 62'
  return `repeating-linear-gradient(45deg, rgba(${rgb}, 0.25) 0, rgba(${rgb}, 0.25) 4px, transparent 4px, transparent 8px)`
}

function recallDueLabel(c: RecallConcept): string {
  if (c.dueInDays > 0) return `next recall ${c.dueInDays}d`
  if (c.dueInDays === 0) return 'recall due today'
  return `overdue ${Math.abs(c.dueInDays)}d`
}

function RecallRow({ c }: { c: RecallConcept }) {
  const strengthPct = Math.max(2, Math.min(100, c.strength))
  const decayWidth = Math.max(0, Math.min(30, 100 - strengthPct))
  const isFadingOrDecaying = c.state !== 'solid'
  const overdue = c.dueInDays <= 0
  const href = c.state === 'fading' || overdue ? '/academy/review' : null
  return (
    <div className={styles.recallRow}>
      <span className={styles.recallName}>{c.label}</span>
      <div className={styles.recallTrack}>
        <div
          className={styles.recallFill}
          style={{ width: `${strengthPct}%`, background: recallBar(c.state) }}
        />
        {isFadingOrDecaying && decayWidth > 0 && (
          <div
            className={styles.recallDecay}
            style={{ left: `${strengthPct}%`, width: `${decayWidth}%`, background: decayHatch(c.state) }}
            aria-hidden
          />
        )}
      </div>
      <span className={styles.recallScore} style={{ color: recallColor(c.state) }}>
        {c.strength} · {c.state}
      </span>
      {href ? (
        <Link href={href} className={styles.recallAction} style={{ color: PAL.accentText }}>
          recall now →
        </Link>
      ) : (
        <span className={styles.recallDue}>{recallDueLabel(c)}</span>
      )}
    </div>
  )
}

function RecallPanel({ recall }: { recall: RecallConcept[] }) {
  return (
    <section className={styles.recallCard} aria-labelledby="recall-eyebrow">
      <div className={styles.recallHead}>
        <span id="recall-eyebrow" className={styles.eyebrow}>
          Skill graph · concepts, not courses
        </span>
        <span className={styles.recallHeadNote}>recall targets the weakest first</span>
      </div>
      {recall.map((c) => (
        <RecallRow key={c.key} c={c} />
      ))}
      <div className={styles.recallCaption}>
        decay is visible on purpose — a fading bar is a comeback trigger, not a verdict
      </div>
    </section>
  )
}

// ── Root ─────────────────────────────────────────────────────────────────────

export function ProgressView({ data }: { data: ProgressData }) {
  const { masteryTimeline, courses, velocity, recall, isEmpty } = data

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        The <em className={styles.titleAccent}>honest</em> picture.
      </h1>
      <p className={styles.sub}>
        Every number below implies an action. Caps show their repair; dips show their cause.
      </p>

      {isEmpty ? (
        <div className={styles.emptyWrap}>
          <span className={styles.emptyOrb} aria-hidden />
          <h2 className={styles.emptyTitle}>
            No numbers yet — <em className={styles.titleAccent}>that&apos;s honest too.</em>
          </h2>
          <p className={styles.emptyLead}>
            Mastery scores here are earned, never estimated. Your curve starts the moment your first
            proof holds — attempt a retrieval, build an artifact, verify a lab.
          </p>
          <Link href="/academy/catalog" className={styles.emptyCta}>
            Start learning →
          </Link>
        </div>
      ) : (
        <>
          {masteryTimeline && <MasteryChart timeline={masteryTimeline} />}

          <div className={styles.grid}>
            {courses.length > 0 && <CoursePanel courses={courses} />}
            {velocity && <VelocityPanel velocity={velocity} />}
          </div>

          {recall.length > 0 && <RecallPanel recall={recall} />}
        </>
      )}
    </div>
  )
}
