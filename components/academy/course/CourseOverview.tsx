import Link from 'next/link'
import { topic, TOPICS } from '@/lib/academy/topics'
import { moduleName, type CourseOverview as Overview, type OverviewLesson } from '@/lib/academy/content'
import { ProgressBar } from '@/components/academy/shell/ProgressBar'
import { Icon } from '@/components/academy/ui/Icon'
import type { CSSProperties } from 'react'
import styles from './course.module.css'

/** Honest progress ring (real %), tinted to the course's topic colour. */
function Ring({ pct, color, size = 72, stroke = 6 }: { pct: number; color: string; size?: number; stroke?: number }) {
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

/** Flatten modules to an ordered lesson list carrying its 1-based course index + module. */
type FlatLesson = OverviewLesson & { index: number; moduleTitle: string }

function flatten(overview: Overview): FlatLesson[] {
  const out: FlatLesson[] = []
  let i = 0
  for (const m of overview.modules) {
    for (const l of m.lessons) {
      i += 1
      out.push({ ...l, index: i, moduleTitle: m.title })
    }
  }
  return out
}

export function CourseOverview({
  overview,
  completed,
  doneCount,
  continueSlug,
}: {
  overview: Overview
  completed: Set<string>
  doneCount: number
  continueSlug: string | null
}) {
  const t = topic(overview.topic)
  const rootStyle = { '--topic': t.color, '--topic-soft': t.soft } as CSSProperties
  const started = doneCount > 0
  const ctaSlug = continueSlug ?? overview.firstLessonSlug
  const pct = overview.lessonsTotal ? Math.round((doneCount / overview.lessonsTotal) * 100) : 0
  const courseDone = overview.lessonsTotal > 0 && doneCount >= overview.lessonsTotal

  const flat = flatten(overview)
  const moduleCount = overview.modules.length
  const topicLabel = TOPICS[overview.topic].label

  // Real free-preview lesson (design's "Preview lesson NN free" / sample-player / free-lesson CTA).
  const preview = flat.find((l) => l.isFreePreview) ?? null
  const previewNum = preview ? String(preview.index).padStart(2, '0') : null
  const previewHref = preview ? `/academy/learn/${overview.slug}/${preview.slug}` : null

  const learnHref = ctaSlug ? `/academy/learn/${overview.slug}/${ctaSlug}` : null

  return (
    <div className={styles.page} style={rootStyle}>
      {/* ── Hero: breadcrumb kicker · ghost numeral · title · outcomes card ── */}
      <header className={styles.hero}>
        <div className={styles.ghost} aria-hidden="true">
          {String(moduleCount).padStart(2, '0')}
        </div>

        <p className={styles.crumb}>
          <Link href="/academy/catalog" className={styles.crumbLink}>
            Catalog
          </Link>
          <span className={styles.crumbSep}>/</span>
          <span>{topicLabel}</span>
          <span className={styles.crumbSep}>/</span>
          <span className={styles.crumbHere}>{overview.title}</span>
        </p>

        <div className={styles.heroGrid}>
          <div className={styles.heroMain}>
            <div className={styles.badges}>
              <span className={styles.badge}>{topicLabel}</span>
              {/* The mark and its colour are earned, never decorative: the success ✓
                  appears only once the learner has actually finished the course. */}
              <span className={styles.badgeLive} data-state={courseDone ? 'done' : started ? 'active' : 'idle'}>
                {courseDone ? '✓ complete' : started ? `${pct}% done` : 'live'} · {overview.lessonsTotal} lessons ·{' '}
                {moduleCount} module{moduleCount === 1 ? '' : 's'}
              </span>
            </div>

            <h1 className={styles.title}>{overview.title}</h1>
            {overview.subtitle ? <p className={styles.subtitle}>{overview.subtitle}</p> : null}

            <div className={styles.actions}>
              <Link href="/academy/catalog#pricing" className={styles.cta}>
                Enrol — all access
              </Link>
              {previewHref && previewNum ? (
                <Link href={previewHref} className={styles.ctaGhost}>
                  Preview lesson {previewNum} free
                </Link>
              ) : learnHref ? (
                <Link href={learnHref} className={styles.ctaGhost}>
                  {started ? 'Continue' : 'Start course'}
                </Link>
              ) : null}
            </div>

            <p className={styles.meta}>
              {overview.lessonsTotal} lessons · {overview.hours}h · {overview.level}
            </p>

            {/* Honest progress — only with real recorded progress. */}
            {started ? (
              <div className={styles.progress}>
                <ProgressBar
                  value={pct}
                  ariaLabel={`Course progress: ${doneCount} of ${overview.lessonsTotal} lessons complete`}
                />
                <span className={styles.progressLabel}>
                  {doneCount}/{overview.lessonsTotal} lessons done · {pct}%
                </span>
              </div>
            ) : null}
          </div>

          {/* Outcomes / "what you'll learn" card — modules stand in as the proof points.
              The mark is semantic, never decorative: success ✓ means "you finished this
              module", so an un-finished module gets the neutral out-of-scope glyph. */}
          <aside className={styles.outcomes}>
            <div className={styles.outcomesHead}>What you&apos;ll cover</div>
            {overview.modules.map((m) => {
              const doneHere = m.lessons.filter((l) => completed.has(l.slug)).length
              const moduleDone = m.lessons.length > 0 && doneHere === m.lessons.length
              const srState = moduleDone
                ? 'complete'
                : doneHere > 0
                  ? `${doneHere} of ${m.lessons.length} lessons done`
                  : 'not started'
              return (
                <div key={m.title} className={styles.outcomeRow}>
                  <span className={styles.outcomeCheck} data-done={moduleDone || undefined} aria-hidden="true">
                    {moduleDone ? '✓' : '○'}
                  </span>
                  <span className={styles.outcomeText}>{m.title}</span>
                  <span className={styles.srOnly}> — {srState}</span>
                </div>
              )
            })}
            <div className={styles.outcomesFoot}>
              {overview.lessonsTotal} lessons · <span className={styles.outcomesHours}>{overview.hours}h total</span>
            </div>
            {started ? (
              <div className={styles.outcomesRing}>
                <Ring pct={pct} color={t.color} size={64} />
              </div>
            ) : null}
          </aside>
        </div>
      </header>

      {/* ── The arc — module cards ── */}
      <section className={styles.arc} aria-label="Modules">
        <div className={styles.arcInner}>
          <h2 className={styles.h2}>
            The arc — {moduleCount} module{moduleCount === 1 ? '' : 's'}, one running syllabus
          </h2>
          <div className={styles.moduleGrid}>
            {overview.modules.map((m, mi) => {
              const first = m.lessons[0]
              const href = first ? `/academy/learn/${overview.slug}/${first.slug}` : null
              // The card's own "MODULE NN" kicker carries the number — drop the
              // duplicate prefix, and omit the title when there's no real name.
              const name = moduleName(m.title)
              const card = (
                <>
                  <div className={styles.moduleTop}>
                    <span className={styles.moduleNum}>MODULE {String(mi + 1).padStart(2, '0')}</span>
                    <span className={styles.moduleCount}>
                      {m.lessons.length} lesson{m.lessons.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  {name ? <div className={styles.moduleTitle}>{name}</div> : null}
                  {first ? <div className={styles.moduleDesc}>Starts with “{first.title}”.</div> : null}
                  <div className={styles.moduleArtifact}>
                    {m.lessons.some((l) => l.isFreePreview) ? 'includes a free preview lesson' : `${m.lessons.length} lessons in this module`}
                  </div>
                </>
              )
              return href ? (
                <Link key={m.title} href={href} className={styles.moduleCard}>
                  {card}
                </Link>
              ) : (
                <div key={m.title} className={styles.moduleCard}>
                  {card}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Sample lesson, in the real player — mini preview built from the free lesson ── */}
      {preview ? (
        <section id="sample" className={styles.sample} aria-label="Sample lesson">
          <div className={styles.sampleInner}>
            <div className={styles.sampleHead}>
              <h2 className={styles.h2}>Sample lesson, in the real player</h2>
              <span className={styles.sampleTag}>
                free preview · lesson {previewNum} of {overview.lessonsTotal}
              </span>
            </div>

            <div className={styles.player}>
              <div className={styles.playerBar}>
                <span className={styles.playerLesson}>
                  {previewNum} · {preview.title}
                </span>
                <span className={styles.playerBlock}>~{preview.estMinutes} min · free</span>
              </div>
              <div className={styles.playerBody}>
                <div className={styles.playerRail}>
                  <div className={styles.railHead}>This module</div>
                  {overview.modules
                    .find((m) => m.title === preview.moduleTitle)
                    ?.lessons.map((l) => {
                      const isThis = l.slug === preview.slug
                      const done = completed.has(l.slug)
                      return (
                        <div key={l.slug} className={styles.railItem} data-active={isThis} data-done={done}>
                          <span className={styles.railDot} aria-hidden="true" />
                          <span className={styles.railText}>{l.title}</span>
                        </div>
                      )
                    })}
                </div>
                <div className={styles.playerMain}>
                  <div className={styles.playerLede}>
                    <span className={styles.playerLedeStrong}>{preview.title}</span> — the full lesson in the real
                    player: reading, diagram, and a hands-on lab. No account, no card.
                  </div>
                  <div className={styles.playerDiagram} aria-hidden="true">
                    <span className={styles.diagNode}>read</span>
                    <span className={styles.diagArrow}>→</span>
                    <span className={styles.diagNodeWarn}>lab · run it</span>
                    <span className={styles.diagArrow}>→</span>
                    <span className={styles.diagNodeMuted}>verification</span>
                    <span className={styles.diagCaption}>SageLab</span>
                  </div>
                  <div className={styles.playerFoot}>
                    <span className={styles.playerScroll}>
                      Scroll continues: concept → lab → verification → spaced review…
                    </span>
                    <Link href="/academy/catalog#pricing" className={styles.playerUnlock}>
                      Unlock all {overview.lessonsTotal} lessons
                    </Link>
                    {previewHref ? (
                      <Link href={previewHref} className={styles.playerOpen}>
                        Open lesson {previewNum} free →
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Closing free-lesson CTA ── */}
      {preview && previewHref && previewNum ? (
        <section className={styles.onramp} aria-label="Free lesson">
          <div className={styles.onrampInner}>
            <div className={styles.onrampCard}>
              <div className={styles.onrampKicker}>Free on-ramp · zero risk</div>
              <h2 className={styles.onrampTitle}>Take lesson {previewNum} — no account, no card.</h2>
              <p className={styles.onrampBody}>
                The full lesson, in the real player — reading, diagram, lab and all. If the way it teaches doesn&apos;t
                click, you&apos;ll know inside {preview.estMinutes} minutes.
              </p>
              <div className={styles.onrampActions}>
                <Link href={previewHref} className={styles.onrampCta}>
                  Start lesson {previewNum} free
                </Link>
                <Link href="/academy/catalog" className={styles.back}>
                  <Icon name="arrow-left" size={15} aria-hidden="true" /> All courses
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className={styles.onramp} aria-label="Enroll">
          <div className={styles.onrampInner}>
            <div className={styles.onrampCardBlue}>
              <h2 className={styles.onrampTitle}>Ready to start {overview.title}?</h2>
              <div className={styles.onrampActions}>
                {learnHref ? (
                  <Link href={learnHref} className={styles.cta}>
                    {started ? 'Continue' : 'Start course'} <Icon name="arrow-right" size={15} aria-hidden="true" />
                  </Link>
                ) : (
                  <span className={styles.soon}>Lessons coming soon</span>
                )}
                <Link href="/academy/catalog" className={styles.back}>
                  <Icon name="arrow-left" size={15} aria-hidden="true" /> All courses
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
