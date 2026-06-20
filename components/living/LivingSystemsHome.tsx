import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { workProjects, type WorkProject } from '@/data/home/living-projects'
import { TrackedLink } from '@/components/analytics/tracked-link'
import { NewsletterSignup } from '@/components/newsletter-signup'
import { RouteFinderHeroExperiment } from '@/components/cro/RouteFinderHeroExperiment'
import { SystemFlowOverlay } from '@/components/living/SystemFlowLayer'
import { LivingSoundControl } from './LivingSoundControl'
import { LivingSystemsMotion } from './LivingSystemsMotion'
import { IntentGate } from './IntentGate'
import { SplashBackdrop } from './SplashBackdrop'
import { CountUp } from '@/components/motion/CountUp'
import { CinematicBackdrop } from '@/components/motion/CinematicBackdrop'
import { Atmosphere } from '@/components/motion/Atmosphere'
import styles from './LivingSystemsHome.module.css'

const offerMatrix = [
  {
    code: '01',
    label: 'Studio',
    title: 'Hire the build system',
    text: 'Product, app, AI, brand, site, checkout, analytics, and growth loops built as one operating system.',
    href: '/services',
    fit: 'Done-for-you',
    cta: 'Studio',
  },
  {
    code: '02',
    label: 'Academy',
    title: 'Learn the build system',
    text: 'Courses, templates, teardown lessons, and operating notes for founders who want to build the system themselves.',
    href: '/academy',
    fit: 'Courses',
    cta: 'Academy',
  },
  {
    code: '03',
    label: 'Resources',
    title: 'Use the free system',
    text: 'SEO audits, calculators, field notes, reports, templates, and public receipts that compound search demand.',
    href: '/blog',
    fit: 'Proof + tools',
    cta: 'Resources',
  },
  {
    code: '04',
    label: 'Diagnostic',
    title: 'Find the right route',
    text: 'Answer four questions and get routed to studio, audit, automation, academy, or the next best free resource.',
    href: '/tools/route-finder?source=home_matrix',
    fit: 'Start here',
    cta: 'Route finder',
  },
] as const

const services = [
  ['S-01', 'AI Systems', 'Agents, copilots, retrieval, voice, and workflow automation that run inside the real business.'],
  ['S-02', 'Applications & SaaS', 'Full-stack products: schema to interface, auth to billing, observability to support.'],
  ['S-03', 'Brand & Web', 'Identity, narrative, and a conversion site that makes the product legible and premium.'],
  ['S-04', 'Growth & SEO', 'Technical SEO, content systems, analytics, and compounding distribution loops.'],
] as const

const receipts = [
  ['11', 'Products shipped'],
  ['398', 'Tests · flagship CI'],
  ['130+', 'Public repos'],
  ['2020', 'Building since'],
] as const

const ecosystem = [
  {
    index: '01',
    title: 'Studio',
    text: 'Done-for-you product, brand, AI systems, and growth infrastructure for founders who need the whole machine built.',
    href: '/services',
    cta: 'Work with the studio',
  },
  {
    index: '02',
    title: 'Academy',
    text: 'Do-it-yourself playbooks, lessons, and live operating notes for builders learning the same system.',
    href: '/academy',
    cta: 'Enter the academy',
  },
  {
    index: '03',
    title: 'Journal',
    text: 'Build logs, teardown essays, and proof-backed notes that turn the work into a compounding content engine.',
    href: '/blog',
    cta: 'Read the journal',
  },
] as const

const funnel = [
  ['Audit', 'Find the highest-leverage product, AI, brand, or growth bottleneck.'],
  ['Sprint', 'Ship a scoped, visible improvement with production code and conversion proof.'],
  ['Build', 'Turn the validated direction into the product, site, automation, and offer system.'],
  ['Operate', 'Measure, improve, publish, and keep the machine compounding.'],
] as const

const academyTracks = [
  'AI-native product building',
  'Premium landing pages',
  'Content engines',
  'SaaS offer design',
  'Automation systems',
  'Builder-led personal brand',
] as const

const trustSignals = [
  ['Direct line', 'You work with the operator who builds it — no account managers, no handoff, no dilution.'],
  ['NDA · MSA · SOW', 'Real contracting from day one. Scope and IP protected on paper before code is written.'],
  ['Openable proof', 'A public build record going back to 2020 — open the repos, read the commits, verify the work.'],
  ['Human-reviewed', 'Every commit is read by a principal. AI accelerates the work; it never ships unchecked.'],
] as const

// Real, permissioned client references land here — rendered only when present,
// so the page never ships an invented testimonial.
const testimonials: ReadonlyArray<{ quote: string; name: string; role: string }> = []

export function LivingSystemsHome() {
  return (
    <div className={styles.page}>
      <LivingSystemsMotion />
      <IntentGate />
      <div className={styles.loader} data-living-loader role="status" aria-live="polite" aria-label="Sage Ideas">
        <div className={styles.loaderScene} aria-hidden="true">
          <SplashBackdrop className={styles.loaderSceneImg} />
        </div>
        <button type="button" className={styles.loaderSkip} data-living-splash-skip aria-label="Skip intro">
          Skip intro
        </button>
        <div className={styles.loaderCenter}>
          <span className={styles.loaderMark}>
            <svg viewBox="0 0 42 42" width="96" height="96" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="living-loader-mark" x1="4" x2="38" y1="8" y2="34" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#3D5AFE" />
                  <stop offset="0.55" stopColor="#7C3AED" />
                  <stop offset="1" stopColor="#FF2D9B" />
                </linearGradient>
              </defs>
              <path d="M28.8 7.6c-7.8 1.2-16.3 7-17.5 12.1-.8 3.4 2.2 5.1 8.2 6.7 5.8 1.5 8.8 2.8 8.4 5.3-.5 3.3-7.1 5.1-14.9 4.3" />
              <circle cx="30" cy="8" r="3.8" />
              <circle cx="13.5" cy="35.7" r="2.8" />
            </svg>
          </span>
          <p className={styles.loaderWordmark}>Sage&nbsp;Ideas</p>
          <p className={styles.loaderTagline}>AI-native studio · since 2020</p>
          <span className={styles.loaderBar}><i data-living-boot-progress /></span>
        </div>
      </div>

      <nav className={styles.progress} aria-label="Page progress">
        <span className={styles.progressRail}><span data-living-progress /></span>
        <a href="#top">Intro</a>
        <a href="#work">Work</a>
        <a href="#services">Services</a>
        <a href="#ecosystem">Ecosystem</a>
        <a href="#academy">Academy</a>
        <a href="#proof">Proof</a>
        <a href="#operator">Operator</a>
        <a href="#trust">Trust</a>
        <a href="#build">Build</a>
      </nav>

      <div className={styles.cursor} data-living-cursor aria-hidden="true">
        <span />
      </div>
      <LivingSoundControl />
      <div className={styles.grade} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      <section className={styles.hero} id="top" aria-label="Introduction">
        <CinematicBackdrop
          src="/art/inkwash-cliffs.png"
          alt=""
          brightness={0.46}
          parallax={70}
          textAnchor="bottom-left"
          rotate
          className="z-[-2]"
        />
        <div className={styles.heroGrid} data-living-parallax aria-hidden="true" />
        <Atmosphere variant="cool" className={styles.heroAtmosphere} />
        <p className={styles.eyebrow} data-living-reveal>
          <span /> Sage Ideas · operator-led AI studio · since 2020
        </p>
        <h1 id="hero-heading" className={styles.heroTitle}>
          <span className={styles.heroLine}><span>I build the product,</span></span>
          <span className={styles.heroLine}><span>the brand, and the</span></span>
          <span className={styles.heroLine}><span><em>AI</em> that runs it.</span></span>
        </h1>
        <div className={styles.heroLower} data-living-reveal>
          <p>
            An operator-led, AI-native studio. One principal scopes and ships every
            engagement — AI, apps, SaaS, brand, growth — the same system that runs my own
            products daily. A studio that <strong>builds</strong>, not one that just pitches.
          </p>
          <div className={styles.heroFork}>
            <p className={styles.forkPrompt}>Pick your door</p>
            <TrackedLink
              className={`${styles.door} ${styles.doorPrimary}`}
              href="/contact?source=home_hero_fork"
              event="cta_click"
              eventProps={{ location: 'living_hero_fork', label: 'work_with_me' }}
            >
              <span className={styles.doorLabel}>Work with me</span>
              <span className={styles.doorSub}>Product, brand &amp; AI systems — built for you</span>
              <span className={styles.doorArrow} aria-hidden="true">→</span>
            </TrackedLink>
            <TrackedLink
              className={`${styles.door} ${styles.doorGhost}`}
              href="/academy?source=home_hero_fork"
              event="cta_click"
              eventProps={{ location: 'living_hero_fork', label: 'learn_the_system' }}
            >
              <span className={styles.doorLabel}>Learn the system</span>
              <span className={styles.doorSub}>Courses, templates &amp; the build method</span>
              <span className={styles.doorArrow} aria-hidden="true">↗</span>
            </TrackedLink>
            <TrackedLink
              className={styles.forkHint}
              href="/tools/route-finder?source=home_hero_fork"
              event="cta_click"
              eventProps={{ location: 'living_hero_fork', label: 'route_finder' }}
            >
              Not sure which? <strong>Answer 4 questions →</strong>
            </TrackedLink>
          </div>
        </div>
        <RouteFinderHeroExperiment surface="home" />
        <div className={styles.offerSystem} data-living-reveal aria-label="Sage Ideas offer system">
          <div className={styles.offerDiagram} aria-hidden="true">
            <svg viewBox="0 0 620 260">
              <defs>
                <linearGradient id="offer-flow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#3D5AFE" />
                  <stop offset="0.55" stopColor="#7C3AED" />
                  <stop offset="1" stopColor="#FF2D9B" />
                </linearGradient>
              </defs>
              <path
                className={styles.offerGhost}
                d="M92 136 C184 28 319 28 406 118 C456 170 506 193 572 134"
                fill="none"
                stroke="rgba(242,239,233,0.16)"
                strokeLinecap="round"
                strokeWidth="1"
              />
              <path
                className={styles.offerFlow}
                d="M92 136 C184 28 319 28 406 118 C456 170 506 193 572 134"
                fill="none"
                stroke="url(#offer-flow)"
                strokeLinecap="round"
                strokeWidth="3"
              />
              {[
                [92, 136, 'Studio'],
                [306, 66, 'Product'],
                [406, 118, 'Academy'],
                [572, 134, 'Resources'],
              ].map(([x, y, label]) => (
                <g key={label}>
                  <circle cx={x} cy={y} r="9" />
                  <text x={x} y={Number(y) + 30}>{label}</text>
                </g>
              ))}
            </svg>
          </div>
          <div className={styles.offerCards}>
            {offerMatrix.map((item) => (
              <TrackedLink
                href={item.href}
                className={styles.offerCard}
                key={item.label}
                event="cta_click"
                eventProps={{ location: 'home_offer_system', label: item.label, href: item.href }}
              >
                <SystemFlowOverlay variant={item.label === 'Academy' ? 'academy' : item.label === 'Resources' ? 'growth' : 'systems'} intensity="quiet" />
                <span>{item.code}</span>
                <b>{item.label}</b>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
                <small>{item.cta} →</small>
              </TrackedLink>
            ))}
          </div>
        </div>
        <div className={styles.capStrip} data-living-reveal aria-label="Capabilities">
          <span>AI Systems</span><i>·</i><span>Applications</span><i>·</i><span>SaaS</span><i>·</i><span>Brand &amp; Web</span><i>·</i><span>Growth &amp; SEO</span>
        </div>
      </section>

      <section className={styles.work} id="work" aria-label="Selected work">
        <SectionHead
          kicker="002 — Selected work"
          title={<>I run my own products.<br />Then I build yours.</>}
          text="Read straight from the repos — real stack, honest status, hard counts, no mockups."
        />
        <div className={styles.workGrid}>
          {workProjects.map((project) => (
            <WorkCard key={project.slug} project={project} />
          ))}
        </div>
        <p className={styles.workMore} data-living-reveal>
          <span>
            Seven shown — backed by 30+ more repos: trading ops, voice infrastructure, a CISSP
            study engine, an AI parts catalog, and shipped products.
          </span>
          <a href="https://github.com/JasonTeixeira" target="_blank" rel="noopener noreferrer">
            View all on GitHub →
          </a>
        </p>
      </section>

      <section className={styles.services} id="services" aria-labelledby="services-heading">
        <SectionHead
          kicker="003 — Services"
          title={<>The piece,<br />or the whole business.</>}
          text="Engage one capability or hand over the whole machine. Same operator, same standard, scoped to where the leverage actually is."
        />
        <ol className={styles.serviceList}>
          {services.map(([number, title, text]) => (
            <li className={styles.serviceRow} key={number} data-living-reveal>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <Link href="/services" aria-label={`Explore ${title}`}>→</Link>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.ecosystem} id="ecosystem" aria-labelledby="ecosystem-heading">
        <SectionHead
          kicker="004 — Ecosystem"
          title={<>Studio, academy,<br />and the build record.</>}
          text="The business model is simple: build real systems, teach the method, and publish enough proof that the right people can self-select."
        />
        <div className={styles.ecosystemGrid}>
          {ecosystem.map((item) => (
            <Link className={styles.ecosystemCard} href={item.href} key={item.title} data-living-reveal>
              <span>{item.index}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <b>{item.cta} →</b>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.funnel} aria-labelledby="funnel-heading">
        <div className={styles.funnelIntro} data-living-reveal>
          <span className={styles.kicker}>005 — Funnel</span>
          <h2 id="funnel-heading">A premium path for every level of intent.</h2>
          <p>
            High-ticket work stays primary. The academy and journal serve builders who are not ready
            for a full engagement yet, then turn attention into trust over time.
          </p>
        </div>
        <ol className={styles.funnelSteps}>
          {funnel.map(([title, text], index) => (
            <li key={title} data-living-reveal>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.academy} id="academy" aria-labelledby="academy-heading">
        <div className={styles.academyCopy} data-living-reveal>
          <span className={styles.kicker}>006 — Academy</span>
          <h2 id="academy-heading">Learn the system while the studio keeps shipping it.</h2>
          <p>
            A practical curriculum for do-it-yourself builders: product thinking, AI systems,
            conversion pages, content engines, and the operating discipline behind premium brands.
          </p>
          <div className={styles.academyActions}>
            <TrackedLink
              className={`${styles.button} ${styles.buttonPrimary}`}
              href="/academy"
              event="cta_click"
              eventProps={{ location: 'living_academy', label: 'view_academy' }}
            >
              <span>View academy</span><span aria-hidden="true">→</span>
            </TrackedLink>
            <TrackedLink
              className={`${styles.button} ${styles.buttonGhost}`}
              href="/blog"
              event="cta_click"
              eventProps={{ location: 'living_academy', label: 'read_journal' }}
            >
              <span>Read the journal</span><span aria-hidden="true">↘</span>
            </TrackedLink>
          </div>
        </div>
        <div className={styles.academyPanel} data-living-reveal>
          <span>curriculum.map(track)</span>
          <ul>
            {academyTracks.map((track) => (
              <li key={track}>{track}</li>
            ))}
          </ul>
          <NewsletterSignup
            source="home_academy"
            variant="inline"
            headline="Join the build list."
            blurb="Weekly build notes, teardown lessons, and course drops as they ship."
          />
        </div>
      </section>

      <section className={styles.proof} id="proof" aria-labelledby="proof-heading">
        <SectionHead center kicker="007 — Proof" title="The receipts." text="Shipped products you can open and a public build record going back to 2020." />
        <div className={styles.receipts} data-living-reveal>
          {receipts.map(([value, label]) => (
            <div key={label}>
              <strong><CountUp value={value} /></strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <p className={styles.proofNote} data-living-reveal>
          No fabricated metrics, no invented testimonials, no fake screenshots presented as real.
          Proof gets stronger as real client assets and permissioned references are added.
        </p>
      </section>

      <section className={styles.operator} id="operator" aria-labelledby="operator-heading">
        <div data-living-reveal>
          <span className={styles.kicker}>008 — Operator</span>
          <h2 id="operator-heading">One person. Principal-level. The whole stack.</h2>
          <p>
            Jason Teixeira is the AI engineer and application-building specialist who scopes the work
            and ships it. Product, brand, site, automation, growth loop: one accountable operator.
          </p>
          <Link className={styles.textLink} href="/founder">Read the founder profile →</Link>
        </div>
        <div className={styles.portrait} data-living-reveal>
          <Image
            src="/founder/portrait.jpg"
            alt="Jason Teixeira, founder of Sage Ideas"
            fill
            sizes="(max-width: 940px) 92vw, 420px"
            className={styles.portraitImage}
          />
          <div className={styles.portraitCaption}>
            <span>Jason Teixeira</span>
            <p>Founder · principal engineer · Sage Ideas</p>
          </div>
        </div>
      </section>

      <section className={styles.trust} id="trust" aria-labelledby="trust-heading">
        <SectionHead
          center
          kicker="009 — Working together"
          title={<>What you actually get.</>}
          text="No agency theatre. A short list of things the studio commits to on every engagement — verifiable, not aspirational."
        />
        <div className={styles.trustGrid}>
          {trustSignals.map(([label, text]) => (
            <div className={styles.trustItem} key={label} data-living-reveal>
              <h3>{label}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
        {testimonials.length > 0 ? (
          <div className={styles.quotes} data-living-reveal>
            {testimonials.map((t) => (
              <figure className={styles.quoteCard} key={t.name}>
                <blockquote>{t.quote}</blockquote>
                <figcaption>
                  <span>{t.name}</span>
                  <small>{t.role}</small>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}
        <p className={styles.trustNote} data-living-reveal>
          Named client references available on request — and added here as they’re permissioned.
        </p>
      </section>

      <section className={styles.final} id="build" aria-labelledby="build-heading">
        <span className={styles.kicker} data-living-reveal>010 — Build</span>
        <h2 id="build-heading">Bring me the hard one.</h2>
        <p data-living-reveal>An app, a brand, a SaaS, or all of it. Every engagement starts with a real conversation, not a contract.</p>
        <div className={styles.finalCtas} data-living-reveal>
          <TrackedLink
            className={`${styles.button} ${styles.buttonPrimary}`}
            href="/contact?source=home_final"
            event="cta_click"
            eventProps={{ location: 'living_final', label: 'start_project' }}
          >
            <span>Start a project</span><span aria-hidden="true">→</span>
          </TrackedLink>
          <TrackedLink
            className={`${styles.button} ${styles.buttonGhost}`}
            href="/academy"
            event="cta_click"
            eventProps={{ location: 'living_final', label: 'academy' }}
          >
            <span>Learn the system</span><span aria-hidden="true">↗</span>
          </TrackedLink>
        </div>
      </section>
    </div>
  )
}

function SectionHead({
  kicker,
  title,
  text,
  center = false,
}: {
  kicker: string
  title: ReactNode
  text?: string
  center?: boolean
}) {
  return (
    <div className={`${styles.sectionHead} ${center ? styles.sectionHeadCenter : ''}`} data-living-reveal>
      <div>
        <span className={styles.kicker}>{kicker}</span>
        <h2>{title}</h2>
      </div>
      {text ? <p>{text}</p> : null}
    </div>
  )
}

function WorkCard({ project }: { project: WorkProject }) {
  const statusKey = project.status.toLowerCase().replace(/\s+/g, '-')
  return (
    <article
      className={`${styles.workCard} ${project.featured ? styles.workCardFeatured : ''} ${project.image ? styles.workCardShot : ''}`}
      data-status={statusKey}
      data-living-reveal
    >
      <div className={styles.workCardBody}>
        <div className={styles.workCardHead}>
          <span className={styles.workIndex}>{project.index}</span>
          <span className={styles.workStatus}>{project.status}</span>
        </div>
        <h3 className={styles.workName}>{project.name}</h3>
        <p className={styles.workDomain}>{project.domain}</p>
        <p className={styles.workTagline}>{project.tagline}</p>
        <dl className={styles.workMetrics}>
          {project.metrics.map((metric) => (
            <div key={metric.label}>
              <dt>{metric.value}</dt>
              <dd>{metric.label}</dd>
            </div>
          ))}
        </dl>
        <div className={styles.workFoot}>
          <span className={styles.workStack}>{project.stack}</span>
          {project.href ? (
            <a className={styles.workLink} href={project.href} target="_blank" rel="noopener noreferrer">
              {project.linkLabel}
            </a>
          ) : (
            <span className={styles.workYear}>{project.year}</span>
          )}
        </div>
      </div>
      {project.image ? (
        <figure className={styles.workShot}>
          <span className={styles.workShotBar} aria-hidden="true"><i /><i /><i /></span>
          <Image
            src={project.image}
            alt={project.imageAlt ?? `${project.name} product screenshot`}
            fill
            sizes="(max-width: 940px) 92vw, 640px"
            className={styles.workShotImg}
          />
        </figure>
      ) : null}
    </article>
  )
}
