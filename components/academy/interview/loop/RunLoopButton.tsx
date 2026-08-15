'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createLoop } from '@/app/academy/interview/_actions-network'
import styles from './loop.module.css'

const REASONS: Record<string, string> = {
  unauthorized: 'Sign in to run a loop.',
  preset_required: 'No preset selected.',
  preset_not_found: 'That loop is unavailable right now.',
  insert_failed: 'Could not start the loop — try again.',
  server_error: 'Something went wrong — try again.',
}

type Props = { slug: string; label?: string }

/**
 * The Library "run this loop" affordance — the one wiring point outside the loop surface. Calls
 * createLoop (own-row insert from a REAL published preset) and, on success, routes to the loop
 * runner at /academy/interview/loop/<id>. On failure it surfaces an honest reason and never
 * navigates — no fabricated loop id. This replaces the earlier "coming soon" stub.
 */
export function RunLoopButton({ slug, label = 'Run this loop →' }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function run() {
    setError(null)
    startTransition(async () => {
      const result = await createLoop({ companyPresetSlug: slug })
      if (result.ok) {
        router.push(`/academy/interview/loop/${result.loopId}`)
        return
      }
      setError(REASONS[result.reason] ?? 'Could not start the loop — try again.')
    })
  }

  return (
    <div className={styles.runWrap}>
      <button
        type="button"
        className={styles.runBtn}
        onClick={run}
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? 'Starting…' : label}
      </button>
      {error ? (
        <span className={styles.runError} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
