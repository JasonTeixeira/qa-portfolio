/**
 * Apply generated narration to LIVE lessons — for courses with no on-disk authoring
 * bundle (the career-* tracks live only in Supabase). Uploads the course's mp3s to
 * Supabase Storage (public bucket academy-voice) and bakes beat.audio (storage URL)
 * + real beat.ms into the live academy_lessons.blocks storyboards. Additive + keyed:
 * only beats with a manifest entry are touched; re-runnable (upsert).
 *
 *   node --env-file=.env.local scripts/academy/voice/apply-audio-live.mjs <course>
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const courseSlug = process.argv[2]
if (!courseSlug) { console.error('usage: apply-audio-live.mjs <course>'); process.exit(1) }

const BUCKET = 'academy-voice'
const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}`
const DIR = join('public/academy/voice', courseSlug)
const MANIFEST = join(DIR, 'manifest.json')
if (!existsSync(MANIFEST)) { console.error(`no manifest at ${MANIFEST} — generate narration first`); process.exit(1) }

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'))
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// 1. upload every mp3 for this course (upsert = idempotent)
let up = 0, upFail = 0
for (const f of readdirSync(DIR).filter((n) => n.endsWith('.mp3'))) {
  const { error } = await sb.storage.from(BUCKET).upload(`${courseSlug}/${f}`, readFileSync(join(DIR, f)), { contentType: 'audio/mpeg', upsert: true })
  if (error) { upFail++; console.error('  upload fail', f, error.message) } else up++
}
console.log(`uploaded ${up} clips (${upFail} failed) → ${BASE}/${courseSlug}/`)

// 2. bake audio URL + ms into the live storyboard beats
const { data: lessons, error } = await sb.from('academy_lessons').select('id,slug,blocks').eq('course_slug', courseSlug)
if (error) { console.error('supabase:', error.message); process.exit(1) }

let lessonsTouched = 0, beatsWired = 0
for (const l of lessons ?? []) {
  const blocks = l.blocks ?? []
  let changed = false
  for (const b of blocks) {
    if (b.type !== 'diagram' || !Array.isArray(b.storyboard)) continue
    b.storyboard.forEach((beat, i) => {
      const m = manifest[`${l.slug}__b${i}`]
      if (!m) return
      const url = `${BASE}/${courseSlug}/${l.slug}__b${i}.mp3`
      if (beat.audio !== url || (m.ms && beat.ms !== m.ms)) {
        beat.audio = url
        if (m.ms) beat.ms = m.ms
        changed = true
        beatsWired++
      }
    })
  }
  if (changed) {
    const { error: uerr } = await sb.from('academy_lessons').update({ blocks }).eq('id', l.id)
    if (uerr) { console.error(`  update fail ${l.slug}: ${uerr.message}`); process.exit(1) }
    lessonsTouched++
  }
}

// 3. verify what's actually live now
const { data: check } = await sb.from('academy_lessons').select('blocks').eq('course_slug', courseSlug)
let liveAudio = 0
for (const l of check ?? []) liveAudio += (JSON.stringify(l.blocks).match(/"audio":/g) || []).length
console.log(`DONE — ${lessonsTouched} lessons updated · ${beatsWired} beats wired · live audio refs now: ${liveAudio}`)
