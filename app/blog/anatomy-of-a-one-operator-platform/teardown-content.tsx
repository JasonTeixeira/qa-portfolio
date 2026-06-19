'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CountUp } from '@/components/motion/CountUp'
import { SurfaceSystemXray } from '@/components/work/SurfaceSystemXray'
import styles from './teardown.module.css'

const receipts = [
  { value: '185', label: 'PostgreSQL tables' },
  { value: '69', label: 'API endpoints' },
  { value: '61', label: 'test suites' },
  { value: '0', label: 'billing incidents' },
  { value: '200+', label: 'AI queries / week' },
  { value: '1', label: 'operator' },
]

export function TeardownContent() {
  const rootRef = useRef<HTMLElement>(null)

  // Reveal-on-scroll: rise + fade. Huge top rootMargin so anything scrolled
  // past still reveals (no stranded content on fast scrolls / anchor jumps).
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const els = Array.from(root.querySelectorAll<HTMLElement>(`.${styles.reveal}`))
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.in)
            io.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '9999px 0px -12% 0px', threshold: 0 },
    )
    els.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 4, 3) * 0.08}s`
      io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  return (
    <article ref={rootRef} className={styles.article}>
      {/* ── FULL-BLEED HERO ── */}
      <header className={styles.hero}>
        <Image
          src="/work/heroes/nexural.png"
          alt="The Nexural trading platform dashboard"
          fill
          priority
          sizes="100vw"
          className={styles.heroImg}
        />
        <div className={styles.heroScrim} aria-hidden />
        <div className={styles.heroInner}>
          <p className={styles.kicker}>Field note · Fintech · Build record</p>
          <h1 className={`${styles.display} ${styles.heroTitle}`}>
            Anatomy of a <em>one-operator</em> platform
          </h1>
          <p className={styles.lede}>
            Nexural is a production trading platform — real-time execution, portfolio tracking, a
            Discord-native AI companion, Stripe billing. 185 database tables. 69 API endpoints. Built
            and run by one person. Here&apos;s how the architecture had to be right before anything else
            could exist.
          </p>
        </div>
      </header>

      {/* ── OPENING ── */}
      <section className={styles.column}>
        <p className={`${styles.reveal} ${styles.body}`} style={{ fontSize: 'clamp(1.2rem,1.05rem+0.7vw,1.55rem)', color: 'var(--sage-ink-subtle)' }}>
          Most trading tools fall into one of two traps: consumer apps so simplified they&apos;re
          useless to a serious trader, or enterprise platforms so complex they need an ops team just to
          configure. Nexural was built for the gap between them — <strong>institutional rigor, one
          operator</strong>. The constraint was never ambition. It was discipline.
        </p>
      </section>

      {/* ── GIANT STAT MOMENT ── */}
      <section className={styles.statBlock}>
        <p className={styles.eyebrow}>Before a single screen existed</p>
        <div className={styles.statNum}>
          <CountUp value="185" durationMs={1600} />
        </div>
        <p className={styles.statCaption}>
          database tables — fully row-level-security isolated — designed in the first two weeks. No UI.
          No API. Just the data model, mapped until it was right.
        </p>
      </section>

      {/* ── THE PROBLEM ── */}
      <section className={styles.column}>
        <p className={`${styles.reveal} ${styles.eyebrow}`}>01 — The constraint</p>
        <h2 className={`${styles.reveal} ${styles.sectionTitle}`}>
          Build the foundation, or build nothing.
        </h2>
        <p className={`${styles.reveal} ${styles.body}`}>
          The challenge wasn&apos;t any single feature. It was building a system at scale — 185
          relational tables, real-time market-data ingestion, and a Stripe integration that survives
          every webhook retry — <strong>without a backend team, a QA department, or a six-month runway
          for architecture review.</strong>
        </p>
        <p className={`${styles.reveal} ${styles.body}`}>
          So the order of operations was inverted. The first two weeks were pure entity-relationship
          design: understanding where the RLS policies needed to live, and mapping every Stripe event to
          a database state — before a line of interface was written.
        </p>
      </section>

      {/* ── THE SYSTEM — X-RAY ── */}
      <section className={`${styles.column} ${styles.columnWide}`}>
        <p className={`${styles.reveal} ${styles.eyebrow}`}>02 — Surface ⇄ system</p>
        <h2 className={`${styles.reveal} ${styles.sectionTitle}`} style={{ marginBottom: '2.4rem' }}>
          The product people touch, and the seven services beneath it.
        </h2>
      </section>
      <SurfaceSystemXray
        surfaceSrc="/work/heroes/nexural.png"
        systemSrc="/images/diagrams/nexural-ecosystem.svg"
        surfaceAlt="Nexural trading dashboard"
        systemAlt="Nexural system architecture map"
        caption="Trading platform, Discord-native AI bot, billing, real-time market data — seven services talking through typed contracts."
        travelVh={200}
      />

      {/* ── THE APPROACH ── */}
      <section className={styles.column}>
        <p className={`${styles.reveal} ${styles.eyebrow}`}>03 — The build</p>
        <h2 className={`${styles.reveal} ${styles.sectionTitle}`}>
          Typed contracts, idempotent everything.
        </h2>
        <p className={`${styles.reveal} ${styles.body}`}>
          PostgreSQL on Supabase with row-level security for multi-tenant isolation; realtime channels
          for live portfolio state. FastAPI — async-first, Pydantic-typed, domain-bounded. Next.js with
          server components for the data-heavy pages and client components for the trading UI.
        </p>
        <p className={`${styles.reveal} ${styles.body}`}>
          The Stripe layer runs on idempotency keys and event deduplication — a retry storm of duplicate
          webhooks collapses into exactly <strong>one</strong> state change. That pattern is now an
          open-source template. The Discord bot uses function-calling against the live portfolio API, so
          &quot;how is my AAPL position&quot; returns real data, not hallucinated commentary.
        </p>
      </section>

      {/* ── PULL QUOTE ── */}
      <section className={styles.column}>
        <blockquote className={`${styles.reveal} ${styles.pullQuote}`}>
          “Don&apos;t build features until the foundation is right.”
        </blockquote>
        <p className={`${styles.reveal} ${styles.pullCite}`}>The operating principle</p>
      </section>

      {/* ── THE RECEIPTS ── */}
      <section className={`${styles.column} ${styles.columnWide}`}>
        <p className={`${styles.reveal} ${styles.eyebrow}`}>04 — Measured, not asserted</p>
        <h2 className={`${styles.reveal} ${styles.sectionTitle}`} style={{ marginBottom: '2.2rem' }}>
          The receipts.
        </h2>
        <div className={`${styles.reveal} ${styles.receipts}`}>
          {receipts.map((r) => (
            <div className={styles.receiptCell} key={r.label}>
              <div className={styles.receiptValue}>
                <CountUp value={r.value} />
              </div>
              <div className={styles.receiptLabel}>{r.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CLOSE ── */}
      <section className={styles.close}>
        <p className={`${styles.reveal} ${styles.eyebrow}`}>The build record</p>
        <h2 className={`${styles.reveal} ${styles.display}`} style={{ fontSize: 'clamp(2.2rem,1.3rem+3.6vw,4.4rem)', maxWidth: '16ch', margin: '0 auto' }}>
          Want this engine pointed at your problem?
        </h2>
        <div className={`${styles.reveal} ${styles.ctaRow}`}>
          <Link href="/contact?source=nexural_teardown" className={styles.ctaPrimary}>
            Start a project <span aria-hidden>→</span>
          </Link>
          <Link href="/work/nexural" className={styles.ctaGhost}>
            See the full case study <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </article>
  )
}
