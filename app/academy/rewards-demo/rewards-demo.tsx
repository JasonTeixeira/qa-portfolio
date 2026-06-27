'use client'

import { useState } from 'react'
import { EarnMoment, type EarnKind } from '@/components/academy/rewards/EarnMoment'
import { SoundToggle } from '@/components/academy/ui/SoundToggle'
import styles from './rewards-demo.module.css'

const SAMPLES: ReadonlyArray<{ kind: EarnKind; title: string; sub: string }> = [
  { kind: 'badge', title: 'Volume Profile — Proven', sub: 'Badge · +60 XP' },
  { kind: 'level', title: 'Level 4 reached', sub: 'Artisan · +120 XP' },
  { kind: 'streak', title: '7-day streak', sub: 'Best yet · keep it alive' },
  { kind: 'cert', title: 'Market Mechanics', sub: 'Certificate issued' },
]

export function RewardsDemo() {
  const [overlayOpen, setOverlayOpen] = useState(false)

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>Micro-interaction layer</p>
        <h1 className={styles.h1}>EarnMoment</h1>
        <p className={styles.lede}>
          Content-agnostic reward reveal. Compositor-only motion, opt-in sound,
          reduced-motion safe. Inline variants below; overlay on demand.
        </p>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.trigger}
            onClick={() => setOverlayOpen(true)}
          >
            Trigger overlay reveal
          </button>
          <SoundToggle />
        </div>
      </header>

      <section className={styles.grid} aria-label="Inline earn-moment samples">
        {SAMPLES.map((s) => (
          <EarnMoment key={s.kind} kind={s.kind} title={s.title} sub={s.sub} />
        ))}
      </section>

      {overlayOpen ? (
        <EarnMoment
          kind="cert"
          title="Market Mechanics"
          sub="Certificate issued · share-ready"
          variant="overlay"
          withSound
          onDismiss={() => setOverlayOpen(false)}
        />
      ) : null}
    </main>
  )
}
