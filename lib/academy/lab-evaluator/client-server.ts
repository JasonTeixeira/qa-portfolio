import 'server-only'

import { requestControlledEvaluation } from './client'
import type { TrustedLabEvaluation } from './signing'

export async function evaluateLabOnControlledService(input: {
  courseSlug: string
  lessonSlug: string
  code: string
}): Promise<TrustedLabEvaluation | null> {
  const url = process.env.ACADEMY_LAB_EVALUATOR_URL
  const secret = process.env.ACADEMY_LAB_EVALUATOR_SECRET
  if (!url || !secret) return null
  return requestControlledEvaluation(input, { url, secret })
}
