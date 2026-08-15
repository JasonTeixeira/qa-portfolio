import type { Metadata } from 'next'
import Link from 'next/link'
import { getAggregateEfficacy } from '@/lib/academy/efficacy'
import { AcademyShell } from '@/components/academy/academy-shell'
import { GroupSubNav } from '@/components/academy/shell/GroupSubNav'
import { Icon } from '@/components/academy/ui/Icon'
import styles from './efficacy.module.css'

export const dynamic = 'force-dynamic'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sageideas.dev'

export async function generateMetadata(): Promise<Metadata> {
  const agg = await getAggregateEfficacy()
  const stat = agg.status === 'published' ? `g ${agg.meanG.toFixed(2)}` : 'measured'
  const subtitle =
    agg.status === 'published'
      ? `Average normalized learning gain g=${agg.meanG.toFixed(2)} across ${agg.n} learners.`
      : 'Pre/post measured learning gain — published once the sample is large enough.'
  const og = `${SITE}/og/academy?kind=gain&stat=${encodeURIComponent(stat)}&title=${encodeURIComponent(
    'Proven learning gain',
  )}&subtitle=${encodeURIComponent(subtitle)}`
  return {
    title: 'Does it work? — Sage Academy efficacy',
    description: subtitle,
    openGraph: { title: 'Sage Academy — measured learning gain', description: subtitle, images: [og] },
    twitter: { card: 'summary_large_image', images: [og] },
  }
}

const BAND_COPY: Record<string, string> = {
  high: 'High gain — at or above the research threshold for effective instruction (g ≥ 0.7).',
  medium: 'Medium gain (0.3 ≤ g < 0.7) — solid, measurable improvement.',
  low: 'Low gain (0 < g < 0.3).',
  negative: 'No measured gain yet.',
}

export default async function EfficacyPage() {
  const agg = await getAggregateEfficacy()

  return (
    <AcademyShell active="profile">
      <GroupSubNav group="progress" tab="efficacy" />
      <div className={styles.page}>
        <div className={styles.atmosphere} aria-hidden="true" />
      <header className={styles.head}>
        <p className={styles.kicker}>Does it actually work?</p>
        <h1 className={styles.title}>Measured learning gain.</h1>
        <p className={styles.sub}>
          We measure every learner before and after a course and report Hake&rsquo;s normalized gain{' '}
          <em>g = (post − pre) / (100 − pre)</em> — the gold-standard efficacy metric. No vanity numbers.
        </p>
      </header>

      {agg.status === 'published' ? (
        <div className={styles.result}>
          <div className={styles.bigStat}>
            <span className={styles.gLabel}>average g</span>
            <span className={styles.gValue} data-band={agg.band}>
              {agg.meanG.toFixed(2)}
            </span>
            <span className={styles.gBand}>{BAND_COPY[agg.band]}</span>
          </div>
          <dl className={styles.breakdown}>
            <div>
              <dt>{agg.avgPre}</dt>
              <dd>Avg pre-test</dd>
            </div>
            <div>
              <dt>{agg.avgPost}</dt>
              <dd>Avg post-test</dd>
            </div>
            <div>
              <dt>{agg.n}</dt>
              <dd>Learners measured</dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className={styles.collecting}>
          <span className={styles.collectGlyph} aria-hidden="true">
            <Icon name="circle" size={28} />
          </span>
          <h2 className={styles.collectTitle}>Still collecting data.</h2>
          <p className={styles.collectBody}>
            We publish the aggregate only once at least <strong>{agg.needed}</strong> learners have completed both a
            pre- and post-assessment — so the number means something. Currently <strong>{agg.n}</strong> measured.
            This is the honest state, not a placeholder.
          </p>
        </div>
      )}

      <section className={styles.method}>
        <h2 className={styles.h2}>How we measure</h2>
        <ol className={styles.steps}>
          <li>A short pre-test at the start of each course captures your baseline.</li>
          <li>You learn, build, and ship the course&rsquo;s real project.</li>
          <li>A post-test measures what you can now do.</li>
          <li>
            We compute <em>g</em> per learner and publish the aggregate — never an individual&rsquo;s raw scores.
          </li>
        </ol>
        <Link href="/academy" className={styles.cta}>
          Start a course <Icon name="arrow-right" size={15} aria-hidden="true" />
        </Link>
      </section>
      </div>
    </AcademyShell>
  )
}
