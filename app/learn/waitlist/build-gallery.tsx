'use client'

import { useState } from 'react'
import styles from './waitlist.module.css'

type Build = { path: Path; name: string; what: string; tech: string }
type Path = 'Foundations' | 'AI Engineering' | 'Ship Real Products'

const PATHS: Path[] = ['Foundations', 'AI Engineering', 'Ship Real Products']

const BUILDS: Build[] = [
  { path: 'Foundations', name: 'Terminal guessing game', what: 'Your very first program — variables, loops, logic.', tech: 'Python' },
  { path: 'Foundations', name: 'Live weather CLI', what: 'A command-line tool that calls a real API.', tech: 'Python · APIs' },
  { path: 'Foundations', name: 'Web scraper → dataset', what: 'Pull real data off the web into a clean file.', tech: 'Python' },
  { path: 'Foundations', name: 'Password strength meter', what: 'Validation, edge cases, and clean functions.', tech: 'JavaScript' },
  { path: 'Foundations', name: 'Habit tracker', what: 'Store, read, and update real data.', tech: 'JS · Storage' },
  { path: 'AI Engineering', name: 'Streaming AI chatbot', what: 'Real LLM replies, token by token, live.', tech: 'LLM API' },
  { path: 'AI Engineering', name: 'Doc-search assistant', what: 'Answers grounded in your docs — with citations.', tech: 'RAG · Vectors' },
  { path: 'AI Engineering', name: 'Tool-using agent', what: 'An AI that takes actions, not just talks.', tech: 'Agents' },
  { path: 'AI Engineering', name: 'Self-grading evals', what: 'Measure whether your AI is actually any good.', tech: 'Evals' },
  { path: 'AI Engineering', name: 'Voice assistant', what: 'Talk to it; it talks back.', tech: 'Speech · LLM' },
  { path: 'AI Engineering', name: 'AI photo tagger', what: 'A vision pipeline that labels images for you.', tech: 'Vision' },
  { path: 'Ship Real Products', name: 'Full-stack SaaS', what: 'Auth, database, and Stripe billing — live.', tech: 'Next.js · Supabase' },
  { path: 'Ship Real Products', name: 'A waitlist page', what: 'Exactly like the one you’re reading now.', tech: 'Next.js' },
  { path: 'Ship Real Products', name: 'Real-time dashboard', what: 'Live data, charts, the whole instrument.', tech: 'React' },
  { path: 'Ship Real Products', name: 'Chrome extension', what: 'Ship a tool people actually install.', tech: 'JS · Web APIs' },
  { path: 'Ship Real Products', name: 'Deploy to a live URL', what: 'A real product on the internet, shareable.', tech: 'Vercel' },
]

const COUNT: Record<Path, number> = {
  Foundations: BUILDS.filter((b) => b.path === 'Foundations').length,
  'AI Engineering': BUILDS.filter((b) => b.path === 'AI Engineering').length,
  'Ship Real Products': BUILDS.filter((b) => b.path === 'Ship Real Products').length,
}

export function BuildGallery() {
  const [filter, setFilter] = useState<'All' | Path>('All')
  const shown = filter === 'All' ? BUILDS : BUILDS.filter((b) => b.path === filter)

  return (
    <div className={styles.gallery} data-reveal>
      <div className={styles.galleryTabs} role="tablist" aria-label="Filter by path">
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'All'}
          className={`${styles.galleryTab} ${filter === 'All' ? styles.galleryTabOn : ''}`}
          onClick={() => setFilter('All')}
        >
          Everything <span>{BUILDS.length}</span>
        </button>
        {PATHS.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={filter === p}
            className={`${styles.galleryTab} ${filter === p ? styles.galleryTabOn : ''}`}
            onClick={() => setFilter(p)}
          >
            {p} <span>{COUNT[p]}</span>
          </button>
        ))}
      </div>

      <div className={styles.galleryGrid}>
        {shown.map((b, i) => (
          <article className={styles.buildCard} key={b.name} style={{ animationDelay: `${(i % 8) * 0.04}s` }}>
            <span className={styles.buildPath} data-path={b.path}>
              {b.path}
            </span>
            <h3 className={styles.buildName}>{b.name}</h3>
            <p className={styles.buildWhat}>{b.what}</p>
            <span className={styles.buildTech}>{b.tech}</span>
          </article>
        ))}
      </div>

      <p className={styles.galleryNote}>
        …and new guided labs drop every week. <strong>Founding members vote on what we build next.</strong>
      </p>
    </div>
  )
}
