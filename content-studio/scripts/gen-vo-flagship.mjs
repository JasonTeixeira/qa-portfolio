// gen-vo-flagship.mjs — flagship RAG narration (22 beats) in Jason's voice WITH
// word timestamps. -> renders/vo-flagship/*.mp3 + words.json. Run: node scripts/gen-vo-flagship.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
let KEY = process.env.ELEVENLABS_API_KEY;
try { for (const line of fs.readFileSync(path.join(root, '..', '.env.local'), 'utf8').split('\n')) { const m = line.match(/^ELEVENLABS_API_KEY=(.*)$/); if (m) KEY = m[1].replace(/^["']|["']$/g, ''); } } catch {}
if (!KEY) { console.error('no ELEVENLABS_API_KEY'); process.exit(1); }
const VOICE = 'MJdPGZVWOz3O2iOT7cx5';
const outDir = path.join(root, 'renders', 'vo-flagship');
fs.mkdirSync(outDir, { recursive: true });

const scenes = [
  ['01', "I once shipped a chatbot to production. Three days in, it told a customer we had a thirty-day refund policy. Confident. Clean. We had never had one."],
  ['02', "It didn't malfunction. It did the most human thing there is — it didn't know, so it filled the silence. And your AI is one line of code away from the exact same bug."],
  ['03', "In a demo, that's cute. In production, it's a lie told to a paying customer — in the exact same confident voice it uses for the truth."],
  ['04', "Most people reach for a bigger, smarter model. That's the trap. A bigger brain doesn't lie less — it lies more convincingly. This was never a knowledge problem. It's an honesty problem."],
  ['05', "So here's the shift. Stop asking the model what it knows. Hand it the source, and make it answer from that. It's the difference between a closed-book exam and an open-book one."],
  ['06', "That's RAG. Retrieval-augmented generation. Fancy name, simple move: fetch the right page first, then answer from it — and cite it. Two moves. Let's build both."],
  ['07', "First, retrieval. You can't hand the model your whole library, so you slice the docs into chunks — small, self-contained passages."],
  ['08', "Each chunk becomes a vector — a list of numbers that captures its meaning. Close in meaning, close in space."],
  ['09', "The question becomes a vector too. Then you grab the handful of chunks sitting nearest it — nearest-neighbor search. The top few. Top-k."],
  ['10', "Now you staple those passages to the question and tell the model, in plain words: answer using only this — and cite it."],
  ['11', "Same refund question. But now it's holding the actual policy page. And look — it's right. And it points at the exact line it used."],
  ['12', "Most tutorials stop right here. Retrieve, answer, done. That's the easy half — and it's exactly why their demos dazzle and their production quietly lies."],
  ['13', "Because ask it something your docs don't cover, and a naive RAG still invents an answer. Retrieval comes back empty — and it answers anyway."],
  ['14', "The fix is one line. If the answer isn't in the retrieved context — don't answer. Just say: that's not in the documents."],
  ['15', "An AI that will look you in the eye and admit it doesn't know? That is the whole difference between a demo and something you'd put in front of a real customer."],
  ['16', "Which raises the uncomfortable question: how do you know it's grounded? You don't take its word for it."],
  ['17', "You run a faithfulness check. Every claim in the answer gets traced back to a source passage. Supported, it's green. Unsupported — a red flag you can catch before your customer does."],
  ['18', "Now, is it any good stops being a vibe and becomes a number — one you can set a threshold on and gate a deploy behind."],
  ['19', "Two things quietly wreck RAG. First, bad chunks. Split a thought down the middle, and retrieval hands the model half an idea."],
  ['20', "Second — nearest isn't always most relevant. So you re-rank the top hits, and you keep measuring. Distance is a guess; the eval is the truth."],
  ['21', "So, the whole thing — four moves. Retrieve the page. Answer from it. Refuse when you can't. Verify it's grounded."],
  ['22', "Answer from the source — or don't answer. That's RAG that survives production. You can build this exact system, free, in your browser, at sageideas dot dev slash academy. And I'm curious — what's the worst hallucination you've ever shipped? Tell me below. Proof, not paper. I'll see you in the next one."],
];

const wordsOut = {};
let ok = 0;
for (const [name, text] of scenes) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps`, {
    method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.45, similarity_boost: 0.85, style: 0.0, use_speaker_boost: true } }),
  });
  if (!res.ok) { console.error(`${name}: HTTP ${res.status} ${(await res.text()).slice(0, 140)}`); continue; }
  const j = await res.json();
  fs.writeFileSync(path.join(outDir, `${name}.mp3`), Buffer.from(j.audio_base64, 'base64'));
  const a = j.alignment || j.normalized_alignment, chars = a.characters, st = a.character_start_times_seconds, en = a.character_end_times_seconds;
  const words = []; let cur = '', s = null, e = null;
  for (let i = 0; i < chars.length; i++) { const c = chars[i]; if (c === ' ' || c === '\n') { if (cur) { words.push({ w: cur, start: +s.toFixed(3), end: +e.toFixed(3) }); cur = ''; s = null; } continue; } if (s === null) s = st[i]; e = en[i]; cur += c; }
  if (cur) words.push({ w: cur, start: +s.toFixed(3), end: +e.toFixed(3) });
  wordsOut[name] = { dur: +en[en.length - 1].toFixed(3), words };
  ok++; console.log(`  ✓ ${name}  ${wordsOut[name].dur}s  ${words.length}w`);
}
fs.writeFileSync(path.join(outDir, 'words.json'), JSON.stringify(wordsOut));
console.log(`done — ${ok}/${scenes.length} clips`);
