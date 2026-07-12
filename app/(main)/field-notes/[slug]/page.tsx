import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllFieldNotes, getFieldNoteBySlug } from '@/lib/field-notes'
import { renderMarkdownToHtml } from '@/lib/blogMarkdown'
import styles from './field-note.module.css'

const MONO = '"JetBrains Mono", monospace'
const DISPLAY = 'Fraunces, Georgia, serif'

// Category → tint + route, matching the design's per-category color language.
const CATEGORY_TINT: Record<string, string> = {
  'Repair log': '#E5484D',
  Systems: '#8FA0FF',
  AI: '#FF2D9B',
  Audit: '#E0A93E',
  Career: '#18B663',
  Growth: '#7C3AED',
}
const CATEGORY_ROUTE: Record<string, string> = {
  'Repair log': 'Backend Engineering',
  Systems: 'Engineering Judgment',
  AI: 'AI Engineering & RAG',
  Audit: 'AI Engineering & RAG',
  Career: 'Interview & Portfolio',
  Growth: 'Product Execution',
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllFieldNotes().map((n) => ({ slug: n.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const note = getFieldNoteBySlug(slug)
  if (!note) return { title: 'Field note not found' }
  return {
    title: `${note.title} — Field Notes`,
    description: note.summary,
  }
}

function formatDateUpper(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.toUpperCase()
  return d
    .toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
    .toUpperCase()
}

function estimateReadMin(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export default async function FieldNotePage({ params }: PageProps) {
  const { slug } = await params
  const note = getFieldNoteBySlug(slug)
  if (!note) notFound()

  const tint = CATEGORY_TINT[note.category] ?? '#8FA0FF'
  const route = CATEGORY_ROUTE[note.category] ?? 'Sage Academy'
  const readMin = estimateReadMin(note.body)

  // Strip a leading H1 if present — the page renders the title in the header.
  const cleanedMd = note.body.replace(/^\s*#\s+.+\n+/, '')
  const html = await renderMarkdownToHtml(cleanedMd)

  // Sibling notes for the "Keep reading" block.
  const others = getAllFieldNotes().filter((n) => n.slug !== note.slug).slice(0, 2)

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(120% 80% at 50% -10%, rgba(255,255,255,0.035) 0%, transparent 55%) #0B0B0E',
        color: '#F2EFE9',
        fontFamily: '"Hanken Grotesk", sans-serif',
        fontSize: 16,
        lineHeight: 1.65,
        overflowX: 'hidden',
      }}
    >
      {/* Nav */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          padding: '0 clamp(20px, 4vw, 48px)',
          height: 68,
          background: 'rgba(11,11,14,0.85)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid #1E1E24',
        }}
      >
        <Link
          href="/field-notes"
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}
        >
          <span
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 26,
              height: 26,
              borderRadius: 8,
              background: '#3D5AFE',
              color: '#fff',
              fontSize: 12,
              boxShadow: '0 0 18px rgba(61,90,254,0.35)',
            }}
          >
            ◆
          </span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: '#9598A2' }}>← all field notes</span>
        </Link>
        <Link
          href="/academy"
          style={{
            color: '#fff',
            background: '#3D5AFE',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
            padding: '11px 20px',
            borderRadius: 24,
            whiteSpace: 'nowrap',
            boxShadow: '0 0 22px rgba(61,90,254,0.3)',
          }}
        >
          Start learning
        </Link>
      </nav>

      <article
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: 'clamp(48px, 7vw, 80px) clamp(20px, 4vw, 48px) clamp(56px, 8vw, 96px)',
        }}
      >
        {/* Kicker */}
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.1em', color: tint }}>
          {note.category.toUpperCase()} · {formatDateUpper(note.date)} · {readMin} MIN
        </div>
        <h1
          style={{
            margin: '16px 0 0',
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 'clamp(32px, 4.4vw, 50px)',
            lineHeight: 1.04,
            letterSpacing: '-0.026em',
            textWrap: 'balance',
          }}
        >
          {note.title}
        </h1>

        {/* Byline */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 22,
            paddingBottom: 26,
            borderBottom: '1px solid #1E1E24',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'rgba(61,90,254,0.14)',
              border: '1px solid rgba(61,90,254,0.4)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: MONO,
              fontSize: 10,
              color: '#8FA0FF',
            }}
          >
            JT
          </span>
          <span style={{ fontSize: 13.5, color: '#B6B6C0' }}>Jason Teixeira</span>
          <span style={{ fontFamily: MONO, fontSize: 10.5, color: '#4A4A54' }}>
            · founder, Sage Academy
          </span>
        </div>

        {/* Body */}
        <div className={styles.body} dangerouslySetInnerHTML={{ __html: html }} />

        {/* Routes-to-a-sprint CTA */}
        <div
          style={{
            margin: '38px 0 0',
            border: '1px solid rgba(61,90,254,0.45)',
            borderRadius: 16,
            background: 'linear-gradient(165deg, #141420, #111115)',
            padding: 26,
            boxShadow: '0 0 32px rgba(61,90,254,0.1)',
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: '#8FA0FF',
              marginBottom: 10,
            }}
          >
            This note routes to a sprint
          </div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 21, letterSpacing: '-0.015em' }}>
            {route}
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 14, color: '#9C9CA6', maxWidth: '58ch', textWrap: 'pretty' }}>
            Reading about this took {readMin} minutes. Doing it — with the failing lab, the eval gate, and a proof
            in your ledger — takes one sprint. That&apos;s the difference between knowing and being trusted with it.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
            <Link
              href="/academy"
              style={{
                display: 'inline-flex',
                color: '#fff',
                background: '#3D5AFE',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                padding: '12px 24px',
                borderRadius: 24,
                whiteSpace: 'nowrap',
                boxShadow: '0 0 20px rgba(61,90,254,0.35)',
              }}
            >
              Train this skill →
            </Link>
            <Link
              href="/academy"
              style={{ fontFamily: MONO, fontSize: 11, color: '#8FA0FF', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              or try lesson 07 free — no account
            </Link>
          </div>
        </div>

        {/* Keep reading */}
        {others.length > 0 && (
          <div style={{ marginTop: 36, borderTop: '1px solid #1E1E24', paddingTop: 24 }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#9598A2',
                marginBottom: 14,
              }}
            >
              Keep reading
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={`/field-notes/${o.slug}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 14,
                    padding: '11px 4px',
                    textDecoration: 'none',
                    color: '#B6B6C0',
                    fontSize: 14.5,
                    borderRadius: 8,
                  }}
                >
                  <span>{o.title}</span>
                  <span style={{ color: '#4A4A54' }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1E1E24' }}>
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '30px clamp(20px, 4vw, 48px)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 11, color: '#9598A2' }}>
            Sage Academy · frame → route → map → decide → prove
          </span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: '#4A4A54' }}>© 2026 Sage Ideas LLC</span>
        </div>
      </footer>
    </div>
  )
}
