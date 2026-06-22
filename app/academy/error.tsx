'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import styles from '@/components/academy/feedback/feedback.module.css'

export default function AcademyError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // surface to the console so it lands in the browser/Sentry pipeline
    console.error('[academy]', error)
  }, [error])

  return (
    <section className={styles.state} role="alert">
      <span className={styles.glyph} aria-hidden="true">⚠</span>
      <h1 className={styles.stateTitle}>Something interrupted this page</h1>
      <p className={styles.stateBody}>
        A hiccup loading the Academy — your progress is safe. Try again, and if it keeps happening, head back to the catalog.
        {error.digest ? <><br /><span style={{ opacity: 0.5, fontSize: '0.8em' }}>ref: {error.digest}</span></> : null}
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={reset}>Try again</button>
        <Link href="/academy/catalog" className={styles.ghost}>Back to catalog</Link>
      </div>
    </section>
  )
}
