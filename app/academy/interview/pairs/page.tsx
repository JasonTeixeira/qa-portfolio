import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { PeerLoops, type PeerMatchView } from '@/components/academy/interview/pairs/PeerLoops'

export const metadata: Metadata = {
  title: 'Peer loops — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type PeerMatchRow = {
  id: string
  status: string
  track: string | null
  note: string | null
  slot_text: string | null
  created_at: string
}

const STATUSES: readonly PeerMatchView['status'][] = ['requested', 'matched', 'scheduled', 'completed']

/** Short, stable date label rendered server-side to avoid hydration drift. */
function dateLabel(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Async peer loops (Spec §7). This is a REQUEST surface only — no live A/V room, no presence, no
 * fabricated matched stranger. It loads the caller's OWN interview_peer_matches (own-row RLS) and
 * hands them to the client form/list. A signed-out visitor is gated to sign-in (307).
 */
export default async function InterviewPairsPage() {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) redirect('/login?audience=academy&next=/academy/interview/pairs')

  // The caller's OWN peer-match requests (own-row RLS), newest first.
  const { data: rows } = await sb
    .from('interview_peer_matches')
    .select('id, status, track, note, slot_text, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const matchRows: PeerMatchRow[] = Array.isArray(rows) ? (rows as PeerMatchRow[]) : []
  const initialRequests: PeerMatchView[] = matchRows.map((r) => ({
    id: r.id,
    status: STATUSES.includes(r.status as PeerMatchView['status'])
      ? (r.status as PeerMatchView['status'])
      : 'requested',
    track: r.track,
    note: r.note,
    slotText: r.slot_text,
    createdLabel: dateLabel(r.created_at),
  }))

  return (
    <InterviewShell active="pairs">
      <PeerLoops initialRequests={initialRequests} />
    </InterviewShell>
  )
}
