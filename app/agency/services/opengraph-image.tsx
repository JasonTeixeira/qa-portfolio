import { ImageResponse } from 'next/og'
import { OG, OG_GRID, OG_SIZE, loadOgFonts } from '@/lib/agency/og'

export const runtime = 'nodejs'
export const alt = 'Services — fixed scope, proof included.'
export const size = OG_SIZE
export const contentType = 'image/png'

// The three fixed-scope engagements, mirroring data/agency/services.ts.
const TILES: readonly { kicker: string; name: string; accent: string }[] = [
  { kicker: 'AI SYSTEMS', name: 'AI WORKFLOW BUILD', accent: OG.ai },
  { kicker: 'QA COVERAGE', name: 'TEST COVERAGE SPRINT', accent: OG.browser },
  { kicker: 'RELEASE SAFETY', name: 'RELEASE GATE SETUP', accent: OG.primary },
]

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
        {/* kicker */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              width: 34,
              height: 2,
              backgroundColor: OG.primary,
              marginRight: 18,
            }}
          />
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: OG.primary,
            }}
          >
            SERVICES
          </span>
        </div>

        {/* headline */}
        <span
          style={{
            fontSize: 62,
            fontWeight: 700,
            color: OG.text,
            lineHeight: 1.16,
            maxWidth: 1040,
          }}
        >
          FIXED SCOPE. PROOF INCLUDED.
        </span>

        {/* three service tiles */}
        <div style={{ display: 'flex' }}>
          {TILES.map((tile, i) => (
            <div
              key={tile.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: 342,
                height: 118,
                padding: '0 24px',
                backgroundColor: OG.card,
                border: `1px solid ${OG.border}`,
                borderTop: `3px solid ${tile.accent}`,
                marginLeft: i === 0 ? 0 : 22,
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  letterSpacing: '0.18em',
                  color: tile.accent,
                }}
              >
                {tile.kicker}
              </span>
              <span
                style={{
                  fontSize: 21,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: OG.text,
                  marginTop: 10,
                }}
              >
                {tile.name}
              </span>
            </div>
          ))}
        </div>

        {/* bottom mark row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: `1px solid ${OG.border}`,
            paddingTop: 26,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: OG.text,
              }}
            >
              JASON TEIXEIRA
            </span>
            <span style={{ fontSize: 22, color: OG.primary, marginLeft: 12 }}>
              ◆
            </span>
          </div>
          <span
            style={{ fontSize: 17, letterSpacing: '0.14em', color: OG.dim }}
          >
            AGENCY.SAGEIDEAS.DEV/SERVICES
          </span>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  )
}
