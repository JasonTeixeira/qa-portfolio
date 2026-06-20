import type { Metadata } from 'next'
import Link from 'next/link'
import { paths } from '@/data/academy/catalog'
import { WaitlistForm } from './waitlist-form'
import { CodeLab } from './code-lab'
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

const FAQS = [
  { q: 'When does it launch?', a: 'Soon — we’re building the first paths and labs now. Joining the waitlist puts you first in line and you’ll get the launch email before anyone else.' },
  { q: 'How much is it?', a: 'Pro is $20/month for everything — every course, every guided lab, certificates, and new content each week. There’s a free tier too. Founding members lock the $20 price for life.' },
  { q: 'Is it for beginners?', a: 'Yes. Paths start from your very first line of code and go all the way to shipping a deployed product. If you already code, jump straight to AI engineering.' },
  { q: 'What makes it different?', a: 'It’s project-based and taught by an operator who actually ships software — not a theory channel. You build real things and keep them.' },
]

export default function WaitlistPage() {
  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <Link href="/learn" className={styles.brand}>
          <span className={styles.brandMark}>S</span>
          Sage Academy
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
            Sage Academy is a project-based academy for code &amp; AI — real builds and guided labs from an
            operator who ships. Join the founding waitlist and lock in $20/mo for life.
          </p>
          <WaitlistForm id="waitlist-hero" />
        </div>
      </section>

      {/* ── Live code lab ── */}
      <section className={styles.section}>
        <div className={styles.sectionNarrow} style={{ textAlign: 'center' }}>
          <span className={styles.kicker} style={{ justifyContent: 'center' }}>Your first hour</span>
          <h2 className={styles.h2}>This isn’t a video. It’s a lab.</h2>
          <p className={styles.lede} style={{ margin: '0.9rem auto 0' }}>
            You learn by building real things and running them. Here’s a lab you’ll finish on day one —
            watch it write itself.
          </p>
          <CodeLab />
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

      {/* ── Taste ── */}
      <section className={styles.section}>
        <div className={styles.sectionNarrow}>
          <span className={styles.kicker}>What you’ll build</span>
          <h2 className={styles.h2}>Three paths, from zero to shipped.</h2>
          <div className={styles.taste}>
            {paths.map((p) => (
              <span key={p.slug} className={styles.chip}>
                <i style={{ background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})` }} />
                {p.name}
              </span>
            ))}
            <span className={styles.chip}><i style={{ background: '#18b663' }} /> Guided project labs</span>
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
            <span className={styles.brandMark} aria-hidden="true">S</span>
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
          <h2 className={styles.h2}>Be one of the first to build with us.</h2>
          <WaitlistForm id="waitlist-foot" />
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
