import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const SIZE = { width: 1200, height: 630 } as const

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = (searchParams.get('title') ?? 'Sage Ideas').slice(0, 80)
  const subtitle = (
    searchParams.get('subtitle') ?? 'AI-Native Studio for B2B Operators'
  ).slice(0, 120)
  const eyebrow = (searchParams.get('eyebrow') ?? 'SAGE IDEAS · STUDIO').slice(0, 60)

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#09090B',
          padding: '64px 72px',
          position: 'relative',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        {/* Top-left wordmark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            color: '#FAFAFA',
            fontSize: 24,
            letterSpacing: '0.18em',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #06B6D4, #0EA5E9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#09090B',
              fontWeight: 800,
              fontSize: 22,
            }}
          >
            S
          </div>
          Sage Ideas
        </div>

        {/* Main copy block — centered vertically */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            marginTop: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 18,
              color: '#06B6D4',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontFamily: 'monospace',
              marginBottom: 24,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 76,
              color: '#FAFAFA',
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: '-0.02em',
              marginBottom: 28,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 32,
              color: '#A1A1AA',
              fontWeight: 400,
              lineHeight: 1.3,
              maxWidth: 980,
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Bottom strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#71717A',
            fontSize: 22,
            fontFamily: 'monospace',
            paddingTop: 28,
            borderTop: '1px solid #27272A',
          }}
        >
          <span>sageideas.dev</span>
          <span style={{ color: '#06B6D4' }}>{'>'} senior solo · agency rigor</span>
        </div>

        {/* Decorative gradient orb */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            background:
              'radial-gradient(circle at center, rgba(6,182,212,0.18), transparent 60%)',
            display: 'flex',
          }}
        />
      </div>
    ),
    SIZE,
  )
}
