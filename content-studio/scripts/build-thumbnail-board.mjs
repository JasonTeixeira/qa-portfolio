// Build a self-contained thumbnail-board.html: 15 Higgsfield thumbnail directions,
// each composited with a real Fraunces headline + the direction/science tag.
// Run: node scripts/build-thumbnail-board.mjs
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const tmp = '/tmp/tb'; fs.mkdirSync(tmp, { recursive: true })

function imgURI(file, maxDim = 900) {
  const src = path.join(root, 'renders/thumbs', file)
  if (!fs.existsSync(src)) return null
  const out = path.join(tmp, file.replace(/\.png$/, '.jpg'))
  execSync(`sips -Z ${maxDim} -s format jpeg ${JSON.stringify(src)} --out ${JSON.stringify(out)}`, { stdio: 'ignore' })
  return `data:image/jpeg;base64,${fs.readFileSync(out).toString('base64')}`
}
const fontURI = fs.existsSync('/tmp/fraunces.woff2')
  ? `data:font/woff2;base64,${fs.readFileSync('/tmp/fraunces.woff2').toString('base64')}` : null

// [file, kicker, titleHTML, direction, science]
const T = [
  ['c01.png', 'AGENTS · IN PRODUCTION', 'It works in the demo. It <em>dies</em> in prod.', 'Before / After split (red→green)', 'Contrast + red-green emotion; the #1 demand + gap topic'],
  ['c02.png', 'VECTOR DATABASES', 'Where AI actually <em>remembers</em>', 'Giant hero object', 'One bold focal object + depth (ByteByteGo grammar)'],
  ['c03.png', 'PROVE IT · NO VIBES', 'The test that catches the <em>lie</em>', 'The artifact as hero', 'Shows the proof, not a face — your signature move'],
  ['c04.png', 'HOW AI WORKS', 'How a model actually <em>thinks</em>', 'Single glowing core', 'One luminous focal point, high contrast'],
  ['c05.png', 'THE DECISION', 'RAG vs <em>Fine-tuning</em>', 'The "vs" showdown', 'Conflict/comparison framing pulls clicks'],
  ['c06.png', 'AI ENGINEERING · EXPLAINED', 'What is <em>RAG</em>, really?', 'Metaphor + negative space', 'Clean, calm, curiosity-gap (trust-seeking audience)'],
  ['c07.png', 'THE WARNING', 'Your AI agent is <em>lying</em> to you', 'Danger / alert', 'Fear-urgency hook — use sparingly to stay credible'],
  ['c08.png', 'SYSTEM DESIGN', 'Design a system that <em>won’t fall over</em>', 'Isometric architecture', 'For the systems audience; premium technical feel'],
  ['c09.png', 'SECURITY', 'A login that survives an <em>attack</em>', 'Object metaphor (vault)', 'Instant-read metaphor + drama'],
  ['c10.png', 'COST', 'Cut your AI bill <em>10×</em>', 'Money + big number', 'Money hook + a number — strong CTR levers'],
  ['c11.png', 'THE ONE-LINE FIX', 'One line <em>fixes</em> it', 'Minimal luxury', 'Extreme negative space stands out in a cluttered feed'],
  ['c12.png', 'GROUNDING', 'Ground it in your <em>own docs</em>', 'Cinematic vortex', 'Abstract atmosphere, premium'],
  ['c13.png', 'SYSTEM DESIGN', 'Build it from <em>scratch</em>', 'Blueprint / schematic', 'Engineered, "we show the real thing" feel'],
  ['c14.png', 'AGENTS · TOOL USE', 'Give your AI <em>hands</em>', 'Cinematic reach', 'Single subject + directional cue to a glowing node'],
  ['c15.png', 'THE HOUSE RULE', 'Proof, not <em>paper</em>', 'Green ✓ vs red ✗ duel', 'High-contrast duel — the brand thesis as an image'],
]

const cards = T.map(([file, kicker, title, dir, sci], i) => {
  const uri = imgURI(file)
  const inner = uri
    ? `<div class="shot" style="background-image:url('${uri}')"><div class="scrim"></div>
        <div class="ov"><div class="k">${kicker}</div><div class="t">${title}</div>
          <div class="lg"><span class="mk"><svg width="20" height="20" viewBox="0 0 64 64" fill="none"><g transform="translate(0 -6)"><path d="M20 44 A10 10 0 0 1 20 24 A13 13 0 0 1 45 21 A9 9 0 0 1 48 44 Z" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><circle cx="26" cy="54" r="3.6" fill="#fff"/><circle cx="36" cy="54" r="3.6" fill="#fff"/><circle cx="46" cy="54" r="3.6" fill="#fff"/></g></svg></span>Sage Academy</div>
        </div></div>`
    : `<div class="shot missing">image ${file} missing</div>`
  return `<div class="card"><div class="num">${String(i + 1).padStart(2, '0')}</div>${inner}
    <div class="cap"><b>${dir}</b><span>${sci}</span></div></div>`
}).join('\n')

const css = `
${fontURI ? `@font-face{font-family:'Fraunces';src:url(${fontURI}) format('woff2');font-weight:600;font-style:normal;font-display:swap}` : ''}
:root{--bg:#0A0B0F;--ink:#F4F2EC;--muted:#A9ABB8;--faint:#6C6E7C;--line:rgba(255,255,255,.09);--accent-ink:#9AA8FF;
--serif:${fontURI ? "'Fraunces'," : ''}'Iowan Old Style',Georgia,serif;--mono:ui-monospace,'SF Mono',Menlo,monospace;}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:var(--serif);-webkit-font-smoothing:antialiased}
.wrap{max-width:1200px;margin:0 auto;padding:52px 22px 80px}
.kick{font-family:var(--mono);font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:var(--accent-ink)}
h1{font-size:clamp(32px,5.5vw,52px);font-weight:600;letter-spacing:-.03em;margin:12px 0 0;text-wrap:balance}
.lede{color:var(--muted);font-size:17px;max-width:70ch;margin-top:14px;line-height:1.55}
.lede b{color:var(--ink)}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:40px}
.card{}
.num{font-family:var(--mono);font-size:12px;color:var(--faint);margin-bottom:8px}
.shot{position:relative;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background-size:cover;background-position:center;border:1px solid var(--line)}
.scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,11,15,.55) 0%,transparent 34%,transparent 52%,rgba(10,11,15,.86) 100%)}
.ov{position:absolute;inset:0;padding:22px 24px;display:flex;flex-direction:column}
.ov .k{font-family:var(--mono);font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:var(--accent-ink)}
.ov .t{margin-top:auto;font-family:var(--serif);font-weight:600;font-size:clamp(24px,3.1vw,40px);line-height:.98;letter-spacing:-.02em;max-width:14ch;text-shadow:0 2px 20px rgba(0,0,0,.5)}
.ov .t em{font-style:italic;color:var(--accent-ink)}
.ov .lg{display:flex;align-items:center;gap:8px;margin-top:12px;font-family:var(--serif);font-weight:600;font-size:15px}
.ov .lg .mk{width:26px;height:26px;border-radius:7px;display:grid;place-items:center;background:#3D5AFE;flex:none}
.cap{display:flex;flex-direction:column;gap:2px;margin-top:11px}
.cap b{font-size:14px;font-weight:600}
.cap span{font-family:var(--mono);font-size:11.5px;color:var(--faint);line-height:1.5}
footer{margin-top:52px;border-top:1px solid var(--line);padding-top:24px;color:var(--muted);font-size:15px;line-height:1.6}
footer b{color:var(--ink)}
@media(max-width:720px){.grid{grid-template-columns:1fr}}
`

const html = `<div class="wrap">
<div class="kick">Sage Academy · Thumbnail Directions</div>
<h1>15 directions. Pick the ones that click.</h1>
<p class="lede">Each is a real Higgsfield image with a real headline, grounded in what performs at scale: <b>one focal point, extreme contrast, 3–5 word text, curiosity or emotion, depth</b> — but showing <b>the artifact, not a reaction face</b>. These are 1k drafts to choose direction; the winners get regenerated at 2k and systematized into a repeatable template. Tell me the numbers you like (and any tweak — bolder, calmer, different metaphor).</p>
<div class="grid">${cards}</div>
<footer>Reply with the <b>3–5 directions</b> you want to pursue (by number), plus any note on framing/color. I'll lock those as the thumbnail system, regenerate at full res, and apply the same treatment to the academy course thumbnails next.</footer>
</div>`

// Charset-safe: replace non-ASCII punctuation with HTML entities so it renders
// correctly regardless of how the file is served (no <meta charset> reliance).
const ent = (s) => s
  .replaceAll('·', '&middot;').replaceAll('→', '&rarr;').replaceAll('×', '&times;')
  .replaceAll('—', '&mdash;').replaceAll('–', '&ndash;').replaceAll('’', '&rsquo;')
  .replaceAll('✓', '&#10003;').replaceAll('✗', '&#10007;')
fs.writeFileSync(path.join(root, 'thumbnail-board.html'), `<style>${css}</style>\n${ent(html)}\n`)
console.log('thumbnail-board.html:', Math.round(fs.statSync(path.join(root, 'thumbnail-board.html')).size / 1024), 'KB')
