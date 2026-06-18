import type { Metadata } from 'next'
import Link from 'next/link'
import { Cookie, FileCheck, FileSignature, Handshake, ScrollText, Shield } from 'lucide-react'
import {
  LivingHero,
  LivingPageShell,
  LivingSection,
  MotionProofStrip,
  SystemHeroPanel,
} from '@/components/living/LivingPageSystem'
import { RouteConversionCta } from '@/components/living/RouteConversionCta'
import { SystemFlowOverlay } from '@/components/living/SystemFlowLayer'

export const metadata: Metadata = {
  title: 'Legal',
  description:
    'Privacy policy, terms of service, cookie policy, master services agreement, NDA template, and statement of work template for Sage Ideas LLC.',
  openGraph: {
    images: ['/og?title=Legal+Documents&subtitle=Sage+Ideas+LLC'],
  },
}

const docs = [
  {
    slug: 'privacy',
    icon: Shield,
    group: 'site',
    title: 'Privacy Policy',
    description:
      'How Sage Ideas LLC collects, uses, and protects personal information, including GDPR and CCPA disclosures.',
  },
  {
    slug: 'terms',
    icon: ScrollText,
    group: 'site',
    title: 'Terms of Service',
    description:
      'The terms governing access to sageideas.dev, studio services, academy content, and related properties.',
  },
  {
    slug: 'cookies',
    icon: Cookie,
    group: 'site',
    title: 'Cookie Policy',
    description:
      'What cookies and tracking technologies the site uses, why they exist, and how to control them.',
  },
  {
    slug: 'msa',
    icon: Handshake,
    group: 'client',
    title: 'Master Services Agreement',
    description:
      'The standard contract structure for client engagements: scope, payment terms, IP ownership, and liability.',
  },
  {
    slug: 'nda',
    icon: FileSignature,
    group: 'client',
    title: 'Non-Disclosure Agreement',
    description:
      'Mutual NDA template used for discovery calls and sensitive project discussions. Available for signature on request.',
  },
  {
    slug: 'sow-template',
    icon: FileCheck,
    group: 'client',
    title: 'Statement of Work Template',
    description:
      'The SOW structure used for productized engagements: scope, deliverables, timeline, and acceptance criteria.',
  },
]

export default function LegalIndexPage() {
  return (
    <LivingPageShell>
      <LivingHero
        eyebrow="Sage Ideas · legal system"
        title="Plain language for serious work."
        lede="The documents behind the studio: privacy, terms, cookies, client agreement, NDA, and statement-of-work structure. Built to reduce ambiguity before money, data, or IP changes hands."
        primaryCta={{ label: 'Read client documents', href: '#client-docs' }}
        secondaryCta={{ label: 'Ask a question', href: '/contact?source=legal' }}
        panel={
          <SystemHeroPanel
            eyebrow="legal graph"
            title="Document system map"
            nodes={['Policy', 'Contract', 'Scope', 'Signature']}
            stats={[
              { label: 'site docs', value: '03' },
              { label: 'client docs', value: '03' },
              { label: 'style', value: 'plain' },
            ]}
            variant="systems"
          />
        }
        proof={[
          { label: 'privacy', value: 'clear' },
          { label: 'contracts', value: 'written' },
          { label: 'scope', value: 'defined' },
          { label: 'handoff', value: 'plain English' },
        ]}
      />

      <LivingSection
        eyebrow="Document routes"
        title="Site policy and client paperwork, separated."
        lede="Legal pages should not feel like a junk drawer. Site visitors need privacy and terms. Buyers need the agreement, NDA, and SOW shape before they start."
      >
        <div className="grid gap-px bg-[var(--sage-border)] lg:grid-cols-2">
          {[
            {
              id: 'site-docs',
              label: 'site documents',
              body: 'Privacy, terms, and cookie controls for people using the website, reading content, or joining the academy list.',
              items: docs.filter((doc) => doc.group === 'site'),
            },
            {
              id: 'client-docs',
              label: 'client documents',
              body: 'The contract shape for paid work: agreement, confidentiality, and the statement of work that defines the build.',
              items: docs.filter((doc) => doc.group === 'client'),
            },
          ].map((group) => (
            <section className="bg-[var(--sage-surface-1)] p-5 sm:p-6 lg:p-8" id={group.id} key={group.id}>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                {group.label}
              </p>
              <p className="mt-4 max-w-[52ch] text-sm leading-6 text-[var(--sage-ink-muted)]">
                {group.body}
              </p>
              <div className="mt-8 grid gap-px bg-[var(--sage-border)]">
                {group.items.map((doc, index) => {
                  const Icon = doc.icon
                  return (
                    <Link
                      className="group relative overflow-hidden bg-[rgba(11,11,14,0.72)] p-5 transition-colors hover:bg-[var(--sage-surface-2)]"
                      href={`/legal/${doc.slug}`}
                      key={doc.slug}
                    >
                      <SystemFlowOverlay
                        variant={index % 2 === 0 ? 'systems' : 'studio'}
                        intensity="quiet"
                      />
                      <div className="relative z-10 grid gap-5 sm:grid-cols-[auto_1fr_auto] sm:items-start">
                        <span className="flex h-11 w-11 items-center justify-center rounded-[6px] border border-[var(--sage-border)] bg-[rgba(61,90,254,0.09)] text-[var(--sage-accent-readable)]">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="block text-xl font-semibold text-[var(--sage-ink)]">
                            {doc.title}
                          </span>
                          <span className="mt-2 block text-sm leading-6 text-[var(--sage-ink-muted)]">
                            {doc.description}
                          </span>
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-accent-readable)] transition group-hover:text-white">
                          Read -&gt;
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </LivingSection>

      <LivingSection
        eyebrow="Operating rule"
        title="The contract should match the way the studio works."
        lede="Scope is written before the build. IP ownership is explicit. Confidentiality is available before sensitive discovery. The legal layer supports the operating system; it is not a sales trap."
      >
        <div className="grid gap-px bg-[var(--sage-border)] md:grid-cols-4">
          {[
            { label: 'scope', value: 'written before start' },
            { label: 'privacy', value: 'documented controls' },
            { label: 'IP', value: 'defined in agreement' },
            { label: 'questions', value: 'plain reply' },
          ].map((item, index) => (
            <div className="relative min-h-[180px] overflow-hidden bg-[var(--sage-surface-1)] p-5" key={item.label}>
              <SystemFlowOverlay variant={index % 2 === 0 ? 'systems' : 'growth'} intensity="quiet" />
              <div className="relative z-10">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                  {String(index + 1).padStart(2, '0')} · {item.label}
                </p>
                <p className="mt-10 text-2xl font-semibold text-[var(--sage-ink)]">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </LivingSection>

      <section className="border-t border-[var(--sage-border)] px-5 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <MotionProofStrip
            items={[
              { label: 'documents', value: String(docs.length).padStart(2, '0') },
              { label: 'reply path', value: 'direct' },
              { label: 'sales posture', value: 'no tricks' },
              { label: 'email', value: 'sage@sageideas.dev' },
            ]}
          />
        </div>
      </section>

      <RouteConversionCta
        eyebrow="legal to route"
        title="Need the business context?"
        body="If a document raises a project question, route the work instead of guessing. Use the diagnostic for fit, or ask directly when the question is legal or contractual."
        primary={{ label: 'Run the diagnostic', href: '/tools/route-finder?source=legal' }}
        secondary={{ label: 'Ask directly', href: '/contact?source=legal' }}
        variant="systems"
        proof={[
          { label: 'fit check', value: 'route finder' },
          { label: 'contract question', value: 'direct' },
          { label: 'posture', value: 'plain' },
        ]}
      />
    </LivingPageShell>
  )
}
