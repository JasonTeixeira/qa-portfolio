import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AcademyCheckoutButton } from '@/components/academy/academy-checkout-button'
import { JsonLd } from '@/components/json-ld'
import { NewsletterSignup } from '@/components/newsletter-signup'
import {
  ConversionMap,
  MotionProofStrip,
  SurfaceSystemPanel,
  SystemHeroPanel,
} from '@/components/living/LivingPageSystem'
import { getAcademyProduct } from '@/data/academy/products'
import { academyTracks, getAcademyTrack } from '@/data/academy/tracks'
import { buildBreadcrumbList } from '@/lib/seo/jsonld'

type PageProps = {
  params: Promise<{ track: string }>
  searchParams?: Promise<{ checkout?: string; session_id?: string }>
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

export default async function AcademyEnrollPage({ params, searchParams }: PageProps) {
  const { track: slug } = await params
  const query = await searchParams
  const track = getAcademyTrack(slug)
  if (!track) notFound()

  const product = getAcademyProduct(track)
  const url = `${SITE}/academy/${track.slug}/enroll`
  const checkoutState = query?.checkout === 'success' || query?.checkout === 'cancelled'
    ? query.checkout
    : null
  const statusLabel = track.status === 'forming' ? 'Forming now' : 'Opening soon'
  const offerSchema =
    product.status === 'checkout_ready' && product.stripePriceId
      ? {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          price: String(product.priceCents / 100),
          priceCurrency: 'USD',
          url,
        }
      : {
          '@type': 'Offer',
          availability: 'https://schema.org/PreOrder',
          priceCurrency: 'USD',
          url,
        }

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
            offers: offerSchema,
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

          {checkoutState ? (
            <div
              className="mb-10 border border-[var(--sage-border)] bg-[rgba(20,20,24,0.84)] p-5"
              role={checkoutState === 'success' ? 'status' : 'alert'}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                {checkoutState === 'success' ? 'checkout returned' : 'checkout cancelled'}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--sage-ink-muted)]">
                {checkoutState === 'success'
                  ? 'Stripe sent you back to Sage Academy. The webhook creates the enrollment record, marks access active for the purchase email, and sends the confirmation email after payment confirmation.'
                  : 'No charge was made. You can restart checkout or stay on early access while the course package is finalized.'}
              </p>
              {checkoutState === 'success' ? (
                <Link
                  href="/academy/my-courses"
                  className="mt-4 inline-flex items-center rounded-[3px] bg-[var(--sage-brand)] px-4 py-2 text-sm font-semibold text-[#09090B] transition hover:bg-[#5B70FF]"
                >
                  Open my courses
                </Link>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-end">
            <div>
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                Academy product page · {statusLabel}
              </p>
              <h1
                className="max-w-[12ch] text-[clamp(3rem,_1.15rem_+_7.2vw,_7.2rem)] font-extrabold"
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
                  { label: 'price', value: product.priceLabel },
                  { label: 'checkout', value: product.checkoutLabel },
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
                { label: 'price', value: product.priceLabel },
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
              { label: 'price', value: product.priceLabel },
              { label: 'status', value: product.checkoutLabel },
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
                detail:
                  product.status === 'checkout_ready'
                    ? 'Stripe checkout is active for this course product.'
                    : `Stripe checkout unlocks when ${product.stripeEnvVar} is set to the approved Stripe price ID.`,
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
            <h2 className="text-[clamp(2.4rem,_1.2rem_+_4.7vw,_5.8rem)] font-extrabold" style={displayStyle}>
              Built to become checkout.
            </h2>
          </div>
          <ConversionMap
            steps={[
              { label: 'Course page', detail: 'Explain the outcome, audience, and lesson map without inflated guru claims.' },
              { label: 'Early access', detail: 'Capture serious buyers while the curriculum and offer are finalized.' },
              { label: 'Product packaging', detail: `${product.name}: ${product.priceLabel}. Policies and access terms are now defined in code.` },
              { label: 'Stripe checkout', detail: product.status === 'checkout_ready' ? 'Checkout is active.' : `Pending ${product.stripeEnvVar}.` },
            ]}
          />
        </div>
      </section>

      <section id="early-access" className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(320px,0.7fr)] lg:items-center">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              Early access
            </p>
            <h2 className="text-[clamp(2.5rem,_1.2rem_+_5vw,_6rem)] font-extrabold" style={displayStyle}>
              Join before paid enrollment opens.
            </h2>
            <p className="mt-6 max-w-[56ch] text-lg leading-[1.55] text-[var(--sage-ink-muted)]">
              {product.status === 'checkout_ready'
                ? 'Paid enrollment is ready for this track. Stripe handles the payment flow, receipt, and checkout security.'
                : 'Get course drops, packaging updates, and first access when the paid track is ready. No fake scarcity, no surprise checkout.'}
            </p>
            <div className="mt-8 grid gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] sm:grid-cols-2">
              {product.packageIncludes.map((item) => (
                <div className="bg-[var(--sage-surface-1)] p-4" key={item}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-accent-readable)]">
                    included
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[var(--sage-ink-muted)]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)]">
              {[
                { label: 'refund policy', value: product.refundPolicy },
                { label: 'access policy', value: product.accessPolicy },
                ...(product.requirements.length > 0
                  ? product.requirements.map((value) => ({ label: 'required before checkout', value }))
                  : []),
              ].map((item) => (
                <div className="bg-[var(--sage-surface-1)] p-4" key={`${item.label}:${item.value}`}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
                    {item.label}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[var(--sage-ink-muted)]">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <AcademyCheckoutButton product={product} />
            </div>
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
