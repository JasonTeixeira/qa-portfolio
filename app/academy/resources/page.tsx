import type { Metadata } from 'next'
import { ResourcesHub } from '@/components/academy/resources/ResourcesHub'
import { AcademyShell } from '@/components/academy/academy-shell'

export const metadata: Metadata = {
  title: 'Tools & Resources — Sage Academy',
  robots: { index: false, follow: false },
}

export default function ResourcesPage() {
  return (
    <AcademyShell active="resources">
      <ResourcesHub />
    </AcademyShell>
  )
}
