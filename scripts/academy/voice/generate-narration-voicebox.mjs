/**
 * Voice narration via LOCAL VoiceBox (Chatterbox-turbo) — $0 drop-in replacement for the
 * ElevenLabs generate-narration.mjs. Renders every storyboard beat in Jason's cloned
 * academy voice profile through the local VoiceBox backend (:17493). Idempotent +
 * content-hashed; real durations via ffprobe. Output is IDENTICAL to the ElevenLabs
 * script (public/academy/voice/<course>/<lesson>__b<idx>.mp3 + manifest.json), so
 * apply-audio.mjs + migrate-to-storage.mjs work unchanged.
 *
 *   node --env-file=.env.local scripts/academy/voice/generate-narration-voicebox.mjs <course> [--apply] [--limit N]
 *
 * Requires the VoiceBox backend running (cd ~/github/voicebox && backend/venv/bin/python
 * -m uvicorn backend.main:app --port 17493) with the academy voice profile present.
 */
import { createHash } from 'node:crypto'
import { mkdirSync, existsSync, writeFileSync, readFileSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const VOICEBOX_URL = process.env.VOICEBOX_URL || 'http://localhost:17493'
const VOICEBOX_DATA = process.env.VOICEBOX_DATA || '/Users/Sage/github/voicebox/data'
const PROFILE_ID = process.env.VOICEBOX_PROFILE_ID || 'ea0800c0-3bfb-4b52-bc68-ae90a212994d'
const ENGINE = process.env.VOICEBOX_ENGINE || 'chatterbox_turbo'

const [courseSlug, ...rest] = process.argv.slice(2)
const APPLY = rest.includes('--apply')
const LIMIT = rest.includes('--limit') ? Number(rest[rest.indexOf('--limit') + 1]) : Infinity
if (!courseSlug) { console.error('usage: generate-narration-voicebox.mjs <course> [--apply] [--limit N]'); process.exit(1) }

const OUT_DIR = join('public/academy/voice', courseSlug)
const MANIFEST = join(OUT_DIR, 'manifest.json')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

function durationMs(path) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], { encoding: 'utf8' })
  const s = parseFloat((r.stdout || '').trim())
  return Number.isFinite(s) ? Math.round(s * 1000) : null
}

// POST the beat text → poll for the rendered wav to appear + stabilize → transcode to mp3.
// (No GET-by-id endpoint; the wav landing in data/generations is the completion signal.)
async function synthesize(text) {
  const r = await fetch(`${VOICEBOX_URL}/generate`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ profile_id: PROFILE_ID, text, engine: ENGINE, language: 'en' }),
  })
  if (!r.ok) throw new Error(`voicebox ${r.status}: ${(await r.text()).slice(0, 140)}`)
  const gen = await r.json()
  const wav = join(VOICEBOX_DATA, 'generations', `${gen.id}.wav`)
  let lastSize = -1, stable = 0
  for (let i = 0; i < 120; i++) { // up to ~4min (first render cold-loads the model)
    if (existsSync(wav)) {
      const sz = statSync(wav).size
      if (sz > 0 && sz === lastSize) { if (++stable >= 2) break } else stable = 0
      lastSize = sz
    }
    await new Promise((res) => setTimeout(res, 2000))
  }
  if (!existsSync(wav) || statSync(wav).size === 0) throw new Error(`no wav after timeout (id ${gen.id})`)
  const mp3 = wav.replace(/\.wav$/, '.mp3')
  spawnSync('ffmpeg', ['-y', '-i', wav, '-codec:a', 'libmp3lame', '-q:a', '4', mp3], { encoding: 'utf8' })
  if (!existsSync(mp3)) throw new Error('ffmpeg wav→mp3 failed')
  return readFileSync(mp3)
}

// ── collect beats from the live course (identical selection to the EL script) ──
const { data: lessons, error } = await sb
  .from('academy_lessons').select('slug, blocks')
  .eq('course_slug', courseSlug).eq('status', 'published').order('module_sort').order('sort')
if (error) { console.error('supabase:', error.message); process.exit(1) }

const beats = []
for (const l of lessons ?? []) {
  const diagram = (l.blocks ?? []).find((b) => b.type === 'diagram' && Array.isArray(b.storyboard) && b.storyboard.length)
  if (!diagram) continue
  diagram.storyboard.forEach((beat, i) => {
    if (typeof beat.say === 'string' && beat.say.trim()) beats.push({ lesson: l.slug, idx: i, say: beat.say.trim() })
  })
}
console.log(`${courseSlug}: ${lessons?.length ?? 0} lessons · ${beats.length} beats · VoiceBox $0 (profile ${PROFILE_ID.slice(0, 8)}, ${ENGINE})`)
if (beats.length === 0) { console.log('No storyboard beats — this course needs storyboards generated first.'); process.exit(0) }
if (!APPLY) { console.log('DRY RUN — re-run with --apply to render.'); process.exit(0) }

// ── render (idempotent, content-hashed) ──────────────────────────────────────
mkdirSync(OUT_DIR, { recursive: true })
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}
let made = 0, skipped = 0, failed = 0
for (const b of beats) {
  if (made >= LIMIT) break
  const key = `${b.lesson}__b${b.idx}`
  const hash = createHash('sha1').update(b.say).digest('hex').slice(0, 10)
  const file = join(OUT_DIR, `${key}.mp3`)
  // Engine-aware skip: only skip when ALREADY rendered by VoiceBox with matching text —
  // so prior ElevenLabs clips get re-rendered in Jason's VoiceBox voice.
  if (manifest[key]?.hash === hash && manifest[key]?.engine === `voicebox:${ENGINE}` && existsSync(file)) { skipped++; continue }
  try {
    writeFileSync(file, await synthesize(b.say))
    manifest[key] = { hash, ms: durationMs(file), chars: b.say.length, path: `/academy/voice/${courseSlug}/${key}.mp3`, engine: `voicebox:${ENGINE}` }
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2))
    made++
    process.stdout.write(`  ✓ ${key} (${manifest[key].ms}ms)\n`)
  } catch (e) { failed++; console.error(`  ✗ ${key}: ${e.message}`) }
}
console.log(`\nDONE — ${made} rendered, ${skipped} cached-skip, ${failed} failed · manifest: ${MANIFEST}`)
console.log('Next: apply-audio.mjs → apply-course → migrate-to-storage (unchanged pipeline).')
