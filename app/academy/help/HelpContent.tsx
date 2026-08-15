'use client'

import { useId, useMemo, useState } from 'react'

const MONO = '"JetBrains Mono", monospace'
const DISPLAY = 'Fraunces, Georgia, serif'

type Category = {
  glyph: string
  tint: string
  name: string
  count: string
  href: string
}

type Faq = {
  q: string
  a: string
  /** Which category anchor group this belongs to. */
  group: 'learning' | 'proofs' | 'billing'
}

const CATEGORIES: Category[] = [
  { glyph: '◆', tint: '#8FA0FF', name: 'Learning & tutor', count: '2 answers', href: '#learning' },
  { glyph: '✓', tint: '#18B663', name: 'Proofs & certificates', count: '2 answers', href: '#proofs' },
  { glyph: '$', tint: '#E0A93E', name: 'Billing', count: '1 answer', href: '#billing' },
  { glyph: '⌥', tint: '#9598A2', name: 'Your data & export', count: '1 answer', href: '#proofs' },
]

// Every answer below is grounded in a REAL feature in this codebase — see the
// group anchors and the report notes. No invented policies, no teams, no
// money-back guarantee, no "Sprout".
const FAQS: Faq[] = [
  {
    group: 'learning',
    q: 'Can the tutor just give me the answer?',
    a: 'No — by design. Sage Tutor (the launcher in the corner of every lesson) is a grounded, guardrailed helper: it works from the lesson you are on and what it remembers about you, and it nudges you toward the idea rather than handing over lab solutions. You can talk to it by voice or type; it streams its reply. It is help, not an answer key.',
  },
  {
    group: 'learning',
    q: 'What happens to my streak if I miss a day?',
    a: 'You start with two streak freezes. Miss a single day and a freeze is spent automatically — your streak holds instead of resetting to zero. The freeze count and the exact dates you used are tracked on your account, and you can earn more freezes back through referrals. Run out of freezes and miss a day, and the streak resets honestly.',
  },
  {
    group: 'proofs',
    q: 'How do I unlock the next sprint?',
    a: 'Progression is proof-based, not time-based. A sprint spells out its contract up front — the outcome, the proof it expects, and what you must not claim — and an unlock gate lists the exact criteria the next step needs. Meet the criteria with real, verifiable work and the gate opens. There is no XP grind or artificial cap between you and the next lesson; there is a bar you actually clear.',
  },
  {
    group: 'proofs',
    q: 'Are my certificates still verifiable after I cancel?',
    a: 'Yes. Each certificate has its own public page at sageideas.dev/academy/certificate/<code> — anyone can open it or curl it, signed in or not, member or not. It reports a live status (VALID or REVOKED), the issue date, and the count of proofs behind it. Cancelling your membership does not take the page down. That permanence is the point of showing it.',
  },
  {
    group: 'proofs',
    q: 'Can I take my work with me?',
    a: 'Always. Settings has an "Export everything" download that pulls your real records live: your profile, every build artifact you have made, and your full proof-of-work ledger — every sprint proven, course completed, and certificate earned — as one JSON file. Your work is yours, whether or not you keep paying.',
  },
  {
    group: 'billing',
    q: 'How do I cancel, and when does billing stop?',
    a: 'Open Settings → Plan & billing and use the billing button — it drops you into the real Stripe customer portal, where you cancel or change your plan directly. Cancelling stops the renewal: you keep all-access until the end of the period you have already paid for, and it simply does not renew after that. No exit interview, no dark patterns.',
  },
]

const GROUP_LABEL: Record<Faq['group'], string> = {
  learning: 'Learning & tutor',
  proofs: 'Proofs, certificates & your data',
  billing: 'Billing',
}

const ROW_BORDER = '1px solid #1E1E24'

export function HelpContent() {
  const [query, setQuery] = useState('')
  const [openKey, setOpenKey] = useState<string | null>(null)
  const searchId = useId()

  const normalized = query.trim().toLowerCase()
  const filtered = useMemo(() => {
    if (!normalized) return FAQS
    return FAQS.filter(
      (f) =>
        f.q.toLowerCase().includes(normalized) || f.a.toLowerCase().includes(normalized),
    )
  }, [normalized])

  // Group the (filtered) FAQs in a stable order, anchor id per group.
  const groups: { id: Faq['group']; label: string; items: Faq[] }[] = (
    ['learning', 'proofs', 'billing'] as const
  )
    .map((id) => ({
      id,
      label: GROUP_LABEL[id],
      items: filtered.filter((f) => f.group === id),
    }))
    .filter((g) => g.items.length > 0)

  // Announce result count changes to screen readers via an aria-live region.
  const resultCount = filtered.length
  const resultAnnouncement =
    normalized
      ? resultCount === 0
        ? `No answers found for "${query}"`
        : `${resultCount} answer${resultCount === 1 ? '' : 's'} found`
      : ''

  return (
    <>
      {/* Scoped styles:
          1. :focus-visible ring for keyboard users (SC 2.4.11).
          2. @media (prefers-reduced-motion: reduce) stops the + icon transition
             (SC 2.3.3 / respects OS motion preference). */}
      <style>{`
        .help-search-input:focus-visible {
          outline: 2px solid #3D5AFE;
          outline-offset: 0;
          border-radius: 22px;
        }
        .help-category-link:focus-visible {
          outline: 2px solid #3D5AFE;
          outline-offset: 3px;
          border-radius: 14px;
        }
        .help-accordion-btn:focus-visible {
          outline: 2px solid #3D5AFE;
          outline-offset: 3px;
          border-radius: 4px;
        }
        @media (prefers-reduced-motion: reduce) {
          .help-accordion-indicator {
            transition: none !important;
          }
        }
      `}</style>

      {/* Search */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        {/* Visually-hidden label — complete sr-only pattern per SC 1.3.1 */}
        <label
          htmlFor={searchId}
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
            whiteSpace: 'nowrap',
            borderWidth: 0,
          }}
        >
          Search help topics
        </label>
        {/* Live region: announces filtered result counts to screen readers */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
            whiteSpace: 'nowrap',
            borderWidth: 0,
          }}
        >
          {resultAnnouncement}
        </div>
        <div
          style={{
            maxWidth: 480,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#111115',
            border: '1px solid #2A2A33',
            borderRadius: 26,
            padding: '4px 20px',
          }}
        >
          <span aria-hidden="true" style={{ fontFamily: MONO, fontSize: 13, color: '#9598A2' }}>
            ⌕
          </span>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search: streaks, certificates, cancel, export…"
            className="help-search-input"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: '#F2EFE9',
              fontFamily: MONO,
              fontSize: 12.5,
              padding: '12px 0',
            }}
          />
        </div>
      </div>

      {/* Category cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          marginBottom: 36,
        }}
      >
        {CATEGORIES.map((cat) => (
          <a
            key={cat.name}
            href={cat.href}
            className="help-category-link"
            style={{
              display: 'block',
              border: ROW_BORDER,
              borderRadius: 14,
              background: '#111115',
              padding: 20,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            {/* Decorative glyph — the link label comes from cat.name below */}
            <div aria-hidden="true" style={{ fontFamily: MONO, fontSize: 14, color: cat.tint, marginBottom: 8 }}>
              {cat.glyph}
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 700 }}>{cat.name}</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: '#9598A2', marginTop: 3 }}>
              {cat.count}
            </div>
          </a>
        ))}
      </div>

      {/* FAQ accordion, grouped */}
      {groups.length === 0 ? (
        <div
          style={{
            border: ROW_BORDER,
            borderRadius: 16,
            background: '#111115',
            padding: 26,
            marginBottom: 22,
            fontSize: 13.5,
            color: '#9598A2',
          }}
        >
          No answers match “{query}”. Try a shorter word — or email us below.
        </div>
      ) : (
        groups.map((group) => (
          <section
            key={group.id}
            id={group.id}
            style={{
              border: ROW_BORDER,
              borderRadius: 16,
              background: '#111115',
              padding: 26,
              marginBottom: 22,
              scrollMarginTop: 24,
            }}
          >
            <h2
              style={{
                margin: '0 0 10px',
                fontFamily: MONO,
                fontSize: 10,
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#9598A2',
              }}
            >
              {group.label}
            </h2>
            {group.items.map((faq) => {
              const key = faq.q
              const isOpen = openKey === key
              const panelId = `panel-${group.id}-${group.items.indexOf(faq)}`
              return (
                <div key={key} style={{ borderBottom: ROW_BORDER }}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenKey(isOpen ? null : key)}
                    className="help-accordion-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                      width: '100%',
                      padding: '16px 0',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#F2EFE9',
                      fontFamily: DISPLAY,
                      fontWeight: 600,
                      fontSize: 16.5,
                    }}
                  >
                    {faq.q}
                    <span
                      aria-hidden="true"
                      className="help-accordion-indicator"
                      style={{
                        flexShrink: 0,
                        fontFamily: MONO,
                        fontSize: 15,
                        color: isOpen ? '#3D5AFE' : '#9598A2',
                        transform: isOpen ? 'rotate(45deg)' : 'none',
                        transition: 'transform 150ms cubic-bezier(0.16,1,0.3,1)',
                      }}
                    >
                      +
                    </span>
                  </button>
                  {isOpen ? (
                    <p
                      id={panelId}
                      style={{
                        margin: '0 0 18px',
                        fontSize: 13.5,
                        lineHeight: 1.65,
                        color: '#9CA0A6',
                        maxWidth: '68ch',
                        textWrap: 'pretty',
                      }}
                    >
                      {faq.a}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </section>
        ))
      )}

      {/* Contact card */}
      <div
        style={{
          border: '1px solid rgba(61,90,254,0.35)',
          borderRadius: 16,
          background: 'linear-gradient(165deg, #14141C, #111115)',
          padding: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 0%', minWidth: 240 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Still stuck? Talk to a human.</div>
          <div style={{ fontSize: 13, color: '#9598A2', marginTop: 2 }}>
            Email us and a person reads it. Sage Tutor (the launcher in the corner of any
            lesson) handles the quick, in-context stuff.
          </div>
        </div>
        <a
          href="mailto:contact@sageideas.dev"
          style={{
            display: 'inline-flex',
            color: '#fff',
            background: '#3D5AFE',
            textDecoration: 'none',
            fontSize: 13.5,
            fontWeight: 600,
            padding: '12px 24px',
            borderRadius: 22,
            whiteSpace: 'nowrap',
          }}
        >
          Email us →
        </a>
      </div>
    </>
  )
}
