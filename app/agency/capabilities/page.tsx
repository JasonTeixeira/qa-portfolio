import type { Metadata } from 'next'

import { AgencyNav } from '@/components/agency/nav'
import { AgencyFooter } from '@/components/agency/footer'
import { PrintButton } from '@/components/agency/islands/print-button'
import { SERVICES } from '@/data/agency/services'
import { CASE_STUDIES } from '@/data/agency/case-studies'
import { TIER_LEGEND } from '@/data/agency/ledger'
import './capabilities.css'

const CAPABILITIES_URL = 'https://agency.sageideas.dev/capabilities'

export const metadata: Metadata = {
  title: 'Capabilities — Jason Teixeira',
  description:
    'One-page capabilities statement: AI systems, QA infrastructure, and automation workflows — with the case studies and toolbox behind them. Print-ready.',
  alternates: { canonical: CAPABILITIES_URL },
}

/* Mirrors the homepage 30-second scan (components/agency/sections/scan.tsx);
   those constants are module-private, so the same text is inlined here.
   Keep the two lists in sync. */
const AUTOMATION_I_SHIP = [
  'CI/CD release gates & readiness reports',
  'Browser + E2E test fleets',
  'AI workflow evals & guardrails',
  'Ops automation — webhooks, queues, integrations',
  'Agent/MCP systems & internal tools',
  'Data pipelines with integrity checks',
] as const

/* Same source as the homepage toolbox band — all tools in active use. */
const TOOL_GROUPS = [
  { label: 'TESTING & QA', tools: 'Playwright · Maestro (mobile E2E) · Vitest / Jest · axe-core · Lighthouse CI · visual regression' },
  { label: 'AI SYSTEMS', tools: 'Claude / OpenAI / DeepSeek APIs · RAG + embeddings · eval harnesses · LLM-as-judge · MCP servers' },
  { label: 'LANGUAGES', tools: 'TypeScript · Node.js · Python · SQL · Bash' },
  { label: 'PIPELINES & DELIVERY', tools: 'GitHub Actions · CI release gates · Docker · Vercel · EAS / TestFlight · webhooks · queues · cron' },
  { label: 'DATA & OBSERVABILITY', tools: 'Postgres / Supabase · DuckDB · Redis · Stripe API · Sentry · PostHog' },
] as const

const LINKS = [
  { label: 'SITE', value: 'agency.sageideas.dev', href: 'https://agency.sageideas.dev' },
  { label: 'EMAIL', value: 'sage@sageideas.dev', href: 'mailto:sage@sageideas.dev' },
  { label: 'GITHUB', value: 'github.com/JasonTeixeira', href: 'https://github.com/JasonTeixeira' },
  { label: 'BOOK A CALL', value: 'sageideas.dev/book', href: 'https://sageideas.dev/book' },
] as const

export default function CapabilitiesPage() {
  return (
    <>
      <div className="ag-cap-chrome">
        <AgencyNav />
      </div>
      <main className="ag-cap-page">
        {/* header */}
        <header className="ag-cap-head">
          <div>
            <p className="ag-cap-kicker">CAPABILITIES — ONE PAGE</p>
            <h1 className="ag-cap-name">JASON TEIXEIRA</h1>
            <p className="ag-cap-title">AI / QA / Automation Engineer — systems that prove they work</p>
          </div>
          <div className="ag-cap-contacts">
            {LINKS.map((link) => (
              <p key={link.label} className="ag-cap-contact">
                <span className="ag-cap-contact-label">{link.label}</span>{' '}
                <a href={link.href}>{link.value}</a>
              </p>
            ))}
          </div>
        </header>

        <div className="ag-cap-print-row">
          <PrintButton />
        </div>

        {/* automation I ship */}
        <section className="ag-cap-section" aria-labelledby="cap-ship">
          <h2 id="cap-ship" className="ag-cap-h2">
            AUTOMATION I SHIP
          </h2>
          <ul className="ag-cap-ship-list">
            {AUTOMATION_I_SHIP.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {/* services */}
        <section className="ag-cap-section" aria-labelledby="cap-services">
          <h2 id="cap-services" className="ag-cap-h2">
            FIXED-SCOPE ENGAGEMENTS
          </h2>
          <ul className="ag-cap-rows">
            {SERVICES.map((service) => (
              <li key={service.id} className="ag-cap-row">
                <p className="ag-cap-row-title">{service.title}</p>
                <p className="ag-cap-row-text">{service.tagline}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* case studies */}
        <section className="ag-cap-section" aria-labelledby="cap-cases">
          <h2 id="cap-cases" className="ag-cap-h2">
            SELECTED WORK — EVERY NUMBER TRACES TO AN ARTIFACT
          </h2>
          <ul className="ag-cap-rows">
            {CASE_STUDIES.map((study) => (
              <li key={study.id} className="ag-cap-row">
                <p className="ag-cap-row-title">
                  {study.title}
                  <span className="ag-cap-row-badge"> — {study.badge.label}</span>
                </p>
                <p className="ag-cap-row-text">{study.built}</p>
                <p className="ag-cap-row-stats">
                  {study.stats.map((stat) => `${stat.value} ${stat.label}`).join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* toolbox */}
        <section className="ag-cap-section" aria-labelledby="cap-toolbox">
          <h2 id="cap-toolbox" className="ag-cap-h2">
            THE TOOLBOX — ALL IN ACTIVE USE
          </h2>
          <ul className="ag-cap-toolbox">
            {TOOL_GROUPS.map((group) => (
              <li key={group.label}>
                <span className="ag-cap-tool-label">{group.label}</span>{' '}
                <span className="ag-cap-tool-list">{group.tools}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* links footer */}
        <footer className="ag-cap-foot">
          <p className="ag-cap-foot-tiers">
            PROOF TIERS: {TIER_LEGEND.map((entry) => `${entry.tier} = ${entry.label}`).join(' · ')}
          </p>
          <p className="ag-cap-foot-links">
            {LINKS.map((link, index) => (
              <span key={link.label}>
                {index > 0 ? ' · ' : ''}
                <a href={link.href}>{link.value}</a>
              </span>
            ))}
          </p>
          <p className="ag-cap-foot-honesty">
            NO INVENTED METRICS — EVERY CLAIM ON THIS SHEET IS BACKED ON AGENCY.SAGEIDEAS.DEV/#LEDGER
          </p>
        </footer>
      </main>
      <div className="ag-cap-chrome">
        <AgencyFooter />
      </div>
    </>
  )
}
