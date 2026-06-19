import Link from 'next/link'
import Image from 'next/image'
import type { CSSProperties, ReactNode } from 'react'
import { livingProjects, type LivingProject } from '@/data/home/living-projects'
import { TrackedLink } from '@/components/analytics/tracked-link'
import { NewsletterSignup } from '@/components/newsletter-signup'
import { RouteFinderHeroExperiment } from '@/components/cro/RouteFinderHeroExperiment'
import { SystemFlowOverlay } from '@/components/living/SystemFlowLayer'
import { LivingSoundControl } from './LivingSoundControl'
import { LivingSystemsMotion } from './LivingSystemsMotion'
import { CountUp } from '@/components/motion/CountUp'
import { LivingNetworkHero } from '@/components/motion/LivingNetworkHero'
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
  ['130+', 'Public repos'],
  ['30', 'GitHub followers'],
  ['2020', 'Building since'],
  ['4', 'Owned products'],
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

export function LivingSystemsHome() {
  return (
    <div className={styles.page}>
      <LivingSystemsMotion />
      <div className={styles.loader} data-living-loader role="status" aria-live="polite" aria-label="Sage Living OS boot sequence">
        <div className={styles.bootFrame}>
          <div className={styles.bootHeader}>
            <span>Sage Living OS</span>
            <button type="button" data-living-splash-skip aria-label="Skip intro">Skip</button>
          </div>
          <div className={styles.bootCore}>
            <span className={styles.loaderMark}>
              <svg viewBox="0 0 42 42" width="72" height="72" fill="none" aria-hidden="true">
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
            <div>
              <p className={styles.loaderText}>Booting product, brand, and AI system</p>
              <p className={styles.bootSubcopy}>Surface to system. Studio to academy. Content to qualified demand.</p>
            </div>
          </div>
          <div className={styles.bootModules} aria-hidden="true">
            {['Studio', 'Academy', 'Proof', 'Tools', 'Content'].map((label) => (
              <span key={label} data-living-boot-module>{label}</span>
            ))}
          </div>
          <span className={styles.loaderBar}><i data-living-boot-progress /></span>
          <div className={styles.bootFooter}>
            <span data-living-boot-status>Initializing modules</span>
            <span>Native scroll · reduced-motion safe</span>
          </div>
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
        <a href="#build">Build</a>
      </nav>

      <div className={styles.cursor} data-living-cursor aria-hidden="true">
        <span />
      </div>
      <LivingSoundControl />
      <div className={styles.grade} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      <section className={styles.hero} id="top" aria-label="Introduction">
        <div className={styles.heroGrid} data-living-parallax aria-hidden="true" />
        <LivingNetworkHero className="pointer-events-none absolute inset-0 z-[-1]" />
        <p className={styles.eyebrow} data-living-reveal>
          <span /> Sage Ideas · AI-native studio · since 2020
        </p>
        <h1 id="hero-heading" className={styles.heroTitle}>
          <span>I build the product,</span>
          <span>the brand, and the</span>
          <span><em>AI</em> that runs it.</span>
        </h1>
        <div className={styles.heroLower} data-living-reveal>
          <p>
            A solo, AI-native studio. I run my own products every day and put the same
            system (AI, apps, SaaS, brand, growth) to work for yours. From someone who
            <strong> builds</strong>, not someone who just pitches.
          </p>
          <div className={styles.heroActions}>
            <div className={styles.ctas}>
              <TrackedLink
                className={`${styles.button} ${styles.buttonPrimary}`}
                href="/contact?source=home_hero"
                event="cta_click"
                eventProps={{ location: 'living_hero', label: 'start_project' }}
              >
                <span>Start a project</span><span aria-hidden="true">→</span>
              </TrackedLink>
              <TrackedLink
                className={`${styles.button} ${styles.buttonGhost}`}
                href="#work"
                event="cta_click"
                eventProps={{ location: 'living_hero', label: 'see_work' }}
              >
                <span>See the work</span><span aria-hidden="true">↘</span>
              </TrackedLink>
            </div>
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

      <section className={styles.work} id="work" aria-labelledby="work-heading" data-living-reel>
        <SectionHead
          kicker="002 — Selected work"
          title={<>I run my own products.<br />Then I build yours.</>}
          text="Four shipped products. Each surface is paired with the system beneath it."
        />
        <div className={styles.reelStage} data-living-stage>
          <div className={styles.reelHud} aria-hidden="true">
            <span><b data-living-reel-cur>01</b>/04</span>
            <span className={styles.reelRail}><i data-living-reel-rail /></span>
            <span>Scroll</span>
          </div>
          <div className={styles.scenes}>
            {livingProjects.map((project) => (
              <ProjectScene key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.services} id="services" aria-labelledby="services-heading">
        <SectionHead kicker="003 — Services" title={<>The piece,<br />or the whole business.</>} />
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

      <section className={styles.final} id="build" aria-labelledby="build-heading">
        <span className={styles.kicker} data-living-reveal>009 — Build</span>
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

function ProjectScene({ project }: { project: LivingProject }) {
  return (
    <article className={styles.scene} style={{ '--brand': project.brand } as CSSProperties} data-living-card data-living-scene>
      <div className={styles.sceneBg} aria-hidden="true" />
      <div className={`${styles.sceneInner} ${Number(project.index) % 2 === 0 ? styles.sceneReverse : ''}`}>
        <div className={styles.sceneLead}>
          <div className={styles.projectMeta}>
            <span>{project.index}</span>
            <div>
              <h3>{project.name}</h3>
              <p>{project.caption}</p>
            </div>
            <button type="button" data-living-peel aria-label="Reveal system view">
              <span data-living-peel-label>System</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <dl className={styles.specList}>
            <dt>Stack</dt><dd>{project.stack}</dd>
            <dt>System</dt><dd>{project.system}</dd>
            <dt>Category</dt><dd>{project.category}</dd>
          </dl>
          <div className={styles.metricList}>
            {project.metrics.map((metric) => (
              <div key={metric.label}>
                <strong data-count={metric.count} data-suffix={metric.suffix}>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
          <Link className={styles.textLink} href={project.href}>Open case study →</Link>
        </div>
        <div className={styles.device}>
          <div className={styles.surface}>
            <ProductSurface project={project} />
          </div>
          <div className={styles.system}>
            <SystemView project={project} />
          </div>
        </div>
      </div>
    </article>
  )
}

function ProductSurface({ project }: { project: LivingProject }) {
  return (
    <div className={styles.realSurface}>
      <Image
        src={project.screenshot.src}
        alt={project.screenshot.alt}
        fill
        sizes="(max-width: 940px) 92vw, 820px"
        className={styles.realSurfaceImage}
        priority={project.slug === 'nexural'}
      />
      <div className={styles.realSurfaceHud} aria-hidden="true">
        <span>{project.slug}.surface</span>
        <b>{project.caption}</b>
      </div>
    </div>
  )
}

function SystemView({ project }: { project: LivingProject }) {
  return (
    <div className={styles.sys}>
      <header><span>{project.slug}.system</span><b>{project.caption}</b></header>
      <svg viewBox="0 0 360 210" aria-hidden="true">
        <defs>
          <linearGradient id={`edge-${project.slug}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3D5AFE" /><stop offset="0.55" stopColor="#7C3AED" /><stop offset="1" stopColor="#FF2D9B" />
          </linearGradient>
        </defs>
        <g className={styles.edges} stroke={`url(#edge-${project.slug})`}>
          <path d="M70 58 L170 48" /><path d="M70 58 L150 112" /><path d="M170 48 L285 62" />
          <path d="M150 112 L262 132" /><path d="M170 48 L150 112" /><path d="M285 62 L262 132" />
          <path d="M150 112 L120 170" /><path d="M262 132 L302 170" />
        </g>
        {['input', 'router', 'surface', 'state', 'signals', 'audit', 'hooks'].map((node, i) => {
          const coords = [[38, 44], [138, 34], [248, 48], [116, 98], [228, 118], [88, 156], [268, 156]][i]
          return <g className={styles.node} key={node}><rect x={coords[0]} y={coords[1]} width="72" height="28" rx="4" /><text x={coords[0] + 36} y={coords[1] + 18}>{node}</text></g>
        })}
      </svg>
      <pre>{`const system = build({
  product: "${project.name}",
  surface: "interface",
  engine: "data + AI + ops",
});`}</pre>
    </div>
  )
}
