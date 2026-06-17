import type { Metadata } from 'next';
import {
  ConversionMap,
  LivingCTA,
  LivingHero,
  LivingPageShell,
  LivingProofStrip,
  LivingSection,
  SystemHeroPanel,
} from '@/components/living/LivingPageSystem';
import { AuditForm } from './audit-form';

export const metadata: Metadata = {
  title: 'Free instant SEO audit — Sage Ideas',
  description:
    'Paste any URL and get a real-time on-page SEO report in under 20 seconds: title, meta description, Open Graph, structured data, heading structure, image alt text, and optional PageSpeed scoring.',
  alternates: {
    canonical: 'https://www.sageideas.dev/tools/seo-audit',
  },
  openGraph: {
    title: 'Free instant SEO audit — Sage Ideas',
    description:
      'On-page SEO analysis in under 20 seconds. No account required: enter a URL and get your score.',
    url: 'https://www.sageideas.dev/tools/seo-audit',
    type: 'website',
  },
};

const checks = [
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
];

export default function SeoAuditPage() {
  return (
    <LivingPageShell>
      <LivingHero
        eyebrow="Sage Ideas · free SEO audit"
        title={
          <>
            Find the leaks before Google does.
          </>
        }
        lede={
          <>
            Paste any public URL. The tool fetches the page, runs 10 weighted
            on-page checks, and gives you a prioritized score you can fix or
            hand to me for an Audit + Sprint.
          </>
        }
        primaryCta={{ label: 'Run the audit', href: '#seo-audit-form' }}
        secondaryCta={{ label: 'Book a fix', href: '/book?context=seo-audit' }}
        panel={
          <SystemHeroPanel
            eyebrow="Audit engine"
            title="Live SEO scoring system"
            nodes={['URL', 'Crawl', 'Score', 'Sprint']}
            stats={[
              { label: 'checks', value: '10' },
              { label: 'typical run', value: '<60s' },
              { label: 'account', value: 'none' },
            ]}
          />
        }
        proof={[
          { label: 'on-page checks', value: '10 weighted' },
          { label: 'lead magnet', value: 'free' },
          { label: 'page speed', value: 'optional' },
          { label: 'next step', value: 'audit sprint' },
        ]}
      />

      <LivingSection
        id="seo-audit-form"
        eyebrow="Run the page"
        title="Get the report."
        lede="Use a public page URL. Private network URLs are blocked, and the report is generated from the live HTML the tool can fetch."
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)] lg:items-start">
          <AuditForm />
          <aside className="border border-[var(--sage-border-strong)] bg-[rgba(20,20,24,0.58)] p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              What gets checked
            </p>
            <ul
              aria-label="What the SEO audit checks"
              className="mt-6 grid gap-px bg-[var(--sage-border)] sm:grid-cols-2 lg:grid-cols-1"
            >
              {checks.map((check) => (
                <li
                  key={check}
                  className="flex items-center gap-3 bg-[rgba(11,11,14,0.72)] px-4 py-3 text-sm text-[var(--sage-ink-muted)]"
                >
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full bg-[var(--sage-accent)]"
                  />
                  {check}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </LivingSection>

      <LivingSection
        eyebrow="How it converts"
        title="From page leak to fix plan."
        lede="The tool is built as a real acquisition path: useful first, then a clear bridge into the paid sprint."
      >
        <ConversionMap
          steps={[
            {
              label: 'Fetch',
              detail:
                'The API validates the URL, blocks private networks, and reads the public HTML.',
            },
            {
              label: 'Score',
              detail:
                'Weighted checks cover metadata, schema, headings, accessibility basics, and optional mobile PageSpeed.',
            },
            {
              label: 'Prioritize',
              detail:
                'Failures surface first by weight, so the user knows what matters instead of staring at a raw crawl.',
            },
            {
              label: 'Route',
              detail:
                'The CTA moves serious buyers into a bookable Audit + Sprint without inventing urgency or fake scarcity.',
            },
          ]}
        />
      </LivingSection>

      <LivingSection>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              Why this exists
            </p>
            <h2
              className="mt-4 text-[clamp(2.3rem,_1.2rem_+_4vw,_5rem)] font-extrabold text-[var(--sage-ink)]"
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.03em',
                lineHeight: 0.98,
              }}
            >
              Most SEO problems are invisible until revenue stalls.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--sage-ink-muted)] sm:text-lg">
              This gives founders a fast first read before a larger SEO,
              content, or conversion engagement. No fake score inflation, no
              account wall, no pretend guarantee.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LivingCTA href="/services/audit">See the sprint</LivingCTA>
              <LivingCTA href="/blog" variant="secondary">Read the playbook</LivingCTA>
            </div>
          </div>
          <LivingProofStrip
            items={[
              { label: 'crawl queue', value: 'none' },
              { label: 'credit card', value: 'no' },
              { label: 'private URLs', value: 'blocked' },
              { label: 'claim style', value: 'honest' },
            ]}
          />
        </div>
      </LivingSection>
    </LivingPageShell>
  );
}
