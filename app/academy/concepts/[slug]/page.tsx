import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllConcepts, getConcept, getRelatedConcepts } from '@/lib/academy/concepts'
import { JudgmentLoopDiagram } from '@/components/academy/concepts/JudgmentLoopDiagram'

export function generateStaticParams() {
  return getAllConcepts().map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const concept = getConcept(slug)
  if (!concept) return {}
  return {
    title: `${concept.question} — Sage Academy`,
    description: concept.summary,
    alternates: { canonical: `https://www.sageideas.dev/academy/concepts/${concept.slug}` },
    openGraph: {
      title: concept.question,
      description: concept.summary,
      url: `https://www.sageideas.dev/academy/concepts/${concept.slug}`,
      type: 'article',
    },
  }
}

const S = {
  page: {
    minHeight: '100vh',
    background: '#0B0B0E',
    color: '#F2EFE9',
    fontFamily: 'var(--font-sans), sans-serif',
  } as const,
  main: { maxWidth: 820, margin: '0 auto', padding: '64px 24px 96px' } as const,
  kicker: {
    fontFamily: 'var(--font-mono), monospace',
    fontSize: 10.5,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.14em',
    color: '#8FA0FF',
  },
  h1: {
    margin: '14px 0 0',
    fontFamily: 'var(--font-serif), Georgia, serif',
    fontWeight: 560,
    fontSize: 'clamp(30px, 4.5vw, 46px)',
    lineHeight: 1.08,
    letterSpacing: '-0.02em',
  } as const,
  mono: { fontFamily: 'var(--font-mono), monospace', fontSize: 11, color: '#9598A2' } as const,
}

export default async function ConceptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const concept = getConcept(slug)
  if (!concept) notFound()
  const related = getRelatedConcepts(concept)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: concept.title,
    description: concept.summary,
    educationalLevel: 'Beginner to intermediate',
    learningResourceType: 'Lesson preview',
    isPartOf: { '@type': 'Course', name: concept.courseTitle, provider: { '@type': 'Organization', name: 'Sage Academy', url: 'https://www.sageideas.dev/academy' } },
    url: `https://www.sageideas.dev/academy/concepts/${concept.slug}`,
    ...(concept.durationMin ? { timeRequired: `PT${concept.durationMin}M` } : {}),
  }
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Academy', item: 'https://www.sageideas.dev/academy' },
      { '@type': 'ListItem', position: 2, name: 'Concepts', item: 'https://www.sageideas.dev/academy/concepts' },
      { '@type': 'ListItem', position: 3, name: concept.question, item: `https://www.sageideas.dev/academy/concepts/${concept.slug}` },
    ],
  }

  return (
    <div style={S.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <main style={S.main}>
        <nav style={{ display: 'flex', gap: 10, ...S.mono }} aria-label="Breadcrumb">
          <Link href="/academy" style={{ color: '#9598A2', textDecoration: 'none' }}>academy</Link>
          <span>/</span>
          <Link href="/academy/concepts" style={{ color: '#9598A2', textDecoration: 'none' }}>concepts</Link>
        </nav>

        <div style={{ ...S.kicker, marginTop: 28 }}>{concept.courseTitle}</div>
        <h1 style={S.h1}>{concept.question}</h1>

        <p style={{ margin: '20px 0 0', color: '#C9C6BF', fontSize: 16.5, lineHeight: 1.7 }}>
          {concept.summary}
        </p>

        <div style={{ marginTop: 36 }}>
          <div style={{ ...S.mono, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            how the lesson trains it — the Sage loop
          </div>
          {/* Highlight a different loop stage per lesson (stable slug hash) so
              the 34 pages read as variations on the method, not clones. */}
          <JudgmentLoopDiagram
            activeStage={[...concept.slug].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 0) % 5}
          />
        </div>

        <div
          style={{
            marginTop: 36,
            border: '1px solid rgba(143,160,255,0.3)',
            borderRadius: 16,
            background: 'linear-gradient(165deg, #12121C, #101014)',
            padding: 'clamp(22px, 4vw, 34px)',
          }}
        >
          <div style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontWeight: 560, fontSize: 21, letterSpacing: '-0.015em' }}>
            This is the preview. The lesson is the rep.
          </div>
          <p style={{ margin: '10px 0 0', color: '#9C9CA6', fontSize: 14, maxWidth: '56ch' }}>
            In the full lesson ({concept.durationMin ? `~${concept.durationMin} minutes` : 'one sitting'}) you work
            the loop on a real scenario and leave with evidence in your ledger — not a completion checkmark.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            <Link
              href={`/academy/course/${concept.courseSlug}`}
              style={{
                display: 'inline-flex',
                color: '#0B0B0E',
                background: 'linear-gradient(135deg, #A9B7FF, #6E86F7)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 700,
                padding: '12px 24px',
                borderRadius: 22,
              }}
            >
              Start this course
            </Link>
            <Link
              href="/academy"
              style={{
                display: 'inline-flex',
                color: '#F2EFE9',
                border: '1px solid #2A2A33',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                padding: '12px 24px',
                borderRadius: 22,
              }}
            >
              Explore the academy
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <section style={{ marginTop: 48 }}>
            <div style={{ ...S.mono, textTransform: 'uppercase', letterSpacing: '0.12em' }}>keep pulling the thread</div>
            <div style={{ borderTop: '1px solid #1E1E24', marginTop: 12 }}>
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/academy/concepts/${r.slug}`}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 16,
                    padding: '14px 4px',
                    borderBottom: '1px solid #1E1E24',
                    textDecoration: 'none',
                    color: '#F2EFE9',
                  }}
                >
                  <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600 }}>{r.question}</span>
                  <span style={{ ...S.mono, whiteSpace: 'nowrap' }}>→</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
