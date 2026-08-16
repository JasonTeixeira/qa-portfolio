import { ImageResponse } from 'next/og'
import { getAllConcepts, getConcept } from '@/lib/academy/concepts'

/**
 * Per-concept OG share card: the lesson's real question on the academy canvas.
 * 34 pages → 34 distinct unfurls, each one an ad for a real authored lesson.
 */

export const alt = 'Sage Academy lesson preview'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return getAllConcepts().map((c) => ({ slug: c.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const concept = getConcept(slug)
  const question = concept?.question ?? 'A real lesson from Sage Academy'
  const course = concept?.courseTitle ?? 'Sage Academy'
  const duration = concept ? `${concept.durationMin} min lesson` : 'free preview'

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
        <div style={{ display: 'flex', fontSize: 25, letterSpacing: 5, color: '#8FA0FF', textTransform: 'uppercase' }}>
          {course}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: question.length > 70 ? 56 : 68,
            fontWeight: 700,
            letterSpacing: -1.5,
            lineHeight: 1.12,
            maxWidth: 1020,
          }}
        >
          {question}
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
            <div style={{ display: 'flex', width: 10, height: 10, borderRadius: 999, background: '#4ADE80' }} />
            {duration} · proof, not vibes
          </div>
          <div style={{ display: 'flex', fontSize: 24, color: '#6B6B76' }}>sageideas.dev</div>
        </div>
      </div>
    ),
    size,
  )
}
