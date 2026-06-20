'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import styles from './proto.module.css'

const EASE = [0.16, 1, 0.3, 1] as const

/* Magnetic button — cursor-reactive, spring-damped. Motion that means "reach". */
function Magnetic({
  children,
  className,
  href,
}: {
  children: React.ReactNode
  className?: string
  href: string
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 16 })
  const sy = useSpring(y, { stiffness: 220, damping: 16 })
  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    x.set((e.clientX - (r.left + r.width / 2)) * 0.32)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.32)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }
  return (
    <motion.a
      ref={ref}
      href={href}
      className={className}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {children}
    </motion.a>
  )
}

/* Headline line that rises out of a mask on mount */
function Line({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <span className={styles.headlineLine}>
      <motion.span
        style={{ display: 'block' }}
        initial={{ y: '110%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  )
}

const rise = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: EASE, delay: i * 0.08 },
  }),
}

const CAPS = ['AI Systems', 'Applications', 'SaaS Platforms', 'Brand & Web', 'Growth & SEO', 'Cloud & Infra']

const STEPS = [
  ['Audit', 'Find the single highest-leverage bottleneck and leave with a scoped, costed plan you own.', 'Days 1–5 · from $1,500'],
  ['Sprint', 'Ship one visible, production-grade improvement — real code, deployed, measured.', 'Weeks 1–2 · from $4,500'],
  ['Build', 'Turn the validated direction into the live product, site, AI systems, and offer engine.', 'Weeks 3–8 · from $9,500'],
  ['Operate', 'Measure, improve, and publish so the system compounds instead of decaying.', 'Ongoing · monthly'],
] as const

function MarqueeRow() {
  const row = (
    <span>
      {CAPS.map((c) => (
        <span key={c} style={{ display: 'inline-flex', gap: '3.5rem', alignItems: 'center' }}>
          <b>{c}</b>
          <i className={styles.marqueeDot} style={{ fontStyle: 'normal' }}>
            ◆
          </i>
        </span>
      ))}
    </span>
  )
  return (
    <motion.div
      className={styles.marqueeTrack}
      animate={{ x: ['0%', '-50%'] }}
      transition={{ duration: 24, ease: 'linear', repeat: Infinity }}
    >
      {row}
      {row}
    </motion.div>
  )
}

export function Proto() {
  const rootRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()

  // Parallax layers — different rates = depth
  const sealY = useTransform(scrollYProgress, [0, 1], [0, -260])
  const panelY = useTransform(scrollYProgress, [0, 0.4], [60, -40])

  return (
    <div className={styles.root} ref={rootRef}>
      <div className={styles.grain} aria-hidden />
      <div className={styles.vignette} aria-hidden />
      <motion.div className={styles.farSeal} style={{ y: sealY }} aria-hidden>
        道
      </motion.div>

      <Nav />

      {/* ── HERO ── */}
      <header className={styles.hero}>
        <div className={styles.shell} style={{ gridColumn: 1, padding: 0 }}>
          <div className={styles.ticks} aria-hidden>
            <span className="tl" style={{ position: 'absolute', top: '7.5rem', left: 0 }}>
              01 / 05
            </span>
          </div>
          <motion.p
            className={styles.eyebrow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <i /> Sage Ideas · AI-native studio · since 2020
          </motion.p>
          <h1 className={styles.headline}>
            <Line delay={0.15}>I build the product,</Line>
            <Line delay={0.27}>the brand, and the</Line>
            <Line delay={0.39}>
              <em>AI</em> that runs it.
            </Line>
          </h1>
          <motion.p
            className={styles.sub}
            variants={rise}
            initial="hidden"
            animate="show"
            custom={7}
          >
            A solo, AI-native studio. I run my own products every day and put the same system —
            AI, apps, SaaS, brand, growth — to work for yours. From someone who <strong>builds</strong>,
            not someone who just pitches.
          </motion.p>
          <motion.div className={styles.ctaRow} variants={rise} initial="hidden" animate="show" custom={9}>
            <Magnetic href="/book?source=proto" className={styles.pill}>
              Book a call →
            </Magnetic>
            <a href="#work" className={styles.ghost}>
              See the work ↓
            </a>
          </motion.div>
        </div>

        {/* Product panel — content as hero, real shot, parallax + seam draw */}
        <motion.figure
          style={{ y: panelY, margin: 0 }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.5 }}
        >
          <div className={styles.panel}>
            <motion.span
              className={styles.panelBar}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, ease: EASE, delay: 0.9 }}
            />
            <img className={styles.panelImg} src="/work/nexural-cockpit.webp" alt="Nexural cockpit — the Command dashboard" />
            <span className={styles.panelTag}>Nexural · live in production</span>
          </div>
          <p className={styles.serifNote}>One operator. The whole stack.</p>
        </motion.figure>
      </header>

      {/* ── KINETIC MARQUEE ── */}
      <div className={styles.marquee} aria-hidden>
        <MarqueeRow />
      </div>

      {/* ── WORK ── */}
      <section className={styles.section} id="work">
        <div className={styles.shell} style={{ padding: 0 }}>
          <Reveal>
            <span className={styles.kicker}>02 / Selected work</span>
            <h2 className={styles.h2}>
              I run my own products.
              <br />
              Then I build yours.
            </h2>
          </Reveal>
          <div className={styles.workGrid}>
            <Reveal className={`${styles.workCard} ${styles.workCardBig}`} as="article">
              <img src="/work/nexural-swing.webp" alt="Nexural Swing Desk" />
              <div className={styles.workMeta}>
                <div className={styles.workName}>Nexural</div>
                <div className={styles.workStat}>
                  <span>398 tests</span>
                  <span>227 routes</span>
                  <span>206 SQL</span>
                </div>
              </div>
            </Reveal>
            <Reveal className={`${styles.workCard} ${styles.workCardSmall}`} as="article" delay={0.1}>
              <span className={styles.kicker}>Fintech · trading SaaS</span>
              <div className={styles.workName} style={{ marginTop: '0.6rem' }}>
                The flagship.
              </div>
              <p style={{ color: 'var(--muted)', marginTop: '0.8rem', lineHeight: 1.55 }}>
                Member dashboard, Signal &amp; Swing desks, admin ops, Stripe billing — the largest,
                most mature system in the federation. Built and run solo.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className={styles.section}>
        <div className={styles.shell} style={{ padding: 0 }}>
          <Reveal>
            <span className={styles.kicker}>03 / How we work</span>
            <h2 className={styles.h2}>A clear path. A real number.</h2>
          </Reveal>
          <div className={styles.steps}>
            {STEPS.map(([title, body, meta], i) => (
              <Reveal className={styles.step} as="div" key={title} delay={i * 0.06}>
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
        <div className={styles.shell} style={{ padding: 0 }}>
          <div className={styles.finalSeal} aria-hidden>
            道
          </div>
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
              <a href="#work" className={styles.ghost}>
                See the work ↑
              </a>
            </div>
          </Reveal>
        </div>
        <div className={styles.shell} style={{ padding: 0 }}>
          <div className={styles.foot}>
            <span>© 2026 Sage Ideas LLC · Orlando, FL</span>
            <span>// design-first prototype · ink and circuitry</span>
          </div>
        </div>
      </section>
    </div>
  )
}

function Nav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.wordmark}>
        Sage Ideas
        <span>PRODUCT · BRAND · AI SYSTEMS</span>
      </div>
      <div className={styles.navLinks}>
        <a href="#work">Work</a>
        <a href="#work">Services</a>
        <a href="/academy">Academy</a>
        <a href="/pricing">Pricing</a>
      </div>
      <Magnetic href="/book?source=proto_nav" className={styles.pill}>
        Book a call →
      </Magnetic>
    </nav>
  )
}

/* Scroll-into-view reveal wrapper */
function Reveal({
  children,
  className,
  as = 'div',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'article'
  delay?: number
}) {
  const Comp = as === 'article' ? motion.article : motion.div
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </Comp>
  )
}
