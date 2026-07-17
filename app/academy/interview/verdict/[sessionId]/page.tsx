import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { VerdictScorecard, type VerdictRow } from '@/components/academy/interview/VerdictScorecard'
import type { CommitteeVerdict } from '@/lib/academy/interview/rubric'

export const metadata: Metadata = {
  title: 'Verdict — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type VerdictDim = { slug: string; score: number; delta: number; bar_status: string }
type VerdictEvidenceItem = { ts_seconds: number; mark: string; title: string; note: string }

function asDims(raw: unknown): VerdictDim[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((d): d is Record<string, unknown> => Boolean(d) && typeof d === 'object')
    .map((d) => ({
      slug: String(d.slug ?? ''),
      score: Number(d.score) || 0,
      delta: Number(d.delta) || 0,
      bar_status: String(d.bar_status ?? 'below_bar'),
    }))
    .filter((d) => d.slug)
}

function asEvidence(raw: unknown): VerdictEvidenceItem[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((e): e is Record<string, unknown> => Boolean(e) && typeof e === 'object')
    .map((e) => ({
      ts_seconds: Number(e.ts_seconds) || 0,
      mark: String(e.mark ?? ''),
      title: String(e.title ?? ''),
      note: String(e.note ?? ''),
    }))
}

/**
 * The committee verdict scorecard. Loads the caller's own verdict row (own-row RLS, keyed
 * by session), verifying ownership. When the grade is still running / failed the row is
 * absent and the scorecard shows an honest "Scoring…" processing state with a re-check —
 * NEVER a fabricated score. Everything shown comes from the real interview_verdicts row.
 */
export default async function InterviewVerdictPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params

  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) redirect(`/login?audience=academy&next=/academy/interview/verdict/${sessionId}`)

  // Ownership: the session must be the caller's (own-row RLS on interview_sessions).
  const { data: session } = await sb
    .from('interview_sessions')
    .select('id, user_id, level')
    .eq('id', sessionId)
    .maybeSingle()
  if (!session || session.user_id !== user.id) notFound()

  // The verdict (own-row RLS read; no client insert path). Absent ⇒ still grading / failed.
  const { data: row } = await sb
    .from('interview_verdicts')
    .select('score, prev_score, verdict, dims, evidence, summary_sentence, claims_checked, words')
    .eq('session_id', sessionId)
    .maybeSingle()

  const verdict: VerdictRow | null = row
    ? {
        score: Number(row.score) || 0,
        prev_score: typeof row.prev_score === 'number' ? row.prev_score : null,
        verdict: row.verdict as CommitteeVerdict,
        dims: asDims(row.dims),
        evidence: asEvidence(row.evidence),
        summary_sentence: typeof row.summary_sentence === 'string' ? row.summary_sentence : null,
        claims_checked: typeof row.claims_checked === 'number' ? row.claims_checked : null,
        words: typeof row.words === 'number' ? row.words : null,
        level: (session.level as string) ?? 'senior',
      }
    : null

  return <VerdictScorecard sessionId={sessionId} verdict={verdict} />
}
