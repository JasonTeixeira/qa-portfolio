import Image from 'next/image'
import Link from 'next/link'
import styles from './HeroFirstHome.module.css'

const RECEIPTS = [
  ['11', 'Products in production'],
  ['100%', 'Verifiable before you sign'],
  ['0', 'Surprise change orders'],
  ['2020', 'Shipping since'],
] as const

/**
 * Hero-first homepage prototype. No splash, no blocking gate — the value prop
 * lands in the first frame; the inkwash imagery becomes ambient hero depth
 * instead of an interstitial; the hire/learn choice is a premium section, not a
 * wall. Server-rendered + CSS-only motion → zero FOUC, fast, conversion-first.
 */
export function HeroFirstHome() {
  return (
    <div className={styles.root}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true">
          <Image src="/art/inkwash-cliffs.avif" alt="" fill priority sizes="100vw" className={styles.heroImg} />
          <div className={styles.heroVeil} />
        </div>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>◆ Solo AI-native studio · since 2020</span>
          <h1 className={styles.heroTitle}>
            I build the product,<br />the brand, and the <em>AI</em><br />that runs it.
          </h1>
          <p className={styles.heroSub}>
            No handoff, no telephone game — the person who pitches you is the person who
            <strong> writes the code</strong>. I run my own products in production every day and put the
            same system to work for yours.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/book?source=home_v2" className={styles.primary}>Book a call <span aria-hidden="true">→</span></Link>
            <Link href="/work" className={styles.secondary}>See the work</Link>
          </div>
          <dl className={styles.receipts}>
            {RECEIPTS.map(([v, l]) => (
              <div key={l} className={styles.receipt}>
                <dt>{v}</dt>
                <dd>{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <span className={styles.scrollHint} aria-hidden="true">scroll ↓</span>
      </section>

      {/* TWO DOORS — the choice, after the value prop earns it */}
      <section className={styles.doors}>
        <div className={styles.sectionHead}>
          <span className={styles.kicker}>Two ways through Sage Ideas</span>
          <h2 className={styles.h2}>Hire the studio, or learn the system.</h2>
          <p className={styles.sectionSub}>Same operator, same standard. Pick the door that fits — you can switch any time.</p>
        </div>
        <div className={styles.doorGrid}>
          <Link href="/services" className={`${styles.door} ${styles.doorHire}`}>
            <span className={styles.doorNo}>01</span>
            <span className={styles.doorArrow} aria-hidden="true">→</span>
            <h3 className={styles.doorTitle}>I&rsquo;m here to hire</h3>
            <p className={styles.doorBody}>Build my product, brand &amp; AI — done for me, fixed scope, fixed price.</p>
            <span className={styles.doorCta}>See services</span>
          </Link>
          <Link href="/academy" className={`${styles.door} ${styles.doorLearn}`}>
            <span className={styles.doorNo}>02</span>
            <span className={styles.doorArrow} aria-hidden="true">→</span>
            <h3 className={styles.doorTitle}>I&rsquo;m here to learn</h3>
            <p className={styles.doorBody}>Master the system myself — project-based academy with a learning engine that won&rsquo;t let me fake it.</p>
            <span className={styles.doorCta}>Enter the academy</span>
          </Link>
        </div>
      </section>

      {/* TRUST — verifiability as the differentiator */}
      <section className={styles.trust}>
        <div className={styles.trustInner}>
          <span className={styles.kicker}>Before you sign</span>
          <h2 className={styles.h2}>Verify everything. Then call a reference.</h2>
          <p className={styles.trustBody}>
            Every number above is openable on GitHub — a five-year public build record you can read commit
            by commit. And before you commit a dollar, you can get a real collaborator on the phone to
            verify exactly how I work. No invented testimonials. No fake screenshots. Just proof you can
            check yourself.
          </p>
          <div className={styles.trustChips}>
            <span>⬡ Direct line — no account managers</span>
            <span>◇ NDA · MSA · SOW on request</span>
            <span>✓ Openable proof, every line</span>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={styles.finalCta}>
        <div className={styles.finalInner}>
          <h2 className={styles.finalTitle}>Bring me the hard one.</h2>
          <p className={styles.finalSub}>The build everyone else scoped around. Let&rsquo;s talk through it — 30 minutes, no sales pitch.</p>
          <Link href="/book?source=home_v2_final" className={styles.primary}>Book a call <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </div>
  )
}
