import { ImageResponse } from 'next/og'

/**
 * OG share card for /academy — the system-map brand on a 1200×630 canvas so
 * every share unfurls as an ad for the method, not a generic gray card.
 */

export const alt = 'Sage Academy — the learning OS that makes you prove it'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const STAGES = ['frame', 'route', 'map', 'decide', 'prove']

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0B0B0E',
          backgroundImage: 'radial-gradient(90% 60% at 50% -10%, rgba(143,160,255,0.14) 0%, rgba(11,11,14,0) 60%)',
          padding: '72px 84px',
          color: '#F2EFE9',
        }}
      >
        <div style={{ display: 'flex', fontSize: 26, letterSpacing: 6, color: '#8FA0FF', textTransform: 'uppercase' }}>
          Sage Academy
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', fontSize: 78, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05, maxWidth: 980 }}>
            Stop collecting certificates. Start proving judgment.
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: '#9C9CA6' }}>
            Real labs · scored evidence · a portfolio at the end
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {STAGES.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: '2px solid rgba(143,160,255,0.4)',
                  borderRadius: 999,
                  padding: '10px 26px',
                  fontSize: 24,
                  color: '#C7CFFF',
                }}
              >
                <div style={{ display: 'flex', width: 10, height: 10, borderRadius: 999, background: i === 4 ? '#4ADE80' : '#8FA0FF' }} />
                {s}
              </div>
              {i < STAGES.length - 1 ? <div style={{ display: 'flex', width: 34, height: 2, background: '#2A2A33' }} /> : null}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  )
}
