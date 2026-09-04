// Build styles-board.html: 25 completely different thumbnail STYLES for direction-picking.
// Run: node scripts/build-styles-board.mjs
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const tmp = '/tmp/sb'; fs.mkdirSync(tmp, { recursive: true })
const uri = (file, max = 820) => {
  const src = path.join(root, 'renders/thumbs2', file)
  if (!fs.existsSync(src)) return null
  const out = path.join(tmp, file.replace(/\.png$/, '.jpg'))
  execSync(`sips -Z ${max} -s format jpeg ${JSON.stringify(src)} --out ${JSON.stringify(out)}`, { stdio: 'ignore' })
  return `data:image/jpeg;base64,${fs.readFileSync(out).toString('base64')}`
}

// [file, style, topic]
const S = [
  ['s01.png', 'Flat vector illustration', 'AI Agents'],
  ['s02.png', 'Playful glossy 3D', 'What is RAG'],
  ['s03.png', 'Neo-brutalist', 'AI Evals'],
  ['s04.png', 'Comic pop-art', 'MCP explained'],
  ['s05.png', 'Colorful isometric', 'System Design'],
  ['s06.png', 'White minimal + bold object', 'Vector Databases'],
  ['s07.png', 'Gradient glass', 'Embeddings'],
  ['s08.png', 'Hand-drawn whiteboard', 'How AI thinks'],
  ['s09.png', 'Synthwave neon', 'Run AI locally'],
  ['s10.png', 'Memphis geometric', 'Prompt engineering'],
  ['s11.png', 'Duotone bold', 'RAG vs Fine-tuning'],
  ['s12.png', 'Cartoon mascot', 'Meet your AI agent'],
  ['s13.png', 'Sticker collage', 'Best AI tools'],
  ['s14.png', 'Screenshot + annotation', 'Debug it live'],
  ['s15.png', '3D clay (soft, cute)', 'Idempotent APIs'],
  ['s16.png', 'Bold graphic / big symbol', 'Cut your AI bill'],
  ['s17.png', 'Cutout collage', 'Become an AI engineer'],
  ['s18.png', 'Candy pastel 3D', 'AI guardrails'],
  ['s19.png', 'Arcade / game UI', 'Why agents fail'],
  ['s20.png', 'Bright infographic', 'RAG vs Fine-tune'],
  ['s21.png', 'Colored chalkboard', 'How transformers work'],
  ['s22.png', 'Y2K cyber', 'Multimodal AI'],
  ['s23.png', 'Paper-craft origami', 'Structured output'],
  ['s24.png', 'Photoreal color-pop', 'Prompt injection'],
  ['s25.png', 'Confetti / celebration', '70% of agents fail'],
]

const cards = S.map(([f, style, topic], i) => {
  const u = uri(f)
  return `<div class="card"><div class="num">${String(i + 1).padStart(2, '0')}</div>
    <div class="shot">${u ? `<img src="${u}" alt="${style}"/>` : `<div class="miss">${f} missing</div>`}</div>
    <div class="cap"><b>${style}</b><span>${topic}</span></div></div>`
}).join('\n')

const css = `
:root{--bg:#0C0D11;--card:#15161C;--ink:#F4F2EC;--muted:#A9ABB8;--faint:#6C6E7C;--line:rgba(255,255,255,.09);--accent-ink:#9AA8FF;--mono:ui-monospace,'SF Mono',Menlo,monospace;--sans:'Inter',-apple-system,'Segoe UI',Roboto,sans-serif;}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased}
.wrap{max-width:1200px;margin:0 auto;padding:52px 22px 80px}
.kick{font-family:var(--mono);font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:var(--accent-ink)}
h1{font-size:clamp(30px,5vw,50px);font-weight:800;letter-spacing:-.03em;margin:12px 0 0;line-height:1.02}
.lede{color:var(--muted);font-size:17px;max-width:72ch;margin-top:14px;line-height:1.55}
.lede b{color:var(--ink)}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:40px}
.card{}
.num{font-family:var(--mono);font-size:12px;color:var(--faint);margin-bottom:8px}
.shot{aspect-ratio:16/9;border-radius:12px;overflow:hidden;border:1px solid var(--line);background:#000}
.shot img{width:100%;height:100%;object-fit:cover;display:block}
.miss{display:grid;place-items:center;height:100%;color:var(--faint);font-family:var(--mono);font-size:12px}
.cap{display:flex;flex-direction:column;gap:2px;margin-top:11px}
.cap b{font-size:15px;font-weight:700}
.cap span{font-family:var(--mono);font-size:11.5px;color:var(--faint)}
footer{margin-top:52px;border-top:1px solid var(--line);padding-top:24px;color:var(--muted);font-size:15px;line-height:1.6}
footer b{color:var(--ink)}
@media(max-width:720px){.grid{grid-template-columns:1fr}}
`
const html = `<div class="wrap">
<div class="kick">Sage Academy · Thumbnail Styles</div>
<h1>25 completely different styles. Which is the channel?</h1>
<p class="lede">A wide-open exploration — bright, colorful, friendly, high-contrast. No dark-cinematic sameness this time; every one is a different design language. These are the raw <b>style directions</b> (text/headlines get added once you pick a look). Tell me the <b>2–3 styles</b> that feel like the channel and I'll build the full thumbnail system + template around them.</p>
<div class="grid">${cards}</div>
<footer>Reply with the <b>numbers</b> you like (and why, if you can). I'll lock the look, regenerate at full res, wire the text treatment, then roll it across the video slate + the academy course covers.</footer>
</div>`
const ent = (s) => s.replaceAll('·', '&middot;').replaceAll('—', '&mdash;').replaceAll('–', '&ndash;').replaceAll('’', '&rsquo;').replaceAll('×', '&times;')
fs.writeFileSync(path.join(root, 'styles-board.html'), `<style>${css}</style>\n${ent(html)}\n`)
console.log('styles-board.html:', Math.round(fs.statSync(path.join(root, 'styles-board.html')).size / 1024), 'KB')
