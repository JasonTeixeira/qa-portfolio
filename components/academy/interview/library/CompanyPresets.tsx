import styles from './library.module.css'
import { RunLoopButton } from '@/components/academy/interview/loop/RunLoopButton'

export type CompanyPreset = {
  slug: string
  name: string
  description: string
  roundCount: number
  simMinutes: number
}

type Props = {
  presets: readonly CompanyPreset[]
}

function simLabel(minutes: number): string {
  if (minutes <= 0) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h && m) return `${h}h ${m}m sim`
  if (h) return `${h}h sim`
  return `${m}m sim`
}

/**
 * The real interview_company_presets — four seeded loops with their real round counts and sim
 * length. The "run this loop" affordance (RunLoopButton) creates a real loop from the preset and
 * routes to the loop-simulation runner at /academy/interview/loop/<id>.
 */
export function CompanyPresets({ presets }: Props) {
  if (presets.length === 0) return null

  return (
    <div className={styles.presetsBlock}>
      <div className={styles.presetsKicker}>
        Round presets · tuned to how different companies actually run the loop
      </div>
      <div className={styles.presets}>
        {presets.map((p) => (
          <div key={p.slug} className={styles.preset}>
            <div className={styles.presetName}>{p.name}</div>
            <div className={styles.presetDesc}>{p.description}</div>
            <div className={styles.presetMeta}>
              {p.roundCount} round{p.roundCount === 1 ? '' : 's'}
              {simLabel(p.simMinutes) ? ` · ${simLabel(p.simMinutes)}` : ''}
            </div>
            <RunLoopButton slug={p.slug} />
          </div>
        ))}
      </div>
    </div>
  )
}
