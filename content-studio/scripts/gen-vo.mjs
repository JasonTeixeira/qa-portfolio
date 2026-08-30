// Generate the RAG flagship narration in Jason's Sage voice (ElevenLabs), per scene.
// Run: node scripts/gen-vo.mjs
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
// load key from repo .env.local
let KEY = process.env.ELEVENLABS_API_KEY
try {
  for (const line of fs.readFileSync(path.join(root, '..', '.env.local'), 'utf8').split('\n')) {
    const m = line.match(/^ELEVENLABS_API_KEY=(.*)$/)
    if (m) KEY = m[1].replace(/^["']|["']$/g, '')
  }
} catch {}
if (!KEY) { console.error('no ELEVENLABS_API_KEY'); process.exit(1) }

const VOICE = 'MJdPGZVWOz3O2iOT7cx5' // Jason — Sage narration
const outDir = path.join(root, 'renders', 'vo')
fs.mkdirSync(outDir, { recursive: true })

// One entry per scene of scripts/rag-flagship.md
const scenes = [
  ['01-hook', "Ask a language model about your own documents, and it'll do something dangerous. It answers confidently, and makes it up. Watch."],
  ['02-hook2', "There's no refund policy in its training data. It guessed. In production, that's how you ship a lie. RAG is how you fix it. And the part everyone skips is teaching it to say: I don't know."],
  ['03-frame', "RAG is two moves. Retrieve the passages that are actually relevant. Then answer using only those, and cite them. That's it. The model stops guessing because you handed it the source."],
  ['04-retrieve', "We split the docs into chunks, embed them, and for any question we pull the four closest passages. No magic. It's nearest-neighbor search over meaning."],
  ['05-answer', "Now we hand those passages to the model and ask it to answer from them, with a citation. Same question. Now it's right, and it shows its source."],
  ['06-abstain', "But here's the trap. Ask something the docs don't cover, and a naive RAG still makes something up. Because we never told it it's allowed to refuse."],
  ['07-abstain2', "One instruction. One guardrail. If the context doesn't contain the answer, don't answer. Now it refuses instead of lying. That single behavior is the difference between a demo and something you'd put in front of a customer."],
  ['08-prove', "And we don't take its word for it. A faithfulness check scores every answer against its sources. Is each claim actually supported? Green means grounded. That's the proof. Not 'seems better.' A number you can gate a deploy on."],
  ['09-close', "Retrieve. Answer from the source. Refuse when you can't. And verify it's grounded. That's RAG that survives production. You can build this exact thing, free, right in your browser, at sageideas dot dev slash academy. Proof, not paper. I'll see you in the next one."],
]

const body = (text) => JSON.stringify({
  text,
  model_id: 'eleven_multilingual_v2',
  voice_settings: { stability: 0.45, similarity_boost: 0.85, style: 0.0, use_speaker_boost: true },
})

let total = 0
for (const [name, text] of scenes) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
    body: body(text),
  })
  if (!res.ok) { console.error(`${name}: HTTP ${res.status} ${(await res.text()).slice(0, 120)}`); continue }
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(path.join(outDir, `${name}.mp3`), buf)
  total += buf.length
  console.log(`  ✓ ${name}.mp3  ${(buf.length / 1024).toFixed(0)}KB`)
}
console.log(`done — ${scenes.length} clips, ${(total / 1024 / 1024).toFixed(2)}MB in renders/vo/`)
