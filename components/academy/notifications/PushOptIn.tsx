'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@/components/academy/ui/Icon'
import styles from './push-optin.module.css'

type State = 'checking' | 'unavailable' | 'idle' | 'working' | 'enabled' | 'denied'

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const buffer = new ArrayBuffer(raw.length)
  const out = new Uint8Array(buffer)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

/**
 * Streak-reminder opt-in. Self-hides when push isn't configured (no VAPID key)
 * or unsupported by the browser — so it never shows a dead control.
 */
export function PushOptIn() {
  const [state, setState] = useState<State>('checking')
  const [vapidKey, setVapidKey] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const supported =
        typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
      if (!supported) return setState('unavailable')

      const res = await fetch('/api/academy/push/public-key').then((r) => r.json()).catch(() => null)
      if (cancelled) return
      if (!res?.key) return setState('unavailable')
      setVapidKey(res.key)

      if (Notification.permission === 'denied') return setState('denied')
      const reg = await navigator.serviceWorker.getRegistration()
      const existing = await reg?.pushManager.getSubscription()
      setState(existing ? 'enabled' : 'idle')
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function enable() {
    if (!vapidKey) return
    setState('working')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return setState(permission === 'denied' ? 'denied' : 'idle')

      const reg = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register('/sw.js'))
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      })
      const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } }
      const ok = await fetch('/api/academy/push/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      })
        .then((r) => r.ok)
        .catch(() => false)
      setState(ok ? 'enabled' : 'idle')
    } catch {
      setState('idle')
    }
  }

  if (state === 'checking' || state === 'unavailable') return null

  return (
    <div className={styles.card} data-state={state}>
      <span className={styles.bell} aria-hidden="true">
        <Icon name={state === 'enabled' ? 'bell' : 'bell-off'} size={20} />
      </span>
      <div className={styles.copy}>
        <span className={styles.title}>
          {state === 'enabled' ? 'Streak reminders are on' : 'Never break your streak'}
        </span>
        <span className={styles.sub}>
          {state === 'enabled'
            ? 'We’ll nudge you only when your streak is genuinely at risk.'
            : state === 'denied'
              ? 'Notifications are blocked — enable them in your browser settings.'
              : 'Get a single, well-timed reminder before your streak lapses.'}
        </span>
      </div>
      {state !== 'enabled' && state !== 'denied' ? (
        <button type="button" className={styles.btn} onClick={enable} disabled={state === 'working'}>
          {state === 'working' ? 'Enabling…' : 'Turn on'}
        </button>
      ) : null}
    </div>
  )
}
