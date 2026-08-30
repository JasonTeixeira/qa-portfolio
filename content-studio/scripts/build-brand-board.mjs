// Build a self-contained brand-board.html with every asset inlined as a data URI,
// so it can be reviewed/shared without external hosts (Artifact-CSP-safe).
// Re-runnable: regenerate after adding assets. Run: node scripts/build-brand-board.mjs
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const R = (p) => path.join(root, 'renders', p)
const tmp = '/tmp/bb'
fs.mkdirSync(tmp, { recursive: true })

// asset → downscaled JPEG data URI (keeps the board light)
function img(file, maxDim) {
  const src = R(file)
  if (!fs.existsSync(src)) return null
  const out = path.join(tmp, file.replace(/\.png$/, '.jpg'))
  execSync(`sips -Z ${maxDim} -s format jpeg ${JSON.stringify(src)} --out ${JSON.stringify(out)}`, { stdio: 'ignore' })
  const b64 = fs.readFileSync(out).toString('base64')
  return `data:image/jpeg;base64,${b64}`
}
function audio(file) {
  const src = R(file)
  if (!fs.existsSync(src)) return null
  return `data:audio/mpeg;base64,${fs.readFileSync(src).toString('base64')}`
}

const A = {
  composite: img('thumb-rag-hero.png', 1280),
  thumbRag: img('thumb-rag.png', 1000),
  thumbEvals: img('thumb-evals.png', 1000),
  hero1: img('hero-rag-1.png', 1200),
  hero2: img('hero-rag-2.png', 1200),
  avatar: img('avatar.png', 400),
  banner: img('banner.png', 1500),
  voice: audio('voice-test.mp3'),
}

const swatches = [
  ['#0A0B0F', 'Ground'], ['#3D5AFE', 'Accent'], ['#9AA8FF', 'Accent ink'],
  ['#1A2680', 'Deep'], ['#F4F2EC', 'Ink'], ['#3ECF8E', 'Passed'], ['#F0796E', 'Fails'],
]

const fig = (src, cap, tag) => src
  ? `<figure><img src="${src}" alt="${cap}"/><figcaption><span>${cap}</span>${tag ? `<em class="tag ${tag.cls}">${tag.t}</em>` : ''}</figcaption></figure>`
  : `<figure class="missing">${cap} — not rendered</figure>`

const html = `<div class="wrap">
<header>
  <div class="kick">Sage Academy · Brand Board</div>
  <h1>The look, before we build.</h1>
  <p class="lede">Every asset in one place — react to any of it. The brand <b>system</b> (color, type, logo, templates) is code-driven and inherits sageideas.dev. The <b>hero art</b> is Higgsfield-generated, palette-locked to the brand.</p>
</header>

<section>
  <h2>01 · The system</h2>
  <div class="sw">${swatches.map(([hex, n]) => `<div class="chip"><span style="background:${hex}"></span><b>${n}</b><code>${hex}</code></div>`).join('')}</div>
  <div class="type">
    <div class="tt"><div class="serif">Fraunces</div><small>Display — headlines, emphasis in italic blue</small></div>
    <div class="tt"><div class="mono">JetBrains Mono</div><small>Kickers, code, data, captions</small></div>
    <div class="tt"><div class="serif" style="font-size:34px">Proof, <em>not paper.</em></div><small>The line the whole brand runs on</small></div>
  </div>
</section>

<section>
  <h2>02 · Channel identity</h2>
  <div class="grid1">
    ${fig(A.banner, 'YouTube banner (2048×1152)', { t: 'code-driven', cls: 'c' })}
  </div>
  <div class="row">
    <figure class="avatar"><img src="${A.avatar}" alt="avatar"/><figcaption><span>Avatar (circle-cropped)</span><em class="tag c">code-driven</em></figcaption></figure>
    <div class="note">Applied in YouTube Studio (API can't set channel identity). Name → <b>Sage Academy</b>, handle <b>@SageideasAI</b>.</div>
  </div>
</section>

<section>
  <h2>03 · The thumbnail look</h2>
  <div class="grid1">${fig(A.composite, 'Flagship thumbnail — hero art + title system unified', { t: 'hybrid', cls: 'h' })}</div>
  <div class="grid2">
    ${fig(A.thumbRag, 'Proof-card thumbnail (code-driven, reusable)', { t: 'code-driven', cls: 'c' })}
    ${fig(A.thumbEvals, 'Same template, different topic', { t: 'code-driven', cls: 'c' })}
  </div>
  <p class="cap">Every thumbnail shows the <b>artifact</b> (a proof card or the hero), never a reaction face — the anti-hype signature.</p>
</section>

<section>
  <h2>04 · Generative hero art <em class="tag g">Higgsfield · Recraft V4.1</em></h2>
  <div class="grid2">
    ${fig(A.hero1, 'Documents → glowing core (retrieval)')}
    ${fig(A.hero2, 'Vortex → one answer (grounding)')}
  </div>
  <p class="cap">Palette-locked to the brand. Used behind titles, as intro/b-roll, and as thumbnail backgrounds. Reproducible recipe in VISUAL_IDENTITY.md.</p>
</section>

${A.voice ? `<section>
  <h2>05 · The voice <em class="tag g">ElevenLabs · your clone</em></h2>
  <p class="cap">Jason — Sage narration. Every video ships in this voice.</p>
  <audio controls src="${A.voice}"></audio>
</section>` : ''}

<footer>Say what to change — palette, type, thumbnail framing, hero direction — and I'll adjust before we render the first video.</footer>
</div>`

const css = `
:root{--bg:#0A0B0F;--card:#111218;--ink:#F4F2EC;--muted:#A9ABB8;--faint:#6C6E7C;--line:rgba(255,255,255,.09);--accent:#3D5AFE;--accent-ink:#9AA8FF;--serif:'Iowan Old Style','Palatino Linotype',Georgia,serif;--mono:ui-monospace,'SF Mono',Menlo,monospace;}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:var(--serif);line-height:1.5;-webkit-font-smoothing:antialiased}
.wrap{max-width:1040px;margin:0 auto;padding:56px 24px 80px}
.kick{font-family:var(--mono);font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:var(--accent-ink)}
h1{font-size:clamp(34px,6vw,58px);font-weight:600;letter-spacing:-.03em;margin:14px 0 0;text-wrap:balance}
.lede{color:var(--muted);font-size:18px;max-width:66ch;margin-top:16px}
.lede b{color:var(--ink);font-weight:600}
section{margin-top:56px;border-top:1px solid var(--line);padding-top:30px}
h2{font-size:22px;font-weight:600;letter-spacing:-.01em;display:flex;align-items:center;gap:12px;margin-bottom:22px}
.sw{display:flex;flex-wrap:wrap;gap:14px}
.chip{display:flex;flex-direction:column;gap:7px;font-family:var(--mono);font-size:11px}
.chip span{width:88px;height:56px;border-radius:9px;border:1px solid var(--line)}
.chip b{color:var(--ink);font-weight:500;font-family:var(--serif)}
.chip code{color:var(--faint)}
.type{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-top:26px}
.tt{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:20px}
.tt small{display:block;color:var(--faint);font-family:var(--mono);font-size:11px;margin-top:10px;line-height:1.5}
.serif{font-family:var(--serif);font-size:40px;font-weight:600;letter-spacing:-.02em}
.serif em{font-style:italic;color:var(--accent-ink)}
.mono{font-family:var(--mono);font-size:30px}
.grid1{display:block}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
figure{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}
figure img{display:block;width:100%;height:auto}
figcaption{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 15px;font-size:13px;color:var(--muted);font-family:var(--mono)}
.tag{font-style:normal;font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;padding:3px 8px;border-radius:5px;border:1px solid var(--line);white-space:nowrap}
.tag.c{color:var(--accent-ink);border-color:rgba(122,140,255,.35)}
.tag.g{color:#C6A0FF;border-color:rgba(198,160,255,.35)}
.tag.h{color:#3ECF8E;border-color:rgba(62,207,142,.35)}
.row{display:flex;align-items:center;gap:22px;margin-top:18px;flex-wrap:wrap}
figure.avatar{width:180px;flex:none}
figure.avatar img{width:180px;height:180px}
.note{color:var(--muted);font-size:15px;max-width:44ch}
.note b{color:var(--ink)}
.cap{color:var(--faint);font-size:14px;font-family:var(--mono);margin-top:16px;line-height:1.6}
.cap b{color:var(--muted)}
audio{width:100%;max-width:520px;margin-top:6px}
.missing{padding:40px;color:var(--faint);text-align:center;font-family:var(--mono);font-size:13px}
footer{margin-top:56px;border-top:1px solid var(--line);padding-top:26px;color:var(--muted);font-size:15px}
@media(max-width:640px){.grid2{grid-template-columns:1fr}}
`

fs.writeFileSync(path.join(root, 'brand-board.html'),
  `<style>${css}</style>\n${html}\n`)
console.log('brand-board.html written (', Math.round(fs.statSync(path.join(root, 'brand-board.html')).size / 1024), 'KB )')
