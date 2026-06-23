import type { Metadata } from 'next'
import { getContinue, getCourseProgress } from '@/lib/academy/progress'
import { getCatalogCourses, getCourse } from '@/lib/academy/content'
import { CatalogClient } from '@/components/academy/catalog/CatalogClient'

export const metadata: Metadata = {
  title: 'Learn — Sage Academy',
  robots: { index: false, follow: false },
}

export default async function CatalogPage() {
  const [cont, dbCourses] = await Promise.all([getContinue(), getCatalogCourses()])

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

  return (
    <CatalogClient
      resume={resume}
      // Curated multi-course paths are hidden until they're real (the hardcoded ones
      // advertised invented course/hour counts and all routed to a single lesson).
      // Real paths get rebuilt from the academy methodology docs.
      paths={[]}
      courses={dbCourses}
      totalCourses={dbCourses.length}
    />
  )
}
