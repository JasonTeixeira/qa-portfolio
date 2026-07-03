import type { Metadata } from 'next'
import Link from 'next/link'

const MONO = '"JetBrains Mono", monospace'
const DISPLAY = 'Fraunces, Georgia, serif'

export const metadata: Metadata = {
  title: 'About · Sage Academy',
  description:
    'Twenty years of incidents taught me one thing: the difference between engineers isn’t what they know — it’s what they can defend.',
}

type Principle = {
  num: string
  text: string
}

const PRINCIPLES: Principle[] = [
  { num: '01', text: 'Prove it — no vibes. Applied to our own claims first.' },
  { num: '02', text: 'Your work is yours. Ledger, artifacts, exports — forever.' },
  { num: '03', text: 'Repairs over streaks. Being wrong in public is the curriculum.' },
  {
    num: '04',
    text: 'Few emails, no dark patterns, two-click cancel. Trust compounds.',
  },
]

export default function AboutPage() {
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '12px clamp(16px, 3vw, 28px)',
          borderBottom: '1px solid #1E1E24',
        }}
      >
        <Link
          href="/academy"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <span
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 24,
              height: 24,
              borderRadius: 7,
              background: '#3D5AFE',
              color: '#fff',
              fontSize: 11,
            }}
          >
            ◆
          </span>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Sage Academy</span>
        </Link>
        <Link
          href="/academy"
          style={{
            marginLeft: 'auto',
            color: '#fff',
            background: '#3D5AFE',
            textDecoration: 'none',
            fontSize: 13.5,
            fontWeight: 600,
            padding: '10px 18px',
            borderRadius: 22,
            whiteSpace: 'nowrap',
          }}
        >
          Start learning
        </Link>
      </div>

      {/* Story */}
      <article
        style={{
          maxWidth: 700,
          margin: '0 auto',
          padding: 'clamp(48px, 7vw, 88px) clamp(20px, 4vw, 48px) 96px',
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: '#8FA0FF',
          }}
        >
          The story · why this exists
        </div>
        <h1
          style={{
            margin: '16px 0 0',
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 'clamp(32px, 4.4vw, 52px)',
            lineHeight: 1.03,
            letterSpacing: '-0.026em',
            textWrap: 'balance',
          }}
        >
          I got tired of confident guesses in war rooms.
        </h1>

        {/* Byline */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            margin: '30px 0',
          }}
        >
          <span
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 64,
              height: 64,
              flexShrink: 0,
              borderRadius: '50%',
              border: '1px solid rgba(61,90,254,0.4)',
              background: '#111115',
              fontFamily: MONO,
              fontSize: 18,
              color: '#8FA0FF',
              overflow: 'hidden',
            }}
          >
            JT
          </span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Jason Teixeira</div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                color: '#9598A2',
              }}
            >
              founder · still writes every field note
            </div>
          </div>
        </div>

        <p
          style={{
            margin: '0 0 18px',
            fontSize: 17,
            color: '#B6B6C0',
            textWrap: 'pretty',
          }}
        >
          Twenty years of incidents taught me one thing: the difference between
          engineers isn&apos;t what they know. It&apos;s what they can{' '}
          <em style={{ color: '#F2EFE9' }}>defend</em>. The senior person in the
          room isn&apos;t reciting more facts — they&apos;re drawing a smaller
          map with edges they can stand behind, and saying &ldquo;I don&apos;t
          know, but here&apos;s the cheapest way to find out.&rdquo;
        </p>
        <p
          style={{
            margin: '0 0 18px',
            fontSize: 17,
            color: '#B6B6C0',
            textWrap: 'pretty',
          }}
        >
          Nobody teaches that. Tutorials teach syntax. Bootcamps teach
          frameworks. Certificates teach... completing certificates. So
          engineers accumulate hundreds of hours of watching and none of the
          thing interviews, reviews, and 3am pages actually test: judgment under
          uncertainty, proven in public.
        </p>
        <p
          style={{
            margin: '0 0 18px',
            fontSize: 17,
            color: '#B6B6C0',
            textWrap: 'pretty',
          }}
        >
          Sage Academy is my answer. Every lesson ends in something you can be
          wrong about — and then fix. Every claim gets a check a skeptic can
          run. The certificate is a curl command, not a PDF. And the whole thing
          is built on the loop I watched the best engineers run on autopilot for
          two decades: frame, route, map, decide, prove.
        </p>

        {/* Pull-quote */}
        <blockquote
          style={{
            margin: '34px 0',
            padding: '6px 0 6px 26px',
            borderLeft: '2px solid #18B663',
          }}
        >
          <span
            style={{
              fontFamily: DISPLAY,
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'clamp(21px, 2.4vw, 26px)',
              lineHeight: 1.3,
            }}
          >
            If we wouldn&apos;t accept &ldquo;trust me&rdquo; in a design review,
            why do we accept it from education?
          </span>
        </blockquote>

        {/* Operating principles */}
        <div
          style={{
            border: '1px solid #1E1E24',
            borderRadius: 14,
            background: '#111115',
            padding: 24,
            marginBottom: 30,
          }}
        >
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
            Operating principles
          </div>
          {PRINCIPLES.map((principle) => (
            <div
              key={principle.num}
              style={{
                display: 'flex',
                gap: 11,
                padding: '7px 0',
                fontSize: 14.5,
                color: '#B6B6C0',
              }}
            >
              <span style={{ color: '#18B663' }}>{principle.num}</span>{' '}
              {principle.text}
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link
            href="/field-notes"
            style={{
              display: 'inline-flex',
              color: '#fff',
              background: '#3D5AFE',
              textDecoration: 'none',
              fontSize: 14.5,
              fontWeight: 600,
              padding: '13px 26px',
              borderRadius: 24,
              whiteSpace: 'nowrap',
              boxShadow: '0 0 22px rgba(61,90,254,0.35)',
            }}
          >
            Read the field notes →
          </Link>
          <Link
            href="/how-it-works"
            style={{
              display: 'inline-flex',
              color: '#B6B6C0',
              border: '1px solid #2A2A33',
              textDecoration: 'none',
              fontSize: 14.5,
              padding: '12px 26px',
              borderRadius: 24,
              whiteSpace: 'nowrap',
            }}
          >
            The manifesto
          </Link>
        </div>
      </article>
    </div>
  )
}
