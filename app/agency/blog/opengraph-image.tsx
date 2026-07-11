import { ImageResponse } from 'next/og'
import { OG, OG_GRID, OG_SIZE, loadOgFonts } from '@/lib/agency/og'

export const runtime = 'nodejs'
export const alt =
  'The Proof Log — field notes from systems that prove they work.'
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
          padding: '56px 64px',
          fontFamily: 'JetBrains Mono',
        }}
      >
        {/* kicker */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              width: 34,
              height: 2,
              backgroundColor: OG.log,
              marginRight: 18,
            }}
          />
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: OG.log,
            }}
          >
            THE PROOF LOG
          </span>
        </div>

        {/* headline */}
        <span
          style={{
            fontSize: 62,
            fontWeight: 700,
            color: OG.text,
            lineHeight: 1.18,
            maxWidth: 1020,
          }}
        >
          FIELD NOTES FROM SYSTEMS THAT PROVE THEY WORK.
        </span>

        {/* bottom mark row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: `1px solid ${OG.border}`,
            paddingTop: 28,
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
            AGENCY.SAGEIDEAS.DEV/BLOG
          </span>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  )
}
