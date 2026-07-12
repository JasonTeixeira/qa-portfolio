import { ImageResponse } from 'next/og'
import { CASE_STUDIES, type BadgeVariant } from '@/data/agency/case-studies'
import { OG, OG_GRID, OG_SIZE, loadOgFonts } from '@/lib/agency/og'

export const runtime = 'nodejs'
export const alt = 'Case study — Jason Teixeira'
export const size = OG_SIZE
export const contentType = 'image/png'

/**
 * Badge variant → accent hex. Mirrors the .ag-badge--* colors in
 * app/agency/agency.css — Satori can't resolve CSS vars, so the hex values
 * from lib/agency/og.ts are used here.
 */
const VARIANT_HEX: Record<BadgeVariant, string> = {
  live: OG.pass,
  local: OG.pass,
  internal: OG.log,
  proto: OG.fail,
}

function titleFontSize(title: string): number {
  if (title.length <= 44) return 64
  if (title.length <= 80) return 56
  return 52
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const study = CASE_STUDIES.find((s) => s.id === slug)
  const fonts = await loadOgFonts()

  const accent = study ? VARIANT_HEX[study.badge.variant] : OG.primary
  const title = study ? study.title : 'SYSTEMS THAT PROVE THEY WORK.'
  const meta = study ? study.badge.label : ''

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
        {/* kicker badge */}
        <div style={{ display: 'flex' }}>
          <span
            style={{
              backgroundColor: accent,
              color: OG.deep,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '0.18em',
              padding: '10px 18px',
            }}
          >
            CASE STUDY
          </span>
        </div>

        {/* study title */}
        <span
          style={{
            fontSize: titleFontSize(title),
            fontWeight: 700,
            color: OG.text,
            lineHeight: 1.2,
            maxWidth: 1060,
          }}
        >
          {title}
        </span>

        {/* bottom row: badge label + mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: `1px solid ${OG.border}`,
            paddingTop: 28,
          }}
        >
          <span
            style={{ fontSize: 18, letterSpacing: '0.14em', color: OG.dim }}
          >
            {meta || 'AGENCY.SAGEIDEAS.DEV/WORK'}
          </span>
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
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  )
}
