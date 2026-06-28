import type { Metadata } from 'next'
import {
  getContinue,
  getCourseProgress,
  getAllCompletedLessonSlugs,
  getCompletedCountByCourse,
} from '@/lib/academy/progress'
import { getCatalogCourses, getCourse, getLessonsByCourse } from '@/lib/academy/content'
import { CatalogClient } from '@/components/academy/catalog/CatalogClient'
import { ContentMap } from '@/components/academy/catalog/ContentMap'
import { buildContentMap } from '@/lib/academy/content-map-logic'
import { TabBar, type Tab } from '@/components/academy/shell/TabBar'
import { AcademyShell } from '@/components/academy/academy-shell'

export const metadata: Metadata = {
  title: 'Learn — Sage Academy',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type View = 'browse' | 'map'

const TABS: readonly Tab[] = [
  { key: 'browse', label: 'Browse', href: '/academy/catalog' },
  { key: 'map', label: 'Map', href: '/academy/catalog?view=map' },
]

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const { view: rawView } = await searchParams
  const view: View = rawView === 'map' ? 'map' : 'browse'

  const [cont, dbCourses, doneByCourse] = await Promise.all([
    getContinue(),
    getCatalogCourses(),
    getCompletedCountByCourse(),
  ])

  // Honest per-card progress: done count (RLS-scoped, 0 when signed out) over the
  // course's published lesson total. Plain serializable record for the client.
  const progress: Record<string, number> = {}
  for (const c of dbCourses) progress[c.slug] = doneByCourse.get(c.slug) ?? 0

  // Resume card shows ONLY for a signed-in learner with real, recorded progress.
  // Signed-out / fresh visitors get no card (no fake illustrative progress bar).
  let resume = null
  if (cont) {
    const [course, prog] = await Promise.all([
      getCourse(cont.courseSlug),
      getCourseProgress(cont.courseSlug),
    ])
    if (course) {
      const total = course.lessonsTotal
      const done = [...prog.completed].filter((slug) =>
        course.modules.some((m) => m.lessons.some((l) => l.slug === slug)),
      ).length
      const pct = total ? Math.round((done / total) * 100) : 0
      const lessonTitle =
        course.modules.flatMap((m) => m.lessons).find((l) => l.slug === cont.lessonSlug)?.title ??
        cont.lessonSlug
      resume = {
        kicker: pct > 0 ? 'Continue learning' : 'Start learning',
        title: lessonTitle,
        sub: course.subtitle ? `${course.title} · ${course.subtitle}` : course.title,
        href: `/academy/learn/${cont.courseSlug}/${cont.lessonSlug}`,
        pct,
      }
    }
  }

  // The map needs every course's ordered lessons + the learner's completed slugs.
  // Fetch only when the Map view is active so Browse stays a single round-trip.
  let map = null
  if (view === 'map') {
    const [lessonsByCourse, completed] = await Promise.all([
      getLessonsByCourse(dbCourses.map((c) => c.slug)),
      getAllCompletedLessonSlugs(),
    ])
    map = buildContentMap(dbCourses, lessonsByCourse, completed)
  }

  return (
    <AcademyShell active="learn">
      <div className="mx-auto max-w-6xl px-5 pt-4 sm:px-8">
        <TabBar tabs={TABS} active={view} ariaLabel="Catalog views" />
      </div>

      {view === 'map' && map ? (
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <ContentMap map={map} />
        </div>
      ) : (
        <CatalogClient
          resume={resume}
          // Curated multi-course paths are hidden until they're real (the hardcoded ones
          // advertised invented course/hour counts and all routed to a single lesson).
          // Real paths get rebuilt from the academy methodology docs.
          paths={[]}
          courses={dbCourses}
          totalCourses={dbCourses.length}
          progress={progress}
        />
      )}
    </AcademyShell>
  )
}
