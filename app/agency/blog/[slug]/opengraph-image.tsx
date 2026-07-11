import { ImageResponse } from 'next/og'
import { getPublishedPost, type PostCategory } from '@/data/agency/posts'
import { OG, OG_GRID, OG_SIZE, loadOgFonts } from '@/lib/agency/og'

export const runtime = 'nodejs'
export const alt = 'The Proof Log — Jason Teixeira'
export const size = OG_SIZE
export const contentType = 'image/png'

/**
 * Category → accent hex. Mirrors CATEGORY_ACCENT in data/agency/posts.ts,
 * which maps to CSS vars — Satori can't resolve vars, so the hex values from
 * app/agency/agency.css are inlined here.
 */
const ACCENT_HEX: Record<PostCategory, string> = {
  'AI QUALITY': OG.ai,
  'BROWSER QA': OG.browser,
  'RELEASE SAFETY': OG.pass,
  OPERATIONS: OG.primary,
  DOCUMENTATION: OG.log,
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
  const post = getPublishedPost(slug)
  const fonts = await loadOgFonts()

  const accent = post ? ACCENT_HEX[post.category] : OG.log
  const kicker = post ? post.category : 'THE PROOF LOG'
  const title = post
    ? post.title
    : 'FIELD NOTES FROM SYSTEMS THAT PROVE THEY WORK.'
  const meta = post ? `${post.date} · ${post.readMin} MIN READ` : ''

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
        {/* category badge */}
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
            {kicker}
          </span>
        </div>

        {/* post title */}
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

        {/* bottom row: meta + mark */}
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
            {meta || 'AGENCY.SAGEIDEAS.DEV/BLOG'}
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
