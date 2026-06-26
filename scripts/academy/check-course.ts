/**
 * Automated CONTENT GATE for the academy ingestion loop.
 *
 *   tsx --env-file=.env.local scripts/academy/check-course.ts <course-slug>
 *   tsx --env-file=.env.local scripts/academy/check-course.ts --all
 *
 * Validates a seeded course against three layers — with NO theater. It reuses the
 * app's own REQUIRED_SECTIONS so the completeness check can never drift from what
 * the lesson player renders:
 *   1. Block-schema validity  — every block has a known type + its required fields.
 *   2. Sprint completeness     — all REQUIRED_SECTIONS for the lesson's intensity.
 *   3. Polish gates (8)        — the mastery-system quality gates mapped to blocks.
 *   + Course assessment        — pretest/posttest present, well-formed, scorable.
 *
 * Exits non-zero on any failure so the loop's gate is a real stop.
 */

import { createClient } from '@supabase/supabase-js'
import { REQUIRED_SECTIONS, type SprintIntensity } from '../../lib/academy/engine'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (load .env.local).')
  process.exit(1)
}
const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

const VALID_TOPICS = new Set(['foundations', 'ai-engineering', 'ship-it', 'growth', 'data', 'engineering'])

// Required non-empty fields per block type (mirrors the LessonBlock union shapes).
const REQUIRED_FIELDS: Record<string, string[]> = {
  'sprint-contract': ['outcome', 'intensity', 'time', 'proof', 'unlock'],
  mission: ['text'],
  context: ['text'],
  pretest: ['prompt', 'reveal'],
  'worked-example': ['intro', 'steps', 'commonMistake'],
  concept: ['text'],
  lab: ['title', 'summary'],
  debug: ['symptom', 'brokenCode', 'task', 'fix'],
  tradeoff: ['question', 'optionA', 'optionB', 'guidance'],
  verification: ['items'],
  quiz: ['question', 'options', 'answer'],
  teachback: ['prompts'],
  calibration: ['artifact', 'weak', 'passing', 'excellent'],
  transfer: ['text'],
  'spaced-review': [],
  'unlock-gate': ['criteria'],
  prose: ['text'],
  code: ['language', 'code'],
  video: ['title'],
  callout: ['tone', 'text'],
}

function isEmpty(v: unknown): boolean {
  if (v === undefined || v === null) return true
  if (typeof v === 'string') return v.trim() === ''
  if (Array.isArray(v)) return v.length === 0
  if (typeof v === 'object') return Object.keys(v).length === 0
  return false
}

/** The mastery system's 8 polish gates, expressed as block-presence requirements. */
function polishGateFailures(types: Set<string>, intensity: string): string[] {
  const f: string[] = []
  if (!types.has('mission')) f.push('Gate 1 scenario-grounding: missing `mission`')
  if (!types.has('debug')) f.push('Gate 2 failure-awareness: missing `debug` (broken case)')
  if (!types.has('lab') && !types.has('verification')) f.push('Gate 3 implementation-proof: missing `lab`/`verification`')
  if (!types.has('verification')) f.push('Gate 3 verification: missing `verification` checklist')
  if (!types.has('teachback')) f.push('Gate 4 socratic-pressure: missing `teachback`')
  if (!types.has('spaced-review') || !(types.has('quiz') || types.has('pretest')))
    f.push('Gate 5 retrieval+spacing: need `spaced-review` + a `quiz`/`pretest`')
  if (intensity !== 'micro' && !types.has('tradeoff')) f.push('Gate 6 senior-judgment: missing `tradeoff`')
  return f
}

function validQuestion(q: unknown): boolean {
  if (!q || typeof q !== 'object') return false
  const r = q as Record<string, unknown>
  return (
    typeof r.prompt === 'string' &&
    r.prompt.trim() !== '' &&
    Array.isArray(r.options) &&
    r.options.length >= 2 &&
    typeof r.answer === 'number' &&
    r.answer >= 0 &&
    r.answer < r.options.length
  )
}

interface LessonReport {
  slug: string
  title: string
  intensity: string
  failures: string[]
}

async function checkCourse(slug: string): Promise<{ failures: string[]; lessons: LessonReport[] }> {
  const failures: string[] = []
  const { data: course } = await sb.from('academy_courses').select('*').eq('slug', slug).maybeSingle()
  if (!course) return { failures: [`course "${slug}" not found`], lessons: [] }

  if (!VALID_TOPICS.has(course.topic)) failures.push(`invalid topic "${course.topic}"`)
  if (!['Beginner', 'Intermediate', 'Advanced'].includes(course.level)) failures.push(`invalid level "${course.level}"`)

  const pre = Array.isArray(course.pretest) ? course.pretest : []
  const post = Array.isArray(course.posttest) ? course.posttest : []
  if (pre.length < 3) failures.push(`pretest has ${pre.length} questions (need ≥3)`)
  if (post.length < 3) failures.push(`posttest has ${post.length} questions (need ≥3)`)
  pre.forEach((q: unknown, i: number) => { if (!validQuestion(q)) failures.push(`pretest[${i}] malformed`) })
  post.forEach((q: unknown, i: number) => { if (!validQuestion(q)) failures.push(`posttest[${i}] malformed`) })

  const { data: lessons } = await sb
    .from('academy_lessons')
    .select('slug, title, intensity, status, blocks')
    .eq('course_slug', slug)
    .eq('status', 'published')
  const reports: LessonReport[] = []

  for (const lesson of lessons ?? []) {
    const lf: string[] = []
    const blocks = Array.isArray(lesson.blocks) ? lesson.blocks : []
    if (blocks.length === 0) lf.push('no blocks')

    const types = new Set<string>()
    blocks.forEach((b: unknown, i: number) => {
      if (!b || typeof b !== 'object') return lf.push(`block[${i}] not an object`)
      const rec = b as Record<string, unknown>
      const t = rec.type as string
      if (!t || !(t in REQUIRED_FIELDS)) return lf.push(`block[${i}] unknown type "${t}"`)
      types.add(t)
      for (const field of REQUIRED_FIELDS[t]) {
        if (isEmpty(rec[field])) lf.push(`block[${i}] (${t}) missing/empty field "${field}"`)
      }
      if (t === 'lab') {
        if (isEmpty(rec.starter)) lf.push(`block[${i}] (lab) missing starter code`)
        if (isEmpty(rec.check)) lf.push(`block[${i}] (lab) missing checkpoint \`check\``)
      }
      if (t === 'quiz' && Array.isArray(rec.options) && typeof rec.answer === 'number') {
        if (rec.answer < 0 || rec.answer >= rec.options.length) lf.push(`block[${i}] (quiz) answer out of range`)
      }
    })

    // Sprint completeness — same source of truth the player uses.
    const required = REQUIRED_SECTIONS[(lesson.intensity as SprintIntensity) ?? 'standard'] ?? []
    const missing = required.filter((s) => !types.has(s))
    if (missing.length) lf.push(`incomplete ${lesson.intensity} sprint — missing: ${missing.join(', ')}`)

    // Polish gates.
    lf.push(...polishGateFailures(types, lesson.intensity as string))

    reports.push({ slug: lesson.slug, title: lesson.title, intensity: lesson.intensity, failures: lf })
  }

  return { failures, lessons: reports }
}

async function main() {
  const arg = process.argv[2]
  let slugs: string[]
  if (arg === '--all') {
    const { data } = await sb.from('academy_courses').select('slug').eq('status', 'published')
    slugs = (data ?? []).map((c) => c.slug as string)
  } else if (arg) {
    slugs = [arg]
  } else {
    console.error('usage: check-course.ts <course-slug> | --all')
    process.exit(1)
  }

  let totalFail = 0
  for (const slug of slugs) {
    const { failures, lessons } = await checkCourse(slug)
    const lessonFails = lessons.reduce((n, l) => n + l.failures.length, 0)
    const ok = failures.length === 0 && lessonFails === 0
    console.log(`\n${ok ? '✓' : '✗'} ${slug}  (${lessons.length} lesson${lessons.length === 1 ? '' : 's'})`)
    failures.forEach((m) => console.log(`   course: ${m}`))
    for (const l of lessons) {
      if (l.failures.length === 0) console.log(`   ✓ ${l.slug} (${l.intensity})`)
      else {
        console.log(`   ✗ ${l.slug} (${l.intensity})`)
        l.failures.forEach((m) => console.log(`       - ${m}`))
      }
    }
    totalFail += failures.length + lessonFails
  }

  console.log(`\n${totalFail === 0 ? '✓ CONTENT GATE PASS' : `✗ CONTENT GATE FAIL — ${totalFail} issue(s)`}`)
  process.exit(totalFail === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error('check-course failed:', err)
  process.exit(1)
})
