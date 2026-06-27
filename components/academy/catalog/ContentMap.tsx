import Link from 'next/link'
import { topic as topicMeta } from '@/lib/academy/topics'
import type {
  ContentMap as ContentMapData,
  ContentMapCourse,
  ContentMapTrack,
  LessonState,
} from '@/lib/academy/content-map-logic'

/**
 * The Content Map — a server-rendered view of the course universe: tracks →
 * courses → lessons, each lesson tagged done / current ('you are here') /
 * upcoming. Reads the structured graph from buildContentMap (pure); does no IO.
 *
 * State colors map to the semantic tokens: --ac-mastery (done),
 * --ac-accent (current / you-are-here), --ac-locked (upcoming). Disciplined
 * dark, hairline rules, real hierarchy — no glow. Honest empty state.
 */

const STATE_COLOR: Record<LessonState, string> = {
  done: 'var(--ac-mastery)',
  current: 'var(--ac-accent)',
  upcoming: 'var(--ac-locked)',
}

const STATE_LABEL: Record<LessonState, string> = {
  done: 'Completed',
  current: 'You are here',
  upcoming: 'Upcoming',
}

function LessonRow({
  lesson,
}: {
  lesson: ContentMapCourse['lessons'][number]
}) {
  const isCurrent = lesson.state === 'current'
  return (
    <li>
      <Link
        href={lesson.href}
        aria-current={isCurrent ? 'step' : undefined}
        className="group flex items-center gap-3 rounded-[var(--ac-radius)] px-2 py-1.5 outline-none transition-colors hover:bg-[color-mix(in_srgb,var(--ac-ink)_5%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--ac-ink)_6%,transparent)] focus-visible:ring-2 focus-visible:ring-[var(--ac-accent)]"
      >
        <span
          className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold tabular-nums"
          style={{
            background:
              lesson.state === 'upcoming'
                ? 'transparent'
                : `color-mix(in srgb, ${STATE_COLOR[lesson.state]} 18%, transparent)`,
            border:
              lesson.state === 'upcoming'
                ? '1px solid var(--ac-rule-strong)'
                : `1px solid color-mix(in srgb, ${STATE_COLOR[lesson.state]} 55%, transparent)`,
            color: lesson.state === 'upcoming' ? 'var(--ac-ink-faint)' : STATE_COLOR[lesson.state],
            fontFamily: 'var(--ac-font-mono)',
          }}
          aria-hidden
        >
          {lesson.state === 'done' ? '✓' : lesson.order}
        </span>
        <span
          className="min-w-0 flex-1 truncate text-[13px]"
          style={{
            color: isCurrent
              ? 'var(--ac-ink)'
              : lesson.state === 'done'
                ? 'var(--ac-ink-soft)'
                : 'var(--ac-ink-faint)',
            fontWeight: isCurrent ? 600 : 400,
          }}
        >
          {lesson.title}
        </span>
        {isCurrent ? (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em]"
            style={{
              background: 'var(--ac-accent-strong)',
              color: '#fff',
            }}
          >
            You are here
          </span>
        ) : (
          <span className="sr-only">{STATE_LABEL[lesson.state]}</span>
        )}
      </Link>
    </li>
  )
}

function CourseCard({ course }: { course: ContentMapCourse }) {
  const t = topicMeta(course.topic)
  const isComplete = course.state === 'complete'
  return (
    <article
      className="flex flex-col rounded-[var(--ac-radius)] border bg-[var(--ac-surface)] p-4"
      style={{ borderColor: 'var(--ac-rule)' }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-[15px] font-semibold leading-snug" style={{ fontFamily: 'var(--ac-font-display)' }}>
            <Link
              href={course.href}
              className="rounded-sm outline-none transition-colors hover:text-[var(--ac-accent-text)] focus-visible:underline focus-visible:decoration-[var(--ac-accent)] focus-visible:underline-offset-4"
              style={{ color: 'var(--ac-ink)' }}
            >
              {course.title}
            </Link>
          </h4>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--ac-ink-faint)]">
            {t.label} · {course.level}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]"
          style={
            isComplete
              ? { background: 'color-mix(in srgb, var(--ac-mastery) 16%, transparent)', color: 'var(--ac-mastery)' }
              : course.state === 'in-progress'
                ? { background: 'color-mix(in srgb, var(--ac-accent) 16%, transparent)', color: 'var(--ac-accent-text)' }
                : { border: '1px solid var(--ac-rule-strong)', color: 'var(--ac-ink-faint)' }
          }
        >
          {isComplete ? 'Complete' : course.state === 'in-progress' ? 'In progress' : 'Not started'}
        </span>
      </div>

      {/* progress bar */}
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] tabular-nums text-[color:var(--ac-ink-faint)]">
          {course.done}/{course.total} lessons
        </span>
        <span
          className="font-mono text-[10px] font-semibold tabular-nums"
          style={{ color: isComplete ? 'var(--ac-mastery)' : 'var(--ac-ink-soft)' }}
        >
          {course.pct}%
        </span>
      </div>
      <div
        className="h-1 w-full overflow-hidden rounded-full"
        style={{ background: 'var(--ac-rule)' }}
        role="img"
        aria-label={`${course.title}: ${course.pct}% complete, ${course.done} of ${course.total} lessons`}
      >
        <span
          className="block h-full rounded-full"
          style={{
            width: `${course.pct}%`,
            background: isComplete ? 'var(--ac-mastery)' : 'var(--ac-accent)',
            transition: 'width var(--ac-dur) var(--ac-ease)',
          }}
        />
      </div>

      {/* lessons */}
      {course.lessons.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-0.5">
          {course.lessons.map((lesson) => (
            <LessonRow key={lesson.slug} lesson={lesson} />
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[12px] text-[color:var(--ac-ink-faint)]">Lessons rolling out soon.</p>
      )}
    </article>
  )
}

function TrackGroup({ track }: { track: ContentMapTrack }) {
  const t = topicMeta(track.topic)
  const pct = track.total > 0 ? Math.round((track.done / track.total) * 100) : 0
  return (
    <section aria-labelledby={`map-track-${track.topic}`} className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3 border-b pb-2" style={{ borderColor: 'var(--ac-rule)' }}>
        <h3
          id={`map-track-${track.topic}`}
          className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.1em]"
          style={{ color: 'var(--ac-ink)' }}
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} aria-hidden />
          {t.label}
        </h3>
        <span className="font-mono text-[10px] tabular-nums text-[color:var(--ac-ink-faint)]">
          {track.done}/{track.total} · {pct}%
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {track.courses.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>
    </section>
  )
}

export function ContentMap({ map }: { map: ContentMapData }) {
  return (
    <section aria-labelledby="content-map-h" className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--ac-accent-text)]">
          ◇ The map
        </p>
        <h2
          id="content-map-h"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
          style={{ fontFamily: 'var(--ac-font-display)', color: 'var(--ac-ink)' }}
        >
          Where you are in the whole journey
        </h2>
        <p className="max-w-2xl text-[14px] text-[color:var(--ac-ink-soft)]">
          Every track, course, and lesson — with what you&rsquo;ve completed, where you are now, and
          what&rsquo;s next.
        </p>
        {!map.isEmpty && (
          <p className="font-mono text-[11px] tabular-nums text-[color:var(--ac-ink-faint)]">
            {map.done}/{map.total} lessons completed across {map.tracks.length} track
            {map.tracks.length === 1 ? '' : 's'}
          </p>
        )}
      </header>

      {/* legend */}
      {!map.isEmpty && (
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Map legend">
          {(['done', 'current', 'upcoming'] as const).map((s) => (
            <li key={s} className="flex items-center gap-2 text-[12px] text-[color:var(--ac-ink-soft)]">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  background: s === 'upcoming' ? 'transparent' : STATE_COLOR[s],
                  border: s === 'upcoming' ? '1px solid var(--ac-rule-strong)' : 'none',
                }}
                aria-hidden
              />
              {STATE_LABEL[s]}
            </li>
          ))}
        </ul>
      )}

      {map.isEmpty ? (
        <div
          className="flex flex-col items-center gap-2 rounded-[var(--ac-radius)] border border-dashed px-6 py-12 text-center"
          style={{ borderColor: 'var(--ac-rule-strong)' }}
        >
          <span className="text-2xl text-[color:var(--ac-ink-faint)]" aria-hidden>
            ◇
          </span>
          <p className="text-[14px] font-medium text-[color:var(--ac-ink-soft)]">
            The map fills in as courses publish.
          </p>
          <p className="text-[12px] text-[color:var(--ac-ink-faint)]">
            No courses are live yet — new tracks ship into the engine continuously.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {map.tracks.map((track) => (
            <TrackGroup key={track.topic} track={track} />
          ))}
        </div>
      )}
    </section>
  )
}
