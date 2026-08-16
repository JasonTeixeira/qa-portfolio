import { ImageResponse } from 'next/og'

/**
 * OG share card for /interview — gold sub-brand, same canvas grammar as the
 * academy card so shares are unmistakably one family.
 */

export const alt = 'Interview Mastery — unlimited voice mocks scored against a consistent bar'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

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
          backgroundImage: 'radial-gradient(90% 60% at 50% -10%, rgba(224,169,62,0.16) 0%, rgba(11,11,14,0) 60%)',
          padding: '72px 84px',
          color: '#F2EFE9',
        }}
      >
        <div style={{ display: 'flex', fontSize: 26, letterSpacing: 6, color: '#E0A93E', textTransform: 'uppercase' }}>
          Sage Interview Mastery
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', fontSize: 76, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05, maxWidth: 1000 }}>
            40 interviews of practice. Before the 4 that count.
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: '#9C9CA6' }}>
            Voice-first mocks · scored debriefs · loop-ready guarantee
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              border: '2px solid rgba(224,169,62,0.5)',
              borderRadius: 999,
              padding: '12px 30px',
              fontSize: 25,
              color: '#F0C36A',
            }}
          >
            <div style={{ display: 'flex', width: 12, height: 12, borderRadius: 999, background: '#E0A93E' }} />
            Live mock · pressure calibrated to your bar
          </div>
        </div>
      </div>
    ),
    size,
  )
}
