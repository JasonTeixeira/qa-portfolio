import { Reveal } from '@/components/agency/core'

/**
 * Manifesto break — full-bleed editorial statement between the ledger and
 * work samples. Deliberately boxless: the one section that drops the grid
 * texture. Server component.
 */
export function Manifesto() {
  return (
    <section className="ag-manifesto" aria-label="The position">
      <Reveal>
        <p className="ag-manifesto-kicker">THE POSITION</p>
      </Reveal>
      <Reveal delay={90}>
        <h2 className="ag-manifesto-statement">
          Most automation portfolios are theater. This one is instrumented.
        </h2>
      </Reveal>
      <Reveal delay={180}>
        <p className="ag-manifesto-support">
          Green checkmarks you can&apos;t inspect, time savings nobody measured, demos that die in
          production — that&apos;s theater.
        </p>
      </Reveal>
      <Reveal delay={230}>
        <p className="ag-manifesto-support">
          Instrumented means: every claim carries its artifact, every gate generates a verdict, and
          this site runs its own release gate in CI.
        </p>
      </Reveal>
      <Reveal delay={300}>
        <p className="ag-manifesto-close">PRODUCTION SYSTEMS, NOT PORTFOLIO THEATER.</p>
      </Reveal>
    </section>
  )
}
