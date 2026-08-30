// Bundle rag-flagship.html into a self-contained, playable artifact:
// inline fonts + the 9 VO clips as data URIs. Run: node scripts/build-video-artifact.mjs
import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const b64 = (p) => (fs.existsSync(p) ? fs.readFileSync(p).toString('base64') : null)
const fr = b64('/tmp/fraunces.woff2'), pp = b64('/tmp/poppins800.woff2'), jb = b64('/tmp/jbmono400.woff2')

// inline the VO clips
const voDir = path.join(root, 'renders', 'vo')
const AUDIO = {}
for (const f of fs.readdirSync(voDir).filter(f => f.endsWith('.mp3'))) {
  AUDIO[f.replace('.mp3', '')] = `data:audio/mpeg;base64,${fs.readFileSync(path.join(voDir, f)).toString('base64')}`
}

let html = fs.readFileSync(path.join(root, 'video', 'rag-flagship.html'), 'utf8')

// 1. replace the google-fonts link with inline @font-face
const fontCss = `<style>
${fr ? `@font-face{font-family:'Fraunces';src:url(data:font/woff2;base64,${fr}) format('woff2');font-weight:600;font-display:swap}` : ''}
${pp ? `@font-face{font-family:'Poppins';src:url(data:font/woff2;base64,${pp}) format('woff2');font-weight:600 800;font-display:swap}` : ''}
${jb ? `@font-face{font-family:'JetBrains Mono';src:url(data:font/woff2;base64,${jb}) format('woff2');font-weight:400 700;font-display:swap}` : ''}
</style>`
html = html.replace(/<link href="https:\/\/fonts\.googleapis[^>]*>/, fontCss)

// 2. inline audio map + rewire the Audio() calls
html = html.replace("const V = '/renders/vo/';", `const AUDIO = ${JSON.stringify(AUDIO)};\nconst V = '';`)
html = html.replaceAll("new Audio(V+s.audio+'.mp3')", 'new Audio(AUDIO[s.audio])')

// 3. scale the fixed 1280x720 stage to fit the artifact viewport (responsive)
html = html.replace('<div id="stage">', '<div id="fit"><div id="stage">').replace('</body>', `</div>
<style>html,body{width:auto;height:auto;background:#000}#fit{width:100%;max-width:1280px;margin:0 auto;aspect-ratio:16/9;position:relative}#fit #stage{position:absolute;top:0;left:0;transform-origin:top left}</style>
<script>function fitStage(){const f=document.getElementById('fit'),s=document.getElementById('stage');const k=f.clientWidth/1280;s.style.transform='scale('+k+')';f.style.height=(720*k)+'px';}addEventListener('resize',fitStage);fitStage();</script>
</body>`)

fs.writeFileSync(path.join(root, 'video-artifact.html'), html)
console.log('video-artifact.html:', Math.round(fs.statSync(path.join(root, 'video-artifact.html')).size / 1024), 'KB')
