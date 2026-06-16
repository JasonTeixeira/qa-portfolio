import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/json-ld'
import { NewsletterSignup } from '@/components/newsletter-signup'
import { MotionProofStrip, SurfaceSystemPanel, SystemHeroPanel } from '@/components/living/LivingPageSystem'
import { academyTracks, getAcademyTrack } from '@/data/academy/tracks'
import { getAllBlogPosts } from '@/lib/blog-server'
import { buildBreadcrumbList } from '@/lib/seo/jsonld'

interface PageProps {
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
  if (!track) return { title: 'Academy track not found' }

  return {
    title: `${track.title} | Sage Academy`,
    description: track.description,
    alternates: { canonical: `${SITE}/academy/${track.slug}` },
    openGraph: {
      title: `${track.title} | Sage Academy`,
      description: track.description,
      url: `${SITE}/academy/${track.slug}`,
      type: 'website',
      images: [
        `/og?title=${encodeURIComponent(track.title)}&subtitle=${encodeURIComponent(track.outcome)}`,
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: [
        `/og?title=${encodeURIComponent(track.title)}&subtitle=${encodeURIComponent(track.outcome)}`,
      ],
    },
  }
}

function relatedPostsForTrack(slug: string) {
  const clusterByTrack: Record<string, string[]> = {
    'ai-native-product-building': ['ai-engineering', 'product-systems'],
    'premium-conversion-sites': ['product-systems', 'solo-studio'],
    'content-engine': ['solo-studio', 'product-systems'],
    'ai-automation-systems': ['ai-engineering', 'cloud-infra'],
  }

  const clusters = clusterByTrack[slug] ?? []
  return getAllBlogPosts()
    .filter((post) => clusters.includes(post.cluster))
    .slice(0, 4)
}

export default async function AcademyTrackPage({ params }: PageProps) {
  const { track: slug } = await params
  const track = getAcademyTrack(slug)
  if (!track) notFound()

  const trackUrl = `${SITE}/academy/${track.slug}`
  const relatedPosts = relatedPostsForTrack(track.slug)
  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: track.title,
    description: track.description,
    url: trackUrl,
    provider: {
      '@type': 'Organization',
      name: 'Sage Ideas',
      sameAs: SITE,
    },
    educationalLevel: 'Practical professional',
    teaches: track.lessons,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: track.format,
    },
  }

  return (
    <main className="min-h-screen bg-[var(--sage-bg)] text-[var(--sage-ink)]">
      <JsonLd
        data={[
          courseSchema,
          buildBreadcrumbList([
            { name: 'Home', url: SITE },
            { name: 'Academy', url: `${SITE}/academy` },
            { name: track.title, url: trackUrl },
          ]),
        ]}
      />

      <section className="border-b border-[var(--sage-border)] px-5 pb-16 pt-28 sm:px-8 lg:px-12 lg:pb-24 lg:pt-36">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
            <Link href="/" className="hover:text-[var(--sage-ink)]">Home</Link>
            <span>/</span>
            <Link href="/academy" className="hover:text-[var(--sage-ink)]">Academy</Link>
            <span>/</span>
            <span>{track.label}</span>
          </nav>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.72fr)] lg:items-end">
            <div>
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                {track.label} · {track.status === 'forming' ? 'Forming now' : 'Opening soon'}
              </p>
              <h1
                className="max-w-[12ch] text-[clamp(3.2rem,1.2rem+8vw,7.6rem)] font-extrabold"
                style={displayStyle}
              >
                {track.title}
              </h1>
              <p className="mt-8 max-w-[58ch] text-lg leading-[1.6] text-[var(--sage-ink-muted)] sm:text-xl">
                {track.description}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#join"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--sage-accent)] px-6 text-sm font-semibold text-white transition hover:bg-[#5670ff]"
                >
                  {track.cta} -&gt;
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--sage-border)] px-6 text-sm font-semibold text-[var(--sage-ink)] transition hover:border-[var(--sage-accent)]"
                >
                  Read build notes
                </Link>
              </div>
            </div>

            <SystemHeroPanel
              eyebrow="track graph"
              title={`${track.title} curriculum map`}
              nodes={track.lessons}
              stats={[
                { label: 'modules', value: String(track.lessons.length).padStart(2, '0') },
                { label: 'mode', value: 'online' },
                { label: 'source', value: 'studio' },
              ]}
            />
          </div>
          <div className="mt-12">
            <MotionProofStrip
              items={[
                { label: 'track promise', value: 'clear' },
                { label: 'format', value: track.lessons.length + ' modules' },
                { label: 'status', value: track.status === 'forming' ? 'forming' : 'soon' },
                { label: 'sales style', value: 'honest' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--sage-border)] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SurfaceSystemPanel
            title="Course ⇄ Practice"
            body={track.outcome}
            cta={{ label: track.cta, href: '#join' }}
            steps={[
              { label: 'Who it is for', detail: track.audience },
              { label: 'How it ships', detail: track.format },
              { label: 'What you get', detail: track.outcome },
              { label: 'Where it leads', detail: 'Apply it yourself, or route into the studio when you want the system built with you.' },
            ]}
          />
        </div>
      </section>

      <section className="border-b border-[var(--sage-border)] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.1fr)]">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              Modules
            </p>
            <h2 className="text-[clamp(2.3rem,1.2rem+4vw,5rem)] font-extrabold" style={displayStyle}>
              Built from the studio record.
            </h2>
          </div>
          <ol className="grid gap-px bg-[var(--sage-border)]">
            {track.lessons.map((lesson, index) => (
              <li className="grid gap-4 bg-[var(--sage-surface-1)] p-5 sm:grid-cols-[auto_1fr]" key={lesson}>
                <span className="font-mono text-xs text-[var(--sage-accent-readable)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-lg font-semibold text-[var(--sage-ink)]">{lesson}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-[var(--sage-border)] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              Related build notes
            </p>
            <Link href="/blog" className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-ink-subtle)] hover:text-[var(--sage-ink)]">
              All posts -&gt;
            </Link>
          </div>
          <div className="grid gap-px bg-[var(--sage-border)] md:grid-cols-2">
            {relatedPosts.map((post) => (
              <Link className="group bg-[var(--sage-surface-1)] p-6 transition-colors hover:bg-[var(--sage-surface-2)]" href={`/blog/${post.slug}`} key={post.slug}>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-ink-subtle)]">
                  {post.date}
                </p>
                <h3 className="mt-4 text-xl font-semibold text-[var(--sage-ink)] group-hover:text-[var(--sage-accent-readable)]">
                  {post.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--sage-ink-muted)]">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="join" className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(320px,0.7fr)] lg:items-center">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              Early access
            </p>
            <h2 className="text-[clamp(2.5rem,1.2rem+5vw,6rem)] font-extrabold" style={displayStyle}>
              Join before the paid track opens.
            </h2>
            <p className="mt-6 max-w-[56ch] text-lg leading-[1.55] text-[var(--sage-ink-muted)]">
              Get the lesson drops, course notes, and first-cohort announcement. This is the
              education funnel without fake countdowns or inflated promises.
            </p>
          </div>
          <NewsletterSignup
            source={`academy:${track.slug}`}
            headline={track.cta}
            blurb="Course drops, build notes, and practical systems. No fake scarcity."
          />
        </div>
      </section>
    </main>
  )
}
