'use client'

/**
 * Atlas's living presence — the signature element of the intake. A gradient
 * sphere with a specular highlight and volumetric inner shadow, wrapped in a
 * soft aura and two counter-rotating orbital arcs, with a reactive waveform
 * that comes alive while `speaking`. Today `speaking` is driven by the question
 * typewriter's cadence; when real TTS lands it can be driven by audio amplitude
 * with no API change. All motion is gated behind prefers-reduced-motion —
 * reduced-motion users still get a premium static sphere.
 */
export function AtlasOrb({ speaking, size = 104 }: { speaking: boolean; size?: number }) {
  const core = Math.round(size * 0.56)
  const bars = [0, 1, 2, 3, 4]
  const on = speaking ? ' on' : ''

  return (
    <div className="atlasOrbWrap" style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center' }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
.atlasOrbWrap * { box-sizing: border-box; }
.atlasHalo { position:absolute; inset:-14%; border-radius:50%;
  background: radial-gradient(circle at 50% 46%, rgba(97,124,255,0.55) 0%, rgba(61,90,254,0.22) 38%, transparent 68%);
  filter: blur(6px); }
.atlasArc { position:absolute; border-radius:50%; border:1.5px solid transparent; }
.atlasArc.a1 { inset:2%; border-top-color: rgba(176,190,255,0.85); border-right-color: rgba(176,190,255,0.25); }
.atlasArc.a2 { inset:12%; border-bottom-color: rgba(120,145,255,0.7); border-left-color: rgba(120,145,255,0.2); }
.atlasPulse { position:absolute; inset:6%; border-radius:50%; border:1px solid rgba(143,160,255,0.5); opacity:0; }
.atlasCore { position:relative; display:grid; place-items:center; border-radius:50%;
  background: radial-gradient(circle at 34% 26%, #D6DCFF 0%, #7E90FF 26%, #3D5AFE 60%, #1A2680 100%);
  box-shadow: inset -7px -9px 22px rgba(9,14,60,0.65), inset 7px 8px 18px rgba(255,255,255,0.35), 0 10px 30px rgba(0,0,0,0.4); }
.atlasSpec { position:absolute; top:14%; left:20%; width:34%; height:26%; border-radius:50%;
  background: radial-gradient(circle at 40% 40%, rgba(255,255,255,0.9), transparent 70%); filter: blur(2px); }
.atlasBars { position:relative; display:flex; align-items:center; gap:4px; height:34%; }
.atlasBar { width:3.5px; height:22%; border-radius:2px; background:rgba(255,255,255,0.95); box-shadow:0 0 6px rgba(255,255,255,0.5); }
@media (prefers-reduced-motion: no-preference) {
  .atlasOrbWrap { animation: atlasBob 5.5s ease-in-out infinite; }
  .atlasHalo { animation: atlasHalo 3.6s ease-in-out infinite; }
  .atlasHalo.on { animation: atlasHaloOn 1.7s ease-in-out infinite; }
  .atlasArc.a1 { animation: atlasSpin 7s linear infinite; }
  .atlasArc.a2 { animation: atlasSpinR 9s linear infinite; }
  .atlasCore.on { animation: atlasBreathe 1.7s ease-in-out infinite; }
  .atlasPulse.on { animation: atlasPulse 2.2s ease-out infinite; }
  .atlasBar.on { animation: atlasBar 0.85s ease-in-out infinite; }
}
@keyframes atlasBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes atlasHalo { 0%,100% { opacity:0.75; transform:scale(1); } 50% { opacity:1; transform:scale(1.04); } }
@keyframes atlasHaloOn { 0%,100% { opacity:0.85; transform:scale(1.02); } 50% { opacity:1; transform:scale(1.12); } }
@keyframes atlasSpin { to { transform: rotate(360deg); } }
@keyframes atlasSpinR { to { transform: rotate(-360deg); } }
@keyframes atlasBreathe { 0%,100% { transform:scale(1); } 50% { transform:scale(1.045); } }
@keyframes atlasPulse { 0% { transform:scale(0.82); opacity:0.55; } 100% { transform:scale(1.45); opacity:0; } }
@keyframes atlasBar { 0%,100% { height:22%; } 50% { height:90%; } }
`,
        }}
      />
      <span className={`atlasHalo${on}`} />
      <span className={`atlasArc a1`} style={{ width: size, height: size }} />
      <span className={`atlasArc a2`} style={{ width: size, height: size }} />
      <span className={`atlasPulse${on}`} style={{ width: size, height: size }} />
      <span className={`atlasCore${on}`} style={{ width: core, height: core }}>
        <span className="atlasSpec" />
        <span className="atlasBars">
          {bars.map((i) => (
            <span key={i} className={`atlasBar${on}`} style={{ animationDelay: `${i * 90}ms` }} />
          ))}
        </span>
      </span>
    </div>
  )
}
