// motion-engine.js — the shared video engine. A composition just defines BEATS and
// calls mount(BEATS). Handles: style/fonts injection, DOM build, cue-sync (word
// timestamps via window.__WORDS), dwell durations (window.__DURS), deterministic
// seek (window.__seek), progress + __ready. One engine for every video.
import { icon } from './icons.js';

export const STYLE = `
:root{--bg:#0B0B0E;--s1:#121218;--s2:#16161d;--line:#1E1E24;--line2:#2A2A33;--ink:#F2EFE9;--muted:#9C9CA6;--faint:#6C6E7C;
--brand:#3D5AFE;--brand2:#6E86FF;--client:#6ECBFF;--cdn:#4FE3CF;--loadbal:#FF7DB1;--gateway:#8FA0FF;--service:#B79CFF;--cache:#FFA94D;--db:#5EE08C;--queue:#F5C64F;--worker:#E08FFF;--failure:#FF6B6B;--ok:#5EE08C;--warn:#F5C64F;
--display:'Fraunces',Georgia,serif;--sans:'Hanken Grotesk',system-ui,sans-serif;--mono:'JetBrains Mono',ui-monospace,monospace;}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:var(--bg);color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased}
.stage{width:1920px;height:1080px;position:relative;background:radial-gradient(1500px 950px at 50% 40%,rgba(61,90,254,.05),transparent 72%),var(--bg)}
.stage::before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.04) 1.3px,transparent 1.3px);background-size:46px 46px}
.rail{position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,var(--client),var(--db),var(--warn),var(--service),var(--failure),var(--gateway));z-index:6}
.beat{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px;text-align:center;padding:0 130px}
.el{opacity:0}.word{display:inline-block;opacity:0;will-change:transform,opacity}
.kicker{font-family:var(--mono);font-size:22px;letter-spacing:.3em;text-transform:uppercase;color:var(--gateway)}
.cap{font-size:34px;color:var(--muted);font-weight:500;max-width:1200px;line-height:1.35}.cap b{color:var(--ink);font-weight:700}
.key{font-family:var(--mono);font-size:26px;letter-spacing:.2em;text-transform:uppercase;padding:13px 26px;border:1px solid var(--line2);border-radius:12px;background:rgba(255,255,255,.02);color:var(--ink)}
.handle{font-family:var(--display);font-weight:700;font-size:92px;line-height:1.03;letter-spacing:-.02em}
.door{font-family:var(--mono);font-size:36px;letter-spacing:.12em;color:var(--brand2)}
.mark{display:flex;align-items:center;gap:18px;color:var(--muted);font-size:30px;font-weight:600}.mark svg{width:56px;height:56px}
.stamp{font-family:var(--display);font-weight:700;padding:16px 40px;border-radius:14px;font-size:54px;transform-origin:center}
.stamp.fail{color:var(--failure);border:5px solid var(--failure)}.stamp.pass{color:var(--ok);border:5px solid var(--ok)}
.row{display:flex;align-items:center;justify-content:center;gap:40px;flex-wrap:wrap}
.mbox{display:flex;flex-direction:column;align-items:center;gap:12px;padding:28px 40px;border-radius:20px;border:2.5px solid var(--gateway);position:relative;min-width:200px}
.mbox .nm{font-family:var(--display);font-weight:600;font-size:48px}.mbox .tg{font-family:var(--mono);font-size:16px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em}
.badge{position:absolute;top:-16px;right:-16px;font-family:var(--mono);font-size:22px;font-weight:700;padding:6px 14px;border-radius:9px;background:var(--bg);color:var(--failure);border:2px solid var(--failure)}
.badge.yes{color:var(--ok);border-color:var(--ok)}
.prog{position:absolute;bottom:44px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:6}
.prog i{width:26px;height:4px;border-radius:2px;background:var(--line2)}
.qmark{font-family:var(--display);font-weight:700;font-size:160px;color:var(--warn);line-height:1}
.title{font-family:var(--display);font-weight:600;font-size:64px;line-height:1.08;max-width:1400px;letter-spacing:-.015em}
.big{font-family:var(--display);font-weight:600;font-size:100px;line-height:1.02;letter-spacing:-.015em}.big .accent{color:var(--brand2)}
`;

// ---- authoring helpers (H) ----
const MARK = `<svg viewBox="10 15 48 48" fill="none"><path d="M20 44 A10 10 0 0 1 20 24 A13 13 0 0 1 45 21 A9 9 0 0 1 48 44 Z" fill="none" stroke="#F2EFE9" stroke-width="4.2" stroke-linejoin="round"/><circle cx="26" cy="54" r="3.4" fill="#F2EFE9"/><circle cx="36" cy="54" r="3.4" fill="#F2EFE9"/><circle cx="46" cy="54" r="3.4" fill="#F2EFE9"/></svg>`;
export const H = {
  wrap: (anim, cue, d, inner) => `<div class="el" data-anim="${anim}" data-cue="${cue}" data-d="${d}">${inner}</div>`,
  cap: (cue, d, t) => `<div class="cap el" data-anim="rise" data-cue="${cue}" data-d="${d}">${t}</div>`,
  key: (cue, d, t) => `<div class="key el" data-anim="pop" data-cue="${cue}" data-d="${d}">${t}</div>`,
  kicker: (cue, d, t) => `<div class="kicker el" data-anim="fade" data-cue="${cue}" data-d="${d}">${t}</div>`,
  stamp: (cls, cue, d, t) => `<div class="stamp ${cls} el" data-anim="slam" data-cue="${cue}" data-d="${d}">${t}</div>`,
  beat: (...els) => `<div class="beat">${els.join('')}</div>`,
  mbox: (nm, tg, x) => `<div class="mbox">${icon('cpu', 52)}<span class="nm">${nm}</span><span class="tg">${tg}</span>${x || ''}</div>`,
  // reusable recipes
  vspace: (pts, q, near) => `<svg viewBox="0 0 440 320" width="620"><rect x="6" y="6" width="428" height="308" rx="14" fill="none" stroke="var(--line2)"/>${pts.map(p => `<circle cx="${20 + p[0] * 400}" cy="${300 - p[1] * 280}" r="7" fill="var(--gateway)" opacity=".8"/>`).join('')}${q ? `<circle cx="${20 + q[0] * 400}" cy="${300 - q[1] * 280}" r="12" fill="var(--brand2)"/>` : ''}${near ? near.map(p => `<circle cx="${20 + p[0] * 400}" cy="${300 - p[1] * 280}" r="9" fill="var(--db)"/>`).join('') : ''}${q && near ? `<circle cx="${20 + q[0] * 400}" cy="${300 - q[1] * 280}" r="80" fill="none" stroke="var(--db)" stroke-dasharray="4 5"/>` : ''}</svg>`,
  chunkGrid: (on, cols = 6) => `<svg viewBox="0 0 460 200" width="560">${Array.from({ length: cols * 2 }).map((_, i) => `<rect x="${10 + (i % cols) * (450 / cols)}" y="${10 + Math.floor(i / cols) * 96}" width="${430 / cols}" height="82" rx="8" fill="none" stroke="var(--${on === i ? 'warn' : 'line2'})" stroke-width="${on === i ? 3 : 1.5}"/>`).join('')}</svg>`,
  docLines: (hl = 1) => `<div style="display:flex;flex-direction:column;gap:11px;padding:22px;border:2px solid var(--service);border-radius:14px">${[0, 1, 2].map(i => `<div style="width:130px;height:12px;background:var(--${i === hl ? 'warn' : 'line2'});border-radius:6px"></div>`).join('')}</div>`,
  mark: (cue, d) => `<div class="mark el" data-anim="fade" data-cue="${cue}" data-d="${d}">${MARK}<span>proof, not paper.</span></div>`,
  door: (cue, d, t = 'sageideas.dev/academy') => `<div class="door el" data-anim="rise" data-cue="${cue}" data-d="${d}">${t}</div>`,
};

// ---- engine ----
const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
function cueTime(key, word, fb) { const wd = (window.__WORDS || {})[key]; if (!wd) return fb; const t = norm(word); const hit = wd.words.find(x => norm(x.w) === t) || wd.words.find(x => norm(x.w).startsWith(t)) || wd.words.find(x => norm(x.w).includes(t)); return hit ? hit.start : fb; }
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), eOut = p => 1 - Math.pow(1 - p, 3), eBack = p => { const c = 2.2; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const XF = 0.55; // scene crossfade — a touch longer for a smoother, more fluid dissolve
function anim(el, lt) {
  const kind = el.dataset.anim, d = +el.dataset.d || 0, t = +el.dataset.t || 0.6; let p = clamp((lt - d) / t, 0, 1);
  if (el.classList.contains('word')) { const e = eOut(clamp((lt - d) / 0.5, 0, 1)); el.style.opacity = e; el.style.transform = `translateY(${(1 - e) * 22}px)`; return; }
  const e = kind === 'slam' ? eBack(p) : eOut(p);
  if (kind === 'slam') { el.style.opacity = clamp(p * 4, 0, 1); el.style.transform = `scale(${0.55 + e * 0.45}) rotate(-4deg)`; }
  else if (kind === 'pop') { el.style.opacity = eOut(p); el.style.transform = `scale(${0.92 + eOut(p) * 0.08})`; }
  else if (kind === 'rise') { el.style.opacity = e; el.style.transform = `translateY(${(1 - e) * 30}px)`; }
  else { el.style.opacity = eOut(p); }
}

export function mount(BEATS) {
  const link = document.createElement('link'); link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap';
  document.head.appendChild(link);
  const st = document.createElement('style'); st.textContent = STYLE; document.head.appendChild(st);
  const stage = document.createElement('div'); stage.className = 'stage'; stage.id = 'stage';
  stage.innerHTML = '<div class="rail"></div>'; document.body.appendChild(stage);

  const beatEls = []; let starts = [], durs = [], acc = 0;
  BEATS.forEach(([key, dFallback, html], i) => {
    const d = (window.__DURS && window.__DURS[i]) || (window.__WORDS && window.__WORDS[key] && window.__WORDS[key].dur) || dFallback;
    starts[i] = acc; durs[i] = d; acc += d;
    const div = document.createElement('div'); div.innerHTML = html; const b = div.firstElementChild;
    b.dataset.key = key; b.style.opacity = 0; b.style.display = 'none'; stage.appendChild(b); beatEls.push(b);
    b.querySelectorAll('[data-cue]').forEach(el => { const base = cueTime(key, el.dataset.cue, +el.dataset.d || 0); const si = +el.dataset.si || 0, stg = +el.dataset.stag || 0; el.dataset.d = (base + si * stg).toFixed(3); });
    b.querySelectorAll('.kin').forEach(k => { const d0 = +k.dataset.d || 0, stp = +k.dataset.stag || 0.07; const words = k.textContent.split(' '); k.textContent = ''; words.forEach((w, wi) => { const s = document.createElement('span'); s.className = 'word'; s.textContent = w; s.dataset.d = (d0 + wi * stp).toFixed(3); k.appendChild(s); if (wi < words.length - 1) k.appendChild(document.createTextNode(' ')); }); });
  });
  window.__duration = acc;
  const prog = document.createElement('div'); prog.className = 'prog'; prog.innerHTML = BEATS.map(() => '<i></i>').join(''); stage.appendChild(prog);
  window.__seek = (ms) => {
    const t = ms / 1000;
    beatEls.forEach((b, k) => {
      const inP = (t - (starts[k] - XF)) / XF, outP = k === BEATS.length - 1 ? Infinity : ((starts[k] + durs[k]) - t) / XF, op = clamp(Math.min(inP, outP), 0, 1);
      if (op <= 0.002) { b.style.display = 'none'; b.style.opacity = 0; return; }
      b.style.display = 'flex'; b.style.opacity = op; const lt = t - starts[k];
      b.querySelectorAll('[data-anim],.word').forEach(el => anim(el, lt));
    });
    let cur = 0, a = 0; for (let k = 0; k < BEATS.length; k++) { if (t >= a) cur = k; a += durs[k]; }[...prog.children].forEach((n, k) => n.style.background = k <= cur ? 'var(--brand)' : 'var(--line2)');
  };
  window.__seek(0); window.__ready = true;
}
