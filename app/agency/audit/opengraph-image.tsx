import { ImageResponse } from 'next/og'
import { OG, OG_GRID, OG_SIZE, loadOgFonts } from '@/lib/agency/og'

export const runtime = 'nodejs'
export const alt =
  'Free automated teardown — paste a URL, get a scored teardown.'
export const size = OG_SIZE
export const contentType = 'image/png'

// Tool categories only — values are "?" on purpose. It's a tool, not a claim.
const TILES = ['PERF', 'A11Y', 'BP', 'SEO']

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
            FREE AUTOMATED TEARDOWN
          </span>
        </div>

        {/* headline */}
        <span
          style={{
            fontSize: 60,
            fontWeight: 700,
            color: OG.text,
            lineHeight: 1.18,
            maxWidth: 1040,
          }}
        >
          PASTE A URL. GET A SCORED TEARDOWN.
        </span>

        {/* score tiles — honest "?" placeholders */}
        <div style={{ display: 'flex' }}>
          {TILES.map((label, i) => (
            <div
              key={label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: 158,
                height: 118,
                backgroundColor: OG.card,
                border: `1px solid ${OG.border}`,
                marginLeft: i === 0 ? 0 : 20,
              }}
            >
              <span
                style={{
                  fontSize: 17,
                  letterSpacing: '0.18em',
                  color: OG.dim,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontSize: 42,
                  fontWeight: 700,
                  color: OG.dim,
                  marginTop: 8,
                }}
              >
                ?
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
            AGENCY.SAGEIDEAS.DEV/AUDIT
          </span>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  )
}
