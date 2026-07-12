/**
 * Bake generated narration audio onto a course's storyboard beats: for each beat
 * it writes `audio` (public URL) and updates `ms` to the REAL clip duration, so the
 * NarratedDiagram player advances in lockstep with Jason's voice. Reads the manifest
 * from generate-narration.mjs; writes the authoring JSON. Then apply-course persists.
 *   node scripts/academy/voice/apply-audio.mjs <courseSlug>
 *   → then: npx tsx --env-file=.env.local scripts/academy/authoring/apply-course.ts <courseSlug> --apply
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const [courseSlug] = process.argv.slice(2)
if (!courseSlug) { console.error('usage: apply-audio.mjs <courseSlug>'); process.exit(2) }

const manifestPath = join('public/academy/voice', courseSlug, 'manifest.json')
const jsonPath = join('data/academy/authoring', `${courseSlug}.lessons.json`)
if (!existsSync(manifestPath)) { console.error(`no manifest: ${manifestPath} — run generate-narration first`); process.exit(1) }
if (!existsSync(jsonPath)) { console.error(`no authoring JSON: ${jsonPath}`); process.exit(1) }

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const lessons = JSON.parse(readFileSync(jsonPath, 'utf8'))

let baked = 0, misses = 0
for (const [slug, blocks] of Object.entries(lessons)) {
  const diagram = blocks.find((b) => b.type === 'diagram' && Array.isArray(b.storyboard) && b.storyboard.length)
  if (!diagram) continue
  diagram.storyboard.forEach((beat, i) => {
    const m = manifest[`${slug}__b${i}`]
    if (m?.path) { beat.audio = m.path; if (m.ms) beat.ms = m.ms; baked++ } else misses++
  })
}

writeFileSync(jsonPath, JSON.stringify(lessons, null, 2))
console.log(`baked audio onto ${baked} beats (${misses} without audio) → ${jsonPath}`)
console.log(`next: npx tsx --env-file=.env.local scripts/academy/authoring/apply-course.ts ${courseSlug} --apply`)
