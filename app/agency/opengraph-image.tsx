import { ImageResponse } from 'next/og'
import { OG, OG_GRID, OG_SIZE, loadOgFonts } from '@/lib/agency/og'

export const runtime = 'nodejs'
export const alt =
  'Jason Teixeira — AI / QA / Automation. Systems that prove they work.'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image() {
  const fonts = await loadOgFonts()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: OG.bg,
          ...OG_GRID,
          padding: '52px 64px',
          fontFamily: 'JetBrains Mono',
        }}
      >
        {/* top row: identity mark + domain */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: OG.text,
              }}
            >
              JASON TEIXEIRA
            </span>
            <span style={{ fontSize: 24, color: OG.primary, marginLeft: 14 }}>
              ◆
            </span>
          </div>
          <span
            style={{ fontSize: 18, letterSpacing: '0.14em', color: OG.dim }}
          >
            AGENCY.SAGEIDEAS.DEV
          </span>
        </div>

        {/* center: headline */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: OG.primary,
              lineHeight: 1.05,
            }}
          >
            AI / QA / AUTOMATION
          </span>
          <span
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: OG.text,
              lineHeight: 1.2,
              marginTop: 18,
            }}
          >
            SYSTEMS THAT PROVE THEY WORK.
          </span>
        </div>

        {/* bottom: terminal strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: OG.deep,
            border: `1px solid ${OG.border}`,
            padding: '22px 28px',
            fontSize: 22,
          }}
        >
          <span style={{ color: OG.pass }}>$</span>
          <span style={{ color: OG.text, marginLeft: 14 }}>
            verify agency.sageideas.dev
          </span>
          <span style={{ color: OG.dim, marginLeft: 18 }}>→</span>
          <span style={{ color: OG.dim, marginLeft: 18 }}>READINESS:</span>
          <span style={{ color: OG.text, fontWeight: 700, marginLeft: 12 }}>
            SHIP
          </span>
          <span style={{ color: OG.pass, fontWeight: 700, marginLeft: 12 }}>
            ✓
          </span>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  )
}
