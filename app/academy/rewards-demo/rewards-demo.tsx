'use client'

import { useState } from 'react'
import { EarnMoment, type EarnKind } from '@/components/academy/rewards/EarnMoment'
import { SoundToggle } from '@/components/academy/ui/SoundToggle'
import styles from './rewards-demo.module.css'

type Sample = { kind: EarnKind; title: string; sub: string; figure?: string }

/** The four kinds, ordered low → high magnitude so the strip reads as a scale. */
const SAMPLES: ReadonlyArray<Sample> = [
  { kind: 'streak', title: '7-day streak', sub: 'Best yet · keep it alive', figure: 'Day 7' },
  { kind: 'badge', title: 'Volume Profile — Proven', sub: 'Badge earned', figure: '+60 XP' },
  { kind: 'level', title: 'Level 4 reached', sub: 'Artisan tier', figure: '+120 XP' },
  { kind: 'cert', title: 'Market Mechanics', sub: 'Certificate issued', figure: 'Certified' },
]

type Props = {
  /** When true the hero overlay is open on first paint (screenshot state). */
  heroOpenDefault?: boolean
}

export function RewardsDemo({ heroOpenDefault = false }: Props) {
  const [overlayOpen, setOverlayOpen] = useState(heroOpenDefault)

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>Micro-interaction layer</p>
        <h1 className={styles.h1}>EarnMoment</h1>
        <p className={styles.lede}>
          A reward reveal with real magnitude hierarchy — a certificate lands
          heavier than a streak tick. Compositor-only motion, opt-in sound,
          reduced-motion safe. The hero overlay is the moment; the strip below
          is the system.
        </p>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.trigger}
            onClick={() => setOverlayOpen(true)}
          >
            Replay hero reveal
          </button>
          <SoundToggle />
        </div>
      </header>

      <section className={styles.systemStrip} aria-label="Reward system — magnitude scale">
        <p className={styles.stripLabel}>The system · streak · badge · level · cert</p>
        <div className={styles.grid}>
          {SAMPLES.map((s) => (
            <EarnMoment
              key={s.kind}
              kind={s.kind}
              title={s.title}
              sub={s.sub}
              figure={s.figure}
            />
          ))}
        </div>
      </section>

      {overlayOpen ? (
        <EarnMoment
          kind="cert"
          title="Market Mechanics"
          sub="Certificate issued · share-ready"
          figure="+500 XP"
          variant="overlay"
          withSound
          onDismiss={() => setOverlayOpen(false)}
        />
      ) : null}
    </main>
  )
}
