import { BriefQueue, type BriefQueueScenario } from './BriefQueue'
import styles from './brief.module.css'

export type BriefDecoded = { phrase: string; means: string }
export type BriefRound = { name: string; focus: string }
export type BriefConfidence = 'low' | 'medium' | 'high'

export type BriefViewData = {
  company: string
  role: string | null
  confidence: BriefConfidence
  createdLabel: string | null
  decoded: readonly BriefDecoded[]
  rounds: readonly BriefRound[]
  edge: string | null
  risk: string | null
  queue: readonly BriefQueueScenario[]
}

type Props = {
  data: BriefViewData
}

const CONF_LABEL: Record<BriefConfidence, string> = {
  low: 'confidence · low',
  medium: 'confidence · medium',
  high: 'confidence · high',
}
const CONF_CLASS: Record<BriefConfidence, string> = {
  low: styles.confLow,
  medium: styles.confMedium,
  high: styles.confHigh,
}

/**
 * Renders one company brief. EVERY value comes from the stored interview_company_briefs row
 * (decoded phrases, predicted rounds, edge, risk) or from real interview_scenarios the page
 * resolved for the queue — there is NO fabricated comp, headcount, or private company data.
 * Empty sections say so honestly rather than inventing content.
 */
export function BriefView({ data }: Props) {
  const target = [data.company, data.role].filter(Boolean).join(' · ')

  return (
    <div className={styles.brief}>
      <header className={styles.head}>
        <div>
          <div className={styles.headKicker}>{target} · decoded from a JD</div>
          <h1 className={styles.headTitle}>What this loop actually measures.</h1>
        </div>
        <span className={`${styles.confBadge} ${CONF_CLASS[data.confidence]}`}>
          <span className={styles.confDot} aria-hidden />
          {CONF_LABEL[data.confidence]}
        </span>
      </header>

      <div className={styles.grid}>
        {/* LEFT — decoded phrases + predicted rounds */}
        <div className={styles.col}>
          <section className={styles.card}>
            <div className={styles.cardLabel}>Decoded from the job description</div>
            {data.decoded.length > 0 ? (
              <div className={styles.decodedList}>
                {data.decoded.map((d, i) => (
                  <div className={styles.decodedRow} key={`${i}-${d.phrase}`}>
                    <span className={styles.phrase}>{d.phrase}</span>
                    <span className={styles.means}>{d.means}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyNote}>
                No phrases were decoded from this posting.
              </p>
            )}
          </section>

          <section className={styles.card}>
            <div className={styles.roundHead}>
              <span className={styles.roundHeadLabel}>The likely loop</span>
              <span className={styles.roundHeadMeta}>{CONF_LABEL[data.confidence]}</span>
            </div>
            {data.rounds.length > 0 ? (
              <div className={styles.rounds}>
                {data.rounds.map((r, i) => (
                  <div className={styles.round} key={`${i}-${r.name}`}>
                    <span className={styles.roundNum}>R{i + 1}</span>
                    <div className={styles.roundMid}>
                      <div className={styles.roundName}>{r.name}</div>
                      {r.focus ? <div className={styles.roundFocus}>{r.focus}</div> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyNote}>The loop shape could not be predicted from this posting.</p>
            )}
          </section>
        </div>

        {/* RIGHT — edge / risk / tuned queue */}
        <div className={styles.col}>
          {data.edge ? (
            <section className={styles.edgeCard}>
              <div className={styles.edgeLabel}>Your edge, per your history</div>
              <p className={styles.cardProse}>{data.edge}</p>
            </section>
          ) : (
            <section className={styles.card}>
              <div className={styles.cardLabel}>Your edge</div>
              <p className={styles.cardProseMuted}>
                No edge yet — run a graded mock and your strongest angle for this loop appears here.
              </p>
            </section>
          )}

          {data.risk ? (
            <section className={styles.riskCard}>
              <div className={styles.riskLabel}>Your risk, per your history</div>
              <p className={styles.cardProse}>{data.risk}</p>
            </section>
          ) : (
            <section className={styles.card}>
              <div className={styles.cardLabel}>Your risk</div>
              <p className={styles.cardProseMuted}>
                No risk called out yet — it is grounded in your own readiness once you have a graded mock.
              </p>
            </section>
          )}

          <section className={styles.queueCard}>
            <div className={styles.queueLabel}>Tuned scenarios · queued for you</div>
            <BriefQueue scenarios={data.queue} />
          </section>

          <p className={styles.footer}>
            Grounded only in the JD you pasted and your own mock history — no private company data.
          </p>
        </div>
      </div>
    </div>
  )
}
