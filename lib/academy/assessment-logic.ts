/**
 * Pure assessment logic — NO 'server-only', NO DB. Unit-testable.
 * A course's pre/post quiz is a list of single-answer MCQs; scoring is a simple
 * percent-correct (0–100) that feeds Hake's g via the assessments pipeline.
 */

export type AssessmentKind = 'pretest' | 'posttest'

export interface Question {
  id: string
  prompt: string
  options: string[]
  /** Index of the correct option. */
  answer: number
}

/** A question safe to send to the browser — the answer key never leaves the server. */
export type PublicQuestion = Omit<Question, 'answer'>

export function stripAnswers(questions: Question[]): PublicQuestion[] {
  return questions.map(({ answer: _answer, ...rest }) => rest)
}

/** Validate + normalize a raw jsonb question bank (drops malformed entries). */
export function parseQuestions(raw: unknown): Question[] {
  if (!Array.isArray(raw)) return []
  const out: Question[] = []
  raw.forEach((q, i) => {
    if (!q || typeof q !== 'object') return
    const rec = q as Record<string, unknown>
    const prompt = typeof rec.prompt === 'string' ? rec.prompt : null
    const options = Array.isArray(rec.options) ? rec.options.filter((o): o is string => typeof o === 'string') : []
    const answer = typeof rec.answer === 'number' ? rec.answer : -1
    if (!prompt || options.length < 2 || answer < 0 || answer >= options.length) return
    out.push({ id: typeof rec.id === 'string' ? rec.id : `q${i + 1}`, prompt, options, answer })
  })
  return out
}

/**
 * Score responses against a question bank → 0–100 percent correct.
 * A response of -1 (or out of range / missing) counts as wrong, never throws.
 */
export function scoreAssessment(responses: number[], questions: Question[]): number {
  if (questions.length === 0) return 0
  let correct = 0
  questions.forEach((q, i) => {
    if (responses[i] === q.answer) correct++
  })
  return Math.round((correct / questions.length) * 100)
}

/** True when every question has a selected option (gate the submit button). */
export function isComplete(responses: (number | null)[], questions: readonly unknown[]): boolean {
  if (questions.length === 0) return false
  return questions.every((_, i) => typeof responses[i] === 'number' && responses[i]! >= 0)
}
