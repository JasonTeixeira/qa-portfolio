// Build darkhf-board.html: 12 dark premium Higgsfield thumbnails with Fraunces text overlay.
// Run: node scripts/build-darkhf-board.mjs
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const tmp = '/tmp/dh'; fs.mkdirSync(tmp, { recursive: true })
const uri = (file, max = 960) => {
  const src = path.join(root, 'renders/darkhf', file)
  if (!fs.existsSync(src)) return null
  const out = path.join(tmp, file.replace(/\.png$/, '.jpg'))
  execSync(`sips -Z ${max} -s format jpeg ${JSON.stringify(src)} --out ${JSON.stringify(out)}`, { stdio: 'ignore' })
  return `data:image/jpeg;base64,${fs.readFileSync(out).toString('base64')}`
}
const f = (p) => (fs.existsSync(p) ? fs.readFileSync(p).toString('base64') : null)
const fr = f('/tmp/fraunces.woff2'), mo = f('/tmp/jbmono400.woff2')

const T = [
  ['d01.png', 'AI ENGINEERING', 'What is <em>RAG</em>?', 'RAG'],
  ['d02.png', 'BACKEND · BUILD', 'It can’t <em>double-charge</em>.', 'Idempotency'],
  ['d03.png', 'DEBUGGING · LIVE', 'Find the <em>bug</em>.', 'Debugging'],
  ['d04.png', 'EVALS', 'How you know it <em>works</em>.', 'Evals'],
  ['d05.png', 'SYSTEM DESIGN', 'Systems that <em>won’t fall</em>.', 'System Design'],
  ['d06.png', 'AGENTS · INFRA', 'What is <em>MCP</em>?', 'MCP'],
  ['d07.png', 'COST', 'Cut your AI bill <em>10×</em>.', 'Cost'],
  ['d08.png', 'DATA', 'What are <em>embeddings</em>?', 'Embeddings'],
  ['d09.png', 'AGENTS · TOOL USE', 'Build an AI <em>agent</em>.', 'Agents'],
  ['d10.png', 'SECURITY', 'Stop <em>prompt injection</em>.', 'Prompt injection'],
  ['d11.png', 'THE DECISION', 'RAG <em>vs</em> Fine-tuning', 'AI Engineering'],
  ['d12.png', 'ENGINEERING JUDGMENT', 'Think like a <em>senior engineer</em>.', 'Foundations'],
]
const logo = `<div class="lg"><span class="mk"><svg width="17" height="17" viewBox="0 0 64 64" fill="none"><g transform="translate(0 -6)"><path d="M20 44 A10 10 0 0 1 20 24 A13 13 0 0 1 45 21 A9 9 0 0 1 48 44 Z" fill="none" stroke="#fff" stroke-width="5.5" stroke-linejoin="round"/><circle cx="26" cy="54" r="3.8" fill="#fff"/><circle cx="36" cy="54" r="3.8" fill="#fff"/><circle cx="46" cy="54" r="3.8" fill="#fff"/></g></svg></span><span class="wm"><b>Sage Academy</b><span class="pp">proof, not paper</span></span></div>`
const cards = T.map(([file, kick, title, topic], i) => {
  const u = uri(file)
  const inner = u
    ? `<div class="shot" style="background-image:url('${u}')"><div class="scrim"></div><div class="ov"><div class="k">${kick}</div><h1 class="t">${title}</h1>${logo}</div></div>`
    : `<div class="shot miss">${file}</div>`
  return `<div class="card"><div class="num">${String(i + 1).padStart(2, '0')}</div>${inner}<div class="cap">${topic}</div></div>`
}).join('\n')

const css = `
${fr ? `@font-face{font-family:'Fraunces';src:url(data:font/woff2;base64,${fr}) format('woff2');font-weight:600;font-display:swap}` : ''}
${mo ? `@font-face{font-family:'JBMono';src:url(data:font/woff2;base64,${mo}) format('woff2');font-weight:400;font-display:swap}` : ''}
:root{--ink:#F3F1EC;--muted:#B4B6C2;--faint:#6C6E7C;--line:rgba(255,255,255,.09);--accent-ink:#9AA8FF;
--serif:${fr ? "'Fraunces'," : ''}Georgia,serif;--mono:${mo ? "'JBMono'," : ''}ui-monospace,Menlo,monospace;--sans:-apple-system,'Segoe UI',Roboto,sans-serif;}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0C0D11;color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased}
.wrap{max-width:1200px;margin:0 auto;padding:52px 22px 80px}
.kick0{font-family:var(--mono);font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:var(--accent-ink)}
h1.page{font-family:var(--serif);font-weight:600;font-size:clamp(30px,5vw,50px);letter-spacing:-.02em;margin:12px 0 0}
.lede{color:var(--muted);font-size:17px;max-width:70ch;margin-top:14px;line-height:1.55}.lede b{color:var(--ink)}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:40px}
.num{font-family:var(--mono);font-size:12px;color:var(--faint);margin-bottom:8px}
.shot{position:relative;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background-size:cover;background-position:center;border:1px solid var(--line);container-type:inline-size}
.scrim{position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,9,14,.92) 0%,rgba(8,9,14,.55) 34%,transparent 62%)}
.ov{position:absolute;inset:0;padding:6cqw 6.5cqw;display:flex;flex-direction:column}
.ov .k{font-family:var(--mono);font-size:2.9cqw;letter-spacing:.16em;text-transform:uppercase;color:var(--accent-ink)}
.ov .t{font-family:var(--serif);font-weight:600;font-size:8.6cqw;line-height:.98;letter-spacing:-.02em;color:#fff;margin-top:auto;max-width:11ch;text-shadow:0 2px 18px rgba(0,0,0,.5)}
.ov .t em{font-style:italic;color:var(--accent-ink)}
.lg{display:flex;align-items:center;gap:2cqw;margin-top:4cqw}
.lg .mk{width:5cqw;height:5cqw;min-width:22px;min-height:22px;border-radius:1.4cqw;background:#3D5AFE;display:grid;place-items:center;flex:none}
.wm{display:flex;flex-direction:column;line-height:1.12}
.wm b{font-family:var(--serif);font-weight:600;font-size:3.4cqw;white-space:nowrap}
.wm .pp{font-family:var(--mono);font-size:2.2cqw;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);white-space:nowrap}
.cap{font-family:var(--mono);font-size:11.5px;color:var(--faint);margin-top:11px;text-transform:uppercase;letter-spacing:.08em}
.miss{display:grid;place-items:center;color:var(--faint);font-family:var(--mono)}
footer{margin-top:52px;border-top:1px solid var(--line);padding-top:26px;color:var(--muted);font-size:15px;line-height:1.6}footer b{color:var(--ink)}
@media(max-width:720px){.grid{grid-template-columns:1fr}}
`
const ent = (s) => s.replaceAll('·', '&middot;').replaceAll('—', '&mdash;').replaceAll('→', '&rarr;').replaceAll('×', '&times;').replaceAll('’', '&rsquo;')
const html = `<div class="wrap">
<div class="kick0">Sage Academy · Dark Premium (Higgsfield)</div>
<h1 class="page">Dark, elegant, Higgsfield.</h1>
<p class="lede">Higgsfield-generated premium 3D imagery — clear hero subjects, elegant lighting, on the dark navy that matches your site — with the site's Fraunces headline + blue keyword. Colorful enough to read, dark and premium enough to feel like you. 12 examples. Tell me if this is the dark direction, and any tweak (brighter, more/less object, different subjects).</p>
<div class="grid">${cards}</div>
<footer>If this is it, say so and I'll <b>regenerate the winners at 2k</b>, lock the template, and roll it across the slate + covers + banner.</footer>
</div>`
fs.writeFileSync(path.join(root, 'darkhf-board.html'), `<style>${css}</style>\n${ent(html)}\n`)
console.log('darkhf-board.html:', Math.round(fs.statSync(path.join(root, 'darkhf-board.html')).size / 1024), 'KB')
