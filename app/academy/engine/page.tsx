import type { Metadata } from 'next'
import { LessonPlayer } from '@/components/academy/lesson/LessonPlayer'
import { flagshipCourse, flagshipLesson } from '@/data/academy/flagship-sprint'

export const metadata: Metadata = {
  title: 'The Learning Engine — Sage Academy',
  description: 'A complete sprint built on the Sage Learning Engine V2 — the learning operating system behind every Sage Academy course.',
  robots: { index: false, follow: false },
}

// Flagship sprint — rendered from a static fixture so it never touches the
// course catalog. Demonstrates the full 17-step loop.
export default function EnginePage() {
  return (
    <LessonPlayer
      course={flagshipCourse}
      lesson={flagshipLesson}
      signedIn={false}
      labHref="/academy/engine/lab"
    />
  )
}
