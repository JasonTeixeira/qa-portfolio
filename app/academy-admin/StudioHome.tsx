'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { saveCourse } from './_actions'
import type { AdminCourseRow } from '@/lib/academy/admin'
import { Icon } from '@/components/academy/ui/Icon'
import { SageMark } from '@/components/academy/brand/SageMark'
import styles from './studio.module.css'

const TOPICS = ['foundations', 'ai-engineering', 'ship-it', 'growth', 'data']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export function StudioHome({ courses, fieldNoteCount }: { courses: AdminCourseRow[]; fieldNoteCount: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  // — REAL numbers only, all derived from the loaded courses + field notes —
  const publishedCount = courses.filter((c) => c.status === 'published').length
  const draftCount = courses.length - publishedCount
  const totalLessons = courses.reduce((sum, c) => sum + (c.lessons ?? 0), 0)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [topic, setTopic] = useState('foundations')
  const [level, setLevel] = useState('Beginner')
  const [saving, start] = useTransition()
  const [err, setErr] = useState('')

  const create = () => {
    setErr('')
    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    start(async () => {
      const res = await saveCourse({ slug: finalSlug, title, topic, level, sort: courses.length + 1 })
      if (res.ok && res.slug) router.push(`/academy-admin/${res.slug}`)
      else setErr(res.error ?? 'Could not create')
    })
  }

  return (
    <div className={styles.shell}>
      <header className={styles.appBar}>
        <Link href="/academy-admin" className={styles.brand}>
          <SageMark size={24} radius={7} bg="#E0A93E" fg="#0B0B0E" glow={false} />
          <span className={styles.wordmark}>Sage Studio</span>
          <span className={styles.authorPill}>Author</span>
        </Link>
        <span className={styles.appBarCrumb}>Sage Academy · content studio</span>
        <div className={styles.appBarRight}>
          <button type="button" className={styles.publish} onClick={() => setOpen((v) => !v)}>{open ? 'Close' : '+ New course'}</button>
        </div>
      </header>

      <div className={styles.statsStrip}>
        <div className={styles.statsInner} aria-label="Studio content stats">
          <span className={styles.stat}><span className={styles.statNum}>{courses.length}</span> courses</span>
          <span className={styles.stat}><span className={styles.statNum}>{publishedCount}</span> live</span>
          {draftCount > 0 ? <span className={styles.stat}><span className={styles.statNum}>{draftCount}</span> draft</span> : null}
          <span className={styles.stat}><span className={styles.statNum}>{totalLessons}</span> published lessons</span>
          <span className={styles.stat}><span className={styles.statNum}>{fieldNoteCount}</span> field notes</span>
          <Link href="/academy-admin/metrics" className={styles.statLink}>measurement →</Link>
        </div>
      </div>

      <div className={styles.shellBody}>
      <p className={styles.kicker}>Authoring studio</p>
      <h1 className={styles.h1}>Sage Academy — Studio</h1>
      <p className={styles.sub}>Create and edit courses, lessons, and content blocks. Changes publish to the live academy.</p>

      <nav className={styles.crumb} aria-label="Admin surfaces" style={{ marginTop: '1rem', marginBottom: 0 }}>
        <Link href="/academy-admin/metrics">Measurement <Icon name="arrow-right" size={13} aria-hidden="true" /></Link>
        <span aria-hidden="true">·</span>
        <Link href="/academy-admin/experiments">Experiments <Icon name="arrow-right" size={13} aria-hidden="true" /></Link>
      </nav>

      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.h2}>Courses ({courses.length})</h2>
          <button type="button" className={styles.save} onClick={() => setOpen((v) => !v)}>{open ? 'Close' : '+ New course'}</button>
        </div>

        {open ? (
          <div className={styles.form} style={{ marginBottom: '1rem' }}>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <span className={styles.label}>Title</span>
                <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Python Basics" autoFocus />
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Slug (optional)</span>
                <input className={`${styles.input} ${styles.mono}`} value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="auto from title" />
              </div>
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
            <div className={styles.actions}>
              <button type="button" className={styles.save} onClick={create} disabled={saving || !title}>{saving ? 'Creating…' : 'Create course'}</button>
              {err ? <span className={`${styles.msg} ${styles.msgErr}`}>{err}</span> : null}
            </div>
          </div>
        ) : null}

        {courses.length === 0 ? (
          <p className={styles.msg}>No courses yet — create your first.</p>
        ) : (
          <ul className={styles.list}>
            {courses.map((c) => (
              <li key={c.slug}>
                <Link href={`/academy-admin/${c.slug}`} className={styles.row}>
                  <span className={styles.rowTitle}>{c.title}</span>
                  <span className={styles.badge}>{c.topic}</span>
                  <span className={`${styles.badge} ${c.status === 'published' ? styles.badgePub : styles.badgeDraft}`}>{c.status}</span>
                  <span className={styles.rowMeta}>{c.lessons} lessons</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
    </div>
  )
}
