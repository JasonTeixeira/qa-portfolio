'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { trackEvent } from '@/lib/analytics/events'
import styles from './studio-academy-switch.module.css'

/**
 * Studio ⇄ Academy mode switch — the connective tissue of the two-landing split.
 * Route-aware: highlights Studio on the studio site, Academy on /academy or /learn.
 */
export function StudioAcademySwitch({ variant = 'nav' }: { variant?: 'nav' | 'full' }) {
  const pathname = usePathname() || '/'
  const onAcademy = pathname.startsWith('/academy') || pathname.startsWith('/learn')

  return (
    <div
      className={`${styles.root} ${variant === 'full' ? styles.full : ''}`}
      data-active={onAcademy ? 'academy' : 'studio'}
      role="tablist"
      aria-label="Switch between Studio and Academy"
    >
      <span className={styles.indicator} aria-hidden="true" />
      <Link
        href="/"
        className={styles.seg}
        data-on={!onAcademy}
        role="tab"
        aria-selected={!onAcademy}
        onClick={() => trackEvent('cta_click', { location: 'nav_switch', label: 'Studio', href: '/' })}
      >
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.label}>Studio</span>
        {variant === 'full' && <span className={styles.desc}>build for me</span>}
      </Link>
      <Link
        href="/academy"
        className={styles.seg}
        data-on={onAcademy}
        role="tab"
        aria-selected={onAcademy}
        onClick={() => trackEvent('cta_click', { location: 'nav_switch', label: 'Academy', href: '/academy' })}
      >
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.label}>Academy</span>
        {variant === 'full' && <span className={styles.desc}>learn to build</span>}
      </Link>
    </div>
  )
}
