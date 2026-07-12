import type { Metadata } from 'next'

import { AgencyNav } from '@/components/agency/nav'
import { AgencyFooter } from '@/components/agency/footer'
import { AuditTool } from '@/components/agency/islands/audit-tool'
import './audit.css'

export const metadata: Metadata = {
  title: 'Site Teardown — Jason Teixeira',
  description:
    'Free automated site teardown: paste a URL, get four Lighthouse scores, core web vitals, and the six worst findings — via Google PageSpeed Insights. No email required.',
  alternates: { canonical: 'https://agency.sageideas.dev/audit' },
}

export default function AuditPage() {
  return (
    <>
      <AgencyNav />
      <main id="main-content" tabIndex={-1}>
        <section className="ag-section ag-audit-hero" aria-labelledby="audit-heading">
          <p className="ag-kicker">FREE AUTOMATED TEARDOWN</p>
          <h1 id="audit-heading" className="ag-audit-h1">
            Paste a URL. Get a scored teardown.
          </h1>
          <p className="ag-audit-sub">
            Runs Google PageSpeed Insights against your site — the same class of check my release
            gates run. Four scores, core web vitals, and the six worst findings. No email
            required.
          </p>
          <AuditTool />
        </section>
      </main>
      <AgencyFooter />
    </>
  )
}
