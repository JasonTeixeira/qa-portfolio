import type { Metadata } from 'next'
import Link from 'next/link'
import { getAggregateEfficacy } from '@/lib/academy/efficacy'
import { AcademyShell } from '@/components/academy/academy-shell'
import { GroupSubNav } from '@/components/academy/shell/GroupSubNav'
import { Icon } from '@/components/academy/ui/Icon'
import styles from './efficacy.module.css'
import { getT } from '@/lib/i18n/t'
import { getLocale } from '@/lib/i18n/server'
import { localizedAlternates } from '@/lib/i18n/alternates'

export const dynamic = 'force-dynamic'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sageideas.dev'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  const locale = await getLocale()
  const agg = await getAggregateEfficacy()
  const stat = agg.status === 'published' ? `g ${agg.meanG.toFixed(2)}` : t('measured')
  const subtitle =
    agg.status === 'published'
      ? t('Average normalized learning gain g={g} across {n} learners.')
          .replace('{g}', agg.meanG.toFixed(2))
          .replace('{n}', String(agg.n))
      : t('Pre/post measured learning gain — published once the sample is large enough.')
  const og = `${SITE}/og/academy?kind=gain&stat=${encodeURIComponent(stat)}&title=${encodeURIComponent(
    t('Proven learning gain'),
  )}&subtitle=${encodeURIComponent(subtitle)}`
  return {
    title: t('Does it work? — Sage Academy efficacy'),
    description: subtitle,
    alternates: localizedAlternates('/academy/efficacy', locale),
    openGraph: {
      title: t('Sage Academy — measured learning gain'),
      description: subtitle,
      images: [og],
    },
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
  const t = await getT()
  const agg = await getAggregateEfficacy()

  return (
    <AcademyShell active="profile">
      <GroupSubNav group="progress" tab="efficacy" />
      <div className={styles.page}>
        <div className={styles.atmosphere} aria-hidden="true" />
      <header className={styles.head}>
        <p className={styles.kicker}>{t('Does it actually work?')}</p>
        <h1 className={styles.title}>{t('Measured learning gain.')}</h1>
        <p className={styles.sub}>
          {t('We measure every learner before and after a course and report Hake’s normalized gain')}{' '}
          <em>g = (post − pre) / (100 − pre)</em>{' '}
          {t('— the gold-standard efficacy metric. No vanity numbers.')}
        </p>
      </header>

      {agg.status === 'published' ? (
        <div className={styles.result}>
          <div className={styles.bigStat}>
            <span className={styles.gLabel}>{t('average g')}</span>
            <span className={styles.gValue} data-band={agg.band}>
              {agg.meanG.toFixed(2)}
            </span>
            <span className={styles.gBand}>{t(BAND_COPY[agg.band])}</span>
          </div>
          <dl className={styles.breakdown}>
            <div>
              <dt>{agg.avgPre}</dt>
              <dd>{t('Avg pre-test')}</dd>
            </div>
            <div>
              <dt>{agg.avgPost}</dt>
              <dd>{t('Avg post-test')}</dd>
            </div>
            <div>
              <dt>{agg.n}</dt>
              <dd>{t('Learners measured')}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className={styles.collecting}>
          <span className={styles.collectGlyph} aria-hidden="true">
            <Icon name="circle" size={28} />
          </span>
          <h2 className={styles.collectTitle}>{t('Still collecting data.')}</h2>
          <p className={styles.collectBody}>
            {t('We publish the aggregate only once at least')} <strong>{agg.needed}</strong>{' '}
            {t(
              'learners have completed both a pre- and post-assessment — so the number means something. Currently'
            )}{' '}
            <strong>{agg.n}</strong> {t('measured. This is the honest state, not a placeholder.')}
          </p>
        </div>
      )}

      <section className={styles.method}>
        <h2 className={styles.h2}>{t('How we measure')}</h2>
        <ol className={styles.steps}>
          <li>{t('A short pre-test at the start of each course captures your baseline.')}</li>
          <li>{t('You learn, build, and ship the course’s real project.')}</li>
          <li>{t('A post-test measures what you can now do.')}</li>
          <li>
            {t('We compute')} <em>g</em>{' '}
            {t('per learner and publish the aggregate — never an individual’s raw scores.')}
          </li>
        </ol>
        <Link href="/academy" className={styles.cta}>
          {t('Start a course')} <Icon name="arrow-right" size={15} aria-hidden="true" />
        </Link>
      </section>
      </div>
    </AcademyShell>
  )
}
