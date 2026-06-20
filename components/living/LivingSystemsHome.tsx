import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { workProjects, type WorkProject } from '@/data/home/living-projects'
import { attributedTestimonials, permissionedLogos } from '@/data/social-proof/attributed'
import { TrackedLink } from '@/components/analytics/tracked-link'
import { NewsletterSignup } from '@/components/newsletter-signup'
import { RouteFinderHeroExperiment } from '@/components/cro/RouteFinderHeroExperiment'
import { LivingSoundControl } from './LivingSoundControl'
import { LivingSystemsMotion } from './LivingSystemsMotion'
import { IntentGate } from './IntentGate'
import { MobileCtaBar } from './MobileCtaBar'
import { SplashBackdrop } from './SplashBackdrop'
import { CountUp } from '@/components/motion/CountUp'
import { CinematicBackdrop } from '@/components/motion/CinematicBackdrop'
import styles from './LivingSystemsHome.module.css'

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

const funnel = [
  {
    title: 'Audit',
    timing: 'Days 1–5',
    price: 'from $1,500',
    text: 'Find the single highest-leverage bottleneck and leave with a scoped, costed build plan you own — engage or not.',
  },
  {
    title: 'Sprint',
    timing: 'Weeks 1–2',
    price: 'from $4,500',
    text: 'Ship one visible, production-grade improvement — real code, deployed, measured against conversion.',
  },
  {
    title: 'Build',
    timing: 'Weeks 3–8',
    price: 'from $9,500',
    text: 'Turn the validated direction into the live product, site, AI systems, and offer engine.',
  },
  {
    title: 'Operate',
    timing: 'Ongoing',
    price: 'monthly retainer',
    text: 'Measure, improve, and publish so the system compounds instead of quietly decaying.',
  },
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
                  <stop offset="1" stopColor="#BCD2FF" />
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
          drift
          className="z-[-2]"
        />
        <div className={styles.heroGrid} data-living-parallax aria-hidden="true" />
        <p className={styles.eyebrow} data-living-reveal>
          <span /> Sage Ideas · AI-native studio · since 2020
        </p>
        <h1 id="hero-heading" className={styles.heroTitle}>
          <span className={styles.heroLine}><span>I build the product,</span></span>
          <span className={styles.heroLine}><span>the brand, and the</span></span>
          <span className={styles.heroLine}><span><em>AI</em> that runs it.</span></span>
        </h1>
        <div className={styles.heroLower} data-living-reveal>
          <p>
            A solo, AI-native studio. I run my own products every day and put the same system —
            AI, apps, SaaS, brand, growth — to work for yours. From someone who
            <strong> builds</strong>, not someone who just pitches.
          </p>
          <div className={styles.heroCtas}>
            <TrackedLink
              className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonLg}`}
              href="/book?source=home_hero"
              event="booking_click"
              eventProps={{ location: 'home_hero', label: 'book_a_call' }}
            >
              <span>Book a call</span><span aria-hidden="true">→</span>
            </TrackedLink>
            <TrackedLink
              className={`${styles.button} ${styles.buttonGhost} ${styles.buttonLg}`}
              href="#work"
              event="cta_click"
              eventProps={{ location: 'home_hero', label: 'see_the_work' }}
            >
              <span>See the work</span><span aria-hidden="true">↓</span>
            </TrackedLink>
          </div>
          <p className={styles.heroTrust}>
            Free 20-min fit call · fixed scope · reversible in 30s · no contract to start.
          </p>
          <TrackedLink
            className={styles.heroSecondary}
            href="/academy?source=home_hero"
            event="cta_click"
            eventProps={{ location: 'home_hero', label: 'learn_the_system' }}
          >
            Building it yourself? <strong>Learn the system →</strong>
          </TrackedLink>
        </div>
        <RouteFinderHeroExperiment surface="home" />
        <div className={styles.systemDiagram} data-living-reveal aria-label="What the studio builds — one connected system">
          <span className={styles.systemKicker}>One operator · one connected system</span>
          <svg
            className={styles.systemSvg}
            viewBox="0 0 920 124"
            role="img"
            aria-label="Strategy to Product to AI Systems to Brand to Growth to Operate"
          >
            <defs>
              <linearGradient id="system-flow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#3D5AFE" />
                <stop offset="1" stopColor="#BCD2FF" />
              </linearGradient>
            </defs>
            <path className={styles.systemTrack} d="M60 56 H860" />
            <path className={styles.systemFlow} d="M60 56 H860" stroke="url(#system-flow)" />
            {[
              { x: 60, label: 'Strategy' },
              { x: 220, label: 'Product' },
              { x: 380, label: 'AI Systems' },
              { x: 540, label: 'Brand' },
              { x: 700, label: 'Growth' },
              { x: 860, label: 'Operate' },
            ].map((node, i) => (
              <g key={node.label} className={styles.systemNode} style={{ animationDelay: `${i * 0.35}s` }}>
                <circle cx={node.x} cy={56} r="6.5" />
                <text x={node.x} y={92} textAnchor="middle">{node.label}</text>
              </g>
            ))}
          </svg>
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

      <section className={styles.showcase} aria-label="The system, live">
        <div className={styles.showcaseInner} data-living-reveal>
          <div className={styles.showcaseCopy}>
            <span className={styles.kicker}>Live in production</span>
            <h2>This is what “shipped” looks like.</h2>
            <p>
              Not a mockup — a real desk inside Nexural: live market reads, convergence signals,
              sector rotation, and risk in one operator-grade surface. The same depth and finish go
              into what I build for you.
            </p>
            <TrackedLink
              className={styles.textLink}
              href="/work"
              event="cta_click"
              eventProps={{ location: 'home_showcase', label: 'see_case_studies' }}
            >
              See the case studies →
            </TrackedLink>
          </div>
          <figure className={styles.showcaseShot}>
            <span className={styles.workShotBar} aria-hidden="true"><i /><i /><i /></span>
            <Image
              src="/work/nexural-swing.webp"
              alt="Nexural Swing Desk — live market read, convergence signal, sector rotation, and risk in one view."
              width={1600}
              height={1000}
              sizes="(max-width: 900px) 100vw, 1100px"
              className={styles.showcaseImg}
            />
          </figure>
        </div>
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

      <section className={styles.funnel} aria-labelledby="funnel-heading">
        <div className={styles.funnelIntro} data-living-reveal>
          <span className={styles.kicker}>004 — How we work</span>
          <h2 id="funnel-heading">A clear path, a fixed scope, a real number.</h2>
          <p>
            Every engagement starts small and earns the next step. You always know the timeline,
            the deliverable, and the price before you commit — and you keep what we build at every
            stage, whether or not you continue.
          </p>
        </div>
        <ol className={styles.funnelSteps}>
          {funnel.map((step, index) => (
            <li key={step.title} data-living-reveal>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div className={styles.funnelHead}>
                <h3>{step.title}</h3>
                <p className={styles.funnelMeta}>{step.timing} · <b>{step.price}</b></p>
              </div>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.academy} id="academy" aria-labelledby="academy-heading">
        <div className={styles.academyCopy} data-living-reveal>
          <span className={styles.kicker}>005 — Academy</span>
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
        <SectionHead center kicker="006 — Proof" title="The receipts." text="Shipped products you can open and a public build record going back to 2020." />
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
          <span className={styles.kicker}>007 — Operator</span>
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
          kicker="008 — Proof & references"
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

        {/* Callable references — the real anti-cherry-pick differentiator */}
        <div className={styles.references} data-living-reveal>
          <div>
            <span className={styles.kicker}>References, not cherry-picked quotes</span>
            <h3>Phone a real collaborator before you sign.</h3>
            <p>
              Most studios show you three hand-picked testimonials. I’ll connect you with real
              people I’ve built for — unfiltered, on the record. The person who pitches you is the
              person who types the code.
            </p>
          </div>
          <TrackedLink
            className={`${styles.button} ${styles.buttonGhost} ${styles.buttonLg}`}
            href="/book?source=home_references"
            event="booking_click"
            eventProps={{ location: 'home_references', label: 'ask_for_references' }}
          >
            <span>Ask for references</span><span aria-hidden="true">→</span>
          </TrackedLink>
        </div>

        {/* Permissioned client logos — render only when real ones exist */}
        {permissionedLogos.length > 0 ? (
          <div className={styles.logoStrip} data-living-reveal aria-label="Clients">
            {permissionedLogos.map((l) =>
              l.href ? (
                <a key={l.id} href={l.href} target="_blank" rel="noopener noreferrer">
                  <img src={l.logo} alt={l.label} loading="lazy" />
                </a>
              ) : (
                <img key={l.id} src={l.logo} alt={l.label} loading="lazy" />
              ),
            )}
          </div>
        ) : null}

        {/* Attributed testimonials — render only when real, named, permissioned */}
        {attributedTestimonials.length > 0 ? (
          <div className={styles.quotes} data-living-reveal>
            {attributedTestimonials.map((t) => (
              <figure className={styles.quoteCard} key={t.id}>
                <blockquote>{t.quote}</blockquote>
                {t.outcome ? <p className={styles.quoteOutcome}>{t.outcome}</p> : null}
                <figcaption>
                  <span>{t.name}</span>
                  <small>
                    {t.title}, {t.company}
                  </small>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}

        <p className={styles.trustNote} data-living-reveal>
          No invented quotes, no borrowed logos. Real named references on request — and added here as
          they’re permissioned.
        </p>
      </section>

      <section className={styles.final} id="build" aria-labelledby="build-heading">
        <span className={styles.seal} aria-hidden="true">道</span>
        <span className={styles.kicker} data-living-reveal>009 — Build</span>
        <h2 id="build-heading">Bring me the hard one.</h2>
        <p data-living-reveal>An app, a brand, a SaaS, or all of it. Every engagement starts with a real conversation, not a contract.</p>
        <div className={styles.finalCtas} data-living-reveal>
          <TrackedLink
            className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonLg}`}
            href="/book?source=home_final"
            event="booking_click"
            eventProps={{ location: 'living_final', label: 'book_a_call' }}
          >
            <span>Book a call</span><span aria-hidden="true">→</span>
          </TrackedLink>
          <TrackedLink
            className={`${styles.button} ${styles.buttonGhost} ${styles.buttonLg}`}
            href="/academy"
            event="cta_click"
            eventProps={{ location: 'living_final', label: 'academy' }}
          >
            <span>Learn the system</span><span aria-hidden="true">↗</span>
          </TrackedLink>
        </div>
      </section>

      {/* Sticky mobile conversion bar — portaled to body to escape main's transform */}
      <MobileCtaBar />
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
