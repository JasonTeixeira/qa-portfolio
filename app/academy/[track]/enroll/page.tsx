import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/json-ld'
import { NewsletterSignup } from '@/components/newsletter-signup'
import {
  ConversionMap,
  MotionProofStrip,
  SurfaceSystemPanel,
  SystemHeroPanel,
} from '@/components/living/LivingPageSystem'
import { academyTracks, getAcademyTrack } from '@/data/academy/tracks'
import { buildBreadcrumbList } from '@/lib/seo/jsonld'

type PageProps = {
  params: Promise<{ track: string }>
}

const SITE = 'https://www.sageideas.dev'

const displayStyle = {
  fontFamily: 'var(--font-display)',
  letterSpacing: '-0.03em',
  lineHeight: 0.98,
} as const

export function generateStaticParams() {
  return academyTracks.map((track) => ({ track: track.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { track: slug } = await params
  const track = getAcademyTrack(slug)
  if (!track) return { title: 'Academy enrollment not found' }

  return {
    title: `Enroll in ${track.title} | Sage Academy`,
    description: `Join early access for ${track.title}. ${track.outcome}`,
    alternates: { canonical: `${SITE}/academy/${track.slug}/enroll` },
    openGraph: {
      title: `Enroll in ${track.title} | Sage Academy`,
      description: track.outcome,
      url: `${SITE}/academy/${track.slug}/enroll`,
      type: 'website',
      images: [
        `/og?title=${encodeURIComponent(`Enroll in ${track.title}`)}&subtitle=${encodeURIComponent(track.outcome)}`,
      ],
    },
  }
}

export default async function AcademyEnrollPage({ params }: PageProps) {
  const { track: slug } = await params
  const track = getAcademyTrack(slug)
  if (!track) notFound()

  const url = `${SITE}/academy/${track.slug}/enroll`
  const statusLabel = track.status === 'forming' ? 'Forming now' : 'Opening soon'

  return (
    <main className="min-h-screen bg-[var(--sage-bg)] text-[var(--sage-ink)]">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: track.title,
            description: track.description,
            url,
            provider: {
              '@type': 'Organization',
              name: 'Sage Ideas',
              sameAs: SITE,
            },
            teaches: track.lessons,
            offers: {
              '@type': 'Offer',
              availability: 'https://schema.org/PreOrder',
              priceCurrency: 'USD',
              url,
            },
          },
          buildBreadcrumbList([
            { name: 'Home', url: SITE },
            { name: 'Academy', url: `${SITE}/academy` },
            { name: track.title, url: `${SITE}/academy/${track.slug}` },
            { name: 'Enroll', url },
          ]),
        ]}
      />

      <section className="border-b border-[var(--sage-border)] px-5 pb-16 pt-28 sm:px-8 lg:px-12 lg:pb-24 lg:pt-36">
        <div className="mx-auto max-w-7xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-10 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]"
          >
            <Link href="/" className="hover:text-[var(--sage-ink)]">Home</Link>
            <span>/</span>
            <Link href="/academy" className="hover:text-[var(--sage-ink)]">Academy</Link>
            <span>/</span>
            <Link href={`/academy/${track.slug}`} className="hover:text-[var(--sage-ink)]">
              {track.label}
            </Link>
            <span>/</span>
            <span>Enroll</span>
          </nav>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-end">
            <div>
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                Academy product page · {statusLabel}
              </p>
              <h1
                className="max-w-[12ch] text-[clamp(3rem,1.15rem+7.2vw,7.2rem)] font-extrabold"
                style={displayStyle}
              >
                {track.title}
              </h1>
              <p className="mt-8 max-w-[58ch] text-lg leading-[1.6] text-[var(--sage-ink-muted)] sm:text-xl">
                {track.outcome}
              </p>
              <div className="mt-9 grid gap-px bg-[var(--sage-border)] sm:max-w-2xl sm:grid-cols-3">
                {[
                  { label: 'status', value: statusLabel },
                  { label: 'price', value: 'TBD' },
                  { label: 'checkout', value: 'early access' },
                ].map((item) => (
                  <div className="bg-[var(--sage-surface-1)] p-4" key={item.label}>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
                      {item.label}
                    </p>
                    <p className="mt-3 text-lg font-semibold text-[var(--sage-ink)]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <SystemHeroPanel
              eyebrow="course checkout graph"
              title={`${track.title} enrollment system`}
              nodes={['Landing', 'Modules', 'Waitlist', 'Checkout']}
              stats={[
                { label: 'modules', value: String(track.lessons.length).padStart(2, '0') },
                { label: 'mode', value: 'online' },
                { label: 'proof', value: 'builds' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--sage-border)] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <MotionProofStrip
            items={[
              { label: 'audience', value: 'builders' },
              { label: 'modules', value: String(track.lessons.length) },
              { label: 'format', value: 'online' },
              { label: 'source', value: 'studio' },
            ]}
          />
        </div>
      </section>

      <section className="border-b border-[var(--sage-border)] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SurfaceSystemPanel
            title="Learn ⇄ Build"
            body="This is the checkout-ready product surface. Until the course packaging and Stripe products are finalized, it collects early access instead of taking money."
            steps={[
              { label: 'Who it is for', detail: track.audience },
              { label: 'What it teaches', detail: track.lessons.join(', ') },
              { label: 'How it ships', detail: track.format },
              {
                label: 'Checkout readiness',
                detail: 'Stripe checkout can replace this early-access form once the real price, cohort promise, refund policy, and product IDs are approved.',
              },
            ]}
          />
        </div>
      </section>

      <section className="border-b border-[var(--sage-border)] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.74fr)_minmax(0,1fr)]">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              Enrollment path
            </p>
            <h2 className="text-[clamp(2.4rem,1.2rem+4.7vw,5.8rem)] font-extrabold" style={displayStyle}>
              Built to become checkout.
            </h2>
          </div>
          <ConversionMap
            steps={[
              { label: 'Course page', detail: 'Explain the outcome, audience, and lesson map without inflated guru claims.' },
              { label: 'Early access', detail: 'Capture serious buyers while the curriculum and offer are finalized.' },
              { label: 'Product packaging', detail: 'Lock price, modules, cohort promise, assets, guarantee, and policies.' },
              { label: 'Stripe checkout', detail: 'Swap the form for a real course checkout only after Stripe products exist.' },
            ]}
          />
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(320px,0.7fr)] lg:items-center">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              Early access
            </p>
            <h2 className="text-[clamp(2.5rem,1.2rem+5vw,6rem)] font-extrabold" style={displayStyle}>
              Join before paid enrollment opens.
            </h2>
            <p className="mt-6 max-w-[56ch] text-lg leading-[1.55] text-[var(--sage-ink-muted)]">
              Get course drops, packaging updates, and first access when the paid track is ready.
              No fake scarcity, no surprise checkout.
            </p>
          </div>
          <NewsletterSignup
            source={`academy-enroll:${track.slug}`}
            headline={track.cta}
            blurb="Early access for the course product. Pricing opens only after the offer is finalized."
          />
        </div>
      </section>
    </main>
  )
}
