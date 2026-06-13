import type { Metadata } from 'next';
import { AuditForm } from './audit-form';

export const metadata: Metadata = {
  title: 'Free instant SEO audit — Sage Ideas',
  description:
    'Paste any URL and get a real-time on-page SEO report in under 20 seconds — title, meta description, Open Graph, structured data, heading structure, image alt text, and an optional PageSpeed score.',
  alternates: {
    canonical: 'https://www.sageideas.dev/tools/seo-audit',
  },
  openGraph: {
    title: 'Free instant SEO audit — Sage Ideas',
    description:
      'On-page SEO analysis in under 20 seconds. No account required — enter a URL and get your score.',
    url: 'https://www.sageideas.dev/tools/seo-audit',
    type: 'website',
  },
};

export default function SeoAuditPage() {
  return (
    <main className="min-h-screen bg-[#09090B] text-[#F4F2EF]">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="seo-audit-heading"
        className="relative overflow-hidden border-b border-[#2A2826] pt-24 pb-16"
      >
        {/* Background grid decoration */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,211,207,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,211,207,0.03)_1px,transparent_1px)] bg-[size:48px_48px]"
        />

        {/* Glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(14,211,207,0.35) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Label */}
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#0ED3CF] mb-4">
            Free tool · Instant results
          </p>

          <h1
            id="seo-audit-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F4F2EF] leading-[1.07] mb-6"
          >
            On-page SEO audit
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(135deg, var(--sage-brand) 0%, var(--sage-lime) 100%)',
              }}
            >
              in under 20 seconds
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#A8A29E] max-w-2xl leading-relaxed mb-8">
            Paste any public URL. We fetch the page, run 10 on-page checks — title
            length, meta description, canonical, Open Graph, structured data, viewport,
            lang attribute, H1 count, image alt text — and blend in a mobile PageSpeed
            score when available. No account, no credit card.
          </p>

          {/* Check grid */}
          <ul
            aria-label="What we check"
            className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-12 text-[13px] text-[#A8A29E]"
          >
            {[
              'Page title',
              'Meta description',
              'Canonical tag',
              'Open Graph',
              'Twitter card',
              'Structured data',
              'Viewport meta',
              'HTML lang',
              'Single H1',
              'Image alt text',
            ].map((check) => (
              <li key={check} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-[#0ED3CF] shrink-0"
                  style={{ boxShadow: '0 0 6px rgba(14,211,207,0.6)' }}
                />
                {check}
              </li>
            ))}
          </ul>

          {/* The form */}
          <AuditForm />
        </div>
      </section>

      {/* ── Why it matters ────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              stat: '10×',
              label: 'more organic clicks',
              body: 'The first result gets 10× more clicks than position 10. On-page signals are the highest-leverage starting point.',
            },
            {
              stat: '<60s',
              label: 'to your score',
              body: 'This tool fetches, parses, and scores your page live — no upload, no waiting for a crawl queue.',
            },
            {
              stat: 'Free',
              label: 'always',
              body: 'The audit is a public good. We send you the report and occasionally offer to fix the gaps.',
            },
          ].map(({ stat, label, body }) => (
            <div
              key={stat}
              className="rounded-2xl bg-[#12110F] border border-[#2A2826] p-6 hover:border-[#0ED3CF]/30 transition-colors"
            >
              <div className="text-3xl font-bold text-[#0ED3CF] mb-1 font-mono">
                {stat}
              </div>
              <div className="text-sm font-semibold text-[#F4F2EF] mb-3">{label}</div>
              <p className="text-[13px] text-[#A8A29E] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
