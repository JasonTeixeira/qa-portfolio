import type { Metadata } from 'next'
import Link from 'next/link'
import { courses, paths } from '@/data/academy/catalog'
import styles from './learn.module.css'

const SITE = 'https://www.sageideas.dev'

export const metadata: Metadata = {
  title: 'Sage Academy — Learn to build with code & AI',
  description:
    'Project-based courses and guided labs on code and AI, taught by an operator who ships real software. Start free; go Pro for $20/mo.',
  alternates: { canonical: `${SITE}/learn` },
  openGraph: {
    title: 'Sage Academy — Learn to build with code & AI',
    description: 'Project-based courses and guided labs. Start free; Pro is $20/mo.',
    images: ['/og?title=Sage+Academy&subtitle=Learn+to+build+with+code+%26+AI'],
  },
}

const VALUES = [
  { icon: '🛠️', title: 'Project-based', body: 'You learn by building real things — apps, tools, agents — not by watching slides.' },
  { icon: '⚡', title: 'From an operator', body: 'Every lesson comes from someone who actually ships software, not a theory channel.' },
  { icon: '🧪', title: 'Guided labs', body: 'Hands-on labs with starter code and checkpoints take you from “follow along” to “I built that.”' },
  { icon: '💸', title: '$20/month', body: 'One price unlocks every course and lab. Cancel anytime. Start completely free.' },
]

const STEPS = [
  { n: '1', title: 'Learn the concept', body: 'Short, focused lessons that get to the point and show real code.' },
  { n: '2', title: 'Build it in a lab', body: 'Open a guided lab and ship a working project with starter code and checkpoints.' },
  { n: '3', title: 'Keep your streak', body: 'Stack labs into a portfolio, track progress, and finish the path.' },
]

export default function LearnHome() {
  return (
    <div className={styles.page}>
      {/* ── Nav ── */}
      <header className={styles.nav}>
        <Link href="/learn" className={styles.brand}>
          <span className={styles.brandMark}>S</span>
          Sage Academy <small>by Sage Ideas</small>
        </Link>
        <nav className={styles.navLinks}>
          <Link href="/learn#paths">Paths</Link>
          <Link href="/learn#courses">Courses</Link>
          <Link href="/learn#labs">Labs</Link>
          <Link href="/learn#pricing">Pricing</Link>
        </nav>
        <div className={styles.navCta}>
          <Link href="/login" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}>Log in</Link>
          <Link href="/learn#pricing" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}>Start free</Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <span className={styles.heroBadge}>
              <b>New</b> · {paths.length} paths · {courses.length}+ courses · guided labs
            </span>
            <h1 className={styles.heroTitle}>
              Learn to build real software with <span className={styles.gradient}>code &amp; AI</span>.
            </h1>
            <p className={styles.heroLede}>
              Project-based courses and hands-on labs from an operator who actually ships. Start free —
              go Pro for $20/month and unlock everything.
            </p>
            <div className={styles.heroActions}>
              <Link href="/learn#pricing" className={`${styles.btn} ${styles.btnPrimary}`}>Start learning free →</Link>
              <Link href="/learn#paths" className={`${styles.btn} ${styles.btnGhost}`}>Browse the catalog</Link>
            </div>
            <div className={styles.heroProof}>
              <span>✓ No credit card to start</span>
              <span>✓ Cancel anytime</span>
              <span><b>$20</b>/mo for everything</span>
            </div>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.lessonCard}>
              <div className={styles.lessonCardTop}>
                <span className={styles.lessonGlyph}>✦</span>
                <span className={styles.free}>Free</span>
              </div>
              <h4>Build With the LLM API</h4>
              <p>Lesson 4 · Streaming responses</p>
              <div className={styles.progressRow}>
                <span className={styles.progressTrack}><i className={styles.progressFill} style={{ width: '62%' }} /></span>
                <span>62%</span>
              </div>
            </div>
            <div className={styles.lessonCard}>
              <div className={styles.lessonCardTop}>
                <span className={styles.lessonGlyph}>🧪</span>
                <span className={styles.level}>Lab</span>
              </div>
              <h4>Your first AI chatbot</h4>
              <p>45 min · Python · LLM API</p>
              <div className={styles.progressRow}>
                <span className={styles.progressTrack}><i className={styles.progressFill} style={{ width: '100%' }} /></span>
                <span>Done ✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Value props ── */}
      <section className={styles.section}>
        <span className={styles.kicker}>Why Sage Academy</span>
        <h2 className={styles.sectionTitle}>Not another video dump.</h2>
        <p className={styles.sectionLede}>
          Most “learn to code” sites teach you to watch. This one teaches you to build — and to keep what you make.
        </p>
        <div className={styles.valueGrid}>
          {VALUES.map((v) => (
            <article key={v.title} className={styles.valueCard}>
              <div className={styles.valueIcon}>{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Paths ── */}
      <section className={styles.section} id="paths">
        <span className={styles.kicker}>Learning paths</span>
        <h2 className={styles.sectionTitle}>Pick a path. Finish it.</h2>
        <p className={styles.sectionLede}>
          Each path is an ordered journey of courses and labs — from your first line of code to a deployed product.
        </p>
        <div className={styles.pathGrid}>
          {paths.map((p) => (
            <article key={p.slug} className={styles.pathCard}>
              <div className={styles.pathRibbon} style={{ background: `linear-gradient(90deg, ${p.gradient[0]}, ${p.gradient[1]})` }} />
              <div className={styles.pathBody}>
                <h3>{p.name}</h3>
                <div className={styles.pathMeta}>
                  <span>{p.level}</span> · <span>{p.courseCount} courses</span> · <span>{p.labCount} labs</span>
                </div>
                <p>{p.tagline}</p>
                <ul className={styles.pathOutcomes}>
                  {p.outcomes.map((o) => <li key={o}>{o}</li>)}
                </ul>
                <Link href={`/learn#courses`} className={styles.pathLink}>
                  Start this path <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Courses ── */}
      <section className={styles.section} id="courses">
        <div className={styles.coursesHead}>
          <div>
            <span className={styles.kicker}>Featured courses</span>
            <h2 className={styles.sectionTitle}>Start with one of these.</h2>
          </div>
          <Link href="/learn#pricing" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}>See all courses →</Link>
        </div>
        <div className={styles.courseGrid}>
          {courses.map((c) => (
            <article key={c.slug} className={styles.courseCard}>
              <div className={styles.courseTop}>
                <span className={styles.courseGlyph}>{c.glyph}</span>
                {c.free ? <span className={styles.free}>Free intro</span> : <span className={styles.level}>{c.level}</span>}
              </div>
              <h3>{c.title}</h3>
              <p>{c.blurb}</p>
              <div className={styles.courseFoot}>
                <span>{c.lessons} lessons</span>
                <span>{c.hours}h</span>
                <span>{c.level}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className={styles.section} id="labs">
        <span className={styles.kicker}>How it works</span>
        <h2 className={styles.sectionTitle}>Learn → build → keep it.</h2>
        <div className={styles.howGrid}>
          {STEPS.map((s) => (
            <article key={s.n} className={styles.howStep}>
              <div className={styles.howNum}>{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className={`${styles.section} ${styles.pricing}`} id="pricing">
        <span className={styles.kicker}>Pricing</span>
        <h2 className={styles.sectionTitle}>One price. Everything.</h2>
        <p className={styles.sectionLede}>Start free, no card required. When you’re ready, $20/month unlocks every course and lab.</p>
        <div className={styles.priceWrap}>
          <article className={styles.priceCard}>
            <span className={styles.priceName}>Free</span>
            <p className={styles.priceAmount}><strong>$0</strong></p>
            <ul className={styles.priceList}>
              <li>Free intro of every course</li>
              <li>Three starter labs</li>
              <li>Community access</li>
              <li>Progress tracking</li>
            </ul>
            <Link href="/login" className={`${styles.btn} ${styles.btnGhost}`}>Create free account</Link>
          </article>
          <article className={`${styles.priceCard} ${styles.priceCardPro}`}>
            <span className={styles.priceTag}>Most popular</span>
            <span className={styles.priceName}>Pro</span>
            <p className={styles.priceAmount}><strong>$20</strong><span>/month</span></p>
            <ul className={styles.priceList}>
              <li>Every course, every path</li>
              <li>Every guided lab + starter repos</li>
              <li>Certificates of completion</li>
              <li>New content every week</li>
              <li>Cancel anytime</li>
            </ul>
            <Link href="/login" className={`${styles.btn} ${styles.btnPrimary}`}>Go Pro — $20/mo</Link>
          </article>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className={styles.cta}>
        <h2>Stop watching tutorials. Start shipping.</h2>
        <p>Create a free account and build your first project today. Go Pro when you’re hooked.</p>
        <div className={styles.ctaActions}>
          <Link href="/login" className={`${styles.btn} ${styles.btnPrimary}`}>Start learning free →</Link>
          <Link href="/learn#paths" className={`${styles.btn} ${styles.btnGhost}`}>Browse paths</Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <span>© 2026 Sage Ideas · Sage Academy</span>
        <span>
          <Link href="/">Studio (hire me)</Link> · <Link href="/blog">Blog</Link> · <Link href="/learn#pricing">Pricing</Link>
        </span>
      </footer>
    </div>
  )
}
