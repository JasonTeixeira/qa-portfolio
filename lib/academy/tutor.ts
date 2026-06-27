import 'server-only'

import {
  buildTutorMessages,
  isLikelyOnTopic,
  looksLikeTutorInjection,
  type TutorTurn,
} from '@/lib/academy/tutor-logic'
import { getCatalogCourses, getCourse, getLesson } from '@/lib/academy/content'
import { retrieveAcademyKb, type AcademyKbChunk } from '@/lib/academy/kb'
import { deepSeekChat } from '@/lib/rag/deepseek'
import type { LessonBlock } from '@/data/academy/sample-course'

/**
 * The AI tutor IO layer. Validates the learner message, retrieves grounding from
 * the academy-native RAG corpus (academy_kb_chunks) AND the current lesson/course
 * distillate, applies a hard relevance guardrail, then asks deepSeekChat to reply
 * as the Sage Academy tutor.
 *
 * @security
 *  - userId is taken from the authenticated session by the caller — NEVER from
 *    the request body.
 *  - Lesson/course content, retrieved passages, and the learner message are
 *    untrusted: the prompt (see tutor-logic) fences them and instructs the model
 *    to ignore embedded instructions; an injection pre-check short-circuits
 *    before any LLM call.
 *  - HARD GUARDRAIL: when retrieval finds nothing relevant (topScore <
 *    RELEVANCE_MIN) AND the message isn't plausibly on-topic, the tutor refuses
 *    and redirects WITHOUT calling the LLM.
 *  - Best-effort: a missing key or any IO/LLM failure degrades to a warm
 *    "warming up" reply and NEVER throws to the client.
 */

const MIN_MESSAGE_CHARS = 1
const MAX_MESSAGE_CHARS = 2000
const TUTOR_MAX_TOKENS = 500
const TUTOR_TEMPERATURE = 0.3

/** Bound the grounding context so the prompt stays small and cheap. */
const MAX_KB_CHARS = 5000

/** How many KB passages to retrieve for grounding. */
const KB_RETRIEVE_LIMIT = 6

/**
 * Hard relevance floor for the no-LLM guardrail. If the best retrieved chunk
 * scores below this AND the message isn't plausibly on-topic, we refuse without
 * calling the LLM (cost + a firm guardrail).
 */
const RELEVANCE_MIN = 0.34

const WARMING_UP_REPLY = 'Your tutor is warming up — ask me again in a moment.'

const OFF_SCOPE_REPLY =
  "I'm your Sage Academy tutor — I can only help with the courses here and how to learn them. " +
  'Ask me about a lesson, a concept, or how to make progress.'

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
 * Build the current-lesson grounding context. With a lesson in scope, distill its
 * key blocks + the course title/subtitle. Otherwise, ground in the academy
 * method plus a short catalog of course titles so the tutor can point somewhere.
 */
async function buildLessonContext(courseSlug?: string, lessonSlug?: string): Promise<string> {
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
        return `${header}\n${body}`.trim()
      }
    } catch (err) {
      console.error('[academy/tutor] buildLessonContext lesson load failed', err)
      // fall through to the catalog grounding
    }
  }

  // No lesson in scope (or load failed): ground in the method + course catalog.
  try {
    const courses = await getCatalogCourses()
    const catalog = courses.length
      ? `AVAILABLE COURSES:\n${courses.map((c) => `- ${c.title}`).join('\n')}`
      : 'The course catalog is loading.'
    return (
      'No single lesson is in scope. Sage Academy teaches software engineering and data/AI ' +
      'through hands-on, evidence-gated lessons that run the 5-beat loop ' +
      'HOOK → MODEL → DO → PROVE → LOCK. Learners reach mastery by proving they can do the ' +
      'work (passing a teachback, shipping the mission), not by reading or watching.\n\n' +
      catalog
    )
  } catch (err) {
    console.error('[academy/tutor] buildLessonContext catalog load failed', err)
    return 'Sage Academy teaches software engineering and data/AI through hands-on, evidence-gated lessons.'
  }
}

/** Render retrieved KB passages with their course/lesson headings, best-first. */
function formatRetrievedPassages(chunks: AcademyKbChunk[]): string {
  if (!chunks.length) return ''
  return chunks
    .map((c, i) => {
      const heading = c.heading || `${c.courseSlug} · ${c.lessonSlug}`
      return `[${i + 1}] ${heading}\n${c.content}`
    })
    .join('\n\n')
}

/**
 * Compose the full grounding context from BOTH the current-lesson distillate and
 * the retrieved KB passages, each clearly labelled. Bounded to {@link MAX_KB_CHARS}.
 */
function composeKbContext(lessonContext: string, chunks: AcademyKbChunk[]): string {
  const sections: string[] = []
  if (lessonContext.trim()) {
    sections.push(`=== CURRENT LESSON ===\n${lessonContext.trim()}`)
  }
  const passages = formatRetrievedPassages(chunks)
  if (passages) {
    sections.push(`=== RETRIEVED COURSE PASSAGES (most relevant first) ===\n${passages}`)
  }
  const composed = sections.join('\n\n')
  if (composed.length <= MAX_KB_CHARS) return composed
  return `${composed.slice(0, MAX_KB_CHARS)}\n…(context truncated)`
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

  // Retrieve academy KB passages (best-effort: never throws) + the current-lesson
  // distillate. Both feed the grounding context and the hard relevance guardrail.
  const [retrieval, lessonContext] = await Promise.all([
    retrieveAcademyKb(message, KB_RETRIEVE_LIMIT),
    buildLessonContext(input.courseSlug, input.lessonSlug),
  ])

  // HARD GUARDRAIL (before any LLM call): if nothing in the KB is even close AND
  // the question doesn't look on-topic, refuse + redirect without spending a call.
  if (retrieval.topScore < RELEVANCE_MIN && !isLikelyOnTopic(message)) {
    return { available: true, reply: OFF_SCOPE_REPLY }
  }

  // Honest degrade with no LLM key — never crash.
  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    return { available: false, reply: WARMING_UP_REPLY }
  }

  try {
    const kbContext = composeKbContext(lessonContext, retrieval.chunks)
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
