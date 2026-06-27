import 'server-only'

import {
  buildTutorMessages,
  looksLikeTutorInjection,
  type TutorTurn,
} from '@/lib/academy/tutor-logic'
import { getCatalogCourses, getCourse, getLesson } from '@/lib/academy/content'
import { deepSeekChat } from '@/lib/rag/deepseek'
import type { LessonBlock } from '@/data/academy/sample-course'

/**
 * The AI tutor IO layer. Validates the learner message, builds a grounded
 * knowledge-base context from the published lesson/course (or the academy method
 * + course catalog when no lesson is in scope), then asks deepSeekChat to reply
 * as the Sage Academy tutor.
 *
 * @security
 *  - userId is taken from the authenticated session by the caller — NEVER from
 *    the request body.
 *  - Lesson/course content and the learner message are untrusted: the prompt
 *    (see tutor-logic) fences them and instructs the model to ignore embedded
 *    instructions, and an injection pre-check short-circuits before any LLM call.
 *  - Best-effort: a missing key or any IO/LLM failure degrades to a warm
 *    "warming up" reply and NEVER throws to the client.
 */

const MIN_MESSAGE_CHARS = 1
const MAX_MESSAGE_CHARS = 2000
const TUTOR_MAX_TOKENS = 500
const TUTOR_TEMPERATURE = 0.3

/** Bound the grounding context so the prompt stays small and cheap. */
const MAX_KB_CHARS = 4000

const WARMING_UP_REPLY = 'Your tutor is warming up — ask me again in a moment.'

export type AskTutorInput = {
  message: string
  history: TutorTurn[]
  courseSlug?: string
  lessonSlug?: string
}

export type AskTutorResult = {
  /** False when grading is unavailable (no LLM key, an error, a guard trip). */
  available: boolean
  reply: string
}

// ---------------------------------------------------------------------------
// Per-user rate limit (ledger-light): in-memory sliding window, Upstash-optional,
// fail-open. Caps a sane burst so one learner can't hammer the LLM. The call
// site never blocks on a guard error — a store/guard fault degrades to "allow".
// ---------------------------------------------------------------------------
const RL_LIMIT = 20 // messages
const RL_WINDOW_MS = 5 * 60 * 1000 // per 5 minutes per user
const RL_MAX_USERS = 10_000

type RlBucket = { hits: number[]; lastSeen: number }
const rlBuckets = new Map<string, RlBucket>()

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const upstashEnabled = Boolean(UPSTASH_URL && UPSTASH_TOKEN)

function rateLimitMemory(userId: string): boolean {
  const now = Date.now()
  const bucket = rlBuckets.get(userId)
  const fresh = (bucket?.hits ?? []).filter((ts) => now - ts < RL_WINDOW_MS)
  if (fresh.length >= RL_LIMIT) {
    rlBuckets.set(userId, { hits: fresh, lastSeen: now })
    return false
  }
  fresh.push(now)
  rlBuckets.set(userId, { hits: fresh, lastSeen: now })
  // Evict the oldest bucket if the map grows unbounded.
  if (rlBuckets.size > RL_MAX_USERS) {
    let oldestKey: string | null = null
    let oldestTs = Infinity
    for (const [key, b] of rlBuckets) {
      if (b.lastSeen < oldestTs) {
        oldestTs = b.lastSeen
        oldestKey = key
      }
    }
    if (oldestKey) rlBuckets.delete(oldestKey)
  }
  return true
}

/** Returns true if the user is under their burst cap. Fails OPEN on any error. */
async function allowTutorMessage(userId: string): Promise<boolean> {
  if (!upstashEnabled) return rateLimitMemory(userId)
  try {
    const key = `rl:academy-tutor:${userId}`
    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['PEXPIRE', key, String(RL_WINDOW_MS), 'NX'],
      ]),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`upstash ${res.status}`)
    const out = (await res.json()) as Array<{ result?: number }>
    const count = Number(out[0]?.result ?? 0)
    return count <= RL_LIMIT
  } catch (err) {
    console.error('[academy/tutor] rate-limit guard error; failing open', err)
    return true // fail open
  }
}

// ---------------------------------------------------------------------------
// Knowledge-base grounding.
// ---------------------------------------------------------------------------

function clampKb(text: string): string {
  if (text.length <= MAX_KB_CHARS) return text
  return `${text.slice(0, MAX_KB_CHARS)}\n…(context truncated)`
}

/** Distill a lesson's teaching blocks into a compact, tutor-usable text. */
function distillLessonBlocks(blocks: LessonBlock[]): string {
  const parts: string[] = []
  for (const b of blocks) {
    switch (b.type) {
      case 'concept':
        parts.push(`CONCEPT${b.title ? ` (${b.title})` : ''}: ${b.text}`)
        break
      case 'worked-example':
        parts.push(
          `WORKED EXAMPLE: ${b.intro} Steps: ${b.steps.join('; ')}. Common mistake: ${b.commonMistake}`,
        )
        break
      case 'tradeoff':
        parts.push(
          `TRADEOFF: ${b.question} (A) ${b.optionA.label}: ${b.optionA.text} (B) ${b.optionB.label}: ${b.optionB.text}. Guidance: ${b.guidance}`,
        )
        break
      case 'debug':
        parts.push(`DEBUG: symptom — ${b.symptom}; task — ${b.task}; fix — ${b.fix}`)
        break
      case 'mission':
        parts.push(`MISSION: ${b.text}`)
        break
      case 'context':
        parts.push(`SCENARIO: ${b.text}`)
        break
      case 'sprint-contract':
        parts.push(`SPRINT OUTCOME: ${b.outcome}. Proof required: ${b.proof}.`)
        break
      case 'pretest':
        parts.push(`PRETEST: ${b.prompt}`)
        break
      case 'teachback':
        if (b.prompts.length) parts.push(`TEACHBACK PROMPTS: ${b.prompts.join(' | ')}`)
        break
      default:
        break
    }
  }
  return parts.join('\n')
}

/**
 * Build the server-side grounding context. With a lesson in scope, distill its
 * key blocks + the course title/subtitle. Otherwise, ground in the academy
 * method plus a short catalog of course titles so the tutor can point somewhere.
 */
async function buildKbContext(courseSlug?: string, lessonSlug?: string): Promise<string> {
  if (courseSlug && lessonSlug) {
    try {
      const [lesson, course] = await Promise.all([
        getLesson(courseSlug, lessonSlug),
        getCourse(courseSlug),
      ])
      if (lesson) {
        const header =
          (course ? `COURSE: ${course.title}${course.subtitle ? ` — ${course.subtitle}` : ''}\n` : '') +
          `LESSON: ${lesson.title}${lesson.eyebrow ? ` (${lesson.eyebrow})` : ''}\n`
        const body = distillLessonBlocks(lesson.blocks)
        return clampKb(`${header}\n${body}`.trim())
      }
    } catch (err) {
      console.error('[academy/tutor] buildKbContext lesson load failed', err)
      // fall through to the catalog grounding
    }
  }

  // No lesson in scope (or load failed): ground in the method + course catalog.
  try {
    const courses = await getCatalogCourses()
    const catalog = courses.length
      ? `AVAILABLE COURSES:\n${courses.map((c) => `- ${c.title}`).join('\n')}`
      : 'The course catalog is loading.'
    return clampKb(
      'No single lesson is in scope. Sage Academy teaches software engineering and data/AI ' +
        'through hands-on, evidence-gated lessons that run the 5-beat loop ' +
        'HOOK → MODEL → DO → PROVE → LOCK. Learners reach mastery by proving they can do the ' +
        'work (passing a teachback, shipping the mission), not by reading or watching.\n\n' +
        catalog,
    )
  } catch (err) {
    console.error('[academy/tutor] buildKbContext catalog load failed', err)
    return 'Sage Academy teaches software engineering and data/AI through hands-on, evidence-gated lessons.'
  }
}

export async function askTutor(input: AskTutorInput, userId: string): Promise<AskTutorResult> {
  const message = typeof input.message === 'string' ? input.message.trim() : ''

  // Validate length before anything else.
  if (message.length < MIN_MESSAGE_CHARS) {
    return { available: true, reply: 'Ask me anything about this lesson and I’ll help you work it out.' }
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return {
      available: true,
      reply: 'That’s a lot at once — trim it to the part you’re stuck on and ask me again.',
    }
  }

  // Prompt-injection guard: polite redirect, no LLM call.
  if (looksLikeTutorInjection(message)) {
    return {
      available: true,
      reply: 'Let’s stay on the lesson — ask me about the concept or the mission and I’ll help you reason it out.',
    }
  }

  // Per-user burst guard (fail-open).
  const allowed = await allowTutorMessage(userId)
  if (!allowed) {
    return {
      available: true,
      reply: 'You’re moving fast — take a breath and ask me again in a moment.',
    }
  }

  // Honest degrade with no LLM key — never crash.
  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    return { available: false, reply: WARMING_UP_REPLY }
  }

  try {
    const kbContext = await buildKbContext(input.courseSlug, input.lessonSlug)
    const history = Array.isArray(input.history) ? input.history : []

    const result = await deepSeekChat({
      messages: buildTutorMessages({ kbContext, history, userMessage: message }),
      temperature: TUTOR_TEMPERATURE,
      maxTokens: TUTOR_MAX_TOKENS,
    })

    const reply = result.content.trim()
    if (!reply) return { available: false, reply: WARMING_UP_REPLY }
    return { available: true, reply }
  } catch (err) {
    console.error('[academy/tutor] askTutor failed', err)
    return { available: false, reply: WARMING_UP_REPLY }
  }
}
