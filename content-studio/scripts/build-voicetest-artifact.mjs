import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const dir = path.join(root, 'renders', 'voicetest')
const au = (f) => `data:audio/mpeg;base64,${fs.readFileSync(path.join(dir, f)).toString('base64')}`
const items = [
  ['A', 'v3 Conversational', 'Built for warm, natural 1:1 dialogue. My pick for teaching.', 'A_v3conv.mp3'],
  ['B', 'v3 (expressive)', 'The emotional model with subtle warmth tags.', 'B_v3.mp3'],
  ['C', 'Multilingual v2 (warm-tuned)', 'The prior model, but low stability + high style for expressiveness.', 'C_mv2warm.mp3'],
]
const rows = items.map(([k, name, note, f]) => `<div class="row"><div class="lab"><span class="k">${k}</span><div><b>${name}</b><span>${note}</span></div></div><audio controls preload="none" src="${au(f)}"></audio></div>`).join('')
const css = `:root{--bg:#0C0D11;--ink:#F4F2EC;--muted:#A9ABB8;--faint:#6C6E7C;--line:rgba(255,255,255,.1);--accent:#9AA8FF}
*{margin:0;padding:0;box-sizing:border-box}body{background:var(--bg);color:var(--ink);font-family:-apple-system,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:760px;margin:0 auto;padding:56px 24px 80px}.kick{font-family:ui-monospace,Menlo,monospace;font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:var(--accent)}
h1{font-size:clamp(30px,5vw,46px);font-weight:700;letter-spacing:-.02em;margin:12px 0 0}.lede{color:var(--muted);font-size:17px;margin-top:14px;line-height:1.55;max-width:60ch}
.script{margin:26px 0 34px;padding:20px 22px;border:1px solid var(--line);border-radius:14px;background:#15161C;color:#D9DBE4;font-size:16px;line-height:1.7;font-style:italic}
.row{display:flex;flex-direction:column;gap:12px;padding:22px 0;border-top:1px solid var(--line)}
.lab{display:flex;align-items:center;gap:16px}.lab .k{width:40px;height:40px;border-radius:11px;background:#3D5AFE;display:grid;place-items:center;font-weight:800;font-size:19px;flex:none}
.lab b{display:block;font-size:17px}.lab span{color:var(--faint);font-size:13.5px;font-family:ui-monospace,monospace}
audio{width:100%}footer{margin-top:40px;border-top:1px solid var(--line);padding-top:24px;color:var(--muted);font-size:15px}footer b{color:var(--ink)}`
const html = `<div class="wrap"><div class="kick">Sage Academy · Teaching Voice Test</div>
<h1>Which voice sounds like you teaching?</h1>
<p class="lede">Same words, three engines. All your cloned voice — but rewritten <b>conversational</b> (curiosity gap + a real failure before the reveal), the way a person actually explains something 1:1.</p>
<div class="script">"Okay — watch this. I'm gonna ask this AI a question about my own company's docs. Simple one: what's our refund window? … And look what it says. Thirty days. Confident. Clean. … One problem. We don't have a thirty-day policy. It made that up. … The fix isn't a smarter model. It's teaching it to say three words almost no AI will say. I. Don't. Know. That's RAG — let me show you."</div>
${rows}
<footer>Tell me the letter that sounds most like <b>you, warm, teaching one person</b> (and if none nail it, the "you record a sample → re-clone" route gets us to 100%). Then I rebuild the RAG lesson with the new teaching loop in that voice.</footer></div>`
fs.writeFileSync(path.join(root, 'voicetest.html'), `<style>${css}</style>\n${html}\n`)
console.log('voicetest.html:', Math.round(fs.statSync(path.join(root, 'voicetest.html')).size / 1024), 'KB')
