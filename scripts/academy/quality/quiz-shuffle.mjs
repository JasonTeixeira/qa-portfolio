/**
 * Deterministic answer-position re-shuffle for live quizzes.
 *
 * RUN THIS AFTER the distractor rewrite — never before. A shuffle cannot fix a LENGTH tell:
 * if the correct option is 3x longer, moving it just relocates the giveaway (exactly what the
 * previous "position-shuffle" pass did — index moved, 98.3% longest-wins survived).
 *
 *   node --env-file=.env.local scripts/academy/quality/quiz-shuffle.mjs [--course <slug>] [--apply]
 *
 * Seeded per (course, lesson, question) so it is reproducible and stable across re-applies:
 * re-running never re-randomizes an already-shuffled quiz into a different order.
 * Dry-run by default.
 */
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'

const args = process.argv.slice(2)
const only = args.includes('--course') ? args[args.indexOf('--course') + 1] : null
const APPLY = args.includes('--apply')

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

/** Deterministic PRNG from a seed string (mulberry32 over a sha1 slice). */
function rngFor(seed) {
  let a = parseInt(createHash('sha1').update(seed).digest('hex').slice(0, 8), 16)
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Seeded Fisher-Yates producing a permutation of 0..n-1. */
function permutation(n, seed) {
  const rnd = rngFor(seed)
  const p = [...Array(n).keys()]
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[p[i], p[j]] = [p[j], p[i]]
  }
  return p
}

const q = sb.from('academy_lessons').select('id,course_slug,slug,blocks').eq('status', 'published')
const { data: lessons, error } = only ? await q.eq('course_slug', only) : await q
if (error) { console.error('supabase:', error.message); process.exit(1) }

let touchedLessons = 0, shuffled = 0, skipped = 0
const idxAfter = {}

for (const l of lessons ?? []) {
  const blocks = l.blocks ?? []
  let changed = false
  for (const b of blocks) {
    if (b.type !== 'quiz' || !Array.isArray(b.options) || typeof b.answer !== 'number') continue
    if (b.answer < 0 || b.answer >= b.options.length) { skipped++; continue }
    const n = b.options.length
    const perm = permutation(n, `${l.course_slug}|${l.slug}|${String(b.question ?? '').slice(0, 120)}`)
    // perm[newIndex] = oldIndex
    const newOptions = perm.map((oldI) => b.options[oldI])
    const newAnswer = perm.indexOf(b.answer)
    const correctText = b.options[b.answer]
    if (newOptions[newAnswer] !== correctText) { console.error(`FATAL remap mismatch ${l.course_slug}/${l.slug}`); process.exit(1) }
    if (newAnswer !== b.answer || newOptions.some((o, i) => o !== b.options[i])) {
      b.options = newOptions
      b.answer = newAnswer
      changed = true
      shuffled++
    }
    idxAfter[b.answer] = (idxAfter[b.answer] || 0) + 1
  }
  if (changed) {
    touchedLessons++
    if (APPLY) {
      const { error: uerr } = await sb.from('academy_lessons').update({ blocks }).eq('id', l.id)
      if (uerr) { console.error(`update fail ${l.course_slug}/${l.slug}: ${uerr.message}`); process.exit(1) }
    }
  }
}

console.log(`${APPLY ? 'APPLIED' : 'DRY RUN'} — ${shuffled} quizzes re-shuffled across ${touchedLessons} lessons${skipped ? ` · ${skipped} skipped (bad answer index)` : ''}`)
console.log(`answer-index distribution after: ${JSON.stringify(idxAfter)}`)
if (!APPLY) console.log('re-run with --apply to write. THEN: node --env-file=.env.local scripts/academy/quality/quiz-integrity.mjs')
