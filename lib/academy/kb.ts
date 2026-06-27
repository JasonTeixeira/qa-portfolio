import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/server'
import { embedTextLocal, vectorToSql } from '@/lib/rag/embeddings'

/**
 * Academy-native RAG retrieval. Embeds the learner query with the local $0 model
 * and matches it against the academy_kb_chunks corpus (course content only — no
 * Discord/market cross-pollution) via the match_academy_kb RPC.
 *
 * @security service-role (bypasses RLS) — KB has no learner read path. The query
 *   is untrusted text but is only embedded + matched, never executed.
 *
 * Best-effort: any embedding/RPC failure degrades to an empty result. This NEVER
 * throws, so the tutor's hard guardrail can treat topScore=0 as "no support".
 */

export type AcademyKbChunk = {
  courseSlug: string
  lessonSlug: string
  heading: string
  content: string
  /** Cosine similarity 0..1, best-first. */
  score: number
}

export type AcademyKbResult = {
  chunks: AcademyKbChunk[]
  /** Best chunk's score, or 0 when retrieval found nothing / failed. */
  topScore: number
}

type MatchRow = {
  id: string
  course_slug: string
  lesson_slug: string
  heading: string | null
  content: string
  score: number
}

export async function retrieveAcademyKb(query: string, limit = 6): Promise<AcademyKbResult> {
  const text = typeof query === 'string' ? query.trim() : ''
  if (!text) return { chunks: [], topScore: 0 }

  try {
    const { vector } = await embedTextLocal(text)
    const { data, error } = await supabaseAdmin().rpc('match_academy_kb', {
      query_embedding: vectorToSql(vector),
      match_count: limit,
    })
    if (error) throw new Error(error.message)

    const rows = (data ?? []) as MatchRow[]
    const chunks: AcademyKbChunk[] = rows.map((r) => ({
      courseSlug: r.course_slug,
      lessonSlug: r.lesson_slug,
      heading: r.heading ?? '',
      content: r.content,
      score: Number(r.score) || 0,
    }))
    const topScore = chunks.length ? chunks[0].score : 0
    return { chunks, topScore }
  } catch (err) {
    console.error('[academy/kb] retrieveAcademyKb failed', err)
    return { chunks: [], topScore: 0 }
  }
}
