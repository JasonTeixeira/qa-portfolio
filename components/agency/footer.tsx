import Link from 'next/link'

import { OPEN_SOURCE_REPOS } from '@/components/agency/sections/scan'
import siteProof from '@/proof/site-proof.json'

// Same honesty contract as the hero strip and GateRunner: the SHIP chip renders
// only if every check in proof/site-proof.json passes. Computed at module level
// so the footer stays a server component.
const GATE_ALL_PASS: boolean = siteProof.checks.every((check) => check.status === 'pass')

interface FooterLink {
  label: string
  href: string
  external?: boolean
}

interface FooterColumn {
  heading: string
  links: readonly FooterLink[]
}

const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    heading: 'PROOF',
    links: [
      { label: 'PROOF GRID', href: '/#proof' },
      { label: 'CASE STUDIES', href: '/#case-studies' },
      { label: 'LEDGER', href: '/#ledger' },
      { label: 'WORK SAMPLES', href: '/#work-samples' },
    ],
  },
  {
    heading: 'PAGES',
    links: [
      { label: 'SERVICES', href: '/services' },
      { label: 'METHOD', href: '/method' },
      { label: 'AUDIT', href: '/audit' },
      { label: 'WRITING', href: '/blog' },
      { label: 'ABOUT', href: '/#about' },
    ],
  },
  {
    heading: 'CODE',
    links: OPEN_SOURCE_REPOS.map((repo) => ({
      label: repo.name,
      href: `https://github.com/JasonTeixeira/${repo.name}`,
      external: true,
    })),
  },
  {
    heading: 'CONTACT',
    links: [
      { label: 'sage@sageideas.dev', href: 'mailto:sage@sageideas.dev' },
      {
        label: 'LINKEDIN',
        href: 'https://www.linkedin.com/in/jason-teixeira/',
        external: true,
      },
      { label: 'GITHUB', href: 'https://github.com/JasonTeixeira', external: true },
      { label: 'BOOK A CALL', href: 'https://sageideas.dev/book', external: true },
    ],
  },
] as const

/** Site footer — full sitemap. The honesty line is part of the proof system. Never remove it. */
export function AgencyFooter() {
  return (
    <footer className="ag-footer">
      <div className="ag-footer-top">
        <div className="ag-footer-id">
          <span className="ag-footer-mark">
            JASON TEIXEIRA{' '}
            <span className="ag-footer-diamond" aria-hidden="true">
              ◆
            </span>
          </span>
          <p className="ag-footer-tag">
            AI systems, QA infrastructure, and automation workflows that prove they work.
          </p>
        </div>

        <nav className="ag-footer-grid" aria-label="Footer">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading} className="ag-footer-col">
              <p className="ag-kicker ag-footer-col-h">{column.heading}</p>
              <ul className="ag-footer-list">
                {column.links.map((link) =>
                  link.external ? (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ag-footer-link"
                      >
                        {link.label}
                      </a>
                    </li>
                  ) : (
                    <li key={link.href}>
                      <Link href={link.href} className="ag-footer-link">
                        {link.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="ag-footer-bottom">
        <span className="ag-footer-copy">© 2026 JASON TEIXEIRA — BUILT AS A PROOF SYSTEM</span>
        <span className="ag-footer-honesty">
          NO INVENTED METRICS · UNVERIFIED WORK IS LABELED PROTOTYPE OR LOCAL PROOF · EVERY DIAGRAM
          BUILT IN CODE
        </span>
        <span className="ag-footer-gate">
          {GATE_ALL_PASS ? (
            <>
              gate: SHIP <span className="ag-footer-gate-check">✓</span>
            </>
          ) : (
            <>gate: verification in progress</>
          )}
        </span>
      </div>
    </footer>
  )
}
