import type { Metadata } from 'next'
import Link from 'next/link'
import { paths } from '@/data/academy/catalog'
import { WaitlistForm } from './waitlist-form'
import { FoundingMeter } from './founding-meter'
import { CourseDemo } from './course-demo'
import { BuildGallery } from './build-gallery'
import { RevealOnScroll } from './reveal'
import { SoundToggle } from './sound-toggle'
import { Splash, SageMark } from './splash'
import styles from './waitlist.module.css'

const SITE = 'https://www.sageideas.dev'

export const metadata: Metadata = {
  title: 'Join the waitlist — Sage Academy',
  description:
    'Sage Academy is coming: project-based courses and guided labs to learn code & AI, $20/mo. Join the founding waitlist and lock in founding pricing forever.',
  alternates: { canonical: `${SITE}/learn/waitlist` },
  openGraph: {
    title: 'Sage Academy — founding waitlist',
    description: 'Learn to build with code & AI. Project-based. $20/mo. Founding spots open.',
    images: ['/og?title=Sage+Academy+Waitlist&subtitle=Learn+to+build+with+code+%26+AI'],
  },
}

const PERKS = [
  { glyph: '🔒', title: '$20/mo, locked forever', body: 'Founding members keep the launch price for life — even after it goes up for everyone else.' },
  { glyph: '🎟️', title: 'First month free', body: 'Get in, build something real, and only pay if you stay. No risk to start.' },
  { glyph: '🚪', title: 'Early access', body: 'You’re first through the door — before the catalog is even public.' },
  { glyph: '🗳️', title: 'A vote on what’s next', body: 'Founding members help pick which courses and labs we build first.' },
]

const MILESTONES = [
  { glyph: '›_', label: 'First line', sub: 'Variables & logic', build: 'A number-guessing game in your terminal' },
  { glyph: 'ƒ', label: 'Real programs', sub: 'Functions & data', build: 'A CLI tool that calls a real API' },
  { glyph: '✦', label: 'Build with AI', sub: 'The LLM API', build: 'An AI chatbot that streams replies' },
  { glyph: '⬡', label: 'RAG & agents', sub: 'Grounded & tool-using', build: 'A doc-search assistant with citations' },
  { glyph: '▲', label: 'Ship it', sub: 'Deployed & live', build: 'A full-stack app on a live URL' },
]

const TECH = [
  { group: 'Foundations', items: ['Python', 'JavaScript', 'TypeScript', 'Git', 'The terminal'] },
  { group: 'AI engineering', items: ['LLM API', 'Prompting', 'RAG', 'Vector search', 'Agents', 'Evals'] },
  { group: 'Ship it', items: ['Next.js', 'Supabase', 'Auth', 'Stripe', 'Deploy'] },
]

const COMPARE = {
  watching: ['Endless videos you never finish', 'Copy-paste you don’t understand', 'Tutorial hell, zero momentum', 'Nothing real to show for it'],
  building: ['Short lessons, then you build', 'Guided labs with real starter code', 'A finished project every time', 'A portfolio that gets you hired'],
}

const STAGES = [
  { n: '01', title: 'Learn', body: 'A short, focused lesson that gets to the point and shows real code.' },
  { n: '02', title: 'Build', body: 'Open a guided lab and ship a working project with starter code and checkpoints.' },
  { n: '03', title: 'Keep it', body: 'Every lab becomes a real project in your portfolio. Stack them, finish the path.' },
]

const FAQS = [
  { q: 'When does it launch?', a: 'Soon — we’re building the first paths and labs now. Joining the waitlist puts you first in line and you’ll get the launch email before anyone else.' },
  { q: 'How much is it?', a: 'Pro is $20/month for everything — every course, every guided lab, certificates, and new content each week. There’s a free tier too. Founding members lock the $20 price for life.' },
  { q: 'Is it for beginners?', a: 'Yes. Paths start from your very first line of code and go all the way to shipping a deployed product. If you already code, jump straight to AI engineering.' },
  { q: 'What makes it different?', a: 'It’s project-based and taught by an operator who actually ships software — not a theory channel. You build real things and keep them.' },
]

export default function WaitlistPage() {
  return (
    <div className={styles.page} data-reveal-scope>
      <Splash />
      <RevealOnScroll />
      <SoundToggle />
      <header className={styles.nav}>
        <Link href="/" className={styles.brand}>
          <SageMark size={26} />
          Sage Ideas
        </Link>
        <span className={styles.navTag}>Launching soon</span>
      </header>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>
            <span className={styles.dot} /> Founding cohort · spots open
          </span>
          <h1 className={styles.title}>
            Most people who “learn to code” never ship a thing. <span className={styles.gradient}>Let’s fix that.</span>
          </h1>
          <p className={styles.lede}>
            Sage Academy teaches you to <em>build</em> — real projects and guided labs from an operator who ships
            every day, not a theory channel. Be one of the founding 1,000 and lock $20/mo for life.
          </p>
          <WaitlistForm id="waitlist-hero" />
          <FoundingMeter />
        </div>
      </section>

      {/* ── Interactive course demo (playable lesson) ── */}
      <section className={styles.section}>
        <div className={styles.sectionNarrow} style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <span className={styles.kicker} style={{ justifyContent: 'center' }}>Try it now — no signup</span>
          <h2 className={styles.h2}>
            This isn’t a video. <span className={styles.gradient}>It’s the product.</span>
          </h2>
          <p className={styles.lede} style={{ margin: '0.9rem auto 0' }}>
            Pick a project and click through building it — real code, real output, shipped at the end.
            This is exactly how every lab works.
          </p>
        </div>
        <div style={{ padding: '0 var(--ac-pad)' }}>
          <CourseDemo />
        </div>
      </section>

      {/* ── Everything you'll build ── */}
      <section className={styles.section}>
        <div className={styles.sectionNarrow} style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <span className={styles.kicker} style={{ justifyContent: 'center' }}>The build list</span>
          <h2 className={styles.h2}>
            You won’t take notes. <span className={styles.gradient}>You’ll build all of this.</span>
          </h2>
          <p className={styles.lede} style={{ margin: '0.9rem auto 0' }}>
            Every lab ends with a real, working thing you keep. Here’s a taste of what’s in your
            portfolio by the end — filter by path.
          </p>
        </div>
        <div style={{ padding: '0 var(--ac-pad)' }}>
          <BuildGallery />
        </div>
      </section>

      {/* ── Tutorials vs building (comparison) ── */}
      <section className={styles.section}>
        <div className={styles.sectionNarrow}>
          <span className={styles.kicker}>Why it works</span>
          <h2 className={styles.h2}>Watching ≠ learning.</h2>
          <div className={styles.compare}>
            <article className={`${styles.compareCard} ${styles.compareBad}`}>
              <h3>Watching tutorials</h3>
              <ul>
                {COMPARE.watching.map((x) => (
                  <li key={x}><span className={styles.xMark} aria-hidden="true">✕</span>{x}</li>
                ))}
              </ul>
            </article>
            <span className={styles.compareVs} aria-hidden="true">vs</span>
            <article className={`${styles.compareCard} ${styles.compareGood}`}>
              <h3>Building with Sage</h3>
              <ul>
                {COMPARE.building.map((x) => (
                  <li key={x}><span className={styles.checkMark} aria-hidden="true">✓</span>{x}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* ── Founding perks ── */}
      <section className={styles.section}>
        <div className={styles.sectionNarrow}>
          <span className={styles.kicker}>Founding perks</span>
          <h2 className={styles.h2}>Get in before the doors open.</h2>
          <div className={styles.perks}>
            {PERKS.map((p) => (
              <article key={p.title} className={styles.perk}>
                <span className={styles.perkGlyph} aria-hidden="true">{p.glyph}</span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Journey map (B) ── */}
      <section className={styles.section}>
        <div className={styles.sectionNarrow}>
          <span className={styles.kicker}>The journey</span>
          <h2 className={styles.h2}>From your first line to a shipped product.</h2>
          <div className={styles.journey}>
            <ol className={styles.milestones}>
              {MILESTONES.map((m, i) => (
                <li key={m.label} className={styles.milestone}>
                  <span className={styles.milestoneDot} aria-hidden="true">{m.glyph}</span>
                  <span className={styles.milestoneLabel}>{m.label}</span>
                  <span className={styles.milestoneSub}>{m.sub}</span>
                  <span className={styles.milestoneNum} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.milestoneBuild}>
                    <b>You build</b> {m.build}
                  </span>
                </li>
              ))}
            </ol>
            <div className={styles.phases}>
              {paths.map((p) => (
                <span key={p.slug} className={styles.chip}>
                  <i style={{ background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})` }} />
                  {p.name}
                </span>
              ))}
              <span className={styles.chip}><i style={{ background: '#18b663' }} /> Guided project labs</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech you'll learn ── */}
      <section className={styles.section}>
        <div className={styles.sectionNarrow}>
          <span className={styles.kicker}>The real stack</span>
          <h2 className={styles.h2}>Tools you’ll actually use.</h2>
          <div className={styles.techGrid}>
            {TECH.map((col) => (
              <div key={col.group} className={styles.techCol}>
                <span className={styles.techGroup}>{col.group}</span>
                <div className={styles.techTags}>
                  {col.items.map((t) => (
                    <span key={t} className={styles.techTag}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Method flow (C) ── */}
      <section className={styles.section}>
        <div className={styles.sectionNarrow}>
          <span className={styles.kicker}>How every lesson works</span>
          <h2 className={styles.h2}>Learn → build → keep it.</h2>
          <div className={styles.flow}>
            {STAGES.map((s, i) => (
              <article key={s.n} className={styles.stage}>
                <span className={styles.stageNum}>{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                {i < STAGES.length - 1 && <span className={styles.stageArrow} aria-hidden="true">→</span>}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder note ── */}
      <section className={styles.section}>
        <div className={styles.founder}>
          <p className={styles.founderQuote}>
            “I run my own products every day. I’m building the academy I wish I’d had — project-first,
            no fluff, priced so anyone can actually start.”
          </p>
          <div className={styles.founderBy}>
            <SageMark size={26} />
            <span><b>Jason Teixeira</b> · Founder, Sage Ideas</span>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={styles.section}>
        <div className={styles.sectionNarrow}>
          <span className={styles.kicker}>Questions</span>
          <h2 className={styles.h2}>The quick answers.</h2>
          <div className={styles.faqList}>
            {FAQS.map((f) => (
              <article key={f.q} className={styles.faq}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className={`${styles.section} ${styles.finalCta}`}>
        <div className={styles.sectionNarrow}>
          <span className={styles.kicker}>The first 1,000</span>
          <h2 className={styles.h2}>
            Learn to ship in the AI era — <span className={styles.gradient}>now, not someday.</span>
          </h2>
          <p className={styles.lede} style={{ margin: '0.9rem auto 0' }}>
            This is the founding cohort: the builders who stop watching tutorials and start shipping. Lock $20/mo
            for life and help shape what we build first.
          </p>
          <WaitlistForm id="waitlist-foot" />
          <FoundingMeter />
        </div>
      </section>

      <footer className={styles.footer}>
        <span>© 2026 Sage Ideas · Sage Academy</span>
        <span>
          <Link href="/learn">Preview the academy</Link> · <Link href="/">Studio (hire me)</Link>
        </span>
      </footer>
    </div>
  )
}
