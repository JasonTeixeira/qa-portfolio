/**
 * Academy-native RAG ingestion.
 *
 *   tsx --env-file=.env.local scripts/academy/ingest-kb.ts
 *
 * For every PUBLISHED course + lesson, extracts clean teaching text from the
 * meaningful block types, chunks it to ~150-220 words, embeds each chunk with the
 * local $0 model (Supabase/gte-small, 384-dim), and upserts into academy_kb_chunks.
 *
 * IDEMPOTENT: every (course_slug, lesson_slug)'s existing chunks are deleted
 * before its fresh chunks are inserted, so a re-run rebuilds the corpus cleanly.
 *
 * NOTE: this runs under `tsx` (Node, no Next runtime), so it does NOT import
 * lib/supabase/server.ts (pulls next/headers) or any 'server-only' module. It
 * builds the service-role client directly from @supabase/supabase-js and calls
 * the pure embedTextLocal helper.
 */

import { createClient } from '@supabase/supabase-js'
import {
  embedTextLocal,
  LOCAL_EMBEDDING_DIMENSIONS,
  LOCAL_EMBEDDING_MODEL,
  vectorToSql,
} from '../../lib/rag/embeddings'
import type { LessonBlock } from '../../data/academy/sample-course'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (load .env.local).')
  process.exit(1)
}
const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

// Target chunk size in words. We pack passages until ~MAX, never splitting a
// sentence; passages shorter than MIN are kept whole rather than padded.
const CHUNK_MAX_WORDS = 220
const CHUNK_MIN_WORDS = 150
/** Rough token estimate (~0.75 words/token) for the token_count column. */
const TOKENS_PER_WORD = 1 / 0.75

type DbLesson = {
  slug: string
  title: string
  eyebrow: string | null
  blocks: LessonBlock[] | null
}

/**
 * Pull readable teaching text out of a single block. Returns null for blocks
 * that carry no teaching prose (code-only, video shells, gates, etc.). The
 * label becomes part of the chunk heading so retrieval surfaces context.
 */
function blockToPassage(block: LessonBlock): { label: string; text: string } | null {
  switch (block.type) {
    case 'mission':
      return { label: 'mission', text: `The mission: ${block.text}` }
    case 'context':
      return { label: 'scenario', text: `Scenario: ${block.text}` }
    case 'concept':
      return {
        label: 'concept',
        text: `${block.title ? `${block.title}. ` : ''}${block.text}`,
      }
    case 'worked-example':
      return {
        label: 'worked-example',
        text:
          `Worked example: ${block.intro} ` +
          `Steps: ${block.steps.join('; ')}. ` +
          `Common mistake: ${block.commonMistake}`,
      }
    case 'tradeoff':
      return {
        label: 'tradeoff',
        text:
          `Trade-off: ${block.question} ` +
          `Option ${block.optionA.label} — ${block.optionA.text}. ` +
          `Option ${block.optionB.label} — ${block.optionB.text}. ` +
          `Guidance: ${block.guidance}`,
      }
    case 'debug':
      return {
        label: 'debug',
        text: `Debugging: symptom — ${block.symptom}. Task — ${block.task}. Fix — ${block.fix}`,
      }
    case 'teachback':
      if (!block.prompts.length) return null
      return { label: 'teachback', text: `Teach-back prompts: ${block.prompts.join(' ')}` }
    case 'transfer':
      return { label: 'transfer', text: `Transfer: ${block.text}` }
    default:
      return null
  }
}

/** Split prose into sentences, keeping their terminal punctuation. */
function toSentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (!cleaned) return []
  const parts = cleaned.match(/[^.!?]+[.!?]*\s*/g)
  return (parts ?? [cleaned]).map((s) => s.trim()).filter(Boolean)
}

const wordCount = (text: string): number => (text.trim() ? text.trim().split(/\s+/).length : 0)

/**
 * Pack one block's passage into ~150-220-word chunks without splitting a
 * sentence where avoidable. A single oversized sentence becomes its own chunk.
 */
function chunkPassage(text: string): string[] {
  const sentences = toSentences(text)
  if (sentences.length === 0) return []

  const chunks: string[] = []
  let current: string[] = []
  let currentWords = 0

  for (const sentence of sentences) {
    const w = wordCount(sentence)
    // If adding this sentence would overshoot and we already have a decent
    // chunk, flush first so we don't split mid-sentence to hit the cap.
    if (currentWords > 0 && currentWords + w > CHUNK_MAX_WORDS && currentWords >= CHUNK_MIN_WORDS) {
      chunks.push(current.join(' '))
      current = []
      currentWords = 0
    }
    current.push(sentence)
    currentWords += w
  }
  if (current.length) chunks.push(current.join(' '))
  return chunks
}

type PendingChunk = { heading: string; content: string; tokenCount: number }

/** Turn one published lesson into its ordered, ready-to-embed chunks. */
function buildLessonChunks(courseTitle: string, lesson: DbLesson): PendingChunk[] {
  const blocks = Array.isArray(lesson.blocks) ? lesson.blocks : []
  const out: PendingChunk[] = []

  for (const block of blocks) {
    const passage = blockToPassage(block)
    if (!passage) continue
    const heading = `${courseTitle} · ${lesson.title} · ${passage.label}`
    for (const content of chunkPassage(passage.text)) {
      if (!content.trim()) continue
      out.push({
        heading,
        content,
        tokenCount: Math.max(1, Math.round(wordCount(content) * TOKENS_PER_WORD)),
      })
    }
  }
  return out
}

type LessonStat = { courseSlug: string; lessonSlug: string; chunks: number }

async function ingestLesson(
  courseSlug: string,
  courseTitle: string,
  lesson: DbLesson,
): Promise<LessonStat> {
  const pending = buildLessonChunks(courseTitle, lesson)

  // Idempotent: drop this lesson's existing chunks before re-inserting.
  const { error: delError } = await sb
    .from('academy_kb_chunks')
    .delete()
    .eq('course_slug', courseSlug)
    .eq('lesson_slug', lesson.slug)
  if (delError) throw new Error(`delete ${courseSlug}/${lesson.slug}: ${delError.message}`)

  if (pending.length === 0) return { courseSlug, lessonSlug: lesson.slug, chunks: 0 }

  const rows: Array<{
    course_slug: string
    lesson_slug: string
    heading: string
    content: string
    embedding: string
    token_count: number
  }> = []

  for (const chunk of pending) {
    const embedding = await embedTextLocal(chunk.content)
    rows.push({
      course_slug: courseSlug,
      lesson_slug: lesson.slug,
      heading: chunk.heading,
      content: chunk.content,
      // pgvector accepts a JSON-array string like "[0.1,0.2,...]" on insert.
      embedding: vectorToSql(embedding.vector),
      token_count: chunk.tokenCount,
    })
  }

  const { error: insError } = await sb.from('academy_kb_chunks').insert(rows)
  if (insError) throw new Error(`insert ${courseSlug}/${lesson.slug}: ${insError.message}`)

  return { courseSlug, lessonSlug: lesson.slug, chunks: rows.length }
}

async function main() {
  const { data: courses, error: courseError } = await sb
    .from('academy_courses')
    .select('slug, title')
    .eq('status', 'published')
    .order('sort')
  if (courseError) throw courseError

  if (!courses?.length) {
    console.log('No published courses found — nothing to ingest.')
    process.exit(0)
  }

  console.log(
    `Ingesting academy KB · model=${LOCAL_EMBEDDING_MODEL} dims=${LOCAL_EMBEDDING_DIMENSIONS} · ${courses.length} course(s)\n`,
  )

  const stats: LessonStat[] = []
  let totalChunks = 0

  for (const course of courses) {
    const { data: lessons, error: lessonError } = await sb
      .from('academy_lessons')
      .select('slug, title, eyebrow, blocks')
      .eq('course_slug', course.slug)
      .eq('status', 'published')
      .order('module_sort')
      .order('sort')
    if (lessonError) throw lessonError

    let courseChunks = 0
    for (const lesson of (lessons ?? []) as DbLesson[]) {
      const stat = await ingestLesson(course.slug, course.title, lesson)
      stats.push(stat)
      courseChunks += stat.chunks
      totalChunks += stat.chunks
      console.log(`  ✓ ${course.slug}/${lesson.slug} → ${stat.chunks} chunk(s)`)
    }
    console.log(`✓ ${course.slug} — ${courseChunks} chunk(s) across ${lessons?.length ?? 0} lesson(s)\n`)
  }

  console.log(
    `✓ KB INGEST COMPLETE — ${totalChunks} chunk(s) across ${stats.length} lesson(s) in ${courses.length} course(s)`,
  )
  process.exit(0)
}

main().catch((err) => {
  console.error('ingest-kb failed:', err)
  process.exit(1)
})
