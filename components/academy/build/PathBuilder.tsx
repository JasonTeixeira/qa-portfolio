'use client'

import { useEffect, useMemo, useState, useTransition, type CSSProperties } from 'react'
import Link from 'next/link'
import { topic, TOPICS, type TopicKey } from '@/lib/academy/topics'
import type { CourseItem } from '@/data/academy/learn-catalog'
import { saveBuiltPath } from '@/app/academy/_actions/paths'
import { Icon } from '@/components/academy/ui/Icon'
import styles from './build.module.css'

const STORE_KEY = 'sage-academy-path'
const TOPIC_CHIPS: Array<'all' | TopicKey> = ['all', 'foundations', 'ai-engineering', 'ship-it']

const PRESETS: Array<{ key: string; label: string; sub: string; slugs: string[] }> = [
  { key: 'ai-saas', label: 'AI SaaS Founder', sub: 'idea to shipped product', slugs: ['python-basics', 'the-llm-api', 'rag-retrieval', 'nextjs-supabase', 'stripe-auth'] },
  { key: 'ai-engineer', label: 'AI Engineer', sub: 'LLMs, RAG, agents', slugs: ['python-basics', 'the-llm-api', 'prompt-engineering', 'rag-retrieval', 'agents-tool-use'] },
  { key: 'fullstack', label: 'Full-stack Builder', sub: 'code to deployed', slugs: ['git-the-terminal', 'python-basics', 'data-structures', 'nextjs-supabase', 'stripe-auth'] },
  { key: 'blank', label: 'Start blank', sub: 'pick everything yourself', slugs: [] },
]

function tvars(key: TopicKey): CSSProperties {
  const t = topic(key)
  return { '--topic': t.color, '--topic-soft': t.soft } as CSSProperties
}

export function PathBuilder({ courses }: { courses: CourseItem[] }) {
  const [pathSlugs, setPathSlugs] = useState<string[]>([])
  const [topicFilter, setTopicFilter] = useState<'all' | TopicKey>('all')
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '[]')
      if (Array.isArray(saved)) setPathSlugs(saved.filter((s) => typeof s === 'string'))
    } catch {
      /* no-op */
    }
    setHydrated(true)
  }, [])
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(pathSlugs))
      } catch {
        /* no-op */
      }
    }
  }, [pathSlugs, hydrated])

  const bySlug = useMemo(() => Object.fromEntries(courses.map((c) => [c.slug, c])), [courses])
  const path = pathSlugs.map((s) => bySlug[s]).filter(Boolean) as CourseItem[]
  const pool = courses.filter((c) => topicFilter === 'all' || c.topic === topicFilter)

  const inPath = (slug: string) => pathSlugs.includes(slug)
  const toggle = (slug: string) => {
    setActivePreset(null)
    setPathSlugs((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]))
  }
  const remove = (slug: string) => { setActivePreset(null); setPathSlugs((p) => p.filter((s) => s !== slug)) }
  const move = (i: number, dir: -1 | 1) =>
    setPathSlugs((p) => {
      const j = i + dir
      if (j < 0 || j >= p.length) return p
      const next = [...p]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  const applyPreset = (preset: (typeof PRESETS)[number]) => { setActivePreset(preset.key); setPathSlugs(preset.slugs) }

  const totals = {
    courses: path.length,
    lessons: path.reduce((n, c) => n + c.lessons, 0),
    hours: path.reduce((n, c) => n + c.hours, 0),
  }

  const [saving, startSaving] = useTransition()
  const [saveMsg, setSaveMsg] = useState('')
  const onSave = () => {
    setSaveMsg('')
    startSaving(async () => {
      const res = await saveBuiltPath(pathSlugs)
      setSaveMsg(res.signedIn ? 'Saved to account' : 'Sign in to save')
    })
  }

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <p className={styles.kicker}>Modular · build your own path</p>
        <h1 className={styles.title}>Assemble the exact track you want.</h1>
        <p className={styles.subtitle}>
          Start from an outcome or a blank slate, add the courses + labs you care about, and order them your way.
          Your path saves automatically.
        </p>
      </header>

      {/* outcome presets */}
      <div className={styles.presets} role="group" aria-label="Start from an outcome">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`${styles.preset} ${activePreset === p.key ? styles.presetOn : ''}`}
            onClick={() => applyPreset(p)}
          >
            <span className={styles.presetLabel}>{p.label}</span>
            <span className={styles.presetSub}>{p.sub}</span>
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {/* course pool */}
        <section className={styles.pool} aria-label="Add courses">
          <div className={styles.poolHead}>
            <h2 className={styles.h2}>Add courses</h2>
            <div className={styles.chips}>
              {TOPIC_CHIPS.map((key) => {
                const on = topicFilter === key
                return (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.chip} ${on ? styles.chipOn : ''}`}
                    style={key === 'all' ? undefined : tvars(key)}
                    data-all={key === 'all' ? 'true' : undefined}
                    onClick={() => setTopicFilter(key)}
                  >
                    {key === 'all' ? 'All' : TOPICS[key].label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className={styles.poolGrid}>
            {pool.map((c) => {
              const added = inPath(c.slug)
              return (
                <article key={c.slug} className={`${styles.card} ${added ? styles.cardAdded : ''}`} style={tvars(c.topic)}>
                  <div className={styles.cardTop}>
                    <span className={styles.cardTag}>{TOPICS[c.topic].label}</span>
                    <span className={styles.cardLevel}>{c.level}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{c.title}</h3>
                  <span className={styles.cardMeta}>{c.lessons} lessons · {c.hours}h</span>
                  <button type="button" className={styles.addBtn} onClick={() => toggle(c.slug)} aria-pressed={added}>
                    {added ? (
                      <>
                        <Icon name="check" size={14} aria-hidden="true" /> Added
                      </>
                    ) : (
                      <>
                        <Icon name="plus" size={14} aria-hidden="true" /> Add to path
                      </>
                    )}
                  </button>
                </article>
              )
            })}
          </div>
        </section>

        {/* your path */}
        <aside className={styles.track} aria-label="Your path">
          <div className={styles.trackInner}>
            <div className={styles.trackHead}>
              <h2 className={styles.trackTitle}>Your path</h2>
              <span className={styles.savedTag} aria-hidden="true">saved on this device</span>
            </div>
            <div className={styles.totals}>
              <div><dt>{totals.courses}</dt><dd>courses</dd></div>
              <div><dt>{totals.lessons}</dt><dd>lessons</dd></div>
              <div><dt>{totals.hours}h</dt><dd>est. time</dd></div>
            </div>

            {path.length === 0 ? (
              <p className={styles.empty}>Pick an outcome above, or add courses from the left to start building your track.</p>
            ) : (
              <ol className={styles.steps}>
                {path.map((c, i) => (
                  <li key={c.slug} className={styles.step} style={tvars(c.topic)}>
                    <span className={styles.stepNum}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={styles.stepDot} aria-hidden="true" />
                    <span className={styles.stepBody}>
                      <span className={styles.stepName}>{c.title}</span>
                      <span className={styles.stepMeta}>{TOPICS[c.topic].label} · {c.lessons} lessons</span>
                    </span>
                    <span className={styles.stepCtrls}>
                      <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"><Icon name="chevron-up" size={15} aria-hidden="true" /></button>
                      <button type="button" onClick={() => move(i, 1)} disabled={i === path.length - 1} aria-label="Move down"><Icon name="chevron-down" size={15} aria-hidden="true" /></button>
                      <button type="button" onClick={() => remove(c.slug)} aria-label="Remove" className={styles.stepRemove}><Icon name="x" size={15} aria-hidden="true" /></button>
                    </span>
                  </li>
                ))}
              </ol>
            )}

            <div className={styles.trackFoot}>
              <Link
                href={path.length ? `/academy/course/${path[0].slug}` : '/academy/catalog'}
                className={`${styles.startBtn} ${path.length === 0 ? styles.startDisabled : ''}`}
                aria-disabled={path.length === 0}
                tabIndex={path.length === 0 ? -1 : 0}
              >
                Start my path
                <Icon name="arrow-right" size={16} aria-hidden="true" />
              </Link>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={onSave}
                disabled={saving || path.length === 0}
              >
                {saving ? 'Saving…' : saveMsg || 'Save to account'}
              </button>
              <Link href="/academy/catalog" className={styles.backLink}>
                <Icon name="arrow-left" size={14} aria-hidden="true" />
                Back to catalog
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
