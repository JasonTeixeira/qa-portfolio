'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { scoreAndRecord } from '@/lib/academy/assessments'

const ResponsesInput = z.object({
  courseSlug: z.string().min(1).max(120),
  kind: z.enum(['pretest', 'posttest']),
  responses: z.array(z.number().int().min(-1).max(50)).max(100),
})

/**
 * Submit a learner's quiz responses; the server scores them against the answer
 * key (never exposed to the browser) and records the result. Feeds Hake's g.
 *
 * NOTE: this is the ONLY write path for assessments. A score-based action was
 * removed (it let a client self-report a score and fake their gain); the
 * `academy_assessments` table has no learner INSERT policy — service role only.
 */
export async function submitAssessmentResponses(input: {
  courseSlug: string
  kind: 'pretest' | 'posttest'
  responses: number[]
}): Promise<{ ok: boolean; score?: number; g?: number | null }> {
  const parsed = ResponsesInput.safeParse(input)
  if (!parsed.success) return { ok: false }

  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return { ok: false }

  const result = await scoreAndRecord(user.id, parsed.data.courseSlug, parsed.data.kind, parsed.data.responses)
  if (result.ok) {
    revalidatePath(`/academy/course/${parsed.data.courseSlug}`)
    revalidatePath('/academy/efficacy')
  }
  return result
}
