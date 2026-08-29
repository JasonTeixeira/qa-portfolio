import type { Metadata } from 'next'
import Link from 'next/link'
import { AcademyNav } from '@/components/academy/marketing/AcademyNav'
import { AcademyFooter } from '@/components/academy/marketing/AcademyFooter'

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
      {/* Focus-visible ring for article links. Inline styles cannot express
          :focus-visible; this scoped rule satisfies SC 2.4.11. */}
      <style>{`
        main a:focus-visible {
          outline: 2px solid #3D5AFE;
          outline-offset: 3px;
          border-radius: 4px;
        }
      `}</style>

      {/* Nav */}
      <AcademyNav />

      {/* Story */}
      <main>
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

        {/* Builder credibility — the honest trust anchor. No invented metrics;
            the claim is simply that a practitioner writes this, not a content team. */}
        <div
          style={{
            border: '1px solid rgba(61,90,254,0.3)',
            borderRadius: 14,
            background: 'linear-gradient(165deg, #0E1020, #111115)',
            padding: 24,
            marginBottom: 30,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8FA0FF', marginBottom: 12 }}>
            Taught by a builder, not a content company
          </div>
          <p style={{ margin: 0, fontSize: 15, color: '#B6B6C0', lineHeight: 1.65 }}>
            I don&apos;t teach engineering from a textbook. I design, build, ship, and operate real
            production software — solo — and the mental models in here are the exact ones that hold up
            when you&apos;re the only person who can fix it at 3am. Every lesson is the loop I actually
            run, written by the same hands that ship the systems.
          </p>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link
            href="/academy/signup"
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
            Start free →
          </Link>
          <Link
            href="/academy/method"
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
            See the method
          </Link>
          <Link
            href="/academy/projects"
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
            What you&apos;ll build
          </Link>
        </div>
      </article>
      </main>

      <AcademyFooter />
    </div>
  )
}
