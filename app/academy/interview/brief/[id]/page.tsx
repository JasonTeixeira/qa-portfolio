import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import {
  BriefView,
  type BriefConfidence,
  type BriefDecoded,
  type BriefRound,
  type BriefViewData,
} from '@/components/academy/interview/brief/BriefView'
import type { BriefQueueScenario } from '@/components/academy/interview/brief/BriefQueue'

export const metadata: Metadata = {
  title: 'Company brief — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type BriefRow = {
  id: string
  user_id: string
  company: string | null
  role: string | null
  decoded: unknown
  rounds: unknown
  edge: string | null
  risk: string | null
  queue: unknown
  confidence: string | null
  created_at: string | null
}

/** Coerce the stored `decoded` jsonb into safe {phrase, means} pairs. */
function asDecoded(raw: unknown): BriefDecoded[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((d): d is Record<string, unknown> => Boolean(d) && typeof d === 'object')
    .map((d) => ({ phrase: String(d.phrase ?? ''), means: String(d.means ?? '') }))
    .filter((d) => d.phrase || d.means)
}

/** Coerce the stored `rounds` jsonb into safe {name, focus} entries. */
function asRounds(raw: unknown): BriefRound[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((r): r is Record<string, unknown> => Boolean(r) && typeof r === 'object')
    .map((r) => ({ name: String(r.name ?? ''), focus: String(r.focus ?? '') }))
    .filter((r) => r.name)
}

/** Coerce the stored `queue` jsonb into a de-duplicated list of slug strings. */
function asSlugs(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const v of raw) {
    if (typeof v !== 'string') continue
    const slug = v.trim()
    if (!slug || seen.has(slug)) continue
    seen.add(slug)
    out.push(slug)
  }
  return out
}

function normalizeConfidence(raw: string | null): BriefConfidence {
  return raw === 'high' || raw === 'medium' ? raw : 'low'
}

function shortDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

type ScenarioRow = { slug: string; title: string; track: string }

/**
 * View one company brief. Loads the caller's own interview_company_briefs row (own-row RLS +
 * an explicit ownership check → notFound otherwise), then renders it. EVERYTHING shown is the
 * stored row — decoded phrases, predicted rounds, edge, and risk are read as-is. The tuned
 * queue's stored slugs are resolved against real published interview_scenarios (in brief order);
 * any slug that no longer resolves is dropped silently. No comp/headcount/private data is ever
 * invented — there is no free-form channel for it.
 */
export default async function InterviewBriefViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) redirect(`/login?audience=academy&next=/academy/interview/brief/${id}`)

  const { data: briefRow } = await sb
    .from('interview_company_briefs')
    .select('id, user_id, company, role, decoded, rounds, edge, risk, queue, confidence, created_at')
    .eq('id', id)
    .maybeSingle<BriefRow>()
  if (!briefRow || briefRow.user_id !== user.id) notFound()

  const slugs = asSlugs(briefRow.queue)

  // Resolve the stored queue slugs to real, published scenarios, preserving brief order and
  // silently skipping any slug that no longer resolves.
  let queue: BriefQueueScenario[] = []
  if (slugs.length > 0) {
    const { data: scenarioRows } = await sb
      .from('interview_scenarios')
      .select('slug, title, track')
      .in('slug', slugs)
      .eq('status', 'published')
    const bySlug = new Map<string, ScenarioRow>(
      (Array.isArray(scenarioRows) ? (scenarioRows as ScenarioRow[]) : []).map((s) => [s.slug, s]),
    )
    queue = slugs
      .map((slug) => bySlug.get(slug))
      .filter((s): s is ScenarioRow => Boolean(s))
      .map((s) => ({ slug: s.slug, title: s.title, track: s.track }))
  }

  const data: BriefViewData = {
    company: briefRow.company || 'Untitled brief',
    role: briefRow.role,
    confidence: normalizeConfidence(briefRow.confidence),
    createdLabel: shortDate(briefRow.created_at),
    decoded: asDecoded(briefRow.decoded),
    rounds: asRounds(briefRow.rounds),
    edge: briefRow.edge,
    risk: briefRow.risk,
    queue,
  }

  return (
    <InterviewShell active={null} backHref="/academy/interview">
      <BriefView data={data} />
    </InterviewShell>
  )
}
