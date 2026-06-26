import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { workProjects, type WorkProject } from '@/data/home/living-projects'
import { attributedTestimonials, permissionedLogos } from '@/data/social-proof/attributed'
import { TrackedLink } from '@/components/analytics/tracked-link'
import { LivingSoundControl } from './LivingSoundControl'
import { LivingSystemsMotion } from './LivingSystemsMotion'
import { OperatorConsole } from './OperatorConsole'
import { StudioAcademySwitch } from '@/components/studio-academy-switch'
import { IntentGate } from './IntentGate'
import { MobileCtaBar } from './MobileCtaBar'
import { getLocale } from '@/lib/i18n/server'
import { getMessages, translate } from '@/lib/i18n/messages'
import { SplashBackdrop } from './SplashBackdrop'
import { CountUp } from '@/components/motion/CountUp'
import styles from './LivingSystemsHome.module.css'

const services = [
  ['S-01', 'Lead systems', 'Capture traffic, rank the best opportunities, and give your team the next call to make.'],
  ['S-02', 'Quote engines', 'Turn generic service pages into quote paths that separate urgent jobs from casual visitors.'],
  ['S-03', 'AI workflows', 'Put AI inside intake, support, follow-up, research, and reporting where the work already happens.'],
  ['S-04', 'Conversion sites', 'Rebuild the website around proof, demos, offers, and the action a buyer should take next.'],
] as const

const openSystems = [
  {
    name: 'Revenue OS',
    href: '/showcase/revenue-os',
    outcome: 'Turn scattered leads, replies, ads, and missed calls into one daily queue your team can work.',
    proof: '$84k visible pipeline, 37+ leads/day, 2x follow-up lift',
    package: 'Lead routing, reply tracking, sales dashboard, follow-up engine',
    cta: 'Open Revenue OS',
  },
  {
    name: 'Contractor Quote Engine',
    href: '/showcase/contractor-quote-engine',
    outcome: 'Qualify quote requests by job type, urgency, location, and value before your team calls back.',
    proof: '4.8x clearer quote intent, 12m target handoff, 94 urgency score',
    package: 'Trade-specific quote flow, urgency scoring, walkthrough handoff',
    cta: 'Open Quote Engine',
  },
] as const

const buyerRoutes = [
  {
    title: 'Get more leads',
    text: 'Make the website explain the offer, capture demand, and route every serious buyer into a follow-up path.',
    proof: 'Live Revenue OS demo',
    href: '/showcase/revenue-os',
  },
  {
    title: 'Qualify quote requests',
    text: 'Separate urgent, valuable work from casual form fills before your team wastes the first call.',
    proof: 'Contractor Quote Engine',
    href: '/showcase/contractor-quote-engine',
  },
  {
    title: 'Automate intake',
    text: 'Collect the right details, score the opportunity, and send clean next steps without a back-office scramble.',
    proof: 'Intake flow package',
    href: '/book?source=home_route_intake',
  },
  {
    title: 'Launch AI support',
    text: 'Give customers answers, escalation, and operator visibility without turning support into a black box.',
    proof: 'Support dashboard build',
    href: '/book?source=home_route_support',
  },
  {
    title: 'Improve website conversion',
    text: 'Turn a vague site into a buyer path with proof, sharp CTAs, and a working demo people can click.',
    proof: 'Conversion rebuild',
    href: '/book?source=home_route_conversion',
  },
] as const

const receipts = [
  ['11', 'Products in production'],
  ['100%', 'Verifiable before you sign'],
  ['0', 'Surprise change orders'],
  ['2020', 'Shipping since'],
] as const

const funnel = [
  {
    title: 'Sage Audit',
    timing: '1 week',
    price: '$750',
    text: 'Find the single highest-leverage bottleneck and leave with a scoped, costed build plan you own. Credited in full if you continue.',
  },
  {
    title: 'Sprint',
    timing: 'Weeks 1–2',
    price: 'from $4,500',
    text: 'Ship one visible production improvement: real code, deployed, measured against conversion.',
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

const trustSignals = [
  ['Direct line', 'You work with the operator who builds it. No account managers, no handoff, no dilution.'],
  ['NDA, MSA, SOW', 'Real contracting from day one. Scope and IP protected on paper before code is written.'],
  ['Openable proof', 'A public build record going back to 2020. Open the repos, read the commits, verify the work.'],
  ['Human-reviewed', 'Every commit is read by a principal. AI accelerates the work; it never ships unchecked.'],
] as const


export async function LivingSystemsHome() {
  const messages = getMessages(await getLocale())
  const t = (source: string) => translate(messages, source)
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
        <a href="#systems">Systems</a>
        <a href="#work">Work</a>
        <a href="#services">Services</a>
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
        <span className={`${styles.heroTick} ${styles.heroTickTR}`} aria-hidden="true">01 / 06</span>
        <div className={styles.heroEditorial}>
          <div className={styles.heroCol}>
            <p className={styles.eyebrow} data-living-reveal>
              <span /> Websites, apps, and AI systems that move buyers
            </p>
            <h1 id="hero-heading" className={styles.heroTitle}>
              <span className={styles.heroLine}><span>Turn traffic into</span></span>
              <span className={styles.heroLine}><span>booked calls and</span></span>
              <span className={styles.heroLine}><span><em>qualified leads.</em></span></span>
            </h1>
            <div className={styles.heroLower} data-living-reveal>
              <p>
                I build the website, prototype, dashboard, and AI workflow that lets buyers see
                the outcome before the sales call. Less trust me. More <strong>open it and see it working</strong>.
              </p>
              <div className={styles.heroCtas}>
                <TrackedLink
                  className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonLg} ${styles.heroCtaHire}`}
                  href="#systems"
                  event="booking_click"
                  eventProps={{ location: 'home_hero', label: 'see_live_systems' }}
                >
                  <span>See live systems</span><span aria-hidden="true">↓</span>
                </TrackedLink>
                {/* Swapped in for visitors who chose "I'm here to learn" (data-intent=learn). */}
                <TrackedLink
                  className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonLg} ${styles.heroCtaLearn}`}
                  href="/academy"
                  event="cta_click"
                  eventProps={{ location: 'home_hero', label: 'enter_academy_intent' }}
                >
                  <span>Enter the Academy</span><span aria-hidden="true">→</span>
                </TrackedLink>
                <TrackedLink
                  className={`${styles.button} ${styles.buttonGhost} ${styles.buttonLg}`}
                  href="/book?source=home_hero_business"
                  event="cta_click"
                  eventProps={{ location: 'home_hero', label: 'build_this_for_my_business' }}
                >
                  <span>Build this for my business</span><span aria-hidden="true">→</span>
                </TrackedLink>
              </div>
              <p className={styles.heroTrust}>
                Openable demos. Fixed scope. Buyer paths built around revenue.
              </p>
            </div>
            <span className={`${styles.heroTick} ${styles.heroTickBL}`} aria-hidden="true">nexural.system</span>
          </div>
          <div className={styles.heroProofPanel} aria-label="Traffic to booked calls visual">
            <div className={styles.heroProofHeader}>
              <span>Buyer path</span>
              <b>Live system preview</b>
            </div>
            <div className={styles.heroProofFlow}>
              <div className={styles.heroProofStack} aria-label="Demand sources">
                <span>Website form</span>
                <span>Inbox reply</span>
                <span>Ad lead</span>
                <span>Missed call</span>
              </div>
              <div className={styles.heroProofCore}>
                <small>Revenue OS</small>
                <strong>One queue</strong>
                <em>ranked by urgency + value</em>
              </div>
              <div className={styles.heroProofStack} aria-label="Business outcomes">
                <span>Hot leads worked</span>
                <span>Follow-ups protected</span>
                <span>Revenue at risk visible</span>
                <span className={styles.heroProofWin}>Booked calls</span>
              </div>
            </div>
            <div className={styles.heroProofMetric}>
              <strong>$84k</strong>
              <span>visible pipeline with next action assigned</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.systemSection} id="system" aria-label="What the studio builds">
        <p className={styles.systemLede} data-living-reveal>
          The site should not just look better. It should make the next best action obvious.
        </p>
        <OperatorConsole />
        <div className={styles.capStrip} data-living-reveal aria-label="Capabilities">
          <span>Lead systems</span><i>/</i><span>Quote engines</span><i>/</i><span>AI workflows</span><i>/</i><span>Conversion sites</span>
        </div>
      </section>

      <section className={styles.openSystems} id="systems" aria-label="Interactive systems you can open">
        <SectionHead
          kicker="Openable systems"
          title={<>Interactive systems<br />you can actually click.</>}
          text="Instead of asking a buyer to imagine the finished product, show them a working version: the problem, the new path, the dashboard, and the call to action."
        />
        <div className={styles.openSystemGrid}>
          {openSystems.map((system) => (
            <article className={styles.openSystemCard} key={system.name} data-living-reveal>
              <div>
                <span className={styles.kicker}>Live demo</span>
                <h3>{system.name}</h3>
                <p>{system.outcome}</p>
              </div>
              <dl>
                <div>
                  <dt>Proof</dt>
                  <dd>{system.proof}</dd>
                </div>
                <div>
                  <dt>Build package</dt>
                  <dd>{system.package}</dd>
                </div>
              </dl>
              <TrackedLink
                className={`${styles.button} ${styles.buttonPrimary}`}
                href={system.href}
                event="cta_click"
                eventProps={{ location: 'home_open_systems', label: system.name }}
              >
                <span>{system.cta}</span><span aria-hidden="true">→</span>
              </TrackedLink>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.buyerRoutes} aria-label="Buyer routes">
        <SectionHead
          kicker="Buyer routes"
          title={<>Pick the business outcome.<br />Then open the proof.</>}
          text="Each route has a visible demo, a focused build package, and a clear call path so buyers understand what changes in their business."
        />
        <div className={styles.routeGrid}>
          {buyerRoutes.map((route) => (
            <TrackedLink
              key={route.title}
              className={styles.routeCard}
              href={route.href}
              event="cta_click"
              eventProps={{ location: 'home_buyer_routes', label: route.title }}
              data-living-reveal
            >
              <span>{route.proof}</span>
              <h3>{route.title}</h3>
              <p>{route.text}</p>
              <b>View route →</b>
            </TrackedLink>
          ))}
        </div>
      </section>

      <section className={styles.work} id="work" aria-label="Selected work">
        <SectionHead
          kicker="Selected work"
          title={<>I run my own products.<br />Then I build yours.</>}
          text="Read straight from the repos: real stack, honest status, hard counts, no mockups."
        />
        <div className={styles.workGrid}>
          {workProjects.map((project) => (
            <WorkCard key={project.slug} project={project} />
          ))}
        </div>
        <p className={styles.workMore} data-living-reveal>
          <span>
            Seven shown, backed by 30+ more repos: trading ops, voice infrastructure, a CISSP
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
            <span className={styles.kicker}>Why this closes better</span>
            <h2>Buyers trust what they can open.</h2>
            <p>
              A normal website says what you do. A better one lets the buyer click through the
              future state: the qualified lead path, the daily queue, the proof, and the next step.
            </p>
            <TrackedLink
              className={styles.textLink}
              href="/showcase/revenue-os"
              event="cta_click"
              eventProps={{ location: 'home_showcase', label: 'open_revenue_os' }}
            >
              Open the flagship demo →
            </TrackedLink>
          </div>
          <div className={styles.proofFlow} aria-label="Buyer path proof">
            <div><span>1</span><b>Diagnose the leak</b><small>where buyers drop</small></div>
            <i aria-hidden="true" />
            <div><span>2</span><b>Show the system</b><small>prototype they can click</small></div>
            <i aria-hidden="true" />
            <div><span>3</span><b>Book the build</b><small>with proof already seen</small></div>
          </div>
        </div>
      </section>

      <section className={styles.services} id="services" aria-labelledby="services-heading">
        <SectionHead
          kicker="Services"
          title={<>Pick the business outcome.<br />Build the system around it.</>}
          text="Start with the leak: more leads, better quote requests, faster intake, AI support, or a conversion site buyers can trust."
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
          <span className={styles.kicker}>How we work</span>
          <h2 id="funnel-heading">A clear path, a fixed scope, a real number.</h2>
          <p>
            Every engagement starts small and earns the next step. You always know the timeline,
            the deliverable, and the price before you commit. You keep what we build at every
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
        <div className={styles.heroCtas} data-living-reveal style={{ marginTop: '2rem', justifyContent: 'center' }}>
          <TrackedLink
            className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonLg}`}
            href="/contact?engagement=audit&source=home_funnel"
            event="cta_click"
            eventProps={{ location: 'home_funnel', label: 'start_audit' }}
          >
            <span>Start with the Sage Audit, $750</span><span aria-hidden="true">→</span>
          </TrackedLink>
        </div>
      </section>

      <section className={styles.funnel} aria-labelledby="fit-heading">
        <div className={styles.funnelIntro} data-living-reveal>
          <span className={styles.kicker}>Fit</span>
          <h2
            id="fit-heading"
            style={{ fontFamily: 'var(--font-serif)', fontVariationSettings: "'opsz' 120, 'SOFT' 0, 'WONK' 0" }}
          >
            Who this is for and who it is not.
          </h2>
          <p>
            A small studio can&apos;t be the right answer for everyone, and pretending otherwise wastes
            your time and mine. Here&apos;s the honest filter before you reach out.
          </p>
        </div>
        <div className="mx-auto mt-8 grid w-full max-w-5xl gap-4 px-5 sm:px-8 md:grid-cols-2" data-living-reveal>
          <div className="rounded-[12px] border border-[rgba(24,182,99,0.28)] bg-[rgba(24,182,99,0.04)] p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#18b663]">A fit if you&apos;re…</p>
            <ul className="mt-4 space-y-3 text-[15px] leading-6 text-[var(--sage-ink-muted)]">
              <li>A founder or operator with real revenue or funding who needs production-grade systems, not a throwaway prototype.</li>
              <li>Buying senior judgment <em>and</em> execution from one accountable person, not a staffing bench.</li>
              <li>Ready to start small (the $750 Audit) and move on proof, not promises.</li>
            </ul>
          </div>
          <div className="rounded-[12px] border border-[rgba(255,92,122,0.22)] bg-[rgba(255,92,122,0.03)] p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#ff7a93]">Not a fit if you&apos;re…</p>
            <ul className="mt-4 space-y-3 text-[15px] leading-6 text-[var(--sage-ink-muted)]">
              <li>Shopping purely on price, or wanting the cheapest freelancer you can find.</li>
              <li>Looking for a big agency with account managers and a ten-person team.</li>
              <li>Not ready to decide or invest in doing it properly the first time.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.academyDoor} id="academy" aria-labelledby="academy-heading">
        <div className={styles.academyDoorInner} data-living-reveal>
          <span className={styles.kicker}>Learn the system</span>
          <h2 id="academy-heading">{t('Hire the studio or learn to build it yourself.')}</h2>
          <p>
            Everything I run for clients, taught as a practical curriculum: code foundations,
            AI engineering, and shipping real products. <strong>$20/mo</strong>, founding cohort forming.
          </p>
          <div className={styles.academyDoorSwitch}>
            <StudioAcademySwitch variant="full" />
          </div>
          <TrackedLink
            className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonLg}`}
            href="/academy"
            event="cta_click"
            eventProps={{ location: 'living_academy', label: 'enter_academy' }}
          >
            <span>{t('Enter the Academy')}</span><span aria-hidden="true">→</span>
          </TrackedLink>
        </div>
      </section>

      <section className={styles.proof} id="proof" aria-labelledby="proof-heading">
        <SectionHead center kicker="Proof" title="The receipts." text="Shipped products you can open and a public build record going back to 2020." />
        <div className={styles.receipts} data-living-reveal>
          {receipts.map(([value, label]) => (
            <div key={label}>
              <strong><CountUp value={value} /></strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <p className={styles.proofNote} data-living-reveal>
          No fabricated metrics, no invented testimonials, no fake screenshots. Every number above is
          openable on GitHub. Before you sign, you can get a real collaborator on the phone to
          verify exactly how I work.
        </p>
      </section>

      <section className={styles.operator} id="operator" aria-labelledby="operator-heading">
        <div data-living-reveal>
          <span className={styles.kicker}>Operator</span>
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
            <p>Founder / principal engineer / Sage Ideas</p>
          </div>
        </div>
      </section>

      <section className={styles.trust} id="trust" aria-labelledby="trust-heading">
        <SectionHead
          center
          kicker="Proof and references"
          title={<>What you actually get.</>}
          text="No agency theatre. A short list of things the studio commits to on every engagement, verifiable before you sign."
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
              Most studios show you three hand-picked testimonials. I will connect you with real
              people I have built for, unfiltered and on the record. The person who pitches you is the
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
          No invented quotes, no borrowed logos. Real named references on request, added here as
          they’re permissioned.
        </p>
      </section>

      <section className={styles.final} id="build" aria-labelledby="build-heading">
        <span className={styles.seal} aria-hidden="true">道</span>
        <span className={styles.kicker} data-living-reveal>Build</span>
        <h2 id="build-heading">{t('Bring me the hard one.')}</h2>
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
            <span>{t('Learn the system')}</span><span aria-hidden="true">↗</span>
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

// electric → moon → slate ramp for the tech stack bar (no rainbow)
const STACK_RAMP = ['#3d5afe', '#5e78ff', '#8ea6ff', '#bcd2ff', '#5b6172', '#3a3f4d']

function WorkCard({ project }: { project: WorkProject }) {
  const statusKey = project.status.toLowerCase().replace(/\s+/g, '-')
  const techs = project.stack.split(' · ')
  return (
    <article
      className={`${styles.workCard} ${project.featured ? styles.workCardFeatured : ''} ${project.image ? styles.workCardShot : ''}`}
      data-status={statusKey}
      data-living-reveal
    >
      <div className={styles.workCardBody}>
        <div className={styles.workCardHead}>
          <span className={styles.workIndex}>{project.index}</span>
          <span className={styles.workStatus} data-status={statusKey}>{project.status}</span>
        </div>
        <h3 className={styles.workName}>{project.name}</h3>
        <p className={styles.workDomain}>{project.domain}</p>
        <p className={styles.workTagline}>{project.tagline}</p>
        <div className={styles.workStackBar} aria-hidden="true">
          {techs.map((t, i) => (
            <i key={t} style={{ background: STACK_RAMP[Math.min(i, STACK_RAMP.length - 1)] }} />
          ))}
        </div>
        <p className={styles.workStack}>{project.stack}</p>
        <div className={styles.workMetrics}>
          {project.metrics.map((metric) => (
            <div key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>
        <div className={styles.workFoot}>
          {project.href ? (
            <a className={styles.workLink} href={project.href} target="_blank" rel="noopener noreferrer">
              {project.linkLabel}
            </a>
          ) : (
            <span className={styles.workYear}>{project.year}</span>
          )}
          <span className={styles.workArrow} aria-hidden="true">→</span>
        </div>
      </div>
      {project.image ? (
        <figure className={styles.workShot}>
          <span className={styles.workShotBar} aria-hidden="true">
            <i /><i /><i /><span className={styles.workShotUrl}>nexural.io</span>
          </span>
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
