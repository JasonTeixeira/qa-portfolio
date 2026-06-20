'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import Lenis from 'lenis'
import styles from './proto.module.css'

const EASE = [0.16, 1, 0.3, 1] as const

/* Custom cursor — thin ring, difference blend, scales over interactive targets */
function Cursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 600, damping: 38, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 600, damping: 38, mass: 0.4 })
  const [active, setActive] = useState(false)
  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      setActive(!!t?.closest?.('[data-cursor]'))
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
    }
  }, [x, y])
  return (
    <motion.div
      className={styles.cursor}
      style={{ x: sx, y: sy }}
      animate={{ scale: active ? 3.4 : 1, opacity: active ? 0.6 : 1 }}
      transition={{ duration: 0.3, ease: EASE }}
    />
  )
}

function Magnetic({ children, className, href }: { children: React.ReactNode; className?: string; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 240, damping: 15 })
  const sy = useSpring(y, { stiffness: 240, damping: 15 })
  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    x.set((e.clientX - (r.left + r.width / 2)) * 0.34)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.34)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }
  return (
    <motion.a ref={ref} href={href} className={className} data-cursor style={{ x: sx, y: sy }} onMouseMove={onMove} onMouseLeave={reset}>
      {children}
    </motion.a>
  )
}

function Line({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <span className={styles.line}>
      <motion.span style={{ display: 'block' }} initial={{ y: '115%' }} animate={{ y: 0 }} transition={{ duration: 1.05, ease: EASE, delay }}>
        {children}
      </motion.span>
    </span>
  )
}

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 44 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-90px' }} transition={{ duration: 0.95, ease: EASE, delay }}>
      {children}
    </motion.div>
  )
}

const CAPS = ['AI Systems', 'Applications', 'SaaS Platforms', 'Brand & Web', 'Growth & SEO', 'Cloud & Infra']
const STEPS = [
  ['Audit', 'Find the single highest-leverage bottleneck and leave with a scoped, costed plan you own.', 'Days 1–5 · from $1,500'],
  ['Sprint', 'Ship one visible, production-grade improvement — real code, deployed, measured.', 'Weeks 1–2 · from $4,500'],
  ['Build', 'Turn the validated direction into the live product, site, AI systems, and offer engine.', 'Weeks 3–8 · from $9,500'],
  ['Operate', 'Measure, improve, and publish so the system compounds instead of decaying.', 'Ongoing · monthly'],
] as const

export function Proto() {
  // Buttery smooth scroll
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  const { scrollYProgress } = useScroll()
  const sealY = useTransform(scrollYProgress, [0, 1], [0, -300])

  // Product reveal parallax
  const revealRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: rp } = useScroll({ target: revealRef, offset: ['start end', 'end start'] })
  const imgY = useTransform(rp, [0, 1], ['-8%', '8%'])

  return (
    <div className={styles.root}>
      <Cursor />
      <div className={styles.grain} aria-hidden />
      <div className={styles.vignette} aria-hidden />
      <motion.div className={styles.farSeal} style={{ y: sealY }} aria-hidden>
        道
      </motion.div>

      <nav className={styles.nav}>
        <div className={styles.wordmark}>
          Sage Ideas
          <span>PRODUCT · BRAND · AI SYSTEMS</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#work" data-cursor>Work</a>
          <a href="#process" data-cursor>Process</a>
          <a href="/academy" data-cursor>Academy</a>
          <a href="/pricing" data-cursor>Pricing</a>
        </div>
        <Magnetic href="/book?source=proto_nav" className={styles.pill}>
          Book a call →
        </Magnetic>
      </nav>

      {/* ── HERO — type-first, spacious ── */}
      <header className={styles.hero}>
        <span className={`${styles.tick} ${styles.tickTR}`} aria-hidden>01 / 05</span>
        <div className={styles.wrap}>
          <motion.p className={styles.eyebrow} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.1 }}>
            <i /> Sage Ideas · AI-native studio · since 2020
          </motion.p>
          <h1 className={styles.headline}>
            <Line delay={0.18}>I build the product,</Line>
            <Line delay={0.3}>the brand, and the</Line>
            <Line delay={0.42}>
              <em>AI</em> that runs it.
            </Line>
          </h1>
          <motion.p className={styles.sub} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}>
            A solo, AI-native studio. I run my own products every day and put the same system —
            AI, apps, SaaS, brand, growth — to work for yours. From someone who <strong>builds</strong>,
            not someone who just pitches.
          </motion.p>
          <motion.div className={styles.ctaRow} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.82 }}>
            <Magnetic href="/book?source=proto" className={styles.pill}>
              Book a call →
            </Magnetic>
            <a href="#work" className={styles.ghost} data-cursor>
              See the work ↓
            </a>
          </motion.div>
        </div>
        <span className={`${styles.tick} ${styles.tickBL}`} aria-hidden>nexural.system</span>
        <motion.div className={styles.scrollCue} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 1 }} aria-hidden>
          Scroll
          <span />
        </motion.div>
      </header>

      {/* ── PRODUCT REVEAL — content as hero, clip + parallax ── */}
      <section className={styles.reveal} ref={revealRef}>
        <div className={styles.wrap}>
          <div className={styles.revealHead}>
            <Reveal>
              <p className={styles.revealTitle}>This is what shipped looks like.</p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className={styles.revealMeta}>
                Nexural · fintech trading SaaS
                <br />
                live in production · built solo
              </p>
            </Reveal>
          </div>
          <motion.div
            className={styles.shot}
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
            viewport={{ once: true, margin: '-120px' }}
            transition={{ duration: 1.2, ease: EASE }}
          >
            <motion.span className={styles.shotBar} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE, delay: 0.5 }} />
            <motion.img style={{ y: imgY, scale: 1.16 }} src="/work/nexural-cockpit.webp" alt="Nexural cockpit — the Command dashboard" />
            <span className={styles.shotTag}>Nexural · Command desk</span>
          </motion.div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className={styles.marquee} aria-hidden>
        <motion.div className={styles.mTrack} animate={{ x: ['0%', '-50%'] }} transition={{ duration: 26, ease: 'linear', repeat: Infinity }}>
          {[0, 1].map((k) => (
            <span key={k}>
              {CAPS.map((c) => (
                <span className={styles.mItem} key={c}>
                  {c}
                  <i className={styles.mDot} style={{ fontStyle: 'normal' }}>◆</i>
                </span>
              ))}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── WORK ── */}
      <section className={styles.section} id="work">
        <div className={styles.wrap}>
          <Reveal>
            <span className={styles.kicker}>02 / Selected work</span>
            <h2 className={styles.h2}>
              I run my own products.
              <br />
              Then I build yours.
            </h2>
          </Reveal>
          <div className={styles.workGrid}>
            <Reveal className={`${styles.card} ${styles.cardBig}`}>
              <a href="#work" data-cursor style={{ display: 'block', height: '100%' }}>
                <img src="/work/nexural-swing.webp" alt="Nexural Swing Desk" />
                <div className={styles.cardMeta}>
                  <div className={styles.cardName}>Nexural</div>
                  <div className={styles.cardStat}>
                    <span>398 tests</span>
                    <span>227 routes</span>
                    <span>206 SQL</span>
                  </div>
                </div>
              </a>
            </Reveal>
            <Reveal className={`${styles.card} ${styles.cardSmall}`} delay={0.1}>
              <div className={styles.cardText}>
                <span className={styles.kicker} style={{ margin: 0 }}>Fintech · trading SaaS</span>
                <div className={styles.cardName} style={{ marginTop: '0.8rem' }}>The flagship.</div>
                <p>
                  Member dashboard, Signal &amp; Swing desks, admin ops, Stripe billing — the largest,
                  most mature system in the federation. Built and run solo.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className={styles.section} id="process">
        <div className={styles.wrap}>
          <Reveal>
            <span className={styles.kicker}>03 / How we work</span>
            <h2 className={styles.h2}>A clear path. A real number.</h2>
          </Reveal>
          <div className={styles.steps}>
            {STEPS.map(([title, body, meta], i) => (
              <Reveal className={styles.step} key={title} delay={i * 0.05}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{body}</p>
                <b>{meta}</b>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL ── */}
      <section className={styles.final}>
        <span className={styles.seal} aria-hidden>道</span>
        <div className={styles.wrap}>
          <Reveal>
            <span className={styles.kicker}>04 / Build</span>
            <h2 className={styles.finalH}>Bring me the hard one.</h2>
            <p className={styles.finalP}>
              An app, a brand, a SaaS, or all of it. Every engagement starts with a real
              conversation, not a contract.
            </p>
            <div className={styles.ctaRow}>
              <Magnetic href="/book?source=proto_final" className={styles.pill}>
                Book a call →
              </Magnetic>
              <a href="#work" className={styles.ghost} data-cursor>
                See the work ↑
              </a>
            </div>
          </Reveal>
          <div className={styles.foot}>
            <span>© 2026 Sage Ideas LLC · Orlando, FL</span>
            <span>// design-first prototype · ink and circuitry</span>
          </div>
        </div>
      </section>
    </div>
  )
}
