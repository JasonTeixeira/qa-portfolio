import Link from 'next/link'
import { ArrowRight, CheckCircle2, ClipboardCheck, ExternalLink, ShieldCheck, TriangleAlert } from 'lucide-react'
import { prototypeProof, verificationSnapshot } from '../proof-data'
import styles from '../showcase-decision.module.css'

export const metadata = {
  title: 'Working Prototype Proof Wall | Sage Ideas',
  description: 'Open the Sage Ideas prototype proof wall to see which business systems are working, tested, and ready to inspect before a build call.',
}

export default function ShowcaseProofPage() {
  const verifiedCount = prototypeProof.filter((item) => item.verified).length
  const flagship = prototypeProof.find((item) => item.slug === 'revenue-os')
  const systemsNeedingProof = prototypeProof.filter((item) => !item.verified || item.score < 90)

  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>Public proof wall</span>
          <h1>Open the proof before the call.</h1>
          <p>
            Every system below has a clear buyer outcome, a route you can open, and a visible proof status. The point is
            simple: see the work, then decide if Sage Ideas should build the version for your market.
          </p>
          <div className={styles.heroActions}>
            <Link href="/showcase/revenue-os" className={styles.primary}>
              Open the strongest demo <ArrowRight size={16} />
            </Link>
            <Link href="/book?source=showcase_proof" className={styles.secondary}>
              Book after you inspect it <ExternalLink size={16} />
            </Link>
          </div>
        </div>
        <aside className={styles.heroPanel} aria-label="Showcase proof summary">
          <div className={styles.heroPanelInner}>
            <span className={styles.microLabel}>Proof snapshot</span>
            <div className={styles.metricStack}>
              <div>
                <span>Working demos</span>
                <strong>{verifiedCount}</strong>
              </div>
              <div>
                <span>Flagship score</span>
                <strong>{flagship?.score ?? 0}</strong>
              </div>
              <div>
                <span>Needs more proof</span>
                <strong>{systemsNeedingProof.length}</strong>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className={styles.decisionGrid} aria-label="Current proof status">
        {verificationSnapshot.results.map((result) => (
          <article key={result.label} className={styles.decisionCard}>
            <span className={styles.microLabel}>{result.label}</span>
            <strong>{result.value}</strong>
            <p>{result.detail}</p>
          </article>
        ))}
      </section>

      <section className={styles.systemRail} aria-label="Prototype proof cards">
        {prototypeProof.map((item) => (
          <article key={item.slug} className={styles.systemCard}>
            <div>
              <div className={styles.systemTop}>
                <span className={styles.microLabel}>{item.verified ? 'Tested locally' : 'Proof incomplete'}</span>
                <b className={styles.scoreBadge}>{item.score}</b>
              </div>
              <h2>{item.name}</h2>
              <div className={styles.fitList}>
                <span>{item.route}</span>
                <span>{item.verified ? 'openable demo' : 'needs proof'}</span>
              </div>
            </div>

            <div>
              <p>
                {item.verified
                  ? 'This prototype has local route proof and a working public path. Open it to inspect the buyer flow before booking.'
                  : 'This prototype is useful, but it should not be treated as flagship proof until the deeper demo and evidence pass are complete.'}
              </p>
              <ul className={styles.proofList}>
                {item.checks.slice(0, 4).map((check) => (
                  <li key={check.label}>
                    <CheckCircle2 size={15} />
                    <span>{check.label}: {check.status}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <ul className={styles.gapList}>
                {item.gaps.slice(0, 3).map((gap) => (
                  <li key={gap}>
                    <TriangleAlert size={15} />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.rowActions}>
                <Link href={item.route} className={styles.smallLink}>
                  <ShieldCheck size={15} /> Open demo
                </Link>
                <Link href={`/book?source=proof_${item.slug}`} className={styles.smallLink}>
                  Build my version <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.evidencePanel}>
        <div className={styles.evidenceInner}>
          <div>
            <span className={styles.microLabel}>Evidence record</span>
            <h2>Proof badges only matter when the checks exist.</h2>
            <p>
              These commands are the current local evidence behind the proof wall. Real campaign outcomes still need live
              customer data, anonymized packets, or booking analytics before any page should claim high-90s trust.
            </p>
          </div>
          <ul className={styles.commandList} aria-label="Commands used for the current proof snapshot">
            {verificationSnapshot.commands.map((command) => (
              <li key={command}><ClipboardCheck size={13} aria-hidden /> {command}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.finalCta} aria-label="Showcase proof call to action">
        <div className={styles.finalInner}>
          <div>
            <span className={styles.microLabel}>Ready to map yours</span>
            <h2>Pick the closest demo. We build the version around your buyers.</h2>
            <p>
              Bring the market, the offer, and where leads currently stall. The call turns the closest working prototype
              into a build path for your business.
            </p>
          </div>
          <div className={styles.finalActions}>
            <Link href="/showcase/compare" className={styles.secondary}>
              Compare systems
            </Link>
            <Link href="/book?source=showcase_proof_final" className={styles.primary}>
              Book the build call <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
