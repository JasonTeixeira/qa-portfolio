import { ImageResponse } from 'next/og'

export const alt = 'The Sage Academy course catalog'
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
          backgroundImage: 'radial-gradient(90% 60% at 50% -10%, rgba(143,160,255,0.14) 0%, rgba(11,11,14,0) 60%)',
          padding: '72px 84px',
          color: '#F2EFE9',
        }}
      >
        <div style={{ display: 'flex', fontSize: 26, letterSpacing: 6, color: '#8FA0FF', textTransform: 'uppercase' }}>
          Sage Academy · The catalog
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', fontSize: 70, fontWeight: 700, letterSpacing: -2, lineHeight: 1.08, maxWidth: 1000 }}>
            Every course ends in an artifact a reviewer trusts.
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: '#9C9CA6' }}>Real labs · scored evidence · verifiable certificates</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              border: '2px solid rgba(143,160,255,0.4)',
              borderRadius: 999,
              padding: '10px 26px',
              fontSize: 23,
              color: '#C7CFFF',
            }}
          >
            <div style={{ display: 'flex', width: 10, height: 10, borderRadius: 999, background: '#18B663' }} />
            one engine · one proof standard
          </div>
          <div style={{ display: 'flex', fontSize: 24, color: '#6B6B76' }}>sageideas.dev</div>
        </div>
      </div>
    ),
    size,
  )
}
