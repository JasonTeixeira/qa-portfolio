// Build dark-board.html: 12 code-driven, site-matching thumbnails
// (terminal + elegant engineering). Fonts inlined. Run: node scripts/build-dark-board.mjs
import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const font = (p) => (fs.existsSync(p) ? fs.readFileSync(p).toString('base64') : null)
const fr = font('/tmp/fraunces.woff2'), m4 = font('/tmp/jbmono400.woff2'), m6 = font('/tmp/jbmono600.woff2')
const K = '<span class="k">', C = '<span class="c">', R = '<span class="r">', G = '<span class="g">', E = '</span>'

const card = (fn, lines, v) => `<div class="card"><div class="bar"><i class="dot r"></i><i class="dot a"></i><i class="dot g"></i><span class="fn">${fn}</span></div><div class="code">${lines.map(l => `<div class="ln">${l}</div>`).join('')}${v ? `<div class="v">${v}</div>` : ''}</div></div>`

const flow = (nodes, hi) => `<svg viewBox="0 0 240 210" class="dg">${nodes.map((n, i) => {
  const y = 22 + i * 62, on = i === hi
  return `<rect x="40" y="${y}" width="160" height="44" rx="10" fill="${on ? 'rgba(61,90,254,0.16)' : 'rgba(255,255,255,0.03)'}" stroke="${on ? '#3D5AFE' : 'rgba(255,255,255,0.14)'}" stroke-width="${on ? 2 : 1.2}"/><text x="120" y="${y + 27}" text-anchor="middle" font-family="var(--mono)" font-size="16" fill="${on ? '#9AA8FF' : '#B4B6C2'}">${n}</text>${i < nodes.length - 1 ? `<path d="M120 ${y + 44} V ${y + 62}" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>` : ''}`
}).join('')}${hi > 0 ? `<text x="214" y="${22 + hi * 62 + 4}" font-family="var(--mono)" font-size="22" fill="#F0796E">?</text>` : ''}</svg>`

const embed = () => `<svg viewBox="0 0 240 210" class="dg">
<rect x="6" y="60" width="86" height="36" rx="9" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.14)"/><text x="49" y="83" text-anchor="middle" font-family="var(--serif)" font-size="16" fill="#F3F1EC">"cat"</text>
<path d="M92 78 H120" stroke="#3D5AFE" stroke-width="1.6"/><path d="M114 74 l6 4 l-6 4" fill="none" stroke="#3D5AFE" stroke-width="1.6"/>
<text x="6" y="132" font-family="var(--mono)" font-size="13" fill="#9AA8FF">[0.2,-0.8,0.5]</text>
${[[190, 54], [206, 72], [178, 84], [200, 120], [172, 138], [196, 156]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i < 2 ? 6 : 4}" fill="${i < 2 ? '#3ECF8E' : '#3D5AFE'}" opacity="${i < 2 ? 1 : 0.7}"/>`).join('')}
<circle cx="198" cy="63" r="17" fill="none" stroke="#3ECF8E" stroke-width="1.4" stroke-dasharray="3 3"/></svg>`

const gauge = () => `<svg viewBox="0 0 240 210" class="dg">
<circle cx="120" cy="110" r="74" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="11"/>
<circle cx="120" cy="110" r="74" fill="none" stroke="#3ECF8E" stroke-width="11" stroke-linecap="round" stroke-dasharray="${(0.86 * 0.75 * 2 * Math.PI * 74).toFixed(0)} 999" transform="rotate(135 120 110)"/>
<text x="120" y="106" text-anchor="middle" font-family="var(--serif)" font-size="50" font-weight="600" fill="#F3F1EC">0.86</text>
<text x="120" y="132" text-anchor="middle" font-family="var(--mono)" font-size="13" fill="#6C6E7C">GATE ≥ 0.80</text></svg>`

const costChart = () => `<svg viewBox="0 0 240 210" class="dg">
${[0, 1, 2, 3].map(i => `<line x1="10" y1="${45 + i * 42}" x2="230" y2="${45 + i * 42}" stroke="rgba(255,255,255,0.06)"/>`).join('')}
<polyline points="20,58 75,74 130,120 185,166 225,176" fill="none" stroke="#3D5AFE" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="20" cy="58" r="5" fill="#F0796E"/><circle cx="225" cy="176" r="6" fill="#3ECF8E"/>
<text x="150" y="150" font-family="var(--mono)" font-size="17" fill="#3ECF8E">↓ 10×</text></svg>`

const versus = () => `<div class="vs"><div class="mini"><div class="ml">RAG</div><div class="mp g">+ cites sources</div><div class="mp g">+ cheap to update</div></div><div class="vslabel">vs</div><div class="mini"><div class="ml">Fine-tune</div><div class="mp g">+ owns style</div><div class="mp r">− static, costly</div></div></div>`

const cards = [
  { kick: 'AI ENGINEERING · EXPLAINED', title: `What is <em>RAG</em>, really?`, topic: 'RAG', aside: card('rag.py', [`${K}ctx${E} = search(q, k=${K}4${E})`, `${K}ans${E} = llm(q, ctx)`, `${C}# refuse if no source${E}`], '✓ grounded · cited') },
  { kick: 'BACKEND · BUILD WITH ME', title: `It can't <em>double-charge</em>.`, topic: 'Idempotency', aside: card('charge_test.py', [`${K}for${E} _ ${K}in${E} range(${K}3${E}):`, `&nbsp;&nbsp;charge(o, key=id)`, `${R}assert${E} charges == ${K}1${E}`], '✓ 1 charge · passed') },
  { kick: 'DEBUGGING · LIVE', title: `Find the <em>bug</em>.`, topic: 'Debugging', aside: card('average.py', [`${R}- sum(values)${E}`, `${G}+ sum(values) / len(v)${E}`, `${C}# sum, not the mean${E}`], '✓ test passes') },
  { kick: 'EVALS', title: `How you know it <em>works</em>.`, topic: 'Evals', aside: gauge() },
  { kick: 'SYSTEM DESIGN', title: `Systems that <em>won't fall over</em>.`, topic: 'System Design', aside: flow(['API', 'Queue', 'Database'], 1) },
  { kick: 'AGENTS · INFRA', title: `What is <em>MCP</em>?`, topic: 'MCP', aside: card('mcp_server.py', [`${K}@server${E}.tool()`, `${K}def${E} search(q): ...`, `server.serve()`], '✓ connected · 1 tool') },
  { kick: 'COST · OPTIMIZATION', title: `Cut your AI bill <em>10×</em>.`, topic: 'Cost', aside: costChart() },
  { kick: 'DATA', title: `What are <em>embeddings</em>?`, topic: 'Embeddings', aside: embed() },
  { kick: 'AGENTS · TOOL USE', title: `Build an AI <em>agent</em>.`, topic: 'Agents', aside: card('agent.py', [`${K}while${E} not done:`, `&nbsp;&nbsp;p = think(s)`, `&nbsp;&nbsp;act(p) ${C}# guarded${E}`], '✓ guardrail on') },
  { kick: 'SECURITY', title: `Stop <em>prompt injection</em>.`, topic: 'Prompt injection', aside: card('guard.py', [`${K}if${E} attack(x):`, `&nbsp;&nbsp;reject()`, `${C}# stopped at the edge${E}`], '✓ blocked · safe') },
  { kick: 'THE DECISION', title: `RAG <em>vs</em> Fine-tuning`, topic: 'AI Engineering', aside: versus() },
  { kick: 'ENGINEERING JUDGMENT', title: `Think like a <em>senior engineer</em>.`, topic: 'Foundations', full: true, aside: '' },
]

const logo = `<div class="foot"><span class="mk"><svg width="18" height="18" viewBox="0 0 64 64" fill="none"><g transform="translate(0 -6)"><path d="M20 44 A10 10 0 0 1 20 24 A13 13 0 0 1 45 21 A9 9 0 0 1 48 44 Z" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><circle cx="26" cy="54" r="3.6" fill="#fff"/><circle cx="36" cy="54" r="3.6" fill="#fff"/><circle cx="46" cy="54" r="3.6" fill="#fff"/></g></svg></span><span class="wm"><b>Sage Academy</b><span class="pp">proof, not paper</span></span></div>`
const shot = (c) => `<div class="shot"><div class="grid"></div><div class="aurora"></div><div class="frame${c.full ? ' full' : ''}">
  <div class="col"><div class="kicker">${c.kick}</div><h1 class="title">${c.title}</h1>${c.full ? `<div class="mline">frame → route → map → decide → prove</div>` : ''}${logo}</div>
  ${c.full ? '' : `<div class="aside">${c.aside}</div>`}</div></div>`

const css = `
${fr ? `@font-face{font-family:'Fraunces';src:url(data:font/woff2;base64,${fr}) format('woff2');font-weight:600;font-display:swap}` : ''}
${m4 ? `@font-face{font-family:'JBMono';src:url(data:font/woff2;base64,${m4}) format('woff2');font-weight:400;font-display:swap}` : ''}
${m6 ? `@font-face{font-family:'JBMono';src:url(data:font/woff2;base64,${m6}) format('woff2');font-weight:600;font-display:swap}` : ''}
:root{--bg:#0A0B0F;--ink:#F3F1EC;--muted:#B4B6C2;--faint:#6C6E7C;--line:rgba(255,255,255,.09);--accent:#3D5AFE;--accent-ink:#9AA8FF;--green:#3ECF8E;--red:#F0796E;
--serif:${fr ? "'Fraunces'," : ''}Georgia,serif;--mono:${m4 ? "'JBMono'," : ''}ui-monospace,Menlo,monospace;--sans:-apple-system,'Segoe UI',Roboto,sans-serif;}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0C0D11;color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased}
.wrap{max-width:1200px;margin:0 auto;padding:52px 22px 80px}
.kick0{font-family:var(--mono);font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:var(--accent-ink)}
h1.page{font-family:var(--serif);font-weight:600;font-size:clamp(30px,5vw,50px);letter-spacing:-.02em;margin:12px 0 0}
.lede{color:var(--muted);font-size:17px;max-width:70ch;margin-top:14px;line-height:1.55}.lede b{color:var(--ink)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:40px}
.num{font-family:var(--mono);font-size:12px;color:var(--faint);margin-bottom:8px}
.shot{position:relative;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:var(--bg);border:1px solid var(--line);container-type:inline-size}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);background-size:34px 34px;mask-image:radial-gradient(120% 90% at 20% 30%,#000 30%,transparent 78%)}
.aurora{position:absolute;inset:0;background:radial-gradient(46% 60% at 12% 6%,rgba(61,90,254,.22),transparent 60%)}
.frame{position:absolute;inset:0;padding:5.5cqw 6cqw;display:flex;gap:4.5cqw;align-items:stretch}
.frame.full{align-items:center}
.col{flex:1;min-width:0;display:flex;flex-direction:column;overflow:hidden}
.kicker{font-family:var(--mono);font-size:2.9cqw;letter-spacing:.15em;text-transform:uppercase;color:var(--accent-ink)}
.title{font-family:var(--serif);font-weight:600;font-size:8.2cqw;line-height:.97;letter-spacing:-.02em;color:var(--ink);margin-top:auto;max-width:14ch}
.full .title{font-size:11.5cqw;max-width:16ch}
.title em{font-style:italic;color:var(--accent-ink)}
.mline{font-family:var(--mono);font-size:3cqw;color:var(--faint);margin-top:2.6cqw}
.foot{display:flex;align-items:center;gap:2cqw;margin-top:4cqw}
.foot .mk{width:5.4cqw;height:5.4cqw;min-width:22px;min-height:22px;border-radius:1.4cqw;background:var(--accent);display:grid;place-items:center;flex:none}
.wm{display:flex;flex-direction:column;line-height:1.12;min-width:0}
.wm b{font-family:var(--serif);font-weight:600;font-size:3.4cqw;white-space:nowrap}
.wm .pp{font-family:var(--mono);font-size:2.2cqw;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);white-space:nowrap}
.aside{flex:0 0 41%;display:flex;align-items:center;justify-content:center;min-width:0;overflow:hidden}
.card{width:100%;border:1px solid var(--line);border-radius:2.4cqw;background:linear-gradient(180deg,rgba(122,140,255,.06),rgba(255,255,255,.015));box-shadow:0 4cqw 9cqw -5cqw rgba(0,0,0,.7);overflow:hidden}
.bar{display:flex;align-items:center;gap:1.3cqw;padding:2.2cqw 2.8cqw;border-bottom:1px solid var(--line)}
.dot{width:2cqw;height:2cqw;min-width:7px;min-height:7px;border-radius:50%}.dot.r{background:var(--red)}.dot.a{background:#E9A13B}.dot.g{background:var(--green)}
.fn{font-family:var(--mono);font-size:2.4cqw;color:var(--faint);margin-left:1cqw;white-space:nowrap}
.code{padding:2.8cqw;font-family:var(--mono);font-size:2.55cqw;line-height:1.7}
.ln{white-space:nowrap}
.code .c,.c{color:var(--faint)}.code .k,.k{color:var(--accent-ink)}.code .g,.g{color:var(--green)}.code .r,.r{color:var(--red)}
.v{display:inline-flex;margin-top:1.8cqw;font-family:var(--mono);font-size:2.4cqw;padding:1cqw 2cqw;border-radius:1.4cqw;color:var(--green);border:1px solid rgba(62,207,142,.4);white-space:nowrap}
.dg{width:100%;height:auto;max-height:78cqh}
.vs{width:100%;display:flex;flex-direction:column;align-items:stretch;gap:1.4cqw}
.mini{border:1px solid var(--line);border-radius:1.8cqw;background:rgba(255,255,255,.02);padding:2.2cqw 2.6cqw;min-width:0;overflow:hidden}
.ml{font-family:var(--serif);font-weight:600;font-size:3.2cqw;margin-bottom:1cqw}
.mp{font-family:var(--mono);font-size:2.3cqw;line-height:1.6;white-space:nowrap}.mp.g{color:var(--green)}.mp.r{color:var(--red)}
.vslabel{font-family:var(--serif);font-style:italic;font-size:3.2cqw;color:var(--accent-ink);text-align:center;margin:-0.4cqw 0}
.cap{font-family:var(--mono);font-size:11.5px;color:var(--faint);margin-top:11px;text-transform:uppercase;letter-spacing:.08em}
footer{margin-top:52px;border-top:1px solid var(--line);padding-top:26px;color:var(--muted);font-size:15px;line-height:1.6}footer b{color:var(--ink)}
@media(max-width:720px){.grid2{grid-template-columns:1fr}}
`
const ent = (s) => s.replaceAll('·', '&middot;').replaceAll('—', '&mdash;').replaceAll('→', '&rarr;').replaceAll('×', '&times;').replaceAll('’', '&rsquo;').replaceAll('≥', '&ge;').replaceAll('↓', '&darr;').replaceAll('−', '&minus;').replaceAll('✓', '&#10003;').replaceAll('✗', '&#10007;')
const html = `<div class="wrap">
<div class="kick0">Sage Academy · Dark, Site-Matching</div>
<h1 class="page">Terminal + elegant engineering.</h1>
<p class="lede">The dark direction, done right this time — <b>your site's actual language</b>: real terminal windows, proof cards, precise diagrams, Fraunces headlines, monospace. Code-driven (not generated), so it's accurate, editable, and localizable. 12 examples. Compare against the isometric set and tell me which is the channel — or whether we run both (dark for engineering-depth, bright for beginner/explainer).</p>
<div class="grid2">${cards.map((c, i) => `<div><div class="num">${String(i + 1).padStart(2, '0')}</div>${shot(c)}<div class="cap">${c.topic}</div></div>`).join('')}</div>
<footer>Say the word (dark / bright / both) and I lock the template, wire localizable text overlays, and roll it across the slate + covers + banner.</footer>
</div>`
fs.writeFileSync(path.join(root, 'dark-board.html'), `<style>${css}</style>\n${ent(html)}\n`)
console.log('dark-board.html:', Math.round(fs.statSync(path.join(root, 'dark-board.html')).size / 1024), 'KB')
