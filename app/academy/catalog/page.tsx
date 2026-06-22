import type { Metadata } from 'next'
import { getContinue } from '@/lib/academy/progress'
import { getCatalogCourses } from '@/lib/academy/content'
import { paths, courses as fixtureCourses, TOTAL_COURSES } from '@/data/academy/learn-catalog'
import { sampleCourse, sampleLesson } from '@/data/academy/sample-course'
import { CatalogClient } from '@/components/academy/catalog/CatalogClient'

export const metadata: Metadata = {
  title: 'Learn — Sage Academy',
  robots: { index: false, follow: false },
}

function lessonTitle(slug: string): string {
  for (const m of sampleCourse.modules) {
    for (const l of m.lessons) if (l.slug === slug) return l.title
  }
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default async function CatalogPage() {
  const [cont, dbCourses] = await Promise.all([getContinue(), getCatalogCourses()])
  const courses = dbCourses.length ? dbCourses : fixtureCourses
  const pct = sampleCourse.lessonsTotal
    ? Math.round((sampleCourse.lessonsDone / sampleCourse.lessonsTotal) * 100)
    : 0

  const resume = cont
    ? {
        kicker: 'Continue learning',
        title: lessonTitle(cont.lessonSlug),
        sub: `${sampleCourse.title} · ${sampleCourse.subtitle}`,
        href: `/academy/learn/${cont.courseSlug}/${cont.lessonSlug}`,
        pct,
      }
    : {
        kicker: 'Start learning',
        title: 'Your first line',
        sub: `${sampleCourse.title} · begin with your first lesson`,
        href: '/academy/learn/python-basics/your-first-line',
        pct: 32,
      }

  return (
    <CatalogClient
      resume={resume}
      paths={paths}
      courses={courses}
      totalCourses={dbCourses.length || TOTAL_COURSES}
    />
  )
}
