/**
 * Voice narration generator — turns every storyboard BEAT into an audio clip in
 * Jason's cloned voice, so the NarratedDiagram player can read the diagram aloud,
 * synced to the animation. Provider-agnostic core with a pluggable TTS adapter
 * (ElevenLabs by default). Idempotent + content-hashed: a beat whose text is
 * unchanged is never re-billed. Real durations are measured with ffprobe so the
 * player can swap the fixed beat timer for true audio-segment boundaries (C5).
 *
 * Setup (operator): set in .env.local — ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID
 * (from cloning Jason Voice.aiff). Then:
 *   node --env-file=.env.local scripts/academy/voice/generate-narration.mjs <courseSlug> [--limit N] [--apply]
 * Without --apply it's a DRY RUN (counts beats + chars + cost, generates nothing).
 * Audio → public/academy/voice/<course>/<lesson>__b<idx>.mp3 ; manifest alongside.
 */
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const [courseSlug, ...rest] = process.argv.slice(2)
if (!courseSlug) { console.error('usage: generate-narration.mjs <courseSlug> [--limit N] [--apply]'); process.exit(2) }
const APPLY = rest.includes('--apply')
const LIMIT = rest.includes('--limit') ? Number(rest[rest.indexOf('--limit') + 1]) : Infinity

const OUT_DIR = join('public/academy/voice', courseSlug)
const MANIFEST = join(OUT_DIR, 'manifest.json')
const TTS_MODEL = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2'

// ── TTS adapter (ElevenLabs). Swap this one function for any provider. ────────
async function synthesize(text) {
  const key = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ELEVENLABS_VOICE_ID
  if (!key || !voiceId) throw new Error('ELEVENLABS_API_KEY / ELEVENLABS_VOICE_ID not set in .env.local')
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: TTS_MODEL,
      // Tuned for calm, clear narration; adjust after the pilot.
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true },
    }),
  })
  if (!res.ok) throw new Error(`TTS ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return Buffer.from(await res.arrayBuffer())
}

// Real audio duration in ms (so the player syncs to the voice, not a guessed timer).
function durationMs(path) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], { encoding: 'utf8' })
  const sec = parseFloat((r.stdout || '').trim())
  return Number.isFinite(sec) ? Math.round(sec * 1000) : null
}

// ── collect beats from the live course ────────────────────────────────────────
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const { data: lessons, error } = await sb
  .from('academy_lessons')
  .select('slug, blocks')
  .eq('course_slug', courseSlug)
  .order('module_sort', { ascending: true })
  .order('sort', { ascending: true })
if (error) { console.error('query failed: ' + error.message); process.exit(1) }

const beats = []
for (const l of lessons ?? []) {
  const diagram = (l.blocks ?? []).find((b) => b.type === 'diagram' && Array.isArray(b.storyboard) && b.storyboard.length)
  if (!diagram) continue
  diagram.storyboard.forEach((beat, i) => {
    if (typeof beat.say === 'string' && beat.say.trim()) beats.push({ lesson: l.slug, idx: i, say: beat.say.trim() })
  })
}

const totalChars = beats.reduce((n, b) => n + b.say.length, 0)
console.log(`${courseSlug}: ${lessons?.length ?? 0} lessons · ${beats.length} beats · ${totalChars} characters`)
console.log(`estimated cost: ~${totalChars} credits (${(totalChars / 1000).toFixed(1)}k) at the provider's per-char rate`)

if (!APPLY) {
  console.log('\nDRY RUN — no audio generated, nothing billed. Re-run with --apply once the key + voice_id are set.')
  process.exit(0)
}

// ── generate (idempotent, content-hashed, throttled) ─────────────────────────
mkdirSync(OUT_DIR, { recursive: true })
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}
let made = 0, skipped = 0, done = 0
for (const b of beats) {
  if (done >= LIMIT) break
  done++
  const hash = createHash('sha1').update(b.say).digest('hex').slice(0, 10)
  const key = `${b.lesson}__b${b.idx}`
  const file = join(OUT_DIR, `${key}.mp3`)
  if (manifest[key]?.hash === hash && existsSync(file)) { skipped++; continue }
  const audio = await synthesize(b.say)
  writeFileSync(file, audio)
  manifest[key] = { hash, ms: durationMs(file), chars: b.say.length, path: `/academy/voice/${courseSlug}/${key}.mp3` }
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2))
  made++
  if (made % 10 === 0) console.log(`  ${made} generated…`)
  await new Promise((r) => setTimeout(r, 250)) // gentle throttle
}
console.log(`\nDONE — ${made} generated, ${skipped} cached-skip · manifest: ${MANIFEST}`)
console.log('Next: wire the manifest into NarratedDiagram (per-beat audio + real ms) and apply.')
