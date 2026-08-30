'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './legal.module.css'

type Section = {
  num: string
  title: string
  body: string
}

type LegalDoc = {
  label: string
  summary: string
  sections: Section[]
}

// Copy reproduced verbatim from the Sage Academy Phase-2 legal design source.
const DOCS: LegalDoc[] = [
  {
    label: 'Terms of Service',
    summary:
      "You get all courses while subscribed. Your artifacts are yours, forever. Don't share your account, don't scrape the content, don't resell it. We can update the service; we can't retroactively take your ledger.",
    sections: [
      {
        num: '1',
        title: 'The service',
        body: 'Sage Academy provides courses, labs, evaluation gates, recall systems, and related tooling on a subscription basis. Features may evolve; material removals of paid functionality entitle you to a prorated refund.',
      },
      {
        num: '2',
        title: 'Your work is yours',
        body: 'Artifacts you create — memos, maps, code, postmortems — belong to you. We store and display them at your direction (e.g., your public profile) and never train models on them without explicit opt-in.',
      },
      {
        num: '3',
        title: 'Accounts',
        body: 'One person per account. Team seats are per-person and transferable by an admin. We may suspend accounts for abuse (scraping, credential sharing, harassment in community spaces) — with notice and an export.',
      },
      {
        num: '4',
        title: 'Verification records',
        body: 'Certificates and their verify endpoints are public records by design. Revocation occurs only when an underlying proof demonstrably fails — never as a commercial lever.',
      },
      {
        num: '5',
        title: 'Liability',
        body: 'The service is provided as-is; our aggregate liability is capped at the fees you paid in the trailing 12 months. Nothing here limits rights you hold under mandatory local law.',
      },
    ],
  },
  {
    label: 'Privacy',
    summary:
      'We collect what the product needs to run, nothing exotic. No ad trackers, no selling data, no training on your work without opt-in. Managers on team plans see verdicts and artifacts — never activity surveillance. Delete means delete, within 30 days.',
    sections: [
      {
        num: '1',
        title: 'What we collect',
        body: 'Account data (email, name), learning data (proof verdicts, recall schedules, artifacts), billing data (via Stripe — we never see card numbers), and minimal product analytics (self-hosted, no third-party ad pixels).',
      },
      {
        num: '2',
        title: 'AI features',
        body: 'Sprout conversations are processed to generate responses and are not used to train foundation models. Weekly reads are generated from your own ledger data and visible only to you.',
      },
      {
        num: '3',
        title: 'Team visibility',
        body: "Team admins see members' verdicts, artifacts, and mastery scores — the same surface as a public profile. Lesson-level activity, timestamps, and Sprout conversations are never exposed to admins.",
      },
      {
        num: '4',
        title: 'Deletion',
        body: 'Account deletion is permanent within 30 days and is preceded by an automatic full export. Certificates remain as public verification records unless you request their revocation too.',
      },
      {
        num: '5',
        title: 'Transfers & processors',
        body: 'Processors: Stripe (billing), Resend (email), our cloud provider (hosting). EU/UK data is handled under SCCs. The current processor list is maintained in our full Privacy Policy at sageideas.dev/legal/privacy.',
      },
    ],
  },
  {
    label: 'Refund policy',
    summary:
      'The 14-day honest guarantee is real: no proof shipped in your first 14 days, full refund, same-day, no argument. After that, cancel anytime and keep access through your paid period. Annual unused time converts to credit if you downgrade.',
    sections: [
      {
        num: '1',
        title: 'The honest guarantee',
        body: 'Within 14 days of your first charge: reply "guarantee" to any billing email for a full refund, processed same business day. We may ask one optional question. Abuse (repeat sign-ups) voids eligibility.',
      },
      {
        num: '2',
        title: 'After 14 days',
        body: 'Subscriptions are non-refundable but cancellable — access continues through the period you paid for. Exceptional circumstances (medical, bereavement) are handled case-by-case, generously.',
      },
      {
        num: '3',
        title: 'Plan changes',
        body: 'Monthly → annual: unused days credit automatically. Annual → monthly: remaining value converts to account credit at the daily rate. Nobody pays for the same week twice.',
      },
      {
        num: '4',
        title: 'Team plans',
        body: 'Unused seats refund at the seat rate within 30 days of purchase. Seat reassignment is free and unlimited.',
      },
    ],
  },
]

export function LegalDocViewer() {
  const [tab, setTab] = useState(0)
  const activeDoc = DOCS[tab]

  return (
    <div className={styles.root}>
      <div className={styles.topbar}>
        <Link href="/academy" className={styles.brand}>
          <span className={styles.diamond} aria-hidden="true">
            ◆
          </span>
          <span className={styles.brandName}>Sage Academy</span>
        </Link>
        <span className={styles.topnote}>
          plain-language summaries up top · full text below each
        </span>
      </div>

      <main className={styles.main}>
        <h1 className={styles.h1}>The fine print, unfine-printed.</h1>
        <p className={styles.subtitle}>
          Effective May 2026. Each section starts with the honest summary; the
          full binding text lives in the documents linked at the bottom.
        </p>

        <div className={styles.tabs} role="tablist" aria-label="Legal documents">
          {DOCS.map((doc, i) => {
            const isActive = i === tab
            return (
              <button
                key={doc.label}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(i)}
                className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
              >
                {doc.label}
              </button>
            )
          })}
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>The honest summary</div>
          <p className={styles.summaryBody}>{activeDoc.summary}</p>
        </div>

        {activeDoc.sections.map((s) => (
          <div key={s.num} className={styles.section}>
            <div className={styles.sectionNum}>§ {s.num}</div>
            <div className={styles.sectionTitle}>{s.title}</div>
            <p className={styles.sectionBody}>{s.body}</p>
          </div>
        ))}

        <div style={{ marginTop: 36, padding: '18px 20px', border: '1px solid #1E1E24', borderRadius: 12, background: '#0E0E12' }}>
          <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8FA0FF', marginBottom: 12 }}>
            The full, binding documents
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <a href="/legal/privacy" style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 12.5, color: '#C9C9D2', textDecoration: 'none', border: '1px solid #1E1E24', borderRadius: 8, padding: '7px 12px' }}>Privacy Policy →</a>
            <a href="/legal/terms" style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 12.5, color: '#C9C9D2', textDecoration: 'none', border: '1px solid #1E1E24', borderRadius: 8, padding: '7px 12px' }}>Terms of Service →</a>
            <a href="/legal/cookies" style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 12.5, color: '#C9C9D2', textDecoration: 'none', border: '1px solid #1E1E24', borderRadius: 8, padding: '7px 12px' }}>Cookie Policy →</a>
            <a href="/legal/msa" style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 12.5, color: '#C9C9D2', textDecoration: 'none', border: '1px solid #1E1E24', borderRadius: 8, padding: '7px 12px' }}>MSA →</a>
            <a href="/legal/nda" style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 12.5, color: '#C9C9D2', textDecoration: 'none', border: '1px solid #1E1E24', borderRadius: 8, padding: '7px 12px' }}>NDA →</a>
          </div>
        </div>

        <div className={styles.footer}>
          Questions about any clause: legal@sageideas.dev · Sage Ideas LLC, a Florida company (Orlando, FL)
        </div>
      </main>
    </div>
  )
}
