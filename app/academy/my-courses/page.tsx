import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/json-ld'
import {
  ConversionMap,
  MotionProofStrip,
  SystemHeroPanel,
} from '@/components/living/LivingPageSystem'
import { getAcademyProductBySlug } from '@/data/academy/products'
import { academyTracks } from '@/data/academy/tracks'
import { buildBreadcrumbList } from '@/lib/seo/jsonld'
import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase/server'
import { AcademyShell } from '@/components/academy/academy-shell'

const SITE = 'https://www.sageideas.dev'

const displayStyle = {
  fontFamily: 'var(--font-display)',
  letterSpacing: '-0.03em',
  lineHeight: 0.98,
} as const

type EnrollmentRow = {
  id: string
  track_slug: string
  product_name: string
  status: 'active' | 'refunded' | 'revoked'
  access_starts_at: string
  access_expires_at: string | null
  created_at: string
}

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Courses | Sage Academy',
  description: 'View active Sage Academy enrollments for the signed-in purchase email.',
  alternates: { canonical: `${SITE}/academy/my-courses` },
  robots: { index: false, follow: false },
}

export default async function MyCoursesPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const enrollments = user?.email ? await getEnrollmentsForEmail(user.email) : []

  return (
    <AcademyShell active="courses" signedIn={Boolean(user?.email)}>
    <div className="bg-[var(--sage-bg)] text-[var(--sage-ink)]">
      <JsonLd
        data={[
          buildBreadcrumbList([
            { name: 'Home', url: SITE },
            { name: 'Academy', url: `${SITE}/academy` },
            { name: 'My Courses', url: `${SITE}/academy/my-courses` },
          ]),
        ]}
      />

      <section className="border-b border-[var(--sage-border)] px-5 pb-16 pt-12 sm:px-8 lg:px-12 lg:pb-24 lg:pt-16">
        <div className="mx-auto max-w-7xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-10 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]"
          >
            <Link href="/" className="hover:text-[var(--sage-ink)]">Home</Link>
            <span>/</span>
            <Link href="/academy" className="hover:text-[var(--sage-ink)]">Academy</Link>
            <span>/</span>
            <span>My courses</span>
          </nav>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-end">
            <div>
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                Sage Academy access
              </p>
              <h1
                className="max-w-[11ch] text-[clamp(3rem,_1.15rem_+_7.2vw,_7.2rem)] font-extrabold"
                style={displayStyle}
              >
                My courses.
              </h1>
              <p className="mt-8 max-w-[58ch] text-lg leading-[1.6] text-[var(--sage-ink-muted)] sm:text-xl">
                Course access is tied to the email used at checkout. Sign in with that email to see active academy enrollments.
              </p>
            </div>

            <SystemHeroPanel
              eyebrow="academy access graph"
              title="Checkout ⇄ enrollment ⇄ course access"
              nodes={['Stripe', 'Webhook', 'Enrollment', 'Access']}
              stats={[
                { label: 'tracks', value: String(academyTracks.length).padStart(2, '0') },
                { label: 'status', value: user?.email ? 'signed in' : 'sign in' },
                { label: 'active', value: String(enrollments.length).padStart(2, '0') },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--sage-border)] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <MotionProofStrip
            items={[
              { label: 'identity', value: user?.email ? 'verified email' : 'not signed in' },
              { label: 'active courses', value: String(enrollments.length) },
              { label: 'fulfillment', value: 'webhook' },
              { label: 'access', value: '12 months' },
            ]}
          />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              Access state
            </p>
            <h2 className="text-[clamp(2.4rem,_1.2rem_+_4.7vw,_5.8rem)] font-extrabold" style={displayStyle}>
              {user?.email ? 'Your academy shelf.' : 'Sign in with purchase email.'}
            </h2>
            <p className="mt-6 max-w-[56ch] text-base leading-7 text-[var(--sage-ink-muted)]">
              {user?.email
                ? `Signed in as ${user.email}. If you purchased with a different email, sign out and use that purchase email.`
                : 'No courses can be shown until the purchase email is verified through auth.'}
            </p>
            {!user?.email ? (
              <Link
                href="/login?next=/academy/my-courses"
                className="mt-8 inline-flex rounded-[3px] bg-[var(--sage-brand)] px-5 py-3 text-sm font-semibold text-[#09090B] transition hover:bg-[#5B70FF]"
              >
                Sign in to view access
              </Link>
            ) : null}
          </div>

          {user?.email ? (
            enrollments.length > 0 ? (
              <div className="grid gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)]">
                {enrollments.map((enrollment) => {
                  const product = getAcademyProductBySlug(enrollment.track_slug)
                  return (
                    <article className="bg-[var(--sage-surface-1)] p-6" key={enrollment.id}>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-accent-readable)]">
                        active enrollment
                      </p>
                      <h3 className="mt-4 text-2xl font-semibold text-[var(--sage-ink)]">
                        {product?.name.replace(' — Founding Access', '') ?? enrollment.product_name}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-[var(--sage-ink-muted)]">
                        Access started {formatDate(enrollment.access_starts_at)}
                        {enrollment.access_expires_at ? ` · updates included through ${formatDate(enrollment.access_expires_at)}` : ''}.
                      </p>
                      <Link
                        href={`/academy/${enrollment.track_slug}/learn`}
                        className="mt-5 inline-flex text-sm font-semibold text-[var(--sage-accent-readable)] hover:text-[var(--sage-ink)]"
                      >
                        Open lessons →
                      </Link>
                    </article>
                  )
                })}
              </div>
            ) : (
              <ConversionMap
                steps={[
                  { label: 'No active enrollment found', detail: 'This signed-in email does not have an active academy enrollment yet.' },
                  { label: 'Bought with another email?', detail: 'Sign in with the exact checkout email used for purchase.' },
                  { label: 'Need help?', detail: 'Forward the Stripe receipt to the studio and access can be verified manually.' },
                ]}
              />
            )
          ) : (
            <ConversionMap
              steps={[
                { label: 'Purchase email', detail: 'Academy access is keyed to the email used in Stripe Checkout.' },
                { label: 'Webhook fulfillment', detail: 'Stripe confirms payment, then Sage creates the enrollment record.' },
                { label: 'Course shelf', detail: 'Sign in with the purchase email to view active tracks.' },
              ]}
            />
          )}
        </div>
      </section>
    </div>
    </AcademyShell>
  )
}

async function getEnrollmentsForEmail(email: string): Promise<EnrollmentRow[]> {
  try {
    const { data, error } = await supabaseAdmin()
      .from('academy_enrollments')
      .select('id, track_slug, product_name, status, access_starts_at, access_expires_at, created_at')
      .eq('email', email)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[academy/my-courses] enrollment lookup failed', error.message)
      return []
    }

    return (data ?? []) as EnrollmentRow[]
  } catch (error) {
    console.error('[academy/my-courses] enrollment lookup failed', error)
    return []
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value))
}
