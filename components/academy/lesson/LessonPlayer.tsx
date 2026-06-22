'use client'

import { useEffect, useState, useTransition, type ReactNode, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { topic } from '@/lib/academy/topics'
import type { Course, Lesson, LessonBlock } from '@/data/academy/sample-course'
import { markLessonComplete } from '@/app/academy/_actions/progress'
import { SprintBlock } from './SprintBlocks'
import styles from './lesson.module.css'

const PY_KW = ['if', 'elif', 'else', 'for', 'while', 'def', 'return', 'import', 'from', 'in', 'not', 'and', 'or', 'True', 'False', 'None', 'print', 'class', 'with', 'as', 'try', 'except']
const JS_KW = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'from', 'export', 'await', 'async', 'new', 'class', 'true', 'false', 'null', 'undefined']

/** Lightweight, safe (no innerHTML) syntax highlighter for the sample blocks. Shiki swaps in later for full fidelity. */
function highlightLine(line: string, lang: string): ReactNode[] {
  const kw = lang === 'python' ? PY_KW : JS_KW
  const comment = lang === 'python' ? '#' : '//'
  const re = new RegExp(`("[^"]*"|'[^']*'|${comment === '#' ? '#' : '//'}.*$|\\b(?:${kw.join('|')})\\b|\\b\\d+(?:\\.\\d+)?\\b)`, 'g')
  const out: ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) out.push(line.slice(last, m.index))
    const tk = m[0]
    let cls = styles.kw
    if (tk.startsWith('"') || tk.startsWith("'")) cls = styles.str
    else if (tk.startsWith(comment)) cls = styles.cmt
    else if (/^\d/.test(tk)) cls = styles.num
    out.push(<span key={m.index} className={cls}>{tk}</span>)
    last = m.index + tk.length
    if (m.index === re.lastIndex) re.lastIndex++
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

function CodeBlock({ block }: { block: Extract<LessonBlock, { type: 'code' }> }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className={styles.code}>
      <div className={styles.codeBar}>
        <span className={styles.dots} aria-hidden="true"><i /><i /><i /></span>
        <span className={styles.codeName}>{block.filename}</span>
        <button
          type="button"
          className={styles.copy}
          onClick={() => {
            navigator.clipboard?.writeText(block.code)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1400)
          }}
        >
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
      <pre className={styles.codeBody}>
        {block.code.split('\n').map((line, i) => (
          <code key={i} className={styles.codeLine}>{highlightLine(line, block.language)}</code>
        ))}
      </pre>
    </div>
  )
}

function QuizBlock({ block }: { block: Extract<LessonBlock, { type: 'quiz' }> }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = selected === block.answer
  return (
    <div className={styles.quiz}>
      <span className={styles.quizKicker}>◇ Quick check</span>
      <p className={styles.quizQ}>{block.question}</p>
      <ul className={styles.quizOptions}>
        {(block.options ?? []).map((opt, i) => {
          const state = checked
            ? i === block.answer ? 'correct' : i === selected ? 'wrong' : ''
            : i === selected ? 'sel' : ''
          return (
            <li key={i}>
              <button type="button" data-state={state} disabled={checked} onClick={() => setSelected(i)}>
                {opt}
              </button>
            </li>
          )
        })}
      </ul>
      {!checked ? (
        <button type="button" className={styles.quizCheck} disabled={selected === null} onClick={() => setChecked(true)}>
          Check answer
        </button>
      ) : (
        <div className={styles.quizResult} data-correct={correct} role="status" aria-live="polite">
          <strong>{correct ? '✓ Correct!' : '✗ Not quite.'}</strong>
          {block.explanation ? <p>{block.explanation}</p> : null}
          {!correct ? (
            <button type="button" className={styles.quizRetry} onClick={() => { setChecked(false); setSelected(null) }}>Try again</button>
          ) : null}
        </div>
      )}
    </div>
  )
}

function Block({ block, labHref }: { block: LessonBlock; labHref: string }) {
  switch (block.type) {
    case 'prose':
      return <p className={styles.prose}>{block.text}</p>
    case 'code':
      return <CodeBlock block={block} />
    case 'video':
      return (
        <figure className={styles.video}>
          <button type="button" className={styles.play} aria-label={`Play: ${block.title}`}>
            <span aria-hidden="true">▶</span>
          </button>
          <figcaption className={styles.videoCap}>WATCH · {block.duration} · {block.title}</figcaption>
        </figure>
      )
    case 'lab':
      return (
        <div className={styles.lab}>
          <div>
            <span className={styles.labKicker}>⬡ Guided lab · in-browser</span>
            <h3 className={styles.labTitle}>{block.title}</h3>
            <p className={styles.labSummary}>{block.summary}</p>
          </div>
          <Link href={labHref} className={styles.labBtn}>Open lab →</Link>
        </div>
      )
    case 'callout':
      return (
        <aside className={styles.callout}>
          <span className={styles.calloutTag}>{block.tone === 'tip' ? 'TIP' : 'NOTE'}</span>
          <p>{block.text}</p>
        </aside>
      )
    case 'quiz':
      return <QuizBlock block={block} />
    default:
      // Sage Learning Engine V2 sprint sections render themselves.
      return <SprintBlock block={block} />
  }
}

export function LessonPlayer({
  course,
  lesson,
  signedIn = false,
  initialCompleted = false,
  locked = false,
  labHref,
}: {
  course: Course
  lesson: Lesson
  signedIn?: boolean
  initialCompleted?: boolean
  locked?: boolean
  /** Override the lab URL (used by the off-catalog flagship sprint). */
  labHref?: string
}) {
  const resolvedLabHref = labHref ?? `/academy/learn/${course.slug}/${lesson.slug}/lab`
  const t = topic(course.topic)
  const router = useRouter()
  const [completed, setCompleted] = useState(initialCompleted)
  const [pending, startTransition] = useTransition()
  const pct = course.lessonsTotal ? Math.round((course.lessonsDone / course.lessonsTotal) * 100) : 0
  const rootStyle = { '--topic': t.color, '--topic-soft': t.soft } as CSSProperties

  const lessonHref = (slug: string) => `/academy/learn/${course.slug}/${slug}`

  const onComplete = () => {
    startTransition(async () => {
      const res = await markLessonComplete(course.slug, lesson.slug)
      if (res.ok) {
        setCompleted(true)
        if (lesson.nextSlug) router.push(lessonHref(lesson.nextSlug)) // advance to the next lesson
        else router.refresh()
      }
    })
  }

  // Keyboard navigation: j → next lesson, k → previous, c → mark complete.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
      if (e.key === 'j' && lesson.nextSlug) { e.preventDefault(); router.push(lessonHref(lesson.nextSlug)) }
      else if (e.key === 'k' && lesson.prevSlug) { e.preventDefault(); router.push(lessonHref(lesson.prevSlug)) }
      else if (e.key === 'c' && signedIn && !completed && !pending) { e.preventDefault(); onComplete() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.nextSlug, lesson.prevSlug, signedIn, completed, pending])

  return (
    <div className={styles.root} style={rootStyle}>
      {/* top bar */}
      <header className={styles.topbar}>
        <span className={styles.crumbCourse}>{course.title.toUpperCase()}</span>
        <span className={styles.crumbSep}>/ {lesson.title}</span>
        <span className={styles.spacer} />
        <span className={styles.topProgress} aria-hidden="true">
          <span className={styles.topProgressFill} style={{ width: `${pct}%` }} />
        </span>
        <span className={styles.topPct}>{pct}%</span>
        <span className={styles.avatar} aria-hidden="true" />
      </header>

      {/* outline sidebar */}
      <aside className={styles.sidebar}>
        <h2 className={styles.courseTitle}>{course.title}</h2>
        <p className={styles.courseSub}>{course.subtitle.toUpperCase()}</p>
        <div className={styles.bar} aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
        <p className={styles.barLabel}>{pct}% complete · {course.lessonsDone} / {course.lessonsTotal} lessons</p>

        {course.modules.map((mod) => (
          <div key={mod.title} className={styles.module}>
            <p className={styles.moduleTitle}>{mod.title}</p>
            <ul className={styles.lessonList}>
              {mod.lessons.map((l) => (
                <li key={l.slug}>
                  <Link
                    href={lessonHref(l.slug)}
                    className={`${styles.lessonItem} ${l.status === 'current' ? styles.lessonOn : ''}`}
                    data-status={l.status}
                    aria-current={l.status === 'current' ? 'page' : undefined}
                  >
                    <span className={styles.lessonDot} aria-hidden="true">{l.status === 'done' ? '✓' : ''}</span>
                    <span className={styles.lessonName}>{l.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      {/* main */}
      <main className={styles.main}>
        <article className={styles.lesson}>
          <p className={styles.eyebrow}>{lesson.eyebrow}</p>
          <h1 className={styles.title}>{lesson.title}</h1>
          {locked ? (
            <div className={styles.paywall} role="region" aria-label="Membership required">
              {/* a teaser: the first block, then the gate */}
              {lesson.blocks[0] ? (
                <div className={styles.paywallTease} aria-hidden="true">
                  <Block block={lesson.blocks[0]} labHref="#" />
                </div>
              ) : null}
              <div className={styles.gate}>
                <span className={styles.gateKicker}>◆ All-access</span>
                <h2 className={styles.gateTitle}>Unlock this lesson</h2>
                <p className={styles.gateBody}>
                  This lesson is part of Sage Academy all-access. One membership opens every course,
                  lab, and certificate.
                </p>
                <Link href="/academy/join" className={styles.gateBtn}>See membership →</Link>
                {!signedIn ? (
                  <a href="/login?next=/academy/join" className={styles.gateLink}>Already a member? Sign in</a>
                ) : null}
              </div>
            </div>
          ) : (
            lesson.blocks.map((b, i) => (
              <Block key={i} block={b} labHref={resolvedLabHref} />
            ))
          )}
        </article>
      </main>

      {/* footer */}
      <footer className={styles.footer}>
        {lesson.prevSlug ? (
          <Link className={styles.prev} href={lessonHref(lesson.prevSlug)}>← {lesson.prevLabel}</Link>
        ) : (
          <span />
        )}
        <span className={styles.kbdHint} aria-hidden="true">
          <kbd>j</kbd>/<kbd>k</kbd> move · <kbd>c</kbd> complete
        </span>
        {locked ? (
          <Link className={styles.complete} href="/academy/join">Unlock all-access →</Link>
        ) : signedIn ? (
          <button
            type="button"
            className={`${styles.complete} ${completed ? styles.completeDone : ''}`}
            onClick={onComplete}
            disabled={pending}
            aria-busy={pending}
            aria-keyshortcuts="c"
          >
            {completed ? '✓ Completed · continue →' : pending ? 'Saving…' : 'Mark complete & continue  →'}
          </button>
        ) : (
          <a className={styles.complete} href="/login?next=/academy/preview">
            Sign in to save progress  →
          </a>
        )}
      </footer>
    </div>
  )
}
