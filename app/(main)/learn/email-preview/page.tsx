import { buildAcademyWelcomeEmail } from '@/lib/academy/waitlist-welcome'
import { ACADEMY_SEQUENCE } from '@/lib/academy/waitlist-sequence'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Email preview',
  robots: { index: false, follow: false },
}

const SAMPLE = { email: 'you@email.com', position: 142, refCode: 'k7m2xqp' }

export default function EmailPreviewPage() {
  const welcome = buildAcademyWelcomeEmail(SAMPLE)
  const steps = ACADEMY_SEQUENCE.map((s) => ({
    subject: s.subject,
    ...s.build({ email: SAMPLE.email, refCode: SAMPLE.refCode }),
  }))

  const emails = [
    { tag: 'Sent at signup', subject: welcome.subject, html: welcome.html },
    { tag: 'Day 2 · cron', subject: steps[0].subject, html: steps[0].html },
    { tag: 'Day 5 · cron', subject: steps[1].subject, html: steps[1].html },
  ]

  return (
    <main
      style={{
        minHeight: '100svh',
        background: '#070708',
        color: '#f2efe9',
        fontFamily: "'Hanken Grotesk',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        padding: '48px 24px 96px',
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <p
          style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#8fa0ff',
            margin: '0 0 8px',
          }}
        >
          Sage Academy · email previews
        </p>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
          The emails people get
        </h1>
        <p style={{ color: '#9c9ca6', fontSize: 15, margin: '0 0 36px' }}>
          Live render of the actual templates, in send order. Sample data shown.
        </p>

        <div
          style={{
            display: 'grid',
            gap: 28,
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            alignItems: 'start',
          }}
        >
          {emails.map((e) => (
            <section key={e.subject}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 10,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#6b6b78',
                  marginBottom: 6,
                }}
              >
                {e.tag}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f2efe9', marginBottom: 10 }}>
                Subject: {e.subject}
              </div>
              <iframe
                title={e.subject}
                srcDoc={e.html}
                style={{
                  width: '100%',
                  height: 760,
                  border: '1px solid #1e1e24',
                  borderRadius: 14,
                  background: '#0b0b0e',
                }}
              />
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
