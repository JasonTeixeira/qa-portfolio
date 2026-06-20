'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { TrackedLink } from '@/components/analytics/tracked-link'
import styles from './LivingSystemsHome.module.css'

/**
 * Sticky mobile conversion bar. Portaled to <body> because the page's <main>
 * carries a transform, which would otherwise trap position:fixed inside that
 * containing block instead of pinning it to the viewport.
 */
export function MobileCtaBar() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return createPortal(
    <div className={styles.mobileCta}>
      <span className={styles.mobileCtaText}>Ship it with one senior operator</span>
      <TrackedLink
        className={styles.mobileCtaBtn}
        href="/book?source=home_sticky"
        event="booking_click"
        eventProps={{ location: 'home_sticky_mobile', label: 'book_a_call' }}
      >
        Book a call →
      </TrackedLink>
    </div>,
    document.body,
  )
}
