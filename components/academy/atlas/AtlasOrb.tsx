'use client'

/**
 * Atlas's animated "voice" orb. A glowing core with concentric pulse rings and
 * an equalizer that comes alive while `speaking` is true. Today `speaking` is
 * driven by the question typewriter's cadence; when real TTS lands it can be
 * driven by audio amplitude with no change to this component's API.
 * All motion is gated behind prefers-reduced-motion.
 */
export function AtlasOrb({ speaking, size = 128 }: { speaking: boolean; size?: number }) {
  const core = Math.round(size * 0.6)
  const bars = [0, 1, 2, 3, 4]
  const on = speaking ? ' on' : ''

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center' }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
.atlasRing { position:absolute; border-radius:50%; border:1px solid rgba(143,160,255,0.5); opacity:0; }
.atlasCore { position:relative; display:grid; place-items:center; border-radius:50%;
  background: radial-gradient(circle at 34% 28%, #A9B6FF 0%, #3D5AFE 52%, #1B2A9E 100%);
  box-shadow: 0 0 46px rgba(61,90,254,0.55), inset 0 0 26px rgba(255,255,255,0.18); }
.atlasBars { display:flex; align-items:center; gap:4px; height:38%; }
.atlasBar { width:4px; height:22%; border-radius:2px; background:rgba(255,255,255,0.92); }
@media (prefers-reduced-motion: no-preference) {
  .atlasCore { animation: atlasBreathe 3.4s ease-in-out infinite; }
  .atlasCore.on { animation: atlasBreatheOn 1.6s ease-in-out infinite; }
  .atlasRing.on { animation: atlasPulse 2.1s ease-out infinite; }
  .atlasRing.r2.on { animation-delay: 0.7s; }
  .atlasRing.r3.on { animation-delay: 1.4s; }
  .atlasBar.on { animation: atlasBar 0.9s ease-in-out infinite; }
}
@keyframes atlasBreathe { 0%,100% { transform:scale(1); } 50% { transform:scale(1.03); } }
@keyframes atlasBreatheOn { 0%,100% { transform:scale(1); } 50% { transform:scale(1.06); } }
@keyframes atlasPulse { 0% { transform:scale(0.72); opacity:0.6; } 100% { transform:scale(1.5); opacity:0; } }
@keyframes atlasBar { 0%,100% { height:22%; } 50% { height:88%; } }
`,
        }}
      />
      <span className={`atlasRing r2${on}`} style={{ width: size, height: size }} />
      <span className={`atlasRing r3${on}`} style={{ width: size * 0.86, height: size * 0.86 }} />
      <span className={`atlasCore${on}`} style={{ width: core, height: core }}>
        <span className="atlasBars">
          {bars.map((i) => (
            <span key={i} className={`atlasBar${on}`} style={{ animationDelay: `${i * 90}ms` }} />
          ))}
        </span>
      </span>
    </div>
  )
}
