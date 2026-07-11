import { Reveal } from '@/components/agency/core'
import { SectionShell } from '@/components/agency/section-shell'

/**
 * Section 08 — The operator. Face + facts, in the site's instrument language.
 * Copy distilled from the public GitHub profile (github.com/JasonTeixeira) —
 * nothing here that isn't stated publicly elsewhere.
 */

const SIGNAL_ROWS: ReadonlyArray<[string, string]> = [
  ['mode', 'founder-engineer'],
  ['focus', 'automation + AI systems + QA infrastructure'],
  ['edge', 'evals, release gates, pipelines, cloud'],
  ['stack', 'TypeScript / Python · Next.js / FastAPI · Supabase / AWS'],
  ['standard', 'production > prototype'],
]

const NETWORK = [
  { name: 'SAGE IDEAS', href: 'https://www.sageideas.dev/', note: 'AI-native studio' },
  { name: 'NEXURAL', href: 'https://www.nexural.io', note: 'trading infrastructure' },
  { name: 'SAGE AFTER DARK', href: 'https://www.sageafterdark.com', note: 'creative lab' },
] as const

export function AboutSection() {
  return (
    <SectionShell
      id="about"
      num="08"
      kicker="THE OPERATOR"
      annotation="PRODUCTION SYSTEMS, NOT PORTFOLIO THEATER"
      ghost="08"
    >
      <div className="ag-about">
        <Reveal className="ag-about-id">
          <figure className="ag-about-photo">
            <img
              src="/agency/jason.png"
              alt="Jason Teixeira"
              width={460}
              height={460}
              loading="lazy"
            />
          </figure>
          <h3 className="ag-about-name">Jason Teixeira</h3>
          <p className="ag-about-role">AI / QA / AUTOMATION ENGINEER · FOUNDER, SAGE IDEAS</p>
          <div className="ag-about-links">
            <a
              href="https://github.com/JasonTeixeira"
              target="_blank"
              rel="noopener noreferrer"
            >
              ↗ GITHUB
            </a>
            <a
              href="https://www.linkedin.com/in/jason-teixeira/"
              target="_blank"
              rel="noopener noreferrer"
            >
              ↗ LINKEDIN
            </a>
          </div>
        </Reveal>

        <Reveal delay={120} className="ag-about-body">
          <p className="ag-about-p">
            I build production-grade automation: AI systems with eval harnesses, QA
            infrastructure that signs its own evidence, release gates that generate verdicts
            instead of feelings, and the pipelines that keep all of it observable and
            recoverable.
          </p>
          <p className="ag-about-p">
            I run <strong>Sage Ideas</strong>, an AI-native studio shipping full-stack products
            and automation systems for operators who need software that works under pressure —
            and <strong>Nexural</strong>, a quant trading stack where a false green costs real
            money. That&apos;s where the no-invented-metrics discipline on this site comes from:
            my own systems only get to claim what their artifacts can prove.
          </p>

          <div className="ag-about-signal" aria-label="Operator signal summary">
            <p className="ag-about-signal-h">SIGNAL</p>
            <dl className="ag-about-signal-rows">
              {SIGNAL_ROWS.map(([key, value]) => (
                <div key={key} className="ag-about-signal-row">
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="ag-about-network">
            {NETWORK.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="ag-about-network-link"
              >
                <span className="ag-about-network-name">{item.name}</span>
                <span className="ag-about-network-note">{item.note}</span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </SectionShell>
  )
}
