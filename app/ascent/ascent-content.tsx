'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ReactLenis } from 'lenis/react'
import { CinematicBackdrop } from '@/components/motion/CinematicBackdrop'
import styles from './ascent.module.css'

export function AscentContent() {
  const rootRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)

  // Custom cursor — a dot that swells over interactive targets.
  useEffect(() => {
    if (window.matchMedia('(max-width: 900px)').matches) return
    const cur = cursorRef.current
    if (!cur) return
    let raf = 0
    let x = 0
    let y = 0
    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0
          cur.style.transform = `translate3d(${x}px, ${y}px, 0)`
        })
      }
    }
    const over = (e: PointerEvent) => {
      const hot = (e.target as Element | null)?.closest('a, button, [data-hot]')
      cur.classList.toggle(styles.cursorHot, Boolean(hot))
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Scroll reveals for the chapters below the fold.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const els = Array.from(root.querySelectorAll<HTMLElement>(`.${styles.rise}`))
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
      el.style.transitionDelay = `${Math.min(i % 4, 3) * 0.09}s`
      io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  return (
    <ReactLenis root options={{ lerp: 0.09, smoothWheel: true }}>
      <div ref={rootRef} className={styles.root}>
        <div className={styles.curtain} aria-hidden />
        <div ref={cursorRef} className={styles.cursor} aria-hidden />

        <header className={styles.chrome}>
          <span className={styles.seal}>
            <b aria-hidden>道</b> Sage&nbsp;Ideas
          </span>
          <span className={styles.chapterMark}>The Ascent</span>
        </header>

        {/* ── CHAPTER 1 — ARRIVAL (cool valley mist) ── */}
        <section className={styles.chapter}>
          <CinematicBackdrop src="/art/inkwash-cliffs.png" brightness={0.52} parallax={96} textAnchor="bottom-left" />
          <div className={`${styles.chapterInner} ${styles.reveal}`}>
            <p className={styles.kicker}>Sage Ideas · AI-native studio · since 2020</p>
            <h1 className={`${styles.display} ${styles.title}`}>
              <span className={styles.line}><span>I build the product,</span></span>
              <span className={styles.line}><span>the brand, and the</span></span>
              <span className={styles.line}>
                <span>
                  <em>AI</em> that runs it.
                </span>
              </span>
            </h1>
            <p className={styles.lede}>
              One craftsman, not a committee. Product, brand, AI systems, and growth — built as a
              single operating machine, by the person who actually ships it.
            </p>
          </div>
          <div className={styles.cue} aria-hidden>
            <span>Begin the ascent</span>
            <span className={styles.cueLine} />
          </div>
        </section>

        {/* ── CHAPTER 2 — THE FORGE (the climb) ── */}
        <section className={styles.chapter}>
          <CinematicBackdrop src="/art/inkwash-cliffs.png" brightness={0.34} parallax={72} textAnchor="center" />
          <div className={styles.chapterInner} style={{ justifyContent: 'center' }}>
            <p className={`${styles.kicker} ${styles.rise}`}>01 — The forge</p>
            <h2 className={`${styles.statement} ${styles.rise}`}>
              I run my own products. <em>Then I build yours.</em>
            </h2>
            <div className={`${styles.metaRow} ${styles.rise}`}>
              <div><strong>185</strong><span>db tables shipped</span></div>
              <div><strong>69</strong><span>api endpoints</span></div>
              <div><strong>4</strong><span>owned products</span></div>
              <div><strong>2020</strong><span>building since</span></div>
            </div>
          </div>
        </section>

        {/* ── CHAPTER 3 — THE SUMMIT (warm dawn) ── */}
        <section className={styles.chapter}>
          <CinematicBackdrop src="/art/sunset-pagoda.png" brightness={0.5} parallax={84} textAnchor="bottom" />
          <div className={styles.chapterInner} style={{ alignItems: 'flex-start' }}>
            <p className={`${styles.kicker} ${styles.rise}`}>The summit</p>
            <h2 className={`${styles.statement} ${styles.rise}`}>
              Build the system. <em>Walk the path.</em>
            </h2>
            <div className={`${styles.actions} ${styles.rise}`}>
              <Link href="/contact?source=ascent" className={`${styles.cta} ${styles.ctaPrimary}`} data-hot>
                Start a project <span aria-hidden>→</span>
              </Link>
              <Link href="/work" className={`${styles.cta} ${styles.ctaGhost}`} data-hot>
                See the work <span aria-hidden>↘</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </ReactLenis>
  )
}
