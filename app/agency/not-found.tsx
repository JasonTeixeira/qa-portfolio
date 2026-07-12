import type { Metadata } from 'next'
import Link from 'next/link'

import { AgencyFooter } from '@/components/agency/footer'
import { AgencyNav } from '@/components/agency/nav'

export const metadata: Metadata = {
  title: 'Route not found — Jason Teixeira',
}

/**
 * Agency-branded 404 — rendered for every notFound() inside the /agency
 * segment, including unknown paths routed here by the [...missing] catch-all.
 * Server component; same terminal/instrument language as the rest of the site.
 */
export default function AgencyNotFound() {
  return (
    <>
      <AgencyNav />
      <main id="main-content" tabIndex={-1} className="ag-404-main">
        <section className="ag-404-panel" aria-labelledby="ag-404-heading">
          <p className="ag-kicker">ROUTE RESOLUTION</p>
          <div className="ag-404-term">
            <p className="ag-404-line">
              <span className="ag-404-prompt" aria-hidden="true">
                $
              </span>{' '}
              resolve &lt;path&gt;
            </p>
            <p className="ag-404-line ag-404-fail">✗ FAIL route not found</p>
            <p className="ag-404-line ag-404-dim">the requested path does not exist in this build</p>
          </div>
          <h1 id="ag-404-heading" className="ag-404-readiness">
            READINESS: <span className="ag-404-lost">LOST</span>
          </h1>
          <div className="ag-404-ctas">
            <Link href="/" className="ag-btn ag-btn--solid">
              BACK TO PROOF
            </Link>
            <Link href="/audit" className="ag-btn">
              RUN A TEARDOWN
            </Link>
          </div>
        </section>
      </main>
      <AgencyFooter />
    </>
  )
}
