import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/json-ld'
import {
  ConversionMap,
  MotionProofStrip,
  SystemHeroPanel,
} from '@/components/living/LivingPageSystem'
import { getAcademyTrack } from '@/data/academy/tracks'
import { getAcademyProduct } from '@/data/academy/products'
import { buildBreadcrumbList } from '@/lib/seo/jsonld'
import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase/server'

const SITE = 'https://www.sageideas.dev'

const displayStyle = {
  fontFamily: 'var(--font-display)',
  letterSpacing: '-0.03em',
  lineHeight: 0.98,
} as const

type PageProps = {
  params: Promise<{ track: string }>
}

type EnrollmentRow = {
  id: string
  email: string
  status: 'active' | 'refunded' | 'revoked'
  access_starts_at: string
  access_expires_at: string | null
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { track: slug } = await params
  const track = getAcademyTrack(slug)
  if (!track) return { title: 'Academy track not found' }
  return {
    title: `${track.title} Lessons | Sage Academy`,
    description: `Course workspace for ${track.title}.`,
    alternates: { canonical: `${SITE}/academy/${track.slug}/learn` },
    robots: { index: false, follow: false },
  }
}

export default async function AcademyLearnPage({ params }: PageProps) {
  const { track: slug } = await params
  const track = getAcademyTrack(slug)
  if (!track) notFound()

  const product = getAcademyProduct(track)
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const enrollment = user?.email ? await getActiveEnrollment(user.email, track.slug) : null
  const modules = buildModules(track.lessons)

  return (
    <main className="min-h-screen bg-[var(--sage-bg)] text-[var(--sage-ink)]">
      <JsonLd
        data={[
          buildBreadcrumbList([
            { name: 'Home', url: SITE },
            { name: 'Academy', url: `${SITE}/academy` },
            { name: track.title, url: `${SITE}/academy/${track.slug}` },
            { name: 'Lessons', url: `${SITE}/academy/${track.slug}/learn` },
          ]),
        ]}
      />

      <section className="border-b border-[var(--sage-border)] px-5 pb-14 pt-28 sm:px-8 lg:px-12 lg:pb-20 lg:pt-36">
        <div className="mx-auto max-w-7xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-10 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]"
          >
            <Link href="/" className="hover:text-[var(--sage-ink)]">Home</Link>
            <span>/</span>
            <Link href="/academy" className="hover:text-[var(--sage-ink)]">Academy</Link>
            <span>/</span>
            <span>{track.label}</span>
          </nav>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-end">
            <div>
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                Course workspace · {enrollment ? 'access active' : 'locked'}
              </p>
              <h1
                className="max-w-[12ch] text-[clamp(3rem,_1.15rem_+_7.2vw,_7.4rem)] font-extrabold"
                style={displayStyle}
              >
                {track.title}.
              </h1>
              <p className="mt-8 max-w-[62ch] text-lg leading-[1.6] text-[var(--sage-ink-muted)] sm:text-xl">
                {track.outcome}
              </p>
            </div>

            <SystemHeroPanel
              eyebrow="lesson operating system"
              title="Watch · build · apply · ship"
              nodes={['Lesson', 'Template', 'Artifact', 'Launch']}
              stats={[
                { label: 'modules', value: String(modules.length).padStart(2, '0') },
                { label: 'price', value: product.priceLabel },
                { label: 'access', value: enrollment ? 'active' : 'locked' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--sage-border)] px-5 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <MotionProofStrip
            items={[
              { label: 'track', value: track.label },
              { label: 'format', value: `${modules.length} modules` },
              { label: 'templates', value: 'included' },
              { label: 'updates', value: '12 months' },
            ]}
          />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(260px,0.38fr)_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                Access
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                {enrollment ? 'Unlocked.' : user?.email ? 'No enrollment found.' : 'Sign in required.'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--sage-ink-muted)]">
                {enrollment
                  ? `Active for ${enrollment.email}.`
                  : user?.email
                    ? 'This signed-in email does not have access to this track yet.'
                    : 'Use the email from Stripe Checkout to unlock your course shelf.'}
              </p>
              {!enrollment ? (
                <Link
                  href={user?.email ? `/academy/${track.slug}/enroll` : `/login?next=/academy/${track.slug}/learn`}
                  className="mt-5 inline-flex rounded-[3px] bg-[var(--sage-brand)] px-4 py-2 text-sm font-semibold text-[#09090B] transition hover:bg-[#5B70FF]"
                >
                  {user?.email ? 'Enroll in track' : 'Sign in'}
                </Link>
              ) : null}
            </div>

            <div className="rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
                Modules
              </p>
              <div className="mt-4 space-y-2">
                {modules.map((module) => (
                  <a
                    key={module.id}
                    href={`#${module.id}`}
                    className="block rounded-[3px] border border-[var(--sage-border)] px-3 py-3 text-sm text-[var(--sage-ink-muted)] transition hover:border-[var(--sage-brand)] hover:text-[var(--sage-ink)]"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-accent-readable)]">
                      {module.index}
                    </span>
                    <span className="mt-1 block">{module.title}</span>
                  </a>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            {modules.map((module) => (
              <article
                key={module.id}
                id={module.id}
                className="rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-6 lg:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                      Module {module.index}
                    </p>
                    <h3 className="mt-3 text-3xl font-semibold text-[var(--sage-ink)]">
                      {module.title}
                    </h3>
                  </div>
                  <span className="rounded-full border border-[var(--sage-border)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
                    {enrollment ? 'ready' : 'preview'}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {module.blocks.map((block) => (
                    <div key={block.label} className="rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-bg)] p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
                        {block.label}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-[var(--sage-ink-muted)]">
                        {block.detail}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-bg)] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-accent-readable)]">
                    Studio assignment
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[var(--sage-ink-muted)]">
                    {module.assignment}
                  </p>
                </div>
              </article>
            ))}

            <ConversionMap
              steps={[
                { label: 'Watch', detail: 'Study the build decision, constraint, and finished artifact.' },
                { label: 'Apply', detail: 'Use the worksheet/template against your own product or offer.' },
                { label: 'Ship', detail: 'Turn the lesson into a concrete asset: map, page, workflow, or launch checklist.' },
              ]}
            />
          </div>
        </div>
      </section>
    </main>
  )
}

async function getActiveEnrollment(email: string, trackSlug: string): Promise<EnrollmentRow | null> {
  try {
    const { data, error } = await supabaseAdmin()
      .from('academy_enrollments')
      .select('id, email, status, access_starts_at, access_expires_at')
      .eq('email', email)
      .eq('track_slug', trackSlug)
      .eq('status', 'active')
      .maybeSingle()

    if (error) {
      console.error('[academy/learn] enrollment lookup failed', error.message)
      return null
    }

    return (data ?? null) as EnrollmentRow | null
  } catch (error) {
    console.error('[academy/learn] enrollment lookup failed', error)
    return null
  }
}

function buildModules(lessons: string[]) {
  return lessons.map((lesson, index) => ({
    id: `module-${index + 1}`,
    index: String(index + 1).padStart(2, '0'),
    title: lesson,
    blocks: [
      {
        label: 'Concept',
        detail: 'The decision behind the system, why it matters, and what tradeoff it creates.',
      },
      {
        label: 'Artifact',
        detail: 'A practical output you can inspect, adapt, and use in your own build.',
      },
      {
        label: 'Gate',
        detail: 'A simple quality check so the lesson turns into something shippable.',
      },
    ],
    assignment: `Create your version of the "${lesson}" artifact and write down the one constraint that would change your implementation.`,
  }))
}
