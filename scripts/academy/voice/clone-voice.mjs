/**
 * Clone Jason's voice into ElevenLabs (Instant Voice Cloning) from a reference wav.
 * Prints the voice_id — add it to .env.local as ELEVENLABS_VOICE_ID.
 * Usage: node --env-file=.env.local scripts/academy/voice/clone-voice.mjs <ref.wav> ["Voice Name"]
 */
import { readFileSync } from 'node:fs'

const key = process.env.ELEVENLABS_API_KEY
if (!key) { console.error('ELEVENLABS_API_KEY not set'); process.exit(2) }
const refPath = process.argv[2] || '.voice-work/jason-ref-120s.wav'
const name = process.argv[3] || 'Jason — Sage narration'

const buf = readFileSync(refPath)
const fd = new FormData()
fd.append('name', name)
fd.append('files', new Blob([buf], { type: 'audio/wav' }), 'jason.wav')
fd.append('description', 'Sage Academy diagram narration — founder voice, calm and clear.')

const r = await fetch('https://api.elevenlabs.io/v1/voices/add', {
  method: 'POST',
  headers: { 'xi-api-key': key },
  body: fd,
})
if (!r.ok) { console.error('clone failed:', r.status, (await r.text()).slice(0, 300)); process.exit(1) }
const d = await r.json()
console.log('VOICE_ID=' + d.voice_id)
