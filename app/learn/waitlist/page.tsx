import type { Metadata } from 'next'
import Link from 'next/link'
import { paths } from '@/data/academy/catalog'
import { WaitlistForm } from './waitlist-form'
import { FoundingMeter } from './founding-meter'
import { CourseDemo } from './course-demo'
import { BuildGallery } from './build-gallery'
import { LiveBuild } from './live-build'
import { DiscordButton } from './discord-button'
import { RevealOnScroll } from './reveal'
import { SoundToggle } from './sound-toggle'
import { Splash, SageMark } from './splash'
import { StickyCta } from './sticky-cta'
import { JsonLd } from '@/components/json-ld'
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

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Sage Academy',
  description:
    'Project-based courses and guided labs to learn code & AI — from your first line to a deployed, full-stack app. Taught by an operator who ships software daily.',
  url: `${SITE}/learn/waitlist`,
  provider: { '@type': 'Organization', name: 'Sage Ideas', url: SITE },
  inLanguage: 'en',
  offers: {
    '@type': 'Offer',
    category: 'Subscription',
    price: '20',
    priceCurrency: 'USD',
    availability: 'https://schema.org/PreOrder',
    url: `${SITE}/learn/waitlist`,
  },
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'online',
    courseWorkload: 'PT4H',
  },
}

export default function WaitlistPage() {
  return (
    <div className={styles.page}>
      <JsonLd data={[faqSchema, courseSchema]} />
      <Splash />
      <RevealOnScroll />
      <SoundToggle />
      <StickyCta />
      <header className={styles.nav}>
        <Link href="/" className={styles.brand}>
          <SageMark size={26} />
          Sage Ideas
        </Link>
        <span className={styles.navTag}>Launching soon</span>
      </header>

      <main data-reveal-scope>
      {/* ── Hero ── */}
      <section id="wl-hero" className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCol}>
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
            <div className={styles.heroCtas}>
              <WaitlistForm id="waitlist-hero" />
              <DiscordButton className={styles.discordHero} label="Join the founding Discord" arrow />
            </div>
            <FoundingMeter />
          </div>
          <div className={styles.heroLive}>
            <LiveBuild />
          </div>
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

      {/* ── Founding community (Discord) ── */}
      <section className={styles.section}>
        <div className={styles.community}>
          <span className={styles.kicker} style={{ justifyContent: 'center' }}>The founding community</span>
          <h2 className={styles.h2}>You won’t build alone.</h2>
          <p className={styles.lede} style={{ margin: '0.9rem auto 1.9rem' }}>
            Founding members get into the private Discord now — early roles, build-along sessions,
            feedback on your projects, and first word the moment the doors open.
          </p>
          <a
            className={styles.discordBtn}
            href="https://discord.gg/KWPMEMJHGk"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Join the Discord
            <span className={styles.discordArrow} aria-hidden="true">→</span>
          </a>
          <p className={styles.communityNote}>
            Founding roles assigned on entry · new members hand-approved — real builders only.
          </p>
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
              {paths.map((p, idx) => (
                <span key={p.slug} className={styles.chip}>
                  <i style={{ background: ['#bcd2ff', '#3d5afe', '#e8b75a'][idx] ?? '#8fa0ff' }} />
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
      <section id="wl-final" className={`${styles.section} ${styles.finalCta}`}>
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
      </main>

      <footer className={styles.footer}>
        <span>© 2026 Sage Ideas · Sage Academy</span>
        <span>
          <Link href="/learn">Preview the academy</Link> · <Link href="/">Studio (hire me)</Link>
        </span>
      </footer>
    </div>
  )
}
