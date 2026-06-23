import Link from 'next/link'
import { CATEGORIES, TRACKS } from '@/lib/academy/taxonomy'
import { topic } from '@/lib/academy/topics'
import styles from './landing.module.css'

const LOOP_STEPS = [
  { n: '01', label: 'Read & recall', body: 'A concept capsule, then a pretest you answer from memory — retrieval before rereading.' },
  { n: '02', label: 'Build it live', body: 'In-browser labs. Write real code, run it, watch it work — no setup, no copy-paste.' },
  { n: '03', label: 'Prove it', body: 'Debug a broken case, verify your output, teach it back. Evidence, not vibes.' },
  { n: '04', label: 'Unlock', body: 'Pass the gate, schedule spaced review, transfer the pattern. Then the next sprint opens.' },
]

const PROOF = [
  { glyph: '⬢', title: 'In-browser labs', body: 'Run real code in the page. Checkpoints verify your output before you advance.' },
  { glyph: '▥', title: 'Calibration bank', body: 'Compare your work against weak, passing, and excellent examples — learn the difference.' },
  { glyph: '⏻', title: 'Unlock gates', body: 'No advancing on “I read it.” Every sprint requires proof, repair, and review.' },
  { glyph: '◆', title: 'Real certificates', body: 'Finish a course, earn a verifiable, shareable certificate tied to actual work.' },
]

export function AcademyLanding() {
  const liveTracks = TRACKS.filter((t) => t.categoryId === 'software-ai')

  return (
    <div className={styles.root}>
      {/* hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.kicker}>◆ Sage Academy</span>
          <h1 className={styles.heroTitle}>
            Stop watching tutorials.<br /><span className={styles.em}>Start shipping.</span>
          </h1>
          <p className={styles.heroSub}>
            A project-based academy with a learning engine that won&rsquo;t let you fake it. In-browser labs,
            adversarial checkpoints, and unlock gates that demand proof — so you leave able to <em>build</em>,
            not just recognize.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/academy/catalog" className={styles.primary}>Browse the curriculum →</Link>
            <Link href="/academy/engine" className={styles.secondary}>See how a sprint works</Link>
          </div>
          <p className={styles.heroNote}>$20/month · $200/year · cancel anytime · new tracks included</p>
        </div>
      </section>

      {/* the differentiator */}
      <section className={styles.band}>
        <div className={styles.bandInner}>
          <p className={styles.kicker}>The difference</p>
          <h2 className={styles.bandTitle}>A learning engine — not a video library.</h2>
          <p className={styles.bandSub}>
            Most courses end when the video does. Every Sage sprint runs a 17-step mastery loop built on the
            science of how people actually learn: retrieval, productive failure, calibration, spaced review,
            and transfer. You don&rsquo;t finish a lesson by reading it. You finish it by proving it.
          </p>
          <Link href="/academy/engine" className={styles.bandLink}>Walk through a full sprint →</Link>
        </div>
      </section>

      {/* how it works */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <p className={styles.kicker}>How a sprint works</p>
          <h2 className={styles.h2}>Read. Build. Prove. Unlock.</h2>
        </div>
        <div className={styles.loopGrid}>
          {LOOP_STEPS.map((s) => (
            <div key={s.n} className={styles.loopCard}>
              <span className={styles.loopN}>{s.n}</span>
              <h3 className={styles.loopLabel}>{s.label}</h3>
              <p className={styles.loopBody}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* architecture */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <p className={styles.kicker}>Built to scale</p>
          <h2 className={styles.h2}>Twelve engineering tracks mapped — two live now, the rest in build.</h2>
          <p className={styles.sectionSub}>
            One operating system, many domains. The curriculum grows continuously — and your membership
            includes every track we ship.
          </p>
        </div>
        <div className={styles.catRow}>
          {CATEGORIES.map((c) => (
            <span key={c.id} className={styles.catPill} data-status={c.status}>
              <span aria-hidden="true">{c.glyph}</span> {c.name}
              {c.status !== 'live' ? <em> · soon</em> : null}
            </span>
          ))}
        </div>
        <div className={styles.trackWrap}>
          {liveTracks.map((t) => {
            const col = topic(t.topic).color
            return (
              <span key={t.id} className={styles.trackChip} style={{ ['--c' as string]: col }}>
                <span className={styles.trackDot} aria-hidden="true" />
                {t.name}
              </span>
            )
          })}
        </div>
        <Link href="/academy/catalog" className={styles.bandLink}>Explore all tracks →</Link>
      </section>

      {/* proof */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <p className={styles.kicker}>Why it sticks</p>
          <h2 className={styles.h2}>Designed for proof, not completion.</h2>
        </div>
        <div className={styles.proofGrid}>
          {PROOF.map((p) => (
            <div key={p.title} className={styles.proofCard}>
              <span className={styles.proofGlyph} aria-hidden="true">{p.glyph}</span>
              <h3 className={styles.proofTitle}>{p.title}</h3>
              <p className={styles.proofBody}>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* pricing CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <p className={styles.kicker}>One membership · everything</p>
          <h2 className={styles.ctaTitle}>Every course, lab, and certificate.</h2>
          <div className={styles.priceRow}>
            <span className={styles.price}>$20<span>/mo</span></span>
            <span className={styles.priceOr}>or</span>
            <span className={styles.price}>$200<span>/yr</span></span>
            <span className={styles.priceSave}>2 months free</span>
          </div>
          <div className={styles.heroCtas}>
            <Link href="/academy/signup" className={styles.primary}>Start free — no card →</Link>
            <Link href="/academy/catalog" className={styles.secondary}>Browse first</Link>
          </div>
          <p className={styles.heroNote}>
            Free account, instant access · upgrade to Pro ($20/mo) any time · cancel whenever
          </p>
        </div>
      </section>
    </div>
  )
}
