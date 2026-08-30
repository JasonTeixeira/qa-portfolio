// Build hybrid-board.html: 12 isometric×screenshot-annotation thumbnails WITH text overlays.
// Run: node scripts/build-hybrid-board.mjs
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const tmp = '/tmp/hb'; fs.mkdirSync(tmp, { recursive: true })
const uri = (file, max = 960) => {
  const src = path.join(root, 'renders/hybrids', file)
  if (!fs.existsSync(src)) return null
  const out = path.join(tmp, file.replace(/\.png$/, '.jpg'))
  execSync(`sips -Z ${max} -s format jpeg ${JSON.stringify(src)} --out ${JSON.stringify(out)}`, { stdio: 'ignore' })
  return `data:image/jpeg;base64,${fs.readFileSync(out).toString('base64')}`
}
const fontURI = fs.existsSync('/tmp/poppins800.woff2')
  ? `data:font/woff2;base64,${fs.readFileSync('/tmp/poppins800.woff2').toString('base64')}` : null

const HL = ['#FF6B4A', '#12B5A5', '#FFC94A', '#5B7CFA', '#2BB673'] // rotating highlight colors
// [file, titleHTML(<hl> marks the highlighted word), topic]
const T = [
  ['h01.png', 'What is <hl>RAG?</hl>', 'AI Engineering'],
  ['h02.png', 'Build an AI <hl>agent</hl>', 'Agents'],
  ['h03.png', 'AI <hl>evals</hl>, explained', 'Evals'],
  ['h04.png', '<hl>System design</hl> 101', 'System Design'],
  ['h05.png', '<hl>Vector</hl> databases', 'Data'],
  ['h06.png', 'Find the <hl>bug</hl>', 'Debugging'],
  ['h07.png', 'RAG <hl>vs</hl> fine-tuning', 'AI Engineering'],
  ['h08.png', 'What is <hl>MCP?</hl>', 'Agents / infra'],
  ['h09.png', 'Never <hl>double-charge</hl>', 'Backend'],
  ['h10.png', 'Stop prompt <hl>injection</hl>', 'Security'],
  ['h11.png', 'Cut your AI <hl>bill</hl>', 'Cost'],
  ['h12.png', 'How AI <hl>thinks</hl>', 'Foundations'],
]

const cards = T.map(([file, title, topic], i) => {
  const u = uri(file)
  const hl = HL[i % HL.length]
  const titled = title.replace('<hl>', `<span class="hl" style="background:${hl}">`).replace('</hl>', '</span>')
  const inner = u
    ? `<div class="shot" style="background-image:url('${u}')"><div class="scrim"></div>
        <div class="ov"><div class="hd">${titled}</div>
          <div class="lg"><span class="mk"><svg width="17" height="17" viewBox="0 0 64 64" fill="none"><g transform="translate(0 -6)"><path d="M20 44 A10 10 0 0 1 20 24 A13 13 0 0 1 45 21 A9 9 0 0 1 48 44 Z" fill="none" stroke="#fff" stroke-width="5.5" stroke-linejoin="round"/><circle cx="26" cy="54" r="3.8" fill="#fff"/><circle cx="36" cy="54" r="3.8" fill="#fff"/><circle cx="46" cy="54" r="3.8" fill="#fff"/></g></svg></span>Sage Academy</div>
        </div></div>`
    : `<div class="shot miss">${file} missing</div>`
  return `<div class="card"><div class="num">${String(i + 1).padStart(2, '0')}</div>${inner}<div class="cap">${topic}</div></div>`
}).join('\n')

const css = `
${fontURI ? `@font-face{font-family:'Poppins';src:url(${fontURI}) format('woff2');font-weight:800;font-style:normal;font-display:swap}` : ''}
:root{--bg:#0C0D11;--ink:#F4F2EC;--muted:#A9ABB8;--faint:#6C6E7C;--line:rgba(255,255,255,.09);
--pop:${fontURI ? "'Poppins'," : ''}'Arial Black','Helvetica Neue',sans-serif;--mono:ui-monospace,'SF Mono',Menlo,monospace;--sans:-apple-system,'Segoe UI',Roboto,sans-serif;}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased}
.wrap{max-width:1200px;margin:0 auto;padding:52px 22px 80px}
.kick{font-family:var(--mono);font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#9AA8FF}
h1{font-family:var(--pop);font-size:clamp(28px,4.6vw,46px);letter-spacing:-.02em;margin:12px 0 0;line-height:1.03}
.lede{color:var(--muted);font-size:17px;max-width:70ch;margin-top:14px;line-height:1.55}
.lede b{color:var(--ink)}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:40px}
.num{font-family:var(--mono);font-size:12px;color:var(--faint);margin-bottom:8px}
.shot{position:relative;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background-size:cover;background-position:center;border:1px solid var(--line)}
.scrim{position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,11,20,.9) 0%,rgba(10,11,20,.55) 34%,transparent 60%)}
.ov{position:absolute;inset:0;padding:26px 28px;display:flex;flex-direction:column;justify-content:center}
.hd{font-family:var(--pop);font-weight:800;font-size:clamp(24px,3.5cqw,44px);line-height:1.02;letter-spacing:-.02em;color:#fff;max-width:52%;text-shadow:0 2px 14px rgba(0,0,0,.45)}
.hl{color:#12141C;padding:0 8px;border-radius:7px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.lg{position:absolute;left:28px;bottom:22px;display:flex;align-items:center;gap:7px;font-family:var(--pop);font-weight:800;font-size:13px;color:#fff;opacity:.92}
.lg .mk{width:22px;height:22px;border-radius:6px;display:grid;place-items:center;background:#3D5AFE;flex:none}
.card{container-type:inline-size}
.cap{font-family:var(--mono);font-size:11.5px;color:var(--faint);margin-top:11px;text-transform:uppercase;letter-spacing:.08em}
.miss{display:grid;place-items:center;color:var(--faint);font-family:var(--mono);font-size:12px}
footer{margin-top:52px;border-top:1px solid var(--line);padding-top:24px;color:var(--muted);font-size:15px;line-height:1.6}
footer b{color:var(--ink)}
@media(max-width:720px){.grid{grid-template-columns:1fr}.hd{font-size:34px}}
`
const ent = (s) => s.replaceAll('·', '&middot;').replaceAll('—', '&mdash;').replaceAll('–', '&ndash;').replaceAll('’', '&rsquo;').replaceAll('×', '&times;')
const html = `<div class="wrap">
<div class="kick">Sage Academy · Hybrid Thumbnails</div>
<h1>Colorful isometric × screenshot-annotation.</h1>
<p class="lede">Your two picks, fused: the friendly isometric world + a real code window with bright callouts, plus a <b>punchy bold headline</b> with a highlighted keyword — genuine, clickable, and colorful. 12 real examples across our topics. Tell me if this is the one (and any tweak: text bigger/smaller, highlight color, busier/cleaner scenes), then I lock it as the system.</p>
<div class="grid">${cards}</div>
<footer>If this direction is right, say so and I'll <b>regenerate the winners at 2k</b>, finalize the exact text treatment, build the reusable template, and roll it across the slate + academy course covers + the banner.</footer>
</div>`
fs.writeFileSync(path.join(root, 'hybrid-board.html'), `<style>${css}</style>\n${ent(html)}\n`)
console.log('hybrid-board.html:', Math.round(fs.statSync(path.join(root, 'hybrid-board.html')).size / 1024), 'KB')
