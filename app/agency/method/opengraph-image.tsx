import { ImageResponse } from 'next/og'
import { OG, OG_GRID, OG_SIZE, loadOgFonts } from '@/lib/agency/og'

export const runtime = 'nodejs'
export const alt =
  'Proof-Driven Delivery — every claim carries its artifact; ready is a file, not a feeling.'
export const size = OG_SIZE
export const contentType = 'image/png'

// The three evidence tiers — accent mapping mirrors the /method tier cards.
const TIERS = [
  { id: 'T1', label: 'LIVE / CI', color: OG.pass },
  { id: 'T2', label: 'LOCAL PROOF', color: OG.primary },
  { id: 'T3', label: 'WRITTEN ONLY', color: OG.fail },
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
            THE METHOD
          </span>
        </div>

        {/* headline */}
        <span
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: OG.text,
            lineHeight: 1.14,
            maxWidth: 1040,
          }}
        >
          PROOF-DRIVEN DELIVERY
        </span>

        {/* tier tiles */}
        <div style={{ display: 'flex' }}>
          {TIERS.map((tier, i) => (
            <div
              key={tier.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: 210,
                height: 118,
                backgroundColor: OG.card,
                border: `1px solid ${OG.border}`,
                borderTop: `2px solid ${tier.color}`,
                marginLeft: i === 0 ? 0 : 20,
              }}
            >
              <span
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: tier.color,
                }}
              >
                {tier.id}
              </span>
              <span
                style={{
                  fontSize: 15,
                  letterSpacing: '0.16em',
                  color: OG.dim,
                  marginTop: 8,
                }}
              >
                {tier.label}
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
            AGENCY.SAGEIDEAS.DEV/METHOD
          </span>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  )
}
