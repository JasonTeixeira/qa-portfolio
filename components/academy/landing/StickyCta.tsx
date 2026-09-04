'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useT } from '@/components/i18n/locale-provider'

/**
 * A slim conversion bar that slides up once the visitor scrolls past the hero
 * and hasn't reached the final offer. Dismissable; stays dismissed for the
 * session. Passive scroll listener, reduced-motion friendly.
 */

const INK = '#F2EFE9'
const ACCENT = '#3D5AFE'
const mono = { fontFamily: 'var(--font-mono), monospace' } as const

export function StickyCta() {
  const t = useT()
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (dismissed) return
    const onScroll = () => {
      const y = window.scrollY
      const nearBottom = window.innerHeight + y > document.body.scrollHeight - 900
      setShow(y > 900 && !nearBottom)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [dismissed])

  if (dismissed || !show) return null

  return (
    <div
      role="region"
      data-sticky-cta
      aria-label={t('Start learning')}
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 'clamp(12px, 3vw, 24px)',
        transform: 'translateX(-50%)',
        zIndex: 70,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        maxWidth: 'calc(100vw - 24px)',
        padding: '11px 12px 11px 22px',
        border: '1px solid rgba(61,90,254,0.4)',
        borderRadius: 999,
        background: 'rgba(17,17,21,0.92)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 20px 60px -24px rgba(0,0,0,0.85), 0 0 40px -26px rgba(61,90,254,0.6)',
        animation: 'sageStickyIn 0.34s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <style>{`@keyframes sageStickyIn{from{opacity:0;transform:translate(-50%,16px)}to{opacity:1;transform:translate(-50%,0)}}@media (prefers-reduced-motion: reduce){[data-sticky-cta]{animation:none!important}}`}</style>
      <span style={{ fontSize: 13.5, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {t('Learn by building —')} <span style={{ color: '#9598A2' }}>{t('proof, not paper.')}</span>
      </span>
      <Link
        href="/academy/signup"
        style={{ display: 'inline-flex', alignItems: 'center', background: ACCENT, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 999, whiteSpace: 'nowrap' }}
      >
        {t('Start free')}
      </Link>
      <Link href="/academy/concepts" style={{ ...mono, fontSize: 11, color: '#8FA0FF', textDecoration: 'none', whiteSpace: 'nowrap' }}>
        {t('read a lesson')} →
      </Link>
      <button
        type="button"
        aria-label={t('Dismiss')}
        onClick={() => setDismissed(true)}
        style={{ background: 'transparent', border: 'none', color: '#5A5A64', fontSize: 18, lineHeight: 1, cursor: 'pointer', padding: '4px 8px' }}
      >
        ×
      </button>
    </div>
  )
}
