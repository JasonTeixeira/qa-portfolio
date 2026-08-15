import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllConcepts, getConceptCourses } from '@/lib/academy/concepts'

export const metadata: Metadata = {
  title: 'Engineering concepts, taught as judgment — Sage Academy',
  description:
    'Short, honest answers to the questions engineers actually search — each one a doorway into a lesson that ends in evidence, not a completion checkmark.',
  alternates: { canonical: 'https://www.sageideas.dev/academy/concepts' },
}

const S = {
  page: {
    minHeight: '100vh',
    background: '#0B0B0E',
    color: '#F2EFE9',
    fontFamily: 'var(--font-sans), sans-serif',
  } as const,
  main: { maxWidth: 1080, margin: '0 auto', padding: '64px 24px 96px' } as const,
  kicker: {
    fontFamily: 'var(--font-mono), monospace',
    fontSize: 10.5,
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    color: '#8FA0FF',
  } as const,
  h1: {
    margin: '14px 0 0',
    fontFamily: 'var(--font-serif), Georgia, serif',
    fontWeight: 560,
    fontSize: 'clamp(32px, 4.5vw, 52px)',
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    maxWidth: '20ch',
  } as const,
  lede: { margin: '18px 0 0', color: '#9C9CA6', fontSize: 16, maxWidth: '58ch' } as const,
}

export default function ConceptsIndexPage() {
  const courses = getConceptCourses()
  const concepts = getAllConcepts()

  return (
    <div style={S.page}>
      <main style={S.main}>
        <div style={S.kicker}>Concepts · free previews of the judgment library</div>
        <h1 style={S.h1}>The questions, answered the senior-engineer way.</h1>
        <p style={S.lede}>
          Each concept below is a real lesson outcome from the academy — the question a developer
          searches, answered with a map you can defend. No signup wall on the answers; the reps and
          the evidence ledger are the product.
        </p>

        {courses.map((course) => {
          const list = concepts.filter((c) => c.courseSlug === course.slug)
          if (list.length === 0) return null
          return (
            <section key={course.slug} style={{ marginTop: 56 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-serif), Georgia, serif',
                    fontWeight: 560,
                    fontSize: 24,
                    letterSpacing: '-0.015em',
                  }}
                >
                  {course.title}
                </h2>
                <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, color: '#9598A2' }}>
                  {list.length} concepts
                </span>
              </div>
              <div style={{ borderTop: '1px solid #1E1E24', marginTop: 18 }}>
                {list.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/academy/concepts/${c.slug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 18,
                      padding: '16px 4px',
                      borderBottom: '1px solid #1E1E24',
                      textDecoration: 'none',
                      color: '#F2EFE9',
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 15.5, fontWeight: 600 }}>{c.question}</span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono), monospace',
                        fontSize: 10.5,
                        color: '#9598A2',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.durationMin ? `${c.durationMin} min lesson →` : 'lesson →'}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </main>
    </div>
  )
}
