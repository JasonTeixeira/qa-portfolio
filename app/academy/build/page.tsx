import type { Metadata } from 'next'
import { courses } from '@/data/academy/learn-catalog'
import { PathBuilder } from '@/components/academy/build/PathBuilder'
import { AcademyShell } from '@/components/academy/academy-shell'

export const metadata: Metadata = {
  title: 'Build your own path — Sage Academy',
  robots: { index: false, follow: false },
}

export default function BuildPathPage() {
  return (
    <AcademyShell>
      <PathBuilder courses={courses} />
    </AcademyShell>
  )
}
