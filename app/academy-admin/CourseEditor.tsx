'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { saveCourse } from './_actions'
import styles from './studio.module.css'

/* eslint-disable @typescript-eslint/no-explicit-any */
const TOPICS = ['foundations', 'ai-engineering', 'ship-it', 'growth', 'data']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export function CourseEditor({ course, lessons }: { course: any; lessons: any[] }) {
  const [title, setTitle] = useState(course.title ?? '')
  const [subtitle, setSubtitle] = useState(course.subtitle ?? '')
  const [topic, setTopic] = useState(course.topic ?? 'foundations')
  const [level, setLevel] = useState(course.level ?? 'Beginner')
  const [hours, setHours] = useState(String(course.hours ?? 0))
  const [sort, setSort] = useState(String(course.sort ?? 0))
  const [status, setStatus] = useState(course.status ?? 'published')
  const [saving, start] = useTransition()
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const onSave = () => {
    setMsg(null)
    start(async () => {
      const res = await saveCourse({ slug: course.slug, title, subtitle, topic, level, hours: Number(hours) || 0, sort: Number(sort) || 0, status })
      setMsg(res.ok ? { kind: 'ok', text: 'Saved ✓' } : { kind: 'err', text: res.error ?? 'Save failed' })
    })
  }

  return (
    <div className={styles.page}>
      <nav className={styles.crumb}><Link href="/academy-admin">Studio</Link> / {course.slug}</nav>
      <p className={styles.kicker}>Course editor</p>
      <h1 className={styles.h1}>{title || course.slug}</h1>

      <div className={styles.form} style={{ marginTop: '1.4rem' }}>
        <div className={styles.field}>
          <span className={styles.label}>Title</span>
          <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Subtitle</span>
          <input className={styles.input} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Python · JS · the terminal" />
        </div>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <span className={styles.label}>Topic</span>
            <select className={styles.select} value={topic} onChange={(e) => setTopic(e.target.value)}>
              {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Level</span>
            <select className={styles.select} value={level} onChange={(e) => setLevel(e.target.value)}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <span className={styles.label}>Est. hours</span>
            <input className={`${styles.input} ${styles.mono}`} value={hours} onChange={(e) => setHours(e.target.value)} inputMode="numeric" />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Sort / Status</span>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <input className={`${styles.input} ${styles.mono}`} value={sort} onChange={(e) => setSort(e.target.value)} inputMode="numeric" />
              <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="published">published</option>
                <option value="draft">draft</option>
              </select>
            </div>
          </div>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.save} onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save course'}</button>
          <Link href={`/academy/course/${course.slug}`} className={styles.ghost} target="_blank">Preview →</Link>
          {msg ? <span className={`${styles.msg} ${msg.kind === 'err' ? styles.msgErr : styles.msgOk}`}>{msg.text}</span> : null}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.h2}>Lessons ({lessons.length})</h2>
          <Link href={`/academy-admin/${course.slug}/new`} className={styles.save} style={{ textDecoration: 'none' }}>+ New lesson</Link>
        </div>
        {lessons.length === 0 ? (
          <p className={styles.msg}>No lessons yet — add the first one.</p>
        ) : (
          <ul className={styles.list}>
            {lessons.map((l) => (
              <li key={l.slug}>
                <Link href={`/academy-admin/${course.slug}/${l.slug}`} className={styles.row}>
                  <span className={styles.rowTitle}>{l.title}</span>
                  {l.is_free_preview ? <span className={styles.badge}>free</span> : null}
                  <span className={`${styles.badge} ${l.status === 'published' ? styles.badgePub : styles.badgeDraft}`}>{l.status}</span>
                  <span className={styles.rowMeta}>{l.module_title} · {l.est_minutes}m</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
