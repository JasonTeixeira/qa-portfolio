'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createSession } from '@/app/academy/interview/_actions'

const REASONS: Record<string, string> = {
  unauthorized: 'Please sign in to start a mock.',
  scenario_not_found: 'That scenario is unavailable right now.',
  scenario_required: 'No scenario selected.',
  insert_failed: 'Could not start the mock — try again.',
  server_error: 'Something went wrong — try again.',
}

/**
 * Shared client logic for the cockpit's one live action: start a mock. Calls the READ-ONLY
 * createSession server action (own-row RLS insert) and routes to the live session on success.
 * On failure it surfaces an honest message and never navigates — no fabricated session id.
 * `startingSlug` lets a multi-item strip show which chip is launching.
 */
export function useStartMock() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [startingSlug, setStartingSlug] = useState<string | null>(null)

  function start(scenarioSlug: string) {
    setError(null)
    setStartingSlug(scenarioSlug)
    startTransition(async () => {
      const result = await createSession({ scenarioSlug, mode: 'typed' })
      if (result.ok) {
        router.push(`/academy/interview/session/${result.sessionId}`)
        return
      }
      setStartingSlug(null)
      setError(REASONS[result.reason] ?? 'Could not start the mock — try again.')
    })
  }

  return { start, pending, error, startingSlug }
}
