'use client'

import { useSound } from '@/hooks/useSound'
import styles from './sound-toggle.module.css'

/**
 * Small, unobtrusive mute/unmute control for the academy's opt-in UI sounds.
 * Sound is OFF by default; this is the only way a learner turns it on. When
 * enabled, a soft confirmation tone plays so the choice is audible.
 *
 * a11y: a real <button> with aria-pressed reflecting the enabled state and a
 * descriptive aria-label. The glyph is decorative (aria-hidden); the visible
 * label carries the meaning.
 */
export function SoundToggle({ className = '' }: { className?: string }) {
  const { enabled, toggle, play } = useSound()

  const onClick = () => {
    const next = !enabled
    toggle()
    // Play the confirmation AFTER enabling so it's audible (play() reads the
    // freshly-written preference synchronously).
    if (next) play('tick')
  }

  return (
    <button
      type="button"
      className={`${styles.toggle} ${className}`}
      onClick={onClick}
      aria-pressed={enabled}
      aria-label={enabled ? 'Mute interface sounds' : 'Enable interface sounds'}
    >
      <span className={styles.glyph} aria-hidden="true">
        {enabled ? '♪' : '○'}
      </span>
      <span className={styles.label}>{enabled ? 'Sound on' : 'Sound off'}</span>
    </button>
  )
}
