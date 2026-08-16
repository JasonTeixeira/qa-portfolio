import Link from 'next/link'
import { TRACKS, CATEGORIES } from '@/lib/academy/taxonomy'
import { TOPICS, type TopicKey } from '@/lib/academy/topics'
import { ACADEMY_PLANS } from '@/lib/academy/plans'
import { Icon } from '@/components/academy/ui/Icon'
import { SageDiagram, type SageDiagramNode, type SageDiagramEdge } from '@/components/academy/visuals/SageDiagram'
import { SageCompare } from '@/components/academy/visuals/SageCompare'
import { LoopMap } from '@/components/academy/diagrams/LoopMap'
import { getAcademyStats, type AcademyCourseCard } from './stats'
import styles from './landing.module.css'

/**
 * Sage Academy marketing Home — the flagship landing page.
 *
 * HONESTY CONTRACT: every number on this page is real. Course/lesson counts are
 * computed live from Supabase (getAcademyStats); the catalog grid renders real
 * published courses. No fabricated learner counts, no proof tickers, no invented
 * testimonials, no invented course names.
 */

// --- Static content (marketing copy, not data) --------------------------------

const LOOP_STEPS: { name: string; desc: string; dot: string }[] = [
  { name: 'Frame', desc: 'turn a messy stake into a question', dot: 'var(--ac-accent)' },
  { name: 'Route', desc: 'pick the diagnosis path', dot: 'var(--ac-accent)' },
  { name: 'Map', desc: 'draw the system you can defend', dot: 'var(--ac-accent)' },
  { name: 'Decide', desc: 'commit under tradeoffs', dot: 'var(--ac-accent)' },
  { name: 'Prove', desc: 'no vibes — a passing check', dot: 'var(--ac-mastery)' },
  { name: 'Review', desc: 'a skeptic reads your work', dot: 'var(--ac-mastery)' },
  { name: 'Repair', desc: 'fix the real failure', dot: 'var(--ac-gold)' },
  { name: 'Space', desc: 'recall at 1 / 3 / 7 / 30 days', dot: 'var(--ac-accent)' },
  { name: 'Transfer', desc: 'apply it somewhere real', dot: 'var(--ac-accent)' },
  { name: 'Package', desc: 'ship the evidence', dot: 'var(--ac-mastery)' },
]

type ArcTone = 'muted' | 'accent' | 'green'
const LESSON_ARC: { num: string; name: string; desc: string; tone: ArcTone }[] = [
  { num: '01', name: 'Sprint contract', desc: 'the outcome, the proof, what NOT to claim', tone: 'muted' },
  { num: '04', name: 'Pretest', desc: 'a productive failure → the “oh!” reveal', tone: 'muted' },
  { num: '05', name: 'Concept', desc: 'ONE mental model, ≤40 words, paired visual', tone: 'muted' },
  { num: '06', name: 'Diagram', desc: 'the system, suspect edge lit', tone: 'accent' },
  { num: '07', name: 'Code walkthrough', desc: 'real code, stepped and annotated', tone: 'accent' },
  { num: '08', name: 'Compare', desc: 'weak vs gold, side by side', tone: 'accent' },
  { num: '11', name: 'Verification', desc: '“prove it — no vibes”: confirmable items', tone: 'green' },
  { num: '12', name: 'Teachback', desc: 'say it back in your own words', tone: 'muted' },
  { num: '14', name: 'Spaced review', desc: 'seeds the 1 / 3 / 7 / 30-day recall', tone: 'muted' },
]

// --- Hero system map (SageDiagram spec: layout-free, meaning only) -------------

const HERO_NODES: SageDiagramNode[] = [
  { id: 'client', label: 'Client', kind: 'client' },
  { id: 'checkout', label: 'Checkout', kind: 'service', tone: 'accent', description: 'suspect' },
  { id: 'retry', label: 'retry?', kind: 'decision', tone: 'accent' },
  { id: 'worker', label: 'Worker', kind: 'process' },
  { id: 'stripe', label: 'Stripe', kind: 'external' },
  { id: 'ledger', label: 'Ledger', kind: 'store', tone: 'success', description: 'source of truth' },
]

const HERO_EDGES: SageDiagramEdge[] = [
  { from: 'client', to: 'checkout', kind: 'sync' },
  { from: 'checkout', to: 'retry', kind: 'control', tone: 'accent', label: 'retry?' },
  { from: 'checkout', to: 'worker', kind: 'async' },
  { from: 'retry', to: 'stripe', kind: 'sync', tone: 'accent', label: 'charge x2?' },
  { from: 'worker', to: 'ledger', kind: 'data', tone: 'success' },
  { from: 'stripe', to: 'ledger', kind: 'data' },
]

// --- Catalog: group real published courses into their taxonomy topics ----------

function trackNameForTopic(topicKey: TopicKey): string {
  // Prefer a real track name from the taxonomy when the topic maps cleanly.
  const track = TRACKS.find((t) => t.topic === topicKey)
  return track?.name ?? TOPICS[topicKey].label
}

function CatalogCard({ course }: { course: AcademyCourseCard }) {
  const tone = TOPICS[course.topic]
  return (
    <Link href="/academy/catalog" className={styles.courseCard} style={{ ['--tint' as string]: tone.color }}>
      <div className={styles.courseCardHead}>
        <span className={styles.courseTrack}>{tone.label}</span>
        <span className={styles.courseLive}>
          <Icon name="check" size={11} /> live
        </span>
      </div>
      <b className={styles.courseName}>{course.title}</b>
      {course.subtitle ? <p className={styles.courseOutcome}>{course.subtitle}</p> : null}
      <div className={styles.courseMeta}>
        <span>{course.lessons} lessons</span>
        <span className={styles.courseLevel}>{course.level}</span>
      </div>
    </Link>
  )
}

export async function AcademyLanding() {
  const monthly = ACADEMY_PLANS.monthly
  const yearly = ACADEMY_PLANS.yearly
  const { coursesCount, lessonsCount, courses } = await getAcademyStats()
  const catalogCards = courses.slice(0, 6)
  const liveTrackCount = TRACKS.filter((t) => t.status === 'live').length

  return (
    <main className={styles.root}>
      {/* ============ HERO ============ */}
      <header className={styles.hero} aria-labelledby="academy-hero-title">
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Engineering judgment · proven, not claimed</p>
            <h1 id="academy-hero-title" className={styles.heroTitle}>
              Learn to think like a senior engineer — and <em>prove</em> it.
            </h1>
            <p className={styles.heroSub}>
              {coursesCount} courses that end in evidence a reviewer trusts — not a
              certificate of completion.
            </p>
            <div className={styles.heroActions}>
              <Link href="/academy/signup" className={styles.primary}>
                <span>Start with Engineering Judgment</span>
                <i aria-hidden="true">
                  <Icon name="arrow-right" size={14} />
                </i>
              </Link>
              <Link href="/academy/catalog" className={styles.secondary}>
                See a real lesson
              </Link>
            </div>
            <div className={styles.statsRow} aria-label="Academy scale">
              <div>
                <b>{coursesCount}</b>
                <span>courses</span>
              </div>
              <div>
                <b>{lessonsCount}</b>
                <span>lessons</span>
              </div>
            </div>
          </div>

          <figure className={styles.heroVisual}>
            <SageDiagram
              title="Where can a charge be issued twice?"
              subtitle="A retry path can double-charge unless the write to the ledger is idempotent."
              nodes={HERO_NODES}
              edges={HERO_EDGES}
              rankdir="LR"
              caption="Every lesson makes the failure a location."
            />
          </figure>
        </div>
      </header>

      {/* ============ WEDGE ============ */}
      <section className={styles.band} aria-labelledby="wedge-title">
        <div className={styles.container}>
          <div className={styles.wedgeGrid}>
            <div>
              <h2 id="wedge-title" className={styles.sectionTitle}>
                Tutorials teach syntax. Nobody teaches judgment.
              </h2>
              <p className={styles.sectionBody}>
                We do — and we make you prove it. The difference between a pile of
                tutorials and a senior engineer is a map you can defend the edges of.
              </p>
            </div>
            <SageCompare
              title="A bag of boxes vs a decision map"
              subtitle="Same incident, two ways to reason about it."
              left={{
                label: 'Weak · a bag of boxes',
                tone: 'warning',
                lines: [
                  'API, DB, Queue?, …stuff',
                  'Confident guesses in a war room',
                  'Edges nobody can defend',
                ],
                verdict: 'the failure has no location',
              }}
              right={{
                label: 'Gold · a decision map',
                tone: 'success',
                lines: [
                  'checkout → retry path → ledger',
                  'The failure is a location',
                  'The omissions are defended',
                ],
                verdict: 'idempotent write, defended',
              }}
            />
          </div>
        </div>
      </section>

      {/* ============ THE LOOP ============ */}
      <section className={styles.section} aria-labelledby="loop-title">
        <div className={styles.container}>
          <div className={styles.sectionLead}>
            <p className={styles.kicker}>The Sage Learning OS</p>
            <h2 id="loop-title" className={styles.sectionTitle}>
              Every course is an instance of the loop senior engineers run on autopilot.
            </h2>
          </div>
          <div style={{ margin: '0 0 28px' }}>
            <LoopMap />
          </div>
          <ol className={styles.loopGrid}>
            {LOOP_STEPS.map((step, i) => (
              <li className={styles.loopCard} key={step.name}>
                <div className={styles.loopCardHead}>
                  <span className={styles.loopNum}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.loopDot} style={{ background: step.dot }} />
                </div>
                <b className={styles.loopName}>{step.name}</b>
                <span className={styles.loopDesc}>{step.desc}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ LESSON ANATOMY ============ */}
      <section className={styles.band} aria-labelledby="lesson-title">
        <div className={styles.container}>
          <div className={styles.sectionLead}>
            <p className={styles.kicker}>Anatomy of a lesson</p>
            <h2 id="lesson-title" className={styles.sectionTitle}>
              Visual-first. Real labs. Proof, not vibes.
            </h2>
            <p className={styles.sectionBody}>
              Every lesson is a deliberate 14-block arc: a contract, a stake, one
              mental model, three hero visuals, a lab that starts failing, and a
              verification you can’t hand-wave.
            </p>
          </div>
          <div className={styles.lessonGrid}>
            <div className={styles.arcCard}>
              <div className={styles.arcHead}>The 14-block arc</div>
              <div className={styles.arcRows}>
                {LESSON_ARC.map((row) => (
                  <div className={styles.arcRow} data-tone={row.tone} key={row.num}>
                    <span className={styles.arcNum}>{row.num}</span>
                    <span className={styles.arcName}>{row.name}</span>
                    <span className={styles.arcDesc}>{row.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.labCard}>
              <div className={styles.labHead}>
                <span>In-browser lab · Python</span>
                <span className={styles.labWarn}>starter fails — on purpose</span>
              </div>
              <pre className={styles.labCode}>
                <code>
                  <span>def retry_charge(order, attempts=3):</span>
                  <span>{'    for i in range(attempts):'}</span>
                  <span className={styles.labFail}>{'        charge(order)  # no idempotency key'}</span>
                  <span className={styles.labComment}># FAIL: 3 charges issued for 1 order</span>
                </code>
              </pre>
              <div className={styles.labResult}>
                <span className={styles.labResultText}>
                  <Icon name="x" size={12} /> check failed · 1 expected, 3 found
                </span>
              </div>
              <p className={styles.labNote}>
                Fix it for real and the check passes — a guaranteed win in every lesson.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CATALOG ============ */}
      <section className={styles.section} aria-labelledby="catalog-title">
        <div className={styles.container}>
          <div className={styles.catalogHead}>
            <div className={styles.sectionLead}>
              <p className={styles.kicker}>The catalog</p>
              <h2 id="catalog-title" className={styles.sectionTitle}>
                {coursesCount} courses live, built on one engine.
              </h2>
            </div>
            <Link href="/academy/catalog" className={styles.catalogLink}>
              Full catalog → {coursesCount} courses · {lessonsCount} lessons
            </Link>
          </div>
          <div className={styles.courseGrid}>
            {catalogCards.map((course) => (
              <CatalogCard course={course} key={course.slug} />
            ))}
          </div>
          <Link href="/academy/catalog" className={styles.catalogMore}>
            <span>
              <b>+{Math.max(0, coursesCount - catalogCards.length)} more courses</b> across{' '}
              {CATEGORIES.filter((c) => c.status === 'live').length} live{' '}
              {CATEGORIES.filter((c) => c.status === 'live').length === 1 ? 'domain' : 'domains'} —
              same engine, same proof standard.
            </span>
            <i aria-hidden="true">
              <Icon name="arrow-right" size={13} />
            </i>
          </Link>
        </div>
      </section>

      {/* ============ PROOF / EVIDENCE LEDGER ============ */}
      <section className={styles.band} aria-labelledby="proof-title">
        <div className={styles.container}>
          <div className={styles.proofGrid}>
            <div>
              <p className={styles.kicker}>The evidence ledger</p>
              <h2 id="proof-title" className={styles.sectionTitle}>
                You leave with a portfolio, not a receipt.
              </h2>
              <p className={styles.sectionBody}>
                Decision memos and passing proofs — pick any claim, follow the artifact,
                see for yourself. Certificates are auto-issued on genuine completion,
                verifiable by code.
              </p>
            </div>
            <div className={styles.ledgerCard}>
              <div className={styles.ledgerHead}>
                <span>Claim</span>
                <span>Artifact</span>
                <span>Verdict</span>
              </div>
              <div className={styles.ledgerRow}>
                <span className={styles.ledgerClaim}>Can repair a duplicate-charge bug</span>
                <span className={styles.ledgerArtifact}>decision-memo.md</span>
                <span className={styles.verdictPass}>PASSED</span>
              </div>
              <div className={styles.ledgerRow}>
                <span className={styles.ledgerClaim}>Can design an idempotent API</span>
                <span className={styles.ledgerArtifact}>api-proof.test.ts</span>
                <span className={styles.verdictPass}>PASSED</span>
              </div>
              <div className={styles.ledgerRow}>
                <span className={styles.ledgerClaim}>Can defend a schema under review</span>
                <span className={styles.ledgerArtifact}>schema-review.pdf</span>
                <span className={styles.verdictReview}>IN REVIEW</span>
              </div>
              <div className={styles.ledgerFoot}>
                <span>certificates verifiable by code</span>
                <Link href="/verify" className={styles.ledgerVerify}>
                  verify a certificate →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ RETENTION + HONEST SCORING ============ */}
      <section className={styles.section} aria-label="Retention and honest scoring">
        <div className={styles.container}>
          <div className={styles.dualGrid}>
            <div className={styles.capCard}>
              <div className={styles.miniKicker}>Honest scoring</div>
              <h3 className={styles.miniTitle}>Your score is capped by your weakest proof.</h3>
              <p className={styles.miniBody}>
                Because that’s how a reviewer reads it. We show you the one repair that
                lifts it.
              </p>
              <div className={styles.capMeter}>
                <div className={styles.capMeterLabel}>
                  <span>MASTERY</span>
                  <span>
                    capped by <b>PROOF</b>
                  </span>
                </div>
                <div className={styles.capTrack}>
                  <div className={styles.capFill} />
                  <div className={styles.capCeiling} />
                  <div className={styles.capHatch} />
                </div>
                <div className={styles.capFootRow}>
                  <span>ceiling until the proof passes</span>
                  <span className={styles.capRepair}>the one repair lifts it</span>
                </div>
              </div>
            </div>
            <div className={styles.retCard}>
              <div className={styles.miniKicker}>Spaced recall · 1 / 3 / 7 / 30 days</div>
              <h3 className={styles.miniTitle}>
                It holds under pressure — not just until the quiz.
              </h3>
              <svg className={styles.retChart} viewBox="0 0 440 130" role="img" aria-label="Retention with spaced recall stays high while cramming decays.">
                <line x1="30" y1="8" x2="30" y2="110" stroke="var(--ac-line-2)" strokeWidth="1" />
                <line x1="30" y1="110" x2="430" y2="110" stroke="var(--ac-line-2)" strokeWidth="1" />
                <polyline
                  points="30,22 90,62 150,84 230,96 320,103 430,107"
                  fill="none"
                  stroke="var(--ac-faint)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <polyline
                  points="30,22 74,44 90,28 134,48 154,31 214,50 244,34 334,52 430,38"
                  fill="none"
                  stroke="var(--ac-accent)"
                  strokeWidth="2.5"
                />
                {['90,28', '154,31', '244,34', '430,38'].map((pt) => {
                  const [cx, cy] = pt.split(',')
                  return (
                    <circle key={pt} cx={cx} cy={cy} r="3.5" fill="var(--ac-bg)" stroke="var(--ac-accent)" strokeWidth="2" />
                  )
                })}
              </svg>
              <div className={styles.retLegend}>
                <span>
                  <b className={styles.retSolid}>—</b> with recall
                </span>
                <span>
                  <b className={styles.retDash}>--</b> cram once
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BAND (house rule) ============ */}
      <section className={styles.ruleBand}>
        <div className={styles.container}>
          <div className={styles.ruleBandInner}>
            <div className={styles.ruleWatermark} aria-hidden="true">
              94
            </div>
            <p className={styles.kicker}>The house rule</p>
            <p className={styles.ruleBig}>
              Prove it — <span>no vibes.</span>
            </p>
            <p className={styles.ruleNote}>
              Every claim on this page follows its own rule.{' '}
              <Link href="/academy/proof-not-paper">Read the manifesto →</Link>
            </p>
          </div>
        </div>
      </section>

      {/* ============ OFFER ============ */}
      <section id="offer" className={styles.offer}>
        <div className={styles.offerInner}>
          <p className={styles.kicker}>All-access membership</p>
          <h2 className={styles.offerTitle}>
            One membership. Every course. A portfolio at the end.
          </h2>
          <p className={styles.offerSub}>
            All {coursesCount} courses as they ship, every lab and proof, spaced recall,
            leagues, and verifiable certificates.
          </p>

          <div className={styles.priceRow}>
            <div className={styles.priceCard}>
              <span className={styles.priceLabel}>Monthly</span>
              <strong className={styles.priceValue}>
                {monthly.price}
                <span>{monthly.cadence}</span>
              </strong>
            </div>
            <div className={styles.priceCard} data-featured="true">
              {yearly.badge ? <span className={styles.priceBadge}>{yearly.badge}</span> : null}
              <span className={styles.priceLabel}>Yearly</span>
              <strong className={styles.priceValue}>
                {yearly.price}
                <span>{yearly.cadence}</span>
              </strong>
              {yearly.note ? <span className={styles.priceNote}>{yearly.note}</span> : null}
            </div>
            {/* One money story: membership + the Interview Mastery add-on,
                side by side, so pricing never contradicts /interview. */}
            <Link
              href="/interview"
              className={styles.priceCard}
              style={{ borderColor: 'rgba(224, 169, 62, 0.45)', textDecoration: 'none', color: 'inherit' }}
            >
              <span className={styles.priceLabel} style={{ color: '#E0A93E' }}>
                Interview Mastery · add-on
              </span>
              <strong className={styles.priceValue}>
                +$39<span>/month</span>
              </strong>
              <span className={styles.priceNote}>
                $24/mo billed yearly · loop-ready guarantee →
              </span>
            </Link>
          </div>

          <div className={styles.offerActions}>
            <Link href="/academy/signup" className={styles.primary}>
              <span>Start Sage Academy</span>
              <i aria-hidden="true">
                <Icon name="arrow-right" size={14} />
              </i>
            </Link>
          </div>
          <p className={styles.offerNote}>cancel anytime</p>
        </div>
      </section>

      {/* scale strip — real, taxonomy-derived counts only */}
      <div className={styles.scaleStrip} aria-label="Academy scale">
        <span>{coursesCount} courses</span>
        <span>{lessonsCount} lessons</span>
        <span>{liveTrackCount} live {liveTrackCount === 1 ? 'track' : 'tracks'}</span>
        <span>one engine · one proof standard</span>
      </div>
    </main>
  )
}
