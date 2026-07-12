'use client'

import { useState } from 'react'
import styles from './waitlist.module.css'

type Build = { path: Path; name: string; what: string; tech: string }
type Path = 'Foundations' | 'AI Engineering' | 'Ship Real Products'

const PATHS: Path[] = ['Foundations', 'AI Engineering', 'Ship Real Products']

const BUILDS: Build[] = [
  { path: 'Foundations', name: 'An AI that roasts your code', what: 'Feed it your code; get back a brutally funny review.', tech: 'Python · LLM' },
  { path: 'Foundations', name: 'Crypto price-alert bot', what: 'It DMs you the second your coin moves 5%.', tech: 'Python · APIs' },
  { path: 'Foundations', name: 'A terminal dungeon game', what: 'A text adventure you actually play — your first real program.', tech: 'Python' },
  { path: 'Foundations', name: 'A meme generator', what: 'Auto-caption images and post them.', tech: 'Python' },
  { path: 'Foundations', name: 'Wikipedia-race solver', what: 'Scrape, map links, and find the shortest path.', tech: 'Python' },
  { path: 'AI Engineering', name: 'Build a website from a sentence', what: '“A landing page for my startup” → a live site.', tech: 'LLM · Codegen' },
  { path: 'AI Engineering', name: 'Summarize any YouTube video', what: 'Paste a link, get the TL;DR in seconds.', tech: 'LLM · Transcripts' },
  { path: 'AI Engineering', name: 'An agent that books things', what: 'It takes real actions — not just chat.', tech: 'Agents · Tools' },
  { path: 'AI Engineering', name: 'Clone your own voice', what: 'A voice that sounds exactly like you.', tech: 'Speech AI' },
  { path: 'AI Engineering', name: 'AI study buddy that quizzes you', what: 'Turns any notes into flashcards and grills you.', tech: 'RAG · LLM' },
  { path: 'AI Engineering', name: 'Doc-search with citations', what: 'Answers grounded in your docs — sources attached.', tech: 'RAG · Vectors' },
  { path: 'Ship Real Products', name: 'A SaaS that charges money', what: 'Auth, database, Stripe billing — your first paying users.', tech: 'Next.js · Stripe' },
  { path: 'Ship Real Products', name: 'A viral waitlist page', what: 'Exactly like the one you’re on — referrals and all.', tech: 'Next.js' },
  { path: 'Ship Real Products', name: 'AI distraction blocker', what: 'A Chrome extension that knows when you’re slacking.', tech: 'JS · AI' },
  { path: 'Ship Real Products', name: 'A real-time multiplayer app', what: 'Live cursors, presence, the works.', tech: 'WebSockets' },
  { path: 'Ship Real Products', name: 'An AI support agent — live', what: 'Answers your customers 24/7, deployed.', tech: 'RAG · Next.js' },
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
